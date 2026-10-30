import { appendItems } from "./collections.ts"
import type {
  BlockClassDefStatement,
  BlockClassStatement,
  BlockColumnsStatement,
  BlockCompositeStatement,
  BlockNode,
  BlockNodeStatement,
  BlockSpaceStatement,
  BlockStatement,
  BlockStyleStatement,
  Node,
  Range,
  Token,
} from "@mmd-toolkit/parser"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  keptAsWritten,
  layoutEmptyDescriptionBlock,
  layoutCompactEmptyDescriptionBlockWithFallback,
  spansLinesThatCannotJoin,
  walk,
} from "./layout.ts"
import { readGap } from "./gap.ts"
import { lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenEndingBefore,
  findTokenStartingAt,
  findTokensBetween,
} from "./source.ts"

/**
 * The node types of a block diagram whose text is a value, printed as
 * written: an id, a label, a number, and the name of a class or a style
 * (BlockLiteral). They have no child fields; `tests/value-nodes.test.ts`
 * checks that every other such node type is left out on purpose.
 */
export const blockValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "BlockLiteral",
])

/** A statement that stands in a row (docs/block.md, Rows). */
export type BlockRowStatement = BlockNodeStatement | BlockSpaceStatement

/** A statement that stands on a line of its own. */
export type BlockLineStatement = Exclude<
  BlockStatement,
  BlockRowStatement | BlockCompositeStatement
>

/**
 * What a block is printed in: the statements of a row, which stay on their
 * line, a composite with its body, or any other statement, each on a line of
 * its own (docs/block.md, Rows).
 */
export type BlockUnit =
  | {
      readonly kind: "row"
      readonly range: Range
      readonly statements: readonly BlockRowStatement[]
    }
  | {
      readonly kind: "composite"
      readonly range: Range
      readonly statement: BlockCompositeStatement
    }
  | {
      readonly kind: "line"
      readonly range: Range
      readonly statement: BlockLineStatement
    }

/**
 * Groups the statements of a block into units. The statements of a row, nodes
 * and `space` blocks, that follow each other on one line are one unit, so the
 * printer keeps the line that the author laid them out on; every other
 * statement is a unit of its own.
 */
export function groupBlockUnits(
  source: Source,
  statements: readonly BlockStatement[],
): BlockUnit[] {
  const units: BlockUnit[] = []
  let row: BlockRowStatement[] = []

  /** Ends the row being collected, if there is one. */
  function endRow(): void {
    const [first] = row
    if (first === undefined) return
    units.push({
      kind: "row",
      range: [first.range[0], (row.at(-1) as BlockRowStatement).range[1]],
      statements: row,
    })
    row = []
  }

  for (const statement of statements) {
    if (isRowStatement(statement)) {
      const previous = row.at(-1)
      if (
        previous !== undefined &&
        lineStartOf(source, previous.range[1] - 1) !==
          lineStartOf(source, statement.range[0])
      ) {
        endRow()
      }
      row.push(statement)
      continue
    }
    endRow()
    units.push(
      statement.type === "BlockCompositeStatement"
        ? { kind: "composite", range: statement.range, statement }
        : { kind: "line", range: statement.range, statement },
    )
  }
  endRow()
  return units
}

/** Whether a statement stands in a row. */
function isRowStatement(
  statement: BlockStatement,
): statement is BlockRowStatement {
  return (
    statement.type === "BlockNodeStatement" ||
    statement.type === "BlockSpaceStatement"
  )
}

/**
 * The layout of a row: its statements on one line, a space between two of
 * them (docs/block.md, Rows), each laid out as `layoutBlockStatement` says.
 * A row whose statements lie on lines of the source that mermaid.js reads as
 * one, because a comment line after U+2028 or U+2029 joins them (see
 * `JoiningRegion`), is kept as written.
 */
