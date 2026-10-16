import { isWhitespace, isWordCharacter } from "../db-from-tree/characters.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import { checkChildTypes, checkListsWithAnEntry } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import type { Problems } from "./problems.ts"
import { label } from "./problems.ts"
import {
  between,
  checkJoinedOwnText,
  checkOwnKinds,
  checkRangeIsHull,
  checkTokenKinds,
  childOf,
  entriesOf,
  nextWrittenCharacter,
  ownOf,
  readingOf,
  restOfLineIsBlank,
  textOf,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

// ast/timeline.md and diagrams/timeline.md: what the timeline documents state
// about the tree beyond the conditions of every tree (ast.md): the fields of the
// nodes, the texts around the leaves, and the order of the statements.
// parser/docs/tokens/timeline.md and parser/docs/positions/timeline.md: the
// tokens that a node writes itself, their kinds, the kinds of the tokens of a
// value, and the ranges of the nodes and of the statements.

/** ast/timeline.md, TimelineStatement: the node types of the statements of the body. */
const STATEMENTS: readonly string[] = [
  "TimelinePeriodStatement",
  "TimelineEventStatement",
  "TimelineTitleStatement",
  "TimelineSectionStatement",
  "TimelineAccTitleStatement",
  "TimelineAccDescrStatement",
  "TimelineAccDescrBlockStatement",
]

/**
 * ast/timeline.md: the node types that a field of a node type holds, as the
 * Type column of its table gives them; a field that holds a value is not in
 * it. `tests/check-tree-timeline.test.ts` requires the table to be that
 * column.
 */
export const TIMELINE_CHILD_TYPES: FieldTable<readonly string[]> = {
  TimelineDiagram: { body: STATEMENTS },
  TimelinePeriodStatement: {
    period: ["TimelineLiteral"],
    events: ["TimelineLiteral"],
  },
  TimelineEventStatement: { events: ["TimelineLiteral"] },
  TimelineTitleStatement: { value: ["TimelineLiteral"] },
  TimelineSectionStatement: { name: ["TimelineLiteral"] },
  TimelineAccTitleStatement: { value: ["TimelineLiteral"] },
  TimelineAccDescrStatement: { value: ["TimelineLiteral"] },
  TimelineAccDescrBlockStatement: { value: ["TimelineLiteral"] },
}

/**
 * ast/timeline.md, TimelineDiagram: the directions, which the field
 * `direction` has in any case. `tests/check-tree-timeline.test.ts` requires the
 * list to be the words that the Meaning column gives.
 */
export const TIMELINE_DIRECTIONS: readonly string[] = ["LR", "TD"]

/**
 * parser/docs/tokens/timeline.md, Tokens: the texts of the `Punctuator` tokens
 * that a node writes itself; every other token that a node writes itself is a
 * `Keyword` token (the header, the direction, and the keywords).
 */
export const TIMELINE_PUNCTUATORS: readonly string[] = [":", "{", "}"]

/** ast/timeline.md, TimelineEventStatement: the lists of a node type that are never empty. */
const LISTS_WITH_AN_ENTRY: Readonly<Record<string, readonly string[]>> = {
  TimelineEventStatement: ["events"],
}

/** The keywords of the statements, in lower case (diagrams/timeline.md, The statement context). */
const TIMELINE_KEYWORD = "timeline"
const TITLE_KEYWORD = "title"
const SECTION_KEYWORD = "section"
const ACC_TITLE_KEYWORD = "acctitle"
const ACC_DESCR_KEYWORD = "accdescr"

/** The text `text` with the letters A to Z in lower case: the lexer compares letters case-insensitively, and only those of ASCII. */
function lowerCased(text: string): string {
  let lower = ""
  for (const character of text) {
    lower +=
      character >= "A" && character <= "Z" ? character.toLowerCase() : character
  }
  return lower
}

/** Whether `text` holds a line terminator (a line feed or a CR). */
function holdsLineTerminator(text: string): boolean {
  return text.includes("\n") || text.includes("\r")
}

/**
 * The offset after the one whitespace character at `offset`, a CRLF as one
 * (common.md, Line terminators); none where there is no whitespace character
 * there.
 */
function afterOneWhitespace(text: string, offset: number): number | undefined {
  if (text.startsWith("\r\n", offset)) return offset + 2
  const code = text.charCodeAt(offset)
  return Number.isNaN(code) || !isWhitespace(code) ? undefined : offset + 1
}

/** The offset after the whitespace characters from `offset` on. */
function afterWhitespace(text: string, offset: number): number {
  let end = offset
  while (end < text.length && isWhitespace(text.charCodeAt(end))) end++
  return end
}

/**
 * diagrams/timeline.md, The statement context: the statement unit that the text
 * `text` starts with, in the rules that come before the rule of a period (rules
 * 1 to 13), or none. `text` runs on past the end of the period: the whitespace
 * after `title`, `section`, `accTitle:`, and `accDescr` can be a line feed, so
 * whether a unit starts depends on the lines after it. A period starts with
 * none of them.
 */
function unitStartingWith(text: string): string | undefined {
  const lower = lowerCased(text)
  if (lower.startsWith("%") && !lower.startsWith("%{")) return "a comment"
  if (
    lower.startsWith(TIMELINE_KEYWORD) &&
    !isWordCharacter(lower.charCodeAt(TIMELINE_KEYWORD.length))
  ) {
    return `the keyword ${TIMELINE_KEYWORD}`
  }
  for (const keyword of [TITLE_KEYWORD, SECTION_KEYWORD]) {
    if (!lower.startsWith(keyword)) continue
    const next = afterOneWhitespace(lower, keyword.length)
    const character = next === undefined ? undefined : lower.charAt(next)
    if (
      character !== undefined &&
      character !== "" &&
      !holdsLineTerminator(character) &&
      !(keyword === SECTION_KEYWORD && character === ":")
    ) {
      return `a ${keyword} statement`
    }
  }
  if (lower.startsWith(ACC_TITLE_KEYWORD)) {
    const colon = afterWhitespace(lower, ACC_TITLE_KEYWORD.length)
    if (lower.charAt(colon) === ":") return "an accTitle statement"
  }
  if (lower.startsWith(ACC_DESCR_KEYWORD)) {
    const mark = afterWhitespace(lower, ACC_DESCR_KEYWORD.length)
    if (lower.charAt(mark) === ":" || lower.charAt(mark) === "{") {
      return "an accDescr statement"
    }
  }
  return undefined
}

/**
 * Whether `text` holds a `#` that ends a period: a `#` that starts no entity.
 * An entity, a `#`, one or more word characters, and a `;`, is read as a
 * placeholder before the lexer reads the text, and its characters are no `#`
 * (common.md, Entities).
 */
function holdsCommentMark(text: string): boolean {
  for (
    let index = text.indexOf("#");
    index !== -1;
    index = text.indexOf("#", index + 1)
  ) {
    let end = index + 1
    while (isWordCharacter(text.charCodeAt(end))) end++
    if (end === index + 1 || text.charAt(end) !== ";") return true
  }
  return false
}

/**
 * Whether the written text before `offset` ends with `keyword` (in any case)
 * and one whitespace character, a CRLF as one: where the text of a `title` or
 * a `section` statement starts.
 */
function followsKeywordAndOneWhitespace(
  reading: Reading,
  offset: number,
  keyword: string,
): boolean {
  const before = reading.written.of([0, offset])
  const end = before.endsWith("\r\n") ? before.length - 2 : before.length - 1
  const character = before.charAt(before.length - 1)
  if (
    end < 0 ||
    !(before.endsWith("\r\n") || isWhitespace(character.charCodeAt(0)))
  ) {
    return false
  }
  return (
    lowerCased(before.slice(Math.max(0, end - keyword.length), end)) === keyword
  )
}

/**
 * Whether the written text before `offset` ends with `keyword` (in any case),
 * whitespace, line feeds included, the character `mark`, and whitespace: where
 * the text of an accessibility statement starts.
 */
function followsKeywordAndMark(
  reading: Reading,
  offset: number,
  keyword: string,
  mark: string,
): boolean {
  const before = reading.written.of([0, offset])
  let end = before.length
  while (end > 0 && isWhitespace(before.charCodeAt(end - 1))) end--
  if (!before.slice(0, end).endsWith(mark)) return false
  end -= mark.length
  while (end > 0 && isWhitespace(before.charCodeAt(end - 1))) end--
  return (
    lowerCased(before.slice(Math.max(0, end - keyword.length), end)) === keyword
  )
}

/** The ranges of the diagram comments, which the gaps between statements may hold. */
function commentRanges(reading: Reading): TreeRange[] {
  return reading.root.comments.map((comment) => comment.range)
}

/**
 * The written text between `from` and `to`, without the diagram comments: what
 * lies between two statements or two units.
 */
function gapText(reading: Reading, from: number, to: number): string {
  return reading.written.of([from, to], commentRanges(reading))
}

/** Whether `text` is whitespace only. */
function isBlankText(text: string): boolean {
  return afterWhitespace(text, 0) === text.length
}

/** Whether `gap` is whitespace, a `:`, and one whitespace character, a CRLF as one: what lies before an event. */
function isGapBeforeEvent(gap: string): boolean {
  const colon = afterWhitespace(gap, 0)
  if (gap.charAt(colon) !== ":") return false
  const rest = gap.slice(colon + 1)
  return (
    rest === "\r\n" || (rest.length === 1 && isWhitespace(rest.charCodeAt(0)))
  )
}

/**
 * diagrams/timeline.md, The statement context, rule 13, and ast/timeline.md,
 * TimelinePeriodStatement: an event is the text after a `:` and one whitespace
 * character, up to a `:` that whitespace follows or the end of the line. It is
 * never empty and holds no line terminator; a `:` in it has a character that is
 * no whitespace after it. Nothing but whitespace and diagram comments lies
 * between it and the end of the item before it (the period, the event, or the
 * statement) but the `:` and the one whitespace character.
 */
function checkEvents(
  reading: Reading,
  node: CheckedNode,
  events: readonly (CheckedNode | null)[],
  previousEnd: number,
): void {
  const where = label(node)
  let end = previousEnd
  for (const event of events) {
    if (event === null) continue
    const value = textOf(event)
    reading.problems.expect(value !== "", label(event), "the event is empty")
    reading.problems.expect(
      !holdsLineTerminator(value),
      label(event),
      `the event ${JSON.stringify(value)} holds a line terminator, which ends it`,
    )
    for (
      let index = value.indexOf(":");
      index !== -1;
      index = value.indexOf(":", index + 1)
    ) {
      const next = value.charAt(index + 1)
      reading.problems.expect(
        next !== "" && !isWhitespace(next.charCodeAt(0)),
        label(event),
        `the event ${JSON.stringify(value)} holds a \`:\` that no character other than whitespace follows, which starts the next event`,
      )
    }
    const gap = gapText(reading, end, event.range[0])
    reading.problems.expect(
      isGapBeforeEvent(gap),
      where,
      `the written text before the event ${JSON.stringify(value)}, after the item before it, is ${JSON.stringify(gap)}, not whitespace, a \`:\`, and one whitespace character`,
    )
    const next = nextWrittenCharacter(reading, event.range[1])
    reading.problems.expect(
      next === undefined || next === ":" || holdsLineTerminator(next),
      label(event),
      `the event ends before ${JSON.stringify(next)}, which does not end it: an event runs to a \`:\`, to the end of its line, or to the end of the text`,
    )
    end = event.range[1]
  }
}

/**
 * diagrams/timeline.md, The statement context, rule 14, and ast/timeline.md,
 * TimelinePeriodStatement: a period is never empty; it starts with no
 * whitespace, holds none of `#`, `:`, and a line terminator, and runs to a `#`,
 * a `:`, the end of its line, or the end of the text; and the text from its
 * start on, as the lexer reads it, starts with no unit of a rule before the rule
 * of a period, also where that unit runs over the lines after the period.
 */
function checkPeriod(reading: Reading, node: CheckedNode): void {
  const period = childOf(node, "period")
  if (period === null) return
  const where = label(period)
  const value = textOf(period)
  reading.problems.expect(value !== "", where, "the period is empty")
  reading.problems.expect(
    value === "" || !isWhitespace(value.charCodeAt(0)),
    where,
    `the period ${JSON.stringify(value)} starts with whitespace, which is the indentation`,
  )
  reading.problems.expect(
    !holdsCommentMark(value),
    where,
    `the period ${JSON.stringify(value)} holds "#", which ends a period`,
  )
  for (const character of [":", "\n", "\r"]) {
    reading.problems.expect(
      !value.includes(character),
      where,
      `the period ${JSON.stringify(value)} holds ${JSON.stringify(character)}, which ends a period`,
    )
  }
  const unit = unitStartingWith(
    reading.written.of([period.range[0], reading.text.length]),
  )
  reading.problems.expect(
    unit === undefined,
    where,
    `the period ${JSON.stringify(value)} starts with ${unit}, which a rule before the rule of a period reads`,
  )
  const next = nextWrittenCharacter(reading, period.range[1])
  reading.problems.expect(
    next === undefined ||
      next === "#" ||
      next === ":" ||
      holdsLineTerminator(next),
    where,
    `the period ends before ${JSON.stringify(next)}, which does not end it: a period runs to a \`#\`, a \`:\`, the end of its line, or the end of the text`,
  )
}

/**
 * ast/timeline.md, TimelineTitleStatement and TimelineSectionStatement:
 * the text of a statement starts after its keyword and one whitespace
 * character, a line feed included. A title text runs to the end of its line; a
 * section text to a `:` or the end of its line, so it holds no `:`; neither
 * is empty or holds a line terminator.
 */
function checkTextOfKeyword(
  reading: Reading,
  node: CheckedNode,
  field: string,
  keyword: string,
): void {
  const text = childOf(node, field)
  if (text === null) return
  const where = label(node)
  const value = textOf(text)
  reading.problems.expect(value !== "", where, `the ${field} is empty`)
  reading.problems.expect(
    !holdsLineTerminator(value),
    where,
    `the ${field} ${JSON.stringify(value)} holds a line terminator, which ends it`,
  )
  reading.problems.expect(
    followsKeywordAndOneWhitespace(reading, text.range[0], keyword),
    where,
    `the ${field} does not follow the keyword ${keyword} and one whitespace character`,
  )
  const next = nextWrittenCharacter(reading, text.range[1])
  if (keyword === SECTION_KEYWORD) {
    reading.problems.expect(
      !value.includes(":"),
      where,
      `the name ${JSON.stringify(value)} holds a \`:\`, which ends the name of a section`,
    )
    reading.problems.expect(
      next === undefined || next === ":" || holdsLineTerminator(next),
      where,
      `the name ends before ${JSON.stringify(next)}, which does not end it: a name runs to a \`:\`, to the end of its line, or to the end of the text`,
    )
  } else {
    reading.problems.expect(
      next === undefined || holdsLineTerminator(next),
      where,
      `the value ends before ${JSON.stringify(next)}, which does not end its line: a title runs to the end of its line`,
    )
  }
}

/**
 * ast/timeline.md, TimelineAccTitleStatement and TimelineAccDescrStatement:
 * the text follows the keyword, a `:`, and the whitespace after it, line feeds
 * included, and runs to the end of its line, without the whitespace at its
 * ends. It is never empty.
 */
function checkAccessibilityLine(
  reading: Reading,
  node: CheckedNode,
  keyword: string,
): void {
  const text = childOf(node, "value")
  if (text === null) return
  const where = label(node)
  const value = textOf(text)
  reading.problems.expect(value !== "", where, "the value is empty")
  reading.problems.expect(
    !holdsLineTerminator(value),
    where,
    `the value ${JSON.stringify(value)} holds a line terminator, which ends it`,
  )
  reading.problems.expect(
    value === "" ||
      (!isWhitespace(value.charCodeAt(0)) &&
        !isWhitespace(value.charCodeAt(value.length - 1))),
    where,
    `the value ${JSON.stringify(value)} starts or ends with whitespace, which is not part of it`,
  )
  reading.problems.expect(
    followsKeywordAndMark(reading, text.range[0], keyword, ":"),
    where,
    `the value does not follow the keyword ${keyword}, a \`:\`, and whitespace`,
  )
  reading.problems.expect(
    restOfLineIsBlank(reading, text.range[1]),
    where,
    "the value does not run to the end of its line",
  )
}

/**
 * ast/timeline.md, TimelineAccDescrBlockStatement: the text of a block lies
 * between `accDescr {` and `}`, without the whitespace at its ends, and holds
 * no `}`; a block with only whitespace between its braces has no text, and its
 * written text is the keyword, `{`, whitespace, and `}`.
 */
function checkAccessibilityBlock(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  const text = childOf(node, "value")
  if (text === null) {
    const written = between(reading, node.range[0], node.range[1])
    const lower = lowerCased(written)
    const open = lower.startsWith(ACC_DESCR_KEYWORD)
      ? afterWhitespace(lower, ACC_DESCR_KEYWORD.length)
      : -1
    reading.problems.expect(
      open !== -1 &&
        lower.charAt(open) === "{" &&
        lower.slice(afterWhitespace(lower, open + 1)) === "}",
      where,
      `the written text ${JSON.stringify(written)} of a block without text is not the keyword accDescr, \`{\`, whitespace, and \`}\``,
    )
    return
  }
  const value = textOf(text)
  reading.problems.expect(value !== "", where, "the value is empty")
  reading.problems.expect(
    !value.includes("}"),
    where,
    `the value ${JSON.stringify(value)} holds a \`}\`, which closes the block`,
  )
  reading.problems.expect(
    value === "" ||
      (!isWhitespace(value.charCodeAt(0)) &&
        !isWhitespace(value.charCodeAt(value.length - 1))),
    where,
    `the value ${JSON.stringify(value)} starts or ends with whitespace, which is not part of it`,
  )
  reading.problems.expect(
    followsKeywordAndMark(reading, text.range[0], ACC_DESCR_KEYWORD, "{"),
    where,
    "the value does not follow the keyword accDescr, a `{`, and whitespace",
  )
  const closing = gapText(reading, text.range[1], node.range[1])
  reading.problems.expect(
    closing.endsWith("}") && isBlankText(closing.slice(0, -1)),
    where,
    `the written text after the value is ${JSON.stringify(closing)}, not whitespace and the closing \`}\``,
  )
}

/**
 * ast/timeline.md, TimelineDiagram: the direction is `LR` or `TD`, in any
 * case, or null.
 */
function checkDirection(reading: Reading, node: CheckedNode): void {
  const direction = node.direction
  if (direction === null || direction === undefined) return
  reading.problems.expect(
    typeof direction === "string" &&
      TIMELINE_DIRECTIONS.includes(direction.toUpperCase()),
    label(node),
    `the direction is ${JSON.stringify(direction)}, none of ${TIMELINE_DIRECTIONS.join(", ")} in any case`,
  )
}

/**
 * ast/timeline.md, TimelineEventStatement and TimelinePeriodStatement: the
 * events that follow one another with nothing between them but whitespace, line
 * breaks, and comments are the events of one statement, and the first of them
 * belongs to the period statement before them. So an event statement follows
 * a statement that is no period statement and no event statement, and some
 * period statement lies before it (an event statement before every period
 * makes the input rejected).
 */
function checkEventStatements(
  reading: Reading,
  statements: readonly (CheckedNode | null)[],
): void {
  let periods = 0
  for (const [index, statement] of statements.entries()) {
    if (statement === null) continue
    if (statement.type === "TimelinePeriodStatement") {
      periods++
      continue
    }
    if (statement.type !== "TimelineEventStatement") continue
    const before = statements[index - 1]
    reading.problems.expect(
      before !== undefined &&
        before !== null &&
        before.type !== "TimelinePeriodStatement" &&
        before.type !== "TimelineEventStatement",
      label(statement),
      "follows a period statement or an event statement, or starts the body, where its events would be those of the period statement",
    )
    reading.problems.expect(
      periods > 0,
      label(statement),
      "comes before every period statement, which the input rejects",
    )
    checkEvents(
      reading,
      statement,
      entriesOf(statement, "events"),
      before?.range[1] ?? 0,
    )
  }
}

/**
 * diagrams/timeline.md, The statement context: the tokens that a node writes
 * itself, outside its child nodes, joined, by node type, and whether the case
 * of the letters is ignored since the keywords are read case-insensitively. The
 * header is `timeline` in exactly this case (Detection) and is followed by the
 * direction as written; a period statement and an event statement write the
 * `:` of each event; an accessibility statement writes its keyword and the `:`,
 * or the keyword and the braces.
 */
function ownTextOf(
  node: CheckedNode,
): { readonly text: string; readonly ignoresCase: boolean } | undefined {
  switch (node.type) {
    case "TimelineDiagram":
      return {
        text: `${TIMELINE_KEYWORD}${typeof node.direction === "string" ? node.direction : ""}`,
        ignoresCase: false,
      }
    case "TimelinePeriodStatement":
    case "TimelineEventStatement":
      return {
        text: ":".repeat(entriesOf(node, "events").length),
        ignoresCase: false,
      }
    case "TimelineTitleStatement":
      return { text: TITLE_KEYWORD, ignoresCase: true }
    case "TimelineSectionStatement":
      return { text: SECTION_KEYWORD, ignoresCase: true }
    case "TimelineAccTitleStatement":
      return { text: `${ACC_TITLE_KEYWORD}:`, ignoresCase: true }
    case "TimelineAccDescrStatement":
      return { text: `${ACC_DESCR_KEYWORD}:`, ignoresCase: true }
    case "TimelineAccDescrBlockStatement":
      return { text: `${ACC_DESCR_KEYWORD}{}`, ignoresCase: true }
    default:
      return undefined
  }
}

/**
 * parser/docs/tokens/timeline.md, Tokens, and parser/docs/positions/
 * timeline.md, Ranges: the tokens that a node writes itself are `Punctuator`
 * tokens for `:`, `{`, and `}` and `Keyword` tokens for the others; they are
 * those of the grammar rule of the node (see {@link ownTextOf}); the direction
 * of the diagram is the token after the header, or null where there is none;
 * the tokens of a text are `RawText` tokens; and the range of a node is the
 * hull of its tokens and child nodes.
 */
function checkTokensAndRange(reading: Reading, node: CheckedNode): void {
  if (node.type === "TimelineLiteral") {
    checkTokenKinds(reading, node, ["RawText"], "a TimelineLiteral")
    return
  }
  const expected = ownTextOf(node)
  if (expected === undefined) return
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, TIMELINE_PUNCTUATORS)
  checkRangeIsHull(reading, node, own)
  checkJoinedOwnText(reading, node, own, expected.text, expected.ignoresCase)
  if (node.type === "TimelineDiagram") {
    reading.problems.expectEqual(
      node.direction,
      own.tokens[1]?.value ?? null,
      label(node),
      "the direction of the header is not the token after the header keyword, or null when there is none",
    )
  }
}

