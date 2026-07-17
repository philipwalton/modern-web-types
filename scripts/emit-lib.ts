// Emits the "replace" flavor of the package: each scope's complete one-engine
// lib (build/<scope>.full) shipped as a drop-in replacement for TypeScript's
// own lib.dom / lib.webworker — the @types/web model, but including
// single-engine APIs. A consumer drops "DOM" from `compilerOptions.lib` and
// references pkg/lib.dom.d.ts instead, so nothing merges into (and nothing can
// conflict with) their bundled lib, and the result doesn't depend on how new
// their TypeScript's lib.dom is.
//
// Two transforms make the raw emitter output valid as a standalone lib, the
// same two the delta path applies:
//   - maplike fix: a few single-engine interfaces `extends Map`/`Set` and
//     redeclare a mutator with a non-`this` return (CSSFontFeatureValuesMap's
//     `set(): void`); those members are stripped so the mutator is inherited.
//   - heritage fix: an interface may `extends` a base not present in this
//     scope (worker's `ManagedMediaSource extends MediaSource`, where
//     MediaSource isn't worker-exposed); the dangling base is dropped.
// Everything else is copied verbatim, including the leading `/// <reference
// lib=... />` lines.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { buildDir, pkgDir, scopes, type Scope } from "./util.ts";

const COLLECTION_MUTATORS: Record<string, string[]> = {
  Map: ["set", "delete", "clear"],
  Set: ["add", "delete", "clear"],
  WeakMap: ["set", "delete"],
  WeakSet: ["add", "delete"],
};
// ECMAScript / TypeScript lib types used in heritage that this file won't define.
const BUILTIN_BASES = new Set([
  "Map",
  "ReadonlyMap",
  "Set",
  "ReadonlySet",
  "WeakMap",
  "WeakSet",
  "IteratorObject",
  "AsyncIteratorObject",
  "Error",
  "Array",
  "ReadonlyArray",
]);
const baseName = (heritage: string) => heritage.replace(/<.*/, "").trim();

interface Edit {
  start: number;
  end: number;
  replacement: string;
}

function sanitizeLib(text: string, file: string): {
  text: string;
  maplike: string[];
  heritage: string[];
} {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

  // Names this file defines, so heritage referencing anything else (and not a
  // built-in) is a dangling base to drop.
  const defined = new Set<string>();
  for (const stmt of sf.statements) {
    if (
      (ts.isInterfaceDeclaration(stmt) ||
        ts.isTypeAliasDeclaration(stmt) ||
        ts.isClassDeclaration(stmt) ||
        ts.isEnumDeclaration(stmt)) &&
      stmt.name
    ) {
      defined.add(stmt.name.text);
    }
  }
  const resolvable = (base: string) => defined.has(base) || BUILTIN_BASES.has(base);

  // Merge heritage/members across every declaration of a name (the emitter
  // splits an interface's iterable/maplike section from its main body).
  const heritageOf = new Map<string, Set<string>>();
  const membersOf = new Map<string, { name: string; node: ts.TypeElement }[]>();
  for (const stmt of sf.statements) {
    if (!ts.isInterfaceDeclaration(stmt)) continue;
    const nm = stmt.name.text;
    const h = heritageOf.get(nm) ?? new Set<string>();
    for (const clause of stmt.heritageClauses ?? []) {
      for (const t of clause.types) h.add(baseName(t.getText(sf)));
    }
    heritageOf.set(nm, h);
    const md = membersOf.get(nm) ?? [];
    for (const m of stmt.members) {
      if (m.name && ts.isIdentifier(m.name)) md.push({ name: m.name.text, node: m });
    }
    membersOf.set(nm, md);
  }

  const edits: Edit[] = [];
  const maplike: string[] = [];
  const heritage: string[] = [];

  // Maplike mutator members.
  for (const [nm, h] of heritageOf) {
    const mutators = new Set<string>();
    for (const base of h) for (const m of COLLECTION_MUTATORS[base] ?? []) mutators.add(m);
    if (!mutators.size) continue;
    for (const { name, node } of membersOf.get(nm) ?? []) {
      if (!mutators.has(name)) continue;
      let end = node.getEnd();
      if (text[end] === ";") end++;
      edits.push({ start: node.getFullStart(), end, replacement: "" });
      maplike.push(`${nm}.${name}`);
    }
  }

  // Heritage clauses referencing a base absent from this scope.
  for (const stmt of sf.statements) {
    if (!ts.isInterfaceDeclaration(stmt)) continue;
    for (const clause of stmt.heritageClauses ?? []) {
      const kept = clause.types.filter((t) => resolvable(baseName(t.getText(sf))));
      if (kept.length === clause.types.length) continue;
      for (const t of clause.types) {
        if (!resolvable(baseName(t.getText(sf)))) {
          heritage.push(`${stmt.name.text} extends ${baseName(t.getText(sf))}`);
        }
      }
      const replacement = kept.length
        ? `extends ${kept.map((t) => t.getText(sf)).join(", ")}`
        : "";
      edits.push({ start: clause.getStart(sf), end: clause.getEnd(), replacement });
    }
  }

  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return { text: out, maplike, heritage };
}

for (const scope of scopes) {
  const fullPath = path.join(buildDir, scope.full);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { text, maplike, heritage } = sanitizeLib(raw, fullPath);
  const header =
    `// Generated by modern-web-types — a drop-in replacement for TypeScript's\n` +
    `// ${scope.lib} lib that also includes APIs shipped in a single engine.\n` +
    `// Set "lib" without "${scope.lib}" and reference this file instead.\n\n`;
  const outName = `lib.${scope.lib.toLowerCase()}.d.ts`;
  fs.writeFileSync(path.join(pkgDir, outName), header + text);
  const notes = [
    maplike.length ? `maplike: ${maplike.join(", ")}` : "",
    heritage.length ? `dangling heritage dropped: ${heritage.join(", ")}` : "",
  ].filter(Boolean);
  console.log(`[${scope.name}] wrote ${outName}${notes.length ? ` (${notes.join("; ")})` : ""}`);
}
