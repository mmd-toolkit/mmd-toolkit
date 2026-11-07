import type { DbSummary, JsonValue } from "@mmd-toolkit/tests"

/** The diagram types whose texts after a keyword the formatter trims. */
export const keywordTextDiagramTypes: ReadonlySet<string> = new Set([
  "gantt",
  "journey",
  "sequence",
  "timeline",
  "venn",
])

/**
 * The keys of the Db that hold the text after a keyword: a title, the name of
 * a section (`sections` holds them all, and a task holds its own), and the
 * date format and the axis format of a Gantt chart.
 */
const keywordTextKeys: ReadonlySet<string> = new Set([
  "axisFormat",
  "dateFormat",
  "section",
  "sections",
  "title",
])

/** The text without the spaces and tabs at its start. */
function withoutLeadingBlanks(text: string): string {
  let start = 0
  while (text[start] === " " || text[start] === "\t") start++
  return text.slice(start)
}

/**
 * Checks the texts after a keyword of a formatted diagram even though the
 * whitespace at their start changed. mermaid.js reads one whitespace character
 * after the keyword and keeps the rest in the Db, and draws the same text
 * without it (docs/compatibility.md, Texts after a keyword that are drawn the
 * same). A text that differs from the written one only by the spaces and tabs
 * at its start is restored from the written Db. Every other difference stays.
 */
export function keywordTextDbForFormattingComparison(
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

/** Restores the texts of `after` that `before` holds with other leading blanks. */
function restore(
  before: JsonValue,
  after: JsonValue,
  key: string | undefined,
): JsonValue {
  if (typeof before === "string" && typeof after === "string") {
    return key !== undefined &&
      keywordTextKeys.has(key) &&
      withoutLeadingBlanks(before) === withoutLeadingBlanks(after)
      ? before
      : after
  }
  if (Array.isArray(before) && Array.isArray(after)) {
    if (before.length !== after.length) return after
    return after.map((item, index) => restore(before[index], item, key))
  }
  if (isObject(before) && isObject(after)) {
    return Object.fromEntries(
      Object.entries(after).map(([name, value]) => [
        name,
        name in before ? restore(before[name], value, name) : value,
      ]),
    )
  }
  return after
}
