import type { AstPath, Doc, ParserOptions } from "prettier"
import { builders } from "prettier/doc"
import type { Range } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import { expectToken, findLayoutEnd, layoutKeywordHeader } from "./layout.ts"
import { placeLeadingDirectives } from "./indentation-lines.ts"
import { printAsWritten, significantIndentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import {
  findTokenStartingAt,
  findTriviaBetween,
  isCommentLine,
} from "./source.ts"
import {
  isTreeviewCommonStatement,
  layoutTreeviewStatement,
  treeviewBoxMode,
  treeviewLines,
} from "./treeview-layout.ts"

/** Prints the authored flat forest using the selected mode's column plan. */
export function printTreeview(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "TreeviewDiagram")
    throw new Error(
      `prettier-plugin-mmd: ${diagram.type} is no treeview diagram`,
    )
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the treeview header",
  )
  const boxMode = treeviewBoxMode(source, keyword.range[1])
  const joined = findLinesWithOwnSemicolons(source)
  const verbatim = findLinesEndedBySemicolon(source)
  // Fixed row boundaries inside protected lines constrain the forest. Retain
  // the body together before choosing columns (docs/treeview.md, Semicolons;
  // diagrams/treeview.md, Indentation and parents).
  const nodes = diagram.body.filter((item) => item.type === "TreeviewNode")
  const singleRootLine = nodes.every(
    (node) =>
      node.indent === 0 &&
      lineStartOf(source, node.range[0]) ===
        lineStartOf(source, nodes[0].range[0]),
  )
  const protectedRows =
    !singleRootLine &&
    diagram.body.some(
      (item) =>
        item.type === "TreeviewNode" &&
        diagram.body.some(
          (other) =>
            other !== item &&
            (lineStartOf(source, other.range[0]) ===
              lineStartOf(source, item.range[0]) ||
              lineStartOf(source, other.range[1] - 1) ===
                lineStartOf(source, item.range[0])) &&
            (joined.has(lineStartOf(source, item.range[0])) ||
              verbatim.has(lineStartOf(source, item.range[0]))),
        ),
    )
  if (protectedRows)
    return printAsWritten(source, diagram.range[0], source.text.length)
  const lines = treeviewLines(source, diagram, keyword.range[1], boxMode)
  const placements = new Map(
    lines.map((line) => {
      if (boxMode) {
        const start = lineStartOf(source, line.range[0])
        const common =
          isTreeviewCommonStatement(line.item) && line.item.prefix === null
        return [
          line,
          {
            indentation: common ? "" : source.text.slice(start, line.range[0]),
            head: "",
          },
        ]
      }
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
  const relocatedWhitespace: Range[] = boxMode
    ? []
    : lines.map((line, index) => [
        lines[index - 1]?.range[1] ?? keyword.range[1],
        line.range[0],
      ])
  const layouts = new Map(
    lines.map((line) => [
      line,
      layoutTreeviewStatement(
        source,
        line.item,
        boxMode ? "" : significantIndentationOf(options, line.depth),
        boxMode,
      ),
    ]),
  )
  const block = printBlock(
    lines.map((line) => [
      placements.get(line)!.head,
      printAtoms(source, layouts.get(line)!, {
        statement: boxMode ? "" : significantIndentationOf(options, line.depth),
        continuation: "",
        trivia: "",
      }).doc,
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
        writtenIndentation: new Set(
          lines.map((line) => lineStartOf(source, line.range[0])),
        ),
      },
      relocatedWhitespace,
      joiningRegionsInValues: true,
      printedEnd: (line) => findLayoutEnd(layouts.get(line)!),
      holdsStatements: () => false,
      isDroppedAtTopLevel: () => false,
      keepsWhitespaceLineAfterComment: false,
      keepsDirectiveLinesUnindented: false,
      keepsTrailingWhitespaceInKeptTrivia: true,
      writtenIndentationOf: (line) => placements.get(line)!.indentation,
      keptIndentationOf: (line) => placements.get(line)!.indentation,
      ...(boxMode
        ? {
            keptGapEnd: (start: number, end: number, before: boolean) => {
              const previous = lines.find(
                (line) => findLayoutEnd(layouts.get(line)!) === start,
              )
              const trivia = findTriviaBetween(source, start, end)
              if (
                trivia.some(
                  (item) =>
                    item.type === "Comment" &&
                    isCommentLine(source.text, source.root, item),
                ) &&
                !trivia.some((item) => item.type === "Directive")
              )
                return undefined
              if (
                previous !== undefined &&
                isTreeviewCommonStatement(previous.item)
              )
                return undefined
              return before ? Math.max(start, lineStartOf(source, end)) : end
            },
            triviaLineBreak: (start: number, end: number) => {
              const previous = lines.find(
                (line) => findLayoutEnd(layouts.get(line)!) === start,
              )
              const common =
                previous !== undefined &&
                isTreeviewCommonStatement(previous.item)
              const lineStart = lineStartOf(source, end)
              if (!common && lineStart > start)
                // Retain an earlier pending run without retaining a standalone
                // comment's indentation (docs/treeview.md, Comments).
                return printAsWritten(source, start, lineStart)
              const breaks = [...source.text.slice(start, end)].filter(
                (character) => character === "\n",
              )
              return breaks.length === 0
                ? undefined
                : breaks.map(() => builders.literalline)
            },
            writtenGapBefore: (line: (typeof lines)[number]) =>
              lineStartOf(source, line.range[0]) < line.range[0] &&
              source.text
                .slice(lineStartOf(source, line.range[0]), line.range[0])
                .trim() !== "",
          }
        : {}),
    },
  )
  return printDiagramBlock(
    source,
    openingLine(
      printAtoms(source, layoutKeywordHeader(source, keyword), {
        statement: "",
        continuation: "",
      }).doc,
      block,
      false,
    ),
    block,
    options,
    0,
  )
}
