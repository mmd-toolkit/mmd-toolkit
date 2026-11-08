import type { TextSlots } from "./text-runs.ts"

/**
 * The fields that hold a text whose runs of spaces and tabs the formatter
 * prints as one space, by the type of the node that has the field
 * (docs/compatibility.md, Runs of whitespace in a text that are drawn the
 * same). The names that other statements refer to are left out: two names that
 * differ by a run are two things. A type belongs to one diagram type.
 */
export const textSlots: TextSlots = {
  // flowchart
  FlowchartAccDescrStatement: ["value"],
  FlowchartAccTitleStatement: ["value"],
  FlowchartSubgraphStatement: ["name", "title"],
  // agentflow
  AgentflowAccDescrStatement: ["value"],
  AgentflowAccTitleStatement: ["value"],
  // class
  ClassAccDescrStatement: ["value"],
  ClassAccTitleStatement: ["value"],
  ClassAnnotation: ["name"],
  ClassAttribute: ["name"],
  ClassMethod: ["name", "parameters"],
  // state
  StateAccDescrStatement: ["value"],
  StateAccTitleStatement: ["value"],
  // er
  ErAccTitleStatement: ["value"],
  ErAccDescrStatement: ["value"],
  ErAttribute: ["dataType"],
  // sequence
  SequenceBoxStatement: ["text"],
  SequenceText: ["value"],
  SequenceTitleStatement: ["value"],
  // gantt
  GanttAccDescrBlockStatement: ["value"],
  GanttTitleStatement: ["value"],
  // journey
  JourneyAccDescrBlockStatement: ["value"],
  JourneyTitleStatement: ["value"],
  // timeline
  TimelineAccDescrBlockStatement: ["value"],
  // quadrant
  QuadrantAccTitleStatement: ["value"],
  QuadrantAxisStatement: ["start", "end"],
  QuadrantPointStatement: ["name"],
  QuadrantQuadrantStatement: ["text"],
  QuadrantTitleStatement: ["value"],
  // xychart
  XychartAccDescrStatement: ["value"],
  XychartAccTitleStatement: ["value"],
  XychartTitleStatement: ["value"],
  // requirement
  RequirementAccDescrBlockStatement: ["value"],
  RequirementAccDescrStatement: ["value"],
  RequirementAccTitleStatement: ["value"],
  RequirementClassShorthandStatement: ["cssClasses"],
  RequirementElementField: ["value"],
  RequirementRequirementStatement: ["cssClasses"],
  RequirementValueField: ["value"],
  // c4
  C4AccDescrBlockStatement: ["value"],
  C4AccDescrStatement: ["value"],
  // venn
  VennSubsetStatement: ["label"],
  VennTitleStatement: ["value"],
  // block
  BlockClassStatement: ["cssClass"],
  BlockShape: ["label"],
  // architecture
  ArchitectureGroupStatement: ["title"],
  ArchitectureServiceStatement: ["icon", "title"],
  // ishikawa
  IshikawaNode: ["text"],
  // packet
  PacketSingleBlockStatement: ["label"],
  // pie
  PieAccDescrBlockStatement: ["value"],
  // radar
  RadarAxis: ["label"],
  RadarCurve: ["label"],
  // railroad
  RailroadExpressionMember: ["expression"],
  RailroadRule: ["definition"],
  RailroadTerminalCall: ["value"],
  // treemap
  TreemapLeaf: ["name"],
  TreemapSection: ["name"],
  // wardley
  WardleyAccDescrBlockStatement: ["value"],
  WardleyArrow: ["label"],
  WardleyLinkStatement: ["label"],
  // cynefin
  CynefinAccDescrBlockStatement: ["value"],
  CynefinDomainItem: ["label"],
}
