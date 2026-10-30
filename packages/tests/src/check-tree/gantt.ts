import type { TreeRange } from "../db-from-tree/tree.ts"
import type { Problems } from "./problems.ts"
import { label } from "./problems.ts"
import {
  between,
  checkAccessibilityBlock,
  checkAccessibilityLine,
  checkJoinedOwnText,
  checkOwnKinds,
  checkRangeIsHull,
  checkStretches,
  checkTextAfter,
  checkTokenKinds,
  checkTrimmedValue,
  childOf,
  endsWithWhitespace,
  entriesOf,
  isBlank,
  offsetsOf,
  ownOf,
  readingOf,
  startsWithWhitespace,
  textOf,
} from "./statement-checks.ts"
import type { Own, Reading, TextAfterKeyword } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { nodesOf } from "./walk.ts"

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

/**
 * ast/gantt.md, GanttDiagram and the nodes below, and diagrams/gantt.md,
 * Grammar: the tokens that a node writes itself, outside its child nodes, are
 * the ones that its grammar rule names (the table {@link OWN_TEXTS}). The
 * header of the diagram is `gantt` in exactly this case (Detection).
 */
function checkOwnText(reading: Reading, node: CheckedNode, own: Own): void {
  const expected = OWN_TEXTS[node.type]
  if (expected === undefined) return
  checkJoinedOwnText(reading, node, own, expected, node.type !== "GanttDiagram")
}

/**
 * ast/gantt.md, GanttDateFormatStatement and the statements of its kind, and
 * diagrams/gantt.md, The statement context: the text follows the keyword (see
 * {@link TEXT_AFTER_KEYWORD}).
 */
function checkTextAfterKeyword(
  reading: Reading,
  node: CheckedNode,
  own: Own,
): void {
  const rule = TEXT_AFTER_KEYWORD[node.type]
  if (rule !== undefined) checkTextAfter(reading, node, own, rule)
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
  const reading = readingOf(text, root, problems)
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
    const own = ownOf(root, node)
    checkOwnKinds(reading, node, own, OWN_PUNCTUATORS)
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
