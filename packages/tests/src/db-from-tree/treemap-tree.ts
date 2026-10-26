import type {
  Identifier,
  NumericLiteral,
  StringLiteral,
  TreeNode,
} from "./tree.ts"

/** ast/treemap.md: the flat source-ordered body read by the published summary. */
export interface TreemapDiagram extends TreeNode {
  readonly type: "TreemapDiagram"
  readonly body: readonly TreemapStatement[]
}

/** Authored rows; only sections enter the parent stack. */
export type TreemapRow = TreeNode & {
  readonly indent: number
  readonly name: StringLiteral
  readonly classSelector: Identifier | null
} & (
    | { readonly type: "TreemapSection" }
    | { readonly type: "TreemapLeaf"; readonly value: NumericLiteral }
  )

/** The builder reads accepted syntax and never decides acceptance. */
type TreemapStatement =
  | TreemapRow
  | (TreeNode & {
      readonly type: "TreemapClassDefStatement"
      readonly name: Identifier
      readonly style: TreeNode | null
    })
  | (TreeNode & {
      readonly type:
        | "TreemapTitleStatement"
        | "TreemapAccTitleStatement"
        | "TreemapAccDescrStatement"
        | "TreemapAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
