// Runs the upstream generator twice:
//   1. baseline — stock behavior (a feature needs 2+ browser engines)
//   2. full     — MWT_MIN_ENGINES=1 (any feature shipped in 1+ stable engine)
// and copies each configured scope's output of both runs into build/. The
// difference between a scope's two files is exactly the set of declarations
// the two-engine rule excludes from that scope.
import fs from "node:fs";
import path from "node:path";
import { buildDir, upstreamDir, run, scopes } from "./util.ts";

const generatedDir = path.join(upstreamDir, "generated");
fs.mkdirSync(buildDir, { recursive: true });

function build(variant: "baseline" | "full") {
  console.log(`Building ${variant}…`);
  const env =
    variant === "full"
      ? { MWT_MIN_ENGINES: "1", MWT_LENIENT_TYPES: "1" }
      : {};
  const output = run("node", ["./src/build.ts"], { cwd: upstreamDir, env });
  for (const scope of scopes) {
    fs.copyFileSync(
      path.join(generatedDir, scope.generated),
      path.join(buildDir, scope[variant]),
    );
  }

  // Unknown-type fallbacks (emitted as `any`) are recorded for the report.
  if (variant === "full") {
    const warnings = [
      ...new Set(
        output.split("\n").filter((line) => line.startsWith("MWT:")),
      ),
    ];
    fs.writeFileSync(
      path.join(buildDir, "warnings.txt"),
      warnings.join("\n") + "\n",
    );
    if (warnings.length) {
      console.log(`${warnings.length} unknown-type fallback(s) recorded`);
    }
  }
}

build("baseline");
build("full");
console.log(
  "Done: " +
    scopes.map((s) => `${s.baseline}/${s.full}`).join(", ") +
    ` in ${path.relative(process.cwd(), buildDir)}/`,
);
