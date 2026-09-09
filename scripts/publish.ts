// Publishes pkg/ to npm when its version isn't on the registry yet. Version
// bumps come from the PR that changes pkg/package.json, so merging that PR is
// what releases; merges that leave the version alone are a no-op here.
//
// Run by the publish workflow. Locally, `npm run publish-pkg -- --dry-run`
// shows what would be sent.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pkgDir } from "./util.ts";

const { name, version } = JSON.parse(
  fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"),
);

// A package with no releases 404s; anything else is a registry problem worth
// failing on rather than republishing over.
const res = await fetch(`https://registry.npmjs.org/${name}`, {
  headers: { Accept: "application/json" },
});
if (!res.ok && res.status !== 404) {
  throw new Error(`Registry ${res.status}: ${await res.text()}`);
}
const published: Record<string, unknown> =
  res.status === 404 ? {} : ((await res.json()).versions ?? {});

function setOutput(published: boolean): void {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `published=${published}\nversion=${version}\n`,
    );
  }
}

if (version in published) {
  console.log(`${name}@${version} is already published`);
  setOutput(false);
  process.exit(0);
}

// Trusted publishing signs its own provenance; the token path has to ask.
const args = ["publish", ...process.argv.slice(2)];
if (process.env.GITHUB_ACTIONS && process.env.NODE_AUTH_TOKEN) {
  args.push("--provenance");
}

console.log(`Publishing ${name}@${version}`);
const result = spawnSync("npm", args, { cwd: pkgDir, stdio: "inherit" });
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
setOutput(true);
