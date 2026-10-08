import {
  isLineTerminatorCode,
  isWhitespace,
} from "../db-from-tree/characters.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import type { Problems } from "./problems.ts"
import { label } from "./problems.ts"
import { checkTokensInValueNodes, nodeTokensIn, ownTokensOf } from "./tokens.ts"
import type { CheckedNode, CheckedRoot, CheckedToken } from "./types.ts"
import { childNodesOf, isNode, nodesOf } from "./walk.ts"
import { WrittenText } from "./written-text.ts"

// ast/gantt.md, diagrams/gantt.md, parser/docs/tokens/gantt.md, and
// parser/docs/positions/gantt.md: what the gantt documents state about the
// tree beyond the conditions of every tree (ast.md). The tokens of a statement
// that no child node holds are the keywords and marks that its grammar rule
// writes (diagrams/gantt.md, Grammar), each of the kind that the table of
// Tokens gives; the gaps between them and the values are the whitespace that
// the rules of the lexer read (The statement context). The texts of the
// `Keyword` and `Punctuator` tokens are in the tables of `keywords.ts` and
// `punctuators.ts`, which a test holds to the rows of that table.

/** ast/gantt.md, GanttTaskStatement: the words that are tags, in exactly this case. */
const TAG_WORDS: readonly string[] = [
  "active",
  "done",
  "crit",
  "milestone",
  "vert",
]

