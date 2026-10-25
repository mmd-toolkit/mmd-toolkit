import type { NumericLiteral, StringLiteral, TreeNode } from "./tree.ts"

/** ast/packet.md: only authored fields that contribute to the summary. */
export interface PacketDiagram extends TreeNode {
  readonly type: "PacketDiagram"
  readonly body: readonly PacketStatement[]
}

/** Keep each written block form; row splitting never changes the tree. */
export type PacketBlock =
  | (TreeNode & {
      readonly type: "PacketRangeBlockStatement"
      readonly start: NumericLiteral
      readonly end: NumericLiteral
      readonly label: StringLiteral
    })
  | (TreeNode & {
      readonly type: "PacketSingleBlockStatement"
      readonly start: NumericLiteral
      readonly label: StringLiteral
    })
  | (TreeNode & {
      readonly type: "PacketRelativeBlockStatement"
      readonly count: NumericLiteral
      readonly label: StringLiteral
    })

/** Accepted occurrences, including empty assignments and unpublished blocks. */
export type PacketStatement =
  | PacketBlock
  | (TreeNode & {
      readonly type:
        | "PacketTitleStatement"
        | "PacketAccTitleStatement"
        | "PacketAccDescrStatement"
        | "PacketAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
  | (TreeNode & { readonly type: "PacketIgnoredText" })
