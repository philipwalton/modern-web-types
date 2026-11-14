// Runs the upstream generator twice:
//   1. baseline — stock behavior (a feature needs 2+ browser engines)
//   2. full     — MWT_MIN_ENGINES=1 (any feature shipped in 1+ stable engine)
// The full build of every environment is copied into build/, where it becomes
// that environment's shipped lib. The baseline build is copied only for the
// environments TypeScript ships a lib for, whose delta is full − baseline.
import fs from "node:fs";
import path from "node:path";
import { buildDir, rootDir, upstreamDir, run, scopes } from "./util.ts";

const generatedDir = path.join(upstreamDir, "generated");
fs.mkdirSync(buildDir, { recursive: true });

function build(variant: "baseline" | "full") {
  console.log(`Building ${variant}…`);
  const env: Record<string, string> = {};
  if (variant === "full") {
    env.MWT_MIN_ENGINES = "1";
    env.MWT_FULL_BUILD = "1";
    // WebRef 3.86.0 omitted two shipped specs during their move to WICG.
    const manifest = path.join(upstreamDir, "node_modules/@webref/idl/package.json");
    const { version } = JSON.parse(fs.readFileSync(manifest, "utf8"));
    if (version === "3.86.0") {
      env.MWT_FALLBACK_IDL_DIR = path.join(rootDir, "patches/webref-3.86.0");
    }
  }
  const output = run("node", ["./src/build.ts"], { cwd: upstreamDir, env });
  for (const scope of scopes) {
    const dest = variant === "full" ? scope.full : scope.delta?.baseline;
    if (!dest) continue; // envs with no stock lib to diff against
    fs.copyFileSync(
      path.join(generatedDir, scope.generated),
      path.join(buildDir, dest),
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
  `Done: ${scopes.length} full builds + ${scopes.filter((s) => s.delta).length} baselines in ` +
    `${path.relative(process.cwd(), buildDir)}/`,
);
