/**
 * The nodes of a quadrant chart tree that the Db reads: the fields of
 * `packages/spec/docs/ast/quadrant.md` that `quadrant.ts` uses, and no others.
 */
import type { Identifier, TreeNode } from "./tree.ts"

/** ast/quadrant.md: QuadrantDiagram. */
export interface QuadrantDiagram extends TreeNode {
  readonly type: "QuadrantDiagram"
  readonly body: readonly QuadrantStatement[]
}

/** ast/quadrant.md: QuadrantStatement. */
export type QuadrantStatement =
  | QuadrantTitleStatement
  | QuadrantAccTitleStatement
  | QuadrantAccDescrStatement
  | QuadrantAccDescrBlockStatement
  | QuadrantAxisStatement
  | QuadrantQuadrantStatement
  | QuadrantPointStatement
  | QuadrantClassDefStatement

/** ast/quadrant.md: QuadrantLiteral. */
export interface QuadrantLiteral extends TreeNode {
  readonly type: "QuadrantLiteral"
}

/** ast/quadrant.md: QuadrantLabel. */
export interface QuadrantLabel extends TreeNode {
  readonly type: "QuadrantLabel"
  readonly kind: string
}

/** ast/quadrant.md: QuadrantIdentifier. */
export interface QuadrantIdentifier extends TreeNode {
  readonly type: "QuadrantIdentifier"
}

/** ast/quadrant.md: QuadrantTitleStatement. */
export interface QuadrantTitleStatement extends TreeNode {
  readonly type: "QuadrantTitleStatement"
  readonly value: QuadrantLiteral | null
}

/** ast/quadrant.md: QuadrantAccTitleStatement. */
export interface QuadrantAccTitleStatement extends TreeNode {
  readonly type: "QuadrantAccTitleStatement"
  readonly value: QuadrantLiteral
}

/** ast/quadrant.md: QuadrantAccDescrStatement. */
export interface QuadrantAccDescrStatement extends TreeNode {
  readonly type: "QuadrantAccDescrStatement"
  readonly value: QuadrantLiteral
}

/** ast/quadrant.md: QuadrantAccDescrBlockStatement. */
export interface QuadrantAccDescrBlockStatement extends TreeNode {
  readonly type: "QuadrantAccDescrBlockStatement"
  readonly value: QuadrantLiteral | null
}

/** ast/quadrant.md: QuadrantAxisStatement. */
export interface QuadrantAxisStatement extends TreeNode {
  readonly type: "QuadrantAxisStatement"
  readonly axis: string
  readonly start: QuadrantLabel
  readonly arrow: boolean
  readonly end: QuadrantLabel | null
}

/** ast/quadrant.md: QuadrantQuadrantStatement. */
export interface QuadrantQuadrantStatement extends TreeNode {
  readonly type: "QuadrantQuadrantStatement"
  readonly quadrant: number
  readonly text: QuadrantLabel
}

/** ast/quadrant.md: QuadrantPointStatement. */
export interface QuadrantPointStatement extends TreeNode {
  readonly type: "QuadrantPointStatement"
  readonly name: QuadrantLabel
  readonly className: Identifier | null
  readonly x: QuadrantLiteral
  readonly y: QuadrantLiteral
  readonly styles: readonly QuadrantLiteral[]
}

/** ast/quadrant.md: QuadrantClassDefStatement. */
export interface QuadrantClassDefStatement extends TreeNode {
  readonly type: "QuadrantClassDefStatement"
  readonly name: QuadrantIdentifier
  readonly styles: readonly QuadrantLiteral[]
}
