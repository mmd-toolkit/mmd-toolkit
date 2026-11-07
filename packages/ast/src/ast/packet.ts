/**
 * The ten source nodes of ast/packet.md. Values retain authored text; common
 * conversions do not change the source tree.
 * The marks in each example show the node's range after the packet header.
 */
import type { NodeBase, NumericLiteral, StringLiteral } from "../ast.ts"

/**
 * ast/packet.md, PacketDiagram: retained pre-header forms and written body items, in visitor order.
 *
 * ```text
 * packet
 * ^^^^^^
 * title T
 * ^^^^^^^
 * accTitle: A
 * ^^^^^^^^^^^
 * accDescr { D }
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface PacketDiagram extends NodeBase {
  readonly type: "PacketDiagram"
  readonly textBeforeHeader: readonly PacketIgnoredText[]
  readonly body: readonly PacketBodyItem[]
}

/** ast/packet.md, PacketDiagram: written statements and retained hidden forms. */
export type PacketBodyItem =
  | PacketRangeBlockStatement
  | PacketSingleBlockStatement
  | PacketRelativeBlockStatement
  | PacketTitleStatement
  | PacketAccTitleStatement
  | PacketAccDescrStatement
  | PacketAccDescrBlockStatement
  | PacketIgnoredText

/**
 * ast/packet.md, PacketRangeBlockStatement: an authored inclusive range,
 * with hidden forms in the four interior gaps and before visible EOL.
 *
 * ```text
 * 0-3: "range"
 * ^^^^^^^^^^^^
 * ```
 */
export interface PacketRangeBlockStatement extends NodeBase {
  readonly type: "PacketRangeBlockStatement"
  readonly start: NumericLiteral
  readonly textBeforeDash: readonly PacketIgnoredText[]
  readonly textBeforeEnd: readonly PacketIgnoredText[]
  readonly end: NumericLiteral
  readonly textBeforeColon: readonly PacketIgnoredText[]
  readonly textBeforeLabel: readonly PacketIgnoredText[]
  readonly label: StringLiteral
  readonly textAfter: readonly PacketIgnoredText[]
}

/**
 * ast/packet.md, PacketSingleBlockStatement: a written single position;
 * no end is synthesized.
 *
 * ```text
 * 0: "single"
 * ^^^^^^^^^^^
 * ```
 */
export interface PacketSingleBlockStatement extends NodeBase {
  readonly type: "PacketSingleBlockStatement"
  readonly start: NumericLiteral
  readonly textBeforeColon: readonly PacketIgnoredText[]
  readonly textBeforeLabel: readonly PacketIgnoredText[]
  readonly label: StringLiteral
  readonly textAfter: readonly PacketIgnoredText[]
}

/**
 * ast/packet.md, PacketRelativeBlockStatement: a plus and unsigned count;
 * absolute positions are not synthesized and plus stays outside count.raw.
 *
 * ```text
 * +2: "two"
 * ^^^^^^^^^
 * ```
 */
export interface PacketRelativeBlockStatement extends NodeBase {
  readonly type: "PacketRelativeBlockStatement"
  readonly textBeforeCount: readonly PacketIgnoredText[]
  readonly count: NumericLiteral
  readonly textBeforeColon: readonly PacketIgnoredText[]
  readonly textBeforeLabel: readonly PacketIgnoredText[]
  readonly label: StringLiteral
  readonly textAfter: readonly PacketIgnoredText[]
}

/**
 * ast/packet.md, PacketTitleStatement: text after title and one ASCII separator,
 * or null when empty, followed by retained hidden forms before EOL.
 *
 * ```text
 * title T
 * ^^^^^^^
 * ```
 */
export interface PacketTitleStatement extends NodeBase {
  readonly type: "PacketTitleStatement"
  readonly value: PacketLiteral | null
  readonly textAfter: readonly PacketIgnoredText[]
}

/**
 * ast/packet.md, PacketAccTitleStatement: written colon-line content, including
 * padding, or null when empty, and hidden forms before EOL.
 *
 * ```text
 * accTitle: A
 * ^^^^^^^^^^^
 * ```
 */
export interface PacketAccTitleStatement extends NodeBase {
  readonly type: "PacketAccTitleStatement"
  readonly value: PacketLiteral | null
  readonly textAfter: readonly PacketIgnoredText[]
}

/**
 * ast/packet.md, PacketAccDescrStatement: written colon-line content, including
 * padding, or null when empty, and hidden forms before EOL.
 *
 * ```text
 * accDescr: D
 * ^^^^^^^^^^^
 * ```
 */
export interface PacketAccDescrStatement extends NodeBase {
  readonly type: "PacketAccDescrStatement"
  readonly value: PacketLiteral | null
  readonly textAfter: readonly PacketIgnoredText[]
}

/**
 * ast/packet.md, PacketAccDescrBlockStatement: the first-close block, with its
 * trimmed interior or null and hidden forms before EOL.
 *
 * ```text
 * accDescr { A }
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface PacketAccDescrBlockStatement extends NodeBase {
  readonly type: "PacketAccDescrBlockStatement"
  readonly value: PacketLiteral | null
  readonly textAfter: readonly PacketIgnoredText[]
}

/**
 * ast/packet.md, PacketLiteral: authored common-value text, without common trivia.
 * No child fields; line values keep padding and block values trim it.
 *
 * ```text
 * title T
 *       ^
 * ```
 */
export interface PacketLiteral extends NodeBase {
  readonly type: "PacketLiteral"
  readonly value: string
}

/**
 * ast/packet.md, PacketIgnoredText: one hidden form, including its fences but
 * excluding the LF consumed after its closer. No child fields.
 *
 * ```text
 * %%{}%%
 * ^^^^^^
 * ```
 */
export interface PacketIgnoredText extends NodeBase {
  readonly type: "PacketIgnoredText"
  readonly kind: "yaml-block" | "directive"
  readonly value: string
}

/** Every node type of the packet tree. */
export type PacketNode = PacketDiagram | PacketBodyItem | PacketLiteral
