// Emits what the package ships: each environment's complete one-engine lib
// (build/<env>.full) as a drop-in replacement for the corresponding built-in —
// lib.dom / lib.webworker — or, for the standalone worker variants, for the
// matching @types/* package. A consumer drops the
// built-in from `compilerOptions.lib` and references pkg/lib.<env>.d.ts, so
// nothing merges into (and nothing can conflict with) their lib, and the result
// doesn't depend on how new their TypeScript's lib is.
//
// Three transforms make the raw emitter output valid as a standalone lib:
//   - type-only dependency retention: an interface may reference a type not
//     exposed in this environment (a worker's `ManagedMediaSource extends
//     MediaSource`, where MediaSource is Window-only). That type and its
//     transitive dependencies are pulled from the DOM lib and re-emitted here
//     as type-only declarations — the interface without its `declare var`
//     global constructor — so the reference resolves without exposing a
//     constructor that doesn't exist in this scope.
//   - maplike fix: a few single-engine interfaces `extends Map`/`Set` and
//     redeclare a mutator with a non-`this` return (CSSFontFeatureValuesMap's
//     `set(): void`); those members are stripped so the mutator is inherited.
//   - heritage fallback: if a base still can't be resolved (not even in the DOM
//     lib), the dangling `extends` is dropped.
// Everything else is copied verbatim, including the leading `/// <reference
// lib=... />` lines.
//
// The lib is then extended with the performance entry type lookup maps
// (scripts/entry-types.ts), covering every registered entry type whose
// interface this environment declares.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { buildDir, pkgDir, scopes, libFile, type Scope } from "./util.ts";
import {
  mapDeclarations,
  overloadDeclarations,
  resolvableIn,
} from "./entry-types.ts";

const COLLECTION_MUTATORS: Record<string, string[]> = {
  Map: ["set", "delete", "clear"],
  Set: ["add", "delete", "clear"],
  WeakMap: ["set", "delete"],
  WeakSet: ["add", "delete"],
};
// ECMAScript / TypeScript lib types the DOM types reference that resolve from a
// consumer's ES lib — never pulled or stripped.
const BUILTINS = new Set([
  // collections & iteration
  "Map", "ReadonlyMap", "Set", "ReadonlySet", "WeakMap", "WeakSet", "WeakRef",
  "Array", "ReadonlyArray", "Iterable", "IterableIterator", "Iterator",
  "IteratorObject", "AsyncIterable", "AsyncIterableIterator", "AsyncIterator",
  "AsyncIteratorObject", "ArrayIterator", "Generator", "AsyncGenerator",
  "BuiltinIteratorReturn",
  // promises
  "Promise", "PromiseLike", "Awaited",
  // buffers & typed arrays
  "ArrayBuffer", "ArrayBufferLike", "ArrayBufferView", "SharedArrayBuffer",
  "DataView", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array",
  "Uint16Array", "Int32Array", "Uint32Array", "Float16Array", "Float32Array",
  "Float64Array", "BigInt64Array", "BigUint64Array", "TypedArray",
  // utility types & core objects
  "Record", "Partial", "Required", "Readonly", "Pick", "Omit", "Exclude",
  "Extract", "NonNullable", "Parameters", "ReturnType", "Function", "Object",
  "Error", "Date", "RegExp",
]);
const baseName = (heritage: string) => heritage.replace(/<.*/, "").trim();

function entityName(n: ts.EntityName): string {
  return ts.isIdentifier(n) ? n.text : entityName(n.left);
}

