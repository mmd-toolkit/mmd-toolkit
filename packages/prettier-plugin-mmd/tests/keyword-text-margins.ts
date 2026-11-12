import type { DbSummary } from "@mmd-toolkit/tests"
import { restoreStrings } from "./db-restore.ts"
import { withoutBlanks } from "./db-values.ts"

/**
 * The spaces and tabs of a text that mermaid.js keeps in the Db and draws
 * without, and that the formatter leaves out: at both ends, or at the end.
 */
type Ends = "both" | "end"

/**
 * The keys of the Db that hold a text after a keyword, for each diagram type:
 * a title, and the date format and the axis format of a Gantt chart, whose
 * whitespace at both ends the formatter leaves out; the periods and events of a
 * timeline, whose whitespace at the end it leaves out at the end of a line and
 * adds before a colon, and the second description of a state, whose whitespace
 * at the end it leaves out, since the whitespace at their start is the padding
 * that aligns colons or is the text after a separator, and the name of a task
 * of a Gantt chart, whose whitespace at the end the formatter sets so that the
 * colons of the tasks of a section stand in one column. The name of a section is not one: two
 * sections that differ by their whitespace are two sections
 * (docs/compatibility.md, Texts after a keyword that are drawn the same).
 */
const keywordTextKeys: ReadonlyMap<string, ReadonlyMap<string, Ends>> = new Map(
  [
    [
      "gantt",
      new Map<string, Ends>([
        ["axisFormat", "both"],
        ["dateFormat", "both"],
        ["task", "end"],
        ["title", "both"],
      ]),
    ],
    ["journey", new Map<string, Ends>([["title", "both"]])],
    ["sequence", new Map<string, Ends>([["title", "both"]])],
    ["venn", new Map<string, Ends>([["title", "both"]])],
    [
      "timeline",
      new Map<string, Ends>([
        ["events", "end"],
        ["task", "end"],
        ["title", "both"],
      ]),
    ],
    [
      "c4",
      new Map<string, Ends>([
        ["accDescr", "both"],
        ["title", "both"],
      ]),
    ],
    ["stateDiagram", new Map<string, Ends>([["description", "end"]])],
  ],
)

/** The diagram types whose texts after a keyword the formatter trims. */
export const keywordTextDiagramTypes: ReadonlySet<string> = new Set(
  keywordTextKeys.keys(),
)

/** The text without the spaces and tabs at its end. */
function withoutTrailingBlanks(text: string): string {
  let end = text.length
  while (end > 0 && (text[end - 1] === " " || text[end - 1] === "\t")) end--
  return text.slice(0, end)
}

/**
 * Checks the texts after a keyword of a formatted diagram even though the
 * whitespace at their ends changed. mermaid.js reads one whitespace character
 * after the keyword and keeps the rest in the Db, and draws the same text
 * without it (docs/compatibility.md, Texts after a keyword that are drawn the
 * same). A text that differs from the written one only by the spaces and tabs
 * at the ends that the formatter leaves out is restored from the written Db.
 * Every other difference stays.
 */
export function keywordTextDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
  diagramType: string,
): DbSummary | null {
  const keys = keywordTextKeys.get(diagramType)
  if (before === null || after === null || keys === undefined) return after
  return restoreStrings(before, after, (written, printed, path) => {
    const key = path.at(-1)
    const ends = key === undefined ? undefined : keys.get(key)
    if (ends === undefined) return printed
    const same =
      ends === "both"
        ? withoutBlanks(written) === withoutBlanks(printed)
        : withoutTrailingBlanks(written) === withoutTrailingBlanks(printed)
    return same ? written : printed
  }) as DbSummary
}
