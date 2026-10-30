import type { Range } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"

/**
 * Compact across line terminators only without comments in the range and with
 * whitespace-only interior lines. Otherwise joining the edge lines can make a
 * comment swallow text or move an intervening statement into the value.
 */
export function canCompactRange(
  sourceCode: MermaidSourceCode,
  range: Range,
): boolean {
  const first = sourceCode.getLocFromIndex(range[0]).line
  const last = sourceCode.getLocFromIndex(range[1]).line
  if (first === last) return true
  if (
    sourceCode.ast.comments.some(
      (comment) => comment.range[0] <= range[1] && range[0] < comment.range[1],
    )
  )
    return false
  for (let line = first + 1; line < last; line++) {
    if (sourceCode.lines[line - 1].trim() !== "") return false
  }
  return true
}
