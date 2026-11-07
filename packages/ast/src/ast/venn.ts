/**
 * The nodes of ast/venn.md. Values keep written text without common trivia.
 * Statement examples stand after `venn-beta` and a line feed.
 */
import type {
  Identifier,
  NodeBase,
  NumericLiteral,
  StringLiteral,
} from "../ast.ts"

/**
 * ast/venn.md, VennDiagram: child field `body`.
 *
 * ```text
 * venn-beta
 * ^^^^^^^^^
 * ```
 */
export interface VennDiagram extends NodeBase {
  readonly type: "VennDiagram"
  /** Statements in written order, without indentation nesting. */
  readonly body: readonly VennStatement[]
}

/** All statement types defined by ast/venn.md, VennDiagram. */
export type VennStatement =
  | VennSubsetStatement
  | VennTextStatement
  | VennStyleStatement
  | VennTitleStatement
  | VennIgnoredText

/**
 * ast/venn.md, VennSubsetStatement: child fields `sets`, `label`, `size`.
 *
 * ```text
 * set A
 * ^^^^^
 * ```
 */
export interface VennSubsetStatement extends NodeBase {
  readonly type: "VennSubsetStatement"
  /** The keyword in lower case. */
  readonly kind: "set" | "union"
  /** One name for set; at least two for union, with duplicates retained. */
  readonly sets: readonly (Identifier | StringLiteral)[]
  /** The written bracket label, or null when absent. */
  readonly label: VennLabel | null
  /** The written size, or null when absent. */
  readonly size: NumericLiteral | null
}

/**
 * ast/venn.md, VennTextStatement: child fields `targets`, `id`, `label`.
 *
 * ```text
 * text A hello
 * ^^^^^^^^^^^^
 * ```
 */
export interface VennTextStatement extends NodeBase {
  readonly type: "VennTextStatement"
  /** Explicit written targets; null for implicit text. */
  readonly targets: readonly (Identifier | StringLiteral)[] | null
  /** The written id, including numeric spelling in raw. */
  readonly id: Identifier | StringLiteral | NumericLiteral
  /** The optional label; always null for numeric ids. */
  readonly label: VennLabel | null
}

/**
 * ast/venn.md, VennStyleStatement: child fields `targets`, `properties`.
 *
 * ```text
 * style A fill:red
 * ^^^^^^^^^^^^^^^^
 * ```
 */
export interface VennStyleStatement extends NodeBase {
  readonly type: "VennStyleStatement"
  /** Nonempty written target list, retaining duplicates. */
  readonly targets: readonly (Identifier | StringLiteral)[]
  /** Nonempty written properties, retaining repeated keys. */
  readonly properties: readonly VennStyleProperty[]
}

/**
 * ast/venn.md, VennStyleProperty: child fields `key`, `value`.
 *
 * ```text
 * style A fill:red
 *         ^^^^^^^^
 * ```
 */
export interface VennStyleProperty extends NodeBase {
  readonly type: "VennStyleProperty"
  /** The bare, nonreserved property key. */
  readonly key: Identifier
  /** A quoted string or the written atoms and intervening whitespace. */
  readonly value: StringLiteral | VennLiteral
}

/**
 * ast/venn.md, VennTitleStatement: child field `value`.
 *
 * ```text
 * title T
 * ^^^^^^^
 * ```
 */
export interface VennTitleStatement extends NodeBase {
  readonly type: "VennTitleStatement"
  /** Nonempty text after the first whitespace separator. */
  readonly value: VennLiteral
}

/**
 * ast/venn.md, VennLabel: no child fields.
 *
 * ```text
 * set A[Alpha]
 *      ^^^^^^^
 * ```
 */
export interface VennLabel extends NodeBase {
  readonly type: "VennLabel"
  /** Bare bracket text or an immediately quoted bracket string. */
  readonly kind: "text" | "string"
  /** Written interior without brackets or string quotes. */
  readonly value: string
}

/**
 * ast/venn.md, VennLiteral: no child fields.
 *
 * ```text
 * title T
 *       ^
 * ```
 */
export interface VennLiteral extends NodeBase {
  readonly type: "VennLiteral"
  /** Its written text, including interior whitespace. */
  readonly value: string
}

/**
 * ast/venn.md, VennIgnoredText: no child fields.
 *
 * ```text
 * venn-beta a%% c
 *           ^
 * ```
 */
export interface VennIgnoredText extends NodeBase {
  readonly type: "VennIgnoredText"
  /** The swallowed non-whitespace code unit, excluding the comment. */
  readonly value: string
}

/** Every node type defined by ast/venn.md. */
export type VennNode =
  VennDiagram | VennStatement | VennStyleProperty | VennLabel | VennLiteral
