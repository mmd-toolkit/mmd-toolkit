/**
 * The nodes of the block diagram tree, as defined in
 * `packages/spec/docs/ast/block.md`, for the diagram type `block`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. A block diagram places **blocks** in columns: nodes, `space`
 * blocks, and **composites**, which hold blocks of their own. Edges join
 * nodes, and classes and styles give them a look.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. The
 * examples other than that of the diagram stand after the header line
 * `block-beta`.
 */
import type {
  Identifier,
  NodeBase,
  NumericLiteral,
  StringLiteral,
} from "../ast.ts"

/**
 * ast/block.md, BlockDiagram: the body of the diagram type `block`. Its
 * child field is `body`. The header keyword, `block-beta` or `block`, is
 * not a field; its token is in `Root.tokens`. The range runs from the
 * header keyword to the last token of the diagram.
 *
 * ```text
 * block-beta
 * ^^^^^^^^^^
 *   A B
 * ^^^^^
 * ```
 */
export interface BlockDiagram extends NodeBase {
  readonly type: "BlockDiagram"
  /** The statements, in source order; at least one. */
  readonly body: readonly BlockStatement[]
}

/** ast/block.md, BlockDiagram: a statement of a block diagram. */
export type BlockStatement =
  | BlockNodeStatement
  | BlockSpaceStatement
  | BlockColumnsStatement
  | BlockCompositeStatement
  | BlockClassDefStatement
  | BlockClassStatement
  | BlockStyleStatement
  | BlockAccDescrBlockStatement

/**
 * ast/block.md, BlockNodeStatement: a node, its width, and the links that
 * follow it. Its child fields are `node`, `width`, and `links`.
 *
 * ```text
 * A:2 --> B["text"]
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface BlockNodeStatement extends NodeBase {
  readonly type: "BlockNodeStatement"
  /** The first node. */
  readonly node: BlockNode
  /** The width after the first node; null when there is none. */
  readonly width: NumericLiteral | null
  /** The links, in source order; may be none. */
  readonly links: readonly BlockLink[]
}

/**
 * ast/block.md, BlockNode: a node, an id with a shape, a block arrow, or
 * neither. Its child fields are `id` and `shape`.
 *
 * ```text
 * A ("text")
 * ^^^^^^^^^^
 * ```
 */
export interface BlockNode extends NodeBase {
  readonly type: "BlockNode"
  /** The id. */
  readonly id: Identifier
  /** The shape or the block arrow; null when there is none. */
  readonly shape: BlockShape | BlockArrowShape | null
}

/**
 * ast/block.md, BlockShape: a shape with its label, from its opening to its
 * closing. Its child field is `label`.
 *
 * ```text
 * A(("text"))
 *  ^^^^^^^^^^
 * ```
 */
export interface BlockShape extends NodeBase {
  readonly type: "BlockShape"
  /** The opening as written, such as `[`, `((`, or `[/`. */
  readonly open: string
  /** The closing as written, such as `]`, `))`, or `\]`. */
  readonly close: string
  /** The string between them. */
  readonly label: StringLiteral
}

/**
 * ast/block.md, BlockArrowShape: a block arrow, from `<[` to the `)` after
 * its directions. Its child fields are `label` and `directions`.
 *
 * ```text
 * A<["text"]>(right, down)
 *  ^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface BlockArrowShape extends NodeBase {
  readonly type: "BlockArrowShape"
  /** The string between `<[` and `]>`. */
  readonly label: StringLiteral
  /**
   * The directions, in source order, at least one: each `right`, `left`,
   * `up`, `down`, `x`, or `y`, with the whitespace after it, and, for the
   * first when no `,` stands before it, with the whitespace after the `(`.
   */
  readonly directions: readonly BlockLiteral[]
}

/**
 * ast/block.md, BlockLink: a link of a node statement, from its arrow, or
 * its opening arrow, to the node it leads to. Its child fields are
 * `opening`, `label`, `arrow`, and `target`, in source order.
 *
 * ```text
 * A -- "text" --> B
 *   ^^^^^^^^^^^^^^^
 * ```
 */
