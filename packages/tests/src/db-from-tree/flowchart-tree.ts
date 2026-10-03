/**
 * The nodes of a flowchart tree that the Db reads: the fields of
 * `packages/spec/docs/ast/flowchart.md` that `flowchart.ts` uses, and no
 * others. The Db reads the text of a value from the source through the range
 * of its node, so a value that is a leaf node has its type and its range
 * only.
 */
import type {
  Identifier,
  NumericLiteral,
  StringLiteral,
  TreeNode,
} from "./tree.ts"

/** ast/flowchart.md, FlowchartDiagram: the body of the flowchart diagram types. */
export interface FlowchartDiagram extends TreeNode {
  readonly type: "FlowchartDiagram"
  readonly direction: string | null
  readonly body: readonly FlowchartStatement[]
}

/** ast/flowchart.md, FlowchartDiagram: FlowchartStatement. */
export type FlowchartStatement =
  | FlowchartEmptyStatement
  | FlowchartVertexStatement
  | FlowchartSubgraphStatement
  | FlowchartStyleStatement
  | FlowchartClassDefStatement
  | FlowchartClassStatement
  | FlowchartClickCallbackStatement
  | FlowchartClickUrlStatement
  | FlowchartLinkStyleStatement
  | FlowchartDefaultLinkStyleStatement
  | FlowchartDirectionStatement
  | FlowchartAccTitleStatement
  | FlowchartAccDescrStatement
  | FlowchartAccDescrBlockStatement

/** ast/flowchart.md: FlowchartEmptyStatement. */
export interface FlowchartEmptyStatement extends TreeNode {
  readonly type: "FlowchartEmptyStatement"
}

/** ast/flowchart.md: FlowchartVertexStatement. */
export interface FlowchartVertexStatement extends TreeNode {
  readonly type: "FlowchartVertexStatement"
  readonly first: FlowchartVertexGroup
  readonly links: readonly FlowchartLink[]
}

/** ast/flowchart.md: FlowchartVertexGroup. */
export interface FlowchartVertexGroup extends TreeNode {
  readonly type: "FlowchartVertexGroup"
  readonly vertices: readonly FlowchartVertex[]
}

/** ast/flowchart.md: FlowchartVertex. */
export interface FlowchartVertex extends TreeNode {
  readonly type: "FlowchartVertex"
  readonly id: Identifier
  readonly shape: FlowchartShape | null
  readonly cssClass: Identifier | null
  readonly data: readonly FlowchartDataBlock[]
}

/** diagrams/flowchart.md, Shapes: FlowchartShapeName. */
export type FlowchartShapeName =
  | "rectangle"
  | "rounded"
  | "circle"
  | "double-circle"
  | "diamond"
  | "hexagon"
  | "stadium"
  | "framed-rectangle"
  | "cylinder"
  | "odd"
  | "ellipse"
  | "trapezoid-bottom"
  | "lean-right"
  | "trapezoid-top"
  | "lean-left"

/** ast/flowchart.md: FlowchartShape. */
export interface FlowchartShape extends TreeNode {
  readonly type: "FlowchartShape"
  readonly name: FlowchartShapeName
  readonly property: FlowchartShapeProperty | null
  readonly label: FlowchartLabel
}

/** ast/flowchart.md: FlowchartShapeProperty. */
export interface FlowchartShapeProperty extends TreeNode {
  readonly type: "FlowchartShapeProperty"
  readonly name: Identifier
  readonly value: Identifier
}

/** ast/flowchart.md: FlowchartLink. */
export interface FlowchartLink extends TreeNode {
  readonly type: "FlowchartLink"
  readonly id: Identifier | null
  readonly opening: FlowchartOpeningArrow | null
  readonly arrow: FlowchartArrow
  readonly label: FlowchartLabel | null
  readonly target: FlowchartVertexGroup
}

/** ast/flowchart.md, FlowchartArrow: FlowchartArrowMarker. */
export type FlowchartArrowMarker = "none" | "arrow" | "cross" | "circle"

/** ast/flowchart.md, FlowchartArrow: FlowchartArrowLine. */
export type FlowchartArrowLine = "solid" | "thick" | "dotted" | "invisible"

/** ast/flowchart.md, FlowchartOpeningArrow: FlowchartOpeningArrowLine. */
export type FlowchartOpeningArrowLine = "solid" | "thick" | "dotted"

/** ast/flowchart.md: FlowchartArrow. */
export interface FlowchartArrow extends TreeNode {
  readonly type: "FlowchartArrow"
  readonly startMarker: FlowchartArrowMarker
  readonly line: FlowchartArrowLine
  readonly length: number
  readonly endMarker: FlowchartArrowMarker
}

