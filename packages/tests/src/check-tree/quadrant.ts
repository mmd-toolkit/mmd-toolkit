import type { TreeRange } from "../db-from-tree/tree.ts"
import { trimmed } from "../db-from-tree/values.ts"
import { checkChildTypes, checkListsWithAnEntry } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  CHILD,
  between,
  checkLayout,
  checkRangeIsHull,
  childOf,
  entriesOf,
  ownOf,
  presentChildren,
  readingOf,
  textOf,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes, nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot, CheckedToken } from "./types.ts"
import { walkNodes } from "./walk.ts"

// ast/quadrant.md and diagrams/quadrant.md: what the quadrant chart documents
// state about the tree beyond the conditions of every tree (ast.md): the
// fields of the nodes, and the characters that the texts, the coordinates, the
// styles, and the names hold.

/** ast/quadrant.md: the node types that a statement of the body is. */
const STATEMENT_TYPES: readonly string[] = [
  "QuadrantTitleStatement",
  "QuadrantAccTitleStatement",
  "QuadrantAccDescrStatement",
  "QuadrantAccDescrBlockStatement",
  "QuadrantAxisStatement",
  "QuadrantQuadrantStatement",
  "QuadrantPointStatement",
  "QuadrantClassDefStatement",
]

/**
 * ast/quadrant.md: the node types that a field of a node type holds, as the
 * Type column of its table gives them; a field that holds a value is not in
 * it. `tests/check-tree-quadrant.test.ts` requires the table to be that column.
 */
export const QUADRANT_CHILD_TYPES: FieldTable<readonly string[]> = {
  QuadrantDiagram: { body: STATEMENT_TYPES },
  QuadrantTitleStatement: { value: ["QuadrantLiteral"] },
  QuadrantAccTitleStatement: { value: ["QuadrantLiteral"] },
  QuadrantAccDescrStatement: { value: ["QuadrantLiteral"] },
  QuadrantAccDescrBlockStatement: { value: ["QuadrantLiteral"] },
  QuadrantAxisStatement: {
    start: ["QuadrantLabel"],
    end: ["QuadrantLabel"],
  },
  QuadrantQuadrantStatement: { text: ["QuadrantLabel"] },
  QuadrantPointStatement: {
    name: ["QuadrantLabel"],
    className: ["Identifier"],
    x: ["QuadrantLiteral"],
    y: ["QuadrantLiteral"],
    styles: ["QuadrantLiteral"],
  },
  QuadrantClassDefStatement: {
    name: ["QuadrantIdentifier"],
    styles: ["QuadrantLiteral"],
  },
}

/** ast/quadrant.md: the lists of a node type that are never empty. */
const LISTS_WITH_AN_ENTRY: Readonly<Record<string, readonly string[]>> = {
  QuadrantClassDefStatement: ["styles"],
}

/** ast/quadrant.md, QuadrantLabel: the kinds of a text, by how it starts. */
export const QUADRANT_LABEL_KINDS: readonly string[] = [
  "text",
  "string",
  "markdown",
]

/** ast/quadrant.md, QuadrantAxisStatement: the axes. */
export const QUADRANT_AXES: readonly string[] = ["x", "y"]

/** ast/quadrant.md, QuadrantQuadrantStatement: the numbers of the quadrants. */
const QUADRANT_NUMBERS: readonly number[] = [1, 2, 3, 4]

/** diagrams/quadrant.md, Rejections outside the grammar: the names of the styles that the Db takes. */
export const QUADRANT_STYLE_NAMES: readonly string[] = [
  "radius",
  "color",
  "stroke-color",
  "stroke-width",
]

/**
 * parser/docs/tokens/quadrant.md, Tokens: the texts of the `Punctuator`
 * tokens of the diagram; the arrow, which is two dashes or more and `>`, is
 * listed as `-->`. The other tokens that a node writes itself are `Keyword`
 * tokens.
 */
