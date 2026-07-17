// For each scope, structurally diffs its full build against its baseline and
// writes the additions to build/<scope>.delta.json.
//
// Both files come from the same emitter run against the same data snapshot,
// so declaration text is byte-identical wherever the two agree — exact-text
// comparison is reliable. The delta is expressed in forms that merge cleanly
// into an existing lib via declaration merging:
//   - whole new interfaces (plus their companion `declare var`)
//   - extra members on existing interfaces (same-name `interface X { … }`)
//   - new type aliases, global functions, and namespace members
// Declarations that *cannot* merge (a changed property type, a widened type
// alias, a changed `declare var`) are recorded under `skipped` for report.md.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { buildDir, rootDir, scopes, type Scope } from "./util.ts";

interface DeltaItem {
  kind: "interface" | "alias" | "var" | "function";
  name: string;
  text: string;
  pos: number;
}
interface Augment {
  parent: string;
  memberName: string;
  text: string;
  pos: number;
}
interface NamespaceAugment {
  parent: string;
  statements: string[];
  pos: number;
}
interface Skipped {
  reason: string;
  name: string;
}

interface InterfaceInfo {
  // An interface name can be declared more than once (the emitter splits the
  // main interface from its iterable/maplike section). Members are merged
  // across every declaration; `texts` keeps each declaration verbatim so a
  // brand-new interface can be re-emitted exactly as upstream wrote it.
  texts: string[];
  pos: number;
  members: Map<string, MemberInfo[]>;
  heritage: Set<string>;
  typeParams: string; // e.g. "<T>", empty for non-generic interfaces
}
interface FileIndex {
  interfaces: Map<string, InterfaceInfo>;
  aliases: Map<string, { text: string; pos: number }>;
  vars: Map<string, { text: string; pos: number }>;
  functions: Map<string, { texts: Set<string>; pos: number }>;
  namespaces: Map<string, { statements: Set<string>; pos: number }>;
}
interface MemberInfo {
  text: string;
  isProperty: boolean;
}

// Declaration text including its leading JSDoc comment.
function fullText(node: ts.Node, sf: ts.SourceFile): string {
  return node.getFullText(sf).replace(/^\s*\n/, "").replace(/\s+$/, "");
}

function memberKey(member: ts.TypeElement): string {
  if (member.name) return member.name.getText();
  if (ts.isConstructSignatureDeclaration(member)) return "new()";
  if (ts.isCallSignatureDeclaration(member)) return "()";
  if (ts.isIndexSignatureDeclaration(member)) return "[index]";
  return `kind:${member.kind}`;
}

function indexFile(file: string): FileIndex {
  const text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const index: FileIndex = {
    interfaces: new Map(),
    aliases: new Map(),
    vars: new Map(),
    functions: new Map(),
    namespaces: new Map(),
  };
  for (const stmt of sf.statements) {
    if (ts.isInterfaceDeclaration(stmt)) {
      const info: InterfaceInfo = index.interfaces.get(stmt.name.text) ?? {
        texts: [],
        pos: stmt.pos,
        members: new Map(),
        heritage: new Set(),
        typeParams: stmt.typeParameters
          ? `<${stmt.typeParameters.map((p) => p.getText()).join(", ")}>`
          : "",
      };
      info.texts.push(fullText(stmt, sf));
      for (const clause of stmt.heritageClauses ?? []) {
        for (const t of clause.types) info.heritage.add(t.getText());
      }
      for (const m of stmt.members) {
        const key = memberKey(m);
        const list = info.members.get(key) ?? [];
        list.push({
          text: fullText(m, sf),
          isProperty: ts.isPropertySignature(m),
        });
        info.members.set(key, list);
      }
      index.interfaces.set(stmt.name.text, info);
    } else if (ts.isTypeAliasDeclaration(stmt)) {
      index.aliases.set(stmt.name.text, {
        text: fullText(stmt, sf),
        pos: stmt.pos,
      });
    } else if (ts.isVariableStatement(stmt)) {
      const name = stmt.declarationList.declarations[0].name.getText();
      index.vars.set(name, { text: fullText(stmt, sf), pos: stmt.pos });
    } else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      const entry = index.functions.get(stmt.name.text) ?? {
        texts: new Set<string>(),
        pos: stmt.pos,
      };
      entry.texts.add(fullText(stmt, sf));
      index.functions.set(stmt.name.text, entry);
    } else if (ts.isModuleDeclaration(stmt)) {
      const statements = new Set<string>();
      if (stmt.body && ts.isModuleBlock(stmt.body)) {
        for (const s of stmt.body.statements) statements.add(fullText(s, sf));
      }
      index.namespaces.set(stmt.name.getText(), {
        statements,
        pos: stmt.pos,
      });
    }
  }
  return index;
}

const upstreamSha = JSON.parse(
  fs.readFileSync(path.join(rootDir, "upstream.json"), "utf8"),
).sha;

