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

// The pipeline runs once per global scope. Each scope maps an upstream
// generated lib to its own build artifacts, package entry point, and the
// TypeScript lib a consumer augments (`DOM` for Window, `WebWorker` for
// Workers). Worker files get a `.worker` suffix so both can live in one
// package (e.g. `modern-web-types/webusb` vs `modern-web-types/worker`).
export interface Scope {
  name: "window" | "worker";
  generated: string; // filename under upstream/generated/
  baseline: string; // filename under build/
  full: string; // filename under build/
  delta: string; // filename under build/
  suffix: string; // appended to per-spec pkg files
  index: string; // aggregate entry point under pkg/
  lib: string; // TypeScript lib a consumer merges these into
}

export const scopes: Scope[] = [
  {
    name: "window",
    generated: "dom.generated.d.ts",
    baseline: "baseline.d.ts",
    full: "full.d.ts",
    delta: "delta.json",
    suffix: "",
    index: "index.d.ts",
    lib: "DOM",
  },
  {
    name: "worker",
    generated: "webworker.generated.d.ts",
    baseline: "worker-baseline.d.ts",
    full: "worker-full.d.ts",
    delta: "worker-delta.json",
    suffix: ".worker",
    index: "worker.d.ts",
    lib: "WebWorker",
  },
];

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
