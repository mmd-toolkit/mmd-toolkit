import type { AstPath, Doc, ParserOptions } from "prettier"
import type { C4Statement } from "@mmd-toolkit/ast"
import type { MermaidAst } from "../parser.ts"
import { printAccessibilityLine } from "./accessibility-form.ts"
import { printAtoms } from "./atoms.ts"
import type { AtomLayout } from "./atoms.ts"
import {
  openingLine,
  printBlock,
  printInlineGap,
  printClosedBlock,
  printDiagramBlock,
} from "./blocks.ts"
import type { BlockBounds, BlockRules, PrintedBlock } from "./blocks.ts"
import { c4KeptGapEnd, findC4KeptLines } from "./c4-kept-lines.ts"
import {
  lineStartOf,
  semicolonSegmentEnd,
  styleRuleStretchEnd,
} from "./kept-lines.ts"
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
        const before =
          previous === undefined
            ? ""
            : source.text
                  .slice(previous.range[1], statement.range[0])
                  .includes("\n")
              ? printAsWritten(source, previous.range[1], statement.range[0])
              : printInlineGap(
                  source,
                  previous.range[1],
                  statement.range[0],
                  { atLineStart: false, atLineEnd: false },
                  (start) => styleRuleStretchEnd(source, start),
                )
        const classified = classifyC4Statement(statement)
        // The last statement of a line that holds an empty block and a block
        // before it (`accDescr {}accDescr {D}`) is printed with the colon too.
        const line =
          unit.statements.length > 1 && index === unit.statements.length - 1
            ? printAccessibilityLine(
                source,
                statement,
                unit.range[0],
                keepsFollowingOnC4Line(source, statement),
              )
            : undefined
        if (line !== undefined) return [before, line]
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

/**
 * Whether what follows the last statement of a C4 unit stays on its printed
 * line: the shared block printer extends the stretch through the rest of the
 * line that the unit ends on when that line is kept. Otherwise, following
 * units go to lines of their own; C4 has no rule that attaches them by their
 * gaps (docs/compatibility.md, A description block on one line).
 */
function keepsFollowingOnC4Line(
  source: Source,
  statement: C4Statement,
): boolean {
  const kept = findC4KeptLines(source)
  const line = lineStartOf(source, statement.range[1] - 1)
  return kept.joined.has(line) || kept.verbatim.has(line)
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
    onlyStatementOf: (unit) =>
      unit.statements.length === 1
        ? { statement: unit.statements[0], head: "" }
        : undefined,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: true,
    keptGapEnd: (start, end, before) =>
      c4KeptGapEnd(source, start, end, before),
    keptInlineGapEnd: (start) => styleRuleStretchEnd(source, start),
    keptClosingJoin: "",
    keepsOpeningLine,
    diagramLineEnd: (offset) => semicolonSegmentEnd(source, offset),
  }
}
