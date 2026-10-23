import { checkChildTypes, checkListsWithAnEntry } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  CHILD,
  between,
  checkLayout,
  checkOwnKinds,
  checkRangeIsHull,
  checkTokenKinds,
  childOf,
  entriesOf,
  isBlank,
  offsetsOf,
  ownOf,
  presentChildren,
  readingOf,
  restOfLineIsBlank,
  textOf,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

// ast/xychart.md and diagrams/xychart.md: what the xychart documents state
// about the tree beyond the conditions of every tree (ast.md): the fields of
// the nodes, and the characters that the texts and the numbers hold.
// parser/docs/tokens/xychart.md and parser/docs/positions/xychart.md: the
// tokens that a node writes itself, their kinds, the kinds of the tokens of a
// value, and the ranges of the nodes.

/** ast/xychart.md: the node types that a text holds (a title, a category, a label). */
const TEXT_TYPES: readonly string[] = ["XychartLiteral", "StringLiteral"]

/**
 * ast/xychart.md: the node types that a field of a node type holds, as the
 * Type column of its table gives them; a field that holds a value is not in
 * it. `tests/check-tree-xychart.test.ts` requires the table to be that column.
 */
export const XYCHART_CHILD_TYPES: FieldTable<readonly string[]> = {
  XychartDiagram: {
    headers: ["XychartHeader"],
    body: [
      "XychartTitleStatement",
      "XychartXAxisStatement",
      "XychartYAxisStatement",
      "XychartPlotStatement",
      "XychartAccTitleStatement",
      "XychartAccDescrStatement",
      "XychartAccDescrBlockStatement",
    ],
  },
  XychartTitleStatement: { value: TEXT_TYPES },
  XychartXAxisStatement: {
    title: TEXT_TYPES,
    data: ["XychartBand", "XychartRange"],
  },
  XychartYAxisStatement: { title: TEXT_TYPES, data: ["XychartRange"] },
  XychartBand: { categories: TEXT_TYPES },
  XychartRange: { start: ["NumericLiteral"], end: ["NumericLiteral"] },
  XychartPlotStatement: { title: TEXT_TYPES, values: ["XychartValue"] },
  XychartValue: { value: ["NumericLiteral"], label: ["StringLiteral"] },
  XychartAccTitleStatement: { value: ["XychartLiteral"] },
  XychartAccDescrStatement: { value: ["XychartLiteral"] },
  XychartAccDescrBlockStatement: { value: ["XychartLiteral"] },
}

/** ast/xychart.md: the lists of a node type that are never empty. */
const LISTS_WITH_AN_ENTRY: Readonly<Record<string, readonly string[]>> = {
  XychartDiagram: ["headers"],
  XychartBand: ["categories"],
  XychartPlotStatement: ["values"],
}

/** ast/xychart.md, XychartHeader: the orientation words, written in any case. */
export const XYCHART_ORIENTATIONS: readonly string[] = [
  "vertical",
  "horizontal",
]

/** ast/xychart.md, XychartPlotStatement: the kinds of a plot, as the keyword in lower case. */
export const XYCHART_PLOT_KINDS: readonly string[] = ["line", "bar"]

/**
 * parser/docs/tokens/xychart.md, Tokens: the texts of the `Punctuator` tokens
 * of the diagram; the other tokens that a node writes itself are `Keyword`
 * tokens.
 */
export const XYCHART_PUNCTUATORS: readonly string[] = [
  "[",
  "]",
  ",",
  ";",
  ":",
  "{",
  "}",
  "-->",
]

/** diagrams/xychart.md, Detection: the two headers, in lower case. */
const HEADERS: readonly string[] = ["xychart", "xychart-beta"]

