import type { AstPath, Doc, ParserOptions } from "prettier"
import type { BlockStatement } from "@mmd-toolkit/parser"
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
import { findBlockKeptLines } from "./block-kept-lines.ts"
import type { BlockUnit } from "./block-layout.ts"
import {
  findBlockPrintedEnd,
  findCompositeBounds,
  groupBlockUnits,
  layoutBlockRow,
  layoutBlockStatement,
  layoutCompositeHead,
} from "./block-layout.ts"
import { expectToken, findLayoutEnd, layoutKeywordHeader } from "./layout.ts"
import { indentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

/**
 * Prints the body of a block diagram and the nodes below it, to the end of
 * the text (docs/block.md).
 *
 * The statements stand one level deeper than the header, and those of a
 * composite one level deeper than its `block:` line, with `end` on a line of
 * its own at the level of `block:`. The nodes and `space` blocks that stand
 * on one line stay on it as a row; every other statement stands on a line of
 * its own. Comments and directives on lines of their own stand at the level
 * of the statement after them, and at the end of the text at that of the last
 * statement; runs of empty lines become one, and empty lines at the start and
 * the end of a body are dropped (see `printBlock`). The statements are
 * printed here, and not by `print` one by one.
 */
export function printBlockDiagram(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const diagram = path.node
  if (diagram.type !== "BlockDiagram") {
    throw new Error(
      `prettier-plugin-mmd: ${diagram.type} is no node of a block diagram that is printed on its own`,
    )
  }
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  const headerLayout = layoutKeywordHeader(source, keyword)
  const block = printStatements(source, options, diagram.body, 1, {
    start: findLayoutEnd(headerLayout),
    end: source.text.length,
    isTopLevel: true,
  })
  const header = openingLine(
    printLine(source, options, headerLayout, 0),
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
}

/** Prints a statement laid out on its lines at `depth`. */
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

/** Prints the statements of a block at `depth`. */
function printStatements(
  source: Source,
  options: ParserOptions<MermaidAst>,
  statements: readonly BlockStatement[],
  depth: number,
  bounds: Omit<BlockBounds<BlockUnit>, "statements">,
): PrintedBlock {
  const units = groupBlockUnits(source, statements)
  return printBlock(
    units.map((unit) => printUnit(source, options, unit, depth)),
    source,
    { statements: units, ...bounds },
    blockRules(source),
  )
}

/** Prints a unit: a row, a composite with its body, or a statement. */
function printUnit(
  source: Source,
  options: ParserOptions<MermaidAst>,
  unit: BlockUnit,
  depth: number,
): Doc {
  switch (unit.kind) {
    case "row":
      return printLine(
        source,
        options,
        layoutBlockRow(source, unit.statements),
        depth,
      )
    case "line":
      return printLine(
        source,
        options,
        layoutBlockStatement(source, unit.statement),
        depth,
      )
    case "composite": {
      const { opening, closing } = findCompositeBounds(source, unit.statement)
      const block = printStatements(
        source,
        options,
        unit.statement.body,
        depth + 1,
        {
          start: opening,
          end: closing.range[0],
          isTopLevel: false,
        },
      )
      const header = openingLine(
        printLine(
          source,
          options,
          layoutCompositeHead(source, unit.statement),
          depth,
        ),
        block,
        false,
      )
      return printClosedBlock(header, block, closing.value, depth, options)
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown unit ${JSON.stringify(unit satisfies never)}`,
      )
  }
}

/**
 * The block rules of the units (see `BlockRules`): a composite holds lines of
 * its own, and no unit is dropped.
 */
function blockRules(source: Source): BlockRules<BlockUnit> {
  return {
    kept: findBlockKeptLines(source),
    printedEnd: findBlockPrintedEnd,
    holdsStatements: (unit) => unit.kind === "composite",
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
  }
}
