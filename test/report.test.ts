import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { Delta } from "../scripts/util.ts";

test("reports namespace member counts and details separately for each scope", (t) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "report-"));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  // The report resolves its inputs relative to util.ts. Copy both scripts so
  // this test needs no generated build and cannot overwrite the real report.
  fs.mkdirSync(path.join(cwd, "scripts"));
  fs.mkdirSync(path.join(cwd, "build"));
  fs.writeFileSync(path.join(cwd, "package.json"), '{"type":"module"}');
  for (const file of ["report.ts", "util.ts"]) {
    fs.copyFileSync(
      new URL(`../scripts/${file}`, import.meta.url),
      path.join(cwd, "scripts", file),
    );
  }
  for (const scope of ["dom", "webworker"]) {
    const delta: Delta = {
      meta: {
        scope,
        upstreamSha: "0123456789abcdef",
        generatedAt: "2026-09-23T00:00:00.000Z",
      },
      symbols: scope === "dom" ? [
        { kind: "namespace-member", parent: "Example", member: "value" },
        { kind: "namespace-member", parent: "CSS", member: "paintWorklet" },
        { kind: "namespace-member", parent: "CSS", member: "example" },
        { kind: "member", parent: "Document", member: "example" },
      ] : [],
    };
    fs.writeFileSync(path.join(cwd, "build", `${scope}.delta.json`), JSON.stringify(delta));
  }

  execFileSync(process.execPath, [path.join(cwd, "scripts/report.ts")], { cwd });
  const report = fs.readFileSync(path.join(cwd, "report.md"), "utf8");
  const dom = report.split("## dom scope (lib `DOM`)\n")[1]
    ?.split("## webworker scope (lib `WebWorker`)\n")[0];
  const worker = report.split("## webworker scope (lib `WebWorker`)\n")[1];
  assert.ok(dom, "DOM report section is present");
  assert.ok(worker, "WebWorker report section is present");
  assert.ok(dom.includes("| Members added to existing namespaces | 3 |"));
  assert.ok(dom.includes("| Members added to existing interfaces | 1 |"));
  assert.ok(dom.includes([
    "### 3 members added to 2 existing namespaces",
    "",
    "- `CSS.example`",
    "- `CSS.paintWorklet`",
    "- `Example.value`",
  ].join("\n")));
  assert.ok(worker.includes("| Members added to existing namespaces | 0 |"));
  assert.doesNotMatch(worker, /### .*existing namespaces/);
  assert.doesNotMatch(worker, /CSS\.paintWorklet/);
});
