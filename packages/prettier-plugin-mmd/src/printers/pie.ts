import type { AstPath, Doc, ParserOptions } from "prettier"
import type { PieBodyItem } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import { findLayoutEnd } from "./layout.ts"
import { lineEndOf } from "./kept-lines.ts"
import { indentationOf, printAsWritten } from "./lines.ts"
import { findPieKeptLines } from "./pie-kept-lines.ts"
import {
  layoutPieHeader,
  layoutPieStatement,
  pieKeyword,
} from "./pie-layout.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween } from "./source.ts"

/** Root cleanup must not promote detection-skipped YAML into frontmatter. */
export function keepsPiePrefix(source: Source): boolean {
  const diagram = source.root.body
  return diagram.type === "PieDiagram" && diagram.textBeforeHeader.length > 0
}

/** Prints the flat written pie body with the shared block and value layouts. */
export function printPie(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "PieDiagram")
    throw new Error(`prettier-plugin-mmd: ${diagram.type} is no pie diagram`)
  const headerLayout = layoutPieHeader(source, diagram)
  const indentation = {
    statement: indentationOf(options, 1),
    continuation: indentationOf(options, 2),
  }
  const hiddenEnds = new Set(
    diagram.body
      .filter((item) => item.type === "PieIgnoredText")
      .map((item) => item.range[1]),
  )
  for (const item of diagram.body) {
    if (item.type !== "PieIgnoredText" && item.textAfter.length > 0)
      hiddenEnds.add(item.range[1])
  }
  const layouts = new Map(
    diagram.body.map((item) => [item, layoutPieStatement(source, item)]),
  )

  /**
   * Hidden YAML and directives consume LF outside their ranges; closing
   * padding can instead leave that LF visible. Keep both as written, removing
   * only the next statement's indentation (docs/pie.md, Hidden yaml and
   * Hidden directives; diagrams/pie.md, Hidden YAML and Hidden DIRECTIVE).
   */
  function hiddenGapEnd(
    start: number,
    end: number,
    beforeStatement: boolean,
  ): number | undefined {
    if (!hiddenEnds.has(start)) return undefined
    let stop = end
    if (beforeStatement) {
      while (
        stop > start &&
        (source.text[stop - 1] === " " || source.text[stop - 1] === "\t")
      )
        stop--
    }
    return stop
  }

  const block = printBlock(
    [...layouts.values()].map(
      (layout) => printAtoms(source, layout, indentation).doc,
    ),
    source,
    {
      statements: diagram.body,
      start: findLayoutEnd(headerLayout),
      end: source.text.length,
      isTopLevel: true,
    },
    {
      kept: findPieKeptLines(source, diagram),
      printedEnd: (item: PieBodyItem) => findLayoutEnd(layouts.get(item)!),
      joiningRegionsInValues: true,
      holdsStatements: () => false,
      isDroppedAtTopLevel: () => false,
      keepsWhitespaceLineAfterComment: false,
      keepsDirectiveLinesUnindented: false,
      // A hidden form keeps its closing line joined; comments on that line
      // still retain their trailing text (docs/pie.md, Comments).
      keepsTrailingWhitespaceInKeptTrivia: true,
      // Inline successors use the joined-line path and keep their closing
      // padding. A whitespace-only tail belongs to the following gap instead,
      // so the same gap rule receives single-line and multiline boundaries.
      diagramLineEnd: (offset) =>
        hiddenEnds.has(offset) &&
        source.text.slice(offset, lineEndOf(source, offset)).trim() === ""
          ? offset
          : undefined,
      keptInlineGapEnd: (start) =>
        hiddenEnds.has(start) ? lineEndOf(source, start) : start,
      keptGapEnd: (start, end, beforeStatement) => {
        if (findTriviaBetween(source, start, end).length > 0) return undefined
        return hiddenGapEnd(start, end, beforeStatement)
      },
      triviaLineBreak: (start, end) => {
        const stop = hiddenGapEnd(start, end, true)
        return stop === undefined
          ? undefined
          : printAsWritten(source, start, stop)
      },
    },
  )
  const header = openingLine(
    printAtoms(source, headerLayout, { statement: "", continuation: "" }).doc,
    block,
    false,
  )
  const keyword = pieKeyword(source, diagram)
  return [
    printAsWritten(source, diagram.range[0], keyword.range[0]),
    printDiagramBlock(source, header, block, options),
  ]
}