/**
 * Checks what the timeline documents state about a timeline tree beyond the
 * conditions of every tree (ast.md): the tokens of values lie in value nodes;
 * the child nodes are of the types that the tables give; the direction is a
 * direction; the period, the events, the title, the section name, and the
 * accessibility texts are the units that their rules of the lexer read, with
 * the text around them that the rules read; and an event belongs to the period
 * statement before it.
 */
export function checkTimelineTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  checkTokensInValueNodes(root, problems)
  const reading = readingOf(text, root, problems)
  walkNodes(root, (node) => {
    checkTokensAndRange(reading, node)
    checkChildTypes(reading, node, TIMELINE_CHILD_TYPES)
    checkListsWithAnEntry(reading, node, LISTS_WITH_AN_ENTRY)
    switch (node.type) {
      case "TimelineDiagram":
        checkDirection(reading, node)
        checkEventStatements(reading, entriesOf(node, "body"))
        break
      case "TimelinePeriodStatement": {
        checkPeriod(reading, node)
        const period = childOf(node, "period")
        checkEvents(
          reading,
          node,
          entriesOf(node, "events"),
          period?.range[1] ?? node.range[0],
        )
        break
      }
      case "TimelineTitleStatement":
        checkTextOfKeyword(reading, node, "value", TITLE_KEYWORD)
        break
      case "TimelineSectionStatement":
        checkTextOfKeyword(reading, node, "name", SECTION_KEYWORD)
        break
      case "TimelineAccTitleStatement":
        checkAccessibilityLine(reading, node, ACC_TITLE_KEYWORD)
        break
      case "TimelineAccDescrStatement":
        checkAccessibilityLine(reading, node, ACC_DESCR_KEYWORD)
        break
      case "TimelineAccDescrBlockStatement":
        checkAccessibilityBlock(reading, node)
        break
      default:
        break
    }
  })
}