export const QUADRANT_PUNCTUATORS: readonly string[] = [
  "-->",
  ":::",
  ":",
  "[",
  ",",
  "]",
  "{",
  "}",
  ";",
]

const ARROW_TOKEN = /^-{2,}>$/u

/** Whether `value` is the text of an arrow of any length: two dashes or more and `>` (diagrams/quadrant.md, The statement context, rule 3). */
export function isArrowText(value: string): boolean {
  return ARROW_TOKEN.test(value)
}

const QUOTE = '"'
const MARKDOWN_OPENING = '"`'
const MARKDOWN_CLOSING = '`"'

/** diagrams/quadrant.md, The statement context, rule 8: the punctuation characters of a word, besides letters, digits, and characters outside ASCII. */
const WORD_PUNCTUATION = "!$%&'*+,./=?\\_#`"

/** diagrams/quadrant.md, The statement context: the whitespace between units, other than a line feed. */
const SPACES = " \t\v\f"

const ARROW = /^ *-{2,}> *$/u

/** The colour of a style: a hex code of three or six digits, with or without `#` (diagrams/quadrant.md, Rejections outside the grammar). */
const HEX_CODE = /^#?(?:[\da-f]{6}|[\da-f]{3})$/iu

/** The statements whose literal is the text of an accessibility statement. */
const ACCESSIBILITY_STATEMENTS: readonly string[] = [
  "QuadrantAccTitleStatement",
  "QuadrantAccDescrStatement",
  "QuadrantAccDescrBlockStatement",
]

/**
 * The statements whose literal is the rest of a line or the text of a block,
 * without the whitespace of Notation at its ends (ast/quadrant.md,
 * QuadrantLiteral); the other literals, the coordinates and the styles, are
 * written text.
 */
export const QUADRANT_TRIMMED_TEXT_STATEMENTS: readonly string[] = [
  "QuadrantTitleStatement",
  ...ACCESSIBILITY_STATEMENTS,
]

/** Whether `character` is a letter of ASCII, a digit, or outside ASCII: a character of a word. */
function isWordCharacter(character: string): boolean {
  const code = character.charCodeAt(0)
  return (
    code >= 0x80 ||
    (code >= 0x30 && code <= 0x39) ||
    (code >= 0x41 && code <= 0x5a) ||
    (code >= 0x61 && code <= 0x7a)
  )
}

/** Whether `character` is one that a text without quotes holds, besides `-` and the spaces: a character of a word, or its punctuation. */
function isTextCharacter(character: string): boolean {
  return isWordCharacter(character) || WORD_PUNCTUATION.includes(character)
}

/** Whether every character of `text` is a character of the tail of a text (words, `-`, spaces). */
function isTextRest(text: string): boolean {
  return [...text].every(
    (character) =>
      isTextCharacter(character) ||
      character === "-" ||
      SPACES.includes(character),
  )
}

/**
 * The converted form of the text of `range` (common.md, Reading a source): each
 * entity is its placeholder, a character outside ASCII, so it is a character of
 * a text and of the name of a class, and each attribute quote is a `'`. The
 * characters that a lexer reads are those of this form.
 */
function convertedTextOf(
  reading: Reading,
  range: TreeRange,
  leftOut: readonly TreeRange[] = [],
): string {
  return reading.converted.of(range, leftOut)
}

/** Whether `text` holds a line terminator. */
function hasLineTerminator(text: string): boolean {
  return text.includes("\n") || text.includes("\r")
}

/**
 * diagrams/quadrant.md, Texts and Strings: the value of a label made from its
 * written text, or null where the written text is none of its kind: a text
 * without quotes is its written text, a string is what lies between the
 * quotes followed by the rest, and a markdown string is the same without the
 * backquotes.
 */
