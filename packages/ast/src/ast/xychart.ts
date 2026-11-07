/**
 * The nodes of the XY chart tree, as defined in
 * `packages/spec/docs/ast/xychart.md`, for the diagram type `xychart`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. A **plot** is a line or a set of bars, drawn from its
 * **values**; the x axis has **categories** or a **range**, two numbers,
 * and the y axis a range only.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. The
 * examples other than those of the diagram and the header stand after the
 * header line `xychart`.
 */
import type { NodeBase, NumericLiteral, StringLiteral } from "../ast.ts"

/**
 * ast/xychart.md, XychartDiagram: the body of the diagram type `xychart`.
 * Its child fields are `headers` and `body`. The range runs from the first
 * header keyword to the last token of the diagram.
 *
 * ```text
 * xychart horizontal
 * ^^^^^^^^^^^^^^^^^^
 * line [1, 2]
 * ^^^^^^^^^^^
 * ```
 */
export interface XychartDiagram extends NodeBase {
  readonly type: "XychartDiagram"
  /** The headers, in source order; at least one. */
  readonly headers: readonly XychartHeader[]
  /** The statements, in source order; may be none. */
  readonly body: readonly XychartStatement[]
}

/**
 * ast/xychart.md, XychartHeader: the header keyword, `xychart` or
 * `xychart-beta`, with the orientation after it. No child fields; the
 * keyword is not a field.
 *
 * ```text
 * xychart-beta Horizontal
 * ^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface XychartHeader extends NodeBase {
  readonly type: "XychartHeader"
  /** The orientation as written, `vertical` or `horizontal` in any case; null when there is none. */
  readonly orientation: string | null
}

/** ast/xychart.md, XychartDiagram: a statement of an XY chart. */
export type XychartStatement =
  | XychartTitleStatement
  | XychartXAxisStatement
  | XychartYAxisStatement
  | XychartPlotStatement
  | XychartAccTitleStatement
  | XychartAccDescrStatement
  | XychartAccDescrBlockStatement

/**
 * ast/xychart.md, XychartTitleStatement: `title` and its text. Its child
 * field is `value`.
 *
 * ```text
 * title Sales Revenue
 * ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface XychartTitleStatement extends NodeBase {
  readonly type: "XychartTitleStatement"
  /** The text, never empty. */
  readonly value: XychartLiteral | StringLiteral
}

/**
 * ast/xychart.md, XychartXAxisStatement: `x-axis` with a title, with
 * categories or a range, or with both. Its child fields are `title` and
 * `data`; at least one of them is not null.
 *
 * ```text
 * x-axis Month [jan, feb]
 * ^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface XychartXAxisStatement extends NodeBase {
  readonly type: "XychartXAxisStatement"
  /** The title; null when there is none. */
  readonly title: XychartLiteral | StringLiteral | null
  /** The categories or the range; null when there are none. */
  readonly data: XychartBand | XychartRange | null
}

/**
 * ast/xychart.md, XychartYAxisStatement: `y-axis` with a title, with a
 * range, or with both. Its child fields are `title` and `data`; at least
 * one of them is not null.
 *
 * ```text
 * y-axis Revenue 0 --> 100
 * ^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface XychartYAxisStatement extends NodeBase {
  readonly type: "XychartYAxisStatement"
  /** The title; null when there is none. */
  readonly title: XychartLiteral | StringLiteral | null
  /** The range; null when there is none. */
  readonly data: XychartRange | null
}

/**
 * ast/xychart.md, XychartBand: the categories of the x axis, from `[` to
 * `]`. Its child field is `categories`.
 *
 * ```text
 * x-axis [jan, "Feb 2", 3]
 *        ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface XychartBand extends NodeBase {
  readonly type: "XychartBand"
  /** The categories, in source order; at least one, none empty. */
  readonly categories: readonly (XychartLiteral | StringLiteral)[]
}

