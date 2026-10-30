import type { Range } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"

/** Replacing or removing a range must not take any part of a directive with it. */
export function canEditRange(
  sourceCode: MermaidSourceCode,
  range: Range,
): boolean {
  return (
    range[0] === range[1] ||
    !sourceCode.ast.directives.some(
      (directive) =>
        directive.range[0] < range[1] && range[0] < directive.range[1],
    )
  )
}