function labelValueOf(
  kind: string,
  written: string,
  read = written,
): {
  readonly value: string
  readonly content: string
  readonly rest: string
} | null {
  if (kind === "text") return { value: written, content: written, rest: "" }
  const opening = kind === "string" ? QUOTE : MARKDOWN_OPENING
  const closing = kind === "string" ? QUOTE : MARKDOWN_CLOSING
  if (!read.startsWith(opening)) return null
  const close = read.indexOf(closing, opening.length)
  if (close === -1) return null
  const content = written.slice(opening.length, close)
  const rest = written.slice(close + closing.length)
  return { value: content + rest, content, rest }
}

/**
 * ast/quadrant.md, QuadrantLabel and QuadrantAxisStatement, and
 * diagrams/quadrant.md, Texts, Strings, and Empty strings: the kind is one of
 * the three; the value is made from the written text as the kinds say; a text
 * without quotes starts with a word and holds the characters of a word, `-`,
 * and spaces; a string is closed, and not empty; what follows a string is the
 * rest of a text, and holds no string.
 */
function checkLabel(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  const { kind } = node
  if (typeof kind !== "string" || !QUADRANT_LABEL_KINDS.includes(kind)) {
    reading.problems.report(
      where,
      `the kind is ${JSON.stringify(kind)}, none of ${QUADRANT_LABEL_KINDS.join(", ")}`,
    )
    return
  }
  const written = reading.written.of(node.range)
  const parts = labelValueOf(kind, written, reading.attributeTextOf(node.range))
  if (parts === null) {
    reading.problems.report(
      where,
      `the written text ${JSON.stringify(written)} is not that of a label of the kind ${kind}`,
    )
    return
  }
  reading.problems.expectEqual(
    node.value,
    parts.value,
    where,
    "the value is not what the kind of the label makes of its written text",
  )
  if (kind === "text") {
    checkWords(reading, node, convertedTextOf(reading, node.range))
    return
  }
  reading.problems.expect(
    parts.content !== "",
    where,
    `the ${kind} string is empty`,
  )
  const read = labelValueOf(kind, convertedTextOf(reading, node.range))
  reading.problems.expect(
    read !== null && isTextRest(read.rest),
    where,
    `the written text ${JSON.stringify(parts.rest)} after the ${kind} string holds a character that the rest of a text does not hold`,
  )
}

/** diagrams/quadrant.md, The statement context and Texts: a text without quotes starts with a word, and holds words, `-`, and spaces. */
function checkWords(
  reading: Reading,
  node: CheckedNode,
  written: string,
): void {
  const where = label(node)
  const first = written.charAt(0)
  reading.problems.expect(
    written !== "" && isTextCharacter(first),
    where,
    `the text ${JSON.stringify(written)} is empty or starts with a character that does not start a word`,
  )
  reading.problems.expect(
    isTextRest(written),
    where,
    `the text ${JSON.stringify(written)} holds a character that a text without quotes does not hold`,
  )
}

/**
 * ast/quadrant.md, QuadrantTitleStatement: the value is none, or a text that
 * is not empty and holds no line terminator.
 */
function checkTitle(reading: Reading, node: CheckedNode): void {
  const value = childOf(node, "value")
  if (value === null) return
  const text = textOf(value)
  reading.problems.expect(
    text !== "" && trimmed(text) === text && !hasLineTerminator(text),
    label(node),
    `the title ${JSON.stringify(text)} is empty, has whitespace at its ends, or holds a line terminator`,
  )
}

/**
 * ast/quadrant.md, QuadrantAccTitleStatement, QuadrantAccDescrStatement, and
 * QuadrantAccDescrBlockStatement: the text of a line is never empty and holds
 * no line terminator; the text of a block holds no `}`, and is none where only
 * whitespace lies in the block.
 */
