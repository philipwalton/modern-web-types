// Writes report.md: a human-readable summary of the current gap between
// what ships in >=1 stable engine and what lib.dom exposes.
import fs from "node:fs";
import path from "node:path";
import { buildDir, pkgDir, rootDir } from "./util.ts";

const delta = JSON.parse(
  fs.readFileSync(path.join(buildDir, "delta.json"), "utf8"),
);
const warnings = fs.existsSync(path.join(buildDir, "warnings.txt"))
  ? fs
      .readFileSync(path.join(buildDir, "warnings.txt"), "utf8")
      .split("\n")
      .filter(Boolean)
  : [];

const specFiles = fs
  .readdirSync(pkgDir)
  .filter((f) => f.endsWith(".d.ts") && f !== "index.d.ts")
  .map((f) => f.replace(/\.d\.ts$/, ""))
  .sort();

const newInterfaces = delta.items
  .filter((i: any) => i.kind === "interface")
  .map((i: any) => i.name)
  .sort();

const lines: string[] = [];
lines.push("# Gap report");
lines.push("");
lines.push(
  `Generated ${delta.meta.generatedAt} from TypeScript-DOM-lib-generator ` +
    `\`${delta.meta.upstreamSha.slice(0, 12)}\`.`,
);
lines.push("");
lines.push(
  "These are declarations present when the two-engine rule is relaxed to " +
    "**one** stable engine, but absent from the stock `lib.dom` baseline.",
);
lines.push("");
lines.push("## Totals");
lines.push("");
lines.push(`| Category | Count |`);
lines.push(`| --- | ---: |`);
lines.push(`| New interfaces | ${newInterfaces.length} |`);
lines.push(
  `| New type aliases | ${delta.items.filter((i: any) => i.kind === "alias").length} |`,
);
lines.push(
  `| New global vars | ${delta.items.filter((i: any) => i.kind === "var").length} |`,
);
lines.push(
  `| New global functions | ${delta.items.filter((i: any) => i.kind === "function").length} |`,
);
lines.push(`| Members added to existing interfaces | ${delta.augments.length} |`);
lines.push(`| Spec files emitted | ${specFiles.length} |`);
lines.push(`| Skipped (unmergeable) | ${delta.skipped.length} |`);
lines.push("");

lines.push("## Spec files");
lines.push("");
lines.push(specFiles.map((s) => `\`${s}\``).join(", "));
lines.push("");

lines.push("## New interfaces");
lines.push("");
lines.push("<details><summary>" + newInterfaces.length + " interfaces</summary>");
lines.push("");
lines.push(newInterfaces.map((n: string) => `- \`${n}\``).join("\n"));
lines.push("");
lines.push("</details>");
lines.push("");

if (delta.skipped.length) {
  lines.push("## Skipped (cannot merge into lib.dom)");
  lines.push("");
  lines.push(
    "These differ from an existing lib.dom declaration in a way that " +
      "declaration merging can't express (a changed property type, a widened " +
      "type alias, or a re-typed `declare var`). Handle with a manual override " +
      "if needed.",
  );
  lines.push("");
  for (const s of delta.skipped) {
    lines.push(`- \`${s.name}\` — ${s.reason}`);
  }
  lines.push("");
}

if (warnings.length) {
  lines.push("## Unknown-type fallbacks");
  lines.push("");
  lines.push(
    "The relaxed build referenced types the emitter couldn't resolve " +
      "(usually because a referenced feature is itself single-engine and its " +
      "own definition is elsewhere in the delta). These were emitted as " +
      "`any`; most resolve once their defining spec file is also included.",
  );
  lines.push("");
  lines.push("```");
  lines.push(...warnings);
  lines.push("```");
  lines.push("");
}

fs.writeFileSync(path.join(rootDir, "report.md"), lines.join("\n"));
console.log(`Wrote report.md (${newInterfaces.length} new interfaces)`);
