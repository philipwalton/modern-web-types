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
