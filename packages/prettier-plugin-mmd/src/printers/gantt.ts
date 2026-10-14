import type { AstPath, Doc, ParserOptions } from "prettier"
import type { GanttDiagram, GanttStatement } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { AtomLayout } from "./atoms.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import { findGanttKeptLines } from "./gantt-kept-lines.ts"
import {
  findGanttPrintedEnd,
  isGanttStatement,
  layoutGanttHeader,
  layoutGanttStatement,
} from "./gantt-layout.ts"
import { expectToken } from "./layout.ts"
import { indentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

/**
 * Prints the body of a Gantt chart and the nodes below it, to the end of the
 * text (docs/gantt.md).
 *
 * Each statement stands on a line of its own, one level deeper than the
 * header, `section` and the tasks after it at the same level: a chart has no
 * block of statements. Comments and directives on lines of their own stand at
 * the level of the statements around them, runs of empty lines become one,
 * and empty lines at the start and the end of the body are dropped (see
 * `printBlock`).
 */
export function printGantt(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const node = path.node
  if (node.type === "GanttDiagram") {
    return printDiagram(path, options, print, source, node)
  }
  if (!isGanttStatement(node)) {
    throw new Error(
      `prettier-plugin-mmd: ${node.type} is no node of a Gantt chart that is printed`,
    )
  }
  return printLine(
    source,
    options,
    layoutGanttStatement(source, node, node.range[1]),
    1,
  )
}

/** Prints a statement laid out on its lines at `depth`. */
function printLine(
  source: Source,
  options: ParserOptions<MermaidAst>,
  layout: AtomLayout,
  depth: number,
): Doc {
  return printAtoms(source, layout, {
    statement: indentationOf(options, depth),
    continuation: indentationOf(options, depth + 1),
  }).doc
}

/**
 * Prints the header and the statements of the chart, and the end of the
 * text.
 */
function printDiagram(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  diagram: GanttDiagram,
): Doc {
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  const block = printBlock(
    // AstPath<MermaidAst> takes only field names that every node type of the
    // union has; the node here is the diagram, which has `body`.
    path.map(print, "body" as never),
    source,
    {
      statements: diagram.body,
      start: keyword.range[1],
      end: source.text.length,
      isTopLevel: true,
    },
    statementBlockRules(source),
  )
  const header = openingLine(
    printLine(source, options, layoutGanttHeader(source, keyword), 0),
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
}

/**
 * The block rules of the statements of a Gantt chart (see `BlockRules`): no
 * statement holds others or is dropped. A diagram comment takes the rest of
 * its line and no line break, so no line of only whitespace is kept after one
 * (docs/gantt.md, Comments).
 */
function statementBlockRules(source: Source): BlockRules<GanttStatement> {
  return {
    kept: findGanttKeptLines(source),
    printedEnd: (statement) => findGanttPrintedEnd(source, statement),
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
  }
}
