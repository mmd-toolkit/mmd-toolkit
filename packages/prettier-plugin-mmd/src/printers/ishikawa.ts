import type { AstPath, Doc, ParserOptions } from "prettier"
import { builders } from "prettier/doc"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import {
  findIshikawaKeptLines,
  ishikawaDiagramLineEnd,
} from "./ishikawa-kept-lines.ts"
import type { IshikawaLine } from "./ishikawa-layout.ts"
import { ishikawaLines, layoutIshikawaLine } from "./ishikawa-layout.ts"
import { placeLeadingDirectives } from "./indentation-lines.ts"
import { expectToken, layoutKeywordHeader } from "./layout.ts"
import {
  indentationOf,
  printAsWritten,
  significantIndentationOf,
} from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt, isCommentLine } from "./source.ts"

/** Prints Ishikawa's nested tree with one configured step per depth. */
export function printIshikawa(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "IshikawaDiagram")
    throw new Error(
      `prettier-plugin-mmd: ${diagram.type} is no ishikawa diagram`,
    )
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the ishikawa header",
  )
  const lines = ishikawaLines(source, diagram, keyword.range[1])
  const placements = new Map(
    lines.map((line) => {
      const column = significantIndentationOf(options, line.depth)
      const width = column.length - line.separatorWidth
      const character = options.useTabs ? "\t" : " "
      return [
        line,
        line.leading === null
          ? { indentation: character.repeat(width), head: "", column }
          : {
              ...placeLeadingDirectives(source, line.leading, width, character),
              column,
            },
      ]
    }),
  )

  /** Every line has been placed before the block reads it. */
  function placement(line: IshikawaLine): {
    indentation: string
    head: Doc
    column: string
  } {
    const placed = placements.get(line)
    if (placed === undefined)
      throw new Error("prettier-plugin-mmd: an unplaced ishikawa node")
    return placed
  }

  const rules: BlockRules<IshikawaLine> = {
    kept: findIshikawaKeptLines(source, lines),
    printedEnd: (line) => line.range[1],
    blankBeforeStatement: (line, gap) => {
      if (line !== lines[0]) return gap.blankAfter
      return (
        gap.blankAfter &&
        source.root.comments.some(
          (comment) =>
            keyword.range[1] <= comment.range[0] &&
            comment.range[1] <= line.range[0] &&
            (!isCommentLine(source.text, source.root, comment) ||
              comment.range[0] < source.text.indexOf("\n", keyword.range[1])),
        )
      )
    },
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
    keepsInlineDirectivesWithPrevious: true,
    keepsTrailingWhitespaceInKeptTrivia: true,
    extraIndentationOf: (line) =>
      placement(line).column.slice(indentationOf(options, 1).length),
    writtenIndentationOf: (line) => placement(line).indentation,
    keptIndentationOf: (line) => placement(line).indentation,
    diagramLineEnd: (offset) => ishikawaDiagramLineEnd(source, offset),
    keptInlineGapEnd: (start) => ishikawaDiagramLineEnd(source, start),
    triviaLineBreak: (start, end, terminal) => {
      const comment = source.trivia.find(
        (item) => item.type === "Comment" && item.range[1] === start,
      )
      if (comment === undefined || comment.type !== "Comment") return undefined
      const separator = source.text[start]
      if (terminal && !isCommentLine(source.text, source.root, comment))
        return printAsWritten(source, start, end)
      if (separator !== "\u2028" && separator !== "\u2029") return undefined
      const breaks = source.text.slice(start, end).split("\n").length - 1
      return [
        separator,
        breaks > 0 ? builders.literalline : "",
        breaks > 1 ? builders.literalline : "",
      ]
    },
  }
  const block = printBlock(
    lines.map((line) => [
      placement(line).head,
      printAtoms(source, layoutIshikawaLine(line), {
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
    rules,
  )
  const header = openingLine(
    printAtoms(source, layoutKeywordHeader(source, keyword), {
      statement: "",
      continuation: "",
    }).doc,
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
}
