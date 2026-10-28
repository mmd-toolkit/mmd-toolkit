import type { AstPath, Doc, ParserOptions } from "prettier"
import type { Range } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import { expectToken, layoutKeywordHeader } from "./layout.ts"
import { placeLeadingDirectives } from "./indentation-lines.ts"
import { printAsWritten, significantIndentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"
import {
  layoutTreemapStatement,
  treemapLines,
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
  const joined = findLinesWithOwnSemicolons(source)
  const verbatim = findLinesEndedBySemicolon(source)
  const lines = treemapLines(source, diagram, keyword.range[1])
  // A kept semicolon line that contains a row boundary constrains its logical
  // indentation. Preserve the body together, rather than fixing some rows and
  // moving others (docs/treemap.md, Semicolons; diagrams/treemap.md,
  // Headers and indentation). This is a source constraint, not output reparsing.
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
          (joined.has(lineStartOf(source, treemapStatementRange(item)[0])) ||
            verbatim.has(lineStartOf(source, treemapStatementRange(item)[0]))),
      ),
  )
  if (protectedRows)
    return printAsWritten(source, diagram.range[0], source.text.length)
  const placements = new Map(
    lines.map((line) => {
      const column = significantIndentationOf(options, line.depth)
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
    lines.map((line) => [
      placements.get(line)!.head,
      ...line.statements.flatMap((statement, index) => [
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
            significantIndentationOf(options, line.depth),
          ),
          {
            statement: significantIndentationOf(options, line.depth),
            continuation: "",
            trivia: "",
          },
        ).doc,
      ]),
    ]),
    source,
    {
      statements: lines,
      start: keyword.range[1],
      end: source.text.length,
      isTopLevel: true,
    },
    {
      kept: {
        joined,
        verbatim,
        ownIndentation: new Set(
          lines.map((line) => lineStartOf(source, line.range[0])),
        ),
      },
      relocatedWhitespace,
      printedEnd: (line) => line.range[1],
      holdsStatements: () => false,
      isDroppedAtTopLevel: () => false,
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
