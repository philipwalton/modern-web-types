// Typechecks every shipped lib standalone: lib ESNext only, with no built-in
// DOM/Worker lib, exactly as a consumer uses it. Each lib must be
// self-contained (0 errors) — proving the type-only dependency retention closed
// every cross-scope reference. The generated smoke tests cover the two scopes
// with a delta; this covers all five environments, standalone workers included.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { buildDir, pkgDir, scopes, libFile, compilers } from "./util.ts";

const toolchain = compilers();
let failed = false;

for (const scope of scopes) {
  const libPath = path.join(pkgDir, libFile(scope));
  if (!fs.existsSync(libPath)) {
    console.error(`Missing ${libFile(scope)} — run \`npm run emit-lib\` first.`);
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
      files: [libPath],
    }),
  );
  let clean = true;
  for (const { version, tsc } of toolchain) {
    const proc = spawnSync(tsc, ["-p", cfgPath], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    const errors = ((proc.stdout ?? "") + (proc.stderr ?? ""))
      .split("\n")
      .filter((l) => l.includes("error TS"));
    if (errors.length) {
      console.error(
        `[${scope.name}] ${libFile(scope)} has ${errors.length} error(s) under tsc ${version}:`,
      );
      for (const e of errors.slice(0, 10)) console.error("  " + e);
      clean = false;
      failed = true;
    }
  }
  if (clean) {
    const versions = toolchain.map((c) => c.version).join(", ");
    console.log(
      `[${scope.name}] ${libFile(scope)} typechecks standalone under tsc ${versions}.`,
    );
  }
}

if (failed) process.exit(1);
