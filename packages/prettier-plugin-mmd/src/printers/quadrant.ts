import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MermaidAst } from "../parser.ts"
import type { AtomLayout } from "./atoms.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import { expectToken, findLayoutEnd, layoutKeywordHeader } from "./layout.ts"
import { indentationOf } from "./lines.ts"
import { findQuadrantKeptLines } from "./quadrant-kept-lines.ts"
import {
  findQuadrantPrintedEnd,
  layoutQuadrantStatement,
} from "./quadrant-layout.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"
import type { QuadrantStatement } from "@mmd-toolkit/parser"

/**
 * Prints the body of a quadrant chart and the nodes below it, to the end of
 * the text (docs/quadrant.md).
 *
 * The statements stand on lines of their own, one level deeper than the
 * header; a statement after the header on its line, and the statements that
 * a `;` separates, go to lines of their own. Comments and directives on lines
 * of their own stand at the level of the statement after them, and at the
 * end of the text at that of the last statement; runs of empty lines become
 * one, and empty lines at the start and the end of the body are dropped (see
 * `printBlock`). The statements are printed here, and not by `print` one by
 * one.
 */
export function printQuadrant(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "QuadrantDiagram") {
    throw new Error(
      `prettier-plugin-mmd: ${diagram.type} is no node of a quadrant chart that is printed on its own`,
    )
  }
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  const headerLayout = layoutKeywordHeader(source, keyword)
  const block = printBlock(
    diagram.body.map((statement) =>
      printLine(
        source,
        options,
        layoutQuadrantStatement(source, statement, statement.range[1]),
        1,
      ),
    ),
    source,
    {
      statements: diagram.body,
      start: findLayoutEnd(headerLayout),
      end: source.text.length,
      isTopLevel: true,
    },
    statementBlockRules(source),
  )
  const header = openingLine(
    printLine(source, options, headerLayout, 0),
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
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
 * The block rules of the statements (see `BlockRules`): none holds others or
 * is dropped.
 */
function statementBlockRules(source: Source): BlockRules<QuadrantStatement> {
  return {
    kept: findQuadrantKeptLines(source),
    printedEnd: findQuadrantPrintedEnd,
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
  }
}
