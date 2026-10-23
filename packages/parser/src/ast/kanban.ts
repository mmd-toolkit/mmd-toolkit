/**
 * The nodes of the kanban tree, as defined in
 * `packages/spec/docs/ast/kanban.md`, for the diagram type `kanban`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. A **node** is a box of the kanban, written on a line of its own
 * with its indentation; the body stays flat. An **icon** line and
 * a **class** line decorate the node written last before them.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. A node
 * that spans several lines has such a line under each of its lines. The
 * examples other than that of the diagram stand after the header line
 * `kanban`.
 */
import type { NodeBase } from "../ast.ts"

/**
 * ast/kanban.md, KanbanDiagram: the body of the diagram type `kanban`.
 * Its child field is `body`. The header keyword is not a field; its token
 * is in `Root.tokens`. The range runs from the header keyword to the last
 * token of the diagram.
 *
 * ```text
 * kanban
 * ^^^^^^
 *   root
 * ^^^^^^
 * ```
 */
export interface KanbanDiagram extends NodeBase {
  readonly type: "KanbanDiagram"
  /** The written nodes, in source order; may be empty. */
  readonly body: readonly KanbanNode[]
}

/**
 * ast/kanban.md, KanbanNode: a node, with the icon and class lines that
 * decorate it and its data blocks. Its child fields are `id`, `shape`,
 * `data`, and `decorations`.
 *
 * ```text
 * a(text)
 * ^^^^^^^
 *   ::icon(fa fa-book)
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface KanbanNode extends NodeBase {
  readonly type: "KanbanNode"
  /** The number of whitespace characters before the node on its line, in the text without its directives. */
  readonly indent: number
  /** The node text: before the shape, or the whole node without a shape; null for a shape alone. */
  readonly id: KanbanLiteral | null
  /** The shape; null when there is none. */
  readonly shape: KanbanShape | null
  /** The written data blocks, in source order; may be empty. */
  readonly data: readonly KanbanDataBlock[]
  /** The icon and class lines after the node and before the next node, in source order. */
  readonly decorations: readonly (KanbanIconStatement | KanbanClassStatement)[]
}

/** ast/kanban.md, KanbanShape: the openers, as written. */
export type KanbanOpener = "(" | "((" | "[" | "{{" | ")" | "))" | "(-" | "-)"

/** ast/kanban.md, KanbanShape: the closers, as written. */
export type KanbanCloser = ")" | "))" | "]" | "}}" | "(" | "((" | "(-" | "-)"

/**
 * ast/kanban.md, KanbanShape: the shape of a node, an opener, a label,
 * and a closer. Its child field is `label`.
 *
 * ```text
 * a))text((
 *  ^^^^^^^^
 * ```
 */
export interface KanbanShape extends NodeBase {
  readonly type: "KanbanShape"
  /** The opener, as written. */
  readonly opener: KanbanOpener
  /** The closer, as written; it need not match the opener. */
  readonly closer: KanbanCloser
  /** The text, string, or markdown string between them. */
  readonly label: KanbanLabel
}

/**
 * ast/kanban.md, KanbanLabel: the text of a shape. No child fields.
 *
 * ```text
 * a["x y"]
 *   ^^^^^
 * ```
 */
export interface KanbanLabel extends NodeBase {
  readonly type: "KanbanLabel"
  /** `text` for a shape text, `string` for a string, `markdown` for a markdown string. */
  readonly kind: "text" | "string" | "markdown"
  /** For a text, its written text; for a string or a markdown string, its content between its delimiters. */
  readonly value: string
}

/**
 * ast/kanban.md, KanbanIconStatement: an icon line. Its child field is
 * `icon`.
 *
 * ```text
 * root
 *   ::icon(fa fa-book)
 *   ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface KanbanIconStatement extends NodeBase {
  readonly type: "KanbanIconStatement"
  /** The text between `::icon(` and `)`, the whitespace at its ends included. */
  readonly icon: KanbanLiteral
}

/**
 * ast/kanban.md, KanbanClassStatement: a class line. Its child field is
 * `cssClass`.
 *
 * ```text
 * root
 *   :::big red
 *   ^^^^^^^^^^
 * ```
 */
export interface KanbanClassStatement extends NodeBase {
  readonly type: "KanbanClassStatement"
  /** The rest of the line after `:::`, the whitespace at its ends included. */
  readonly cssClass: KanbanLiteral
}

/**
 * ast/kanban.md, KanbanDataBlock: an opaque data suffix. No child fields.
 *
 * ```text
 * A@{ticket: X}
 *  ^^^^^^^^^^^^
 * ```
 */
export interface KanbanDataBlock extends NodeBase {
  readonly type: "KanbanDataBlock"
  /** The whole written interior, without the delimiters; may be empty. */
  readonly value: string
}

/**
 * ast/kanban.md, KanbanLiteral: a text without quotes that may contain
 * whitespace: a node text, an icon, and a class. No child fields.
 *
 * ```text
 * a kanban
 * ^^^^^^^^
 * ```
 */
export interface KanbanLiteral extends NodeBase {
  readonly type: "KanbanLiteral"
  /** Its written text. */
  readonly value: string
}

/**
 * Every node type of the kanban tree. The other diagram types name this
 * union after the diagram and `Node`, which here is the name of a node type
 * of ast/kanban.md.
 */
export type KanbanTreeNode =
  | KanbanDiagram
  | KanbanNode
  | KanbanShape
  | KanbanLabel
  | KanbanIconStatement
  | KanbanClassStatement
  | KanbanDataBlock
  | KanbanLiteral
