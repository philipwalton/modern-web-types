// Turns the committed registry.json table into the declarations that give
// `getEntriesByType()` and `getEntriesByName()` a precise return type.
//
// Both methods take the entry type as a plain `string` and return
// `PerformanceEntryList`, so every lookup widens to `PerformanceEntry[]` and the
// caller has to assert. A keyed lookup map plus a generic overload per method
// recovers the specific interface for a known entryType, while an unrecognized
// or non-literal string still resolves through the original signature.
//
// The map is an interface rather than a union so that later declarations can
// merge in more entry types; a scope's declarations are assembled from
// whichever rows that scope can actually resolve.
import fs from "node:fs";
import path from "node:path";
import { rootDir } from "./util.ts";

export interface EntryType {
  type: string;
  interfaces: string[];
  availableFromTimeline: boolean;
}

const registry = JSON.parse(
  fs.readFileSync(path.join(rootDir, "registry.json"), "utf8"),
);
export const registrySha: string = registry.sha;
export const entryTypes: EntryType[] = registry.entryTypes;

// `Performance` exposes only the entry types the registry marks
// `availableFromTimeline`; a `PerformanceObserver` receives every registered
// type, so the observer map extends the timeline one.
export const TIMELINE_MAP = "PerformanceTimelineEntryTypeMap";
export const OBSERVER_MAP = "PerformanceEntryTypeMap";

// The receivers whose lookups the maps type, each with the map it reads.
const RECEIVERS: Record<string, string> = {
  Performance: TIMELINE_MAP,
  PerformanceObserverEntryList: OBSERVER_MAP,
};

export const mapFor = (entry: EntryType): string =>
  entry.availableFromTimeline ? TIMELINE_MAP : OBSERVER_MAP;

// The interfaces a generated lib declares, read straight from its text: the
// emitter puts every one at the start of a line.
export function declaredInterfaces(lib: string): Set<string> {
  return new Set([...lib.matchAll(/^interface (\w+)/gm)].map((m) => m[1]));
}

// An entry type is usable in a scope only where every interface it names is
// declared there — worker scopes have no LayoutShift, for instance.
export function resolvableIn(declared: Set<string>): EntryType[] {
  return entryTypes.filter((e) => e.interfaces.every((i) => declared.has(i)));
}

// One `"entry-type": Interface;` member, for merging into the map it belongs to.
export const mapMember = (entry: EntryType): string =>
  `    ${JSON.stringify(entry.type)}: ${entry.interfaces.join(" | ")};`;

// The two maps, carrying whichever rows are passed in.
export function mapDeclarations(rows: EntryType[]): string {
  const members = (map: string) =>
    rows.filter((e) => mapFor(e) === map).map(mapMember).join("\n");
  const body = (map: string) => {
    const m = members(map);
    return m ? `{\n${m}\n}` : `{}`;
  };
  return (
    `/**\n` +
    ` * Maps each \`entryType\` reachable through the performance timeline to the\n` +
    ` * interface its entries implement, keyed by the identifier the timing entry\n` +
    ` * types registry assigns.\n` +
    ` */\n` +
    `interface ${TIMELINE_MAP} ${body(TIMELINE_MAP)}\n\n` +
    `/**\n` +
    ` * Maps every registered \`entryType\` to the interface its entries implement.\n` +
    ` * The types it adds to ${TIMELINE_MAP} are delivered only to a\n` +
    ` * \`PerformanceObserver\`.\n` +
    ` */\n` +
    `interface ${OBSERVER_MAP} extends ${TIMELINE_MAP} ${body(OBSERVER_MAP)}`
  );
}

// The keyed overloads, for whichever receivers the scope declares. Each merges
// onto the existing interface and is preferred over the `type: string`
// signature for a known key.
export function overloadDeclarations(declared: Set<string>): string[] {
  return Object.entries(RECEIVERS)
    .filter(([receiver]) => declared.has(receiver))
    .map(
      ([receiver, map]) =>
        `interface ${receiver} {\n` +
        `    getEntriesByType<K extends keyof ${map}>(type: K): ${map}[K][];\n` +
        `    getEntriesByName<K extends keyof ${map}>(name: string, type: K): ${map}[K][];\n` +
        `}`,
    );
}
