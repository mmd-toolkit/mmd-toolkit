import type {
  Identifier,
  NumericLiteral,
  StringLiteral,
  TreeNode,
} from "./tree.ts"

/** ast/gitgraph.md: only the authored fields the summary reads. */
export interface GitgraphDiagram extends TreeNode {
  readonly type: "GitgraphDiagram"
  readonly direction: "LR" | "TB" | "BT" | null
  readonly body: readonly GitgraphStatement[]
}

/** A bare or quoted branch reference. */
export type GitgraphReference = Identifier | StringLiteral

/** Options retain every occurrence; the final scalar assignment wins. */
export type GitgraphOption =
  | (TreeNode & {
      readonly type:
        | "GitgraphIdOption"
        | "GitgraphMessageOption"
        | "GitgraphTagOption"
        | "GitgraphParentOption"
      readonly value: StringLiteral
    })
  | (TreeNode & {
      readonly type: "GitgraphTypeOption"
      readonly value: "NORMAL" | "REVERSE" | "HIGHLIGHT"
    })

/** Branch order is read from its written digits. */
export interface GitgraphOrderOption extends TreeNode {
  readonly type: "GitgraphOrderOption"
  readonly value: NumericLiteral
}

/** Accepted statements; semantic rejection belongs to the parser. */
export type GitgraphStatement =
  | (TreeNode & {
      readonly type: "GitgraphCommitStatement" | "GitgraphCherryPickStatement"
      readonly options: readonly GitgraphOption[]
    })
  | (TreeNode & {
      readonly type: "GitgraphMergeStatement"
      readonly branch: GitgraphReference
      readonly options: readonly GitgraphOption[]
    })
  | (TreeNode & {
      readonly type: "GitgraphBranchStatement"
      readonly name: GitgraphReference
      readonly order: GitgraphOrderOption | null
    })
  | (TreeNode & {
      readonly type: "GitgraphCheckoutStatement"
      readonly branch: GitgraphReference
    })
  | (TreeNode & {
      readonly type:
        | "GitgraphTitleStatement"
        | "GitgraphAccTitleStatement"
        | "GitgraphAccDescrStatement"
        | "GitgraphAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
  | (TreeNode & { readonly type: "GitgraphIgnoredText" })
