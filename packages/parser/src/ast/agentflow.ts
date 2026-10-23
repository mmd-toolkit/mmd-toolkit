/** The nodes of packages/spec/docs/ast/agentflow.md, with written values and positions. */
import type {
  Identifier,
  NodeBase,
  NumericLiteral,
  StringLiteral,
} from "../ast.ts"

/**
 * ast/agentflow.md, AgentflowDiagram: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * agentflow-beta TB
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface AgentflowDiagram extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowDiagram"
  /** The direction as written, without padding; null when absent. */
  readonly direction: string | null
  /** Statements in source order. */
  readonly body: readonly AgentflowStatement[]
}

/** ast/agentflow.md: the permitted alternatives of AgentflowStatement. */
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

/**
 * ast/agentflow.md, AgentflowEmptyStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A;;
 *   ^
 * ```
 */
export interface AgentflowEmptyStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowEmptyStatement"
}

/**
 * ast/agentflow.md, AgentflowVertexStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A-->B
 * ^^^^^
 * ```
 */
export interface AgentflowVertexStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowVertexStatement"
  /** The first vertex group; subsequent sources are preceding link targets. */
  readonly first: AgentflowVertexGroup
  /** Links and their target groups, in source order. */
  readonly links: readonly AgentflowLink[]
}

/**
 * ast/agentflow.md, AgentflowVertexGroup: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A & B-->C
 * ^^^^^
 * ```
 */
export interface AgentflowVertexGroup extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowVertexGroup"
  /** One or more written vertex occurrences. */
  readonly vertices: readonly AgentflowVertex[]
}

/**
 * ast/agentflow.md, AgentflowVertex: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A[Square]
 * ^^^^^^^^^
 * ```
 */
export interface AgentflowVertex extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowVertex"
  /** The written id; an edge id excludes its @. */
  readonly id: Identifier
  /** The bracket shape, or null when absent. */
  readonly shape: AgentflowShape | null
  /** The written class name, including commas. */
  readonly cssClass: Identifier | null
  /** Complete adjacent opaque blocks, in source order. */
  readonly data: readonly AgentflowDataBlock[]
}

/** ast/agentflow.md: the permitted alternatives of AgentflowShapeName. */
export type AgentflowShapeName =
  /** Written `[...]`, or `[|name:value|...]` with a property; the Db type `square`, or `rect` with a property. */
  | "rectangle"
  /** Written `(...)`; the Db type `round`. */
  | "rounded"
  /** Written `((...))`; the Db type `circle`. */
  | "circle"
  /** Written `(((...)))`; the Db type `doublecircle`. */
  | "double-circle"
  /** Written `{...}`; the Db type `diamond`. */
  | "diamond"
  /** Written `{{...}}`; the Db type `hexagon`. */
  | "hexagon"
  /** Written `([...])`; the Db type `stadium`. */
  | "stadium"
  /** Written `[[...]]`; the Db type `subroutine`. */
  | "framed-rectangle"
  /** Written `[(...)]`; the Db type `cylinder`. */
  | "cylinder"
  /** Written `>...]`; the Db type `odd`. */
  | "odd"
  /** Written `(-...-)`; the Db type `ellipse`. */
  | "ellipse"
  /** Written `[/...\]`; the Db type `trapezoid`. */
  | "trapezoid-bottom"
  /** Written `[/.../]`; the Db type `lean_right`. */
  | "lean-right"
  /** Written `[\.../]`; the Db type `inv_trapezoid`. */
  | "trapezoid-top"
  /** Written `[\...\]`; the Db type `lean_left`. */
  | "lean-left"

/**
 * ast/agentflow.md, AgentflowShape: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A[Square]
 *  ^^^^^^^^
 * ```
 */
export interface AgentflowShape extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowShape"
  /** The name as written; no resolved or generated id is stored. */
  readonly name: AgentflowShapeName
  /** The rectangle property, or null for another shape form. */
  readonly property: AgentflowShapeProperty | null
  /** The written label, with its initial lexical kind. */
  readonly label: AgentflowLabel
}

