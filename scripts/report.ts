// Writes report.md: a human-readable summary, per scope, of the gap between
// what ships in >=1 stable engine and what the stock lib exposes.
import fs from "node:fs";
import path from "node:path";
import {
  buildDir,
  rootDir,
  deltaScopes,
  type Delta,
  type DeltaSymbol,
} from "./util.ts";

const warnings = fs.existsSync(path.join(buildDir, "warnings.txt"))
  ? fs
      .readFileSync(path.join(buildDir, "warnings.txt"), "utf8")
      .split("\n")
      .filter(Boolean)
  : [];

const first = JSON.parse(
  fs.readFileSync(path.join(buildDir, deltaScopes[0].delta!.delta), "utf8"),
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
    "**one** stable engine, but absent from the stock baseline.",
);
lines.push("");
lines.push(
  "The per-scope counts below are that gap, measured for the two environments " +
    "TypeScript ships a lib for (`DOM`, `WebWorker`).",
);
lines.push("");

const count = (delta: Delta, kind: DeltaSymbol["kind"]) =>
  delta.symbols.filter((s) => s.kind === kind).length;

for (const scope of deltaScopes) {
  const delta: Delta = JSON.parse(
    fs.readFileSync(path.join(buildDir, scope.delta!.delta), "utf8"),
  );
  const newInterfaces = delta.symbols
    .filter((s) => s.kind === "interface")
    .map((i) => i.name)
    .sort();
  lines.push(`## ${scope.name} scope (lib \`${scope.lib}\`)`);
  lines.push("");
  lines.push(`| Category | Count |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| New interfaces | ${newInterfaces.length} |`);
  lines.push(`| New type aliases | ${count(delta, "alias")} |`);
  lines.push(`| New global vars | ${count(delta, "var")} |`);
  lines.push(`| New global functions | ${count(delta, "function")} |`);
  lines.push(
    `| Members added to existing interfaces | ${count(delta, "member")} |`,
  );
  lines.push(
    `| Members added to existing namespaces | ${count(delta, "namespace-member")} |`,
  );
  lines.push("");

  lines.push(`### ${newInterfaces.length} new interfaces`);
  lines.push("");
  lines.push(newInterfaces.map((n) => `- \`${n}\``).join("\n"));
  lines.push("");

  const memberAdditions = delta.symbols
    .filter((s) => s.kind === "member")
    .map((m) => `${m.parent}.${m.member}`)
    .sort();
  const parentCount = new Set(
    delta.symbols.filter((s) => s.kind === "member").map((m) => m.parent),
  ).size;
  lines.push(
    `### ${memberAdditions.length} members added to ` +
      `${parentCount} existing interfaces`,
  );
  lines.push("");
  lines.push(memberAdditions.map((n) => `- \`${n}\``).join("\n"));
  lines.push("");

  const namespaceAdditions = delta.symbols
    .filter((s) => s.kind === "namespace-member")
    .map((m) => `${m.parent}.${m.member}`)
    .sort();
  if (namespaceAdditions.length) {
    const nsParentCount = new Set(
      delta.symbols
        .filter((s) => s.kind === "namespace-member")
        .map((m) => m.parent),
    ).size;
    lines.push(
      `### ${namespaceAdditions.length} members added to ` +
        `${nsParentCount} existing namespaces`,
    );
    lines.push("");
    lines.push(namespaceAdditions.map((n) => `- \`${n}\``).join("\n"));
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
    deltaScopes
      .map((s) => {
        const d: Delta = JSON.parse(
          fs.readFileSync(path.join(buildDir, s.delta!.delta), "utf8"),
        );
        return `${s.name}: ${count(d, "interface")} interfaces`;
      })
      .join(", ") +
    ")",
);
