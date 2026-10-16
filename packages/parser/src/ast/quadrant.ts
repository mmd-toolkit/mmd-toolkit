/**
 * The nodes of the quadrant chart tree, as defined in
 * `packages/spec/docs/ast/quadrant.md`, for the diagram type
 * `quadrantChart`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. A quadrant chart has two **axes**, four **quadrants**, and
 * **points**, which a **class** of `classDef` may style.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. The
 * examples other than that of the diagram stand after the header line
 * `quadrantChart`.
 */
import type { Identifier, NodeBase } from "../ast.ts"

/**
 * ast/quadrant.md, QuadrantDiagram: the body of the diagram type
 * `quadrantChart`. Its child field is `body`. The header is not a field;
 * its token is in `Root.tokens`. The range runs from the header keyword to
 * the last token of the diagram.
 *
 * ```text
 * quadrantChart
 * ^^^^^^^^^^^^^
 * quadrant-1 A
 * ^^^^^^^^^^^^
 * ```
 */
export interface QuadrantDiagram extends NodeBase {
  readonly type: "QuadrantDiagram"
  /** The statements, in source order; may be none. */
  readonly body: readonly QuadrantStatement[]
}

/** ast/quadrant.md, QuadrantDiagram: a statement of a quadrant chart. */
export type QuadrantStatement =
  | QuadrantTitleStatement
  | QuadrantAccTitleStatement
  | QuadrantAccDescrStatement
  | QuadrantAccDescrBlockStatement
  | QuadrantAxisStatement
  | QuadrantQuadrantStatement
  | QuadrantPointStatement
  | QuadrantClassDefStatement

/**
 * ast/quadrant.md, QuadrantTitleStatement: `title` and the rest of its
 * line. Its child field is `value`.
 *
 * ```text
 * title Reach and engagement
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface QuadrantTitleStatement extends NodeBase {
  readonly type: "QuadrantTitleStatement"
  /** The text after `title`, without the whitespace at its ends; null when there is none. */
  readonly value: QuadrantLiteral | null
}

/**
 * ast/quadrant.md, QuadrantAccTitleStatement: an `accTitle:` statement with
 * its text. Its child field is `value`.
 *
 * ```text
 * accTitle: Reach
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface QuadrantAccTitleStatement extends NodeBase {
  readonly type: "QuadrantAccTitleStatement"
  /** The text after `accTitle:`, up to the end of its line, never empty. */
  readonly value: QuadrantLiteral
}

/**
 * ast/quadrant.md, QuadrantAccDescrStatement: an `accDescr:` statement with
 * its text. Its child field is `value`.
 *
 * ```text
 * accDescr: Reach of campaigns
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface QuadrantAccDescrStatement extends NodeBase {
  readonly type: "QuadrantAccDescrStatement"
  /** The text after `accDescr:`, up to the end of its line, never empty. */
  readonly value: QuadrantLiteral
}

/**
 * ast/quadrant.md, QuadrantAccDescrBlockStatement: an `accDescr { ... }`
 * statement with its text, or without text. Its child field is `value`.
 *
 * ```text
 * accDescr { Reach of campaigns }
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface QuadrantAccDescrBlockStatement extends NodeBase {
  readonly type: "QuadrantAccDescrBlockStatement"
  /** The text between `{` and `}`, without the whitespace at its ends; null when only whitespace lies between them. */
  readonly value: QuadrantLiteral | null
}

/**
 * ast/quadrant.md, QuadrantAxisStatement: `x-axis` or `y-axis` with one
 * text, or with two texts and the arrow between them. Its child fields are
 * `start` and `end`.
 *
 * ```text
 * x-axis Low Reach --> High Reach
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface QuadrantAxisStatement extends NodeBase {
  readonly type: "QuadrantAxisStatement"
  /** The letter of the keyword in lower case. */
  readonly axis: "x" | "y"
  /** The text before the arrow, or the only text. */
  readonly start: QuadrantLabel
  /** Whether the arrow is written; true when `end` is not null. */
  readonly arrow: boolean
  /** The text after the arrow; null when there is none. */
  readonly end: QuadrantLabel | null
}

