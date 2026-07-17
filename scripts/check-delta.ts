// Guardrail run in CI/test: fail if any scope's delta is suspiciously empty,
// which would mean the patch stopped taking effect (e.g. upstream refactored
// the filter and the .patch no longer applies to the right code).
import fs from "node:fs";
import path from "node:path";
import { buildDir, augmentScopes } from "./util.ts";

// Rough floors well below current counts (dom ~431, webworker ~141).
const MIN_INTERFACES: Record<string, number> = { dom: 200, webworker: 60 };

let failed = false;
for (const scope of augmentScopes) {
  const deltaPath = path.join(buildDir, scope.augment!.delta);
  if (!fs.existsSync(deltaPath)) {
    console.error(`Missing ${scope.augment!.delta} — run \`npm run build && npm run diff\` first.`);
    failed = true;
    continue;
  }
  const delta = JSON.parse(fs.readFileSync(deltaPath, "utf8"));
  const interfaces = delta.items.filter(
    (i: any) => i.kind === "interface",
  ).length;
  const floor = MIN_INTERFACES[scope.name] ?? 1;
  if (interfaces < floor) {
    console.error(
      `[${scope.name}] delta has only ${interfaces} new interfaces (expected >= ${floor}). ` +
        `The engine-count patch may no longer be applying — check ` +
        `patches/min-engines.patch against the pinned upstream SHA.`,
    );
    failed = true;
  } else {
    console.log(`[${scope.name}] delta looks healthy: ${interfaces} new interfaces.`);
  }
}
if (failed) process.exit(1);
