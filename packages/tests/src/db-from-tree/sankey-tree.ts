/**
 * The nodes of a sankey tree that the Db reads: the fields of
 * `packages/spec/docs/ast/sankey.md` that `sankey.ts` uses, and no others.
 */
import type { StringLiteral, TreeNode } from "./tree.ts"

/** ast/sankey.md: SankeyDiagram. */
export interface SankeyDiagram extends TreeNode {
  readonly type: "SankeyDiagram"
  readonly body: readonly SankeyLinkStatement[]
}

/** ast/sankey.md: SankeyLinkStatement. */
export interface SankeyLinkStatement extends TreeNode {
  readonly type: "SankeyLinkStatement"
  readonly source: SankeyIdentifier | StringLiteral
  readonly target: SankeyIdentifier | StringLiteral
  readonly value: SankeyLiteral | StringLiteral
}

/** ast/sankey.md: SankeyIdentifier. */
export interface SankeyIdentifier extends TreeNode {
  readonly type: "SankeyIdentifier"
}

/** ast/sankey.md: SankeyLiteral. */
export interface SankeyLiteral extends TreeNode {
  readonly type: "SankeyLiteral"
}
