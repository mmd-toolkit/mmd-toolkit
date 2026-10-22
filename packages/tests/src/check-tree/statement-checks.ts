import {
  isLineTerminatorCode,
  isWhitespace,
} from "../db-from-tree/characters.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import type { Problems } from "./problems.ts"
import { label } from "./problems.ts"
import { nodeTokensIn, ownTokensOf } from "./tokens.ts"
import type { CheckedNode, CheckedRoot, CheckedToken } from "./types.ts"
import { childNodesOf, isNode } from "./walk.ts"
import { WrittenText } from "./written-text.ts"
import {
  AttributeQuotes,
  ConvertedText,
  readConvertedCharacters,
  readAgentflowCharacters,
} from "../db-from-tree/converted-text.ts"

// The checks that the diagrams whose statements are a keyword and a text
// share (gantt and journey): the tokens that a node writes itself, the range
// of a statement, the text after a keyword, the accessibility statements, and
// the entries that lie between separators. What each diagram states about its
// own nodes is in `gantt.ts` and `journey.ts`; the sentences cited below are
// those of `ast/<diagram>.md`, `diagrams/<diagram>.md`, and
// `parser/docs/tokens/<diagram>.md`.

/** What a check reads besides the node: the tree, the source, its written text, and where to report. */
export interface Reading {
  readonly root: CheckedRoot
  readonly text: string
  readonly written: WrittenText
  readonly problems: Problems
  readonly converted: ConvertedText
  readonly attributeTextOf: (range: TreeRange) => string
  readonly attributeValueOf: (
    node: CheckedNode,
    field?: "value" | "name",
    trim?: boolean,
  ) => string
}

/** The reading of the tree `root` of the source `text`, which reports to `problems`. */
export function readingOf(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): Reading {
  const written = new WrittenText(text, root)
  let attributes: AttributeQuotes | undefined,
    converted: ConvertedText | undefined

  /** Common conversion excludes the frontmatter, but includes all comments and statements. */
  function attributeQuotes(): AttributeQuotes {
    return (attributes ??= new AttributeQuotes(text, root))
  }

  return {
    root,
    text,
    written,
    problems,
    get converted() {
      return (converted ??= new ConvertedText(
        root.body.type === "AgentflowDiagram"
          ? readAgentflowCharacters(text, root)
          : readConvertedCharacters(text, root, attributeQuotes()),
      ))
    },
    attributeTextOf: (range) =>
      attributeQuotes().of(range, (offset) => written.isLeftOut(offset)),
    attributeValueOf: (node, field = "value", trim = false) =>
      attributeQuotes().readValue(
        node.range,
        textOf(node, field),
        (offset) => written.isLeftOut(offset),
        node.type === "StringLiteral" ? 1 : 0,
        trim,
      ),
  }
}

/** A character of a token that a node writes itself, with its offset. */
export interface OwnCharacter {
  readonly character: string
  readonly offset: number
}

/** The tokens that a node writes itself (see {@link ownTokensOf}), their texts joined, and their characters. */
export interface Own {
  readonly tokens: readonly CheckedToken[]
  readonly text: string
  readonly characters: readonly OwnCharacter[]
}

/** The tokens that `node` writes itself. */
export function ownOf(root: CheckedRoot, node: CheckedNode): Own {
  const tokens = ownTokensOf(root, node)
  const characters: OwnCharacter[] = []
  for (const token of tokens) {
    for (let index = 0; index < token.value.length; index++) {
      characters.push({
        character: token.value.charAt(index),
        offset: token.range[0] + index,
      })
    }
  }
  return {
    tokens,
    text: tokens.map((token) => token.value).join(""),
    characters,
  }
}

/** The offsets of the characters `character` among the characters that the node writes itself. */
export function offsetsOf(own: Own, character: string): number[] {
  return own.characters
    .filter((candidate) => candidate.character === character)
    .map((candidate) => candidate.offset)
}

/** The child of `node` in the field `field`, or null where the field is null. */
export function childOf(node: CheckedNode, field: string): CheckedNode | null {
  const value = node[field]
  return isNode(value) ? value : null
}

/** The entries of the list in the field `field` of `node`, with null where an entry is null. */
export function entriesOf(
  node: CheckedNode,
  field: string,
): (CheckedNode | null)[] {
  const value = node[field]
  return Array.isArray(value)
    ? (value as unknown[]).map((entry) => (isNode(entry) ? entry : null))
    : []
}

