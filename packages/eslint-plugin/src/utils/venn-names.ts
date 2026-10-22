import type { Identifier, StringLiteral } from "@mmd-toolkit/parser"
import { normalizeLineTerminators } from "./acc-text.ts"

/** A written Venn name, without quotes and with normalized line terminators. */
export function vennName(node: Identifier | StringLiteral): string {
  return normalizeLineTerminators(
    node.type === "Identifier" ? node.name : node.value,
  )
}

/** An order-independent name list that retains repeats and cannot join names. */
export function vennRegionKey(
  names: readonly (Identifier | StringLiteral)[],
): string {
  return JSON.stringify(names.map(vennName).sort())
}
