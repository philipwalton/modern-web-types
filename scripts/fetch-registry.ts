// Refreshes the `entryTypes` table in registry.json from the W3C Timing Entry
// Names Registry, pinned to the SHA in that same file.
//
// The registry is the normative mapping from a `PerformanceEntry.entryType`
// string to the interface an entry of that type implements — the data needed to
// give `getEntriesByType()` a precise return type, and data the upstream
// generator has no source for (Web IDL doesn't record it). Its
// `availableFromTimeline` column says whether an entry type is reachable
// through `Performance` or only through a `PerformanceObserver`.
//
// The parsed rows are committed rather than fetched at emit time, so a
// registry change shows up as a reviewable diff in the weekly update PR.
import fs from "node:fs";
import path from "node:path";
import { rootDir } from "./util.ts";
import { parseRegistry } from "./parse-registry.ts";

const registryPath = path.join(rootDir, "registry.json");
const config = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const repoPath = new URL(config.repo).pathname
  .replace(/^\//, "")
  .replace(/\.git$/, "");
const source = `https://raw.githubusercontent.com/${repoPath}/${config.sha}/index.bs`;

console.log(`Fetching ${source}…`);
const res = await fetch(source, { headers: { "User-Agent": "modern-web-types" } });
if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`);
const bs = await res.text();

const entryTypes = parseRegistry(bs);

config.entryTypes = entryTypes.sort((a, b) => a.type.localeCompare(b.type));
fs.writeFileSync(registryPath, JSON.stringify(config, null, 2) + "\n");

const timeline = entryTypes.filter((e) => e.availableFromTimeline).length;
console.log(
  `Wrote ${entryTypes.length} entry types to registry.json ` +
    `(${timeline} available from the timeline, ${entryTypes.length - timeline} observer-only)`,
);
