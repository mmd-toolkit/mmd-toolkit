import type { AstPath, Doc, ParserOptions } from "prettier"
import type { Range } from "@mmd-toolkit/ast"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
  withJoinedLines,
} from "./kept-lines.ts"
import { expectToken, layoutKeywordHeader } from "./layout.ts"
import { placeLeadingDirectives } from "./indentation-lines.ts"
import { printAsWritten, significantIndentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt, holdsRemoved } from "./source.ts"
import {
  findTreemapPrintedEnd,
  layoutTreemapStatement,
  treemapLines,
  treemapPrintedDepth,
  treemapStatementRange,
} from "./treemap-layout.ts"

/** Prints the nested section forest and named gaps in source order. */
export function printTreemap(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "TreemapDiagram")
    throw new Error(
      `prettier-plugin-mmd: ${diagram.type} is no treemap diagram`,
    )
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the treemap header",
  )
  const lines = treemapLines(source, diagram, keyword.range[1])
  const kept = {
    joined: findLinesWithOwnSemicolons(source),
    verbatim: findLinesEndedBySemicolon(source),
    ownIndentation: new Set(
      lines.map((line) => lineStartOf(source, line.range[0])),
    ),
  }
  // The lines that a directive that is not closed joins are kept lines too:
  // the rows on such a line are read with the indentation of the first one.
  const keptWithJoinedLines = withJoinedLines(source, kept, false)
  // A kept semicolon line, or a line that a directive that is not closed
  // joins, that contains a row boundary constrains its logical indentation.
  // Preserve the body together, rather than fixing some rows and moving others
  // (docs/treemap.md, Semicolons and Directives; diagrams/treemap.md, Headers
  // and indentation). This is a source constraint, not output reparsing.
  const items = lines.flatMap((line) => line.statements)
  const protectedRows = items.some(
    (item) =>
      (item.type === "TreemapSection" || item.type === "TreemapLeaf") &&
      items.some(
        (other) =>
          other !== item &&
          (lineStartOf(source, treemapStatementRange(other)[0]) ===
            lineStartOf(source, treemapStatementRange(item)[0]) ||
            lineStartOf(source, treemapStatementRange(other)[1] - 1) ===
              lineStartOf(source, treemapStatementRange(item)[0])) &&
          (keptWithJoinedLines.joined.has(
            lineStartOf(source, treemapStatementRange(item)[0]),
          ) ||
            keptWithJoinedLines.verbatim.has(
              lineStartOf(source, treemapStatementRange(item)[0]),
            ) ||
            // A directive between two rows of a line takes the whitespace
            // after it, which is the indentation of the second row.
            ((other.type === "TreemapSection" ||
              other.type === "TreemapLeaf") &&
              holdsRemoved(
                source,
                Math.min(
                  treemapStatementRange(item)[1],
                  treemapStatementRange(other)[1],
                ),
                Math.max(
                  treemapStatementRange(item)[0],
                  treemapStatementRange(other)[0],
                ),
              ))),
      ),
  )
  if (protectedRows)
    return printAsWritten(source, diagram.range[0], source.text.length)
  const placements = new Map(
    lines.map((line) => {
      const column = significantIndentationOf(
        options,
        treemapPrintedDepth(source, line),
      )
      return [
        line,
        line.leading === null
          ? { indentation: column, head: "" }
          : placeLeadingDirectives(
              source,
              line.leading,
              column.length,
              options.useTabs ? "\t" : " ",
            ),
      ]
    }),
  )
  const relocatedWhitespace: Range[] = lines.map((line, index) => [
    lines[index - 1]?.range[1] ?? keyword.range[1],
    line.range[0],
  ])
  const block = printBlock(
    lines.map((line) => {
      const depth = treemapPrintedDepth(source, line)
      const column = significantIndentationOf(options, depth)
      return [
        placements.get(line)!.head,
        ...line.statements.flatMap((statement, index) => {
          const descriptionIndentation =
            statement.type === "TreemapAccDescrBlockStatement"
              ? significantIndentationOf(options, depth + 1)
              : ""
          return [
            index === 0
              ? ""
              : printAsWritten(
                  source,
                  treemapStatementRange(line.statements[index - 1])[1],
                  treemapStatementRange(statement)[0],
                ),
            printAtoms(
              source,
              layoutTreemapStatement(
                source,
                statement,
                column,
                significantIndentationOf(options, 1),
              ),
              {
                statement: column,
                continuation: descriptionIndentation,
                trivia: descriptionIndentation,
              },
            ).doc,
          ]
        }),
      ]
    }),
    source,
    {
      statements: lines,
      start: keyword.range[1],
      end: source.text.length,
      isTopLevel: true,
    },
    {
      kept,
      relocatedWhitespace,
      indentsOnlyCommentLines: true,
      extraIndentationOf: (line) => placements.get(line)!.indentation,
      printedEnd: (line) => findTreemapPrintedEnd(source, line),
      holdsStatements: () => false,
      isDroppedAtTopLevel: () => false,
      onlyStatementOf: (line) =>
        line.statements.length === 1
          ? {
              statement: line.statements[0],
              head: placements.get(line)!.head,
            }
          : undefined,
      joiningRegionsPrintedAsWritten: true,
      keepsWhitespaceLineAfterComment: false,
      keepsDirectiveLinesUnindented: false,
      keepsInlineDirectivesWithPrevious: true,
      keepsTrailingWhitespaceInKeptTrivia: true,
      writtenIndentationOf: (line) => placements.get(line)!.indentation,
      keptIndentationOf: (line) => placements.get(line)!.indentation,
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
