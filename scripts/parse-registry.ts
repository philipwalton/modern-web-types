// The Bikeshed registry uses an HTML table with explicit closing tags. Accept
// attributes, but reject unconsumed markup so malformed rows cannot disappear.
function elements(source: string, tag: "tr" | "td"): string[] {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}\\s*>`, "gi");
  const malformed = (markup: string) =>
    new Error(`Malformed registry <${tag}> markup:\n${markup.trim().slice(0, 500)}`);
  const values: string[] = [];
  let end = 0;
  for (const match of source.matchAll(pattern)) {
    const between = source.slice(end, match.index);
    if (between.trim()) throw malformed(between);
    if (new RegExp(`<\\/?${tag}\\b`, "i").test(match[1])) throw malformed(match[0]);
    values.push(match[1]);
    end = match.index + match[0].length;
  }
  if (source.slice(end).trim()) throw malformed(source.slice(end));
  return values;
}

const codes = (cell: string): string[] =>
  [...cell.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code\s*>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').trim(),
  );

// Bikeshed IDL autolinks may include a member or a custom display label.
const idlLinks = (cell: string): string[] =>
  [...cell.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1].split(/[/|]/)[0].trim());

export function parseRegistry(source: string) {
  const bs = source.replace(/<!--[\s\S]*?-->/g, "");
  const tbody = bs.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody\s*>/i)?.[1];
  if (tbody === undefined) {
    throw new Error("No <tbody> in the registry — has its markup changed?");
  }

  const entryTypes = elements(tbody, "tr").map((row) => {
    const cells = elements(row, "td");
    if (cells.length < 3) throw new Error(`Registry row has ${cells.length} cells:\n${row}`);

    const type = codes(cells[0])[0]?.replace(/^"(.*)"$/, "$1");
    const interfaces = idlLinks(cells[1]);
    const available = codes(cells[2])[0];
    if (!type) throw new Error(`No entryType identifier in row:\n${row}`);
    if (!interfaces.length || interfaces.some((name) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name))) {
      throw new Error(`Missing or invalid interface for "${type}"`);
    }
    if (available !== "True" && available !== "False") {
      throw new Error(`availableFromTimeline for "${type}" is ${available}`);
    }
    return { type, interfaces, availableFromTimeline: available === "True" };
  });

  if (!entryTypes.length) throw new Error("Registry table parsed to zero rows.");
  return entryTypes;
}
