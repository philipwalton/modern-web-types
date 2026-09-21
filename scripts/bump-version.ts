// Run from the repository root after regeneration. HEAD is the base branch;
// an optional ref supplies a version already chosen on the open update PR.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const git = (...args: string[]) =>
  execFileSync("git", args, { encoding: "utf8" }).trim();
const manifest = "pkg/package.json";

function parts(version: string): number[] {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Expected a stable package version, got ${version}`);
  }
  return version.split(".").map(Number);
}

function newer(version: string, base: string): boolean {
  const candidate = parts(version);
  const previous = parts(base);
  for (let i = 0; i < candidate.length; i++) {
    if (candidate[i] !== previous[i]) return candidate[i] > previous[i];
  }
  return false;
}

// Include added/deleted files as well as edits, staged or unstaged.
if (!git("status", "--porcelain", "--untracked-files=all", "--", "pkg/*.d.ts")) {
  console.log("No declaration changes; leaving the package version alone.");
} else {
  const base = JSON.parse(git("show", `HEAD:${manifest}`)).version;
  const pkg = JSON.parse(fs.readFileSync(manifest, "utf8"));
  const previousRef = process.argv[2];
  const previous = previousRef
    ? JSON.parse(git("show", `${previousRef}:${manifest}`)).version
    : base;
  const [major, minor] = parts(base);
  pkg.version = newer(pkg.version, base) ? pkg.version
    : newer(previous, base) ? previous
    : `${major}.${minor + 1}.0`;
  fs.writeFileSync(manifest, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`Package version: ${base} -> ${pkg.version}`);
}