function checkAccessibilityText(
  reading: Reading,
  node: CheckedNode,
  statement: CheckedNode,
): void {
  const value = textOf(node)
  const where = label(node)
  reading.problems.expect(
    value !== "" && trimmed(value) === value,
    where,
    "the text is empty or has whitespace at its ends",
  )
  if (statement.type === "QuadrantAccDescrBlockStatement") {
    reading.problems.expect(
      !value.includes("}"),
      where,
      `the text ${JSON.stringify(value)} of a block holds a \`}\``,
    )
  } else {
    reading.problems.expect(
      !hasLineTerminator(value),
      where,
      `the text ${JSON.stringify(value)} of a line holds a line terminator`,
    )
  }
}

/**
 * ast/quadrant.md, QuadrantAxisStatement: the axis is the letter of the
 * keyword in lower case; `end` is none or the statement has the arrow, which is
 * written between the texts, or after the first when there is no second.
 */
function checkAxis(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  const { axis, arrow } = node
  reading.problems.expect(
    typeof axis === "string" && QUADRANT_AXES.includes(axis),
    where,
    `the axis is ${JSON.stringify(axis)}, none of ${QUADRANT_AXES.join(", ")}`,
  )
  const keyword = reading.text
    .slice(node.range[0], node.range[0] + "x-axis".length)
    .toLowerCase()
  reading.problems.expectEqual(
    keyword,
    `${String(axis)}-axis`,
    where,
    "the keyword the statement starts with",
  )
  const start = childOf(node, "start")
  const end = childOf(node, "end")
  reading.problems.expect(
    end === null || arrow === true,
    where,
    "the statement has a second text and no arrow",
  )
  if (start === null) return
  const gap = between(reading, start.range[1], end?.range[0] ?? node.range[1])
  if (arrow === true) {
    reading.problems.expect(
      ARROW.test(gap),
      where,
      `the written text ${JSON.stringify(gap)} after the first text is not the arrow`,
    )
  } else {
    reading.problems.expect(
      gap === "",
      where,
      `the statement has no arrow and ${JSON.stringify(gap)} follows its text`,
    )
  }
}

/** ast/quadrant.md, QuadrantQuadrantStatement: the number is the digit of the keyword, from 1 to 4. */
function checkQuadrant(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  const { quadrant } = node
  reading.problems.expect(
    typeof quadrant === "number" && QUADRANT_NUMBERS.includes(quadrant),
    where,
    `the quadrant is ${JSON.stringify(quadrant)}, none of ${QUADRANT_NUMBERS.join(", ")}`,
  )
  reading.problems.expectEqual(
    reading.text
      .slice(node.range[0], node.range[0] + "quadrant-1".length)
      .toLowerCase(),
    `quadrant-${String(quadrant)}`,
    where,
    "the keyword the statement starts with",
  )
}

/**
 * diagrams/quadrant.md, The point context: a coordinate is `1`, or `0`
 * optionally followed by one character other than a line feed, U+2028, and
 * U+2029, and one or more digits.
 */
export function isCoordinate(written: string): boolean {
  if (written === "1" || written === "0") return true
  if (!written.startsWith("0") || written.length < 3) return false
  const separator = written.charCodeAt(1)
  if (
    separator === 0x0a ||
    separator === 0x0d ||
    separator === 0x2028 ||
    separator === 0x2029
  ) {
    return false
  }
  return [...written.slice(2)].every(
    (character) => character >= "0" && character <= "9",
  )
}

/** diagrams/quadrant.md, The class name context: one or more letters of ASCII, digits, and `_`. */
const CLASS_NAME = /^\w+$/u

/**
 * diagrams/quadrant.md, The point context and Classes: a point has a class
 * name of the characters of a word, and two coordinates, and its styles hold
 * the characters of a style.
 */
function checkPoint(reading: Reading, node: CheckedNode): void {
  const className = childOf(node, "className")
  if (className !== null) {
    reading.problems.expect(
      CLASS_NAME.test(textOf(className, "name")),
      label(className),
      `the class name ${JSON.stringify(className.name)} is none of ASCII letters, digits, and \`_\``,
    )
  }
  for (const field of ["x", "y"]) {
    const coordinate = childOf(node, field)
    if (coordinate === null) continue
    reading.problems.expect(
      isCoordinate(textOf(coordinate)),
      label(coordinate),
      `the coordinate ${JSON.stringify(textOf(coordinate))} is none that the lexer reads`,
    )
  }
}

