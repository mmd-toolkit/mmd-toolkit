import type { Node, Range } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"

/** Remove a whitespace-delimited part with the ASCII spaces and tabs before it. */
export function whitespacePartRange(
  sourceCode: MermaidSourceCode,
  node: Node,
): Range {
  let start = node.range[0]
  while (
    start > 0 &&
    (sourceCode.text[start - 1] === " " || sourceCode.text[start - 1] === "\t")
  )
    start--
  return [start, node.range[1]]
}
