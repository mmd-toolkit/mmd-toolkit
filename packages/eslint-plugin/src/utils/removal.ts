import { canEditRange } from "./edit-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { Node, Range, Token } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"

/**
 * The complete lines of an element that occupies them alone, including their
 * line terminators, or null if text or a comment shares either edge line.
 * At the end of the text, remove the preceding line terminator instead.
 */
export function removalRange(
  sourceCode: MermaidSourceCode,
  element: Node | Token,
): Range | null {
  if (!canEditRange(sourceCode, element.range)) return null
  const firstLine = element.loc.start.line
  const lastLine = element.loc.end.line
  const start = sourceCode.getIndexFromLoc({ line: firstLine, column: 0 })
  const after = sourceCode.lines[lastLine - 1] ?? ""
  if (
    sourceCode.text.slice(start, element.range[0]).trim() !== "" ||
    after.slice(element.loc.end.column).trim() !== ""
  ) {
    return null
  }
  if (lastLine < sourceCode.lines.length) {
    return [
      start,
      sourceCode.getIndexFromLoc({ line: lastLine + 1, column: 0 }),
    ]
  }
  if (firstLine === 1) return [0, sourceCode.text.length]
  const previousLine = sourceCode.lines[firstLine - 2] ?? ""
  return [
    sourceCode.getIndexFromLoc({
      line: firstLine - 1,
      column: previousLine.length,
    }),
    sourceCode.text.length,
  ]
}

/**
 * Remove either of two setters on lines of their own. `canRemovePrevious`
 * says whether removing the earlier setter also removes this report.
 * `statementNames` supplies message data for rules with two kinds of title.
 */
export function oneOfTwoRemovals(
  sourceCode: MermaidSourceCode,
  node: Node,
  previous: Node,
  canRemovePrevious: boolean,
  statementNames?: { readonly current: string; readonly previous: string },
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const suggestions: SuggestedEdit<"removeThis" | "removePrevious">[] = []
  const choices: {
    node: Node
    messageId: "removeThis" | "removePrevious"
    statement: string | undefined
  }[] = [{ node, messageId: "removeThis", statement: statementNames?.current }]
  if (canRemovePrevious) {
    choices.push({
      node: previous,
      messageId: "removePrevious",
      statement: statementNames?.previous,
    })
  }
  for (const choice of choices) {
    const range = removalRange(sourceCode, choice.node)
    if (range === null) continue

    suggestions.push({
      messageId: choice.messageId,
      data:
        choice.statement === undefined
          ? undefined
          : { statement: choice.statement },
      fix: (fixer) => fixer.removeRange(range),
    })
  }
  return suggestions
}
