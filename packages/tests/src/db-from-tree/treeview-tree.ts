import type { Identifier, StringLiteral, TreeNode } from "./tree.ts"

/** ast/treeview.md: the flat occurrences that determine the published forest. */
export interface TreeviewDiagram extends TreeNode {
  readonly type: "TreeviewDiagram"
  readonly body: readonly TreeviewStatement[]
}

/** Every annotation is retained; later assignments replace earlier ones. */
type TreeviewAnnotation =
  | (TreeNode & {
      readonly type: "TreeviewClassAnnotation"
      readonly name: Identifier
    })
  | (TreeNode & {
      readonly type: "TreeviewIconAnnotation"
      readonly name: Identifier | null
    })
  | (TreeNode & {
      readonly type: "TreeviewDescriptionAnnotation"
      readonly value: TreeNode | null
    })

/** The builder receives an accepted tree and does not decide acceptance. */
type TreeviewStatement =
  | (TreeNode & {
      readonly type: "TreeviewNode"
      readonly indent: number
      readonly name:
        StringLiteral | (TreeNode & { readonly type: "TreeviewIdentifier" })
      readonly annotations: readonly TreeviewAnnotation[]
    })
  | (TreeNode & {
      readonly type:
        | "TreeviewTitleStatement"
        | "TreeviewAccTitleStatement"
        | "TreeviewAccDescrStatement"
        | "TreeviewAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
  | (TreeNode & { readonly type: "TreeviewIgnoredText" })