/** The string value of the field `field` of `node`, or an empty string where the field holds no string. */
export function textOf(node: CheckedNode | null, field = "value"): string {
  const value = node?.[field]
  return typeof value === "string" ? value : ""
}

/** Whether `text` is empty or whitespace only. */
export function isBlank(text: string): boolean {
  return [...text].every((character) =>
    isWhitespace(character.codePointAt(0) ?? 0),
  )
}

/** Whether the first character of `text` is whitespace. */
export function startsWithWhitespace(text: string): boolean {
  return text !== "" && isWhitespace(text.charCodeAt(0))
}

/** Whether the last character of `text` is whitespace. */
export function endsWithWhitespace(text: string): boolean {
  return text !== "" && isWhitespace(text.charCodeAt(text.length - 1))
}

/** Whether `text` is one whitespace character, a CRLF as one (common.md, Line terminators). */
function isOneWhitespaceCharacter(text: string): boolean {
  return (
    text === "\r\n" || (text.length === 1 && isWhitespace(text.charCodeAt(0)))
  )
}

/** The written text between `from` and `to`, where a directive, a comment region, and an ignored `;` are left out. */
export function between(reading: Reading, from: number, to: number): string {
  return reading.written.of([from, to])
}

/** The first character at or after `offset` that the written text holds, none at the end of the text. */
export function nextWrittenCharacter(
  reading: Reading,
  offset: number,
): string | undefined {
  for (let at = offset; at < reading.text.length; at++) {
    if (!reading.written.isLeftOut(at)) return reading.text.charAt(at)
  }
  return undefined
}

/** Whether only whitespace lies in the written text from `offset` to the end of its line. */
export function restOfLineIsBlank(reading: Reading, offset: number): boolean {
  for (let at = offset; at < reading.text.length; at++) {
    if (reading.written.isLeftOut(at)) continue
    const code = reading.text.charCodeAt(at)
    if (isLineTerminatorCode(code)) return true
    if (!isWhitespace(code)) return false
  }
  return true
}

/**
 * parser/docs/tokens/<diagram>.md, Tokens: the tokens that a node writes
 * itself are `Punctuator` tokens for the texts in `punctuators` and `Keyword`
 * tokens for the others (the header, the keywords, and the day).
 */
export function checkOwnKinds(
  reading: Reading,
  node: CheckedNode,
  own: Own,
  punctuators: readonly string[],
): void {
  for (const token of own.tokens) {
    reading.problems.expectEqual(
      token.type,
      punctuators.includes(token.value) ? "Punctuator" : "Keyword",
      `${label(token)} of ${JSON.stringify(token.value)} in ${label(node)}`,
      "the kind of a token that the node writes itself",
    )
  }
}

/**
 * parser/docs/positions/<diagram>.md, Ranges: the range of a statement runs
 * from the first of its tokens and child nodes to the last in source order. So
 * a task ends at the last item, or at the last `,` when the item after it is
 * null, or at the `:` when its data is whitespace only; a click statement ends
 * at the closing `"` of its link or the `)` of its call, whichever comes last
 * in the source, whatever the order of its child fields; a call part runs from
 * `call` to `)`; a list statement ends at its last item or `,`, and covers its
 * keyword alone when its list text is whitespace only; and an accessibility
 * statement ends at the last character of its text that is not whitespace.
 */
export function checkRangeIsHull(
  reading: Reading,
  node: CheckedNode,
  own: Own,
): void {
  const parts = [
    ...own.tokens.map((token) => token.range),
    ...childNodesOf(node).map((child) => child.range),
  ]
  if (parts.length === 0) return
  reading.problems.expectEqual(
    node.range,
    [
      Math.min(...parts.map((range) => range[0])),
      Math.max(...parts.map((range) => range[1])),
    ],
    label(node),
    "the range, which runs from the first of its tokens and child nodes to the last",
  )
}

/**
 * parser/docs/tokens/<diagram>.md, Tokens: the tokens of `node` are all of one
 * of the kinds `kinds`, and there is at least one: `RawText` tokens for a text
 * unit, which a directive may cut into several, and `Identifier` tokens for a
 * name unit.
 */