/** The characters of a word of a text without quotes (diagrams/xychart.md, The statement context, rule 6). */
const WORD_CHARACTERS = /^[\w#&*+\-.=]+$/u

/** A number (diagrams/xychart.md, The axis context): a sign, digits with a fraction, or a fraction alone. */
const NUMBER = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/u

const QUOTE = '"'
const LINE_FEED = "\n"
const CARRIAGE_RETURN = "\r"
const CLOSING_BRACE = "}"

/** ast/xychart.md: the statements whose literal is an accessibility text. */
export const XYCHART_ACCESSIBILITY_STATEMENTS: readonly string[] = [
  "XychartAccTitleStatement",
  "XychartAccDescrStatement",
  "XychartAccDescrBlockStatement",
]

/** The statements whose title is the title of an axis. */
const AXIS_STATEMENTS: readonly string[] = [
  "XychartXAxisStatement",
  "XychartYAxisStatement",
]

/** The kinds of place where a text lies, which decide the characters it holds. */
interface Places {
  /** The literals of the accessibility statements, by the statement that holds them. */
  readonly accessibility: ReadonlyMap<CheckedNode, CheckedNode>
  /** The literals that are the title of an axis. */
  readonly axisTitles: ReadonlySet<CheckedNode>
}

/** Where the texts of the statements of the tree lie. */
function placesOf(root: CheckedRoot): Places {
  const accessibility = new Map<CheckedNode, CheckedNode>()
  const axisTitles = new Set<CheckedNode>()
  walkNodes(root, (node) => {
    if (XYCHART_ACCESSIBILITY_STATEMENTS.includes(node.type)) {
      const value = childOf(node, "value")
      if (value !== null) accessibility.set(value, node)
    }
    if (AXIS_STATEMENTS.includes(node.type)) {
      const title = childOf(node, "title")
      if (title !== null) axisTitles.add(title)
    }
  })
  return { accessibility, axisTitles }
}

/**
 * ast/xychart.md, XychartDiagram: the headers come before the first
 * statement; a header after a statement makes the input rejected.
 */
function checkDiagram(reading: Reading, node: CheckedNode): void {
  const first = entriesOf(node, "body").find((statement) => statement !== null)
  if (first === undefined || first === null) return
  for (const header of entriesOf(node, "headers")) {
    if (header === null) continue
    reading.problems.expect(
      header.range[1] <= first.range[0],
      label(header),
      `the header is not before the first statement, ${label(first)}`,
    )
  }
}

/** ast/xychart.md, XychartHeader: the orientation is none, or a word of the table in any case. */
function checkHeader(reading: Reading, node: CheckedNode): void {
  const { orientation } = node
  if (orientation === null) return
  reading.problems.expect(
    typeof orientation === "string" &&
      XYCHART_ORIENTATIONS.includes(orientation.toLowerCase()),
    label(node),
    `the orientation is ${JSON.stringify(orientation)}, none of ${XYCHART_ORIENTATIONS.join(", ")} in any case`,
  )
}

/** Whether `node` is a string with nothing between its quotes. */
function isEmptyString(node: CheckedNode | null): boolean {
  return node?.type === "StringLiteral" && textOf(node) === ""
}

/**
 * ast/xychart.md, XychartTitleStatement, XychartXAxisStatement, and
 * XychartYAxisStatement: a title is never empty; an axis statement has a title
 * or its data, and a title in quotes may be empty only before data.
 */
function checkTitleStatement(reading: Reading, node: CheckedNode): void {
  reading.problems.expect(
    !isEmptyString(childOf(node, "value")),
    label(node),
    "the title is empty",
  )
}

/** ast/xychart.md, XychartXAxisStatement and XychartYAxisStatement. */
function checkAxisStatement(reading: Reading, node: CheckedNode): void {
  const title = childOf(node, "title")
  const data = childOf(node, "data")
  reading.problems.expect(
    title !== null || data !== null,
    label(node),
    "the statement has neither a title nor data",
  )
  reading.problems.expect(
    !isEmptyString(title) || data !== null,
    label(node),
    "the title is an empty string that no data follows",
  )
}

/** ast/xychart.md, XychartBand: no category is empty. */
function checkBand(reading: Reading, node: CheckedNode): void {
  for (const category of entriesOf(node, "categories")) {
    reading.problems.expect(
      !isEmptyString(category),
      label(node),
      "a category is an empty string",
    )
  }
}

/** ast/xychart.md, XychartPlotStatement: the kind is the keyword in lower case. */
function checkPlot(reading: Reading, node: CheckedNode): void {
  const { kind } = node
  reading.problems.expect(
    typeof kind === "string" && XYCHART_PLOT_KINDS.includes(kind),
    label(node),
    `the kind is ${JSON.stringify(kind)}, none of ${XYCHART_PLOT_KINDS.join(", ")}`,
  )
}

/**
 * Why the accessibility statement `node` runs to the end of the text, or null
 * where it does not (diagrams/xychart.md, Accessibility values): a block that
 * is not closed runs to the end of the text, and the text of `accTitle:` and
 * `accDescr:` is the first line after the keyword that has one, so a statement
 * without a text has no line after it.
 */
function whyItRunsToTheEnd(node: CheckedNode): string | null {
  if (node.type === "XychartAccDescrBlockStatement") {
    return node.closed === false ? "the block is not closed" : null
  }
  return childOf(node, "value") === null ? "the statement has no text" : null
}

/**
 * ast/xychart.md, XychartAccTitleStatement, XychartAccDescrStatement, and
 * XychartAccDescrBlockStatement: a statement that runs to the end of the text
 * is the last statement of the body.
 */
function checkStatementEndsTheText(reading: Reading, node: CheckedNode): void {
  const reason = whyItRunsToTheEnd(node)
  if (reason === null) return
  const body = entriesOf(reading.root.body, "body")
  reading.problems.expect(
    body.at(-1) === node,
    label(node),
    `${reason} and a statement follows it`,
  )
}

/**
 * diagrams/xychart.md, The statement context, rule 6, and The axis context: a
 * text without quotes is made of words of the characters of ASCII that a word
 * holds, and is never empty; the title of an axis holds no digit, which starts
 * a number there.
 */
function checkWords(
  reading: Reading,
  node: CheckedNode,
  isAxisTitle: boolean,
): void {
  const value = textOf(node)
  const where = label(node)
  reading.problems.expect(
    WORD_CHARACTERS.test(value),
    where,
    `the text ${JSON.stringify(value)} is empty or holds a character that a word does not hold`,
  )
  reading.problems.expect(
    !isAxisTitle || !/\d/u.test(value),
    where,
    `the title ${JSON.stringify(value)} of an axis holds a digit, which starts a number`,
  )
}

/**
 * diagrams/xychart.md, Accessibility values: the text of an accessibility
 * statement is never empty (without text, the value is null); the text of a
 * line holds no line terminator, and the text of a block no `}`.
 */
function checkAccessibilityText(
  reading: Reading,
  node: CheckedNode,
  statement: CheckedNode,
): void {
  const value = textOf(node)
  const where = label(node)
  reading.problems.expect(value !== "", where, "the text is empty")
  if (statement.type === "XychartAccDescrBlockStatement") {
    reading.problems.expect(
      !value.includes(CLOSING_BRACE),
      where,
      `the text ${JSON.stringify(value)} of a block holds a \`}\``,
    )
  } else {
    reading.problems.expect(
      !value.includes(LINE_FEED) && !value.includes(CARRIAGE_RETURN),
      where,
      `the text ${JSON.stringify(value)} of a line holds a line terminator`,
    )
  }
}

/**
 * diagrams/xychart.md, The axis context: a number has an optional sign, digits
 * with an optional fraction, or a fraction alone; no exponent.
 */
function checkNumber(reading: Reading, node: CheckedNode): void {
  const written = reading.written.of(node.range)
  reading.problems.expect(
    NUMBER.test(written),
    label(node),
    `the number ${JSON.stringify(written)} is none that the lexer reads`,
  )
}

/**
 * diagrams/xychart.md, Strings: a string is closed, and holds no `"` but the
 * `"` of an HTML attribute quote, which is read as `'` (common.md, HTML
 * attribute quotes): a `"` ends it.
 */
function checkString(reading: Reading, node: CheckedNode): void {
  const value = textOf(node)
  const where = label(node)
  reading.problems.expect(
    node.closed === true,
    where,
    "the string is not closed",
  )
  reading.problems.expect(
    !reading.attributeValueOf(node).includes(QUOTE),
    where,
    `the string ${JSON.stringify(value)} holds a \`"\`, which would close it`,
  )
}

/** The layout of a list of `count` items between brackets: `[`, an item, `,`, an item, `]`. */
function listLayout(count: number): string[] {
  const items = Array.from({ length: count }, () => CHILD)
  return [
    "[",
    ...items.flatMap((item, index) => (index === 0 ? [item] : [",", item])),
    "]",
  ]
}

/**
 * parser/docs/tokens/xychart.md and positions/xychart.md: the diagram writes
 * itself the `;` that end a line, as `Punctuator` tokens; its range runs from
 * the first header keyword to the last token.
 */
function checkDiagramTokens(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, XYCHART_PUNCTUATORS)
  reading.problems.expect(
    own.tokens.every((token) => token.value === ";"),
    label(node),
    `the tokens that the node writes itself are ${JSON.stringify(own.text)}, not only \`;\``,
  )
  checkRangeIsHull(reading, node, own)
}