/**
 * diagrams/quadrant.md, Classes: the name of a class holds the characters of a
 * word of a name, `-`, `,`, and `:`, and no whitespace of ASCII.
 */
function checkClassName(reading: Reading, node: CheckedNode): void {
  const name = convertedTextOf(reading, node.range)
  reading.problems.expect(
    name !== "" &&
      [...name].every(
        (character) =>
          isWordCharacter(character) || "&#*-,:".includes(character),
      ),
    label(node),
    `the name ${JSON.stringify(name)} is empty or holds a character that the name of a class does not hold`,
  )
}

/** The value of the style `style` as the Db reads it: after its first `:`, up to a second, without the whitespace around it; none where there is no `:`. */
function styleOf(
  style: string,
): { readonly name: string; readonly value: string } | null {
  const colon = style.indexOf(":")
  if (colon === -1) return null
  const rest = style.slice(colon + 1)
  const second = rest.indexOf(":")
  return {
    name: trimmed(style.slice(0, colon)),
    value: trimmed(second === -1 ? rest : rest.slice(0, second)),
  }
}

/** Whether `value` is one that the style `name` takes. */
function isStyleValue(name: string, value: string): boolean {
  switch (name) {
    case "radius":
      return value !== "" && [...value].every((c) => c >= "0" && c <= "9")
    case "color":
    case "stroke-color":
      return HEX_CODE.test(value)
    case "stroke-width":
      return (
        value.endsWith("px") &&
        value.length > 2 &&
        [...value.slice(0, -2)].every((c) => c >= "0" && c <= "9")
      )
    default:
      return false
  }
}

/**
 * ast/quadrant.md, QuadrantPointStatement, and diagrams/quadrant.md, Points
 * and Rejections outside the grammar: a style holds letters, digits, `:`, `#`,
 * `-`, and spaces, has no whitespace at its ends, and is a name that the Db
 * takes, a `:`, and a value of its form.
 */
function checkStyle(reading: Reading, node: CheckedNode): void {
  const written = textOf(node)
  const where = label(node)
  reading.problems.expect(
    written !== "" &&
      trimmed(written) === written &&
      [...written].every(
        (character) =>
          (character.charCodeAt(0) < 0x80 && isWordCharacter(character)) ||
          ":#-".includes(character) ||
          SPACES.includes(character),
      ) &&
      !written.includes("_"),
    where,
    `the style ${JSON.stringify(written)} is empty, has whitespace at its ends, or holds a character that a style does not hold`,
  )
  const style = styleOf(written)
  reading.problems.expect(
    style !== null &&
      QUADRANT_STYLE_NAMES.includes(style.name) &&
      isStyleValue(style.name, style.value),
    where,
    `the style ${JSON.stringify(written)} is none that the Db takes`,
  )
}

/** Whether `statement` is an empty description block: a block with no text. */
function isEmptyBlock(statement: CheckedNode): boolean {
  return (
    statement.type === "QuadrantAccDescrBlockStatement" &&
    childOf(statement, "value") === null
  )
}

/** Whether `statement` is a description block with text. */
function isBlockWithText(statement: CheckedNode): boolean {
  return (
    statement.type === "QuadrantAccDescrBlockStatement" &&
    childOf(statement, "value") !== null
  )
}

/**
 * diagrams/quadrant.md, Diagram and statements and Titles and accessibility
 * statements: two statements on a line have a `;` between them, unless one of
 * them is an empty description block; after a description block with text only
 * empty description blocks may come on its line, with nothing between, and its
 * line ends right after it.
 */
