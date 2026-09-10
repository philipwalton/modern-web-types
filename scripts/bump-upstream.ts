// Points each pinned source at the current tip of its default branch.
//
// upstream.json pins the generator; its own automation refreshes its @webref/*
// and BCD data deps, so tracking its main branch is what pulls in newly shipped
// web-platform APIs. registry.json pins the timing entry types registry, whose
// table is the source of the performance entry type lookup maps.
//
// Run by the weekly workflow before rebuilding.
import fs from "node:fs";
import path from "node:path";
import { rootDir } from "./util.ts";

async function bump(file: string): Promise<void> {
  const pinPath = path.join(rootDir, file);
  const config = JSON.parse(fs.readFileSync(pinPath, "utf8"));

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
    console.log(`${file}: already at latest ${sha}`);
  } else {
    config.sha = sha;
    fs.writeFileSync(pinPath, JSON.stringify(config, null, 2) + "\n");
    console.log(`${file}: bumped to ${sha}`);
  }
}

for (const file of ["upstream.json", "registry.json"]) await bump(file);
