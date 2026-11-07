import type { DbSummary } from "@mmd-toolkit/tests"
import { restoreStrings } from "./db-restore.ts"

/** The diagram types whose texts after a keyword the formatter trims. */
export const keywordTextDiagramTypes: ReadonlySet<string> = new Set([
  "gantt",
  "journey",
  "sequence",
  "timeline",
  "venn",
])

/**
 * The keys of the Db that hold the text after a keyword: a title, and the date
 * format and the axis format of a Gantt chart. The name of a section is not
 * one: two sections that differ by their leading whitespace are two sections
 * (docs/compatibility.md, Texts after a keyword that are drawn the same).
 */
const keywordTextKeys: ReadonlySet<string> = new Set([
  "axisFormat",
  "dateFormat",
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
  return restoreStrings(before, after, (written, printed, path) => {
    const key = path.at(-1)
    return key !== undefined &&
      keywordTextKeys.has(key) &&
      withoutLeadingBlanks(written) === withoutLeadingBlanks(printed)
      ? written
      : printed
  }) as DbSummary
}