function checkSeparation(reading: Reading, node: CheckedNode): void {
  const statements = entriesOf(node, "body").filter(
    (entry): entry is CheckedNode => entry !== null,
  )
  // Whether the statement ends a run of a block with text and the empty
  // description blocks that follow it with nothing between.
  let endsBlockRun = false
  for (const [index, statement] of statements.entries()) {
    const next = statements[index + 1]
    // A comment ends at the end of its line, so nothing of it stands between
    // the statements.
    const gap = convertedTextOf(
      reading,
      [statement.range[1], next?.range[0] ?? reading.text.length],
      reading.root.comments.map((comment) => comment.range),
    )
    const separated = /^[^\n\r;]*[\n\r;]/u.test(gap)
    const where = label(statement)
    const inRun: boolean =
      isBlockWithText(statement) || (isEmptyBlock(statement) && endsBlockRun)
    if (inRun) {
      // Nothing stands between the `}` and the end of the line, or an empty block.
      reading.problems.expect(
        gap === "" || /^[\n\r;]/u.test(gap),
        where,
        `the block is followed by ${JSON.stringify(gap)} before the end of its line`,
      )
      if (next !== undefined && !separated) {
        reading.problems.expect(
          isEmptyBlock(next),
          where,
          `${label(next)} follows the block on its line and is no empty description block`,
        )
      }
    } else if (next !== undefined && !separated) {
      reading.problems.expect(
        isEmptyBlock(statement) || isEmptyBlock(next),
        where,
        `${label(next)} follows the statement on its line with no \`;\` between them`,
      )
    }
    endsBlockRun = inRun && gap === ""
  }
}

/** The text that stands for a token in the layout of a node: a keyword in lower case, an arrow as `-->`. */
function layoutTextOf(token: CheckedToken): string {
  if (token.type === "Keyword") return token.value.toLowerCase()
  return isArrowText(token.value) ? "-->" : token.value
}

/**
 * parser/docs/tokens/quadrant.md, Tokens: the tokens that a node writes itself
 * are `Punctuator` tokens for the texts of {@link QUADRANT_PUNCTUATORS} (any
 * arrow included) and `Keyword` tokens for the others.
 */
function checkOwnKinds(reading: Reading, node: CheckedNode): void {
  for (const token of ownOf(reading.root, node).tokens) {
    const isPunctuator =
      QUADRANT_PUNCTUATORS.includes(token.value) || isArrowText(token.value)
    reading.problems.expectEqual(
      token.type,
      isPunctuator ? "Punctuator" : "Keyword",
      `${label(token)} of ${JSON.stringify(token.value)} in ${label(node)}`,
      "the kind of a token that the node writes itself",
    )
  }
}

/** `expected` is the layout of the node, whose own tokens are of the kinds above and whose range is the hull of its tokens and child nodes. */
function checkNodeTokens(
  reading: Reading,
  node: CheckedNode,
  expected: readonly string[],
): void {
  checkOwnKinds(reading, node)
  const own = ownOf(reading.root, node)
  checkLayout(reading, node, own, expected, layoutTextOf)
  checkRangeIsHull(reading, node, own)
}

/** The layout of the `,` between the entries of the list in the field `field` of `node`: an entry, and a `,` and an entry for each of the others. */
function listLayout(node: CheckedNode, field: string): string[] {
  return entriesOf(node, field).flatMap((_entry, index) =>
    index === 0 ? [CHILD] : [",", CHILD],
  )
}

/**
 * parser/docs/tokens/quadrant.md and positions/quadrant.md: the diagram writes
 * itself its header, as a `Keyword` token, and the `;` that end lines; the
 * header is `quadrantChart` in any case.
 */
function checkDiagramTokens(reading: Reading, node: CheckedNode): void {
  checkOwnKinds(reading, node)
  const own = ownOf(reading.root, node)
  const [header, ...rest] = own.tokens
  reading.problems.expectEqual(
    header?.value.toLowerCase(),
    "quadrantchart",
    label(node),
    "the first token that the diagram writes itself, the header",
  )
  reading.problems.expect(
    rest.every((token) => token.value === ";"),
    label(node),
    `the tokens that the diagram writes itself after its header are ${JSON.stringify(rest.map((token) => token.value))}, not only \`;\``,
  )
  checkRangeIsHull(reading, node, own)
}

