import type { UsecaseAccDescrBlockStatement } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { blockHoldsComment } from "./description-block.ts"

/** A closed block with neither description text nor a comment to fill in later. */
export function isEmptyUsecaseDescriptionBlock(
  sourceCode: MermaidSourceCode,
  node: UsecaseAccDescrBlockStatement,
): boolean {
  return (
    (node.value?.value ?? "").trim() === "" &&
    !blockHoldsComment(sourceCode, node)
  )
}