export interface BlockLink extends NodeBase {
  readonly type: "BlockLink"
  /** The opening arrow of a link with a label; null otherwise. */
  readonly opening: BlockOpeningArrow | null
  /** The arrow, or the arrow after the label. */
  readonly arrow: BlockArrow
  /** The label between the two arrows; null when there is none. */
  readonly label: StringLiteral | null
  /** The node the link leads to. */
  readonly target: BlockNode
}

/**
 * ast/block.md, BlockArrow: the marker before the line of an arrow. An `x`
 * or an `o` before the line starts an id instead.
 *
 * - `"none"`: No marker, as in `-->`.
 * - `"arrow"`: `<`, as in `<-->`.
 */
export type BlockArrowStartMarker =
  /** No marker, as in `-->`. */
  | "none"
  /** `<`, as in `<-->`. */
  | "arrow"

/**
 * ast/block.md, BlockArrow: the marker after the line of an arrow.
 *
 * - `"none"`: No marker, as in `---`.
 * - `"arrow"`: `>`, as in `-->`.
 * - `"cross"`: `x`, as in `--x`.
 * - `"circle"`: `o`, as in `--o`.
 */
export type BlockArrowEndMarker =
  /** No marker, as in `---`. */
  | "none"
  /** `>`, as in `-->`. */
  | "arrow"
  /** `x`, as in `--x`. */
  | "cross"
  /** `o`, as in `--o`. */
  | "circle"

/**
 * ast/block.md, BlockArrow and BlockOpeningArrow: the line of an arrow, by
 * the character it is drawn with.
 *
 * - `"solid"`: `-`, as in `-->` and `--`.
 * - `"thick"`: `=`, as in `==>` and `==`.
 * - `"dotted"`: `.`, as in `-.->` and `-.`.
 */
export type BlockArrowLine =
  /** `-`, as in `-->` and `--`. */
  | "solid"
  /** `=`, as in `==>` and `==`. */
  | "thick"
  /** `.`, as in `-.->` and `-.`. */
  | "dotted"

/**
 * ast/block.md, BlockArrow: an arrow, the arrow of a link or the arrow
 * after the label of a link. No child fields; its range is its token.
 *
 * ```text
 * A <--> B
 *   ^^^^
 * ```
 */
export interface BlockArrow extends NodeBase {
  readonly type: "BlockArrow"
  /** Its written text. */
  readonly value: string
  /** The marker before the line; see {@link BlockArrowStartMarker}. */
  readonly startMarker: BlockArrowStartMarker
  /** The line between the markers; see {@link BlockArrowLine}. */
  readonly line: BlockArrowLine
  /** The number of the characters of the line: its `-` or `=`, or, for a dotted line, its `.`. */
  readonly length: number
  /** The marker after the line; see {@link BlockArrowEndMarker}. */
  readonly endMarker: BlockArrowEndMarker
}

/**
 * ast/block.md, BlockOpeningArrow: the opening arrow of a link with a
 * label. No child fields; its range is its token. Its line need not be the
 * line of the arrow after the label.
 *
 * ```text
 * A -- "text" ==> B
 *   ^^
 * ```
 */
export interface BlockOpeningArrow extends NodeBase {
  readonly type: "BlockOpeningArrow"
  /** Its written text. */
  readonly value: string
  /** The marker before the line; see {@link BlockArrowStartMarker}. */
  readonly startMarker: BlockArrowStartMarker
  /** The line after the marker; see {@link BlockArrowLine}. */
  readonly line: BlockArrowLine
}

/**
 * ast/block.md, BlockSpaceStatement: `space` or `space:N`. Its child field
 * is `width`.
 *
 * ```text
 * space:2
 * ^^^^^^^
 * ```
 */
export interface BlockSpaceStatement extends NodeBase {
  readonly type: "BlockSpaceStatement"
  /** The number after `space:`; null for `space`. */
  readonly width: NumericLiteral | null
}

