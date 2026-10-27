import type {
  Identifier,
  NumericLiteral,
  StringLiteral,
  TreeNode,
} from "./tree.ts"

/** ast/treemap.md: the nested source tree read by the published summary. */
export interface TreemapDiagram extends TreeNode {
  readonly type: "TreemapDiagram"
  readonly body: readonly (TreemapRow | TreemapStatement)[]
}

/** Authored rows; only sections own children. */
export type TreemapRow = TreeNode & {
  readonly statementsBefore: readonly TreemapStatement[]
  readonly name: StringLiteral
  readonly classSelector: Identifier | null
} & (
    | {
        readonly type: "TreemapSection"
        readonly children: readonly TreemapRow[]
      }
    | { readonly type: "TreemapLeaf"; readonly value: NumericLiteral }
  )

/** The builder reads accepted syntax and never decides acceptance. */
type TreemapStatement =
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