/**
 * ast/agentflow.md, AgentflowShapeProperty: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A[|field:value|Label]
 *    ^^^^^^^^^^^
 * ```
 */
export interface AgentflowShapeProperty extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowShapeProperty"
  /** The name as written; no resolved or generated id is stored. */
  readonly name: Identifier
  /** The written value, without common trivia or its content delimiters. */
  readonly value: Identifier
}

/**
 * ast/agentflow.md, AgentflowLink: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A-->B
 *  ^^^^
 * ```
 */
export interface AgentflowLink extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowLink"
  /** The written id; an edge id excludes its @. */
  readonly id: Identifier | null
  /** The two-dash split opener, or null for a closed link. */
  readonly opening: AgentflowOpeningArrow | null
  /** The closed or closing arrow. */
  readonly arrow: AgentflowArrow
  /** The written label, with its initial lexical kind. */
  readonly label: AgentflowLabel | null
  /** The written target, without resolving diagram relationships. */
  readonly target: AgentflowVertexGroup
}

/**
 * ast/agentflow.md, AgentflowArrow: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A-->B
 *  ^^^
 * ```
 */
export interface AgentflowArrow extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowArrow"
  /** The written value, without common trivia or its content delimiters. */
  readonly value: string
  /** Agentflow arrows never have a leading marker. */
  readonly startMarker: "none"
  /** The line family; an opening arrow is always solid. */
  readonly line: "solid" | "dotted"
  /** The written dash or dot count, without the Db length cap. */
  readonly length: number
  /** The closing arrowhead, cross, or plain reference endpoint. */
  readonly endMarker: "arrow" | "cross" | "none"
}

/**
 * ast/agentflow.md, AgentflowOpeningArrow: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A-- label -->B
 *  ^^
 * ```
 */
export interface AgentflowOpeningArrow extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowOpeningArrow"
  /** The written value, without common trivia or its content delimiters. */
  readonly value: string
  /** Agentflow arrows never have a leading marker. */
  readonly startMarker: "none"
  /** The line family; an opening arrow is always solid. */
  readonly line: "solid"
}

/** ast/agentflow.md: the permitted alternatives of AgentflowLabelKind. */
export type AgentflowLabelKind =
  /** It starts with a text run, as in `A[text]`. */
  | "text"
  /** It starts with a string, `"` and `"`, as in `A["text"]`. */
  | "string"
  /** It starts with a markdown string, a string whose content is between backticks inside its quotes, as in ``A["`**text**`"]``. */
  | "markdown"

/**
 * ast/agentflow.md, AgentflowLabel: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A[Square]
 *   ^^^^^^
 * ```
 */
export interface AgentflowLabel extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowLabel"
  /** The initial form: bare text, string, or markdown string. */
  readonly kind: AgentflowLabelKind
  /** The written value, without common trivia or its content delimiters. */
  readonly value: string
}

/**
 * ast/agentflow.md, AgentflowDataBlock: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A@{ shape: rect }
 *  ^^^^^^^^^^^^^^^^
 * ```
 */
export interface AgentflowDataBlock extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowDataBlock"
  /** The written value, without common trivia or its content delimiters. */
  readonly value: string
}

/**
 * ast/agentflow.md, AgentflowFlowStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * flow
 * ^^^^
 * end
 * ^^^
 * ```
 */
export interface AgentflowFlowStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowFlowStatement"
  /** The name as written; no resolved or generated id is stored. */
  readonly name: AgentflowName | null
  /** The explicit bracket title, or null when absent. */
  readonly title: AgentflowLabel | null
  /** Complete adjacent opaque blocks, in source order. */
  readonly data: readonly AgentflowDataBlock[]
  /** Statements in source order. */
  readonly body: readonly AgentflowStatement[]
}

/**
 * ast/agentflow.md, AgentflowStyleStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * style A fill:red
 * ^^^^^^^^^^^^^^^^
 * ```
 */
export interface AgentflowStyleStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowStyleStatement"
  /** The written id; an edge id excludes its @. */
  readonly id: Identifier
  /** Written styles; a whitespace-only item is null. */
  readonly styles: readonly (AgentflowLiteral | null)[]
}

