import type { NodeBase, StringLiteral } from "../ast.ts"

/**
 * ast/cynefin.md, CynefinDiagram: Retained pre-header forms and every authored body occurrence.
 *
 * ```text
 * cynefin-beta
 * ^^^^^^^^^^^^
 * ```
 */
export interface CynefinDiagram extends NodeBase {
  readonly type: "CynefinDiagram"
  readonly textBeforeHeader: readonly CynefinIgnoredText[]
  readonly body: readonly CynefinBodyItem[]
}

/**
 * ast/cynefin.md, CynefinDomainStatement: A fixed domain word and its own authored item sequence.
 *
 * ```text
 * complex "X" "Y"
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface CynefinDomainStatement extends NodeBase {
  readonly type: "CynefinDomainStatement"
  readonly name: string
  readonly textAfterName: readonly CynefinIgnoredText[]
  readonly items: readonly CynefinDomainItem[]
}

/**
 * ast/cynefin.md, CynefinDomainItem: A required string with its leading and trailing native forms.
 *
 * ```text
 * complex "X" "Y"
 *         ^^^
 * ```
 */
export interface CynefinDomainItem extends NodeBase {
  readonly type: "CynefinDomainItem"
  readonly textBefore: readonly CynefinIgnoredText[]
  readonly label: StringLiteral
  readonly textAfter: readonly CynefinIgnoredText[]
}

/**
 * ast/cynefin.md, CynefinTransitionStatement: Fixed endpoints, whole arrow and optional colon/string pair.
 *
 * ```text
 * complex --> complicated : "Move"
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface CynefinTransitionStatement extends NodeBase {
  readonly type: "CynefinTransitionStatement"
  readonly from: string
  readonly textBeforeArrow: readonly CynefinIgnoredText[]
  readonly arrow: CynefinArrow
  readonly textBeforeTo: readonly CynefinIgnoredText[]
  readonly to: string
  readonly textBeforeColon: readonly CynefinIgnoredText[]
  readonly textBeforeLabel: readonly CynefinIgnoredText[]
  readonly label: StringLiteral | null
  readonly textAfter: readonly CynefinIgnoredText[]
}

/**
 * ast/cynefin.md, CynefinArrow: The complete authored solid arrow. No child fields.
 *
 * ```text
 * complex --> complicated : "Move"
 *         ^^^
 * ```
 */
export interface CynefinArrow extends NodeBase {
  readonly type: "CynefinArrow"
  readonly value: "-->"
  readonly startMarker: "none"
  readonly line: "solid"
  readonly endMarker: "arrow"
}

/**
 * ast/cynefin.md, CynefinTitleStatement: The title line value or null, and its native suffix.
 *
 * ```text
 * title T
 * ^^^^^^^
 * ```
 */
export interface CynefinTitleStatement extends NodeBase {
  readonly type: "CynefinTitleStatement"
  readonly value: CynefinLiteral | null
  readonly textAfter: readonly CynefinIgnoredText[]
}

/**
 * ast/cynefin.md, CynefinAccTitleStatement: The accessibility title line value or null, and its native suffix.
 *
 * ```text
 * accTitle: A
 * ^^^^^^^^^^^
 * ```
 */
export interface CynefinAccTitleStatement extends NodeBase {
  readonly type: "CynefinAccTitleStatement"
  readonly value: CynefinLiteral | null
  readonly textAfter: readonly CynefinIgnoredText[]
}

/**
 * ast/cynefin.md, CynefinAccDescrStatement: The accessibility description line value or null, and its native suffix.
 *
 * ```text
 * accDescr: D
 * ^^^^^^^^^^^
 * ```
 */
export interface CynefinAccDescrStatement extends NodeBase {
  readonly type: "CynefinAccDescrStatement"
  readonly value: CynefinLiteral | null
  readonly textAfter: readonly CynefinIgnoredText[]
}

/**
 * ast/cynefin.md, CynefinAccDescrBlockStatement: The first-close description block value or null, and its native suffix.
 *
 * ```text
 * accDescr { Long }
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface CynefinAccDescrBlockStatement extends NodeBase {
  readonly type: "CynefinAccDescrBlockStatement"
  readonly value: CynefinLiteral | null
  readonly textAfter: readonly CynefinIgnoredText[]
}

/**
 * ast/cynefin.md, CynefinLiteral: Unconverted authored common value outside common removals. No child fields.
 *
 * ```text
 * title T
 *       ^
 * ```
 */
export interface CynefinLiteral extends NodeBase {
  readonly type: "CynefinLiteral"
  readonly value: string
}

/**
 * ast/cynefin.md, CynefinIgnoredText: A whole native hidden form, excluding consumed following EOL. No child fields.
 *
 * ```text
 * %%{!before}%%
 * ^^^^^^^^^^^^^
 * ```
 */
export interface CynefinIgnoredText extends NodeBase {
  readonly type: "CynefinIgnoredText"
  readonly kind: "yaml-block" | "directive"
  readonly value: string
}

/** Every authored body form, in source order. */
export type CynefinBodyItem =
  | CynefinDomainStatement
  | CynefinTransitionStatement
  | CynefinTitleStatement
  | CynefinAccTitleStatement
  | CynefinAccDescrStatement
  | CynefinAccDescrBlockStatement
  | CynefinIgnoredText

/** Every node defined by ast/cynefin.md. */
export type CynefinNode =
  | CynefinDiagram
  | CynefinBodyItem
  | CynefinDomainItem
  | CynefinArrow
  | CynefinLiteral
