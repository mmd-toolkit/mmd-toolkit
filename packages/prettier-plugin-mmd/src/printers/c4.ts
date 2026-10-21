import type { AstPath, Doc, ParserOptions } from "prettier"
import type { C4Statement } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import type { AtomLayout } from "./atoms.ts"
import {
  openingLine,
  printBlock,
  printClosedBlock,
  printDiagramBlock,
} from "./blocks.ts"
import type { BlockBounds, BlockRules, PrintedBlock } from "./blocks.ts"
import {
  c4DiagramLineEnd,
  c4KeptGapEnd,
  findC4KeptLines,
  c4KeptPrefixEnd,
} from "./c4-kept-lines.ts"
import {
  c4BoundaryBraces,
  classifyC4Statement,
  layoutC4Call,
  layoutC4Text,
  layoutC4Header,
  groupC4Units,
} from "./c4-layout.ts"
import type { C4Unit } from "./c4-layout.ts"
import { findLayoutEnd } from "./layout.ts"
import { indentationOf, printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween } from "./source.ts"

/** Prints C4's braced statement tree with the shared block machinery. */
export function printC4(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "C4Diagram")
    throw new Error(`prettier-plugin-mmd: ${diagram.type} is no C4 diagram`)
  const headerLayout = layoutC4Header(source, diagram)
  const block = printStatements(source, options, diagram.body, 1, {
    start: findLayoutEnd(headerLayout),
    end: source.text.length,
    isTopLevel: true,
  })
  return printDiagramBlock(
    source,
    openingLine(printLine(source, options, headerLayout, 0), block, false),
    block,
    options,
  )
}

/** Prints a statement's layout at its structural depth. */
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

/** Recurses only through boundary bodies; null blocks remain statements. */
function printStatements(
  source: Source,
  options: ParserOptions<MermaidAst>,
  statements: readonly C4Statement[],
  depth: number,
  bounds: Omit<BlockBounds<C4Unit>, "statements">,
  keepsOpeningLine = true,
): PrintedBlock {
  const units = groupC4Units(source, statements)
  return printBlock(
    units.map((unit) =>
      unit.statements.map((statement, index) => {
        const previous = unit.statements[index - 1]
        const gap =
          previous === undefined
            ? ""
            : source.text.slice(previous.range[1], statement.range[0])
        const before =
          gap.includes("\n") ||
          (previous !== undefined &&
            statement.range[0] <= c4KeptPrefixEnd(source, previous.range[1])) ||
          findTriviaBetween(
            source,
            previous?.range[1] ?? statement.range[0],
            statement.range[0],
          ).length > 0
            ? printAsWritten(
                source,
                previous?.range[1] ?? statement.range[0],
                statement.range[0],
              )
            : gap === ""
              ? ""
              : " "
        const classified = classifyC4Statement(statement)
        if (classified.kind !== "boundary")
          return [
            before,
            printLine(
              source,
              options,
              classified.kind === "call"
                ? layoutC4Call(source, classified.statement, statement.range[1])
                : layoutC4Text(source, classified.statement),
              depth,
            ),
          ]
        const { opening, closing } = c4BoundaryBraces(
          source,
          classified.statement,
        )
        const headerLayout = layoutC4Call(
          source,
          classified.statement,
          opening.range[1],
        )
        const block = printStatements(
          source,
          options,
          classified.statement.body,
          depth + 1,
          {
            start: opening.range[1],
            end: closing.range[0],
            isTopLevel: false,
          },
          headerLayout.joinedBefore?.has(opening.range[0]) !== true,
        )
        const header = openingLine(
          printLine(source, options, headerLayout, depth),
          block,
          false,
        )
        return [
          before,
          printClosedBlock(header, block, closing.value, depth, options),
        ]
      }),
    ),
    source,
    { statements: units, ...bounds },
    blockRules(source, keepsOpeningLine),
  )
}

/** C4 drops no statements or semicolons; protected gaps keep recovery lines. */
function blockRules(
  source: Source,
  keepsOpeningLine: boolean,
): BlockRules<C4Unit> {
  return {
    kept: findC4KeptLines(source),
    printedEnd: (unit) => unit.range[1],
    holdsStatements: (unit) =>
      unit.statements.some(
        (statement) => classifyC4Statement(statement).kind === "boundary",
      ),
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: true,
    keptGapEnd: (start, end, before) =>
      c4KeptGapEnd(source, start, end, before),
    keptInlineGapEnd: (start) => c4KeptPrefixEnd(source, start),
    keptClosingJoin: "",
    keepsOpeningLine,
    diagramLineEnd: (offset) => c4DiagramLineEnd(source, offset),
  }
}
