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
  // No clone yet (or an interrupted one left an empty dir): nothing to reuse.
  if (!fs.existsSync(path.join(upstreamDir, ".git"))) return undefined;
  try {
    // --verify --quiet exits non-zero *silently* on an unresolvable HEAD (an
    // interrupted clone with an unborn HEAD), so the probe never leaks git's
    // "ambiguous argument 'HEAD'" to the console; either way we re-clone.
    return run("git", ["rev-parse", "--verify", "--quiet", "HEAD"], {
      cwd: upstreamDir,
    }).trim();
  } catch {
    return undefined;
  }
}

// Block the thread between retry attempts (run() is synchronous).
function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// Shallow-fetch the pinned SHA into a fresh upstream/ and check it out. The
// fetch occasionally returns a partial packfile ("remote did not send all
// necessary objects"); a clean retry almost always succeeds, so each attempt
// starts from an empty directory to discard any half-written object store.
function cloneAtSha(): void {
  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    fs.rmSync(upstreamDir, { recursive: true, force: true });
    fs.mkdirSync(upstreamDir, { recursive: true });
    run("git", ["init", "-q"], { cwd: upstreamDir });
    run("git", ["remote", "add", "origin", repo], { cwd: upstreamDir });
    console.log(`Fetching ${repo} @ ${sha}… (attempt ${attempt}/${attempts})`);
    try {
      run("git", ["fetch", "-q", "--depth", "1", "origin", sha], {
        cwd: upstreamDir,
      });
      run("git", ["checkout", "-q", "FETCH_HEAD"], { cwd: upstreamDir });
      return;
    } catch (err) {
      if (attempt === attempts) throw err;
      const backoffMs = 2000 * 2 ** (attempt - 1);
      console.warn(`Fetch failed; retrying in ${backoffMs / 1000}s…`);
      sleepSync(backoffMs);
    }
  }
}

if (currentSha() !== sha) cloneAtSha();

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
