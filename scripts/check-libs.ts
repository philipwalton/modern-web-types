// Typechecks every replace-mode lib standalone: lib ESNext only, with no
// built-in DOM/Worker lib, exactly as a consumer uses it. Each lib must be
// self-contained (0 errors) — proving the type-only dependency retention closed
// every cross-scope reference. lib-dom.ts / lib-worker.ts additionally exercise
// real APIs; this covers all five environments including the standalone workers.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { buildDir, pkgDir, rootDir, scopes, replaceLib } from "./util.ts";

const tsc = path.join(rootDir, "node_modules", ".bin", "tsc");
let failed = false;

for (const scope of scopes) {
  const libFile = path.join(pkgDir, replaceLib(scope));
  if (!fs.existsSync(libFile)) {
    console.error(`Missing ${replaceLib(scope)} — run \`npm run emit-lib\` first.`);
    failed = true;
    continue;
  }
  const cfgPath = path.join(buildDir, `_libcheck.${scope.name}.json`);
  fs.writeFileSync(
    cfgPath,
    JSON.stringify({
      compilerOptions: {
        noEmit: true,
        strict: true,
        skipLibCheck: false,
        types: [],
        lib: ["ESNext"],
      },
      files: [libFile],
    }),
  );
  const proc = spawnSync(tsc, ["-p", cfgPath], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const errors = ((proc.stdout ?? "") + (proc.stderr ?? ""))
    .split("\n")
    .filter((l) => l.includes("error TS"));
  if (errors.length) {
    console.error(`[${scope.name}] ${replaceLib(scope)} has ${errors.length} error(s):`);
    for (const e of errors.slice(0, 10)) console.error("  " + e);
    failed = true;
  } else {
    console.log(`[${scope.name}] ${replaceLib(scope)} typechecks standalone.`);
  }
}

if (failed) process.exit(1);
