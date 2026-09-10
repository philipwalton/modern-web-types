// Generates the smoke tests from the delta itself, so they always exercise
// whatever is currently in the single-engine gap instead of a hand-picked set
// of API names that decays as those APIs graduate to two engines (at which
// point they leave the delta) or predate the BCD snapshot (absent entirely).
//
// For each augment scope it writes two files under test/generated/:
//   - <scope>.augment.ts  — references build/<scope>.baseline + pkg/<index>,
//     the augment-mode consumption (delta merged onto the built-in lib);
//   - <scope>.replace.ts  — references pkg/lib.<lib>.d.ts, the replace-mode
//     consumption (the complete one-engine lib). The full lib is baseline +
//     delta, so every delta name resolves there too.
// Both assert every delta symbol resolves; the assertions are identical, only
// the referenced files differ. Each assertion is type-only, so there is nothing
// to run and no unused-value concern:
//   - new interface I / alias A        →  type _ = I;           (reachable as a type)
//   - new global var V / function F     →  type _ = typeof V;    (reachable as a value)
//   - member M merged onto interface P  →  type _ = P["M"];      (merge landed on P)
//   - namespace member P.M added        →  type _ = typeof P.M;
// A generic interface (e.g. XRHandIterator) can't be named without type args,
// so its type-reachability assertion is skipped — all-specs.ts already checks
// the whole package compiles, so nothing goes unchecked.
//
// The performance entry type lookups are asserted the same way, one assertion
// per registered entry type the scope can resolve: that the keyed overload
// wins over the `type: string` one and yields exactly that entry's interface,
// and that an entry type the registry marks observer-only stays off
// `Performance`.
import fs from "node:fs";
import path from "node:path";
import { buildDir, rootDir, augmentScopes, replaceLib, type Scope } from "./util.ts";
import {
  TIMELINE_MAP,
  declaredInterfaces,
  resolvableIn,
} from "./entry-types.ts";

const genDir = path.join(rootDir, "test", "generated");

// A valid TS identifier fragment for use in the assertion alias name.
const ident = (s: string) => s.replace(/[^A-Za-z0-9_$]/g, "_");

// Interfaces declared with type parameters can't be referenced bare.
const isGeneric = (text: string) => /^(?:export\s+)?interface\s+\w+\s*</.test(text);

// The member identifier a namespace-augment statement declares, e.g.
// "var paintWorklet: Worklet;" -> "paintWorklet".
function namespaceMember(statement: string): string | undefined {
  return statement.match(/\b(?:var|function|const|let)\s+([A-Za-z_$][\w$]*)/)?.[1];
}

function assertions(scope: Scope): string[] {
  const delta = JSON.parse(
    fs.readFileSync(path.join(buildDir, scope.augment!.delta), "utf8"),
  );
  const lines: string[] = [];

  // One assertion per distinct alias name. Overloaded methods appear as several
  // augment entries for the same parent.member; they assert the same thing.
  const seen = new Set<string>();
  const emit = (name: string, rhs: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    lines.push(`type ${name} = ${rhs};`);
  };

  for (const item of delta.items) {
    const a = ident(item.name);
    if (item.kind === "interface") {
      if (!isGeneric(item.text)) emit(`_mwt_i_${a}`, item.name);
    } else if (item.kind === "alias") {
      emit(`_mwt_a_${a}`, item.name);
    } else if (item.kind === "var") {
      emit(`_mwt_v_${a}`, `typeof ${item.name}`);
    } else if (item.kind === "function") {
      emit(`_mwt_f_${a}`, `typeof ${item.name}`);
    }
  }
  for (const aug of delta.augments) {
    // Event-map members are stored already-quoted ("freeze"); plain members
    // are bare (controller). Normalize to the raw name, then re-quote as an
    // index key so both become P["name"].
    const member = aug.memberName.replace(/^"(.*)"$/, "$1");
    emit(
      `_mwt_m_${ident(aug.parent)}__${ident(member)}`,
      `${aug.parent}[${JSON.stringify(member)}]`,
    );
  }
  for (const ns of delta.namespaceAugments) {
    for (const stmt of ns.statements) {
      const member = namespaceMember(stmt);
      if (member) {
        emit(`_mwt_n_${ident(ns.parent)}__${ident(member)}`, `typeof ${ns.parent}.${member}`);
      }
    }
  }
  return lines;
}