/** ast/gantt.md, GanttWeekdayStatement: the days of a `weekday` statement, in lower case. */
const WEEKDAYS: readonly string[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

/** ast/gantt.md, GanttWeekendStatement: the days of a `weekend` statement, in lower case. */
const WEEKEND_DAYS: readonly string[] = ["friday", "saturday"]

/**
 * parser/docs/tokens/gantt.md, Tokens: the texts of the `Punctuator` tokens
 * that a node writes itself; every other token that a node writes itself is a
 * `Keyword` token.
 */
const OWN_PUNCTUATORS: readonly string[] = [":", ",", "{", "}", "(", ")"]

/**
 * diagrams/gantt.md, Grammar: the texts of the tokens that a node writes
 * itself, outside its child nodes, joined, in lower case, since the keywords
 * are read case-insensitively. The header of the diagram is `gantt` in exactly
 * this case (Detection). The `call` part writes its keyword and the
 * parentheses (`call-part`); an accessibility statement its keyword and the
 * `:`, or the keyword and the braces.
 */
const OWN_TEXTS: Readonly<Record<string, string>> = {
  GanttDiagram: "gantt",
  GanttCallback: "call()",
  GanttDateFormatStatement: "dateformat",
  GanttAxisFormatStatement: "axisformat",
  GanttTickIntervalStatement: "tickinterval",
  GanttTodayMarkerStatement: "todaymarker",
  GanttInclusiveEndDatesStatement: "inclusiveenddates",
  GanttTitleStatement: "title",
  GanttSectionStatement: "section",
  GanttAccTitleStatement: "acctitle:",
  GanttAccDescrStatement: "accdescr:",
  GanttAccDescrBlockStatement: "accdescr{}",
}

/** How the text of a statement that is a keyword, one whitespace character, and a text ends: the field that holds the text, and the characters that end it besides a line terminator (diagrams/gantt.md, The statement context, rules 11, 14, 15, 18, 22, and 24). */
interface TextAfterKeyword {
  readonly field: "value" | "name"
  readonly endsBefore: readonly string[]
}

const SETTING_TEXT: TextAfterKeyword = {
  field: "value",
  endsBefore: ["#", ";"],
}

const TEXT_AFTER_KEYWORD: Readonly<Record<string, TextAfterKeyword>> = {
  GanttDateFormatStatement: SETTING_TEXT,
  GanttAxisFormatStatement: SETTING_TEXT,
  GanttTickIntervalStatement: SETTING_TEXT,
  GanttTodayMarkerStatement: { field: "value", endsBefore: [";"] },
  GanttTitleStatement: { field: "value", endsBefore: [] },
  GanttSectionStatement: { field: "name", endsBefore: [] },
}

/** What a check reads besides the node: the tree, the source, its written text, and where to report. */
interface Reading {
  readonly root: CheckedRoot
  readonly text: string
  readonly written: WrittenText
  readonly problems: Problems
}

/** A character of a token that a node writes itself, with its offset. */
interface OwnCharacter {
  readonly character: string
  readonly offset: number
}

/** The tokens that a node writes itself (see {@link ownTokensOf}), their texts joined, and their characters. */
interface Own {
  readonly tokens: readonly CheckedToken[]
  readonly text: string
  readonly characters: readonly OwnCharacter[]
}

/** The tokens that `node` writes itself. */
function ownOf(root: CheckedRoot, node: CheckedNode): Own {
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
function offsetsOf(own: Own, character: string): number[] {
  return own.characters
    .filter((candidate) => candidate.character === character)
    .map((candidate) => candidate.offset)
}

/** The child of `node` in the field `field`, or null where the field is null. */
function childOf(node: CheckedNode, field: string): CheckedNode | null {
  const value = node[field]
  return isNode(value) ? value : null
}

/** The entries of the list in the field `field` of `node`, with null where an entry is null. */
function entriesOf(node: CheckedNode, field: string): (CheckedNode | null)[] {
  const value = node[field]
  return Array.isArray(value)
    ? (value as unknown[]).map((entry) => (isNode(entry) ? entry : null))
    : []
}

/** The string value of the field `field` of `node`, or an empty string where the field holds no string. */
function textOf(node: CheckedNode | null, field = "value"): string {
  const value = node?.[field]
  return typeof value === "string" ? value : ""
}

/** Whether `text` is empty or whitespace only. */
function isBlank(text: string): boolean {
  return [...text].every((character) =>
    isWhitespace(character.codePointAt(0) ?? 0),
  )
}

/** Whether the first character of `text` is whitespace. */
function startsWithWhitespace(text: string): boolean {
  return text !== "" && isWhitespace(text.charCodeAt(0))
}

/** Whether the last character of `text` is whitespace. */
function endsWithWhitespace(text: string): boolean {
  return text !== "" && isWhitespace(text.charCodeAt(text.length - 1))
}

/** Whether `text` is one whitespace character, a CRLF as one (common.md, Line terminators). */
function isOneWhitespaceCharacter(text: string): boolean {
  return (
    text === "\r\n" || (text.length === 1 && isWhitespace(text.charCodeAt(0)))
  )
}

/** The written text between `from` and `to`, where a directive, a comment region, and an ignored `;` are left out. */
function between(reading: Reading, from: number, to: number): string {
  return reading.written.of([from, to])
}

/** The first character at or after `offset` that the written text holds, none at the end of the text. */
function nextWrittenCharacter(
  reading: Reading,
  offset: number,
): string | undefined {
  for (let at = offset; at < reading.text.length; at++) {
    if (!reading.written.isLeftOut(at)) return reading.text.charAt(at)
  }
  return undefined
}

/** Whether only whitespace lies in the written text from `offset` to the end of its line. */
function restOfLineIsBlank(reading: Reading, offset: number): boolean {
  for (let at = offset; at < reading.text.length; at++) {
    if (reading.written.isLeftOut(at)) continue
    const code = reading.text.charCodeAt(at)
    if (isLineTerminatorCode(code)) return true
    if (!isWhitespace(code)) return false
  }
  return true
}

/**
 * parser/docs/tokens/gantt.md, Tokens: the tokens that a node writes itself
 * are `Punctuator` tokens for `:`, `,`, `{`, `}`, `(`, and `)`, and `Keyword`
 * tokens for the others (the header, the keywords, and the day).
 */
function checkOwnKinds(reading: Reading, node: CheckedNode, own: Own): void {
  for (const token of own.tokens) {
    reading.problems.expectEqual(
      token.type,
      OWN_PUNCTUATORS.includes(token.value) ? "Punctuator" : "Keyword",
      `${label(token)} of ${JSON.stringify(token.value)} in ${label(node)}`,
      "the kind of a token that the node writes itself",
    )
  }
}

/**
 * parser/docs/positions/gantt.md, Ranges: the range of a statement runs from the
 * first of its tokens and child nodes to the last in source order. So a task
 * ends at the last item, or at the last `,` when the item after it is null, or
 * at the `:` when its data is whitespace only; a click statement ends at the
 * closing `"` of its link or the `)` of its call, whichever comes last in the
 * source, whatever the order of its child fields; a call part runs from `call`
 * to `)`; a list statement ends at its last item or `,`, and covers its keyword
 * alone when its list text is whitespace only; and an accessibility statement
 * ends at the last character of its text that is not whitespace.
 */
function checkRangeIsHull(reading: Reading, node: CheckedNode, own: Own): void {
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
 * parser/docs/tokens/gantt.md, Tokens: the tokens of `node` are all of one of
 * the kinds `kinds`, and there is at least one: `RawText` tokens for a text
 * unit, which a directive may cut into several, and `Identifier` tokens for a
 * name unit.
 */
function checkTokenKinds(
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
 * parser/docs/tokens/gantt.md, Tokens: the tokens of the string of a link part
 * are one `String` token, from the
 * opening quote to the closing one, or `StringFragment` tokens where a
 * directive or an ignored `;` cuts it.
 */
function checkStringTokens(
  reading: Reading,
  tokens: readonly CheckedToken[],
  where: string,
): void {
  const [first] = tokens
  const isOneString = tokens.length === 1 && first?.type === "String"
  reading.problems.expect(
    isOneString ||
      (tokens.length > 0 && tokens.every((t) => t.type === "StringFragment")),
    where,
    `the tokens of the string are not one String token or StringFragment tokens: ${tokens.map((token) => token.type).join(", ")}`,
  )
}

/**
 * ast/gantt.md, GanttDiagram and the nodes below, and diagrams/gantt.md,
 * Grammar: the tokens that a node writes itself, outside its child nodes, are
 * the ones that its grammar rule names: the header of the diagram, the
 * keyword of a statement and the `:` or the braces of an accessibility
 * statement, the `call` and the parentheses of a call part.
 */
function checkOwnText(reading: Reading, node: CheckedNode, own: Own): void {
  const expected = OWN_TEXTS[node.type]
  if (expected === undefined) return
  const actual =
    node.type === "GanttDiagram" ? own.text : own.text.toLowerCase()
  reading.problems.expectEqual(
    actual,
    expected,
    label(node),
    "the tokens of the node outside its child nodes, joined",
  )
}

/**
 * ast/gantt.md, GanttDateFormatStatement and the statements of its kind, and
 * diagrams/gantt.md, The statement context: the text is what follows the
 * keyword and one whitespace character, to the end of the line, or to the
 * first of the characters that end it; the node keeps the whitespace at its
 * ends.
 */
function checkTextAfterKeyword(
  reading: Reading,
  node: CheckedNode,
  own: Own,
): void {
  const rule = TEXT_AFTER_KEYWORD[node.type]
  if (rule === undefined) return
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
 * ast/gantt.md, GanttAccTitleStatement and GanttAccDescrStatement: the text
 * follows the `:` and the whitespace after it, line feeds included, and runs
 * to the end of its line; the value is the text without the whitespace at its
 * ends.
 */
function checkAccessibilityLine(
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
 * ast/gantt.md, GanttAccDescrBlockStatement: the text is what lies between
 * `{` and `}` without the whitespace at its ends, and the value is null when
 * only whitespace lies between them.
 */
function checkAccessibilityBlock(
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
 * ast/gantt.md, GanttAccTitleStatement, GanttAccDescrStatement, and
 * GanttAccDescrBlockStatement: the value is read without the whitespace at its
 * ends, which mermaid.js trims.
 */
function checkTrimmedValue(
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
 * ast/gantt.md, GanttWeekdayStatement and GanttWeekendStatement: the day is
 * one of a fixed set, in lower case whatever its case in the text, and the
 * token keeps the written case. The node writes the keyword and the day, two
 * tokens.
 */
function checkDay(reading: Reading, node: CheckedNode, own: Own): void {
  const isWeekday = node.type === "GanttWeekdayStatement"
  const where = label(node)
  const [keyword, day, ...rest] = own.tokens
  reading.problems.expectEqual(
    [keyword?.value.toLowerCase(), day === undefined, rest.length],
    [isWeekday ? "weekday" : "weekend", false, 0],
    where,
    "the tokens of the node: the keyword and the day",
  )
  reading.problems.expectEqual(
    node.day,
    day?.value.toLowerCase(),
    where,
    "the day, which is the day token in lower case",
  )
  reading.problems.expect(
    (isWeekday ? WEEKDAYS : WEEKEND_DAYS).includes(String(node.day)),
    where,
    `the day ${JSON.stringify(node.day)} is none of ${(isWeekday ? WEEKDAYS : WEEKEND_DAYS).join(", ")}`,
  )
}

/**
 * ast/gantt.md, GanttIncludesStatement and GanttExcludesStatement: the node
 * writes its keyword and the `,` units; an item is a run of characters that
 * are neither whitespace nor `,`.
 */
function checkList(reading: Reading, node: CheckedNode, own: Own): void {
  const where = label(node)
  const keyword =
    node.type === "GanttIncludesStatement" ? "includes" : "excludes"
  const commas = offsetsOf(own, ",").length
  reading.problems.expectEqual(
    own.text.toLowerCase(),
    `${keyword}${",".repeat(commas)}`,
    where,
    "the tokens of the node outside its items: the keyword and the commas",
  )
  for (const item of entriesOf(node, "items")) {
    if (item !== null) {
      checkTokenKinds(reading, item, ["Identifier"], "an item of a list")
    }
    reading.problems.expect(
      !textOf(item, "name").includes(","),
      where,
      `the item ${JSON.stringify(textOf(item, "name"))} holds a \`,\`, which separates items`,
    )
  }
}

/**
 * The stretches between `lowers` and `uppers` (the end of a separator and the
 * start of the next one, or of the end of the list) hold the entries of
 * `list`, one for each, in order: an entry is null where only whitespace lies
 * in its stretch, and otherwise it runs from the first character of the
 * stretch that is not whitespace to the last (ast/gantt.md, GanttTaskStatement
 * and GanttClickStatement).
 */
function checkStretches(
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

/**
 * ast/gantt.md, GanttTaskStatement: the node writes a `:` and the `,` units of
 * its data; the description is the text before the colon, the whitespace
 * before it included; the tags and the items together are the stretches of the
 * data between the colon, the commas, and the end of the line, one more than
 * there are commas, an empty stretch a null item; the tags are the front items
 * that are one of five words, so the first item is none of them, and `items`
 * is empty only when the data holds tags only, which is rejected.
 */
function checkTask(reading: Reading, node: CheckedNode, own: Own): void {
  const where = label(node)
  const description = childOf(node, "description")
  const tags = entriesOf(node, "tags")
  const items = entriesOf(node, "items")
  const commas = offsetsOf(own, ",")
  reading.problems.expectEqual(
    own.text,
    `:${",".repeat(commas.length)}`,
    where,
    "the tokens of the node outside its child nodes: a colon and the commas",
  )
  const colon = own.characters[0]?.offset
  if (description !== null && colon !== undefined) {
    reading.problems.expectEqual(
      between(reading, description.range[1], colon),
      "",
      where,
      "the written text between the description and the colon",
    )
  }
  const descriptionValue = textOf(description)
  reading.problems.expect(
    !startsWithWhitespace(descriptionValue),
    where,
    `the description starts with whitespace: ${JSON.stringify(descriptionValue)}`,
  )
  const separators = own.characters.map((character) => character.offset)
  checkStretches(
    reading,
    node,
    [...tags, ...items],
    separators.map((offset, index): TreeRange => [
      offset + 1,
      separators[index + 1] ?? node.range[1],
    ]),
    "the item",
  )
  for (const tag of tags) {
    // A tag is a `data-item` unit, a text unit, although its node is an
    // Identifier.
    if (tag !== null) checkTokenKinds(reading, tag, ["RawText"], "a tag")
    reading.problems.expect(
      TAG_WORDS.includes(textOf(tag, "name")),
      where,
      `the tag ${JSON.stringify(textOf(tag, "name"))} is none of ${TAG_WORDS.join(", ")}, in exactly this case`,
    )
  }
  reading.problems.expect(
    items.length > 0,
    where,
    "the items are empty, which only data of tags only has, and that is rejected",
  )
  const first = items[0]
  reading.problems.expect(
    first === undefined || first === null || !TAG_WORDS.includes(textOf(first)),
    where,
    `the first item ${JSON.stringify(textOf(first ?? null))} is a tag word, which the tags would hold`,
  )
  for (const item of items) {
    if (item === null) continue
    const value = textOf(item)
    reading.problems.expect(
      !startsWithWhitespace(value) && !endsWithWhitespace(value),
      where,
      `the item ${JSON.stringify(value)} starts or ends with whitespace`,
    )
  }
}

/**
 * ast/gantt.md, GanttClickStatement: the node writes `click`, the `,` units of
 * its ids, and the `href` of a link part; the ids are the stretches between
 * `click`, the commas, and the first part, one more than there are commas, an
 * empty stretch a null id, and an id holds no `,`; at least one of the call
 * and the link is not null; the URL is never empty and always closed.
 */
function checkClick(reading: Reading, node: CheckedNode, own: Own): void {
  const where = label(node)
  const call = childOf(node, "call")
  const href = childOf(node, "href")
  const ids = entriesOf(node, "ids")
  const commas = offsetsOf(own, ",")
  reading.problems.expect(
    call !== null || href !== null,
    where,
    "call and href are both null",
  )
  reading.problems.expectEqual(
    own.text.toLowerCase(),
    `click${",".repeat(commas.length)}${href === null ? "" : "href"}`,
    where,
    "the tokens of the node outside its child nodes: `click`, the commas, and `href` where there is a link",
  )
  const keyword = own.tokens[0]
  const hrefKeyword = href === null ? undefined : own.tokens.at(-1)
  if (keyword !== undefined) {
    const partStart = Math.min(
      call?.range[0] ?? node.range[1],
      hrefKeyword?.range[0] ?? node.range[1],
    )
    const lowers = [keyword.range[1], ...commas.map((offset) => offset + 1)]
    checkStretches(
      reading,
      node,
      ids,
      lowers.map((lower, index): TreeRange => [
        lower,
        commas[index] ?? partStart,
      ]),
      "the id",
    )
  }
  for (const id of ids) {
    if (id !== null) checkTokenKinds(reading, id, ["Identifier"], "an id")
    reading.problems.expect(
      !textOf(id, "name").includes(","),
      where,
      `the id ${JSON.stringify(textOf(id, "name"))} holds a \`,\`, which separates ids`,
    )
  }
  if (href !== null && hrefKeyword !== undefined) {
    const gap = between(reading, hrefKeyword.range[1], href.range[0])
    reading.problems.expect(
      gap !== "" && isBlank(gap),
      where,
      `the written text between \`href\` and the URL is ${JSON.stringify(gap)}, not whitespace`,
    )
    reading.problems.expect(
      href.closed === true && textOf(href) !== "",
      label(href),
      "the URL is empty or not closed",
    )
    // positions/gantt.md, GanttClickStatement: the link runs from the opening
    // `"` to the closing one.
    const raw = typeof href.raw === "string" ? href.raw : ""
    reading.problems.expect(
      raw.startsWith('"') && raw.endsWith('"'),
      label(href),
      `the link does not run from \`"\` to \`"\`: ${JSON.stringify(raw)}`,
    )
    checkStringTokens(
      reading,
      nodeTokensIn(reading.root, href.range),
      label(href),
    )
  }
}

/**
 * ast/gantt.md, GanttCallback: the name is the text between the whitespace
 * after `call` and the `(`, the whitespace and line feeds before the `(`
 * included; the arguments are the text between the parentheses, the
 * whitespace at its ends included, and null when only whitespace lies between
 * them. The name holds no `(` and the arguments no `)`, the characters that
 * end them.
 */
function checkCallback(reading: Reading, node: CheckedNode, own: Own): void {
  const where = label(node)
  const name = childOf(node, "name")
  const args = childOf(node, "args")
  const open = offsetsOf(own, "(")[0]
  const close = offsetsOf(own, ")").at(-1)
  const keyword = own.tokens[0]
  if (name !== null && keyword !== undefined) {
    const gap = between(reading, keyword.range[1], name.range[0])
    reading.problems.expect(
      gap !== "" && isBlank(gap),
      where,
      `the written text between \`call\` and the name is ${JSON.stringify(gap)}, not whitespace`,
    )
  }
  if (name !== null && open !== undefined) {
    reading.problems.expectEqual(
      between(reading, name.range[1], open),
      "",
      where,
      "the written text between the name and the `(`",
    )
  }
  reading.problems.expect(
    !textOf(name).includes("("),
    where,
    `the name ${JSON.stringify(textOf(name))} holds a \`(\``,
  )
  reading.problems.expect(
    !startsWithWhitespace(textOf(name)),
    where,
    `the name starts with whitespace: ${JSON.stringify(textOf(name))}`,
  )
  if (open === undefined || close === undefined) return
  if (args === null) {
    const inside = between(reading, open + 1, close)
    reading.problems.expect(
      isBlank(inside),
      where,
      `args is null, but the parentheses hold ${JSON.stringify(inside)}`,
    )
    return
  }
  reading.problems.expectEqual(
    [
      between(reading, open + 1, args.range[0]),
      between(reading, args.range[1], close),
    ],
    ["", ""],
    where,
    "the written text between the parentheses and the arguments",
  )
  reading.problems.expect(
    !isBlank(textOf(args)) && !textOf(args).includes(")"),
    where,
    `the arguments ${JSON.stringify(textOf(args))} are whitespace only, or hold a \`)\``,
  )
}

/**
 * Whether `value` is the written text of a GanttIgnoredStatement: `href`,
 * whitespace, and two quotes; or `call`, whitespace, `(`, whitespace only, and
 * `)`, with the keyword in any case (diagrams/gantt.md, Empty hrefs and empty
 * calls).
 */
function isIgnoredStatementText(value: string): boolean {
  const keyword = value.slice(0, 4).toLowerCase()
  if (keyword !== "href" && keyword !== "call") return false
  let at = 4
  while (at < value.length && isWhitespace(value.charCodeAt(at))) at++
  if (at === 4) return false
  const rest = value.slice(at)
  if (keyword === "href") return rest === '""'
  return (
    rest.startsWith("(") && rest.endsWith(")") && isBlank(rest.slice(1, -1))
  )
}

/** Whether two lists of token types and values are the same. */
function isEqual(
  actual: readonly (readonly string[])[],
  expected: readonly (readonly string[])[],
): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

/**
 * ast/gantt.md, GanttIgnoredStatement: its value runs from the keyword to the
 * closing quote or parenthesis, an empty href or an empty call. Its tokens
 * (parser/docs/tokens/gantt.md, Tokens): the `Keyword` token of its keyword
 * and, for an empty href, the `String` token `""` (the two `StringFragment`
 * tokens `"` and `"` where a directive cuts it), or, for an empty call, the `Punctuator` tokens
 * `(` and `)`.
 */
function checkIgnoredStatement(reading: Reading, node: CheckedNode): void {
  const value = textOf(node)
  const where = label(node)
  reading.problems.expect(
    isIgnoredStatementText(value),
    where,
    `the value ${JSON.stringify(value)} is no \`href\` and an empty string, or \`call\` and empty parentheses`,
  )
  const [keyword, ...rest] = nodeTokensIn(reading.root, node.range)
  reading.problems.expectEqual(
    [keyword?.type, keyword?.value.toLowerCase()],
    ["Keyword", value.slice(0, 4).toLowerCase()],
    where,
    "the first token, the keyword",
  )
  if (value.slice(0, 4).toLowerCase() === "href") {
    // The string `""` is one `String` token, or the two `StringFragment`
    // tokens `"` and `"` where a directive or an ignored `;` lies between the
    // quotes.
    const written = rest.map((token) => [token.type, token.value])
    reading.problems.expect(
      isEqual(written, [["String", '""']]) ||
        isEqual(written, [
          ["StringFragment", '"'],
          ["StringFragment", '"'],
        ]),
      where,
      `the tokens after the keyword are not the String \`""\` or the two StringFragments \`"\`: ${JSON.stringify(written)}`,
    )
  } else {
    reading.problems.expectEqual(
      rest.map((token) => [token.type, token.value]),
      [
        ["Punctuator", "("],
        ["Punctuator", ")"],
      ],
      where,
      "the tokens after the keyword",
    )
  }
}

/**
 * Checks what the gantt documents state about a gantt tree beyond the
 * conditions of every tree (ast.md): the tokens of values lie in value nodes,
 * the tokens that a node writes itself are those of its grammar rule, and the
 * fields that they write are what they write: the day of a weekday statement,
 * the tags, items, and ids as the stretches between the separators, the call
 * and the link of a click statement, and where the values of the statements
 * begin and end with respect to their keywords.
 */
export function checkGanttTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  checkTokensInValueNodes(root, problems)
  const reading: Reading = {
    root,
    text,
    written: new WrittenText(text, root),
    problems,
  }
  for (const node of nodesOf(root)) {
    if (!node.type.startsWith("Gantt")) continue
    if (node.type === "GanttLiteral") {
      problems.expect(
        textOf(node) !== "",
        label(node),
        "the value of a GanttLiteral is empty",
      )
      // A text unit, which a directive may cut into several tokens.
      checkTokenKinds(reading, node, ["RawText"], "a GanttLiteral")
      continue
    }
    if (node.type === "GanttIgnoredStatement") {
      checkIgnoredStatement(reading, node)
      continue
    }
    const own = ownOf(root, node)
    checkOwnKinds(reading, node, own)
    checkOwnText(reading, node, own)
    if (node.type !== "GanttDiagram") checkRangeIsHull(reading, node, own)
    switch (node.type) {
      case "GanttTaskStatement":
        checkTask(reading, node, own)
        break
      case "GanttClickStatement":
        checkClick(reading, node, own)
        break
      case "GanttCallback":
        checkCallback(reading, node, own)
        break
      case "GanttDateFormatStatement":
      case "GanttAxisFormatStatement":
      case "GanttTickIntervalStatement":
      case "GanttTodayMarkerStatement":
      case "GanttTitleStatement":
      case "GanttSectionStatement":
        checkTextAfterKeyword(reading, node, own)
        break
      case "GanttIncludesStatement":
      case "GanttExcludesStatement":
        checkList(reading, node, own)
        break
      case "GanttWeekdayStatement":
      case "GanttWeekendStatement":
        checkDay(reading, node, own)
        break
      case "GanttAccTitleStatement":
      case "GanttAccDescrStatement":
        checkAccessibilityLine(reading, node, own)
        checkTrimmedValue(
          reading,
          node,
          childOf(node, "value"),
          "the value of an accessibility statement",
        )
        break
      case "GanttAccDescrBlockStatement":
        checkAccessibilityBlock(reading, node, own)
        checkTrimmedValue(
          reading,
          node,
          childOf(node, "value"),
          "the value of a description block",
        )
        break
      default:
        break
    }
  }
}
