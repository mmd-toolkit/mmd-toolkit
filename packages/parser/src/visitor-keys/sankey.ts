import type { SankeyNode } from "../ast/sankey.ts"

/**
 * ast/sankey.md: the child fields of each sankey node type, as each node's
 * section states them, in the order in which a walk visits them.
 */
export const sankeyVisitorKeys: Readonly<
  Record<SankeyNode["type"], readonly string[]>
> = {
  SankeyDiagram: ["body"],
  SankeyLinkStatement: ["source", "target", "value"],
  SankeyIdentifier: [],
  SankeyLiteral: [],
}
