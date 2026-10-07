import type { SuggestedEdit } from "@eslint/core"
import type { Node, Range, Token } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"

/**
 * The `;` that ends the text right after `statement`, on its line, or null:
 * mermaid.js ignores that `;`, so it belongs to no other statement and goes
 * with `statement`. A `;` anywhere else stays (see `removalRange`).
 */
function ignoredSemicolonAtEnd(
  sourceCode: MermaidSourceCode,
  statement: Node,
): Token | null {
  const semicolon = sourceCode.getTokenAfter(statement)
  return semicolon?.type === "IgnoredSemicolon" &&
    semicolon.loc.start.line === statement.loc.end.line &&
    sourceCode.getTokenAfter(semicolon, { includeComments: true }) === null
    ? semicolon
    : null
}

/**
 * The range to remove so that `element` goes without leaving blank space. A `;`
 * after the span is never removed: it is the separator of the statement before
 * `element`, or an empty statement of its own, which is a member in a subgraph,
 * and removing it would change what mermaid.js reads. When a token or a comment
 * follows on the last line of the element, the element goes with the whitespace
 * up to that token; otherwise, when one comes before it on its first line, with
 * the whitespace after that token; otherwise the element is alone on its lines,
 * and the lines go with their line terminators. `last` is the last token to
 * remove with `element`, which ends the removed span.
 */
export function removalRange(
  sourceCode: MermaidSourceCode,
  element: Node | Token,
  last: Node | Token = element,
): Range {
  const after = sourceCode.getTokenAfter(last, { includeComments: true })
  if (after !== null && after.loc.start.line === last.loc.end.line) {
    return [element.range[0], after.range[0]]
  }
  const before = sourceCode.getTokenBefore(element, { includeComments: true })
  if (before !== null && before.loc.end.line === element.loc.start.line) {
    return [before.range[1], last.range[1]]
  }
  const firstLine = element.loc.start.line
  const lastLine = last.loc.end.line
  if (lastLine < sourceCode.lines.length) {
    return [
      sourceCode.getIndexFromLoc({ line: firstLine, column: 0 }),
      sourceCode.getIndexFromLoc({ line: lastLine + 1, column: 0 }),
    ]
  }
  // The last lines of the text: they go with the line terminator before them.
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
 * The suggestions for a statement `node` that sets again what `previous` set,
 * where mermaid.js uses the value that remains last: remove the one or the
 * other. Which one the author means to keep is the author's choice. The
 * message of `removePrevious` takes the line of `previous` as `{{line}}`.
 */
export function oneOfTwoRemovals(
  sourceCode: MermaidSourceCode,
  node: Node,
  previous: Node,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const thisRange = removalRange(
    sourceCode,
    node,
    ignoredSemicolonAtEnd(sourceCode, node) ?? node,
  )
  const previousRange = removalRange(
    sourceCode,
    previous,
    ignoredSemicolonAtEnd(sourceCode, previous) ?? previous,
  )
  return [
    {
      messageId: "removeThis",
      fix: (fixer) => fixer.removeRange(thisRange),
    },
    {
      messageId: "removePrevious",
      data: { line: String(previous.loc.start.line) },
      fix: (fixer) => fixer.removeRange(previousRange),
    },
  ]
}
