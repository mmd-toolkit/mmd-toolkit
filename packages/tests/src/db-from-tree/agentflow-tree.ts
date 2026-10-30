/**
 * The nodes of an Agentflow tree that the Db reads: the fields of
 * `packages/spec/docs/ast/agentflow.md` that `agentflow.ts` uses, and no
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

/** ast/agentflow.md, AgentflowDiagram: the body of the agentflow diagram types. */
export interface AgentflowDiagram extends TreeNode {
  readonly type: "AgentflowDiagram"
  readonly direction: string | null
  readonly body: readonly AgentflowStatement[]
}

/** ast/agentflow.md, AgentflowDiagram: AgentflowStatement. */
export type AgentflowStatement =
  | AgentflowEmptyStatement
  | AgentflowVertexStatement
  | AgentflowFlowStatement
  | AgentflowGlobalStatement
  | AgentflowConnectorStatement
  | AgentflowStyleStatement
  | AgentflowClassDefStatement
  | AgentflowClassStatement
  | AgentflowClickCallbackStatement
  | AgentflowClickUrlStatement
  | AgentflowLinkStyleStatement
  | AgentflowDefaultLinkStyleStatement
  | AgentflowDirectionStatement
  | AgentflowAccTitleStatement
  | AgentflowAccDescrStatement
  | AgentflowAccDescrBlockStatement

/** ast/agentflow.md: AgentflowEmptyStatement. */
export interface AgentflowEmptyStatement extends TreeNode {
  readonly type: "AgentflowEmptyStatement"
}

/** ast/agentflow.md: AgentflowVertexStatement. */
export interface AgentflowVertexStatement extends TreeNode {
  readonly type: "AgentflowVertexStatement"
  readonly first: AgentflowVertexGroup
  readonly links: readonly AgentflowLink[]
}

/** ast/agentflow.md: AgentflowVertexGroup. */
export interface AgentflowVertexGroup extends TreeNode {
  readonly type: "AgentflowVertexGroup"
  readonly vertices: readonly AgentflowVertex[]
}

/** ast/agentflow.md: AgentflowVertex. */
export interface AgentflowVertex extends TreeNode {
  readonly type: "AgentflowVertex"
  readonly id: Identifier
  readonly shape: AgentflowShape | null
  readonly cssClass: Identifier | null
  readonly data: readonly AgentflowDataBlock[]
}

/** diagrams/agentflow.md, Shapes: AgentflowShapeName. */
export type AgentflowShapeName =
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

/** ast/agentflow.md: AgentflowShape. */
export interface AgentflowShape extends TreeNode {
  readonly type: "AgentflowShape"
  readonly name: AgentflowShapeName
  readonly property: AgentflowShapeProperty | null
  readonly label: AgentflowLabel
}

/** ast/agentflow.md: AgentflowShapeProperty. */
export interface AgentflowShapeProperty extends TreeNode {
  readonly type: "AgentflowShapeProperty"
  readonly name: Identifier
  readonly value: Identifier
}

/** ast/agentflow.md: AgentflowLink. */
export interface AgentflowLink extends TreeNode {
  readonly type: "AgentflowLink"
  readonly id: Identifier | null
  readonly opening: AgentflowOpeningArrow | null
  readonly arrow: AgentflowArrow
  readonly label: AgentflowLabel | null
  readonly target: AgentflowVertexGroup
}

/** ast/agentflow.md, AgentflowArrow: AgentflowArrowMarker. */
export type AgentflowArrowMarker = "none" | "arrow" | "cross"

/** ast/agentflow.md, AgentflowArrow: AgentflowArrowLine. */
export type AgentflowArrowLine = "solid" | "dotted"

/** ast/agentflow.md, AgentflowOpeningArrow: AgentflowOpeningArrowLine. */
export type AgentflowOpeningArrowLine = "solid"

/** ast/agentflow.md: AgentflowArrow. */
export interface AgentflowArrow extends TreeNode {
  readonly type: "AgentflowArrow"
  readonly startMarker: "none"
  readonly line: AgentflowArrowLine
  readonly length: number
  readonly endMarker: AgentflowArrowMarker
}

/** ast/agentflow.md: AgentflowOpeningArrow. */
export interface AgentflowOpeningArrow extends TreeNode {
  readonly type: "AgentflowOpeningArrow"
  readonly startMarker: "none"
  readonly line: AgentflowOpeningArrowLine
}

/** diagrams/agentflow.md, Labels: AgentflowLabelKind. */
export type AgentflowLabelKind = "text" | "string" | "markdown"

/** ast/agentflow.md: AgentflowLabel. */
export interface AgentflowLabel extends TreeNode {
  readonly type: "AgentflowLabel"
  readonly kind: AgentflowLabelKind
}

/** ast/agentflow.md: AgentflowDataBlock. */
export interface AgentflowDataBlock extends TreeNode {
  readonly type: "AgentflowDataBlock"
}

/** ast/agentflow.md: the written contributing and erased name fragments. */
export interface AgentflowName extends TreeNode {
  readonly type: "AgentflowName"
  readonly parts: readonly (AgentflowLabel | AgentflowIgnoredText)[]
}

