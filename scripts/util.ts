import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const upstreamDir = path.join(rootDir, "upstream");
export const buildDir = path.join(rootDir, "build");
export const pkgDir = path.join(rootDir, "pkg");

// The pipeline runs once per environment. The upstream generator emits a
// separate lib per global scope; we mirror all five.
//
// Every environment ships in **replace** mode — a complete lib the consumer
// uses in place of TypeScript's built-in (or, for the standalone worker
// variants, in place of the corresponding @types/* package). `dom` and
// `webworker` also ship in **augment** mode — per-spec files that merge the
// single-engine delta into the consumer's existing lib.dom / lib.webworker.
//
// `webworker` is the combined worker lib (it defines the dedicated, shared,
// and service worker global scopes, exactly like TypeScript's bundled
// lib.webworker). `serviceworker` and `sharedworker` are narrower subsets for
// projects that want only that one global scope; `audioworklet` is a distinct,
// restricted environment.
export interface AugmentConfig {
  baseline: string; // build/ filename of the two-engine build
  delta: string; // build/ filename of the computed delta
  suffix: string; // appended to per-spec pkg files ("" or ".worker")
  index: string; // aggregate entry point under pkg/
}
export interface Scope {
  name: string;
  generated: string; // filename under upstream/generated/
  full: string; // build/ filename of the one-engine build
  lib: string; // TypeScript lib name; also the replace-lib basename
  augment?: AugmentConfig; // present only for envs with a built-in lib to merge into
}

// The replace-mode lib filename for a scope, e.g. "lib.dom.d.ts".
export function replaceLib(scope: Scope): string {
  return `lib.${scope.lib.toLowerCase()}.d.ts`;
}

export const scopes: Scope[] = [
  {
    name: "dom",
    generated: "dom.generated.d.ts",
    full: "dom.full.d.ts",
    lib: "DOM",
    augment: {
      baseline: "dom.baseline.d.ts",
      delta: "dom.delta.json",
      suffix: "",
      index: "index.d.ts",
    },
  },
  {
    name: "webworker",
    generated: "webworker.generated.d.ts",
    full: "webworker.full.d.ts",
    lib: "WebWorker",
    augment: {
      baseline: "webworker.baseline.d.ts",
      delta: "webworker.delta.json",
      suffix: ".worker",
      index: "worker.d.ts",
    },
  },
  {
    name: "serviceworker",
    generated: "serviceworker.generated.d.ts",
    full: "serviceworker.full.d.ts",
    lib: "ServiceWorker",
  },
  {
    name: "sharedworker",
    generated: "sharedworker.generated.d.ts",
    full: "sharedworker.full.d.ts",
    lib: "SharedWorker",
  },
  {
    name: "audioworklet",
    generated: "audioworklet.generated.d.ts",
    full: "audioworklet.full.d.ts",
    lib: "AudioWorklet",
  },
];

// The subset of environments that also produce augment-mode output.
export const augmentScopes = scopes.filter((s) => s.augment);

// Runs a command, returning combined stdout + stderr. Throws on failure.
export function run(
  cmd: string,
  args: string[],
  opts: { cwd?: string; env?: Record<string, string> } = {},
): string {
  const result = spawnSync(cmd, args, {
    cwd: opts.cwd ?? rootDir,
    env: { ...process.env, ...opts.env },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}`);
  }
  return (result.stdout ?? "") + (result.stderr ?? "");
}
