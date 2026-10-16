import type { TreeNode } from "./tree.ts"

/** ast/kanban.md: the flat written rows, before section membership is read. */
export interface KanbanDiagram extends TreeNode {
  readonly type: "KanbanDiagram"
  readonly body: readonly KanbanNode[]
}

/** ast/kanban.md: a row, its adjacent data suffix, and its decoration lines. */
export interface KanbanNode extends TreeNode {
  readonly type: "KanbanNode"
  readonly indent: number
  readonly id: KanbanLiteral | null
  readonly shape: KanbanShape | null
  readonly data: readonly KanbanDataBlock[]
  readonly decorations: readonly (KanbanIconStatement | KanbanClassStatement)[]
}

/** ast/kanban.md: the written delimiters and their label. */
export interface KanbanShape extends TreeNode {
  readonly type: "KanbanShape"
  readonly opener: string
  readonly closer: string
  readonly label: KanbanLabel
}

/** ast/kanban.md: the written content, with string delimiters left out. */
export interface KanbanLabel extends TreeNode {
  readonly type: "KanbanLabel"
  readonly kind: "text" | "string" | "markdown"
  readonly value: string
}

/** ast/kanban.md: the text between the icon marker and its closing parenthesis. */
export interface KanbanIconStatement extends TreeNode {
  readonly type: "KanbanIconStatement"
  readonly icon: KanbanLiteral
}

/** ast/kanban.md: the rest of the class line segment, including whitespace. */
export interface KanbanClassStatement extends TreeNode {
  readonly type: "KanbanClassStatement"
  readonly cssClass: KanbanLiteral
}

/** ast/kanban.md: one opaque written block; the group uses one embedded effect. */
export interface KanbanDataBlock extends TreeNode {
  readonly type: "KanbanDataBlock"
  readonly value: string
}

/** ast/kanban.md: written node, icon, or class text. */
export interface KanbanLiteral extends TreeNode {
  readonly type: "KanbanLiteral"
  readonly value: string
}
