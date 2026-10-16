import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import { findKanbanKeptLines } from "./kanban-kept-lines.ts"
import {
  kanbanLines,
  keepsKanbanGap,
  layoutKanbanLine,
} from "./kanban-layout.ts"
import { expectToken, layoutKeywordHeader } from "./layout.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

/**
 * Prints a flat board with absolute indentation counts, without a root shift
 * or tab expansion (docs/kanban.md, Indentation). The shared block machinery
 * places comments/directives and keeps semicolon segments; protected comment
 * gaps and inline-directive lines preserve their written whitespace.
 */
export function printKanban(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "KanbanDiagram") {
    throw new Error(
      `prettier-plugin-mmd: ${diagram.type} is no node of a kanban that is printed on its own`,
    )
  }
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  const lines = kanbanLines(source, diagram, keyword.range[1])
  const character = options.useTabs ? "\t" : " "
  const block = printBlock(
    lines.map(
      (line) =>
        printAtoms(source, layoutKanbanLine(line), {
          statement: "",
          continuation: "",
        }).doc,
    ),
    source,
    {
      statements: lines,
      start: keyword.range[1],
      end: source.text.length,
      isTopLevel: true,
    },
    {
      kept: findKanbanKeptLines(source),
      printedEnd: (line) => line.range[1],
      holdsStatements: () => false,
      isDroppedAtTopLevel: () => false,
      keepsWhitespaceLineAfterComment: false,
      keepsDirectiveLinesUnindented: false,
      extraIndentationOf: (line) => character.repeat(line.indent),
      writtenIndentationOf: (line) => line.writtenIndentation,
      keepsGap: (start, end) => keepsKanbanGap(source, start, end),
    },
  )
  const header = openingLine(
    printAtoms(source, layoutKeywordHeader(source, keyword), {
      statement: "",
      continuation: "",
    }).doc,
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options, 0)
}