// The genuine, undefined type names referenced within a subtree: type
// references and heritage minus the subtree's own generic type parameters and
// the builtins.
function collectTypeRefs(node: ts.Node): Set<string> {
  const typeParams = new Set<string>();
  const raw = new Set<string>();
  const visit = (n: ts.Node) => {
    const tp = (n as any).typeParameters as
      | ts.NodeArray<ts.TypeParameterDeclaration>
      | undefined;
    if (tp) for (const p of tp) typeParams.add(p.name.text);
    if (ts.isTypeReferenceNode(n)) raw.add(entityName(n.typeName));
    else if (ts.isExpressionWithTypeArguments(n) && ts.isIdentifier(n.expression)) {
      raw.add(n.expression.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return new Set([...raw].filter((r) => !typeParams.has(r) && !BUILTINS.has(r)));
}

// Every type name a subtree defines, including inside namespace blocks.
function collectDefined(node: ts.Node, out: Set<string>): void {
  if (
    (ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isEnumDeclaration(node) ||
      ts.isModuleDeclaration(node)) &&
    node.name &&
    ts.isIdentifier(node.name)
  ) {
    out.add(node.name.text);
  }
  ts.forEachChild(node, (c) => collectDefined(c, out));
}

// A file's type-name analysis: the names it defines and the (genuine) names it
// references.
function analyze(sf: ts.SourceFile): { defined: Set<string>; refs: Set<string> } {
  const defined = new Set<string>();
  const refs = new Set<string>();
  for (const stmt of sf.statements) {
    collectDefined(stmt, defined);
    for (const r of collectTypeRefs(stmt)) refs.add(r);
  }
  return { defined, refs };
}

// Index the DOM lib as the donor of type-only declarations: each type name to
// its declaration text(s) (interface/type/enum only — never `declare var`) and
// the names those declarations reference.
interface DonorType {
  texts: string[];
  refs: Set<string>;
}
function buildDonor(domFull: string): Map<string, DonorType> {
  const sf = ts.createSourceFile("dom", domFull, ts.ScriptTarget.Latest, true);
  const donor = new Map<string, DonorType>();
  for (const stmt of sf.statements) {
    if (
      !(
        ts.isInterfaceDeclaration(stmt) ||
        ts.isTypeAliasDeclaration(stmt) ||
        ts.isEnumDeclaration(stmt)
      ) ||
      !stmt.name
    ) {
      continue;
    }
    const nm = stmt.name.text;
    const entry = donor.get(nm) ?? { texts: [], refs: new Set<string>() };
    entry.texts.push(stmt.getFullText(sf).replace(/^\s*\n/, "").replace(/\s+$/, ""));
    for (const r of collectTypeRefs(stmt)) entry.refs.add(r);
    donor.set(nm, entry);
  }
  return donor;
}

// Pull the transitive closure of type-only declarations needed to resolve a
// scope's unresolved references from the donor.
function pullTypeOnly(
  refs: Set<string>,
  defined: Set<string>,
  donor: Map<string, DonorType>,
): { texts: string[]; names: Set<string>; missing: Set<string> } {
  const pulled = new Set<string>();
  const texts: string[] = [];
  const missing = new Set<string>();
  const resolved = (n: string) => defined.has(n) || pulled.has(n) || BUILTINS.has(n);
  const queue = [...refs].filter((n) => !resolved(n));
  while (queue.length) {
    const name = queue.shift()!;
    if (resolved(name)) continue;
    const donorType = donor.get(name);
    if (!donorType) {
      missing.add(name);
      continue;
    }
    pulled.add(name);
    texts.push(...donorType.texts);
    for (const r of donorType.refs) if (!resolved(r)) queue.push(r);
  }
  return { texts, names: pulled, missing };
}

// Strip maplike mutators and any heritage base still unresolved after pulling.
function sanitize(text: string): string {
  const sf = ts.createSourceFile("lib", text, ts.ScriptTarget.Latest, true);
  const defined = new Set<string>();
  for (const stmt of sf.statements) collectDefined(stmt, defined);
  const resolvable = (b: string) => defined.has(b) || BUILTINS.has(b);

  // Merge heritage/members across every declaration of a name.
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

  const edits: { start: number; end: number; replacement: string }[] = [];
  for (const [nm, h] of heritageOf) {
    const mutators = new Set<string>();
    for (const base of h) for (const m of COLLECTION_MUTATORS[base] ?? []) mutators.add(m);
    if (!mutators.size) continue;
    for (const { name, node } of membersOf.get(nm) ?? []) {
      if (!mutators.has(name)) continue;
      let end = node.getEnd();
      if (text[end] === ";") end++;
      edits.push({ start: node.getFullStart(), end, replacement: "" });
    }
  }
  for (const stmt of sf.statements) {
    if (!ts.isInterfaceDeclaration(stmt)) continue;
    for (const clause of stmt.heritageClauses ?? []) {
      const kept = clause.types.filter((t) => resolvable(baseName(t.getText(sf))));
      if (kept.length === clause.types.length) continue;
      edits.push({
        start: clause.getStart(sf),
        end: clause.getEnd(),
        replacement: kept.length ? `extends ${kept.map((t) => t.getText(sf)).join(", ")}` : "",
      });
    }
  }

  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return out;
}

const domScope = scopes.find((s) => s.name === "dom")!;
const donor = buildDonor(fs.readFileSync(path.join(buildDir, domScope.full), "utf8"));

for (const scope of scopes) {
  const raw = fs.readFileSync(path.join(buildDir, scope.full), "utf8");
  const sf = ts.createSourceFile(scope.name, raw, ts.ScriptTarget.Latest, true);
  const { defined, refs } = analyze(sf);

  const { texts, names, missing } = pullTypeOnly(refs, defined, donor);
  const supporting = texts.length
    ? `\n\n/////////////////////////////\n` +
      `/// Supporting types (from lib.dom, type-only)\n` +
      `/////////////////////////////\n\n` +
      texts.join("\n\n") +
      "\n"
    : "";

  const header =
    `// Generated by modern-web-types — a drop-in replacement for TypeScript's\n` +
    `// ${scope.lib} lib that also includes APIs shipped in a single engine.\n` +
    `// Set "lib" without "${scope.lib}" and reference this file instead.\n\n`;
  const outName = libFile(scope);
  // Pulled type-only deps are declared in the output too, so an entry type can
  // resolve through one.
  const declared = new Set([...defined, ...names]);
  const rows = resolvableIn(declared);
  const overloads = overloadDeclarations(declared);
  const lookups = overloads.length
    ? `\n\n/////////////////////////////\n` +
      `/// Performance entry type lookups\n` +
      `/////////////////////////////\n\n` +
      [mapDeclarations(rows), ...overloads].join("\n\n") +
      "\n"
    : "";
  fs.writeFileSync(
    path.join(pkgDir, outName),
    header + sanitize(raw + supporting) + lookups,
  );

  const notes = [
    names.size ? `${names.size} type-only deps pulled` : "",
    rows.length ? `${rows.length} entry types mapped` : "",
    missing.size ? `${missing.size} unresolved (dropped): ${[...missing].join(", ")}` : "",
  ].filter(Boolean);
  console.log(`[${scope.name}] wrote ${outName}${notes.length ? ` (${notes.join("; ")})` : ""}`);
}
