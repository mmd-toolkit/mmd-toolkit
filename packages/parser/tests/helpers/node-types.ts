import type {
  ClassNode,
  FlowchartNode,
  SequenceNode,
  StateNode,
} from "../../src/index.ts"

/** ast.md, Shared leaf nodes: the node types, as the tests expect them. */
export const sharedLeafNodeTypes: readonly string[] = [
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
]

/** The node types of ast.md itself, as the tests expect them. */
export const commonNodeTypes: readonly string[] = [
  "Root",
  "ErrorDiagram",
  ...sharedLeafNodeTypes,
]

/**
 * Every node type of ast/flowchart.md, in the order of that document. Being
 * a `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allFlowchartNodeTypes: Record<FlowchartNode["type"], true> = {
  FlowchartDiagram: true,
  FlowchartEmptyStatement: true,
  FlowchartVertexStatement: true,
  FlowchartVertexGroup: true,
  FlowchartVertex: true,
  FlowchartShape: true,
  FlowchartShapeProperty: true,
  FlowchartLink: true,
  FlowchartArrow: true,
  FlowchartOpeningArrow: true,
  FlowchartLabel: true,
  FlowchartDataBlock: true,
  FlowchartSubgraphStatement: true,
  FlowchartStyleStatement: true,
  FlowchartClassDefStatement: true,
  FlowchartClassStatement: true,
  FlowchartClickCallbackStatement: true,
  FlowchartClickUrlStatement: true,
  FlowchartLinkStyleStatement: true,
  FlowchartDefaultLinkStyleStatement: true,
  FlowchartDirectionStatement: true,
  FlowchartAccTitleStatement: true,
  FlowchartAccDescrStatement: true,
  FlowchartAccDescrBlockStatement: true,
  FlowchartLiteral: true,
  FlowchartIgnoredText: true,
}

/**
 * Every node type of ast/sequence.md, in the order of that document. Being
 * a `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allSequenceNodeTypes: Record<SequenceNode["type"], true> = {
  SequenceDiagram: true,
  SequenceParticipantStatement: true,
  SequenceDestroyStatement: true,
  SequenceBoxStatement: true,
  SequenceBoxText: true,
  SequenceMessageStatement: true,
  SequenceArrow: true,
  SequenceAutonumberStatement: true,
  SequenceActivateStatement: true,
  SequenceDeactivateStatement: true,
  SequenceNoteStatement: true,
  SequenceLinksStatement: true,
  SequenceLinkStatement: true,
  SequencePropertiesStatement: true,
  SequenceDetailsStatement: true,
  SequenceTitleStatement: true,
  SequenceAccTitleStatement: true,
  SequenceAccDescrStatement: true,
  SequenceAccDescrBlockStatement: true,
  SequenceLoopStatement: true,
  SequenceOptStatement: true,
  SequenceBreakStatement: true,
  SequenceRectStatement: true,
  SequenceAltStatement: true,
  SequenceParStatement: true,
  SequenceParOverStatement: true,
  SequenceCriticalStatement: true,
  SequenceSection: true,
  SequenceIgnoredStatement: true,
  SequenceIdentifier: true,
  SequenceText: true,
  SequenceLiteral: true,
  SequenceDataBlock: true,
}

/**
 * Every node type of ast/class.md, in the order of that document. Being a
 * `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allClassNodeTypes: Record<ClassNode["type"], true> = {
  ClassDiagram: true,
  ClassDeclaration: true,
  ClassMemberStatement: true,
  ClassNameStatement: true,
  ClassAnnotationStatement: true,
  ClassRelationStatement: true,
  ClassArrow: true,
  ClassNamespaceStatement: true,
  ClassNoteStatement: true,
  ClassCallbackStatement: true,
  ClassLinkStatement: true,
  ClassStyleStatement: true,
  ClassCssClassStatement: true,
  ClassClassDefStatement: true,
  ClassDirectionStatement: true,
  ClassAccTitleStatement: true,
  ClassAccDescrStatement: true,
  ClassAccDescrBlockStatement: true,
  ClassIdentifier: true,
  ClassName: true,
  ClassMethod: true,
  ClassAttribute: true,
  ClassAnnotation: true,
  ClassLiteral: true,
  ClassIgnoredText: true,
}

/**
 * Every node type of ast/state.md, in the order of that document. Being a
 * `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allStateNodeTypes: Record<StateNode["type"], true> = {
  StateDiagram: true,
  StateDefinitionStatement: true,
  StateTransitionStatement: true,
  StateReference: true,
  StateTerminal: true,
  StateCompositeStatement: true,
  StateAliasDefinitionStatement: true,
  StatePseudostateDefinitionStatement: true,
  StateDividerStatement: true,
  StateNoteStatement: true,
  StateFloatingNoteStatement: true,
  StateClickStatement: true,
  StateClassDefStatement: true,
  StateClassStatement: true,
  StateStyleStatement: true,
  StateDirectionStatement: true,
  StateAccTitleStatement: true,
  StateAccDescrStatement: true,
  StateAccDescrBlockStatement: true,
  StateScaleStatement: true,
  StateHideEmptyDescriptionStatement: true,
  StateIgnoredStatement: true,
  StateLiteral: true,
  StateIgnoredText: true,
}

/** Every node type, of ast.md and of each diagram type. */
export const allNodeTypes: readonly string[] = [
  ...commonNodeTypes,
  ...Object.keys(allFlowchartNodeTypes),
  ...Object.keys(allSequenceNodeTypes),
  ...Object.keys(allClassNodeTypes),
  ...Object.keys(allStateNodeTypes),
]

/** Whether `value` is a node, or a list that holds one. */
export function holdsNode(value: unknown): boolean {
  if (Array.isArray(value)) {
    const elements: readonly unknown[] = value
    return elements.some(holdsNode)
  }
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string" &&
    allNodeTypes.includes(value.type)
  )
}