/**
 * ast/xychart.md, XychartRange: two numbers and the arrow between them.
 * Its child fields are `start` and `end`.
 *
 * ```text
 * y-axis 0 --> 100
 *        ^^^^^^^^^
 * ```
 */
export interface XychartRange extends NodeBase {
  readonly type: "XychartRange"
  /** The number before the arrow. */
  readonly start: NumericLiteral
  /** The number after the arrow. */
  readonly end: NumericLiteral
}

/**
 * ast/xychart.md, XychartPlotStatement: `line` or `bar`, a title or none,
 * and the values in brackets. Its child fields are `title` and `values`.
 *
 * ```text
 * line Sales [10, 20 "peak", 15]
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface XychartPlotStatement extends NodeBase {
  readonly type: "XychartPlotStatement"
  /** The keyword in lower case, whatever the case in which it is written. */
  readonly kind: "line" | "bar"
  /** The title; null when there is none. */
  readonly title: XychartLiteral | StringLiteral | null
  /** The values, in source order; at least one. */
  readonly values: readonly XychartValue[]
}

/**
 * ast/xychart.md, XychartValue: a value of a plot, with its label or
 * without one. Its child fields are `value` and `label`.
 *
 * ```text
 * bar [20 "peak"]
 *      ^^^^^^^^^
 * ```
 */
export interface XychartValue extends NodeBase {
  readonly type: "XychartValue"
  /** The number. */
  readonly value: NumericLiteral
  /** The string after it; null when there is none. */
  readonly label: StringLiteral | null
}

/**
 * ast/xychart.md, XychartAccTitleStatement: an `accTitle:` statement with
 * its text. Its child field is `value`.
 *
 * ```text
 * accTitle: Sales by month
 * ^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface XychartAccTitleStatement extends NodeBase {
  readonly type: "XychartAccTitleStatement"
  /** The text up to the end of its line, without the whitespace at its ends; null when no text follows up to the end of the text. */
  readonly value: XychartLiteral | null
}

/**
 * ast/xychart.md, XychartAccDescrStatement: an `accDescr:` statement with
 * its text. Its child field is `value`.
 *
 * ```text
 * accDescr: Sales grew
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface XychartAccDescrStatement extends NodeBase {
  readonly type: "XychartAccDescrStatement"
  /** The text up to the end of its line, without the whitespace at its ends; null when no text follows up to the end of the text. */
  readonly value: XychartLiteral | null
}

/**
 * ast/xychart.md, XychartAccDescrBlockStatement: an `accDescr { ... }`
 * statement with its text, or without text. Its child field is `value`.
 *
 * ```text
 * accDescr { Sales grew }
 * ^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface XychartAccDescrBlockStatement extends NodeBase {
  readonly type: "XychartAccDescrBlockStatement"
  /** The text between `{` and `}`, without the whitespace at its ends; null when only whitespace lies between them. */
  readonly value: XychartLiteral | null
  /** Whether the block ends with `}`; a block that is not closed runs to the end of the text. */
  readonly closed: boolean
}

/**
 * ast/xychart.md, XychartLiteral: a text without quotes, or the text of an
 * accessibility statement. No child fields.
 *
 * ```text
 * title Two words
 *       ^^^^^^^^^
 * ```
 */
export interface XychartLiteral extends NodeBase {
  readonly type: "XychartLiteral"
  /** For a text without quotes, the texts of its units joined; for an accessibility text, the text without the whitespace at its ends. */
  readonly value: string
}

/** Every node type of the XY chart tree. */
export type XychartNode =
  | XychartDiagram
  | XychartHeader
  | XychartTitleStatement
  | XychartXAxisStatement
  | XychartYAxisStatement
  | XychartBand
  | XychartRange
  | XychartPlotStatement
  | XychartValue
  | XychartAccTitleStatement
  | XychartAccDescrStatement
  | XychartAccDescrBlockStatement
  | XychartLiteral
