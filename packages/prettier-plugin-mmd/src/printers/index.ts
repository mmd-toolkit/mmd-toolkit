import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MermaidAst } from "../parser.ts"
import { printBlockDiagram } from "./block.ts"
import { printClass } from "./class.ts"
import { printC4 } from "./c4.ts"
import { printEr } from "./er.ts"
import { printFlowchart } from "./flowchart.ts"
import { printGantt } from "./gantt.ts"
import { printJourney } from "./journey.ts"
import { printKanban } from "./kanban.ts"
import { printMindmap } from "./mindmap.ts"
import { printQuadrant } from "./quadrant.ts"
import { printRequirement } from "./requirement.ts"
import { printSankey } from "./sankey.ts"
import { printSequence } from "./sequence.ts"
import { printState } from "./state.ts"
import { printTimeline } from "./timeline.ts"
import { printXychart } from "./xychart.ts"
import type { Source } from "./source.ts"

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
  QuadrantDiagram: printQuadrant,
  RequirementDiagram: printRequirement,
  SankeyDiagram: printSankey,
  TimelineDiagram: printTimeline,
  XychartDiagram: printXychart,
}
