import type { NodeBase, Identifier, StringLiteral } from "../ast.ts"

/**
 * ast/architecture.md, ArchitectureDiagram:
 * Retained pre-header forms and the flat, source-ordered body.
 *
 * ```text
 * architecture-beta
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ArchitectureDiagram extends NodeBase {
  readonly type: "ArchitectureDiagram"
  readonly textBeforeHeader: readonly ArchitectureIgnoredText[]
  readonly body: readonly ArchitectureBodyItem[]
}

/**
 * ast/architecture.md, ArchitectureGroupStatement:
 * A group declaration with its optional named icon, label and parent.
 *
 * ```text
 * group g(cloud)[Group]
 * ^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ArchitectureGroupStatement extends NodeBase {
  readonly type: "ArchitectureGroupStatement"
  readonly textBeforeId: readonly ArchitectureIgnoredText[]
  readonly id: Identifier
  readonly textBeforeIcon: readonly ArchitectureIgnoredText[]
  readonly icon: Identifier | null
  readonly textBeforeTitle: readonly ArchitectureIgnoredText[]
  readonly title: ArchitectureLabel | null
  readonly textBeforeIn: readonly ArchitectureIgnoredText[]
  readonly textBeforeParent: readonly ArchitectureIgnoredText[]
  readonly in: Identifier | null
  readonly textAfter: readonly ArchitectureIgnoredText[]
}

/**
 * ast/architecture.md, ArchitectureServiceStatement:
 * A service declaration with a named or quoted text icon.
 *
 * ```text
 * service a "A" [Service]
 * ^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ArchitectureServiceStatement extends NodeBase {
  readonly type: "ArchitectureServiceStatement"
  readonly textBeforeId: readonly ArchitectureIgnoredText[]
  readonly id: Identifier
  readonly textBeforeIcon: readonly ArchitectureIgnoredText[]
  readonly icon: Identifier | StringLiteral | null
  readonly textBeforeTitle: readonly ArchitectureIgnoredText[]
  readonly title: ArchitectureLabel | null
  readonly textBeforeIn: readonly ArchitectureIgnoredText[]
  readonly textBeforeParent: readonly ArchitectureIgnoredText[]
  readonly in: Identifier | null
  readonly textAfter: readonly ArchitectureIgnoredText[]
}

/**
 * ast/architecture.md, ArchitectureJunctionStatement:
 * A junction declaration and optional parent group reference.
 *
 * ```text
 * junction j
 * ^^^^^^^^^^
 * ```
 */
export interface ArchitectureJunctionStatement extends NodeBase {
  readonly type: "ArchitectureJunctionStatement"
  readonly textBeforeId: readonly ArchitectureIgnoredText[]
  readonly id: Identifier
  readonly textBeforeIn: readonly ArchitectureIgnoredText[]
  readonly textBeforeParent: readonly ArchitectureIgnoredText[]
  readonly in: Identifier | null
  readonly textAfter: readonly ArchitectureIgnoredText[]
}

/**
 * ast/architecture.md, ArchitectureEdgeStatement:
 * Written endpoints and group modifiers around a port-to-port arrow.
 *
 * ```text
 * service a
 * junction j
 * a:R <-[link]-> L:j
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ArchitectureEdgeStatement extends NodeBase {
  readonly type: "ArchitectureEdgeStatement"
  readonly lhsId: Identifier
  readonly textBeforeLhsGroup: readonly ArchitectureIgnoredText[]
  readonly lhsGroup: boolean
  readonly textBeforeArrow: readonly ArchitectureIgnoredText[]
  readonly arrow: ArchitectureArrow
  readonly textBeforeRhsId: readonly ArchitectureIgnoredText[]
  readonly rhsId: Identifier
  readonly textBeforeRhsGroup: readonly ArchitectureIgnoredText[]
  readonly rhsGroup: boolean
  readonly textAfter: readonly ArchitectureIgnoredText[]
}

/**
 * ast/architecture.md, ArchitectureArrow:
 * Written arrow text, directions, markers, line and optional label.
 *
 * ```text
 * service a
 * junction j
 * a:R <-[link]-> L:j
 *  ^^^^^^^^^^^^^^^^
 * ```
 */
export interface ArchitectureArrow extends NodeBase {
  readonly type: "ArchitectureArrow"
  readonly value: string
  readonly textBeforeStartDirection: readonly ArchitectureIgnoredText[]
  readonly startDirection: "L" | "R" | "T" | "B"
  readonly textBeforeStartMarker: readonly ArchitectureIgnoredText[]
  readonly startMarker: "arrow" | "none"
  readonly textBeforeLine: readonly ArchitectureIgnoredText[]
  readonly line: "solid"
  readonly textBeforeTitle: readonly ArchitectureIgnoredText[]
  readonly title: ArchitectureLabel | null
  readonly textBeforeEndDash: readonly ArchitectureIgnoredText[]
  readonly textBeforeEndMarker: readonly ArchitectureIgnoredText[]
  readonly endMarker: "arrow" | "none"
  readonly textBeforeEndDirection: readonly ArchitectureIgnoredText[]
  readonly endDirection: "L" | "R" | "T" | "B"
  readonly textBeforeEndColon: readonly ArchitectureIgnoredText[]
}