/**
 * parser/docs/tokens/xychart.md and positions/xychart.md: the header writes
 * itself the header keyword and the orientation, if there is one, as `Keyword`
 * tokens; the orientation is the text of the second as written.
 */
function checkHeaderTokens(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, XYCHART_PUNCTUATORS)
  const [keyword, orientation] = own.tokens
  const word = keyword?.value.toLowerCase() ?? ""
  reading.problems.expect(
    HEADERS.includes(word),
    label(node),
    `the header keyword ${JSON.stringify(word)} is none of ${HEADERS.join(", ")}`,
  )
  // The layout holds the orientation in lower case, as the keywords are; the
  // orientation is the token as written.
  checkLayout(reading, node, own, [
    word,
    ...(typeof node.orientation === "string"
      ? [node.orientation.toLowerCase()]
      : []),
  ])
  reading.problems.expectEqual(
    node.orientation,
    orientation?.value ?? null,
    label(node),
    "the orientation of the header is not the token after the header keyword, or null when there is none",
  )
  checkRangeIsHull(reading, node, own)
}

/** parser/docs/tokens/xychart.md and positions/xychart.md: a title statement writes itself its keyword. */
function checkTitleTokens(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, XYCHART_PUNCTUATORS)
  checkLayout(reading, node, own, ["title", CHILD])
  checkRangeIsHull(reading, node, own)
}

