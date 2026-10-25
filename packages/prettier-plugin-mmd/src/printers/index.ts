import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MermaidAst } from "../parser.ts"
import { printBlockDiagram } from "./block.ts"
import { printClass } from "./class.ts"
import { printVenn } from "./venn.ts"
import { printC4 } from "./c4.ts"
import { printUsecase } from "./usecase.ts"
import { printEr } from "./er.ts"
import { printAgentflow } from "./agentflow.ts"
import { printFlowchart } from "./flowchart.ts"
import { printGantt } from "./gantt.ts"
import { printJourney } from "./journey.ts"
import { printIshikawa } from "./ishikawa.ts"
import { printKanban } from "./kanban.ts"
import { printMindmap } from "./mindmap.ts"
import { printQuadrant } from "./quadrant.ts"
import { printRequirement } from "./requirement.ts"
import { printSankey } from "./sankey.ts"
import { printSequence } from "./sequence.ts"
import { printState } from "./state.ts"
import { printTimeline } from "./timeline.ts"
import { printXychart } from "./xychart.ts"
import { gitgraphPrinter } from "./gitgraph.ts"
import { piePrinter } from "./pie.ts"
import { infoPrinter } from "./info.ts"
import { packetPrinter } from "./packet.ts"
import type { Source } from "./source.ts"
import type { RootTextPlan } from "./root.ts"
import { agentflowTextPlan } from "./agentflow-size.ts"

/** Diagram-specific constraints on the source and the complete root layout. */
export interface DiagramTextRules {
  readonly keepsCommentLines: boolean
  readonly keepsPrefix?: (source: Source) => boolean
  readonly plan?: (
    source: Source,
    options: ParserOptions<MermaidAst>,
  ) => RootTextPlan
}

/** Selected once alongside the diagram printer, rather than in shared scans. */
export const diagramTextRules: Readonly<
  Partial<Record<string, DiagramTextRules>>
> = {
  PacketDiagram: {
    keepsCommentLines: false,
    keepsPrefix: packetPrinter.keepsPrefix,
  },
  GitgraphDiagram: {
    keepsCommentLines: false,
    keepsPrefix: gitgraphPrinter.keepsPrefix,
  },
  PieDiagram: { keepsCommentLines: false, keepsPrefix: piePrinter.keepsPrefix },
  InfoDiagram: {
    keepsCommentLines: false,
    keepsPrefix: infoPrinter.keepsPrefix,
  },
  AgentflowDiagram: {
    // Normal-size comments are real text; the size plan retains larger input
    // whole (diagrams/agentflow.md, Preserved comments and the default size limit).
    keepsCommentLines: true,
    plan: agentflowTextPlan,
  },
}

/**
 * Prints one diagram type. It is called for the diagram body and for every
 * node below it, and recurses with `print`. What stands before the body is
 * printed by `printRoot`, the same for every diagram type; the diagram
 * printer prints from the body to the end of the text, including the line
 * break at its end, because only it knows what its last line holds.
 */
export type DiagramPrinter = (
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
) => Doc

/**
 * Printers by the type of the diagram body node (`Root.body.type`).
 *
 * The body type rather than the diagram type id is the key, because several
 * ids share one grammar: `flowchart-v2`, `flowchart-elk`, and `swimlane` all
 * have a `FlowchartDiagram` body. A body type without an entry is printed
 * unchanged.
 */
export const diagramPrinters: Readonly<
  Partial<Record<string, DiagramPrinter>>
> = {
  FlowchartDiagram: printFlowchart,
  AgentflowDiagram: printAgentflow,
  SequenceDiagram: printSequence,
  ClassDiagram: printClass,
  StateDiagram: printState,
  ErDiagram: printEr,
  BlockDiagram: printBlockDiagram,
  GanttDiagram: printGantt,
  JourneyDiagram: printJourney,
  MindmapDiagram: printMindmap,
  KanbanDiagram: printKanban,
  C4Diagram: printC4,
  UsecaseDiagram: printUsecase,
  VennDiagram: printVenn,
  IshikawaDiagram: printIshikawa,
  QuadrantDiagram: printQuadrant,
  RequirementDiagram: printRequirement,
  SankeyDiagram: printSankey,
  TimelineDiagram: printTimeline,
  XychartDiagram: printXychart,
  PieDiagram: piePrinter.print,
  InfoDiagram: infoPrinter.print,
  GitgraphDiagram: gitgraphPrinter.print,
  PacketDiagram: packetPrinter.print,
}