// `_mwt_true` rejects anything but `true`, which turns each comparison below
// into a compile error at the alias rather than a type that quietly widens.
const ASSERT_PRELUDE = [
  "type _mwt_true<T extends true> = T;",
  "type _mwt_same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;",
  "declare const _mwt_performance: Performance;",
  "declare const _mwt_observed: PerformanceObserverEntryList;",
];

// One assertion per entry type: the lookup returns that entry's interface, on
// `Performance` when the registry lists it as available from the timeline and
// on `PerformanceObserverEntryList` either way.
function entryTypeAssertions(scope: Scope): string[] {
  const declared = declaredInterfaces(
    fs.readFileSync(path.join(buildDir, scope.full), "utf8"),
  );
  const rows = resolvableIn(declared);
  if (!rows.length) return [];

  const lines = [...ASSERT_PRELUDE];
  for (const entry of rows) {
    const expected =
      entry.interfaces.length > 1
        ? `(${entry.interfaces.join(" | ")})[]`
        : `${entry.interfaces[0]}[]`;
    const name = ident(entry.type);
    const lookup = (receiver: string, method: string) =>
      `ReturnType<typeof ${receiver}.${method}<${JSON.stringify(entry.type)}>>`;
    if (entry.availableFromTimeline) {
      lines.push(
        `type _mwt_et_${name} = _mwt_true<_mwt_same<${lookup("_mwt_performance", "getEntriesByType")}, ${expected}>>;`,
        `type _mwt_en_${name} = _mwt_true<_mwt_same<${lookup("_mwt_performance", "getEntriesByName")}, ${expected}>>;`,
      );
    } else {
      // Observer-only: reachable from an observer, absent from the timeline map.
      lines.push(
        `type _mwt_eo_${name} = _mwt_true<${JSON.stringify(entry.type)} extends keyof ${TIMELINE_MAP} ? false : true>;`,
      );
    }
    lines.push(
      `type _mwt_eb_${name} = _mwt_true<_mwt_same<${lookup("_mwt_observed", "getEntriesByType")}, ${expected}>>;`,
    );
  }
  return lines;
}

function write(file: string, refs: string[], body: string[], desc: string) {
  const header =
    `// Generated by modern-web-types (scripts/emit-test.ts) — do not edit.\n` +
    `// ${desc}\n` +
    refs.map((r) => `/// <reference path="${r}" />`).join("\n") +
    `\n\nexport {};\n\n`;
  fs.writeFileSync(path.join(genDir, file), header + body.join("\n") + "\n");
}

fs.rmSync(genDir, { recursive: true, force: true });
fs.mkdirSync(genDir, { recursive: true });

for (const scope of augmentScopes) {
  const body = [...assertions(scope), ...entryTypeAssertions(scope)];
  const augment = scope.augment!;

  write(
    `${scope.name}.augment.ts`,
    [`../../build/${augment.baseline}`, `../../pkg/${augment.index}`],
    body,
    `Augment mode: asserts every ${scope.name} delta symbol resolves when the ` +
      `per-spec files merge onto the stock ${scope.lib} lib.`,
  );
  write(
    `${scope.name}.replace.ts`,
    [`../../pkg/${replaceLib(scope)}`],
    body,
    `Replace mode: asserts every ${scope.name} delta symbol resolves in the ` +
      `complete one-engine ${scope.lib} lib.`,
  );

  console.log(`[${scope.name}] wrote ${scope.name}.{augment,replace}.ts (${body.length} assertions)`);
}
