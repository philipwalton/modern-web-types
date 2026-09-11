// Typechecks the generated smoke tests under every compiler in util.ts, one
// config per scope that has a lib to check.
import path from "node:path";
import { spawnSync } from "node:child_process";
import { rootDir, compilers } from "./util.ts";

const configs = ["test/tsconfig.lib.json", "test/tsconfig.lib-worker.json"];

let failed = false;

for (const { version, tsc } of compilers()) {
  for (const config of configs) {
    const proc = spawnSync(tsc, ["-p", path.join(rootDir, config)], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    const errors = ((proc.stdout ?? "") + (proc.stderr ?? ""))
      .split("\n")
      .filter((l) => l.includes("error TS"));
    if (proc.status === 0) {
      console.log(`[tsc ${version}] ${config} typechecks.`);
    } else {
      console.error(`[tsc ${version}] ${config} has ${errors.length} error(s):`);
      for (const e of errors.slice(0, 10)) console.error("  " + e);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
