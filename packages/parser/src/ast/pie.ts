/**
 * The eight source nodes of packages/spec/docs/ast/pie.md. Values keep their
 * written spelling; common trivia is omitted only from written values.
 * Examples after the diagram's example follow a pie header.
 */
import type { NodeBase, NumericLiteral, StringLiteral } from "../ast.ts"

/**
 * ast/pie.md, PieDiagram: header flag, retained pre-header forms and body.
 * Child fields: textBeforeHeader, textBeforeShowData, body.
 *
 * ```text
 * pie
 * ^^^
 * ```
 */
export interface PieDiagram extends NodeBase {
  readonly type: "PieDiagram"
  /** Whether the header explicitly writes showData. */
  readonly showData: boolean
  /** Hidden forms before the header, in source order. */
  readonly textBeforeHeader: readonly PieIgnoredText[]
  /** Hidden forms between pie and a written showData; empty without that flag. */
  readonly textBeforeShowData: readonly PieIgnoredText[]
  /** Written statements and hidden forms, in source order. */
  readonly body: readonly PieBodyItem[]
}

/** ast/pie.md, PieBodyItem: each written statement or retained hidden form. */
export type PieBodyItem =
  | PieSectionStatement
  | PieTitleStatement
  | PieAccTitleStatement
  | PieAccDescrStatement
  | PieAccDescrBlockStatement
  | PieIgnoredText

/**
 * ast/pie.md, PieSectionStatement: a quoted label, colon and number.
 * Child fields: label, textBeforeColon, textBeforeValue, value, textAfter.
 *
 * ```text
 * "A": 1
 * ^^^^^^
 * ```
 */
export interface PieSectionStatement extends NodeBase {
  readonly type: "PieSectionStatement"
  /** Matching single or double quotes; empty labels remain sections. */
  readonly label: StringLiteral
  /** Hidden forms between the label and colon. */
  readonly textBeforeColon: readonly PieIgnoredText[]
  /** Hidden forms between the colon and number. */
  readonly textBeforeValue: readonly PieIgnoredText[]
  /** Written number and its shared double value. */
  readonly value: NumericLiteral
  /** Hidden forms after the number, before visible EOL. */
  readonly textAfter: readonly PieIgnoredText[]
}

/**
 * ast/pie.md, PieTitleStatement: title with its optional line value.
 * Child fields: value, textAfter.
 *
 * ```text
 * title Chart
 * ^^^^^^^^^^^
 * ```
 */
export interface PieTitleStatement extends NodeBase {
  readonly type: "PieTitleStatement"
  /** Text after the one ASCII separator, retaining remaining padding. */
  readonly value: PieLiteral | null
  /** Hidden forms before EOL. */
  readonly textAfter: readonly PieIgnoredText[]
}

/**
 * ast/pie.md, PieAccTitleStatement: accessibility title and its padding.
 * Child fields: value, textAfter.
 *
 * ```text
 * accTitle: Accessible
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface PieAccTitleStatement extends NodeBase {
  readonly type: "PieAccTitleStatement"
  /** Text immediately after the colon; null only when empty. */
  readonly value: PieLiteral | null
  /** Hidden forms before EOL. */
  readonly textAfter: readonly PieIgnoredText[]
}

/**
 * ast/pie.md, PieAccDescrStatement: accessibility description line.
 * Child fields: value, textAfter.
 *
 * ```text
 * accDescr: Description
 * ^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface PieAccDescrStatement extends NodeBase {
  readonly type: "PieAccDescrStatement"
  /** Text immediately after the colon; null only when empty. */
  readonly value: PieLiteral | null
  /** Hidden forms before EOL. */
  readonly textAfter: readonly PieIgnoredText[]
}

/**
 * ast/pie.md, PieAccDescrBlockStatement: first-close description block.
 * Child fields: value, textAfter.
 *
 * ```text
 * accDescr { Text }
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface PieAccDescrBlockStatement extends NodeBase {
  readonly type: "PieAccDescrBlockStatement"
  /** Interior without common whitespace at its ends; null when empty. */
  readonly value: PieLiteral | null
  /** Hidden forms before EOL. */
  readonly textAfter: readonly PieIgnoredText[]
}

/**
 * ast/pie.md, PieLiteral: common value text without delimiter conversion.
 * No child fields.
 *
 * ```text
 * title Chart
 *       ^^^^^
 * ```
 */
export interface PieLiteral extends NodeBase {
  readonly type: "PieLiteral"
  /** Written value without common directives, comment regions or selected semicolons. */
  readonly value: string
}

/**
 * ast/pie.md, PieIgnoredText: one hidden form including its fences, excluding
 * the following LF consumed by the lexical rule. No child fields.
 *
 * ```text
 * %%{}%%
 * ^^^^^^
 * ```
 */
export interface PieIgnoredText extends NodeBase {
  readonly type: "PieIgnoredText"
  /** Which hidden lexical rule read the form. */
  readonly kind: "yaml-block" | "directive"
  /** Nonempty written form without common trivia. */
  readonly value: string
}

/** Every node type of the pie tree. */
export type PieNode = PieDiagram | PieBodyItem | PieLiteral
