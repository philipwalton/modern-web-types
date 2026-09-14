import assert from "node:assert/strict";
import test from "node:test";
import { parseRegistry } from "../scripts/parse-registry.ts";

const mark = `<tr>
  <td><code>"mark"</code></td>
  <td>{{PerformanceMark}}</td>
  <td><code>True</code></td>
</tr>`;

test("parses every row, including attributes, comments, and multiple IDL links", () => {
  assert.deepEqual(parseRegistry(`<tbody class="registry">
    ${mark}
    <!-- <tr>Commented-out rows are not entries.</tr> -->
    <tr class="observer-only">
      <td class="name"><code class="literal">&quot;example&quot;</code></td>
      <td>{{PerformanceEventTiming|event}} or {{PerformanceMark/startTime}}</td>
      <td><code>False</code></td>
      <td>Additional registry columns</td>
    </tr>
  </tbody>`), [
    { type: "mark", interfaces: ["PerformanceMark"], availableFromTimeline: true },
    {
      type: "example",
      interfaces: ["PerformanceEventTiming", "PerformanceMark"],
      availableFromTimeline: false,
    },
  ]);
});

for (const [name, row, error] of [
  ["missing row closing tag", mark.replace("</tr>", ""), /Malformed registry <tr>/],
  ["missing cell closing tag", mark.replace("</td>", ""), /Malformed registry <td>/],
  ["missing cells", "<tr><td>incomplete</td></tr>", /row has 1 cells/],
  ["missing identifier", mark.replace('"mark"', ""), /No entryType/],
  ["missing interface", mark.replace("{{PerformanceMark}}", "PerformanceMark"), /invalid interface/],
  ["empty interface name", mark.replace("{{PerformanceMark}}", "{{ |label}}"), /invalid interface/],
  ["invalid boolean", mark.replace("True", "Maybe"), /availableFromTimeline/],
] as const) {
  test(`rejects ${name} even alongside a valid row`, () => {
    assert.throws(() => parseRegistry(`<tbody>${mark}${row}${mark}</tbody>`), error);
  });
}

test("rejects missing and empty tables", () => {
  assert.throws(() => parseRegistry(""), /No <tbody>/);
  assert.throws(() => parseRegistry("<tbody></tbody>"), /zero rows/);
});
