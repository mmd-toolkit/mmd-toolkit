import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MindmapDiagram } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import { expectToken, layoutKeywordHeader } from "./layout.ts"
import { findMindmapKeptLines } from "./mindmap-kept-lines.ts"
import type { MindmapLine } from "./mindmap-layout.ts"
import {
  countWhitespaceAfterLeadingDirective,
  findIndentationSteps,
  findMindmapPrintedEnd,
  flattenMindmap,
  layoutMindmapLine,
} from "./mindmap-layout.ts"
import { isPathOfType } from "./paths.ts"
import { indentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

/**
 * Prints the body of a mindmap and the nodes below it, to the end of the text
 * (docs/mindmap.md).
 *
 * The indentation of a node is the level of the node in the Db, so the width
 * of a step between a node and its children is kept as written, in
 * characters. The root stands one level deeper than the header, as the
 * statements of every diagram type do, and each other line stands as many
 * characters deeper than the root as it was written; the characters are those
 * of the options, a space or a tab. An icon or a class line stands at the
 * column of its node. The tree nests the nodes, but the lines are printed in
 * source order, one after the other, so comments, directives, and empty lines
 * between them are handled as in any block (see `printBlock`).
 */
export function printMindmap(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  if (!isPathOfType(path, "MindmapDiagram")) {
    throw new Error(
      `prettier-plugin-mmd: ${path.node.type} is no node of a mindmap that is printed on its own`,
    )
  }
  const diagram = path.node
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  const lines = flattenMindmap(diagram)
  const block = printBlock(
    lines.map((line) => printLine(source, options, line)),
    source,
    {
      statements: lines,
      start: keyword.range[1],
      end: source.text.length,
      isTopLevel: true,
    },
    lineBlockRules(source, options, diagram, lines),
  )
  const header = openingLine(
    printAtoms(source, layoutKeywordHeader(source, keyword), {
      statement: "",
      continuation: indentationOf(options, 1),
    }).doc,
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
}

/** Prints a line of a mindmap: its text as written. */
function printLine(
  source: Source,
  options: ParserOptions<MermaidAst>,
  line: MindmapLine,
): Doc {
  return printAtoms(source, layoutMindmapLine(line), {
    statement: indentationOf(options, 1),
    continuation: indentationOf(options, 2),
  }).doc
}

/**
 * The block rules of the lines of a mindmap (see `BlockRules`): no line holds
 * others or is dropped, and each stands deeper than the block by the width of
 * its step beyond the root, written in the indentation character of the
 * options. A diagram comment takes the rest of its line and no line break, so
 * no line of only whitespace is kept after one (docs/mindmap.md, Comments).
 *
 * The whitespace after a directive at the start of a line counts as the
 * indentation of the node, and the line is printed as written from the
 * directive; the whitespace before the directive is what makes the indentation
 * the width of the step. When the whitespace after the directive is wider than
 * the root's level and the step together, every line stands deeper by the
 * difference, so that the root stands at a column that no step is narrower
 * than.
 */
function lineBlockRules(
  source: Source,
  options: ParserOptions<MermaidAst>,
  diagram: MindmapDiagram,
  lines: readonly MindmapLine[],
): BlockRules<MindmapLine> {
  const steps = findIndentationSteps(diagram)
  const character = options.useTabs ? "\t" : " "
  const rootWidth = indentationOf(options, 1).length

  /** The step of a line beyond the root, in characters. */
  function stepOf(line: MindmapLine): number {
    return steps.get(line) ?? 0
  }

  const afterDirective = new Map<MindmapLine, number>()
  for (const line of lines) {
    const width = countWhitespaceAfterLeadingDirective(source, line)
    if (width !== null) afterDirective.set(line, width)
  }
  let shift = 0
  for (const [line, width] of afterDirective) {
    shift = Math.max(shift, width - rootWidth - stepOf(line))
  }
  return {
    kept: findMindmapKeptLines(source),
    printedEnd: findMindmapPrintedEnd,
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
    extraIndentationOf: (line) => character.repeat(stepOf(line) + shift),
    keptIndentationOf: (line) =>
      character.repeat(
        rootWidth + shift + stepOf(line) - (afterDirective.get(line) ?? 0),
      ),
  }
}