export function checkTokenKinds(
  reading: Reading,
  node: CheckedNode,
  kinds: readonly string[],
  what: string,
): void {
  const tokens = nodeTokensIn(reading.root, node.range)
  reading.problems.expect(
    tokens.length > 0 && tokens.every((token) => kinds.includes(token.type)),
    label(node),
    `the tokens of ${what} are not all of the kind ${kinds.join(" or ")}: ${tokens.map((token) => token.type).join(", ")}`,
  )
}

/**
 * The tokens that a node writes itself, outside its child nodes, joined, are
 * `expected` (the tokens that its grammar rule names: the header of the
 * diagram, the keyword of a statement and the `:` or the braces of an
 * accessibility statement). The keywords are read case-insensitively, so the
 * texts are compared in lower case, except where `ignoresCase` is false.
 */
export function checkJoinedOwnText(
  reading: Reading,
  node: CheckedNode,
  own: Own,
  expected: string,
  ignoresCase: boolean,
): void {
  reading.problems.expectEqual(
    ignoresCase ? own.text.toLowerCase() : own.text,
    expected,
    label(node),
    "the tokens of the node outside its child nodes, joined",
  )
}

/** How the text of a statement that is a keyword, one whitespace character, and a text ends: the field that holds the text, and the characters that end it besides a line terminator. */
export interface TextAfterKeyword {
  readonly field: "value" | "name"
  readonly endsBefore: readonly string[]
}

/**
 * ast/<diagram>.md, the statements that are a keyword and a text, and
 * diagrams/<diagram>.md, The statement context: the text is what follows the
 * keyword and one whitespace character, to the end of the line, or to the
 * first of the characters that end it; the node keeps the whitespace at its
 * ends.
 */
export function checkTextAfter(
  reading: Reading,
  node: CheckedNode,
  own: Own,
  rule: TextAfterKeyword,
): void {
  const keyword = own.tokens[0]
  const text = childOf(node, rule.field)
  if (keyword === undefined || text === null) return
  const where = label(node)
  const gap = between(reading, keyword.range[1], text.range[0])
  reading.problems.expect(
    isOneWhitespaceCharacter(gap),
    where,
    `the written text between the keyword and the ${rule.field} is ${JSON.stringify(gap)}, not one whitespace character`,
  )
  const next = nextWrittenCharacter(reading, text.range[1])
  reading.problems.expect(
    next === undefined ||
      isLineTerminatorCode(next.charCodeAt(0)) ||
      rule.endsBefore.includes(next),
    where,
    `the ${rule.field} ends before ${JSON.stringify(next)}, which does not end the text of the statement`,
  )
}

/**
 * ast/<diagram>.md, the accessibility title and description statements: the
 * text follows the `:` and the whitespace after it, line feeds included, and
 * runs to the end of its line; the value is the text without the whitespace at
 * its ends.
 */
export function checkAccessibilityLine(
  reading: Reading,
  node: CheckedNode,
  own: Own,
): void {
  const text = childOf(node, "value")
  const colon = offsetsOf(own, ":").at(-1)
  if (text === null || colon === undefined) return
  const where = label(node)
  const gap = between(reading, colon + 1, text.range[0])
  reading.problems.expect(
    isBlank(gap),
    where,
    `the written text between the \`:\` and the value is ${JSON.stringify(gap)}, not whitespace only`,
  )
  reading.problems.expect(
    restOfLineIsBlank(reading, text.range[1]),
    where,
    "the value ends before the end of its line and not only whitespace follows it",
  )
}

/**
 * ast/<diagram>.md, the description block statement: the text is what lies
 * between `{` and `}` without the whitespace at its ends, and the value is
 * null when only whitespace lies between them.
 */
export function checkAccessibilityBlock(
  reading: Reading,
  node: CheckedNode,
  own: Own,
): void {
  const open = offsetsOf(own, "{")[0]
  const close = offsetsOf(own, "}").at(-1)
  if (open === undefined || close === undefined) return
  const where = label(node)
  const text = childOf(node, "value")
  if (text === null) {
    const inside = between(reading, open + 1, close)
    reading.problems.expect(
      isBlank(inside),
      where,
      `the value is null, but the braces hold ${JSON.stringify(inside)}`,
    )
    return
  }
  const before = between(reading, open + 1, text.range[0])
  const after = between(reading, text.range[1], close)
  reading.problems.expect(
    isBlank(before) && isBlank(after),
    where,
    `the text between the braces has ${JSON.stringify(before)} before the value and ${JSON.stringify(after)} after it, not whitespace only`,
  )
}

