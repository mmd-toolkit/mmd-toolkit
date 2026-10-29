import { canEditRange } from "./edit-range.ts"
import { canCompactRange } from "./compact-range.ts"
import type { Node, Range } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"

/** Remove one comma-delimited part with the separator on its side of the gap. */
export function commaRemovalRange(
  sourceCode: MermaidSourceCode,
  part: Node,
  parts: readonly Node[],
): Range | null {
  const index = parts.indexOf(part)
  if (index < 0 || parts.length < 2) return null
  const left = index === 0 ? part : parts[index - 1]
  const right = index === 0 ? parts[1] : part
  const comma = sourceCode
    .getTokensBetween(left, right)
    .find((token) => token.type === "Punctuator" && token.value === ",")
  if (comma === undefined) return null
  const range: Range =
    index === 0
      ? [part.range[0], comma.range[1]]
      : [comma.range[0], part.range[1]]
  return canEditRange(sourceCode, range) && canCompactRange(sourceCode, range)
    ? range
    : null
}
