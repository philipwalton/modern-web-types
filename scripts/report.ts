// Writes report.md: a human-readable summary, per scope, of the gap between
// what ships in >=1 stable engine and what the stock lib exposes.
import fs from "node:fs";
import path from "node:path";
import { buildDir, rootDir, scopes } from "./util.ts";

const warnings = fs.existsSync(path.join(buildDir, "warnings.txt"))
  ? fs
      .readFileSync(path.join(buildDir, "warnings.txt"), "utf8")
      .split("\n")
      .filter(Boolean)
  : [];

const first = JSON.parse(
  fs.readFileSync(path.join(buildDir, scopes[0].delta), "utf8"),
);

const lines: string[] = [];
lines.push("# Gap report");
lines.push("");
lines.push(
  `Generated ${first.meta.generatedAt} from TypeScript-DOM-lib-generator ` +
    `\`${first.meta.upstreamSha.slice(0, 12)}\`.`,
);
lines.push("");
lines.push(
  "These are declarations present when the two-engine rule is relaxed to " +
    "**one** stable engine, but absent from the stock baseline. Each scope " +
    "augments a different TypeScript lib (`DOM` for window, `WebWorker` for " +
    "worker).",
);
lines.push("");
lines.push(
  "The package ships in two flavors: **augment** (per-spec `.d.ts` files that " +
    "merge these additions into your existing lib) and **replace** (a complete " +
    "`lib.dom.d.ts` / `lib.webworker.d.ts` you use in place of TypeScript's, " +
    "the `@types/web` model). The counts below describe the augment delta.",
);
lines.push("");

const count = (delta: any, kind: string) =>
  delta.items.filter((i: any) => i.kind === kind).length;

for (const scope of scopes) {
  const delta = JSON.parse(
    fs.readFileSync(path.join(buildDir, scope.delta), "utf8"),
  );
  const newInterfaces = delta.items
    .filter((i: any) => i.kind === "interface")
    .map((i: any) => i.name)
    .sort();
  const specShortnames = [
    ...new Set(delta.items.map((i: any) => i.name)),
  ].length;

  lines.push(`## ${scope.name} scope (lib \`${scope.lib}\`)`);
  lines.push("");
  lines.push(
    `Entry points: \`modern-web-types${scope.suffix ? "/…" + scope.suffix : ""}\` ` +
      `(all via \`${scope.index}\`).`,
  );
  lines.push("");
  lines.push(`| Category | Count |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| New interfaces | ${newInterfaces.length} |`);
  lines.push(`| New type aliases | ${count(delta, "alias")} |`);
  lines.push(`| New global vars | ${count(delta, "var")} |`);
  lines.push(`| New global functions | ${count(delta, "function")} |`);
  lines.push(
    `| Members added to existing interfaces | ${delta.augments.length} |`,
  );
  lines.push(`| Skipped (unmergeable) | ${delta.skipped.length} |`);
  lines.push("");

  lines.push(
    `<details><summary>${newInterfaces.length} new interfaces</summary>`,
  );
  lines.push("");
  lines.push(newInterfaces.map((n: string) => `- \`${n}\``).join("\n"));
  lines.push("");
  lines.push("</details>");
  lines.push("");

  if (delta.skipped.length) {
    lines.push(
      `<details><summary>${delta.skipped.length} skipped (cannot merge)</summary>`,
    );
    lines.push("");
    lines.push(
      "Each differs from an existing lib declaration in a way declaration " +
        "merging can't express (a changed property type, a widened type alias, " +
        "a re-typed `declare var`, a maplike mutator, or an `extends` base that " +
        "doesn't exist in this scope). Handle with a manual override if needed.",
    );
    lines.push("");
    for (const s of delta.skipped) lines.push(`- \`${s.name}\` — ${s.reason}`);
    lines.push("");
    lines.push("</details>");
    lines.push("");
  }
}

if (warnings.length) {
  lines.push("## Unknown-type fallbacks");
  lines.push("");
  lines.push(
    "The relaxed build referenced types the emitter couldn't resolve — " +
      "usually a referenced feature whose own definition was dropped or renamed " +
      "upstream. These were emitted as `any` (e.g. `getDigitalGoodsService(): " +
      "Promise<any>`).",
  );
  lines.push("");
  lines.push("```");
  lines.push(...warnings);
  lines.push("```");
  lines.push("");
}

fs.writeFileSync(path.join(rootDir, "report.md"), lines.join("\n"));
console.log(
  `Wrote report.md (` +
    scopes
      .map((s) => {
        const d = JSON.parse(
          fs.readFileSync(path.join(buildDir, s.delta), "utf8"),
        );
        return `${s.name}: ${count(d, "interface")} interfaces`;
      })
      .join(", ") +
    ")",
);