/**
 * ast/agentflow.md, AgentflowClassDefStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * classDef c fill:red
 * ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface AgentflowClassDefStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowClassDefStatement"
  /** Class-name parts between commas; empty parts are null. */
  readonly cssClasses: readonly (Identifier | null)[]
  /** Written styles; a whitespace-only item is null. */
  readonly styles: readonly (AgentflowLiteral | null)[]
}

/**
 * ast/agentflow.md, AgentflowClassStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * class A hot
 * ^^^^^^^^^^^
 * ```
 */
export interface AgentflowClassStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowClassStatement"
  /** Id parts between commas; empty parts are null. */
  readonly ids: readonly (Identifier | null)[]
  /** The written class name, including commas. */
  readonly cssClass: Identifier
}

/**
 * ast/agentflow.md, AgentflowClickCallbackStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * click A run
 * ^^^^^^^^^^^
 * ```
 */
export interface AgentflowClickCallbackStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowClickCallbackStatement"
  /** Id parts between commas; empty parts are null. */
  readonly ids: readonly (Identifier | null)[]
  /** A bare Identifier, or an opaque Literal after call. */
  readonly callback: Identifier | AgentflowLiteral
  /** Opaque argument text with padding; null when absent or whitespace-only. */
  readonly arguments: AgentflowLiteral | null
  /** Individually retained erased forms before a following tooltip. */
  readonly textBeforeTooltip: readonly AgentflowIgnoredText[]
  /** The closed nonempty tooltip string, or null when absent. */
  readonly tooltip: StringLiteral | null
}

/** ast/agentflow.md: the permitted alternatives of AgentflowLinkTarget. */
export type AgentflowLinkTarget =
  /** Written `_self`. */
  | "_self"
  /** Written `_blank`. */
  | "_blank"
  /** Written `_parent`. */
  | "_parent"
  /** Written `_top`. */
  | "_top"

/**
 * ast/agentflow.md, AgentflowClickUrlStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * click A "https://a.example"
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface AgentflowClickUrlStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowClickUrlStatement"
  /** Id parts between commas; empty parts are null. */
  readonly ids: readonly (Identifier | null)[]
  /** Individually retained erased forms on either side of href. */
  readonly textBeforeUrl: readonly AgentflowIgnoredText[]
  /** The closed nonempty URL string. */
  readonly url: StringLiteral
  /** Individually retained erased forms before a following tooltip. */
  readonly textBeforeTooltip: readonly AgentflowIgnoredText[]
  /** The closed nonempty tooltip string, or null when absent. */
  readonly tooltip: StringLiteral | null
  /** The written target, without resolving diagram relationships. */
  readonly target: AgentflowLinkTarget | null
}

/**
 * ast/agentflow.md, AgentflowLinkStyleStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A-->B-->C
 * linkStyle 1 interpolate basis
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface AgentflowLinkStyleStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowLinkStyleStatement"
  /** Canonical indices of edges already created at this statement. */
  readonly indices: readonly NumericLiteral[]
  /** The name after interpolate, or null when absent. */
  readonly interpolate: Identifier | null
  /** Written styles; a whitespace-only item is null. */
  readonly styles: readonly (AgentflowLiteral | null)[]
}

/**
 * ast/agentflow.md, AgentflowDefaultLinkStyleStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * linkStyle default stroke:red
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface AgentflowDefaultLinkStyleStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowDefaultLinkStyleStatement"
  /** The name after interpolate, or null when absent. */
  readonly interpolate: Identifier | null
  /** Written styles; a whitespace-only item is null. */
  readonly styles: readonly (AgentflowLiteral | null)[]
}

/** ast/agentflow.md: the permitted alternatives of AgentflowStatementDirection. */
export type AgentflowStatementDirection =
  /** Written `TB`. */
  | "TB"
  /** Written `BT`. */
  | "BT"
  /** Written `RL`. */
  | "RL"
  /** Written `LR`. */
  | "LR"
  /** Written `TD`; it stays `TD` in the Db of a flow, while the same word in the header gives `TB`. */
  | "TD"

/**
 * ast/agentflow.md, AgentflowDirectionStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * direction LR
 * ^^^^^^^^^^^^
 * ```
 */
