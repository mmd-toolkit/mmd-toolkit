import type {
  Node,
  Token,
  XychartAccDescrStatement,
  XychartAccTitleStatement,
  XychartBand,
  XychartHeader,
  XychartPlotStatement,
  XychartRange,
  XychartStatement,
  XychartXAxisStatement,
  XychartYAxisStatement,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  keptAsWritten,
  layoutDescriptionBlock,
  spansLinesThatCannotJoin,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenEndingBefore,
  findTokensBetween,
  isStructural,
} from "./source.ts"

/**
 * The node types of an XY chart whose text is a value, printed as written:
 * a string and a number, which are shared leaf nodes. They have no child
 * fields; `tests/value-nodes.test.ts` checks that every other such node type
 * is left out on purpose.
 *
 * An XychartLiteral is left out: the text of a title, of a title of an axis
 * or of a plot, and of a category has a token for each of its words, which
 * are printed as tokens, with the whitespace between them formatted
 * (docs/xychart.md, Text units). The text of an accessibility statement is
 * one token, a value like a string; the layout of its statement adds it (see
 * `valueNodesOf`).
 */
export const xychartValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "StringLiteral",
  "NumericLiteral",
])

/** The node types of the text of an `accDescr` block, a value like a string. */
const descriptionBlockTextTypes: ReadonlySet<Node["type"]> = new Set([
  "XychartLiteral",
])

/** A statement of the block of an XY chart: a statement or a later header. */
export type XychartBlockStatement = XychartHeader | XychartStatement

/**
 * The nodes of a statement that are printed as written. The text of an
 * accessibility statement is one token and is printed as written.
 */
function valueNodesOf(statement: XychartBlockStatement): Node[] {
  const values = collectValueNodes(statement, xychartValueNodeTypes)
  if (
    (statement.type === "XychartAccTitleStatement" ||
      statement.type === "XychartAccDescrStatement") &&
    statement.value !== null
  ) {
    values.push(statement.value)
  }
  return values
}

/**
 * The layout of a header (docs/xychart.md, Header and orientation): the
 * keyword and the orientation after it, which stands after one space, also
 * where it was written on a later line after whitespace. A header with a
 * comment or a directive over several lines is kept as written (see
 * `spansLinesThatCannotJoin`).
 */
