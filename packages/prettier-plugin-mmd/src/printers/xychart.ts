import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MermaidAst } from "../parser.ts"
import type { AtomLayout } from "./atoms.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import { findLayoutEnd } from "./layout.ts"
import { indentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import { findXychartKeptLines } from "./xychart-kept-lines.ts"
import type { XychartBlockStatement } from "./xychart-layout.ts"
import {
  findXychartPrintedEnd,
  layoutXychartHeader,
  layoutXychartStatement,
} from "./xychart-layout.ts"

/**
 * Prints the body of an XY chart and the nodes below it, to the end of the
 * text (docs/xychart.md).
 *
 * The first header stands on the first line. The statements, and the headers
 * after the first, which the grammar places before the first statement, stand
 * on lines of their own, one level deeper than it. Comments and directives on
 * lines of their own stand at the level of the statement after them, and at
 * the end of the text at that of the last statement; runs of empty lines
 * become one, and empty lines at the start and the end of the body are
 * dropped (see `printBlock`). The statements are printed here, and not by
 * `print` one by one.
 */
export function printXychart(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "XychartDiagram") {
    throw new Error(
      `prettier-plugin-mmd: ${diagram.type} is no node of an XY chart that is printed on its own`,
    )
  }
  const [firstHeader, ...laterHeaders] = diagram.headers
  const headerLayout = layoutXychartHeader(source, firstHeader)
  const statements: readonly XychartBlockStatement[] = [
    ...laterHeaders,
    ...diagram.body,
  ]
  const block = printBlock(
    statements.map((statement) =>
      printLine(
        source,
        options,
        statement.type === "XychartHeader"
          ? layoutXychartHeader(source, statement)
          : layoutXychartStatement(source, statement, statement.range[1]),
        1,
      ),
    ),
    source,
    {
      statements,
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

/** The block rules of the statements (see `BlockRules`): none holds others or is dropped. */
function statementBlockRules(
  source: Source,
): BlockRules<XychartBlockStatement> {
  return {
    kept: findXychartKeptLines(source),
    printedEnd: findXychartPrintedEnd,
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
  }
}
