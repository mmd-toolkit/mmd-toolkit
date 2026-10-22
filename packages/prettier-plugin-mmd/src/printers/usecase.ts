import type { AstPath, Doc, ParserOptions } from "prettier"
import type { UsecaseStatement } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { AtomLayout } from "./atoms.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockBounds, BlockRules, PrintedBlock } from "./blocks.ts"
import {
  openingLine,
  printBlock,
  printClosedBlock,
  printDiagramBlock,
} from "./blocks.ts"
import { keptSemicolonPrefixEnd, semicolonSegmentEnd } from "./kept-lines.ts"
import { expectToken, layoutKeywordHeader } from "./layout.ts"
import { indentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenEndingBefore, findTokenStartingAt } from "./source.ts"
import { findUsecaseKeptLines } from "./usecase-kept-lines.ts"
import {
  classifyUsecaseStatement,
  layoutUsecaseStatement,
  usecaseBoundaryHeaderEnd,
} from "./usecase-layout.ts"

/** Prints the authored usecase tree using ordinary structural indentation. */
export function printUsecase(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "UsecaseDiagram")
    throw new Error(
      `prettier-plugin-mmd: ${diagram.type} is no usecase diagram`,
    )
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the usecase header",
  )
  const block = printStatements(source, options, diagram.body, 1, {
    start: keyword.range[1],
    end: source.text.length,
    isTopLevel: true,
  })
  return printDiagramBlock(
    source,
    openingLine(
      printLine(source, options, layoutKeywordHeader(source, keyword), 0),
      block,
      false,
    ),
    block,
    options,
  )
}

/** Uses the configured step unchanged: columns do not select usecase syntax. */
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

/** Only system boundaries contain declaration bodies (docs/usecase.md). */
function printStatements(
  source: Source,
  options: ParserOptions<MermaidAst>,
  statements: readonly UsecaseStatement[],
  depth: number,
  bounds: Omit<BlockBounds<UsecaseStatement>, "statements">,
): PrintedBlock {
  const rules: BlockRules<UsecaseStatement> = {
    kept: findUsecaseKeptLines(source),
    printedEnd: (statement) => statement.range[1],
    holdsStatements: (statement) =>
      classifyUsecaseStatement(statement).kind === "boundary",
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
    keptInlineGapEnd: (start) => keptSemicolonPrefixEnd(source, start),
    diagramLineEnd: (offset) => semicolonSegmentEnd(source, offset),
    keepsTrailingWhitespaceInKeptTrivia: true,
  }
  return printBlock(
    statements.map((statement) => {
      const classified = classifyUsecaseStatement(statement)
      if (classified.kind === "simple")
        return printLine(
          source,
          options,
          layoutUsecaseStatement(source, statement, statement.range[1]),
          depth,
        )
      const boundary = classified.statement
      const end = usecaseBoundaryHeaderEnd(source, boundary)
      const closing = expectToken(
        findTokenEndingBefore(source, boundary.range[1]),
        "the end of a system boundary",
      )
      const block = printStatements(source, options, boundary.body, depth + 1, {
        start: end,
        end: closing.range[0],
        isTopLevel: false,
      })
      return printClosedBlock(
        openingLine(
          printLine(
            source,
            options,
            layoutUsecaseStatement(source, boundary, end),
            depth,
          ),
          block,
          false,
        ),
        block,
        closing.value,
        depth,
        options,
      )
    }),
    source,
    { statements, ...bounds },
    rules,
  )
}
