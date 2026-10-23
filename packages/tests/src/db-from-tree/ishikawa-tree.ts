import type { TreeNode } from "./tree.ts"

/** ast/ishikawa.md: the written value and range that the Db reads. */
export interface IshikawaLiteral extends TreeNode {
  readonly type: "IshikawaLiteral"
  readonly value: string
}

/** The Db reads the tree's nesting; indentation is checked by checkTree. */
export interface IshikawaNode extends TreeNode {
  readonly type: "IshikawaNode"
  readonly text: IshikawaLiteral
  readonly children: readonly IshikawaNode[]
}

/** ast/ishikawa.md: one optional root and no statement list. */
export interface IshikawaDiagram extends TreeNode {
  readonly type: "IshikawaDiagram"
  readonly root: IshikawaNode | null
}
