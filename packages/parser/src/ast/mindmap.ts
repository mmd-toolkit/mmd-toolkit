/**
 * The nodes of the mindmap tree, as defined in
 * `packages/spec/docs/ast/mindmap.md`, for the diagram type `mindmap`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. A **node** is a box of the mindmap, written on a line of its own
 * with its indentation; the indentation makes the tree. An **icon** line and
 * a **class** line decorate the node written last before them.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. A node
 * that spans several lines has such a line under each of its lines. The
 * examples other than that of the diagram stand after the header line
 * `mindmap`.
 */
import type { NodeBase } from "../ast.ts"

/**
 * ast/mindmap.md, MindmapDiagram: the body of the diagram type `mindmap`.
 * Its child field is `root`. The header keyword is not a field; its token
 * is in `Root.tokens`. The range runs from the header keyword to the last
 * token of the diagram.
 *
 * ```text
 * mindmap
 * ^^^^^^^
 *   root
 * ^^^^^^
 * ```
 */
export interface MindmapDiagram extends NodeBase {
  readonly type: "MindmapDiagram"
  /** The first node, the root; null when there is none. */
  readonly root: MindmapNode | null
}

/**
 * ast/mindmap.md, MindmapNode: a node, with the icon and class lines that
 * decorate it and the nodes below it. Its child fields are `id`, `shape`,
 * `decorations`, and `children`.
 *
 * ```text
 * root
 * ^^^^
 *   a(text)
 * ^^^^^^^^^
 *   ::icon(fa fa-book)
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface MindmapNode extends NodeBase {
  readonly type: "MindmapNode"
  /** The number of whitespace characters before the node on its line, in the text without its directives. */
  readonly indent: number
  /** The node text: before the shape, or the whole node without a shape; null for a shape alone. */
  readonly id: MindmapLiteral | null
  /** The shape; null when there is none. */
  readonly shape: MindmapShape | null
  /** The icon and class lines after the node and before the next node, in source order. */
  readonly decorations: readonly (
    MindmapIconStatement | MindmapClassStatement
  )[]
  /** The nodes whose parent it is, in source order. */
  readonly children: readonly MindmapNode[]
}

/** ast/mindmap.md, MindmapShape: the openers, as written. */
export type MindmapOpener = "(" | "((" | "[" | "{{" | ")" | "))" | "(-" | "-)"

/** ast/mindmap.md, MindmapShape: the closers, as written. */
export type MindmapCloser = ")" | "))" | "]" | "}}" | "(" | "((" | "(-" | "-)"

/**
 * ast/mindmap.md, MindmapShape: the shape of a node, an opener, a label,
 * and a closer. Its child field is `label`.
 *
 * ```text
 * a))text((
 *  ^^^^^^^^
 * ```
 */
export interface MindmapShape extends NodeBase {
  readonly type: "MindmapShape"
  /** The opener, as written. */
  readonly opener: MindmapOpener
  /** The closer, as written; it need not match the opener. */
  readonly closer: MindmapCloser
  /** The text, string, or markdown string between them. */
  readonly label: MindmapLabel
}

/**
 * ast/mindmap.md, MindmapLabel: the text of a shape. No child fields.
 *
 * ```text
 * a["x y"]
 *   ^^^^^
 * ```
 */
export interface MindmapLabel extends NodeBase {
  readonly type: "MindmapLabel"
  /** `text` for a shape text, `string` for a string, `markdown` for a markdown string. */
  readonly kind: "text" | "string" | "markdown"
  /** For a text, its written text; for a string or a markdown string, its content between its delimiters. */
  readonly value: string
}

/**
 * ast/mindmap.md, MindmapIconStatement: an icon line. Its child field is
 * `icon`.
 *
 * ```text
 * root
 *   ::icon(fa fa-book)
 *   ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface MindmapIconStatement extends NodeBase {
  readonly type: "MindmapIconStatement"
  /** The text between `::icon(` and `)`, the whitespace at its ends included. */
  readonly icon: MindmapLiteral
}

/**
 * ast/mindmap.md, MindmapClassStatement: a class line. Its child field is
 * `cssClass`.
 *
 * ```text
 * root
 *   :::big red
 *   ^^^^^^^^^^
 * ```
 */
export interface MindmapClassStatement extends NodeBase {
  readonly type: "MindmapClassStatement"
  /** The rest of the line after `:::`, the whitespace at its ends included. */
  readonly cssClass: MindmapLiteral
}

/**
 * ast/mindmap.md, MindmapLiteral: a text without quotes that may contain
 * whitespace: a node text, an icon, and a class. No child fields.
 *
 * ```text
 * a mindmap
 * ^^^^^^^^^
 * ```
 */
export interface MindmapLiteral extends NodeBase {
  readonly type: "MindmapLiteral"
  /** Its written text. */
  readonly value: string
}

/**
 * Every node type of the mindmap tree. The other diagram types name this
 * union after the diagram and `Node`, which here is the name of a node type
 * of ast/mindmap.md.
 */
export type MindmapTreeNode =
  | MindmapDiagram
  | MindmapNode
  | MindmapShape
  | MindmapLabel
  | MindmapIconStatement
  | MindmapClassStatement
  | MindmapLiteral
