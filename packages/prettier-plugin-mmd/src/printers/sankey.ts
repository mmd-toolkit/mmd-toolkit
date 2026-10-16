import type { AstPath, Doc, ParserOptions } from "prettier"
import type { SankeyLinkStatement } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import { expectToken, layoutKeywordHeader } from "./layout.ts"
import { findSankeyKeptLines } from "./sankey-kept-lines.ts"
import { findSankeyPrintedEnd, layoutSankeyLink } from "./sankey-layout.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

/**
 * Prints the body of a sankey diagram and the nodes below it, to the end of
 * the text (docs/sankey.md).
 *
 * The header, the records, the comment lines, and the directive lines all
 * stand at the first column: a record that starts with a string and a line of
 * only a directive cannot be indented, and a tab is rejected. Comments and
 * directives on lines of their own stand there too, runs of empty lines
 * become one, and empty lines at the start and the end of the body are
 * dropped (see `printBlock`). The records are printed here, and not by
 * `print` one by one.
 */
export function printSankey(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "SankeyDiagram") {
    throw new Error(
      `prettier-plugin-mmd: ${diagram.type} is no node of a sankey diagram that is printed on its own`,
    )
  }
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  const block = printBlock(
    diagram.body.map(
      (statement) =>
        printAtoms(source, layoutSankeyLink(source, statement), {
          statement: "",
          continuation: "",
        }).doc,
    ),
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
    printAtoms(source, layoutKeywordHeader(source, keyword), {
      statement: "",
      continuation: "",
    }).doc,
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options, 0)
}

/** The block rules of the records (see `BlockRules`): none holds others or is dropped. */
function statementBlockRules(source: Source): BlockRules<SankeyLinkStatement> {
  return {
    kept: findSankeyKeptLines(source),
    printedEnd: findSankeyPrintedEnd,
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
  }
}
