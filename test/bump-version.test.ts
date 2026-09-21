import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("../scripts/bump-version.ts", import.meta.url));

for (const scenario of [
  { name: "no changes", expected: "0.5.3" },
  { name: "metadata only", metadata: true, expected: "0.5.3" },
  { name: "edited declarations", change: "edit", expected: "0.6.0" },
  { name: "added declarations", change: "add", expected: "0.6.0" },
  { name: "deleted declarations", change: "delete", expected: "0.6.0" },
  { name: "staged declarations", change: "stage", expected: "0.6.0" },
  { name: "existing minor bump", change: "edit", previous: "0.6.0", expected: "0.6.0" },
  { name: "reviewer patch bump", change: "edit", previous: "0.5.4", expected: "0.5.4" },
  { name: "reviewer major bump", change: "edit", previous: "1.0.0", expected: "1.0.0" },
  { name: "stale PR version", change: "edit", previous: "0.5.2", expected: "0.6.0" },
  { name: "already merged PR version", change: "edit", previous: "0.5.3", expected: "0.6.0" },
  { name: "PR changes disappeared", previous: "0.6.0", expected: "0.5.3" },
  { name: "local version adjustment", change: "edit", local: "0.5.4", expected: "0.5.4" },
]) {
  test(scenario.name, (t) => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "bump-version-"));
    t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
    const git = (...args: string[]) => execFileSync("git", args, { cwd, stdio: "pipe" });
    const write = (file: string, value: string) => fs.writeFileSync(path.join(cwd, file), value);
    const manifest = "pkg/package.json";
    const setVersion = (version: string) => write(manifest, JSON.stringify({ version }));
    git("init", "-b", "main");
    git("config", "user.name", "Test");
    git("config", "user.email", "test@example.com");
    git("config", "commit.gpgsign", "false");
    fs.mkdirSync(path.join(cwd, "pkg"));
    setVersion("0.5.3");
    write("pkg/lib.dom.d.ts", "interface Example {}\n");
    git("add", ".");
    git("commit", "-m", "Base");
    if (scenario.previous) {
      git("checkout", "-b", "previous");
      setVersion(scenario.previous);
      git("commit", "-am", "PR version", "--allow-empty");
      git("checkout", "main");
    }
    if (scenario.metadata) write("report.md", "Updated report\n");
    if (scenario.local) setVersion(scenario.local);
    if (scenario.change === "add") write("pkg/lib.worker.d.ts", "interface Worker {}\n");
    else if (scenario.change === "delete") fs.unlinkSync(path.join(cwd, "pkg/lib.dom.d.ts"));
    else if (scenario.change) write("pkg/lib.dom.d.ts", "interface Updated {}\n");
    if (scenario.change === "stage") git("add", ".");
    // Running twice must not compound the bump.
    for (let i = 0; i < 2; i++) {
      execFileSync(process.execPath, [script, ...(scenario.previous ? ["previous"] : [])], { cwd });
      assert.equal(JSON.parse(fs.readFileSync(path.join(cwd, manifest), "utf8")).version, scenario.expected);
    }
  });
}
