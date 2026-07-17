// Points upstream.json at the current tip of the generator's default branch.
// The generator's own automation refreshes its @webref/* and BCD data deps, so
// tracking its main branch is what pulls in newly shipped web-platform APIs.
// Run by the weekly workflow before rebuilding.
import fs from "node:fs";
import path from "node:path";
import { rootDir } from "./util.ts";

const upstreamPath = path.join(rootDir, "upstream.json");
const config = JSON.parse(fs.readFileSync(upstreamPath, "utf8"));

const repoPath = new URL(config.repo).pathname
  .replace(/^\//, "")
  .replace(/\.git$/, "");
const api = `https://api.github.com/repos/${repoPath}/commits/main`;

const res = await fetch(api, {
  headers: {
    Accept: "application/vnd.github.sha",
    "User-Agent": "modern-web-types",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  },
});
if (!res.ok) {
  throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
}
const sha = (await res.text()).trim();

if (sha === config.sha) {
  console.log(`Already at latest upstream ${sha}`);
} else {
  config.sha = sha;
  fs.writeFileSync(upstreamPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`Bumped upstream to ${sha}`);
}
