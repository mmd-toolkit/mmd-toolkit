import type { QuadrantNode } from "../ast/quadrant.ts"

/**
 * ast/quadrant.md: the child fields of each quadrant chart node type, as
 * each node's section states them, in the order in which a walk visits
 * them.
 */
export const quadrantVisitorKeys: Readonly<
  Record<QuadrantNode["type"], readonly string[]>
> = {
  QuadrantDiagram: ["body"],
  QuadrantTitleStatement: ["value"],
  QuadrantAccTitleStatement: ["value"],
  QuadrantAccDescrStatement: ["value"],
  QuadrantAccDescrBlockStatement: ["value"],
  QuadrantAxisStatement: ["start", "end"],
  QuadrantQuadrantStatement: ["text"],
  QuadrantPointStatement: ["name", "className", "x", "y", "styles"],
  QuadrantClassDefStatement: ["name", "styles"],
  QuadrantLabel: [],
  QuadrantLiteral: [],
  QuadrantIdentifier: [],
}