function computeDelta(scope: Scope) {
const baseline = indexFile(path.join(buildDir, scope.baseline));
const full = indexFile(path.join(buildDir, scope.full));

const items: DeltaItem[] = [];
const augments: Augment[] = [];
const namespaceAugments: NamespaceAugment[] = [];
const skipped: Skipped[] = [];

// Every type name resolvable in this scope: the scope's baseline plus
// everything the full build adds (which becomes the delta), plus the built-in
// collections used in maplike/setlike heritage. Used to detect `extends`
// clauses that reference a base absent from the scope (e.g. a worker-exposed
// interface that extends a Window-only base).
const available = new Set<string>([
  ...baseline.interfaces.keys(),
  ...full.interfaces.keys(),
  ...baseline.aliases.keys(),
  ...full.aliases.keys(),
  // ECMAScript / TypeScript lib types the generator uses in heritage.
  "Map",
  "ReadonlyMap",
  "Set",
  "ReadonlySet",
  "WeakMap",
  "WeakSet",
  "IteratorObject",
  "AsyncIteratorObject",
  "Error",
]);
const baseName = (heritage: string) => heritage.replace(/<.*/, "").trim();

// A brand-new interface that extends a mutable built-in collection and
// redeclares one of its mutators with a non-`this` return can't be expressed
// in TypeScript (the emitter produces `set(...): void` against `Map.set(): this`).
// Upstream never hits this because these interfaces are all single-engine.
// Rather than drop the interface (other types reference it), reconstruct it
// without the conflicting mutators so it inherits them from Map/Set.
const COLLECTION_MUTATORS: Record<string, string[]> = {
  Map: ["set", "delete", "clear"],
  Set: ["add", "delete", "clear"],
  WeakMap: ["set", "delete"],
  WeakSet: ["add", "delete"],
};
function conflictingMutators(iface: InterfaceInfo): string[] {
  const conflicts: string[] = [];
  for (const h of iface.heritage) {
    for (const m of COLLECTION_MUTATORS[baseName(h)] ?? []) {
      if (iface.members.has(m)) conflicts.push(m);
    }
  }
  return conflicts;
}
function unresolvedHeritage(iface: InterfaceInfo): string[] {
  return [...iface.heritage].filter((h) => !available.has(baseName(h)));
}
function reconstructInterface(
  name: string,
  iface: InterfaceInfo,
  excludeMembers: Set<string>,
  excludeHeritage: Set<string>,
): string {
  const kept = [...iface.heritage].filter((h) => !excludeHeritage.has(h));
  const heritage = kept.length ? ` extends ${kept.join(", ")}` : "";
  const body: string[] = [];
  for (const [key, members] of iface.members) {
    if (excludeMembers.has(key)) continue;
    for (const m of members) body.push(m.text.replace(/^/gm, "    "));
  }
  return `interface ${name}${iface.typeParams}${heritage} {\n${body.join("\n")}\n}`;
}

for (const [name, iface] of full.interfaces) {
  const base = baseline.interfaces.get(name);
  if (!base) {
    const conflicts = conflictingMutators(iface);
    const danglingBases = unresolvedHeritage(iface);
    if (conflicts.length || danglingBases.length) {
      if (conflicts.length)
        skipped.push({ reason: "maplike-mutator-dropped", name });
      if (danglingBases.length)
        skipped.push({
          reason: `heritage-base-unresolved (${danglingBases.map(baseName).join(", ")})`,
          name,
        });
      items.push({
        kind: "interface",
        name,
        text: reconstructInterface(
          name,
          iface,
          new Set(conflicts),
          new Set(danglingBases),
        ),
        pos: iface.pos,
      });
      continue;
    }
    items.push({
      kind: "interface",
      name,
      text: iface.texts.join("\n\n"),
      pos: iface.pos,
    });
    continue;
  }
  for (const [key, memberList] of iface.members) {
    const baseList = base.members.get(key);
    for (const member of memberList) {
      if (baseList?.some((b) => b.text === member.text)) continue;
      if (baseList && member.isProperty) {
        // A property that exists in baseline with a different type can't be
        // re-declared; declaration merging requires identical types.
        skipped.push({ reason: "property-type-changed", name: `${name}.${key}` });
        continue;
      }
      augments.push({
        parent: name,
        memberName: key,
        text: member.text,
        pos: iface.pos,
      });
    }
  }
}

for (const [name, alias] of full.aliases) {
  const base = baseline.aliases.get(name);
  if (!base) {
    items.push({ kind: "alias", name, text: alias.text, pos: alias.pos });
  } else if (base.text !== alias.text) {
    skipped.push({ reason: "type-alias-changed", name });
  }
}

for (const [name, v] of full.vars) {
  const base = baseline.vars.get(name);
  if (!base) {
    items.push({ kind: "var", name, text: v.text, pos: v.pos });
  } else if (base.text !== v.text) {
    skipped.push({ reason: "var-changed", name });
  }
}

for (const [name, fn] of full.functions) {
  const base = baseline.functions.get(name);
  for (const text of fn.texts) {
    if (!base?.texts.has(text)) {
      items.push({ kind: "function", name, text, pos: fn.pos });
    }
  }
}

for (const [name, ns] of full.namespaces) {
  const base = baseline.namespaces.get(name);
  const added = [...ns.statements].filter((s) => !base?.statements.has(s));
  if (added.length) {
    namespaceAugments.push({ parent: name, statements: added, pos: ns.pos });
  }
}

const delta = {
  meta: { scope: scope.name, upstreamSha, generatedAt: new Date().toISOString() },
  items,
  augments,
  namespaceAugments,
  skipped,
};
fs.writeFileSync(
  path.join(buildDir, scope.delta),
  JSON.stringify(delta, null, 2),
);

console.log(
  `[${scope.name}] ` +
    `${items.filter((i) => i.kind === "interface").length} interfaces, ` +
    `${items.filter((i) => i.kind === "alias").length} aliases, ` +
    `${items.filter((i) => i.kind === "var").length} vars, ` +
    `${items.filter((i) => i.kind === "function").length} functions, ` +
    `${augments.length} members on existing interfaces, ` +
    `${namespaceAugments.length} namespace augments, ` +
    `${skipped.length} skipped`,
);
}

for (const scope of scopes) computeDelta(scope);
