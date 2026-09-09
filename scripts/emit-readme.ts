// Derives pkg/README.md from the repo README so npm renders the same prose.
// Two transforms are applied: repo-only sections are dropped, and relative
// links are rewritten to absolute ones, since nothing resolves relative to a
// package page.
import fs from "node:fs";
import path from "node:path";
import { rootDir, pkgDir } from "./util.ts";

// Sections that describe working on the repo rather than consuming the
// package. Matched on the exact `## ` heading text.
const repoOnlySections = new Set(["Development"]);

const { repository } = JSON.parse(
  fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"),
);
// repository.url is a clone URL; the README needs the browsable form.
const repoUrl = repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
const blobUrl = `${repoUrl}/blob/main`;

const readme = fs.readFileSync(path.join(rootDir, "README.md"), "utf8");

const kept: string[] = [];
let skipping = false;
let inFence = false;

for (const line of readme.split("\n")) {
  if (/^\s*```/.test(line)) inFence = !inFence;
  const heading = !inFence && /^##\s+(.*)$/.exec(line);
  if (heading) skipping = repoOnlySections.has(heading[1].trim());
  if (!skipping) kept.push(line);
}

// A link target is repo-relative when it has no scheme and no leading slash or
// fragment. Directory targets keep their trailing slash, which /blob/main
// resolves the same way GitHub does.
const rewritten = kept
  .join("\n")
  .replace(/\]\((?!https?:|#|\/)([^)]+)\)/g, (_, target) => {
    return `](${blobUrl}/${target.replace(/\/$/, "")})`;
  })
  .replace(/\n{3,}/g, "\n\n")
  .trimEnd();

const header = "<!-- Generated from README.md. Edit that file instead. -->";
const out = `${header}\n\n${rewritten}\n`;

fs.mkdirSync(pkgDir, { recursive: true });
fs.writeFileSync(path.join(pkgDir, "README.md"), out);

const dropped = [...repoOnlySections].join(", ");
console.log(`Wrote pkg/README.md (dropped: ${dropped})`);