/** parser/docs/tokens/xychart.md and positions/xychart.md: an axis statement writes itself its keyword, and its title comes before its data. */
function checkAxisTokens(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, XYCHART_PUNCTUATORS)
  const keyword = node.type === "XychartXAxisStatement" ? "x-axis" : "y-axis"
  checkLayout(reading, node, own, [
    keyword,
    ...presentChildren(node, "title", "data"),
  ])
  const title = childOf(node, "title")
  const data = childOf(node, "data")
  if (title !== null && data !== null) {
    reading.problems.expect(
      title.range[1] <= data.range[0],
      label(node),
      "the title does not come before the data",
    )
  }
  checkRangeIsHull(reading, node, own)
}

/** parser/docs/tokens/xychart.md and positions/xychart.md: a band writes itself its brackets and the commas between the categories. */
function checkBandTokens(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, XYCHART_PUNCTUATORS)
  checkLayout(
    reading,
    node,
    own,
    listLayout(entriesOf(node, "categories").length),
  )
  checkRangeIsHull(reading, node, own)
}

/** parser/docs/tokens/xychart.md and positions/xychart.md: a range writes itself the arrow between its numbers. */
function checkRangeTokens(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, XYCHART_PUNCTUATORS)
  checkLayout(reading, node, own, [CHILD, "-->", CHILD])
  checkRangeIsHull(reading, node, own)
}

/**
 * parser/docs/tokens/xychart.md and positions/xychart.md: a plot writes itself
 * its keyword, the brackets and the commas between the values; the kind is the
 * keyword in lower case.
 */
function checkPlotTokens(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, XYCHART_PUNCTUATORS)
  checkLayout(reading, node, own, [
    textOf(node, "kind"),
    ...presentChildren(node, "title"),
    ...listLayout(entriesOf(node, "values").length),
  ])
  checkRangeIsHull(reading, node, own)
}

/** positions/xychart.md, XychartBand, XychartRange, and XychartValue: a value runs from its number to its label, and writes no token itself. */
function checkValueTokens(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkLayout(reading, node, own, presentChildren(node, "value", "label"))
  checkRangeIsHull(reading, node, own)
}

/**
 * parser/docs/tokens/xychart.md and positions/xychart.md: an `accTitle:` or
 * `accDescr:` statement writes itself its keyword and the `:`; its text follows
 * the `:` after whitespace only, line feeds included, and runs to the end of
 * its line.
 */
function checkAccessibilityLineTokens(
  reading: Reading,
  node: CheckedNode,
  keyword: string,
): void {
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, XYCHART_PUNCTUATORS)
  checkLayout(reading, node, own, [
    keyword,
    ":",
    ...presentChildren(node, "value"),
  ])
  const text = childOf(node, "value")
  if (text !== null) {
    reading.problems.expect(
      restOfLineIsBlank(reading, text.range[1]),
      label(node),
      "the value ends before the end of its line and not only whitespace follows it",
    )
  }
  checkRangeIsHull(reading, node, own)
}

/**
 * parser/docs/tokens/xychart.md and positions/xychart.md: a description block
 * writes itself its keyword, the `{`, and the `}` when it is closed, which
 * `closed` says; a block that is not closed runs to the end of the text.
 */
