/**
 * The nodes of ast/ishikawa.md. Values retain written text without common
 * trivia. Node and literal examples stand after `ishikawa` and a line feed.
 */
import type { NodeBase } from "../ast.ts"

/**
 * ast/ishikawa.md, IshikawaDiagram: child field `root`.
 *
 * ```text
 * ishikawa
 * ^^^^^^^^
 * R
 * ^
 * ```
 */
export interface IshikawaDiagram extends NodeBase {
  readonly type: "IshikawaDiagram"
  /** The first node, or null when no node is written. */
  readonly root: IshikawaNode | null
}

/**
 * ast/ishikawa.md, IshikawaNode: child fields `text`, `children`.
 *
 * ```text
 * R
 * ^
 *   A
 * ^^^
 * ```
 */
export interface IshikawaNode extends NodeBase {
  readonly type: "IshikawaNode"
  /** The number of preceding line whitespace characters, excluding directives. */
  readonly indent: number
  /** The nonempty node text, including its trailing whitespace. */
  readonly text: IshikawaLiteral
  /** Its children in source order, under Ishikawa's first-cause parent rule. */
  readonly children: readonly IshikawaNode[]
}

/**
 * ast/ishikawa.md, IshikawaLiteral: no child fields.
 *
 * ```text
 * R
 * ^
 * ```
 */
export interface IshikawaLiteral extends NodeBase {
  readonly type: "IshikawaLiteral"
  /** The node text as written, including quotes, entities, and trailing whitespace. */
  readonly value: string
}

/** Every node type defined by ast/ishikawa.md; IshikawaNode names a node itself. */
export type IshikawaTreeNode = IshikawaDiagram | IshikawaNode | IshikawaLiteral
