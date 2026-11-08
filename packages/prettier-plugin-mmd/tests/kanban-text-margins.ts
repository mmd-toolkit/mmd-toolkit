import type { DbSummary } from "@mmd-toolkit/tests"
import { objectOf, withoutBlanks } from "./db-values.ts"

/** The diagram types whose card texts the formatter prints without padding. */
export const kanbanTextDiagramTypes: ReadonlySet<string> = new Set(["kanban"])

/**
 * Checks the texts of the nodes of a formatted kanban board even though the
 * spaces and tabs at their ends changed. mermaid.js keeps them in the Db and
 * draws the same node without them (docs/compatibility.md, Mindmap texts that
 * are drawn the same). The label and the icon of a node and the id of a card
 * that differ from the written text only by the spaces and tabs at their ends
 * are restored from the written Db. The id of a column is not: mermaid.js tells
 * two columns apart by it. Every other difference stays.
 */
export function kanbanDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
): DbSummary | null {
  if (before === null || after === null) return after
  const written = before.nodes
  const printed = after.nodes
  if (!Array.isArray(written) || !Array.isArray(printed)) return after
  if (written.length !== printed.length) return after
  return {
    ...after,
    nodes: printed.map((node, index) => {
      const printedNode = objectOf(node)
      const writtenNode = objectOf(written[index])
      if (printedNode === undefined || writtenNode === undefined) return node
      const keys =
        printedNode.isGroup === true
          ? ["label", "icon"]
          : ["id", "label", "icon"]
      const restored = { ...printedNode }
      for (const key of keys) {
        const writtenText = writtenNode[key]
        const printedText = printedNode[key]
        if (
          typeof writtenText === "string" &&
          typeof printedText === "string" &&
          withoutBlanks(writtenText) === withoutBlanks(printedText)
        )
          restored[key] = writtenText
      }
      return restored
    }),
  }
}
