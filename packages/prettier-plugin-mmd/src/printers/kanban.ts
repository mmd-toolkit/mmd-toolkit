import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import { findKanbanKeptLines } from "./kanban-kept-lines.ts"
import type { KanbanLine } from "./kanban-layout.ts"
import {
  findCommentEnds,
  findKeptGapEnd,
  kanbanLines,
  layoutKanbanLine,
} from "./kanban-layout.ts"
import { expectToken, layoutKeywordHeader } from "./layout.ts"
import { lineEndOf } from "./kept-lines.ts"
import { indentationOf, printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

/**
 * Prints a flat board (docs/kanban.md, Indentation). A section stands one
 * step deeper than the header and an item two steps, with the characters of
 * the options, and an icon or a class line stands where its node does; the
 * Db tells a section from an item by comparing the indentation with that of
 * the first node, which the printed columns keep. The shared block machinery
 * places comments/directives and keeps semicolon lines; protected comment
 * gaps and inline-directive lines keep their written text apart from the
 * indentation, which counts the same.
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
  const placements = new Map(
    lines.map((line) => [line, placeLine(source, options, line)]),
  )
  const block = printBlock(
    lines.map((line) => [
      placements.get(line)?.head ?? "",
      printAtoms(source, layoutKanbanLine(line), {
        statement: "",
        continuation: "",
      }).doc,
    ]),
    source,
    {
      statements: lines,
      start: keyword.range[1],
      end: source.text.length,
      isTopLevel: true,
    },
    lineBlockRules(source, placements),
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

/** What a line prints before its text. */
interface Placement {
  /** The indentation of the line, the whitespace before its first directive. */
  readonly indentation: string
  /** The directives of the line that lead its text, with their gaps. */
  readonly head: Doc
  /** The indentation that a comment above the line is aligned with. */
  readonly column: string
}

/**
 * Where a line stands (docs/kanban.md, Indentation). The line has the
 * indentation of its depth, one step for a section and two for an item, in
 * the characters of the options, less what the gap before it prints already (a
 * U+2028 or U+2029 that ends a diagram comment). All the whitespace before the
 * text of a node is its indentation, the whitespace after a directive that
 * leads the text too, and a directive is not counted. So the printer writes the
 * whitespace before the first directive, keeps the gaps after the directives
 * as many characters as they were while they fit, and shortens them from the
 * last when they do not.
 */
function placeLine(
  source: Source,
  options: ParserOptions<MermaidAst>,
  line: KanbanLine,
): Placement {
  const character = options.useTabs ? "\t" : " "
  const step = indentationOf(options, 1).length
  const column = step * line.depth - line.separatorWidth
  const { leading } = line
  if (leading === null) {
    return {
      indentation: character.repeat(column),
      head: "",
      column: character.repeat(column),
    }
  }
  const gaps = [...leading.gaps]
  let excess = gaps.reduce((sum, gap) => sum + gap, 0) - column
  for (let index = gaps.length - 1; index >= 0 && excess > 0; index--) {
    const cut = Math.min(gaps[index], excess)
    gaps[index] -= cut
    excess -= cut
  }
  const written = gaps.reduce((sum, gap) => sum + gap, 0)
  return {
    indentation: character.repeat(column - written),
    head: leading.directives.map((range, index) => [
      printAsWritten(source, range[0], range[1]),
      character.repeat(gaps[index]),
    ]),
    column: character.repeat(column),
  }
}

/**
 * The block rules of the lines of a board (see `BlockRules`): no line holds
 * others or is dropped, and each stands where `placeLine` says.
 */
function lineBlockRules(
  source: Source,
  placements: ReadonlyMap<KanbanLine, Placement>,
): BlockRules<KanbanLine> {
  const kept = findKanbanKeptLines(source)
  const commentEnds = findCommentEnds(source)

  /** Where a line stands. */
  function placementOf(line: KanbanLine): Placement {
    const placement = placements.get(line)
    if (placement === undefined) {
      throw new Error("prettier-plugin-mmd: a kanban line that is not placed")
    }
    return placement
  }

  return {
    kept,
    printedEnd: (line) => line.range[1],
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
    extraIndentationOf: (line) => placementOf(line).column,
    writtenIndentationOf: (line) =>
      line.leading === null ? undefined : placementOf(line).indentation,
    keptIndentationOf: (line) => placementOf(line).indentation,
    diagramLineEnd: (offset) =>
      commentEnds.find(
        (end) => end >= offset && end < lineEndOf(source, offset),
      ),
    keptGapEnd: (start, end, beforeStatement) =>
      findKeptGapEnd(source, start, end, beforeStatement),
  }
}
