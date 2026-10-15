/**
 * The nodes of an xychart tree that the Db reads: the fields of
 * `packages/spec/docs/ast/xychart.md` that `xychart.ts` uses, and no others.
 */
import type { NumericLiteral, StringLiteral, TreeNode } from "./tree.ts"

/** ast/xychart.md: XychartDiagram. */
export interface XychartDiagram extends TreeNode {
  readonly type: "XychartDiagram"
  readonly headers: readonly XychartHeader[]
  readonly body: readonly XychartStatement[]
}

/** ast/xychart.md: XychartHeader. */
export interface XychartHeader extends TreeNode {
  readonly type: "XychartHeader"
  readonly orientation: string | null
}

/** ast/xychart.md: XychartStatement. */
export type XychartStatement =
  | XychartTitleStatement
  | XychartXAxisStatement
  | XychartYAxisStatement
  | XychartPlotStatement
  | XychartAccTitleStatement
  | XychartAccDescrStatement
  | XychartAccDescrBlockStatement

/** ast/xychart.md: a text that is written without quotes or in quotes. */
export type XychartText = XychartLiteral | StringLiteral

/** ast/xychart.md: XychartLiteral. */
export interface XychartLiteral extends TreeNode {
  readonly type: "XychartLiteral"
}

/** ast/xychart.md: XychartTitleStatement. */
export interface XychartTitleStatement extends TreeNode {
  readonly type: "XychartTitleStatement"
  readonly value: XychartText
}

/** ast/xychart.md: XychartXAxisStatement. */
export interface XychartXAxisStatement extends TreeNode {
  readonly type: "XychartXAxisStatement"
  readonly title: XychartText | null
  readonly data: XychartBand | XychartRange | null
}

/** ast/xychart.md: XychartYAxisStatement. */
export interface XychartYAxisStatement extends TreeNode {
  readonly type: "XychartYAxisStatement"
  readonly title: XychartText | null
  readonly data: XychartRange | null
}

/** ast/xychart.md: XychartBand. */
export interface XychartBand extends TreeNode {
  readonly type: "XychartBand"
  readonly categories: readonly XychartText[]
}

/** ast/xychart.md: XychartRange. */
export interface XychartRange extends TreeNode {
  readonly type: "XychartRange"
  readonly start: NumericLiteral
  readonly end: NumericLiteral
}

/** ast/xychart.md: XychartPlotStatement. */
export interface XychartPlotStatement extends TreeNode {
  readonly type: "XychartPlotStatement"
  readonly kind: string
  readonly title: XychartText | null
  readonly values: readonly XychartValue[]
}

/** ast/xychart.md: XychartValue. */
export interface XychartValue extends TreeNode {
  readonly type: "XychartValue"
  readonly value: NumericLiteral
  readonly label: StringLiteral | null
}

/** ast/xychart.md: XychartAccTitleStatement. */
export interface XychartAccTitleStatement extends TreeNode {
  readonly type: "XychartAccTitleStatement"
  readonly value: XychartLiteral | null
}

/** ast/xychart.md: XychartAccDescrStatement. */
export interface XychartAccDescrStatement extends TreeNode {
  readonly type: "XychartAccDescrStatement"
  readonly value: XychartLiteral | null
}

/** ast/xychart.md: XychartAccDescrBlockStatement. */
export interface XychartAccDescrBlockStatement extends TreeNode {
  readonly type: "XychartAccDescrBlockStatement"
  readonly value: XychartLiteral | null
  readonly closed: boolean
}
