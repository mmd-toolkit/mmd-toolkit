import type { DbSummary } from "@mmd-toolkit/tests"
import { restoreStrings } from "./db-restore.ts"
import { withoutBlanks } from "./db-values.ts"

/** The diagram types whose node texts the formatter prints without padding. */
export const mindmapTextDiagramTypes: ReadonlySet<string> = new Set(["mindmap"])

/**
 * The keys of the Db that hold the texts of a node: its text, the text of its
 * shape, its icon, and its class.
 */
const mindmapTextKeys: ReadonlySet<string> = new Set([
  "class",
  "descr",
  "icon",
  "nodeId",
])

/**
 * Checks the texts of the nodes of a formatted mindmap even though the spaces
 * and tabs at their ends changed. mermaid.js keeps them in the Db and draws the
 * same node without them (docs/compatibility.md, Mindmap texts that are drawn
 * the same). A text that differs from the written one only by the spaces and
 * tabs at its ends is restored from the written Db. Every other difference
 * stays, among them a text that became a string.
 */
export function mindmapDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
): DbSummary | null {
  if (before === null || after === null) return after
  return restoreStrings(before, after, (written, printed, path) => {
    const key = path.at(-1)
    return key !== undefined &&
      mindmapTextKeys.has(key) &&
      withoutBlanks(written) === withoutBlanks(printed)
      ? written
      : printed
  }) as DbSummary
}
