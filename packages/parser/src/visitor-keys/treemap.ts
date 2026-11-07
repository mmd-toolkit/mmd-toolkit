import type { TreemapNode } from "@mmd-toolkit/ast"

/** ast/treemap.md: child fields in the specified visitor and source order. */
export const treemapVisitorKeys: Readonly<
  Record<TreemapNode["type"], readonly string[]>
> = {
  TreemapDiagram: ["body"],
  TreemapSection: ["statementsBefore", "name", "classSelector", "children"],
  TreemapLeaf: ["statementsBefore", "name", "value", "classSelector"],
  TreemapClassDefStatement: ["name", "style"],
  TreemapTitleStatement: ["value"],
  TreemapAccTitleStatement: ["value"],
  TreemapAccDescrStatement: ["value"],
  TreemapAccDescrBlockStatement: ["value"],
  TreemapLiteral: [],
}
