import type { KanbanTreeNode } from "../ast/kanban.ts"

/**
 * ast/kanban.md: the child fields of each kanban node type, as each
 * node's section states them, in the order in which a walk visits them.
 */
export const kanbanVisitorKeys: Readonly<
  Record<KanbanTreeNode["type"], readonly string[]>
> = {
  KanbanDiagram: ["body"],
  KanbanNode: ["id", "shape", "data", "decorations"],
  KanbanShape: ["label"],
  KanbanLabel: [],
  KanbanIconStatement: ["icon"],
  KanbanClassStatement: ["cssClass"],
  KanbanDataBlock: [],
  KanbanLiteral: [],
}
