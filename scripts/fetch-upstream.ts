// Clones microsoft/TypeScript-DOM-lib-generator at the SHA pinned in
// upstream.json, applies patches/min-engines.patch, and installs its deps.
// The patched tree lives in upstream/ (gitignored).
import fs from "node:fs";
import path from "node:path";
import { rootDir, upstreamDir, run } from "./util.ts";

const { repo, sha } = JSON.parse(
  fs.readFileSync(path.join(rootDir, "upstream.json"), "utf8"),
);
const patchFile = path.join(rootDir, "patches", "min-engines.patch");

function currentSha(): string | undefined {
  try {
    return run("git", ["rev-parse", "HEAD"], { cwd: upstreamDir }).trim();
  } catch {
    return undefined;
  }
}

if (currentSha() !== sha) {
  fs.rmSync(upstreamDir, { recursive: true, force: true });
  fs.mkdirSync(upstreamDir, { recursive: true });
  run("git", ["init", "-q"], { cwd: upstreamDir });
  run("git", ["remote", "add", "origin", repo], { cwd: upstreamDir });
  console.log(`Fetching ${repo} @ ${sha}…`);
  run("git", ["fetch", "-q", "--depth", "1", "origin", sha], {
    cwd: upstreamDir,
  });
  run("git", ["checkout", "-q", "FETCH_HEAD"], { cwd: upstreamDir });
}

// A dirty tree means the patch is already applied (or something is wrong —
// git apply will fail loudly in that case).
const dirty = run("git", ["status", "--porcelain"], { cwd: upstreamDir }).trim();
if (!dirty) {
  run("git", ["apply", patchFile], { cwd: upstreamDir });
  console.log("Applied patches/min-engines.patch");
}

if (!fs.existsSync(path.join(upstreamDir, "node_modules"))) {
  console.log("Installing upstream dependencies…");
  run("npm", ["ci", "--no-audit", "--no-fund"], { cwd: upstreamDir });
}

console.log(`Upstream ready @ ${sha}`);
