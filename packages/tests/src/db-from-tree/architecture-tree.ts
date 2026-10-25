import type { Identifier, StringLiteral, TreeNode } from "./tree.ts"

/** ast/architecture.md: only the authored fields the summary reads. */
export interface ArchitectureDiagram extends TreeNode {
  readonly type: "ArchitectureDiagram"
  readonly body: readonly ArchitectureStatement[]
}

/** A bracketed label keeps its written range, including its delimiters. */
interface ArchitectureLabel extends TreeNode {
  readonly type: "ArchitectureLabel"
  readonly kind: "text" | "string"
  readonly value: string
}

/** Declarations stay flat; their parent references are not child bodies. */
type Declaration = TreeNode & {
  readonly type: "ArchitectureGroupStatement" | "ArchitectureServiceStatement"
  readonly id: Identifier
  readonly icon: Identifier | StringLiteral | null
  readonly title: ArchitectureLabel | null
  readonly in: Identifier | null
}

/** The accepted tree already satisfies the specification's semantic conditions. */
export type ArchitectureStatement =
  | Declaration
  | (TreeNode & {
      readonly type: "ArchitectureJunctionStatement"
      readonly id: Identifier
      readonly in: Identifier | null
    })
  | (TreeNode & {
      readonly type: "ArchitectureEdgeStatement"
      readonly lhsId: Identifier
      readonly lhsGroup: boolean
      readonly rhsId: Identifier
      readonly rhsGroup: boolean
      readonly arrow: TreeNode & {
        readonly startDirection: string
        readonly startMarker: string
        readonly endDirection: string
        readonly endMarker: string
        readonly title: ArchitectureLabel | null
      }
    })
  | (TreeNode & {
      readonly type: "ArchitectureAlignmentStatement"
      readonly direction: string
      readonly members: readonly (TreeNode & { readonly id: Identifier })[]
    })
  | (TreeNode & {
      readonly type:
        | "ArchitectureTitleStatement"
        | "ArchitectureAccTitleStatement"
        | "ArchitectureAccDescrStatement"
        | "ArchitectureAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
  | (TreeNode & { readonly type: "ArchitectureIgnoredText" })
