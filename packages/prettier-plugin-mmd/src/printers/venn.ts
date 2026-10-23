import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import { expectToken, layoutKeywordHeader } from "./layout.ts"
import { lineStartOf } from "./kept-lines.ts"
import { significantIndentationOf, printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt, findTriviaBetween } from "./source.ts"
import {
  findVennKeptLines,
  vennDiagramLineEnd,
  vennKeptGapEnd,
  vennKeptPrefixEnd,
} from "./venn-kept-lines.ts"
import type { VennUnit } from "./venn-layout.ts"
import {
  groupVennUnits,
  isImplicitVennUnit,
  layoutVennStatement,
} from "./venn-layout.ts"

/** Prints a flat Venn body with implicit markers one configured step deeper. */
export function printVenn(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "VennDiagram")
    throw new Error(`prettier-plugin-mmd: ${diagram.type} is no venn diagram`)
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the venn header",
  )
  const units = groupVennUnits(source, diagram.body)
  const block = printBlock(
    units.map((unit) =>
      unit.statements.map((statement, index) => {
        const previous = unit.statements[index - 1]
        const start = previous?.range[1] ?? statement.range[0]
        const gap = source.text.slice(start, statement.range[0])
        const before =
          previous === undefined
            ? ""
            : statement.range[0] <= vennKeptPrefixEnd(source, start) ||
                findTriviaBetween(source, start, statement.range[0]).length >
                  0 ||
                gap.includes("\n")
              ? printAsWritten(source, start, statement.range[0])
              : gap === ""
                ? ""
                : " "
        return [
          before,
          printAtoms(source, layoutVennStatement(source, statement), {
            statement: "",
            continuation: "",
          }).doc,
        ]
      }),
    ),
    source,
    {
      statements: units,
      start: keyword.range[1],
      end: source.text.length,
      isTopLevel: true,
    },
    blockRules(source, options),
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

/** Shared hooks retain comments and semicolons without diagram-specific branches. */
function blockRules(
  source: Source,
  options: ParserOptions<MermaidAst>,
): BlockRules<VennUnit> {
  /** Indentation before the first directive, after accounting for all its gaps. */
  function leadingIndentation(unit: VennUnit): string | undefined {
    const start = lineStartOf(source, unit.range[0])
    const leading = findTriviaBetween(source, start, unit.range[0])
    if (leading.length === 0) return undefined
    const hasMarkerGap = leading.some((item, index) => {
      const next = leading[index + 1]?.range[0] ?? unit.range[0]
      return next > item.range[1]
    })
    return isImplicitVennUnit(unit) && !hasMarkerGap
      ? significantIndentationOf(options, 1)
      : ""
  }

  return {
    kept: findVennKeptLines(source),
    printedEnd: (unit) => unit.range[1],
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
    keepsInlineDirectivesWithPrevious: true,
    keepsTrailingWhitespaceInKeptTrivia: true,
    extraIndentationOf: (unit) =>
      isImplicitVennUnit(unit) ? significantIndentationOf(options, 1) : "",
    // A leading directive's gaps already supply a positive marker. Preserve
    // them and choose only the whitespace before the first directive
    // (diagrams/venn.md, Text and implicit text mode; docs/venn.md, Directives).
    writtenIndentationOf: leadingIndentation,
    keptIndentationOf: (unit) =>
      leadingIndentation(unit) ??
      (isImplicitVennUnit(unit) ? significantIndentationOf(options, 1) : ""),
    diagramLineEnd: (offset) => vennDiagramLineEnd(source, offset),
    keptInlineGapEnd: (start) => vennKeptPrefixEnd(source, start),
    keptGapEnd: (start, end, before) =>
      vennKeptGapEnd(source, start, end, before),
  }
}