/** ast/agentflow.md: a retained erased form or direction-line fragment. */
export interface AgentflowIgnoredText extends TreeNode {
  readonly type: "AgentflowIgnoredText"
  readonly value: string
}

/** ast/agentflow.md: a flow heading and its written body. */
export interface AgentflowFlowStatement extends TreeNode {
  readonly type: "AgentflowFlowStatement"
  readonly name: AgentflowName | null
  readonly title: AgentflowLabel | null
  readonly data: readonly AgentflowDataBlock[]
  readonly body: readonly AgentflowStatement[]
}

/** ast/agentflow.md: a global body without a heading value. */
export interface AgentflowGlobalStatement extends TreeNode {
  readonly type: "AgentflowGlobalStatement"
  readonly body: readonly AgentflowStatement[]
}

/** ast/agentflow.md: a connector heading, without a body. */
export interface AgentflowConnectorStatement extends TreeNode {
  readonly type: "AgentflowConnectorStatement"
  readonly name: AgentflowName
  readonly title: AgentflowLabel | null
  readonly data: readonly AgentflowDataBlock[]
}

/** ast/agentflow.md: AgentflowStyleStatement. */
export interface AgentflowStyleStatement extends TreeNode {
  readonly type: "AgentflowStyleStatement"
  readonly id: Identifier
  readonly styles: readonly (AgentflowLiteral | null)[]
}

/** ast/agentflow.md: AgentflowClassDefStatement. */
export interface AgentflowClassDefStatement extends TreeNode {
  readonly type: "AgentflowClassDefStatement"
  readonly cssClasses: readonly (Identifier | null)[]
  readonly styles: readonly (AgentflowLiteral | null)[]
}

/** ast/agentflow.md: AgentflowClassStatement. */
export interface AgentflowClassStatement extends TreeNode {
  readonly type: "AgentflowClassStatement"
  readonly ids: readonly (Identifier | null)[]
  readonly cssClass: Identifier
}

/** ast/agentflow.md: AgentflowClickCallbackStatement. */
export interface AgentflowClickCallbackStatement extends TreeNode {
  readonly type: "AgentflowClickCallbackStatement"
  readonly ids: readonly (Identifier | null)[]
  readonly callback: Identifier | AgentflowLiteral
  readonly arguments: AgentflowLiteral | null
  readonly textBeforeTooltip: readonly AgentflowIgnoredText[]
  readonly tooltip: StringLiteral | null
}

/** diagrams/agentflow.md, The statement context: AgentflowLinkTarget. */
export type AgentflowLinkTarget = "_self" | "_blank" | "_parent" | "_top"

/** ast/agentflow.md: AgentflowClickUrlStatement. */
export interface AgentflowClickUrlStatement extends TreeNode {
  readonly type: "AgentflowClickUrlStatement"
  readonly ids: readonly (Identifier | null)[]
  readonly textBeforeUrl: readonly AgentflowIgnoredText[]
  readonly url: StringLiteral
  readonly textBeforeTooltip: readonly AgentflowIgnoredText[]
  readonly tooltip: StringLiteral | null
  readonly target: AgentflowLinkTarget | null
}

/** ast/agentflow.md: AgentflowLinkStyleStatement. */
export interface AgentflowLinkStyleStatement extends TreeNode {
  readonly type: "AgentflowLinkStyleStatement"
  readonly indices: readonly NumericLiteral[]
  readonly interpolate: Identifier | null
  readonly styles: readonly (AgentflowLiteral | null)[]
}

/** ast/agentflow.md: AgentflowDefaultLinkStyleStatement. */
export interface AgentflowDefaultLinkStyleStatement extends TreeNode {
  readonly type: "AgentflowDefaultLinkStyleStatement"
  readonly interpolate: Identifier | null
  readonly styles: readonly (AgentflowLiteral | null)[]
}

/** ast/agentflow.md, AgentflowDirectionStatement: AgentflowStatementDirection. */
export type AgentflowStatementDirection = "TB" | "BT" | "RL" | "LR" | "TD"

/** ast/agentflow.md: AgentflowDirectionStatement. */
export interface AgentflowDirectionStatement extends TreeNode {
  readonly type: "AgentflowDirectionStatement"
  readonly direction: AgentflowStatementDirection
}

/** ast/agentflow.md: AgentflowAccTitleStatement. */
export interface AgentflowAccTitleStatement extends TreeNode {
  readonly type: "AgentflowAccTitleStatement"
  readonly value: AgentflowLiteral | null
}

/** ast/agentflow.md: AgentflowAccDescrStatement. */
export interface AgentflowAccDescrStatement extends TreeNode {
  readonly type: "AgentflowAccDescrStatement"
  readonly value: AgentflowLiteral | null
}

/** ast/agentflow.md: AgentflowAccDescrBlockStatement. */
export interface AgentflowAccDescrBlockStatement extends TreeNode {
  readonly type: "AgentflowAccDescrBlockStatement"
  readonly value: AgentflowLiteral | null
  readonly closed: boolean
}

/** ast/agentflow.md: AgentflowLiteral. */
export interface AgentflowLiteral extends TreeNode {
  readonly type: "AgentflowLiteral"
}
