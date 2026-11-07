/**
 * The nodes of the sankey tree, as defined in
 * `packages/spec/docs/ast/sankey.md`, for the diagram type `sankey`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. A **link** is a record of three fields: the **source** node,
 * the **target** node, and the **value** of the flow between them.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. The
 * examples other than that of the diagram stand after the header line
 * `sankey`.
 */
import type { NodeBase, StringLiteral } from "../ast.ts"

/**
 * ast/sankey.md, SankeyDiagram: the body of the diagram type `sankey`. Its
 * child field is `body`. The header keyword, `sankey` or `sankey-beta`, is
 * not a field; its token is in `Root.tokens`. The range runs from the
 * header keyword to the last token of the diagram.
 *
 * ```text
 * sankey
 * ^^^^^^
 * a,b,1
 * ^^^^^
 * ```
 */
export interface SankeyDiagram extends NodeBase {
  readonly type: "SankeyDiagram"
  /** The links, in source order; at least one. */
  readonly body: readonly SankeyLinkStatement[]
}

/**
 * ast/sankey.md, SankeyLinkStatement: a record of three fields. Its child
 * fields are `source`, `target`, and `value`.
 *
 * ```text
 * Pumped heat,"Heating and cooling, homes",193.026
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface SankeyLinkStatement extends NodeBase {
  readonly type: "SankeyLinkStatement"
  /** The first field, the id of the source node. */
  readonly source: SankeyIdentifier | StringLiteral
  /** The second field, the id of the target node. */
  readonly target: SankeyIdentifier | StringLiteral
  /** The third field, the value. */
  readonly value: SankeyLiteral | StringLiteral
}

/**
 * ast/sankey.md, SankeyIdentifier: the id of a node written without
 * quotes, a name that may contain whitespace. No child fields.
 *
 * ```text
 *  Bio-conversion ,b,1
 *  ^^^^^^^^^^^^^^
 * ```
 */
export interface SankeyIdentifier extends NodeBase {
  readonly type: "SankeyIdentifier"
  /** The field without the whitespace at its ends, as written; empty for a field of spaces only. */
  readonly name: string
}

/**
 * ast/sankey.md, SankeyLiteral: the value of a link written without
 * quotes, any text. No child fields.
 *
 * ```text
 * a,b, 12.5
 *      ^^^^
 * ```
 */
export interface SankeyLiteral extends NodeBase {
  readonly type: "SankeyLiteral"
  /** The field without the whitespace at its ends, as written; empty for a field of spaces only. */
  readonly value: string
}

/** Every node type of the sankey tree. */
export type SankeyNode =
  SankeyDiagram | SankeyLinkStatement | SankeyIdentifier | SankeyLiteral
