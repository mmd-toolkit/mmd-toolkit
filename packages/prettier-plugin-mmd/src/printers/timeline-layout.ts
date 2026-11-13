import type {
  Node,
  TimelineAccDescrStatement,
  TimelineAccTitleStatement,
  TimelineEventStatement,
  TimelinePeriodStatement,
  TimelineSectionStatement,
  TimelineStatement,
  TimelineTitleStatement,
  Token,
} from "@mmd-toolkit/ast"
import { util } from "prettier"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { appendItems } from "./collections.ts"
import { readGap } from "./gap.ts"
import {
  findKeptBreaks,
  gapKeepsLineBreak,
  holdsJoiningRegion,
  spansKeptBreaks,
} from "./kept-lines.ts"
import type { TextEdit } from "./layout.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  keepFirstGapLineTails,
  keptAsWritten,
  replaceInAtoms,
  spansLinesThatCannotJoin,
  layoutDescriptionBlock,
  toAsciiLowerCase,
} from "./layout.ts"
import {
  accessibilityRules,
  collectTextEndEdits,
  trimTextAfterKeyword,
} from "./statement-rules.ts"
import type { Source } from "./source.ts"
import {
  findDirectiveEndingAt,
  findStructuralToken,
  findTriviaBetween,
  isSpaceOrTab,
  isWhitespace,
  skipDirectives,
} from "./source.ts"

/**
 * The node types of a timeline whose text is a value, printed as written:
 * the texts of the statements (periods, events, titles, sections,
 * accessibility texts). They have no child fields; `tests/value-nodes.test.ts`
 * checks that every other such node type is left out on purpose.
 */
export const timelineValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "TimelineLiteral",
])

/**
 * Whether a statement is a period that is the word `title` or `section`
 * alone, with no events and no whitespace after the word: the lexer reads it
 * as a period because no text follows the word on its line, and a line of
 * only a directive after it is an empty line once the directive is removed.
 * Whitespace before that directive would be the text of a title or a section
 * (diagrams/timeline.md, The statement context, Keywords and what follows
 * them; Trivia between units).
 */
export function isBareKeywordPeriod(statement: TimelineStatement): boolean {
  return (
    statement.type === "TimelinePeriodStatement" &&
    statement.events.length === 0 &&
    isKeywordWord(statement.period.value)
  )
}

/**
 * Whether the text is the word `title` or `section` in any case, which the
 * lexer reads as the keyword of a title or a section once whitespace follows
 * it: a period of that word touches its `:` (`title: x`), and a space before
 * the `:` would make the line a title with the text `: x`.
 */
function isKeywordWord(text: string): boolean {
  const word = toAsciiLowerCase(text)
  return word === "title" || word === "section"
}

/**
 * The layout of the line of the header: the keyword `timeline`, and the
 * direction after one space where there is one (docs/timeline.md, Header and
 * direction). The direction is the structural token after the keyword, which
 * the tree names in the `direction` field of the diagram.
 */
export function layoutTimelineHeader(
  source: Source,
  keyword: Token,
): AtomLayout {
  const { body } = source.root
  if (body.type !== "TimelineDiagram") {
    throw new Error("prettier-plugin-mmd: the header of a non-timeline diagram")
  }
  const atoms: Atom[] = [{ start: keyword.range[0], end: keyword.range[1] }]
  const rules = new Map<number, GapRule>()
  if (body.direction !== null) {
    const direction = expectToken(
      findStructuralToken(source, keyword.range[1]),
      "the direction of the header",
    )
    expectValue(direction, body.direction)
    atoms.push({ start: direction.range[0], end: direction.range[1] })
    rules.set(direction.range[0], "space")
  }
  return { atoms, rules, outdented: new Set(), lineBreaks: "kept" }
}

/**
 * Whether a statement stays on the line of the header, after its gap as
 * written: the first statement, when the header has a direction and the
 * statement starts on its line. A version of mermaid.js that counts and has no
 * direction reads the words after `timeline` as the text of a period,
 * so `timeline TD title T` is one period there and `timeline TD` followed by a
 * line `title T` is a period and a title; the text after a direction stays
 * where it is (docs/timeline.md, Header and direction).
 */
export function staysOnTimelineHeaderLine(
  source: Source,
  statement: TimelineStatement,
): boolean {
  const { body } = source.root
  if (
    body.type !== "TimelineDiagram" ||
    body.direction === null ||
    body.body[0] !== statement
  ) {
    return false
  }
  const keyword = expectToken(
    findStructuralToken(source, body.range[0]),
    "the header keyword",
  )
  const direction = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the direction of the header",
  )
  return !source.text
    .slice(direction.range[1], statement.range[0])
    .includes("\n")
}