/**
 * ast/block.md, BlockColumnsStatement: `columns N` or `columns auto`. Its
 * child field is `count`.
 *
 * ```text
 * columns 3
 * ^^^^^^^^^
 * ```
 */
export interface BlockColumnsStatement extends NodeBase {
  readonly type: "BlockColumnsStatement"
  /** The number of columns; null for `auto`. */
  readonly count: NumericLiteral | null
}

/**
 * ast/block.md, BlockCompositeStatement: a composite, `block:G`, `block`,
 * or `block-beta`, its statements, and `end`. Its child fields are `head`
 * and `body`.
 *
 * ```text
 * block:G:2
 * ^^^^^^^^^
 *   A B
 * ^^^^^
 * end
 * ^^^
 * ```
 */
export interface BlockCompositeStatement extends NodeBase {
  readonly type: "BlockCompositeStatement"
  /** The node statement after `block:`; null for `block` and `block-beta`. */
  readonly head: BlockNodeStatement | null
  /** The statements up to `end`, in source order; at least one. */
  readonly body: readonly BlockStatement[]
}

/**
 * ast/block.md, BlockClassDefStatement: `classDef` with the name of a class
 * and its styles. Its child fields are `name` and `styles`.
 *
 * ```text
 * classDef c color:#fff,fill:#000
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface BlockClassDefStatement extends NodeBase {
  readonly type: "BlockClassDefStatement"
  /** The name of the class. */
  readonly name: Identifier
  /** The styles, the parts of the rest of the line between `,`, in source order; null for a part that is all whitespace. */
  readonly styles: readonly (BlockLiteral | null)[]
}

/**
 * ast/block.md, BlockClassStatement: `class` with ids and the name of a
 * class. Its child fields are `ids` and `cssClass`.
 *
 * ```text
 * class A,B c
 * ^^^^^^^^^^^
 * ```
 */
export interface BlockClassStatement extends NodeBase {
  readonly type: "BlockClassStatement"
  /** The ids, the parts between `,`, in source order; an id after a `,` keeps the whitespace after it. */
  readonly ids: readonly BlockLiteral[]
  /** The rest of the line, the name of the class; null when empty. */
  readonly cssClass: BlockLiteral | null
}

/**
 * ast/block.md, BlockStyleStatement: `style` with an id and styles. Its
 * child fields are `id` and `styles`.
 *
 * ```text
 * A
 * style A fill:#f00
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface BlockStyleStatement extends NodeBase {
  readonly type: "BlockStyleStatement"
  /** The id, commas included. */
  readonly id: Identifier
  /** The styles, as in {@link BlockClassDefStatement}. */
  readonly styles: readonly (BlockLiteral | null)[]
}

/**
 * ast/block.md, BlockAccDescrBlockStatement: an empty description block
 * where a statement starts. No fields and no child fields.
 *
 * ```text
 * accDescr {} A
 * ^^^^^^^^^^^
 * ```
 */
export interface BlockAccDescrBlockStatement extends NodeBase {
  readonly type: "BlockAccDescrBlockStatement"
}

/**
 * ast/block.md, BlockLiteral: the name of a class of `class`, an id of
 * `class`, a style, or a direction of a block arrow. No child fields. An id
 * of `class` keeps the whitespace after the `,` before it, a style the
 * whitespace at its ends that lies between it and a `,`, and a direction
 * the whitespace after it and, for the first when no `,` stands before it,
 * the whitespace after the `(`.
 *
 * ```text
 * A
 * style A fill:#f00 , stroke:#333
 *                    ^^^^^^^^^^^^
 * ```
 */
export interface BlockLiteral extends NodeBase {
  readonly type: "BlockLiteral"
  /** Its written text (ast.md, Nodes). */
  readonly value: string
}

/**
 * Every node type of the block diagram tree. The other diagram types name
 * this union after the diagram and `Node`, which here is the name of a node
 * type of ast/block.md.
 */
export type BlockTreeNode =
  | BlockDiagram
  | BlockStatement
  | BlockNode
  | BlockShape
  | BlockArrowShape
  | BlockLink
  | BlockArrow
  | BlockOpeningArrow
  | BlockLiteral
