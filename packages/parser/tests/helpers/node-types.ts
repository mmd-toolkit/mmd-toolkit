import type {
  ClassNode,
  ErNode,
  FlowchartNode,
  GanttNode,
  JourneyNode,
  RequirementNode,
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

/**
 * Every node type of ast/er.md, in the order of that document. Being a
 * `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allErNodeTypes: Readonly<Record<ErNode["type"], true>> = {
  ErDiagram: true,
  ErEntityStatement: true,
  ErAttribute: true,
  ErRelationshipStatement: true,
  ErEntityReference: true,
  ErRelationship: true,
  ErSubgraphStatement: true,
  ErDirectionStatement: true,
  ErClassDefStatement: true,
  ErClassStatement: true,
  ErStyleStatement: true,
  ErAccTitleStatement: true,
  ErAccDescrStatement: true,
  ErAccDescrBlockStatement: true,
  ErIdentifier: true,
  ErLiteral: true,
  ErIgnoredText: true,
}

/**
 * Every node type of ast/gantt.md, in the order of that document. Being a
 * `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allGanttNodeTypes: Readonly<Record<GanttNode["type"], true>> = {
  GanttDiagram: true,
  GanttTaskStatement: true,
  GanttClickStatement: true,
  GanttCallback: true,
  GanttDateFormatStatement: true,
  GanttAxisFormatStatement: true,
  GanttTickIntervalStatement: true,
  GanttTodayMarkerStatement: true,
  GanttIncludesStatement: true,
  GanttExcludesStatement: true,
  GanttInclusiveEndDatesStatement: true,
  GanttWeekdayStatement: true,
  GanttWeekendStatement: true,
  GanttTitleStatement: true,
  GanttSectionStatement: true,
  GanttAccTitleStatement: true,
  GanttAccDescrStatement: true,
  GanttAccDescrBlockStatement: true,
  GanttLiteral: true,
}

/**
 * Every node type of ast/journey.md, in the order of that document. Being a
 * `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allJourneyNodeTypes: Readonly<Record<JourneyNode["type"], true>> =
  {
    JourneyDiagram: true,
    JourneyTaskStatement: true,
    JourneyTitleStatement: true,
    JourneySectionStatement: true,
    JourneyAccTitleStatement: true,
    JourneyAccDescrStatement: true,
    JourneyAccDescrBlockStatement: true,
    JourneyLiteral: true,
    JourneyIgnoredText: true,
  }

/**
 * Every node type of ast/requirement.md, in the order of that document.
 * Being a `Record` over the type, this fails to type-check when a node type
 * is missing here or is not in the type.
 */
export const allRequirementNodeTypes: Readonly<
  Record<RequirementNode["type"], true>
> = {
  RequirementDiagram: true,
  RequirementRequirementStatement: true,
  RequirementValueField: true,
  RequirementRiskField: true,
  RequirementVerifyMethodField: true,
  RequirementElementStatement: true,
  RequirementElementField: true,
  RequirementRelationshipStatement: true,
  RequirementDirectionStatement: true,
  RequirementStyleStatement: true,
  RequirementClassDefStatement: true,
  RequirementClassStatement: true,
  RequirementClassShorthandStatement: true,
  RequirementAccTitleStatement: true,
  RequirementAccDescrStatement: true,
  RequirementAccDescrBlockStatement: true,
  RequirementIdentifier: true,
  RequirementLiteral: true,
  RequirementIgnoredText: true,
}

/** Every node type, of ast.md and of each diagram type. */
export const allNodeTypes: readonly string[] = [
  ...commonNodeTypes,
  ...Object.keys(allFlowchartNodeTypes),
  ...Object.keys(allSequenceNodeTypes),
  ...Object.keys(allClassNodeTypes),
  ...Object.keys(allStateNodeTypes),
  ...Object.keys(allErNodeTypes),
  ...Object.keys(allGanttNodeTypes),
  ...Object.keys(allJourneyNodeTypes),
  ...Object.keys(allRequirementNodeTypes),
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