/**
 * The layout of a statement, from its start to `end` (the end of its range).
 *
 * - A period with its events, and the events after another statement, keep
 *   the line breaks between the units: a period and an event keep their
 *   whitespace as their text, so no event moves from line to line. The later
 *   event colons align under the period's colon when it immediately follows
 *   the period on its line (docs/timeline.md, Periods and events). The line
 *   break that is the one whitespace character after the `:` of an event is
 *   not one of them (see `layoutEvents`).
 * - A title, a section, and an accessibility statement written over several
 *   lines stand on one line where the lexer reads the line break as
 *   whitespace, which it does only right after a keyword. Accessibility line
 *   trivia keeps its breaks with ordinary continuation columns; titles,
 *   sections, events and protected regions retain their original layout
 *   (docs/timeline.md, Multi-line statements).
 */
export function layoutTimelineStatement(
  source: Source,
  statement: TimelineStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  switch (statement.type) {
    case "TimelineAccDescrBlockStatement":
      return layoutDescriptionBlock(
        source,
        statement,
        end,
        timelineValueNodeTypes,
      )
    case "TimelinePeriodStatement":
    case "TimelineEventStatement":
      return layoutEvents(source, statement, end)
    default:
      break
  }
  if (startsTitleTextWithHashOnNextLine(source, statement)) {
    return keptAsWritten(start, end)
  }
  const keptBreaks = findKeptBreaks(source, start, end)
  const keepsLineBreaks = spansKeptBreaks(source, keptBreaks, start, end)
  const formatsTriviaLines =
    statement.type === "TimelineAccTitleStatement" ||
    statement.type === "TimelineAccDescrStatement"
  // Trivia prevents joining, but ordinary structural gaps still use atoms.
  // Value columns, semicolon lines and removed-line regions stay written.
  if (
    keepsLineBreaks &&
    (!formatsTriviaLines || holdsJoiningRegion(source, start, end))
  ) {
    return keptAsWritten(start, end)
  }
  const atoms = collectAtoms(
    source,
    start,
    end,
    collectValueNodes(statement, timelineValueNodeTypes),
    [],
  )
  trimTextAfterKeyword(
    source,
    atoms,
    statement.type === "TimelineTitleStatement" ? statement.value.range : null,
    true,
  )
  return {
    atoms: keepFirstGapLineTails(source, atoms, (from, to) =>
      gapKeepsLineBreak(source, keptBreaks, from, to),
    ),
    rules: textStatementRules(source, statement),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * Whether a title has its text on a later line than its keyword and the text
 * starts with `#` after whitespace on its line: `title`, a line break, an
 * indentation, and `# c`. The oldest version that counts has a title rule that
 * takes the whitespace of the next line as the text of the title when a `#`
 * follows it, so the `# c` is a comment there, while `title # c` on one line is
 * the period `title` and a comment. A `#` at the start of its line is no title
 * text there, and the title is the period `title` in both forms. The statement
 * stays as written (docs/timeline.md, Titles and sections;
 * docs/compatibility.md, Forms kept for versions of mermaid.js that count).
 */
function startsTitleTextWithHashOnNextLine(
  source: Source,
  statement: TimelineStatement,
): boolean {
  if (statement.type !== "TimelineTitleStatement") return false
  const text = source.text.slice(...statement.value.range)
  const hash = statement.value.range[0] + text.length - text.trimStart().length
  if (text.trimStart()[0] !== "#") return false
  const lineBreak = source.text.lastIndexOf("\n", hash)
  return lineBreak >= statement.range[0] && lineBreak + 1 < hash
}

/** The gap rules of a title, a section, or an accessibility statement. */
function textStatementRules(
  source: Source,
  statement:
    | TimelineTitleStatement
    | TimelineSectionStatement
    | TimelineAccTitleStatement
    | TimelineAccDescrStatement,
): Map<number, GapRule> {
  switch (statement.type) {
    case "TimelineTitleStatement":
      return new Map<number, GapRule>([[statement.value.range[0], "space"]])
    case "TimelineSectionStatement":
      return new Map<number, GapRule>([[statement.name.range[0], "space"]])
    case "TimelineAccTitleStatement":
    case "TimelineAccDescrStatement":
      return accessibilityRules(source, statement)
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
}

/**
 * The layout of a period with its events, or of events alone: the period and
 * the `:` and text of every event, with the gaps between them as written. A
 * period holds the whitespace before its `:`, and so does an event before the
 * next `:`; where a text has none, one space is added, except after the word
 * `title` or `section`. The text of an event stands after one space, whatever
 * whitespace character was the separator after the `:` (docs/timeline.md,
 * Periods and events).
 *
 * The separator may be a line break, with the text on the next line: that
 * line break is whitespace to the lexer, and the text moves to the line of
 * the `:`. A statement with such a line break, and a comment, a directive, or
 * a `;` in it, is kept as written (see `spansLinesThatCannotJoin`): the Db
 * keeps the whitespace at the start of an event, so a continuation line cannot
 * take the indentation that the other layouts give it.
 */
function layoutEvents(
  source: Source,
  statement: TimelinePeriodStatement | TimelineEventStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  const atoms = collectAtoms(
    source,
    start,
    end,
    collectValueNodes(statement, timelineValueNodeTypes),
    [],
  )
  const rules = new Map<number, GapRule>()
  const joinedBefore = new Set<number>()
  const alignedColons = new Set<number>()
  const lineEnds: Node[] = []
  let statementPadding: string | undefined =
    statement.type === "TimelineEventStatement" ? "" : undefined
  for (const event of statement.events) {
    const eventIndex = atoms.findIndex((atom) => atom.start === event.range[0])
    const colon = eventIndex < 1 ? undefined : atoms[eventIndex - 1]
    if (colon === undefined) {
      throw new Error(
        `prettier-plugin-mmd: no colon before the event at offset ${event.range[0]}`,
      )
    }
    // The text before the `:` gets one space where it ends without whitespace
    // and nothing stands between them (docs/timeline.md, Periods and events).
    const text = atoms[eventIndex - 2]
    const addsSpace =
      text !== undefined &&
      skipDirectives(source, text.end) === colon.start &&
      !isWhitespace(source.text[text.end - 1]) &&
      !(
        statement.type === "TimelinePeriodStatement" &&
        event === statement.events[0] &&
        isKeywordWord(statement.period.value)
      )
    if (addsSpace) rules.set(colon.start, "space")
    if (
      event === statement.events[0] &&
      statement.type === "TimelinePeriodStatement"
    ) {
      const writtenPeriod = source.text.slice(...statement.period.range)
      if (
        colon.start === statement.period.range[1] &&
        !staysOnTimelineHeaderLine(source, statement) &&
        !writtenPeriod.includes("\n") &&
        !writtenPeriod.includes("\u2028") &&
        !writtenPeriod.includes("\u2029")
      ) {
        // Keep tabs as tab stops and replace each remaining span by its display
        // width, so later colons align under the first one, which stands one
        // space further where that space is added (docs/timeline.md, Periods
        // and events).
        statementPadding =
          writtenPeriod
            .split("\t")
            .map((part) => " ".repeat(util.getStringWidth(part)))
            .join("\t") + (addsSpace ? " " : "")
      }
    } else if (statementPadding !== undefined) {
      alignedColons.add(colon.start)
    }
    if (readGap(source, colon.end, event.range[0], true).breaksLine) {
      joinedBefore.add(event.range[0])
    }
    const previous = statement.events[statement.events.indexOf(event) - 1]
    if (
      previous !== undefined &&
      readGap(source, previous.range[1], colon.start, true).breaksLine
    ) {
      lineEnds.push(previous)
    }
    rules.set(event.range[0], "space")
  }
  if (joinedBefore.size > 0 && spansLinesThatCannotJoin(source, start, end)) {
    return keptAsWritten(start, end)
  }
  const last = statement.events.at(-1)
  if (last !== undefined) lineEnds.push(last)
  trimEventEnds(source, atoms, lineEnds)
  return {
    atoms: atoms.map((atom) =>
      alignedColons.has(atom.start) ? { ...atom, statementPadding } : atom,
    ),
    rules,
    outdented: new Set(),
    lineBreaks: "kept",
    joinedBefore,
  }
}

/**
 * Leaves the spaces and tabs at the end of the events that end their line out
 * of what is printed: the last event of the statement, and an event that a line
 * break separates from the next `:`. mermaid.js keeps them in the Db as the end
 * of the event and draws the same text without them; the whitespace before a
 * `:` on the same line is padding of the colons and stays (docs/timeline.md,
 * Periods and events). An event of whitespace only stays as written.
 */
function trimEventEnds(
  source: Source,
  atoms: Atom[],
  events: readonly Node[],
): void {
  const edits: TextEdit[] = []
  for (const event of events) {
    const [from, to] = event.range
    let contentEnd = to
    while (contentEnd > from && isSpaceOrTab(source.text[contentEnd - 1])) {
      contentEnd--
    }
    if (contentEnd === from) continue
    // The directives at the end of the event, and the whitespace around them,
    // are printed as at the end of a title, except that the runs inside the
    // event stay (docs/compatibility.md, Texts after a keyword that are drawn
    // the same).
    if (
      findTriviaBetween(source, to, to + 1).some(
        (item) => item.type === "Directive" && item.range[0] === to,
      ) ||
      findDirectiveEndingAt(source, contentEnd) !== undefined
    ) {
      appendItems(edits, collectTextEndEdits(source, from, to, false))
    } else if (contentEnd !== to) {
      edits.push({ range: [contentEnd, to], replacement: "" })
    }
  }
  if (edits.length > 0) replaceInAtoms(source, atoms, edits)
}
