import type { DbSummary } from "@mmd-toolkit/tests"
import { restoreStrings } from "./db-restore.ts"

/** The diagram types whose labels the formatter prints with or without quotes. */
export const labelTypeDiagramTypes: ReadonlySet<string> = new Set([
  "agentflow",
  "flowchart-elk",
  "flowchart-v2",
  "swimlane",
])

/** Whether a `labelType` is the one of a label in quotes or without them. */
function isStringOrText(labelType: string): boolean {
  return labelType === "string" || labelType === "text"
}

/**
 * Checks the labels of a formatted diagram even though the formatter wrote a
 * label in quotes or without them. mermaid.js keeps the `labelType` `string`
 * in the Db for a label in quotes and `text` for one without, and its
 * renderers read only whether the `labelType` is `markdown`
 * (docs/compatibility.md, Labels that are drawn the same). A `labelType` that differs
 * from the written one between `string` and `text` is restored from the
 * written Db. Every other difference stays, among them a label that became
 * markdown or stopped being markdown.
 */
export function labelTypeDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
): DbSummary | null {
  if (before === null || after === null) return after
  return restoreStrings(before, after, (written, printed, path) =>
    path.at(-1) === "labelType" &&
    isStringOrText(written) &&
    isStringOrText(printed)
      ? written
      : printed,
  ) as DbSummary
}
