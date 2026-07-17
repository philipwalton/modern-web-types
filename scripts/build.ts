// Runs the upstream generator twice:
//   1. baseline — stock behavior (a feature needs 2+ browser engines)
//   2. full     — MWT_MIN_ENGINES=1 (any feature shipped in 1+ stable engine)
// and copies the Window-scope output of each into build/. The difference
// between the two files is exactly the set of declarations the two-engine
// rule excludes.
import fs from "node:fs";
import path from "node:path";
import { buildDir, upstreamDir, run } from "./util.ts";

const generated = path.join(upstreamDir, "generated", "dom.generated.d.ts");
fs.mkdirSync(buildDir, { recursive: true });

function build(variant: "baseline" | "full") {
  console.log(`Building ${variant}…`);
  const env =
    variant === "full"
      ? { MWT_MIN_ENGINES: "1", MWT_LENIENT_TYPES: "1" }
      : {};
  const output = run("node", ["./src/build.ts"], { cwd: upstreamDir, env });
  fs.copyFileSync(generated, path.join(buildDir, `${variant}.d.ts`));

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
console.log("Done: build/baseline.d.ts, build/full.d.ts");