/**
 * ast/<diagram>.md, the accessibility statements: the value is read without
 * the whitespace at its ends, which mermaid.js trims.
 */
export function checkTrimmedValue(
  reading: Reading,
  node: CheckedNode,
  text: CheckedNode | null,
  what: string,
): void {
  if (text === null) return
  const value = textOf(text)
  reading.problems.expect(
    !startsWithWhitespace(value) && !endsWithWhitespace(value),
    label(node),
    `${what} starts or ends with whitespace: ${JSON.stringify(value)}`,
  )
}

/**
 * The stretches between `lowers` and `uppers` (the end of a separator and the
 * start of the next one, or of the end of the list) hold the entries of
 * `list`, one for each, in order: an entry is null where only whitespace lies
 * in its stretch, and otherwise it runs from the first character of the
 * stretch that is not whitespace to the last (ast/gantt.md, GanttTaskStatement
 * and GanttClickStatement; ast/journey.md, JourneyTaskStatement).
 */
export function checkStretches(
  reading: Reading,
  node: CheckedNode,
  list: readonly (CheckedNode | null)[],
  stretches: readonly TreeRange[],
  what: string,
): void {
  const where = label(node)
  reading.problems.expectEqual(
    list.length,
    stretches.length,
    where,
    `the number of ${what}, which is one more than the separators`,
  )
  for (const [index, stretch] of stretches.entries()) {
    const entry = list[index]
    if (entry === undefined) continue
    const [from, to] = stretch
    if (entry === null) {
      const text = between(reading, from, to)
      reading.problems.expect(
        isBlank(text),
        where,
        `${what} ${index} is null, but ${JSON.stringify(text)} lies in its stretch`,
      )
      continue
    }
    const before = between(reading, from, entry.range[0])
    const after = between(reading, entry.range[1], to)
    reading.problems.expect(
      from <= entry.range[0] &&
        entry.range[1] <= to &&
        isBlank(before) &&
        isBlank(after),
      where,
      `${what} ${index} does not fill its stretch ${from}-${to}: ${JSON.stringify(before)} before it, ${JSON.stringify(after)} after it`,
    )
  }
}

/** The text that stands for a child node in the layout of a node. */
export const CHILD = "·"

/**
 * The tokens that a node writes itself and its child nodes, in source order,
 * are `expected`, with the child nodes as {@link CHILD} and the keywords in
 * lower case, and only whitespace lies between two of them in the written text
 * (parser/docs/positions/<diagram>.md, Ranges). `textOfToken` gives the text
 * that stands for a token in the layout.
 */
export function checkLayout(
  reading: Reading,
  node: CheckedNode,
  own: Own,
  expected: readonly string[],
  textOfToken: (token: CheckedToken) => string = (token) =>
    token.type === "Keyword" ? token.value.toLowerCase() : token.value,
): void {
  const parts = [
    ...own.tokens.map((token) => ({
      text: textOfToken(token),
      range: token.range,
    })),
    ...childNodesOf(node).map((child) => ({ text: CHILD, range: child.range })),
  ].sort((a, b) => a.range[0] - b.range[0])
  const where = label(node)
  reading.problems.expectEqual(
    parts.map((part) => part.text),
    expected,
    where,
    "the tokens that the node writes itself and its child nodes, in source order",
  )
  for (const [index, part] of parts.entries()) {
    const next = parts[index + 1]
    if (next === undefined) continue
    // C4 diagram comments are trivia between statements and boundary parts.
    const gap =
      reading.root.body.type === "C4Diagram" ||
      reading.root.body.type === "UsecaseDiagram"
        ? reading.written.of(
            [part.range[1], next.range[0]],
            reading.root.comments.map((comment) => comment.range),
          )
        : between(reading, part.range[1], next.range[0])
    reading.problems.expect(
      isBlank(gap),
      where,
      `the written text between ${JSON.stringify(part.text)} and ${JSON.stringify(next.text)} is ${JSON.stringify(gap)}, not whitespace only`,
    )
  }
}

/** The layout of the child nodes in the fields `fields` of `node` that are not null: one {@link CHILD} for each, in the order of the fields. */
export function presentChildren(
  node: CheckedNode,
  ...fields: string[]
): string[] {
  return fields
    .filter((field) => childOf(node, field) !== null)
    .map(() => CHILD)
}
