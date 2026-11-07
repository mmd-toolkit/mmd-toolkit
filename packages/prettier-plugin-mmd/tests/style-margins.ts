import type { DbSummary, JsonValue } from "@mmd-toolkit/tests"

/** The diagram types whose styles the formatter prints in one form. */
export const styleDiagramTypes: ReadonlySet<string> = new Set([
  "agentflow",
  "block",
  "classDiagram",
  "flowchart-elk",
  "flowchart-v2",
  "stateDiagram",
  "swimlane",
])

/**
 * The text of a style without the whitespace that mermaid.js takes away
 * before it draws the figure: at its ends, and around its first `:`
 * (docs/flowchart.md, Styles).
 */
function withoutStyleMargins(style: string): string {
  const trimmed = style.trim()
  const colon = trimmed.indexOf(":")
  return colon <= 0
    ? trimmed
    : `${trimmed.slice(0, colon).trimEnd()}:${trimmed.slice(colon + 1).trimStart()}`
}

/** Whether a Db key holds the styles of a vertex, a class, or a link. */
function isStyleKey(key: string): boolean {
  return key === "styles" || key === "style"
}

/**
 * Checks the styles of a formatted diagram even though their text changed.
 * The formatter puts no whitespace before the first `:` of a style or before a
 * `,` and one space after them (docs/compatibility.md, Styles that are drawn
 * the same). mermaid.js keeps the whitespace in the Db and takes it away
 * before it draws, so a style whose text differs from the written one only by
 * the whitespace at its ends and around its first `:` is restored from the
 * written Db. Every other difference stays, among them the number of styles
 * (a numbered `linkStyle` gets a `fill:none` where no style starts with
 * `fill`).
 */
export function styleDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
): DbSummary | null {
  if (before === null || after === null) return after
  return restore(before, after, undefined) as DbSummary
}

/** Whether a JSON value is an object. */
function isObject(
  value: JsonValue,
): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Restores the styles of `after` that `before` holds with other margins. */
function restore(
  before: JsonValue,
  after: JsonValue,
  key: string | undefined,
): JsonValue {
  if (Array.isArray(before) && Array.isArray(after)) {
    if (before.length !== after.length) return after
    return after.map((item, index) => {
      const written = before[index]
      return key !== undefined &&
        isStyleKey(key) &&
        typeof item === "string" &&
        typeof written === "string" &&
        withoutStyleMargins(item) === withoutStyleMargins(written)
        ? written
        : restore(written, item, undefined)
    })
  }
  if (isObject(before) && isObject(after)) {
    const written = before
    return Object.fromEntries(
      Object.entries(after).map(([name, value]) => [
        name,
        name in written ? restore(written[name], value, name) : value,
      ]),
    )
  }
  return after
}
