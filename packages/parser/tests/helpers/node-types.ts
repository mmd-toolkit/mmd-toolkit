import type { TreeviewTreeNode } from "../../src/ast/treeview.ts"
import type { EventmodelingNode } from "../../src/ast/eventmodeling.ts"
import type { CynefinNode } from "../../src/ast/cynefin.ts"
import type { WardleyNode } from "../../src/ast/wardley.ts"
import type { RailroadNode } from "../../src/ast/railroad.ts"
import type { TreemapNode } from "../../src/ast/treemap.ts"
import type { RadarNode } from "../../src/ast/radar.ts"
import type { ArchitectureNode } from "../../src/ast/architecture.ts"
import type { PacketNode } from "../../src/ast/packet.ts"
import type { InfoNode } from "../../src/ast/info.ts"
import type { GitgraphNode } from "../../src/ast/gitgraph.ts"
import type { PieNode } from "../../src/ast/pie.ts"
import type { UsecaseNode } from "../../src/ast/usecase.ts"
import type {
  ClassNode,
  ErNode,
  FlowchartNode,
  GanttNode,
  JourneyNode,
  MindmapTreeNode,
  RequirementNode,
  SankeyNode,
  SequenceNode,
  StateNode,
  TimelineNode,
  XychartNode,
  QuadrantNode,
  BlockTreeNode,
  KanbanTreeNode,
  C4Node,
  VennNode,
  IshikawaTreeNode,
  AgentflowNode,
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

/**
 * Every node type of ast/mindmap.md, in the order of that document. Being a
 * `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allMindmapNodeTypes: Readonly<
  Record<MindmapTreeNode["type"], true>
> = {
  MindmapDiagram: true,
  MindmapNode: true,
  MindmapShape: true,
  MindmapLabel: true,
  MindmapIconStatement: true,
  MindmapClassStatement: true,
  MindmapLiteral: true,
}

/**
 * Every node type of ast/timeline.md, in the order of that document. Being
 * a `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allTimelineNodeTypes: Readonly<
  Record<TimelineNode["type"], true>
> = {
  TimelineDiagram: true,
  TimelinePeriodStatement: true,
  TimelineEventStatement: true,
  TimelineTitleStatement: true,
  TimelineSectionStatement: true,
  TimelineAccTitleStatement: true,
  TimelineAccDescrStatement: true,
  TimelineAccDescrBlockStatement: true,
  TimelineLiteral: true,
}

/**
 * Every node type of ast/sankey.md, in the order of that document. Being a
 * `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allSankeyNodeTypes: Readonly<Record<SankeyNode["type"], true>> = {
  SankeyDiagram: true,
  SankeyLinkStatement: true,
  SankeyIdentifier: true,
  SankeyLiteral: true,
}

/**
 * Every node type of ast/xychart.md, in the order of that document. Being a
 * `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allXychartNodeTypes: Readonly<Record<XychartNode["type"], true>> =
  {
    XychartDiagram: true,
    XychartHeader: true,
    XychartTitleStatement: true,
    XychartXAxisStatement: true,
    XychartYAxisStatement: true,
    XychartBand: true,
    XychartRange: true,
    XychartPlotStatement: true,
    XychartValue: true,
    XychartAccTitleStatement: true,
    XychartAccDescrStatement: true,
    XychartAccDescrBlockStatement: true,
    XychartLiteral: true,
  }

/**
 * Every node type of ast/quadrant.md, in the order of that document. Being
 * a `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allQuadrantNodeTypes: Readonly<
  Record<QuadrantNode["type"], true>
> = {
  QuadrantDiagram: true,
  QuadrantTitleStatement: true,
  QuadrantAccTitleStatement: true,
  QuadrantAccDescrStatement: true,
  QuadrantAccDescrBlockStatement: true,
  QuadrantAxisStatement: true,
  QuadrantQuadrantStatement: true,
  QuadrantPointStatement: true,
  QuadrantClassDefStatement: true,
  QuadrantLabel: true,
  QuadrantLiteral: true,
  QuadrantIdentifier: true,
}

/**
 * Every node type of ast/block.md, in the order of that document. Being a
 * `Record` over the type, this fails to type-check when a node type is
 * missing here or is not in the type.
 */
export const allBlockNodeTypes: Readonly<Record<BlockTreeNode["type"], true>> =
  {
    BlockDiagram: true,
    BlockNodeStatement: true,
    BlockNode: true,
    BlockShape: true,
    BlockArrowShape: true,
    BlockLink: true,
    BlockArrow: true,
    BlockOpeningArrow: true,
    BlockSpaceStatement: true,
    BlockColumnsStatement: true,
    BlockCompositeStatement: true,
    BlockClassDefStatement: true,
    BlockClassStatement: true,
    BlockStyleStatement: true,
    BlockAccDescrBlockStatement: true,
    BlockLiteral: true,
  }

/** Every node type of ast/kanban.md, in the order of that document. */
export const allKanbanNodeTypes: Readonly<
  Record<KanbanTreeNode["type"], true>
> = {
  KanbanDiagram: true,
  KanbanNode: true,
  KanbanShape: true,
  KanbanLabel: true,
  KanbanIconStatement: true,
  KanbanClassStatement: true,
  KanbanDataBlock: true,
  KanbanLiteral: true,
}

/** Every node type of ast/c4.md, in document order. */
export const allC4NodeTypes: Readonly<Record<C4Node["type"], true>> = {
  C4Diagram: true,
  C4ElementStatement: true,
  C4BoundaryStatement: true,
  C4RelationshipStatement: true,
  C4UpdateStatement: true,
  C4NamedAttribute: true,
  C4TitleStatement: true,
  C4AccDescriptionStatement: true,
  C4AccTitleStatement: true,
  C4AccDescrStatement: true,
  C4AccDescrBlockStatement: true,
  C4Literal: true,
}

/** Every node type of ast/venn.md, in document order. */
export const allVennNodeTypes: Readonly<Record<VennNode["type"], true>> = {
  VennDiagram: true,
  VennSubsetStatement: true,
  VennTextStatement: true,
  VennStyleStatement: true,
  VennStyleProperty: true,
  VennTitleStatement: true,
  VennLabel: true,
  VennLiteral: true,
  VennIgnoredText: true,
}

/** Every node type of ast/ishikawa.md, in document order. */
export const allIshikawaNodeTypes: Readonly<
  Record<IshikawaTreeNode["type"], true>
> = {
  IshikawaDiagram: true,
  IshikawaNode: true,
  IshikawaLiteral: true,
}

/** Every node type of ast/agentflow.md, in source declaration order. */
export const allAgentflowNodeTypes: Readonly<
  Record<AgentflowNode["type"], true>
> = {
  AgentflowDiagram: true,
  AgentflowEmptyStatement: true,
  AgentflowVertexStatement: true,
  AgentflowVertexGroup: true,
  AgentflowVertex: true,
  AgentflowShape: true,
  AgentflowShapeProperty: true,
  AgentflowLink: true,
  AgentflowArrow: true,
  AgentflowOpeningArrow: true,
  AgentflowLabel: true,
  AgentflowDataBlock: true,
  AgentflowFlowStatement: true,
  AgentflowStyleStatement: true,
  AgentflowClassDefStatement: true,
  AgentflowClassStatement: true,
  AgentflowClickCallbackStatement: true,
  AgentflowClickUrlStatement: true,
  AgentflowLinkStyleStatement: true,
  AgentflowDefaultLinkStyleStatement: true,
  AgentflowDirectionStatement: true,
  AgentflowAccTitleStatement: true,
  AgentflowAccDescrStatement: true,
  AgentflowAccDescrBlockStatement: true,
  AgentflowLiteral: true,
  AgentflowIgnoredText: true,
  AgentflowGlobalStatement: true,
  AgentflowConnectorStatement: true,
  AgentflowName: true,
}

/** Every node type of ast/usecase.md, in document order. */
export const allUsecaseNodeTypes: Readonly<Record<UsecaseNode["type"], true>> =
  {
    UsecaseDiagram: true,
    UsecaseActorStatement: true,
    UsecaseActor: true,
    UsecaseEntityStatement: true,
    UsecaseEntity: true,
    UsecaseSystemBoundaryStatement: true,
    UsecaseRelationshipStatement: true,
    UsecaseOpeningArrow: true,
    UsecaseArrow: true,
    UsecaseLabel: true,
    UsecaseLiteral: true,
    UsecaseMetadata: true,
    UsecaseMetadataProperty: true,
    UsecaseMetadataAssignmentStatement: true,
    UsecaseNoteStatement: true,
    UsecaseJsonStatement: true,
    UsecaseJsonDataBlock: true,
    UsecaseDirectionStatement: true,
    UsecaseClassDefStatement: true,
    UsecaseClassStatement: true,
    UsecaseStyleStatement: true,
    UsecaseStyleDeclaration: true,
    UsecaseIdentifier: true,
    UsecaseAccTitleStatement: true,
    UsecaseAccDescrStatement: true,
    UsecaseAccDescrBlockStatement: true,
  }

/** Every node type of ast/pie.md, in document order. */
export const allPieNodeTypes: Readonly<Record<PieNode["type"], true>> = {
  PieDiagram: true,
  PieSectionStatement: true,
  PieTitleStatement: true,
  PieAccTitleStatement: true,
  PieAccDescrStatement: true,
  PieAccDescrBlockStatement: true,
  PieLiteral: true,
  PieIgnoredText: true,
}

/** Every node type of ast/gitgraph.md, in document order. */
export const allGitgraphNodeTypes: Readonly<
  Record<GitgraphNode["type"], true>
> = {
  GitgraphDiagram: true,
  GitgraphCommitStatement: true,
  GitgraphBranchStatement: true,
  GitgraphCheckoutStatement: true,
  GitgraphMergeStatement: true,
  GitgraphCherryPickStatement: true,
  GitgraphIdOption: true,
  GitgraphMessageOption: true,
  GitgraphTagOption: true,
  GitgraphTypeOption: true,
  GitgraphParentOption: true,
  GitgraphOrderOption: true,
  GitgraphTitleStatement: true,
  GitgraphAccTitleStatement: true,
  GitgraphAccDescrStatement: true,
  GitgraphAccDescrBlockStatement: true,
  GitgraphLiteral: true,
  GitgraphIgnoredText: true,
}

/** Every node type of ast/info.md, in document order. */
export const allInfoNodeTypes: Readonly<Record<InfoNode["type"], true>> = {
  InfoDiagram: true,
  InfoTitleStatement: true,
  InfoAccTitleStatement: true,
  InfoAccDescrStatement: true,
  InfoAccDescrBlockStatement: true,
  InfoLiteral: true,
  InfoIgnoredText: true,
}

/** Every node type of ast/architecture.md, in document order. */
export const allArchitectureNodeTypes: Readonly<
  Record<ArchitectureNode["type"], true>
> = {
  ArchitectureDiagram: true,
  ArchitectureGroupStatement: true,
  ArchitectureServiceStatement: true,
  ArchitectureJunctionStatement: true,
  ArchitectureEdgeStatement: true,
  ArchitectureArrow: true,
  ArchitectureAlignmentStatement: true,
  ArchitectureAlignmentMember: true,
  ArchitectureTitleStatement: true,
  ArchitectureAccTitleStatement: true,
  ArchitectureAccDescrStatement: true,
  ArchitectureAccDescrBlockStatement: true,
  ArchitectureLabel: true,
  ArchitectureLiteral: true,
  ArchitectureIgnoredText: true,
}

/** Every node type of ast/packet.md, in document order. */
export const allPacketNodeTypes: Readonly<Record<PacketNode["type"], true>> = {
  PacketDiagram: true,
  PacketRangeBlockStatement: true,
  PacketSingleBlockStatement: true,
  PacketRelativeBlockStatement: true,
  PacketTitleStatement: true,
  PacketAccTitleStatement: true,
  PacketAccDescrStatement: true,
  PacketAccDescrBlockStatement: true,
  PacketLiteral: true,
  PacketIgnoredText: true,
}

/** Every node type of ast/radar.md, in document order. */
export const allRadarNodeTypes: Readonly<Record<RadarNode["type"], true>> = {
  RadarDiagram: true,
  RadarAxisStatement: true,
  RadarCurveStatement: true,
  RadarOptionsStatement: true,
  RadarAxis: true,
  RadarCurve: true,
  RadarNumberEntry: true,
  RadarNamedEntry: true,
  RadarShowLegendOption: true,
  RadarTicksOption: true,
  RadarMaxOption: true,
  RadarMinOption: true,
  RadarGraticuleOption: true,
  RadarTitleStatement: true,
  RadarAccTitleStatement: true,
  RadarAccDescrStatement: true,
  RadarAccDescrBlockStatement: true,
  RadarLiteral: true,
  RadarIgnoredText: true,
}

/** Every railroad node type, in specification order. */
export const allRailroadNodeTypes: Record<RailroadNode["type"], true> = {
  RailroadDiagram: true,
  RailroadRule: true,
  RailroadTitleStatement: true,
  RailroadAccTitleStatement: true,
  RailroadAccDescrStatement: true,
  RailroadAccDescrBlockStatement: true,
  RailroadLiteral: true,
  RailroadIgnoredText: true,
  RailroadExpressionMember: true,
  RailroadSequenceCall: true,
  RailroadChoiceCall: true,
  RailroadOptionalCall: true,
  RailroadOneOrMoreCall: true,
  RailroadZeroOrMoreCall: true,
  RailroadTerminalCall: true,
  RailroadNonterminalCall: true,
  RailroadSpecialCall: true,
  RailroadChoiceExpression: true,
  RailroadSequenceExpression: true,
  RailroadGroupExpression: true,
  RailroadOptionalGroupExpression: true,
  RailroadRepetitionGroupExpression: true,
  RailroadPostfixExpression: true,
  RailroadExceptionExpression: true,
  RailroadSpecialSequence: true,
  RailroadRepeatExpression: true,
  RailroadRepeatRange: true,
  RailroadNumericValue: true,
  RailroadPredicateExpression: true,
  RailroadAnyExpression: true,
}

/** Every node type of ast/treemap.md, in document order. */
export const allTreemapNodeTypes: Record<TreemapNode["type"], true> = {
  TreemapDiagram: true,
  TreemapSection: true,
  TreemapLeaf: true,
  TreemapClassDefStatement: true,
  TreemapTitleStatement: true,
  TreemapAccTitleStatement: true,
  TreemapAccDescrStatement: true,
  TreemapAccDescrBlockStatement: true,
  TreemapLiteral: true,
}

/** Every Wardley node type, in specification order. */
export const allWardleyNodeTypes: Readonly<Record<WardleyNode["type"], true>> =
  {
    WardleyDiagram: true,
    WardleyAnchorStatement: true,
    WardleyComponentStatement: true,
    WardleyLinkStatement: true,
    WardleyEvolveStatement: true,
    WardleyPipelineStatement: true,
    WardleyPipelineComponent: true,
    WardleyNoteStatement: true,
    WardleyAnnotationsStatement: true,
    WardleyAnnotationStatement: true,
    WardleyAcceleratorStatement: true,
    WardleyDeacceleratorStatement: true,
    WardleyEvolutionStatement: true,
    WardleyEvolutionStage: true,
    WardleySizeStatement: true,
    WardleyCoordinates: true,
    WardleyLabelOffsetDecoration: true,
    WardleySourceStrategyDecoration: true,
    WardleyInertiaDecoration: true,
    WardleyParenthesizedInertiaDecoration: true,
    WardleyArrow: true,
    WardleyTitleStatement: true,
    WardleyAccTitleStatement: true,
    WardleyAccDescrStatement: true,
    WardleyAccDescrBlockStatement: true,
    WardleyIdentifier: true,
    WardleyLiteral: true,
    WardleyIgnoredText: true,
  }

/** Every Cynefin node type, in specification order. */
export const allCynefinNodeTypes: Readonly<Record<CynefinNode["type"], true>> =
  {
    CynefinDiagram: true,
    CynefinDomainStatement: true,
    CynefinDomainItem: true,
    CynefinTransitionStatement: true,
    CynefinArrow: true,
    CynefinTitleStatement: true,
    CynefinAccTitleStatement: true,
    CynefinAccDescrStatement: true,
    CynefinAccDescrBlockStatement: true,
    CynefinLiteral: true,
    CynefinIgnoredText: true,
  }

/** Every Eventmodeling node type, in specification order. */
export const allEventmodelingNodeTypes: Readonly<
  Record<EventmodelingNode["type"], true>
> = {
  EventmodelingDiagram: true,
  EventmodelingTimeFrameStatement: true,
  EventmodelingResetFrameStatement: true,
  EventmodelingQualifiedName: true,
  EventmodelingQualifiedNamePart: true,
  EventmodelingSourceReference: true,
  EventmodelingArrow: true,
  EventmodelingDataReference: true,
  EventmodelingInlineData: true,
  EventmodelingDataBlock: true,
  EventmodelingModelEntityStatement: true,
  EventmodelingDataEntityStatement: true,
  EventmodelingNoteStatement: true,
  EventmodelingGwtStatement: true,
  EventmodelingGwtClause: true,
  EventmodelingGwtItem: true,
  EventmodelingTitleStatement: true,
  EventmodelingAccTitleStatement: true,
  EventmodelingAccDescrStatement: true,
  EventmodelingAccDescrBlockStatement: true,
  EventmodelingLiteral: true,
  EventmodelingIgnoredText: true,
}

/** Every Treeview node type, in specification order. */
export const allTreeviewNodeTypes: Readonly<
  Record<TreeviewTreeNode["type"], true>
> = {
  TreeviewDiagram: true,
  TreeviewNode: true,
  TreeviewClassAnnotation: true,
  TreeviewIconAnnotation: true,
  TreeviewDescriptionAnnotation: true,
  TreeviewTitleStatement: true,
  TreeviewAccTitleStatement: true,
  TreeviewAccDescrStatement: true,
  TreeviewAccDescrBlockStatement: true,
  TreeviewIdentifier: true,
  TreeviewLiteral: true,
  TreeviewBranchPrefix: true,
  TreeviewIgnoredText: true,
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
  ...Object.keys(allMindmapNodeTypes),
  ...Object.keys(allTimelineNodeTypes),
  ...Object.keys(allSankeyNodeTypes),
  ...Object.keys(allXychartNodeTypes),
  ...Object.keys(allQuadrantNodeTypes),
  ...Object.keys(allBlockNodeTypes),
  ...Object.keys(allKanbanNodeTypes),
  ...Object.keys(allC4NodeTypes),
  ...Object.keys(allVennNodeTypes),
  ...Object.keys(allIshikawaNodeTypes),
  ...Object.keys(allAgentflowNodeTypes),
  ...Object.keys(allUsecaseNodeTypes),
  ...Object.keys(allPieNodeTypes),
  ...Object.keys(allGitgraphNodeTypes),
  ...Object.keys(allInfoNodeTypes),
  ...Object.keys(allPacketNodeTypes),
  ...Object.keys(allArchitectureNodeTypes),
  ...Object.keys(allRadarNodeTypes),
  ...Object.keys(allTreemapNodeTypes),
  ...Object.keys(allRailroadNodeTypes),
  ...Object.keys(allWardleyNodeTypes),
  ...Object.keys(allCynefinNodeTypes),
  ...Object.keys(allEventmodelingNodeTypes),
  ...Object.keys(allTreeviewNodeTypes),
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
