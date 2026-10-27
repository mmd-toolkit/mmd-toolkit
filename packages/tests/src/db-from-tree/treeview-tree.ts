import type { Identifier, StringLiteral, TreeNode } from "./tree.ts"

/** ast/treeview.md: the nested occurrences that determine the published forest. */
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

/** An authored hierarchy node; the builder reads the nesting, not indentation. */
export interface TreeviewNode extends TreeNode {
  readonly type: "TreeviewNode"
  readonly name:
    StringLiteral | (TreeNode & { readonly type: "TreeviewIdentifier" })
  readonly annotations: readonly TreeviewAnnotation[]
  readonly children: readonly TreeviewNode[]
}

/** The builder receives an accepted tree and does not decide acceptance. */
type TreeviewStatement =
  | TreeviewNode
  | (TreeNode & {
      readonly type:
        | "TreeviewTitleStatement"
        | "TreeviewAccTitleStatement"
        | "TreeviewAccDescrStatement"
        | "TreeviewAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
  | (TreeNode & { readonly type: "TreeviewIgnoredText" })
