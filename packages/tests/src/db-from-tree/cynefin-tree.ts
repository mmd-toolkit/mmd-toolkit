import type { StringLiteral, TreeNode } from "./tree.ts"

/** ast/cynefin.md: only fields read by the published Db summary. */
export interface CynefinDiagram extends TreeNode {
  readonly type: "CynefinDiagram"
  readonly body: readonly CynefinStatement[]
}

/** The five authored domain words need no identifier or generated identity. */
type DomainName = "complex" | "complicated" | "chaotic" | "clear" | "confusion"

/** Every written item survives until its containing block is replaced. */
interface CynefinDomainItem extends TreeNode {
  readonly label: StringLiteral
}

/** Accepted occurrences remain separate from publication and replacement. */
type CynefinStatement =
  | (TreeNode & {
      readonly type: "CynefinDomainStatement"
      readonly name: DomainName
      readonly items: readonly CynefinDomainItem[]
    })
  | (TreeNode & {
      readonly type: "CynefinTransitionStatement"
      readonly from: DomainName
      readonly to: DomainName
      readonly label: StringLiteral | null
    })
  | (TreeNode & {
      readonly type:
        | "CynefinTitleStatement"
        | "CynefinAccTitleStatement"
        | "CynefinAccDescrStatement"
        | "CynefinAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
  | (TreeNode & { readonly type: "CynefinIgnoredText" })