export function layoutXychartHeader(
  source: Source,
  header: XychartHeader,
): AtomLayout {
  const [start, end] = header.range
  if (spansLinesThatCannotJoin(source, start, end)) {
    return keptAsWritten(start, end)
  }
  const keyword = expectToken(findStructuralToken(source, start), "the header")
  const rules = new Map<number, GapRule>()
  if (header.orientation !== null) {
    const orientation = expectToken(
      findStructuralToken(source, keyword.range[1]),
      "the orientation",
    )
    rules.set(orientation.range[0], "space")
  }
  return {
    atoms: collectAtoms(source, start, end, [], []),
    rules,
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * The layout of a statement, from its start to `end` (the end of its range).
 *
 * - A statement written over several lines stands on one line where the
 *   lexer reads the line break as whitespace (diagrams/xychart.md, Lexical
 *   structure, Line breaks); one with a comment or a directive in it, or a
 *   `;`, is kept as written (see `spansLinesThatCannotJoin`). The lines of an
 *   `accDescr` block are lines of its text, and are kept (docs/xychart.md,
 *   Accessibility statements).
 * - The rules of the gaps are those of docs/xychart.md: Text units, Brackets
 *   and commas, Ranges, Values and labels, and Accessibility statements.
 */
export function layoutXychartStatement(
  source: Source,
  statement: XychartStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  if (statement.type === "XychartAccDescrBlockStatement") {
    return layoutDescriptionBlock(
      source,
      statement,
      end,
      descriptionBlockTextTypes,
    )
  }
  if (spansLinesThatCannotJoin(source, start, end)) {
    return keptAsWritten(start, end)
  }
  return {
    atoms: collectAtoms(source, start, end, valueNodesOf(statement), []),
    rules: statementRules(source, statement),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/** The gap rules of a statement, by the start of the atom after the gap. */
function statementRules(
  source: Source,
  statement: Exclude<
    XychartStatement,
    { type: "XychartAccDescrBlockStatement" }
  >,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  switch (statement.type) {
    case "XychartTitleStatement":
      rules.set(statement.value.range[0], "space")
      break
    case "XychartXAxisStatement":
    case "XychartYAxisStatement":
      addAxisRules(source, statement, rules)
      break
    case "XychartPlotStatement":
      addPlotRules(source, statement, rules)
      break
    case "XychartAccTitleStatement":
    case "XychartAccDescrStatement":
      addAccessibilityRules(source, statement, rules)
      break
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
  return rules
}

/**
 * The rules of an axis statement: its title, its categories, and its range
 * stand after one space, except a range after a title without quotes, which
 * touches the title where it was written touching, since the title and the
 * number are read apart only where they touch or not (docs/xychart.md, Text
 * units and Ranges).
 */
function addAxisRules(
  source: Source,
  statement: XychartXAxisStatement | XychartYAxisStatement,
  rules: Map<number, GapRule>,
): void {
  const { title, data } = statement
  if (title !== null) rules.set(title.range[0], "space")
  if (data === null) return
  if (data.type === "XychartBand") {
    rules.set(data.range[0], "space")
    addBandRules(source, data, rules)
    return
  }
  if (title === null || title.type === "StringLiteral") {
    rules.set(data.range[0], "space")
  }
  addRangeRules(source, data, rules)
}

/**
 * The rules of a range: the arrow stands after one space, and so does the
 * number after it.
 */
function addRangeRules(
  source: Source,
  range: XychartRange,
  rules: Map<number, GapRule>,
): void {
  const arrow = expectToken(
    findStructuralToken(source, range.start.range[1]),
    "the arrow of a range",
  )
  expectValue(arrow, "-->")
  rules.set(arrow.range[0], "space")
  rules.set(range.end.range[0], "space")
}

/**
 * The rules of the categories: the first stands after the `[` and the `]`
 * after the last with no space, the `,` touches what is before it, and a
 * category after a `,` stands after one space.
 */
function addBandRules(
  source: Source,
  band: XychartBand,
  rules: Map<number, GapRule>,
): void {
  const [first] = band.categories
  rules.set(first.range[0], "none")
  for (const category of band.categories.slice(1)) {
    rules.set(category.range[0], "space")
  }
  addCommaRules(source, band.categories, rules)
  addClosingBracketRule(source, band.range[1], rules)
}

/**
 * The rules of a plot: its title and its `[` stand after one space, the
 * values are laid out like the categories, and a label stands after one
 * space.
 */
function addPlotRules(
  source: Source,
  plot: XychartPlotStatement,
  rules: Map<number, GapRule>,
): void {
  const keyword = expectToken(
    findStructuralToken(source, plot.range[0]),
    "`line` or `bar`",
  )
  const { title } = plot
  if (title !== null) rules.set(title.range[0], "space")
  const bracket = expectToken(
    findStructuralToken(source, (title ?? keyword).range[1]),
    "the `[` of a plot",
  )
  expectValue(bracket, "[")
  rules.set(bracket.range[0], "space")
  const [first] = plot.values
  rules.set(first.range[0], "none")
  for (const value of plot.values.slice(1)) {
    rules.set(value.range[0], "space")
  }
  for (const value of plot.values) {
    if (value.label !== null) rules.set(value.label.range[0], "space")
  }
  addCommaRules(source, plot.values, rules)
  addClosingBracketRule(source, plot.range[1], rules)
}

/** The rule of the `,` between two items: it touches what is before it. */
function addCommaRules(
  source: Source,
  items: readonly Node[],
  rules: Map<number, GapRule>,
): void {
  const first = items.at(0)
  const last = items.at(-1)
  if (first === undefined || last === undefined) return
  for (const token of findTokensBetween(
    source,
    first.range[1],
    last.range[0],
  )) {
    if (isStructural(source, token) && isComma(token)) {
      rules.set(token.range[0], "none")
    }
  }
}

/** Whether a token is a `,` punctuator, and no text of a category or a value. */
function isComma(token: Token): boolean {
  return token.type === "Punctuator" && token.value === ","
}

/**
 * The rule of the `]` that ends a statement or a list of categories: it
 * touches what is before it.
 */
function addClosingBracketRule(
  source: Source,
  end: number,
  rules: Map<number, GapRule>,
): void {
  const closing = expectToken(
    findTokenEndingBefore(source, end),
    "the `]` of a list",
  )
  expectValue(closing, "]")
  rules.set(closing.range[0], "none")
}

/**
 * The rules of an `accTitle` or `accDescr` line: the `:` touches the keyword
 * and the text stands after one space. A line without text ends with the `:`.
 */
function addAccessibilityRules(
  source: Source,
  statement: XychartAccTitleStatement | XychartAccDescrStatement,
  rules: Map<number, GapRule>,
): void {
  const keyword = expectToken(
    findStructuralToken(source, statement.range[0]),
    "`accTitle` or `accDescr`",
  )
  const colon = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the `:` after `accTitle` or `accDescr`",
  )
  expectValue(colon, ":")
  rules.set(colon.range[0], "none")
  if (statement.value !== null) rules.set(statement.value.range[0], "space")
}

/** Where the printed text of a statement ends: at its last token. */
export function findXychartPrintedEnd(
  statement: XychartBlockStatement,
): number {
  return statement.range[1]
}
