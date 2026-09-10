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

const registryPath = path.join(rootDir, "registry.json");
const config = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const repoPath = new URL(config.repo).pathname
  .replace(/^\//, "")
  .replace(/\.git$/, "");
const source = `https://raw.githubusercontent.com/${repoPath}/${config.sha}/index.html`;

console.log(`Fetching ${source}…`);
const res = await fetch(source, { headers: { "User-Agent": "modern-web-types" } });
if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`);
const html = await res.text();

// The registry is a single ReSpec table under <section id='registry'>, one row
// per entry type. Anything that doesn't parse is thrown on rather than skipped:
// a silently dropped row would silently drop types from the output.
const tbody = html.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];
if (!tbody) throw new Error("No <tbody> in the registry — has its markup changed?");

const codes = (cell: string): string[] =>
  [...cell.matchAll(/<code>([\s\S]*?)<\/code>/g)].map((m) =>
    m[1].replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').trim(),
  );

const entryTypes = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(([, row]) => {
  const cells = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
  if (cells.length < 3) throw new Error(`Registry row has ${cells.length} cells:\n${row}`);

  const type = codes(cells[0])[0]?.replace(/^"(.*)"$/, "$1");
  const interfaces = codes(cells[1]);
  const available = codes(cells[2])[0];
  if (!type) throw new Error(`No entryType identifier in row:\n${row}`);
  if (!interfaces.length) throw new Error(`No interface for "${type}"`);
  if (available !== "True" && available !== "False") {
    throw new Error(`availableFromTimeline for "${type}" is ${available}`);
  }
  return { type, interfaces, availableFromTimeline: available === "True" };
});

if (!entryTypes.length) throw new Error("Registry table parsed to zero rows.");

config.entryTypes = entryTypes.sort((a, b) => a.type.localeCompare(b.type));
fs.writeFileSync(registryPath, JSON.stringify(config, null, 2) + "\n");

const timeline = entryTypes.filter((e) => e.availableFromTimeline).length;
console.log(
  `Wrote ${entryTypes.length} entry types to registry.json ` +
    `(${timeline} available from the timeline, ${entryTypes.length - timeline} observer-only)`,
);
