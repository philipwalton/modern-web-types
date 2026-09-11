// For each scope with a stock TypeScript lib, diffs its full build against its
// baseline and writes what the one-engine threshold adds to
// build/<scope>.delta.json:
//   - whole new interfaces, type aliases, global vars, and global functions
//   - new members on interfaces both builds declare
//   - new members in namespaces both builds declare
//
// Both files come from the same emitter run against the same data snapshot, so
// declaration text is byte-identical wherever the two agree; a member counts as
// new when its name is absent from the baseline declaration.
//
// The delta names symbols rather than carrying their text: report.md counts and
// lists them, and emit-test.ts turns each one into an assertion that it resolves
// in the shipped lib.
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { buildDir, rootDir, deltaScopes, type Scope } from "./util.ts";

interface DeltaItem {
  kind: "interface" | "alias" | "var" | "function";
  name: string;
  // A generic interface can't be named without type arguments, so the smoke
  // tests reach it a different way.
  generic?: boolean;
}
interface MemberAddition {
  parent: string;
  member: string;
}
interface NamespaceAddition {
  parent: string;
  members: string[];
}

interface InterfaceInfo {
  // An interface name can be declared more than once (the emitter splits the
  // main interface from its iterable/maplike section). Members are merged
  // across every declaration.
  members: Set<string>;
  generic: boolean;
}
interface FileIndex {
  interfaces: Map<string, InterfaceInfo>;
  aliases: Set<string>;
  vars: Set<string>;
  functions: Set<string>;
  namespaces: Map<string, Set<string>>;
}

function memberKey(member: ts.TypeElement): string {
  if (member.name) return member.name.getText();
  if (ts.isConstructSignatureDeclaration(member)) return "new()";
  if (ts.isCallSignatureDeclaration(member)) return "()";
  if (ts.isIndexSignatureDeclaration(member)) return "[index]";
  return `kind:${member.kind}`;
}

// The member identifier a namespace statement declares, e.g.
// "var paintWorklet: Worklet;" -> "paintWorklet".
function namespaceMember(statement: ts.Statement): string | undefined {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations[0].name.getText();
  }
  if (ts.isFunctionDeclaration(statement)) return statement.name?.text;
  return undefined;
}

function indexFile(file: string): FileIndex {
  const text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const index: FileIndex = {
    interfaces: new Map(),
    aliases: new Set(),
    vars: new Set(),
    functions: new Set(),
    namespaces: new Map(),
  };
  for (const stmt of sf.statements) {
    if (ts.isInterfaceDeclaration(stmt)) {
      const info: InterfaceInfo = index.interfaces.get(stmt.name.text) ?? {
        members: new Set(),
        generic: Boolean(stmt.typeParameters?.length),
      };
      for (const m of stmt.members) info.members.add(memberKey(m));
      index.interfaces.set(stmt.name.text, info);
    } else if (ts.isTypeAliasDeclaration(stmt)) {
      index.aliases.add(stmt.name.text);
    } else if (ts.isVariableStatement(stmt)) {
      index.vars.add(stmt.declarationList.declarations[0].name.getText());
    } else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      index.functions.add(stmt.name.text);
    } else if (ts.isModuleDeclaration(stmt)) {
      const members = new Set<string>();
      if (stmt.body && ts.isModuleBlock(stmt.body)) {
        for (const s of stmt.body.statements) {
          const name = namespaceMember(s);
          if (name) members.add(name);
        }
      }
      index.namespaces.set(stmt.name.getText(), members);
    }
  }
  return index;
}

const upstreamSha = JSON.parse(
  fs.readFileSync(path.join(rootDir, "upstream.json"), "utf8"),
).sha;

function computeDelta(scope: Scope) {
  const config = scope.delta!;
  const baseline = indexFile(path.join(buildDir, config.baseline));
  const full = indexFile(path.join(buildDir, scope.full));

  const items: DeltaItem[] = [];
  const memberAdditions: MemberAddition[] = [];
  const namespaceAdditions: NamespaceAddition[] = [];

  for (const [name, iface] of full.interfaces) {
    const base = baseline.interfaces.get(name);
    if (!base) {
      items.push({ kind: "interface", name, generic: iface.generic });
      continue;
    }
    for (const member of iface.members) {
      if (!base.members.has(member)) {
        memberAdditions.push({ parent: name, member });
      }
    }
  }

  for (const name of full.aliases) {
    if (!baseline.aliases.has(name)) items.push({ kind: "alias", name });
  }
  for (const name of full.vars) {
    if (!baseline.vars.has(name)) items.push({ kind: "var", name });
  }
  for (const name of full.functions) {
    if (!baseline.functions.has(name)) items.push({ kind: "function", name });
  }

  for (const [name, members] of full.namespaces) {
    const base = baseline.namespaces.get(name);
    const added = [...members].filter((m) => !base?.has(m));
    if (added.length) namespaceAdditions.push({ parent: name, members: added });
  }

  const delta = {
    meta: {
      scope: scope.name,
      upstreamSha,
      generatedAt: new Date().toISOString(),
    },
    items,
    memberAdditions,
    namespaceAdditions,
  };
  fs.writeFileSync(
    path.join(buildDir, config.delta),
    JSON.stringify(delta, null, 2),
  );

  const count = (kind: string) => items.filter((i) => i.kind === kind).length;
  console.log(
    `[${scope.name}] ` +
      `${count("interface")} interfaces, ` +
      `${count("alias")} aliases, ` +
      `${count("var")} vars, ` +
      `${count("function")} functions, ` +
      `${memberAdditions.length} members on existing interfaces, ` +
      `${namespaceAdditions.length} namespace additions`,
  );
}

for (const scope of deltaScopes) computeDelta(scope);
