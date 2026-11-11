import type {
  C4BoundaryKeyword,
  C4ElementKeyword,
  C4RelationshipKeyword,
  C4UpdateKeyword,
} from "@mmd-toolkit/ast"
import type { TextSlots } from "./text-runs.ts"

/**
 * The fields that hold a text whose runs of spaces and tabs the formatter
 * prints as one space, by the type of the node that has the field
 * (docs/compatibility.md, Runs of whitespace in a text that are drawn the
 * same). The names that other statements refer to are left out: two names that
 * differ by a run are two things. So is the `accTitle`, which the browser shows
 * as a tooltip, and the title of a subgraph, which mermaid.js draws as an HTML
 * label. A type belongs to one diagram type.
 */
export const textSlots: TextSlots = {
  // flowchart
  FlowchartAccDescrStatement: ["value"],
  // agentflow
  AgentflowAccDescrStatement: ["value"],
  // class
  ClassAccDescrStatement: ["value"],
  ClassAnnotation: ["name"],
  ClassAttribute: ["name"],
  ClassMethod: ["name", "parameters"],
  // state
  StateAccDescrStatement: ["value"],
  // er
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
  QuadrantAxisStatement: ["start", "end"],
  QuadrantPointStatement: ["name"],
  QuadrantQuadrantStatement: ["text"],
  QuadrantTitleStatement: ["value"],
  // xychart
  XychartAccDescrStatement: ["value"],
  XychartTitleStatement: ["value"],
  // requirement
  RequirementAccDescrBlockStatement: ["value"],
  RequirementAccDescrStatement: ["value"],
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
  // the title and the accessibility statements of the other diagram types
  AgentflowAccDescrBlockStatement: ["value"],
  C4AccDescriptionStatement: ["value"],
  C4TitleStatement: ["value"],
  ClassAccDescrBlockStatement: ["value"],
  ErAccDescrBlockStatement: ["value"],
  FlowchartAccDescrBlockStatement: ["value"],
  GanttAccDescrStatement: ["value"],
  JourneyAccDescrStatement: ["value"],
  QuadrantAccDescrBlockStatement: ["value"],
  QuadrantAccDescrStatement: ["value"],
  SequenceAccDescrBlockStatement: ["value"],
  SequenceAccDescrStatement: ["value"],
  StateAccDescrBlockStatement: ["value"],
  TimelineAccDescrStatement: ["value"],
  TimelineTitleStatement: ["value"],
  UsecaseAccDescrBlockStatement: ["value"],
  UsecaseAccDescrStatement: ["value"],
  XychartAccDescrBlockStatement: ["value"],
}

/**
 * The fields where a text of spaces and tabs only is printed as one space: the
 * grammar rejects the empty text there, and mermaid.js reads the same empty
 * text for any number of them (docs/compatibility.md, Runs of whitespace in a
 * text that are drawn the same).
 */
export const blankTextSlots: TextSlots = {
  KanbanClassStatement: ["cssClass"],
  KanbanIconStatement: ["icon"],
  MindmapClassStatement: ["cssClass"],
  MindmapIconStatement: ["icon"],
  MindmapShape: ["label"],
}

const c4PersonOrSystem = ["alias", "label", "descr"]
const c4Container = ["alias", "label", "techn", "descr"]
const c4Boundary = ["alias", "label", "type"]
// mermaid.js puts the type of these three boundaries in before the third
// argument, so the third argument that is written is the tags.
const c4FixedBoundary = ["alias", "label", "tags"]
const c4Node = ["alias", "label", "type", "descr"]
const c4Relationship = ["from", "to", "label", "techn", "descr"]

/**
 * What each argument of a C4 statement is, by keyword and in the order of the
 * arguments: mermaid.js reads an argument by its place, whichever of the
 * arguments before it are named (docs/c4.md, Argument forms). Of an update
 * statement only the names it refers to are listed, since the other arguments
 * set a style.
 */
export const c4ArgumentFields: Readonly<
  Record<
    | C4BoundaryKeyword
    | C4ElementKeyword
    | C4RelationshipKeyword
    | C4UpdateKeyword,
    readonly string[]
  >
> = {
  Person: c4PersonOrSystem,
  Person_Ext: c4PersonOrSystem,
  System: c4PersonOrSystem,
  SystemDb: c4PersonOrSystem,
  SystemQueue: c4PersonOrSystem,
  System_Ext: c4PersonOrSystem,
  SystemDb_Ext: c4PersonOrSystem,
  SystemQueue_Ext: c4PersonOrSystem,
  Container: c4Container,
  ContainerDb: c4Container,
  ContainerQueue: c4Container,
  Container_Ext: c4Container,
  ContainerDb_Ext: c4Container,
  ContainerQueue_Ext: c4Container,
  Component: c4Container,
  ComponentDb: c4Container,
  ComponentQueue: c4Container,
  Component_Ext: c4Container,
  ComponentDb_Ext: c4Container,
  ComponentQueue_Ext: c4Container,
  Boundary: c4Boundary,
  Enterprise_Boundary: c4FixedBoundary,
  System_Boundary: c4FixedBoundary,
  Container_Boundary: c4FixedBoundary,
  Deployment_Node: c4Node,
  Node: c4Node,
  Node_L: c4Node,
  Node_R: c4Node,
  Rel: c4Relationship,
  BiRel: c4Relationship,
  Rel_U: c4Relationship,
  Rel_Up: c4Relationship,
  Rel_D: c4Relationship,
  Rel_Down: c4Relationship,
  Rel_L: c4Relationship,
  Rel_Left: c4Relationship,
  Rel_R: c4Relationship,
  Rel_Right: c4Relationship,
  Rel_Back: c4Relationship,
  RelIndex: ["index", "from", "to", "label", "techn", "descr"],
  UpdateElementStyle: ["alias"],
  UpdateRelStyle: ["from", "to"],
  UpdateLayoutConfig: [],
}

/**
 * The arguments of a C4 statement that are names, which other statements refer
 * to: the alias of an element or a boundary, and the two ends of a
 * relationship.
 */
export const c4NameFields: ReadonlySet<string> = new Set([
  "alias",
  "from",
  "to",
])

/**
 * The arguments of a C4 statement that are texts, written as a string or
 * bare.
 */
export const c4TextFields: ReadonlySet<string> = new Set([
  "label",
  "techn",
  "type",
  "descr",
])

/**
 * The arguments of a C4 statement that are texts also where they are named
 * (`$descr="D"`), and stand at the place that their name has: mermaid.js reads
 * a named `label` or `type` at the place of another argument in a way that
 * depends on that place.
 */
export const c4NamedTextFields: ReadonlySet<string> = new Set([
  "techn",
  "descr",
])
