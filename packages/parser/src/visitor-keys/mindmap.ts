import type { MindmapTreeNode } from "../ast/mindmap.ts"

/**
 * ast/mindmap.md: the child fields of each mindmap node type, as each
 * node's section states them, in the order in which a walk visits them.
 */
export const mindmapVisitorKeys: Readonly<
  Record<MindmapTreeNode["type"], readonly string[]>
> = {
  MindmapDiagram: ["root"],
  MindmapNode: ["id", "shape", "decorations", "children"],
  MindmapShape: ["label"],
  MindmapLabel: [],
  MindmapIconStatement: ["icon"],
  MindmapClassStatement: ["cssClass"],
  MindmapLiteral: [],
}