function checkBlockTokens(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, XYCHART_PUNCTUATORS)
  const closes = offsetsOf(own, "}").length > 0
  checkLayout(reading, node, own, [
    "accdescr",
    "{",
    ...presentChildren(node, "value"),
    ...(closes ? ["}"] : []),
  ])
  reading.problems.expectEqual(
    node.closed,
    closes,
    label(node),
    "closed, which is whether it ends with }",
  )
  const text = childOf(node, "value")
  if (!closes) {
    const rest = between(
      reading,
      (text ?? own.tokens.at(-1))?.range[1] ?? 0,
      reading.text.length,
    )
    reading.problems.expect(
      isBlank(rest),
      label(node),
      `the block is not closed and ${JSON.stringify(rest)} follows its text`,
    )
  }
  checkRangeIsHull(reading, node, own)
}

/**
 * parser/docs/tokens/xychart.md, Tokens: the tokens of a text without quotes
 * are `RawText` tokens, and the words that follow one another with nothing
 * between them are one token, so two tokens have whitespace or a cut between
 * them; the tokens of the text of an accessibility statement are `RawText`.
 */
function checkLiteralTokens(
  reading: Reading,
  node: CheckedNode,
  isWords: boolean,
): void {
  checkTokenKinds(reading, node, ["RawText"], "an XychartLiteral")
  if (!isWords) return
  const tokens = reading.root.tokens.filter(
    (token) =>
      token.type === "RawText" &&
      node.range[0] <= token.range[0] &&
      token.range[1] <= node.range[1],
  )
  for (const [index, token] of tokens.entries()) {
    const next = tokens[index + 1]
    if (next === undefined) continue
    reading.problems.expect(
      token.range[1] < next.range[0],
      label(node),
      `${label(token)} and ${label(next)} have nothing between them, so they are one token`,
    )
  }
}

/**
 * Checks what the xychart documents state about an xychart tree beyond the
 * conditions of every tree (ast.md): the tokens of values lie in value nodes,
 * the child nodes are of the types that the tables give, the lists that are
 * never empty have an entry, the headers come before the statements, a
 * statement has the fields it needs, and the texts and the numbers hold the
 * characters that the lexer reads in them.
 */
export function checkXychartTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  checkTokensInValueNodes(root, problems)
  const reading = readingOf(text, root, problems)
  const places = placesOf(root)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, XYCHART_CHILD_TYPES)
    checkListsWithAnEntry(reading, node, LISTS_WITH_AN_ENTRY)
    switch (node.type) {
      case "XychartDiagram":
        checkDiagram(reading, node)
        checkDiagramTokens(reading, node)
        break
      case "XychartHeader":
        checkHeader(reading, node)
        checkHeaderTokens(reading, node)
        break
      case "XychartTitleStatement":
        checkTitleStatement(reading, node)
        checkTitleTokens(reading, node)
        break
      case "XychartXAxisStatement":
      case "XychartYAxisStatement":
        checkAxisStatement(reading, node)
        checkAxisTokens(reading, node)
        break
      case "XychartBand":
        checkBand(reading, node)
        checkBandTokens(reading, node)
        break
      case "XychartRange":
        checkRangeTokens(reading, node)
        break
      case "XychartPlotStatement":
        checkPlot(reading, node)
        checkPlotTokens(reading, node)
        break
      case "XychartValue":
        checkValueTokens(reading, node)
        break
      case "XychartAccTitleStatement":
        checkStatementEndsTheText(reading, node)
        checkAccessibilityLineTokens(reading, node, "acctitle")
        break
      case "XychartAccDescrStatement":
        checkStatementEndsTheText(reading, node)
        checkAccessibilityLineTokens(reading, node, "accdescr")
        break
      case "XychartAccDescrBlockStatement":
        checkStatementEndsTheText(reading, node)
        checkBlockTokens(reading, node)
        break
      case "XychartLiteral": {
        const statement = places.accessibility.get(node)
        if (statement === undefined) {
          checkWords(reading, node, places.axisTitles.has(node))
        } else {
          checkAccessibilityText(reading, node, statement)
        }
        checkLiteralTokens(reading, node, statement === undefined)
        break
      }
      case "NumericLiteral":
        checkNumber(reading, node)
        checkTokenKinds(reading, node, ["Numeric"], "a NumericLiteral")
        break
      case "StringLiteral":
        checkString(reading, node)
        break
      default:
        break
    }
  })
}
