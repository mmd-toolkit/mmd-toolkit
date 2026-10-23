import type { BlockLiteral } from "@mmd-toolkit/parser"

/** Whether the id keeps whitespace after the comma before it. */
export function hasLeadingWhitespace(id: BlockLiteral): boolean {
  return id.value !== id.value.trimStart()
}