export interface AgentflowDirectionStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowDirectionStatement"
  /** The trimmed ignored prefix, or null when empty. */
  readonly textBefore: AgentflowIgnoredText | null
  /** The required direction as written, without padding. */
  readonly direction: AgentflowStatementDirection
  /** The trimmed ignored suffix, or null when empty. */
  readonly textAfter: AgentflowIgnoredText | null
}

/**
 * ast/agentflow.md, AgentflowAccTitleStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * accTitle: Accessible
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface AgentflowAccTitleStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowAccTitleStatement"
  /** The written value, without common trivia or its content delimiters. */
  readonly value: AgentflowLiteral | null
}

/**
 * ast/agentflow.md, AgentflowAccDescrStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * accDescr: First
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface AgentflowAccDescrStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowAccDescrStatement"
  /** The written value, without common trivia or its content delimiters. */
  readonly value: AgentflowLiteral | null
}

/**
 * ast/agentflow.md, AgentflowAccDescrBlockStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * accDescr {}
 * ^^^^^^^^^^^
 * ```
 */
export interface AgentflowAccDescrBlockStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowAccDescrBlockStatement"
  /** The written value, without common trivia or its content delimiters. */
  readonly value: AgentflowLiteral | null
  /** Whether a closing brace is written. */
  readonly closed: boolean
}

/**
 * ast/agentflow.md, AgentflowLiteral: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * style A fill:red
 *         ^^^^^^^^
 * ```
 */
export interface AgentflowLiteral extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowLiteral"
  /** The written value, without common trivia or its content delimiters. */
  readonly value: string
}

/**
 * ast/agentflow.md, AgentflowIgnoredText: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * A[direction LR]-->B
 * ^^
 * ```
 */
export interface AgentflowIgnoredText extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowIgnoredText"
  /** The lexical form recognized by its production. */
  readonly kind:
    | "click"
    | "empty-string"
    | "empty-markdown-string"
    | "empty-call"
    | "empty-description-block"
    | "direction-text"
  /** The written value, without common trivia or its content delimiters. */
  readonly value: string
}

/**
 * ast/agentflow.md, AgentflowGlobalStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * global
 * ^^^^^^
 * end
 * ^^^
 * ```
 */
export interface AgentflowGlobalStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowGlobalStatement"
  /** Statements in source order. */
  readonly body: readonly AgentflowStatement[]
}

/**
 * ast/agentflow.md, AgentflowConnectorStatement: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * connector D
 * ^^^^^^^^^^^
 * ```
 */
export interface AgentflowConnectorStatement extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowConnectorStatement"
  /** The name as written; no resolved or generated id is stored. */
  readonly name: AgentflowName
  /** The explicit bracket title, or null when absent. */
  readonly title: AgentflowLabel | null
  /** Complete adjacent opaque blocks, in source order. */
  readonly data: readonly AgentflowDataBlock[]
}

/**
 * ast/agentflow.md, AgentflowName: its written occurrence.
 * Child visitation is defined in visitor-keys/agentflow.ts.
 *
 * ```text
 * connector D
 *           ^
 * ```
 */
export interface AgentflowName extends NodeBase {
  /** The node type. */
  readonly type: "AgentflowName"
  /** Maximal Label fragments and separate erased forms; at least one Label. */
  readonly parts: readonly (AgentflowLabel | AgentflowIgnoredText)[]
}

/** ast/agentflow.md, Nodes: every diagram-specific node. */
export type AgentflowNode =
  | AgentflowDiagram
  | AgentflowEmptyStatement
  | AgentflowVertexStatement
  | AgentflowVertexGroup
  | AgentflowVertex
  | AgentflowShape
  | AgentflowShapeProperty
  | AgentflowLink
  | AgentflowArrow
  | AgentflowOpeningArrow
  | AgentflowLabel
  | AgentflowDataBlock
  | AgentflowFlowStatement
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
  | AgentflowLiteral
  | AgentflowIgnoredText
  | AgentflowGlobalStatement
  | AgentflowConnectorStatement
  | AgentflowName
