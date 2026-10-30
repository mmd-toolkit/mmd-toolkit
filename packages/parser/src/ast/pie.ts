/**
 * The eight source nodes of ast/pie.md. Values retain authored text; common
 * conversions and duplicate suppression do not change the source tree.
 * The marks in each example show the node's range after the pie header.
 */
import type { NodeBase, NumericLiteral, StringLiteral } from "../ast.ts"

/**
 * ast/pie.md, PieDiagram: retained pre-header forms, the optional header
 * flag and written body items, in visitor order.
 *
 * ```text
 * pie showData
 * ^^^^^^^^^^^^
 * "A":1
 * ^^^^^
 * ```
 */
export interface PieDiagram extends NodeBase {
  readonly type: "PieDiagram"
  readonly showData: boolean
  readonly textBeforeHeader: readonly PieIgnoredText[]
  readonly textBeforeShowData: readonly PieIgnoredText[]
  readonly body: readonly PieBodyItem[]
}

/** ast/pie.md, PieDiagram: written statements and retained hidden forms. */
export type PieBodyItem =
  | PieSectionStatement
  | PieTitleStatement
  | PieAccTitleStatement
  | PieAccDescrStatement
  | PieAccDescrBlockStatement
  | PieIgnoredText

/**
 * ast/pie.md, PieSectionStatement: a quoted label and number, with each
 * hidden form owned by its authored gap; EOL is outside the range.
 *
 * ```text
 * "A":1
 * ^^^^^
 * ```
 */
export interface PieSectionStatement extends NodeBase {
  readonly type: "PieSectionStatement"
  readonly label: StringLiteral
  readonly textBeforeColon: readonly PieIgnoredText[]
  readonly textBeforeValue: readonly PieIgnoredText[]
  readonly value: NumericLiteral
  readonly textAfter: readonly PieIgnoredText[]
}

/**
 * ast/pie.md, PieTitleStatement: text after title and one ASCII separator,
 * or null when empty, followed by retained hidden forms before EOL.
 *
 * ```text
 * title Chart
 * ^^^^^^^^^^^
 * ```
 */
export interface PieTitleStatement extends NodeBase {
  readonly type: "PieTitleStatement"
  readonly value: PieLiteral | null
  readonly textAfter: readonly PieIgnoredText[]
}

/**
 * ast/pie.md, PieAccTitleStatement: written colon-line content, including
 * padding, or null when empty, and hidden forms before EOL.
 *
 * ```text
 * accTitle: Accessible
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface PieAccTitleStatement extends NodeBase {
  readonly type: "PieAccTitleStatement"
  readonly value: PieLiteral | null
  readonly textAfter: readonly PieIgnoredText[]
}

/**
 * ast/pie.md, PieAccDescrStatement: written colon-line content, including
 * padding, or null when empty, and hidden forms before EOL.
 *
 * ```text
 * accDescr: Description
 * ^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface PieAccDescrStatement extends NodeBase {
  readonly type: "PieAccDescrStatement"
  readonly value: PieLiteral | null
  readonly textAfter: readonly PieIgnoredText[]
}

/**
 * ast/pie.md, PieAccDescrBlockStatement: the first-close block, with its
 * trimmed interior or null and hidden forms before EOL.
 *
 * ```text
 * accDescr { A }
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface PieAccDescrBlockStatement extends NodeBase {
  readonly type: "PieAccDescrBlockStatement"
  readonly value: PieLiteral | null
  readonly textAfter: readonly PieIgnoredText[]
}

/**
 * ast/pie.md, PieLiteral: authored common-value text, without common trivia.
 * No child fields; line values keep padding and block values trim it.
 *
 * ```text
 * title Chart
 *       ^^^^^
 * ```
 */
export interface PieLiteral extends NodeBase {
  readonly type: "PieLiteral"
  readonly value: string
}

/**
 * ast/pie.md, PieIgnoredText: one hidden form, including its fences but
 * excluding the LF consumed after its closer. No child fields.
 *
 * ```text
 * "A":%%{}%% 1
 *     ^^^^^^
 * ```
 */
export interface PieIgnoredText extends NodeBase {
  readonly type: "PieIgnoredText"
  readonly kind: "yaml-block" | "directive"
  readonly value: string
}

/** Every node type of the pie tree. */
export type PieNode = PieDiagram | PieBodyItem | PieLiteral