/**
 * ast/quadrant.md, QuadrantQuadrantStatement: `quadrant-1` to
 * `quadrant-4` with a text. Its child field is `text`.
 *
 * ```text
 * quadrant-1 We should expand
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface QuadrantQuadrantStatement extends NodeBase {
  readonly type: "QuadrantQuadrantStatement"
  /** The digit of the keyword. */
  readonly quadrant: 1 | 2 | 3 | 4
  /** The text of the quadrant. */
  readonly text: QuadrantLabel
}

/**
 * ast/quadrant.md, QuadrantPointStatement: a point. Its child fields are
 * `name`, `className`, `x`, `y`, and `styles`.
 *
 * ```text
 * B:::c1: [0.45, 0.23] radius: 9, color: #f00
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface QuadrantPointStatement extends NodeBase {
  readonly type: "QuadrantPointStatement"
  /** The name before the `:`. */
  readonly name: QuadrantLabel
  /** The class name after `:::`; null when there is none. */
  readonly className: Identifier | null
  /** The first coordinate. */
  readonly x: QuadrantLiteral
  /** The second coordinate. */
  readonly y: QuadrantLiteral
  /** The styles after the `]`, in source order; may be none. */
  readonly styles: readonly QuadrantLiteral[]
}

/**
 * ast/quadrant.md, QuadrantClassDefStatement: `classDef` with the name of a
 * class and its styles. Its child fields are `name` and `styles`.
 *
 * ```text
 * classDef c1 radius: 5, color: #f00
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface QuadrantClassDefStatement extends NodeBase {
  readonly type: "QuadrantClassDefStatement"
  /** The name of the class. */
  readonly name: QuadrantIdentifier
  /** The styles, in source order; at least one. */
  readonly styles: readonly QuadrantLiteral[]
}

/**
 * ast/quadrant.md, QuadrantLabel: a text of an axis or of a quadrant, or
 * the name of a point. No child fields.
 *
 * ```text
 * quadrant-1 "a" b
 *            ^^^^^
 * ```
 */
export interface QuadrantLabel extends NodeBase {
  readonly type: "QuadrantLabel"
  /** How the text starts: without quotes, with a string, or with a markdown string. */
  readonly kind: "text" | "string" | "markdown"
  /** The content of the string or markdown string that it starts with, followed by the written text of the rest; for a text that starts without quotes, its written text. */
  readonly value: string
}

/**
 * ast/quadrant.md, QuadrantLiteral: a title, an accessibility text, the
 * text of a description block, a coordinate, or a style. No child fields.
 *
 * ```text
 * A: [0.3, 0.6]
 *     ^^^
 * ```
 */
export interface QuadrantLiteral extends NodeBase {
  readonly type: "QuadrantLiteral"
  /** Its written text, without the whitespace at its ends. */
  readonly value: string
}

/**
 * ast/quadrant.md, QuadrantIdentifier: the name of a class of `classDef`.
 * No child fields.
 *
 * ```text
 * classDef c-1 color: #f00
 *          ^^^
 * ```
 */
export interface QuadrantIdentifier extends NodeBase {
  readonly type: "QuadrantIdentifier"
  /** Its written text. */
  readonly name: string
}

/** Every node type of the quadrant chart tree. */
export type QuadrantNode =
  | QuadrantDiagram
  | QuadrantTitleStatement
  | QuadrantAccTitleStatement
  | QuadrantAccDescrStatement
  | QuadrantAccDescrBlockStatement
  | QuadrantAxisStatement
  | QuadrantQuadrantStatement
  | QuadrantPointStatement
  | QuadrantClassDefStatement
  | QuadrantLabel
  | QuadrantLiteral
  | QuadrantIdentifier