/** ast/flowchart.md: FlowchartOpeningArrow. */
export interface FlowchartOpeningArrow extends TreeNode {
  readonly type: "FlowchartOpeningArrow"
  readonly startMarker: FlowchartArrowMarker
  readonly line: FlowchartOpeningArrowLine
}

/** diagrams/flowchart.md, Labels: FlowchartLabelKind. */
export type FlowchartLabelKind = "text" | "string" | "markdown"

/** ast/flowchart.md: FlowchartLabel. */
export interface FlowchartLabel extends TreeNode {
  readonly type: "FlowchartLabel"
  readonly kind: FlowchartLabelKind
}

/** ast/flowchart.md: FlowchartDataBlock. */
export interface FlowchartDataBlock extends TreeNode {
  readonly type: "FlowchartDataBlock"
}

/** ast/flowchart.md: FlowchartSubgraphStatement. */
export interface FlowchartSubgraphStatement extends TreeNode {
  readonly type: "FlowchartSubgraphStatement"
  readonly name: FlowchartLabel
  readonly title: FlowchartLabel | null
  readonly body: readonly FlowchartStatement[]
}

/** ast/flowchart.md: FlowchartStyleStatement. */
export interface FlowchartStyleStatement extends TreeNode {
  readonly type: "FlowchartStyleStatement"
  readonly id: Identifier
  readonly styles: readonly (FlowchartLiteral | null)[]
}

/** ast/flowchart.md: FlowchartClassDefStatement. */
export interface FlowchartClassDefStatement extends TreeNode {
  readonly type: "FlowchartClassDefStatement"
  readonly cssClasses: readonly (Identifier | null)[]
  readonly styles: readonly (FlowchartLiteral | null)[]
}

/** ast/flowchart.md: FlowchartClassStatement. */
export interface FlowchartClassStatement extends TreeNode {
  readonly type: "FlowchartClassStatement"
  readonly ids: readonly (Identifier | null)[]
  readonly cssClass: Identifier
}

/** ast/flowchart.md: FlowchartClickCallbackStatement. */
export interface FlowchartClickCallbackStatement extends TreeNode {
  readonly type: "FlowchartClickCallbackStatement"
  readonly ids: readonly (Identifier | null)[]
  readonly tooltip: StringLiteral | null
}

/** diagrams/flowchart.md, The statement context: FlowchartLinkTarget. */
export type FlowchartLinkTarget = "_self" | "_blank" | "_parent" | "_top"

/** ast/flowchart.md: FlowchartClickUrlStatement. */
export interface FlowchartClickUrlStatement extends TreeNode {
  readonly type: "FlowchartClickUrlStatement"
  readonly ids: readonly (Identifier | null)[]
  readonly url: StringLiteral
  readonly tooltip: StringLiteral | null
  readonly target: FlowchartLinkTarget | null
}

/** ast/flowchart.md: FlowchartLinkStyleStatement. */
export interface FlowchartLinkStyleStatement extends TreeNode {
  readonly type: "FlowchartLinkStyleStatement"
  readonly indices: readonly NumericLiteral[]
  readonly interpolate: Identifier | null
  readonly styles: readonly (FlowchartLiteral | null)[]
}

/** ast/flowchart.md: FlowchartDefaultLinkStyleStatement. */
export interface FlowchartDefaultLinkStyleStatement extends TreeNode {
  readonly type: "FlowchartDefaultLinkStyleStatement"
  readonly interpolate: Identifier | null
  readonly styles: readonly (FlowchartLiteral | null)[]
}

/** ast/flowchart.md, FlowchartDirectionStatement: FlowchartStatementDirection. */
export type FlowchartStatementDirection = "TB" | "BT" | "RL" | "LR" | "TD"

/** ast/flowchart.md: FlowchartDirectionStatement. */
export interface FlowchartDirectionStatement extends TreeNode {
  readonly type: "FlowchartDirectionStatement"
  readonly direction: FlowchartStatementDirection
}

/** ast/flowchart.md: FlowchartAccTitleStatement. */
export interface FlowchartAccTitleStatement extends TreeNode {
  readonly type: "FlowchartAccTitleStatement"
  readonly value: FlowchartLiteral | null
}

/** ast/flowchart.md: FlowchartAccDescrStatement. */
export interface FlowchartAccDescrStatement extends TreeNode {
  readonly type: "FlowchartAccDescrStatement"
  readonly value: FlowchartLiteral | null
}

/** ast/flowchart.md: FlowchartAccDescrBlockStatement. */
export interface FlowchartAccDescrBlockStatement extends TreeNode {
  readonly type: "FlowchartAccDescrBlockStatement"
  readonly value: FlowchartLiteral | null
  readonly closed: boolean
}

/** ast/flowchart.md: FlowchartLiteral. */
export interface FlowchartLiteral extends TreeNode {
  readonly type: "FlowchartLiteral"
}
