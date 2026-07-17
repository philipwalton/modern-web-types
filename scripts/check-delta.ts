// Guardrail run in CI/test: fail if the delta is suspiciously empty, which
// would mean the patch stopped taking effect (e.g. upstream refactored the
// filter and the .patch no longer applies to the right code).
import fs from "node:fs";
import path from "node:path";
import { buildDir } from "./util.ts";

const MIN_INTERFACES = 50;

const delta = JSON.parse(
  fs.readFileSync(path.join(buildDir, "delta.json"), "utf8"),
);
const interfaces = delta.items.filter(
  (i: any) => i.kind === "interface",
).length;

if (interfaces < MIN_INTERFACES) {
  console.error(
    `Delta has only ${interfaces} new interfaces (expected >= ${MIN_INTERFACES}). ` +
      `The engine-count patch may no longer be applying — check ` +
      `patches/min-engines.patch against the pinned upstream SHA.`,
  );
  process.exit(1);
}
console.log(`Delta looks healthy: ${interfaces} new interfaces.`);
