import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
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
// Every environment ships a complete lib the consumer uses in place of
// TypeScript's built-in (or, for the standalone worker variants, in place of
// the corresponding @types/* package). `dom` and `webworker` are the two
// TypeScript ships a lib for, so they also get a baseline build: the delta
// between it and the one-engine build is the gap report.md describes and the
// symbol list the smoke tests assert.
//
// `webworker` is the combined worker lib (it defines the dedicated, shared,
// and service worker global scopes, exactly like TypeScript's bundled
// lib.webworker). `serviceworker` and `sharedworker` are narrower subsets for
// projects that want only that one global scope; `audioworklet` is a distinct,
// restricted environment.
export interface DeltaConfig {
  baseline: string; // build/ filename of the two-engine build
  delta: string; // build/ filename of the computed delta
}
export interface Scope {
  name: string;
  generated: string; // filename under upstream/generated/
  full: string; // build/ filename of the one-engine build
  lib: string; // TypeScript lib name; also the replace-lib basename
  delta?: DeltaConfig; // present only for envs TypeScript ships a lib for
}

// The shipped lib filename for a scope, e.g. "lib.dom.d.ts".
export function libFile(scope: Scope): string {
  return `lib.${scope.lib.toLowerCase()}.d.ts`;
}

export const scopes: Scope[] = [
  {
    name: "dom",
    generated: "dom.generated.d.ts",
    full: "dom.full.d.ts",
    lib: "DOM",
    delta: {
      baseline: "dom.baseline.d.ts",
      delta: "dom.delta.json",
    },
  },
  {
    name: "webworker",
    generated: "webworker.generated.d.ts",
    full: "webworker.full.d.ts",
    lib: "WebWorker",
    delta: {
      baseline: "webworker.baseline.d.ts",
      delta: "webworker.delta.json",
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

// The environments whose gap against a stock TypeScript lib is measurable.
export const deltaScopes = scopes.filter((s) => s.delta);

// Generated output is typechecked under two compilers: `typescript`, whose
// JavaScript API scripts/diff.ts and scripts/emit-lib.ts parse with, and
// `typescript-7`, an alias for the latest release, which is what consumers
// compile with. Each package installs a bin named `tsc`, so only one of them
// wins node_modules/.bin; both are invoked by full path instead.
export interface Compiler {
  version: string;
  tsc: string;
}

export function compilers(): Compiler[] {
  return ["typescript", "typescript-7"].map((pkg) => {
    const dir = path.join(rootDir, "node_modules", pkg);
    const tsc = path.join(dir, "bin", "tsc");
    if (!fs.existsSync(tsc)) {
      throw new Error(`Missing ${pkg} — run \`npm install\` first.`);
    }
    const manifest = fs.readFileSync(path.join(dir, "package.json"), "utf8");
    return { version: JSON.parse(manifest).version, tsc };
  });
}

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