/**
 * ast/architecture.md, ArchitectureAlignmentStatement:
 * An authored row or column alignment in member order.
 *
 * ```text
 * service a
 * junction j
 * align row a j
 * ^^^^^^^^^^^^^
 * ```
 */
export interface ArchitectureAlignmentStatement extends NodeBase {
  readonly type: "ArchitectureAlignmentStatement"
  readonly textBeforeDirection: readonly ArchitectureIgnoredText[]
  readonly direction: "row" | "column"
  readonly members: readonly ArchitectureAlignmentMember[]
  readonly textAfter: readonly ArchitectureIgnoredText[]
}

/**
 * ast/architecture.md, ArchitectureAlignmentMember:
 * One member, owning the hidden forms immediately before its ID.
 *
 * ```text
 * service a
 * junction j
 * align row a j
 *           ^
 * ```
 */
export interface ArchitectureAlignmentMember extends NodeBase {
  readonly type: "ArchitectureAlignmentMember"
  readonly textBeforeId: readonly ArchitectureIgnoredText[]
  readonly id: Identifier
}

/**
 * ast/architecture.md, ArchitectureTitleStatement:
 * Text after title and one ASCII separator, or null.
 *
 * ```text
 * title T
 * ^^^^^^^
 * ```
 */
export interface ArchitectureTitleStatement extends NodeBase {
  readonly type: "ArchitectureTitleStatement"
  readonly value: ArchitectureLiteral | null
  readonly textAfter: readonly ArchitectureIgnoredText[]
}

/**
 * ast/architecture.md, ArchitectureAccTitleStatement:
 * Untrimmed colon-line content, or null when empty.
 *
 * ```text
 * accTitle: Network
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ArchitectureAccTitleStatement extends NodeBase {
  readonly type: "ArchitectureAccTitleStatement"
  readonly value: ArchitectureLiteral | null
  readonly textAfter: readonly ArchitectureIgnoredText[]
}

/**
 * ast/architecture.md, ArchitectureAccDescrStatement:
 * Untrimmed colon-line description, or null when empty.
 *
 * ```text
 * accDescr: D
 * ^^^^^^^^^^^
 * ```
 */
export interface ArchitectureAccDescrStatement extends NodeBase {
  readonly type: "ArchitectureAccDescrStatement"
  readonly value: ArchitectureLiteral | null
  readonly textAfter: readonly ArchitectureIgnoredText[]
}

/**
 * ast/architecture.md, ArchitectureAccDescrBlockStatement:
 * First-close description block with trimmed content, or null.
 *
 * ```text
 * accDescr { D }
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface ArchitectureAccDescrBlockStatement extends NodeBase {
  readonly type: "ArchitectureAccDescrBlockStatement"
  readonly value: ArchitectureLiteral | null
  readonly textAfter: readonly ArchitectureIgnoredText[]
}

/**
 * ast/architecture.md, ArchitectureLabel:
 * Authored content and the first complete quoted or bare alternative.
 *
 * ```text
 * group g(cloud)[Group]
 *               ^^^^^^^
 * ```
 */
export interface ArchitectureLabel extends NodeBase {
  readonly type: "ArchitectureLabel"
  readonly kind: "string" | "text"
  readonly value: string
}

/**
 * ast/architecture.md, ArchitectureLiteral:
 * Written common-value text, without common trivia.
 *
 * ```text
 * title T
 *       ^
 * ```
 */
export interface ArchitectureLiteral extends NodeBase {
  readonly type: "ArchitectureLiteral"
  readonly value: string
}

/**
 * ast/architecture.md, ArchitectureIgnoredText:
 * One whole native hidden form, excluding its consumed following LF.
 *
 * ```text
 * %%{}%%
 * ^^^^^^
 * ```
 */
export interface ArchitectureIgnoredText extends NodeBase {
  readonly type: "ArchitectureIgnoredText"
  readonly kind: "yaml-block" | "directive"
  readonly value: string
}

/** ast/architecture.md, ArchitectureDiagram: body items in authored order. */
export type ArchitectureBodyItem =
  | ArchitectureGroupStatement
  | ArchitectureServiceStatement
  | ArchitectureJunctionStatement
  | ArchitectureEdgeStatement
  | ArchitectureAlignmentStatement
  | ArchitectureTitleStatement
  | ArchitectureAccTitleStatement
  | ArchitectureAccDescrStatement
  | ArchitectureAccDescrBlockStatement
  | ArchitectureIgnoredText

/** Every node type of the architecture tree. */
export type ArchitectureNode =
  | ArchitectureDiagram
  | ArchitectureBodyItem
  | ArchitectureArrow
  | ArchitectureAlignmentMember
  | ArchitectureLabel
  | ArchitectureLiteral