/**
 * parser/docs/tokens/quadrant.md and positions/quadrant.md: a point writes
 * itself the `:::` and the `:` and the brackets and commas of its grammar rule,
 * and the `,` between its styles; its range runs to its last style, or to the
 * `]`.
 */
function checkPointTokens(reading: Reading, node: CheckedNode): void {
  checkNodeTokens(reading, node, [
    CHILD,
    ...(childOf(node, "className") === null ? [] : [":::", CHILD]),
    ":",
    "[",
    CHILD,
    ",",
    CHILD,
    "]",
    ...listLayout(node, "styles"),
  ])
}

/**
 * parser/docs/tokens/quadrant.md, Tokens: the kinds that the tokens of a label
 * that starts with a string have, from its written text: the tokens that cover
 * the string, with its quotes, are `stringTokenKinds()` of their range (one
 * `String` token, or `StringFragment` tokens where a cut lies in the string),
 * and the tokens of the words after it are `RawText` tokens. A token that
 * begins in the string and ends after it is none of these kinds.
 */
function stringLabelTokenKinds(
  reading: Reading,
  node: CheckedNode,
  tokens: readonly CheckedToken[],
): string[] {
  const written = reading.written.of(node.range)
  const parts = labelValueOf(
    String(node.kind),
    written,
    reading.attributeTextOf(node.range),
  )
  if (parts === null) return tokens.map(() => "RawText")
  const stringLength = written.length - parts.rest.length
  let covered = 0
  let covering = 0
  while (covered < stringLength && covering < tokens.length) {
    covered += tokens[covering]?.value.length ?? 0
    covering++
  }
  const end = tokens[covering - 1]?.range[1] ?? node.range[0]
  const expected =
    covered === stringLength
      ? reading.written.stringTokenKinds([node.range[0], end])
      : []
  return tokens.map((_token, index) =>
    index < covering
      ? (expected[index] ?? "a token that ends where the string ends")
      : "RawText",
  )
}

/**
 * parser/docs/tokens/quadrant.md, Tokens: the tokens of a value node are of the
 * kinds its text has: `RawText` for the words of a text without quotes, a
 * coordinate, a style, and the text of a title, an accessibility statement, and
 * a block; `String` for a string or a markdown string, with its quotes; and
 * `Identifier` for the name of a class.
 */
function checkValueTokens(reading: Reading, node: CheckedNode): void {
  const tokens = nodeTokensIn(reading.root, node.range)
  const where = label(node)
  let kinds: readonly string[]
  if (node.type === "QuadrantIdentifier" || node.type === "Identifier") {
    kinds = tokens.map(() => "Identifier")
  } else if (node.type === "QuadrantLabel" && node.kind !== "text") {
    kinds = stringLabelTokenKinds(reading, node, tokens)
  } else {
    kinds = tokens.map(() => "RawText")
  }
  reading.problems.expectEqual(
    tokens.map((token) => token.type),
    kinds,
    where,
    "the kinds of the tokens of the node",
  )
  reading.problems.expect(tokens.length > 0, where, "the node has no token")
  // The range of a value node is that of its first token to that of its last.
  const first = tokens[0]
  const last = tokens.at(-1)
  if (first !== undefined && last !== undefined) {
    reading.problems.expectEqual(
      node.range,
      [first.range[0], last.range[1]],
      where,
      "the range, which runs from its first token to its last",
    )
  }
  // The words of a text that follow one another with nothing between them are
  // one token, so two `RawText` tokens have a cut between them, and the
  // whitespace next to the cut lies in a token.
  for (const [index, token] of tokens.entries()) {
    const next = tokens[index + 1]
    if (next === undefined || token.type !== "RawText") continue
    if (next.type !== "RawText") continue
    reading.problems.expect(
      token.range[1] < next.range[0],
      where,
      `${label(token)} and ${label(next)} have no directive, comment, or ignored \`;\` between them, so they are one token`,
    )
    reading.problems.expect(
      between(reading, token.range[1], next.range[0]) === "",
      where,
      `the whitespace between ${label(token)} and ${label(next)}, next to a cut, lies in no token`,
    )
  }
}

