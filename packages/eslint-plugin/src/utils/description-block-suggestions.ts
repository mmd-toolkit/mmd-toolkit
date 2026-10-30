import type { SuggestedEdit } from "@eslint/core"
import type { Node, Token } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { braceLineOf } from "./description-block.ts"
import { removalRange } from "./removal.ts"

/** Whether an unclosed directive starts in the block's authored text. */
function holdsUnclosedDirective(
  sourceCode: MermaidSourceCode,
  start: number,
  end: number,
): boolean {
  return sourceCode.ast.directives.some(
    (directive) =>
      !directive.closed &&
      start <= directive.range[0] &&
      directive.range[0] < end,
  )
}

/** The line terminator at the end of `text`, or the empty string. */
function finalLineTerminator(text: string): string {
  if (text.endsWith("\r\n")) return "\r\n"
  if (text.endsWith("\n")) return "\n"
  if (text.endsWith("\r")) return "\r"
  return ""
}

/** Close at EOF only when a later line holds text and no open directive takes it. */
export function blockClosingSuggestions(
  sourceCode: MermaidSourceCode,
  brace: Token,
  body: readonly Token[],
): SuggestedEdit<"closeAtTextEnd">[] {
  const { text } = sourceCode
  if (
    holdsUnclosedDirective(sourceCode, brace.range[1], text.length) ||
    !braceLineOf(sourceCode, brace, body).textBeyond
  )
    return []
  const terminator = finalLineTerminator(text)
  const closing = terminator === "" ? "\n}" : `}${terminator}`
  return [
    {
      messageId: "closeAtTextEnd",
      fix: (fixer) =>
        fixer.insertTextAfterRange([text.length, text.length], closing),
    },
  ]
}

/**
 * Remove an empty block only when it occupies its lines alone and holds no directive.
 * The caller decides that the block is empty; removing a directive would also
 * remove its settings, and removing whitespace after another token may change
 * the reading of that token.
 */
export function emptyBlockRemovalSuggestions(
  sourceCode: MermaidSourceCode,
  node: Node,
): SuggestedEdit<"removeBlock">[] {
  const range = removalRange(sourceCode, node)
  if (range === null) return []
  return [
    {
      messageId: "removeBlock",
      fix: (fixer) => fixer.removeRange(range),
    },
  ]
}
