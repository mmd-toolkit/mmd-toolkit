import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MermaidAst } from "../parser.ts"
import { findGanttKeptLines } from "./gantt-kept-lines.ts"
import {
  findGanttPrintedEnd,
  layoutGanttHeader,
  layoutGanttStatement,
} from "./gantt-layout.ts"
import type { SectionedDiagram } from "./sectioned.ts"
import { printSectionedDiagram } from "./sectioned.ts"
import type { Source } from "./source.ts"
import type { GanttStatement } from "@mmd-toolkit/parser"

/**
 * The Gantt chart as a diagram that a `section` groups. mermaid.js reads its
 * comments with the mark `%` and its `%%{` that start no directive by the
 * whitespace before them (diagrams/gantt.md, Comments).
 */
const ganttDiagram: SectionedDiagram<GanttStatement> = {
  name: "Gantt chart",
  statementsOf: (node) => (node.type === "GanttDiagram" ? node.body : null),
  isSection: (statement) => statement.type === "GanttSectionStatement",
  keptLines: findGanttKeptLines,
  printedEnd: findGanttPrintedEnd,
  layoutHeader: layoutGanttHeader,
  layoutStatement: layoutGanttStatement,
  readsCommentsByWhitespaceBefore: true,
}

/**
 * Prints the body of a Gantt chart and the nodes below it, to the end of the
 * text (docs/gantt.md).
 */
export function printGantt(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  return printSectionedDiagram(ganttDiagram, path, options, source)
}