/**
 * Checks what the quadrant chart documents state about a quadrant chart tree
 * beyond the conditions of every tree (ast.md): the child nodes are of the types
 * that the tables give, the lists that are never empty have an entry, a
 * statement has the fields it needs, the statements are separated, and the texts,
 * the coordinates, the styles, and the names hold the characters that the lexer
 * reads in them.
 */
export function checkQuadrantTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  checkTokensInValueNodes(root, problems)
  const reading = readingOf(text, root, problems)
  const accessibility = new Map<CheckedNode, CheckedNode>()
  walkNodes(root, (node) => {
    if (ACCESSIBILITY_STATEMENTS.includes(node.type)) {
      const value = childOf(node, "value")
      if (value !== null) accessibility.set(value, node)
    }
  })
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, QUADRANT_CHILD_TYPES)
    checkListsWithAnEntry(reading, node, LISTS_WITH_AN_ENTRY)
    switch (node.type) {
      case "QuadrantDiagram":
        checkSeparation(reading, node)
        checkDiagramTokens(reading, node)
        break
      case "QuadrantTitleStatement":
        checkTitle(reading, node)
        checkNodeTokens(reading, node, [
          "title",
          ...presentChildren(node, "value"),
        ])
        break
      case "QuadrantAccTitleStatement":
        checkNodeTokens(reading, node, ["acctitle", ":", CHILD])
        break
      case "QuadrantAccDescrStatement":
        checkNodeTokens(reading, node, ["accdescr", ":", CHILD])
        break
      case "QuadrantAccDescrBlockStatement":
        checkNodeTokens(reading, node, [
          "accdescr",
          "{",
          ...presentChildren(node, "value"),
          "}",
        ])
        break
      case "QuadrantAxisStatement":
        checkAxis(reading, node)
        checkNodeTokens(reading, node, [
          `${textOf(node, "axis")}-axis`,
          CHILD,
          ...(node.arrow === true ? ["-->"] : []),
          ...presentChildren(node, "end"),
        ])
        break
      case "QuadrantQuadrantStatement":
        checkQuadrant(reading, node)
        checkNodeTokens(reading, node, [
          `quadrant-${String(node.quadrant)}`,
          CHILD,
        ])
        break
      case "QuadrantPointStatement":
        checkPoint(reading, node)
        checkPointTokens(reading, node)
        break
      case "QuadrantClassDefStatement":
        checkNodeTokens(reading, node, [
          "classdef",
          CHILD,
          ...listLayout(node, "styles"),
        ])
        break
      case "QuadrantIdentifier":
        checkClassName(reading, node)
        checkValueTokens(reading, node)
        break
      case "Identifier":
        checkValueTokens(reading, node)
        break
      case "QuadrantLabel":
        checkLabel(reading, node)
        checkValueTokens(reading, node)
        break
      case "QuadrantLiteral": {
        const statement = accessibility.get(node)
        if (statement !== undefined) {
          checkAccessibilityText(reading, node, statement)
        }
        checkValueTokens(reading, node)
        break
      }
      default:
        break
    }
  })
  // The styles of the points and of the classes.
  walkNodes(root, (node) => {
    if (
      node.type !== "QuadrantPointStatement" &&
      node.type !== "QuadrantClassDefStatement"
    ) {
      return
    }
    for (const style of entriesOf(node, "styles")) {
      if (style !== null) checkStyle(reading, style)
    }
  })
}
