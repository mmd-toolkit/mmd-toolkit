/**
 * The seven source nodes of ast/info.md. Values retain authored text; common
 * conversions do not change the source tree.
 * The marks in each example show the node's range after the info header.
 */
import type { NodeBase } from "../ast.ts"

/**
 * ast/info.md, InfoDiagram: retained pre-header forms, the optional header
 * flag and written body items, in visitor order.
 *
 * ```text
 * info
 * ^^^^
 * title T
 * ^^^^^^^
 * accTitle: A
 * ^^^^^^^^^^^
 * accDescr { D }
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface InfoDiagram extends NodeBase {
  readonly type: "InfoDiagram"
  readonly showInfo: boolean
  readonly textBeforeHeader: readonly InfoIgnoredText[]
  readonly textBeforeShowInfo: readonly InfoIgnoredText[]
  readonly body: readonly InfoBodyItem[]
}

/** ast/info.md, InfoDiagram: written statements and retained hidden forms. */
export type InfoBodyItem =
  | InfoTitleStatement
  | InfoAccTitleStatement
  | InfoAccDescrStatement
  | InfoAccDescrBlockStatement
  | InfoIgnoredText

/**
 * ast/info.md, InfoTitleStatement: text after title and one ASCII separator,
 * or null when empty, followed by retained hidden forms before EOL.
 *
 * ```text
 * title T
 * ^^^^^^^
 * ```
 */
export interface InfoTitleStatement extends NodeBase {
  readonly type: "InfoTitleStatement"
  readonly value: InfoLiteral | null
  readonly textAfter: readonly InfoIgnoredText[]
}

/**
 * ast/info.md, InfoAccTitleStatement: written colon-line content, including
 * padding, or null when empty, and hidden forms before EOL.
 *
 * ```text
 * accTitle: A
 * ^^^^^^^^^^^
 * ```
 */
export interface InfoAccTitleStatement extends NodeBase {
  readonly type: "InfoAccTitleStatement"
  readonly value: InfoLiteral | null
  readonly textAfter: readonly InfoIgnoredText[]
}

/**
 * ast/info.md, InfoAccDescrStatement: written colon-line content, including
 * padding, or null when empty, and hidden forms before EOL.
 *
 * ```text
 * accDescr: D
 * ^^^^^^^^^^^
 * ```
 */
export interface InfoAccDescrStatement extends NodeBase {
  readonly type: "InfoAccDescrStatement"
  readonly value: InfoLiteral | null
  readonly textAfter: readonly InfoIgnoredText[]
}

/**
 * ast/info.md, InfoAccDescrBlockStatement: the first-close block, with its
 * trimmed interior or null and hidden forms before EOL.
 *
 * ```text
 * accDescr { A }
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface InfoAccDescrBlockStatement extends NodeBase {
  readonly type: "InfoAccDescrBlockStatement"
  readonly value: InfoLiteral | null
  readonly textAfter: readonly InfoIgnoredText[]
}

/**
 * ast/info.md, InfoLiteral: authored common-value text, without common trivia.
 * No child fields; line values keep padding and block values trim it.
 *
 * ```text
 * title T
 *       ^
 * ```
 */
export interface InfoLiteral extends NodeBase {
  readonly type: "InfoLiteral"
  readonly value: string
}

/**
 * ast/info.md, InfoIgnoredText: one hidden form, including its fences but
 * excluding the LF consumed after its closer. No child fields.
 *
 * ```text
 * %%{}%%
 * ^^^^^^
 * ```
 */
export interface InfoIgnoredText extends NodeBase {
  readonly type: "InfoIgnoredText"
  readonly kind: "yaml-block" | "directive"
  readonly value: string
}

/** Every node type of the info tree. */
export type InfoNode = InfoDiagram | InfoBodyItem | InfoLiteral