export function layoutBlockRow(
  source: Source,
  statements: readonly BlockRowStatement[],
): AtomLayout {
  const gapsBreakLines = statements.some(
    (statement, index) =>
      index > 0 &&
      readGap(source, statements[index - 1].range[1], statement.range[0], true)
        .breaksLine,
  )
  if (gapsBreakLines) {
    return keptAsWritten(
      statements[0].range[0],
      (statements.at(-1) as BlockRowStatement).range[1],
    )
  }
  const rules = new Map<number, GapRule>()
  const atoms: Atom[] = []
  for (const [index, statement] of statements.entries()) {
    const layout = layoutBlockStatement(source, statement)
    appendItems(atoms, layout.atoms)
    for (const [offset, rule] of layout.rules) rules.set(offset, rule)
    if (index > 0) rules.set(statement.range[0], "space")
  }
  return { atoms, rules, outdented: new Set(), lineBreaks: "joined" }
}

/**
 * The layout of the line that opens a composite, `block:` with its node,
 * `block`, or `block-beta`.
 */
export function layoutCompositeHead(
  source: Source,
  composite: BlockCompositeStatement,
): AtomLayout {
  const { head } = composite
  const keyword = expectToken(
    findTokenStartingAt(source, composite.range[0]),
    "the keyword of a composite",
  )
  if (head === null) {
    return {
      atoms: [{ start: keyword.range[0], end: keyword.range[1] }],
      rules: new Map(),
      outdented: new Set(),
      lineBreaks: "joined",
    }
  }
  if (spansLinesThatCannotJoin(source, keyword.range[0], head.range[1])) {
    return keptAsWritten(keyword.range[0], head.range[1])
  }
  const layout = layoutBlockStatement(source, head)
  return {
    atoms: [
      { start: keyword.range[0], end: keyword.range[1] },
      ...layout.atoms,
    ],
    rules: new Map([...layout.rules, [head.range[0], "none"]]),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/** Where the line that opens a composite ends, and the `end` that closes it. */
export function findCompositeBounds(
  source: Source,
  composite: BlockCompositeStatement,
): { readonly opening: number; readonly closing: Token } {
  const keyword = expectToken(
    findTokenStartingAt(source, composite.range[0]),
    "the keyword of a composite",
  )
  const closing = expectToken(
    findTokenEndingBefore(source, composite.range[1]),
    "the `end` of a composite",
  )
  expectValue(closing, "end")
  return { opening: (composite.head ?? keyword).range[1], closing }
}

/**
 * The layout of a statement, from its start to the end of its range.
 *
 * - A statement written over several lines stands on one line where the
 *   lexer reads the line break as whitespace; one with a comment or a
 *   directive in it, or a `;`, is kept as written (see
 *   `spansLinesThatCannotJoin`; docs/block.md, Multi-line statements).
 * - The rules of the gaps are those of docs/block.md: Columns and space,
 *   Shapes, Edges, and Styles.
 */
export function layoutBlockStatement(
  source: Source,
  statement: Exclude<BlockStatement, BlockCompositeStatement>,
): AtomLayout {
  const start = statement.range[0]
  const end = statement.range[1]
  if (statement.type === "BlockAccDescrBlockStatement") {
    return layoutCompactEmptyDescriptionBlockWithFallback(
      source,
      start,
      end,
      () => layoutEmptyDescriptionBlock(source, start, end),
    )
  }
  if (spansLinesThatCannotJoin(source, start, end)) {
    return keptAsWritten(start, end)
  }
  const rules = new Map<number, GapRule>()
  const kept: Atom[] = []
  switch (statement.type) {
    case "BlockNodeStatement":
      addNodeStatementRules(source, statement, rules, kept)
      break
    case "BlockSpaceStatement":
      if (statement.width !== null) rules.set(statement.width.range[0], "none")
      break
    case "BlockColumnsStatement":
      addColumnsRules(source, statement, rules)
      break
    case "BlockClassDefStatement":
    case "BlockStyleStatement":
      addStyledStatementRules(source, statement, rules, kept)
      break
    case "BlockClassStatement":
      addClassRules(statement, rules, kept)
      break
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      collectValueNodes(statement, blockValueNodeTypes),
      kept,
    ),
    rules,
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * The rules of a node statement: a shape and a block arrow touch their id,
 * the `:` of a width touches what is before it, and an arrow, the label
 * between two arrows, and the node after them stand after one space
 * (docs/block.md, Shapes and Edges). The directions of a block arrow, with
 * the parentheses around them, are printed as written.
 */
function addNodeStatementRules(
  source: Source,
  statement: BlockNodeStatement,
  rules: Map<number, GapRule>,
  kept: Atom[],
): void {
  walk(statement, (node) => {
    if (node.type === "BlockNode") addNodeRules(source, node, rules, kept)
  })
  if (statement.width !== null) {
    const colon = expectToken(
      findStructuralToken(source, statement.node.range[1]),
      "the `:` of a width",
    )
    expectValue(colon, ":")
    rules.set(colon.range[0], "none")
  }
  for (const link of statement.links) {
    rules.set(link.range[0], "space")
    if (link.opening !== null && link.label !== null) {
      rules.set(link.label.range[0], "space")
      rules.set(link.arrow.range[0], "space")
    }
    rules.set(link.target.range[0], "space")
  }
}

/** Adds the rules of the shape of a node, if it has one. */
function addNodeRules(
  source: Source,
  node: BlockNode,
  rules: Map<number, GapRule>,
  kept: Atom[],
): void {
  const { shape } = node
  if (shape === null) return
  rules.set(shape.range[0], "none")
  if (shape.type !== "BlockArrowShape") return
  const closing = expectToken(
    findStructuralToken(source, shape.label.range[1]),
    "the `]>` of a block arrow",
  )
  expectValue(closing, "]>")
  const opening = expectToken(
    findStructuralToken(source, closing.range[1]),
    "the `(` of a block arrow",
  )
  expectValue(opening, "(")
  rules.set(opening.range[0], "none")
  kept.push({ start: opening.range[0], end: shape.range[1] })
}

/**
 * The rule of a `columns` statement: its number, or `auto`, stands after one
 * space (docs/block.md, Columns and space).
 */
function addColumnsRules(
  source: Source,
  statement: BlockColumnsStatement,
  rules: Map<number, GapRule>,
): void {
  const keyword = expectToken(
    findTokenStartingAt(source, statement.range[0]),
    "`columns`",
  )
  const count = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the number of columns or `auto`",
  )
  rules.set(count.range[0], "space")
}

/**
 * The rules of a `classDef` or a `style` statement: the name or the id
 * stands after one space, and so does the list of styles, printed as written
 * (docs/block.md, Styles).
 */
function addStyledStatementRules(
  source: Source,
  statement: BlockClassDefStatement | BlockStyleStatement,
  rules: Map<number, GapRule>,
  kept: Atom[],
): void {
  const name =
    statement.type === "BlockStyleStatement" ? statement.id : statement.name
  rules.set(name.range[0], "space")
  const start = findStylesStart(source, statement)
  if (start >= statement.range[1]) return
  rules.set(start, "space")
  kept.push({ start, end: statement.range[1] })
}

/**
 * Where the styles of a statement start, as written: at the first style when
 * it has a text, at the first `,` when the first style is all whitespace and
 * has no node, and at the end of the statement when no style has a text. The
 * whitespace around the `,` of the styles is part of what mermaid.js reads
 * (ast/block.md, BlockStyleStatement).
 */
function findStylesStart(
  source: Source,
  statement: BlockClassDefStatement | BlockStyleStatement,
): number {
  const first = statement.styles.find((style) => style !== null)
  if (first === undefined) return statement.range[1]
  if (statement.styles[0] !== null) return first.range[0]
  const comma = findTokensBetween(
    source,
    statement.range[0],
    first.range[0],
  ).find((token) => token.value === ",")
  return comma?.range[0] ?? first.range[0]
}

/**
 * The rules of a `class` statement: the ids stand after one space, printed
 * as written with the `,` between them, and the class name stands after one
 * space (docs/block.md, Styles).
 */
function addClassRules(
  statement: BlockClassStatement,
  rules: Map<number, GapRule>,
  kept: Atom[],
): void {
  const first = statement.ids[0]
  const last = statement.ids.at(-1)
  if (first === undefined || last === undefined) return
  rules.set(first.range[0], "space")
  if (first !== last) kept.push({ start: first.range[0], end: last.range[1] })
  if (statement.cssClass !== null) {
    rules.set(statement.cssClass.range[0], "space")
  }
}

/** Where the printed text of a unit ends: at its last token. */
export function findBlockPrintedEnd(unit: { readonly range: Range }): number {
  return unit.range[1]
}
