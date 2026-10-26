import type { TreeviewUnits } from "../../src/diagrams/treeview/index.ts"
import { lexTreeview } from "../../src/diagrams/treeview/index.ts"
import type { EventmodelingUnits } from "../../src/diagrams/eventmodeling/index.ts"
import { lexEventmodeling } from "../../src/diagrams/eventmodeling/index.ts"
import type { CynefinUnits } from "../../src/diagrams/cynefin/index.ts"
import { lexCynefin } from "../../src/diagrams/cynefin/index.ts"
import type { WardleyUnits } from "../../src/diagrams/wardley/index.ts"
import { lexWardley } from "../../src/diagrams/wardley/index.ts"
import type { RailroadUnits } from "../../src/diagrams/railroad/index.ts"
import { lexRailroad } from "../../src/diagrams/railroad/index.ts"
import type { TreemapUnits } from "../../src/diagrams/treemap/index.ts"
import { lexTreemap } from "../../src/diagrams/treemap/index.ts"
import type { AgentflowUnits } from "../../src/diagrams/agentflow/index.ts"
import { lexAgentflow } from "../../src/diagrams/agentflow/index.ts"
import type { Range, Root } from "../../src/index.ts"
import { ParseError, traverseNodes, visitorKeys } from "../../src/index.ts"
import { detectDiagram } from "../../src/detection.ts"
import { findDirectives } from "../../src/directives.ts"
import type { ClassUnits } from "../../src/diagrams/class/index.ts"
import { lexClass } from "../../src/diagrams/class/index.ts"
import { lexC4 } from "../../src/diagrams/c4/index.ts"
import { MISSING_HEADER_MESSAGE } from "../../src/diagrams/class/units.ts"
import { lexFlowchart } from "../../src/diagrams/flowchart/index.ts"
import type { SequenceUnits } from "../../src/diagrams/sequence/index.ts"
import { lexSequence } from "../../src/diagrams/sequence/index.ts"
import type { StateUnits } from "../../src/diagrams/state/index.ts"
import { lexState } from "../../src/diagrams/state/index.ts"
import type { ErUnits } from "../../src/diagrams/er/index.ts"
import { lexEr } from "../../src/diagrams/er/index.ts"
import { RELATIONSHIP_UNITS } from "../../src/diagrams/er/units.ts"
import type { GanttUnits } from "../../src/diagrams/gantt/index.ts"
import { lexGantt } from "../../src/diagrams/gantt/index.ts"
import type { JourneyUnits } from "../../src/diagrams/journey/index.ts"
import { lexJourney } from "../../src/diagrams/journey/index.ts"
import type { RequirementUnits } from "../../src/diagrams/requirement/index.ts"
import { lexRequirement } from "../../src/diagrams/requirement/index.ts"
import type { KanbanUnits } from "../../src/diagrams/kanban/index.ts"
import { lexKanban } from "../../src/diagrams/kanban/index.ts"
import type { Unit as KanbanUnit } from "../../src/diagrams/kanban/units.ts"
import type { MindmapUnits } from "../../src/diagrams/mindmap/index.ts"
import { lexMindmap } from "../../src/diagrams/mindmap/index.ts"
import type { IshikawaUnits } from "../../src/diagrams/ishikawa/index.ts"
import { lexIshikawa } from "../../src/diagrams/ishikawa/index.ts"
import type { Unit as IshikawaUnit } from "../../src/diagrams/ishikawa/units.ts"
import type { Unit as MindmapUnit } from "../../src/diagrams/mindmap/units.ts"
import type { TimelineUnits } from "../../src/diagrams/timeline/index.ts"
import { lexTimeline } from "../../src/diagrams/timeline/index.ts"
import type { XychartUnits } from "../../src/diagrams/xychart/index.ts"
import { lexXychart } from "../../src/diagrams/xychart/index.ts"
import type { QuadrantUnits } from "../../src/diagrams/quadrant/index.ts"
import { lexQuadrant } from "../../src/diagrams/quadrant/index.ts"
import type { BlockUnits } from "../../src/diagrams/block/index.ts"
import { lexBlock } from "../../src/diagrams/block/index.ts"
import type { UnitName as XychartUnitName } from "../../src/diagrams/xychart/units.ts"
import type { UnitName as RequirementUnitName } from "../../src/diagrams/requirement/units.ts"
import type { DiagramUnit } from "../../src/diagram-units.ts"
import type { EmptyForm } from "../../src/empty-forms.ts"
import { EMPTY_FORM_KINDS, emptyFormsOf } from "../../src/empty-forms.ts"
import type { EmptyFormKind } from "../../src/empty-forms.ts"
import type {
  FlowchartLexing,
  Unit,
} from "../../src/diagrams/flowchart/units.ts"
import { isWhitespace, isWordCharacter } from "../../src/character-classes.ts"
import {
  LEFT_CURLY_BRACKET,
  LINE_FEED,
  PERCENT_SIGN,
  RIGHT_CURLY_BRACKET,
} from "../../src/code-points.ts"
import type { DiagramComment } from "../../src/diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
} from "../../src/diagram-text.ts"
import { diagramInputOf, openSource } from "../../src/parse.ts"
import { readFrontmatterTrivia } from "../../src/frontmatter.ts"
import { findAttributeQuotes } from "../../src/html-quotes.ts"
import type { LineEntry } from "../../src/line-lookahead.ts"
import {
  lookAheadFromCommentStart,
  nextCommentStart,
} from "../../src/line-lookahead.ts"
import { LineIndex } from "../../src/positions.ts"

/** Where the text after the frontmatter trivia starts. */
export function textStartOf(text: string): number {
  return readFrontmatterTrivia(text, new LineIndex(text))?.textStart ?? 0
}

/**
 * common.md, Reading a source, items 1 and 2: the comment regions and line
 * segments of `text`, in source order, as the parser's look-ahead decides
 * them from the start of the text to the end.
 */
function lineEntriesOf(text: string): LineEntry[] {
  const entries: LineEntry[] = []
  let start = textStartOf(text)
  while (start < text.length) {
    const found = lookAheadFromCommentStart(text, start)
    entries.push(...found)
    start = nextCommentStart(text, found)
  }
  return entries
}

/**
 * `text` with every directive removed and the text around it joined: the
 * reference input for `directive-as-token-boundary`. The specification
 * reads the text without its directives, as mermaid.js does, and differs
 * only in rejecting a directive inside a token that may not be cut, one
 * that is not a text or a string; the reference input has no directive, so
 * the parser must give for it what mermaid.js gives for `text`. The
 * directives are the ones the parser finds; the fixtures and the
 * comparison of every other input check that scan.
 */
export function withoutDirectives(text: string): string {
  let joined = ""
  let offset = 0
  for (const directive of findDirectives(text, textStartOf(text))) {
    joined += text.slice(offset, directive.range[0])
    offset = directive.range[1]
  }
  return joined + text.slice(offset)
}

/**
 * `text` with each `;` that the line rule ignores moved to the end of its
 * line segment, before the separator that ends it: the reference input for
 * `ignored-semicolon-as-token-boundary`. mermaid.js removes such a `;`
 * from its line before it reads the line, and the specification leaves it
 * out of the diagram text, so both read the same diagram text in the
 * result as in `text`: at the end of its segment the `;` is still the last
 * of the segment, so the line rule still ignores it, and it lies after the
 * text of the segment, inside no token. The specification differs only in
 * rejecting such a `;` inside a token that may not be cut, one that is not
 * a text or a string, so the parser must give for the result what
 * mermaid.js gives for `text`. Where a token runs on over the end of the
 * segment, the moved `;` lies inside it, and the result may be read
 * otherwise. The `;` are the ones the parser's line rule finds; the
 * fixtures and the comparison of every other input check that rule.
 */
export function withIgnoredSemicolonsAtSegmentEnds(text: string): string {
  let moved = ""
  let offset = 0
  for (const { semicolons, end } of ignoredSemicolonsBySegment(text)) {
    for (const semicolon of semicolons) {
      moved += text.slice(offset, semicolon)
      offset = semicolon + 1
    }
    moved += text.slice(offset, end) + ";".repeat(semicolons.length)
    offset = end
  }
  return moved + text.slice(offset)
}

/**
 * `text` without its directives ({@link withoutDirectives}), and then with
 * each `;` that the line rule ignores moved to the end of its line segment
 * ({@link withIgnoredSemicolonsAtSegmentEnds}): the reference input of both
 * `directive-as-token-boundary` and `ignored-semicolon-as-token-boundary`,
 * so that an input with both forms, as
 * `A[style:#x];cl%%{init: {}}%%ick B;b call cb()` in a flowchart, has one
 * reference input in which neither cuts a token. Each step keeps the
 * diagram text that mermaid.js and the specification read, so the parser
 * must give for the result what mermaid.js gives for `text`.
 */
export function withoutTokenCuts(text: string): string {
  return withIgnoredSemicolonsAtSegmentEnds(withoutDirectives(text))
}

/**
 * common.md, `style` and `classDef` lines: the `;` that the line rule
 * ignores in `text`, as the parser's line rule finds them, for each line
 * segment that has any: their offsets, in source order, and where the
 * separator that ends the segment is, or the end of the text.
 */
export function ignoredSemicolonsBySegment(
  text: string,
): { readonly semicolons: readonly number[]; readonly end: number }[] {
  const segments: { semicolons: number[]; end: number }[] = []
  for (const entry of lineEntriesOf(text)) {
    if (entry.kind === "segment" && entry.ignoredSemicolons.size > 0) {
      segments.push({
        semicolons: [...entry.ignoredSemicolons].sort((a, b) => a - b),
        end: entry.end,
      })
    }
  }
  return segments
}

/**
 * known-divergences/html-tag-in-frontmatter.md: whether mermaid.js reads a
 * different set of `"` characters of the text as `'` than the specification
 * does. mermaid.js finds the tags from the start of the source, so a tag that
 * starts in the frontmatter can reach into the text; the specification finds
 * them from the start of the text. The tests declare the divergence with this;
 * the parser does not tell such an input apart.
 */
export function frontmatterChangesAttributeQuotes(text: string): boolean {
  const textStart = textStartOf(text)
  const fromTextStart = findAttributeQuotes(text, textStart)
  const fromSourceStart = findAttributeQuotes(text, 0)
  // Compare the quotes of the text only: those inside the frontmatter are
  // not read by any lexer.
  for (const offset of fromSourceStart) {
    if (offset >= textStart && !fromTextStart.has(offset)) return true
  }
  for (const offset of fromTextStart) {
    if (!fromSourceStart.has(offset)) return true
  }
  return false
}

/**
 * detection.md, entry 7: the four keywords that mermaid.js looks for
 * anywhere in the text, while the specification looks for them at the start
 * only.
 */
const C4_KEYWORDS_ANYWHERE: readonly string[] = [
  "C4Container",
  "C4Component",
  "C4Dynamic",
  "C4Deployment",
]

/**
 * known-divergences/bare-percent-line-before-header.md: whether the text has
 * the form of the divergence: the parser's detection passes a bare `%%` line
 * before the header. The tests declare the divergence with this; the parser
 * does not tell such an input apart.
 */
export function holdsBarePercentLineBeforeHeader(text: string): boolean {
  const { lexer } = openSource(text)
  return detectDiagram(lexer).passed.some(
    (part) => part.kind === "bare-percent-line",
  )
}

/**
 * known-divergences/c4-keyword-anywhere.md: whether the text has the form of
 * the divergence: the parser detects a diagram type other than `c4`, and the
 * diagram text from the detection point, as the parser's lexer reads it with
 * its directives and comment regions left out, holds one of the four keywords
 * that mermaid.js looks for anywhere. The tests declare the divergence with
 * this; the parser does not tell such an input apart.
 */
export function holdsC4KeywordAfterHeader(text: string): boolean {
  const { lexer } = openSource(text)
  const { detected, detectionPoint } = detectDiagram(lexer)
  if (detected === null || detected === "c4") return false
  const diagramText = lexer.textOfRange(detectionPoint, text.length, [])
  return C4_KEYWORDS_ANYWHERE.some((keyword) => diagramText.includes(keyword))
}

/**
 * known-divergences/click-reserved-word.md: the `click` units of the flowchart
 * `text` that do not start a click statement. A `click` unit starts one
 * where a statement starts and click ids follow it (Click and callbacks):
 * where the unit before it, among those other than the `space` units, the
 * units of the empty forms that mermaid.js reads nothing for
 * ({@link removedEmptyFormsOf}), and the `click` units found here already,
 * is the end of the header, a separator (a `newline` or `;` unit), `end`,
 * or the `}` that closes a description block; and where a `click-id` or
 * `click-comma` unit comes next. The units are those of the parser's
 * lexer. Null when `text` is no flowchart or its lexer rejects it.
 */
export function reservedClicksIn(text: string): Unit[] | null {
  const lexing = flowchartLexingOf(text)
  return lexing === null ? null : reservedClicksOf(lexing.units)
}

/** The `click` units among `units`, the units of a flowchart, that do not start a click statement ({@link reservedClicksIn}). */
function reservedClicksOf(units: readonly Unit[]): Unit[] {
  const removed = new Set<AnyUnit>(
    removedEmptyFormsOf(flowchartUnits(units)).flatMap((form) => form.units),
  )
  const read = units.filter(
    (unit) => unit.name !== "space" && !removed.has(unit),
  )
  const reserved: Unit[] = []
  const kept: Unit[] = []
  read.forEach((unit, index) => {
    if (unit.name !== "click") {
      kept.push(unit)
      return
    }
    const idsFollow =
      read[index + 1]?.name === "click-id" ||
      read[index + 1]?.name === "click-comma"
    if (idsFollow && flowchartStatementStartsAfter(kept)) {
      kept.push(unit)
    } else {
      reserved.push(unit)
    }
  })
  return reserved
}

/** The reference input for `click-reserved-word`, and what decides whether mermaid.js gives it the Db of the input. */
export interface ClickReference {
  /**
   * The input without its comment regions, without the empty forms that
   * mermaid.js reads nothing for ({@link withoutEmptyForms}), and without
   * the click text of each `click` unit that does not start a click
   * statement: the word `click`, the whitespace after it, and the one
   * whitespace character with which the lexer leaves the click context
   * that it entered.
   */
  readonly text: string
  /**
   * Whether the parser's lexer reads `text` as the units of the input other
   * than the removed ones, except the click ids and `click-comma` units
   * that the click contexts of those `click` units read, whose text it may
   * read as other units that start and end where each of them does.
   */
  readonly keepsUnits: boolean
  /** The ranges in `text` of the click ids that the click contexts of those `click` units read. */
  readonly clickIds: readonly Range[]
}

/**
 * known-divergences/click-reserved-word.md: the reference input of the
 * flowchart `text`. mermaid.js gives it the Db of `text` where it accepts it,
 * where its units are kept ({@link ClickReference.keepsUnits}), and where the
 * text of each click id lies within one leaf node of its tree ({@link
 * clickIdsWithinLeafNodes}). Null where {@link reservedClicksIn} is.
 */
export function clickReferenceOf(text: string): ClickReference | null {
  const lexing = flowchartLexingOf(text)
  if (lexing === null) return null
  const reserved = reservedClicksOf(lexing.units)
  const emptyForms = removedEmptyFormsOf(flowchartUnits(lexing.units))
  const removedUnits = new Set<AnyUnit>([
    ...reserved,
    ...emptyForms.flatMap((form) => form.units),
  ])
  const removed: Range[] = emptyForms.map((form) => form.range)
  const rereadable = new Set<Unit>()
  for (const click of reserved) {
    const after = lexing.units.at(click.index + 1)
    removed.push([click.start, after?.start ?? click.end])
    const exit = lexing.clickContextExits.find(([start]) => start >= click.end)
    if (exit !== undefined) removed.push(exit)
    // The units that the click context reads lie before its exit.
    for (const unit of lexing.units.slice(click.index + 1)) {
      if (exit !== undefined && unit.start >= exit[0]) break
      if (unit.name === "click-id" || unit.name === "click-comma") {
        rereadable.add(unit)
      }
    }
  }
  const reference = withoutCommentRegionsAnd(text, removed)
  const kept = lexing.units.filter((unit) => !removedUnits.has(unit))
  return {
    text: reference.text,
    keepsUnits: readsAsUnits(reference, kept, rereadable),
    clickIds: [...rereadable]
      .filter((unit) => unit.name === "click-id")
      .map((unit) => [
        reference.offsetOf(unit.start),
        reference.offsetOf(unit.end),
      ]),
  }
}

/**
 * known-divergences/click-reserved-word.md: whether the text of each click id
 * of `reference` lies within the range of one leaf node of `root`, the tree of
 * the reference input. A leaf node is one without child fields.
 */
export function clickIdsWithinLeafNodes(
  reference: ClickReference,
  root: Root,
): boolean {
  const leaves: Range[] = []
  traverseNodes(root, {
    enterNode(node) {
      if (visitorKeys[node.type].length === 0) leaves.push(node.range)
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })
  return reference.clickIds.every(([start, end]) =>
    leaves.some((leaf) => leaf[0] <= start && end <= leaf[1]),
  )
}

/** The offset after the directives, among `directives`, that start at `offset`, one after another; `offset` itself when none starts there. */
function afterDirectivesAt(
  offset: number,
  directives: readonly Range[],
): number {
  let current = offset
  for (;;) {
    const position = current
    const directive = directives.find(([start]) => start === position)
    if (directive === undefined) return current
    current = directive[1]
  }
}

/**
 * known-divergences/comment-takes-character.md: the offsets, in source
 * order, of the `%%` of the sequence diagram `text`, outside directives,
 * that come right after a `number` unit or right after a character other
 * than whitespace at which the lexer, in the statement context, starts the
 * match of a rule: the places where the two rules of mermaid.js that the
 * divergence names read otherwise than this specification. Both come from
 * the parser's lexer. Whether the `%%` comes right after is decided on the
 * diagram text, which has no directives: in
 * `autonumber 1%%{init: {}}%%%% c`, the `%%` after the directive comes
 * right after the number. Null when `text` is no sequence diagram or its
 * lexer rejects it.
 */
export function commentsAfterMatchStarts(text: string): number[] | null {
  const lexing = sequenceLexingOf(text)
  if (lexing === null) return null
  const directives = lexing.text.directives
  const followed = new Set(
    [
      ...lexing.statementMatchStarts.map(([, end]) => end),
      ...lexing.units
        .filter((unit) => unit.name === "number")
        .map((unit) => unit.end),
    ].map((offset) => afterDirectivesAt(offset, directives)),
  )
  return [...followed]
    .filter(
      (offset) =>
        text.startsWith("%%", offset) &&
        !directives.some(([start, end]) => start <= offset && offset < end),
    )
    .sort((left, right) => left - right)
}

/**
 * known-divergences/comment-takes-character.md, and diagrams/gantt.md,
 * Known divergences: the offsets, in source order, of each `%` of the Gantt
 * chart `text` that comes right after the first character of a unit, a
 * character other than `}` and whitespace: the places where mermaid.js
 * reads that character and the rest of the line as one comment, while here
 * the `%` is a character of the unit or starts the next one. The units come
 * from the parser's lexer, and the characters from its diagram text, which
 * has no directives. Null when `text` is no Gantt chart or its lexer
 * rejects it.
 */
export function percentsAfterUnitStarts(text: string): number[] | null {
  const lexing = ganttLexingOf(text)
  return lexing === null ? null : marksAfterUnitStarts(lexing, "%")
}

/**
 * known-divergences/comment-takes-character.md, and the Known divergences
 * of diagrams/journey.md and diagrams/timeline.md: the offsets, in source
 * order, of each `%%` of the journey diagram or the timeline `text` that
 * comes right after the first character of a unit, a character other than
 * `}` and whitespace: the places where mermaid.js reads that character and
 * the rest of the line as one comment, while here the `%%` is part of the
 * unit or the character before it is a unit that the grammar does not
 * take. Null when `text` is neither or its lexer rejects it.
 */
export function doublePercentsAfterUnitStarts(text: string): number[] | null {
  const lexing = journeyLexingOf(text) ?? timelineLexingOf(text)
  return lexing === null ? null : marksAfterUnitStarts(lexing, "%%")
}

/**
 * known-divergences/comment-takes-character.md, and the Known divergences
 * of diagrams/xychart.md and diagrams/quadrant.md: the offsets, in source
 * order, of each diagram comment of the XY chart or the quadrant chart
 * `text` that starts right where a unit of one character ends, a word of
 * one letter, one digit, or one punctuation character, a bracket, a `,`, a
 * `;`, a one-digit number, a whitespace character of a `space` unit, or
 * the line feed of a `newline` unit: the places where mermaid.js reads
 * that character and the rest of the line as one comment. Null when `text`
 * is neither or its lexer rejects it.
 */
export function commentsAfterOneCharacterUnits(text: string): number[] | null {
  const lexing = xychartLexingOf(text) ?? quadrantLexingOf(text)
  if (lexing === null) return null
  const oneCharacterUnitEnds = new Set(
    lexing.units
      .filter((unit) => [...unit.text].length === 1)
      .map((unit) => unit.end),
  )
  return lexing.comments
    .map((comment) => comment.range[0])
    .filter((start) => oneCharacterUnitEnds.has(start))
}

/**
 * The offsets, in source order, of each `mark` that comes right after the
 * first character of a unit of `lexing`, a character other than `}` and
 * whitespace (see {@link percentsAfterUnitStarts} and
 * {@link doublePercentsAfterUnitStarts}). The units come from the parser's
 * lexer, and the characters from its diagram text, which has no
 * directives.
 */
function marksAfterUnitStarts(
  lexing: GanttUnits | JourneyUnits | TimelineUnits,
  mark: "%" | "%%",
): number[] {
  const unitStarts = new Set(lexing.units.map((unit) => unit.start))
  const places: number[] = []
  for (
    let character: DiagramPosition = lexing.text.first();
    character !== null;
    character = lexing.text.after(character)
  ) {
    const startsUnit =
      unitStarts.has(character.start) && character.offsetInConvertedForm === 0
    if (
      !startsUnit ||
      character.codePoint === RIGHT_CURLY_BRACKET ||
      isWhitespace(character.codePoint)
    ) {
      continue
    }
    const first = lexing.text.after(character)
    const second = first === null ? null : lexing.text.after(first)
    const marked =
      first?.codePoint === PERCENT_SIGN &&
      (mark === "%" || second?.codePoint === PERCENT_SIGN)
    if (marked) places.push(first.start)
  }
  return places
}

/** The index of the first of `characters` that starts at `offset` or after it; the number of characters when none does. */
function indexAt(
  characters: readonly DiagramCharacter[],
  offset: number,
): number {
  const index = characters.findIndex((character) => character.start >= offset)
  return index === -1 ? characters.length : index
}

/** A diagram comment of a Gantt chart, and whether mermaid.js reaches its `%` directly. */
interface ReachedComment {
  readonly comment: DiagramComment
  readonly direct: boolean
}

/** The diagram comments of a Gantt chart as {@link ganttCommentsReached} reads them, with the characters of its diagram text. */
interface GanttCommentReading {
  readonly characters: readonly DiagramCharacter[]
  readonly comments: readonly ReachedComment[]
}

/**
 * diagrams/gantt.md, Comments: the diagram comments of the Gantt chart
 * `text`, in source order, each with whether mermaid.js reaches its `%`
 * directly. Take the whitespace between the `%` and the last character
 * that the lexer read: the end of the last unit other than a `newline`
 * unit, whose line feeds count as whitespace here, the one whitespace
 * character that leaves the click context, the end of the last comment, or,
 * for a comment with the mark `%` that it reached directly, the last of the
 * line feeds that it took. The `%` is reached directly when that
 * whitespace is empty, or has two or more characters of which, after its
 * leading line feeds, not exactly one remains. The units, the comments, and
 * the characters come from the parser's lexer and its diagram text, which
 * has no directives, so a line that holds only a directive leaves its line
 * feed in that whitespace. Null when `text` is no Gantt chart or its lexer
 * rejects it.
 */
function ganttCommentsReached(text: string): GanttCommentReading | null {
  const lexing = ganttLexingOf(text)
  if (lexing === null) return null
  const characters: DiagramCharacter[] = []
  for (
    let character: DiagramPosition = lexing.text.first();
    character !== null;
    character = lexing.text.after(character)
  ) {
    characters.push(character)
  }
  // Where the lexer has read up to: the end of each unit but a `newline`
  // unit, whose line feeds are whitespace before the `%`, and the end of the
  // one whitespace character after the last unit of the ids of a click
  // statement, which leaves the click context.
  const readUpTo: number[] = lexing.units
    .filter((unit) => unit.name !== "newline")
    .map((unit) => unit.end)
  lexing.units.forEach((unit, index) => {
    const next = lexing.units.at(index + 1)
    const endsIdText =
      (unit.name === "id" || unit.name === ",") &&
      next?.name !== "id" &&
      next?.name !== ","
    const leaving = characters.at(indexAt(characters, unit.end))
    if (
      endsIdText &&
      leaving !== undefined &&
      isWhitespace(leaving.codePoint)
    ) {
      readUpTo.push(leaving.end)
    }
  })
  const comments: ReachedComment[] = []
  for (const comment of lexing.comments) {
    const [start, end] = comment.range
    const anchor = Math.max(0, ...readUpTo.filter((offset) => offset <= start))
    const between = characters.slice(
      indexAt(characters, anchor),
      indexAt(characters, start),
    )
    let leadingLineFeeds = 0
    while (between.at(leadingLineFeeds)?.codePoint === LINE_FEED) {
      leadingLineFeeds += 1
    }
    const remaining = between.length - leadingLineFeeds
    const direct =
      between.length === 0 || (between.length >= 2 && remaining !== 1)
    comments.push({ comment, direct })
    // A comment with the mark `%` reached directly takes the line feeds
    // after it; any other comment ends before its line feed.
    let readEnd = end
    if (direct && comment.mark === "%") {
      for (
        let index = indexAt(characters, end);
        characters.at(index)?.codePoint === LINE_FEED;
        index += 1
      ) {
        readEnd = characters[index].end
      }
    }
    readUpTo.push(readEnd)
  }
  return { characters, comments }
}

/**
 * known-divergences/comment-takes-line-break.md, and diagrams/gantt.md,
 * Known divergences: the offsets, in source order, of the diagram comments
 * of the Gantt chart `text` with the mark `%` that mermaid.js reaches
 * directly (see {@link ganttCommentsReached}), which take the line feeds
 * after them there. Null when `text` is no Gantt chart or its lexer
 * rejects it.
 */
export function percentCommentsReachedDirectly(text: string): number[] | null {
  const reading = ganttCommentsReached(text)
  if (reading === null) return null
  return reading.comments
    .filter(({ comment, direct }) => direct && comment.mark === "%")
    .map(({ comment }) => comment.range[0])
}

/**
 * known-divergences/percent-brace-after-unit.md, and diagrams/gantt.md,
 * Known divergences: the offsets, in source order, of the diagram comments
 * of the Gantt chart `text` that start with a `%%{`, which starts no
 * directive, and that mermaid.js reaches directly (see
 * {@link ganttCommentsReached}), where it rejects the input. The `%%{` is
 * found in the diagram text, which has no directives. Null when `text` is
 * no Gantt chart or its lexer rejects it.
 */
export function percentBracesReachedDirectly(text: string): number[] | null {
  const reading = ganttCommentsReached(text)
  if (reading === null) return null
  const { characters } = reading
  return reading.comments
    .filter(({ comment, direct }) => {
      const first = characters.findIndex(
        (character) => character.start >= comment.range[0],
      )
      return (
        direct &&
        characters.at(first)?.codePoint === PERCENT_SIGN &&
        characters.at(first + 1)?.codePoint === PERCENT_SIGN &&
        characters.at(first + 2)?.codePoint === LEFT_CURLY_BRACKET
      )
    })
    .map(({ comment }) => comment.range[0])
}

/**
 * known-divergences/comment-takes-line-break.md: the offsets, in source
 * order, of the diagram comments of the class diagram `text` that follow a
 * unit on their line: the comments whose line feed mermaid.js takes, where
 * this specification does not. They come from the parser's lexer: a
 * comment follows a unit on its line when a unit before it is not a
 * `newline` unit, the last unit before every line. Null when `text` is no
 * class diagram or its lexer rejects it.
 */
export function commentsAfterUnits(text: string): number[] | null {
  const lexing = classLexingOf(text)
  if (lexing === null) return null
  return lexing.comments
    .map((comment) => comment.range[0])
    .filter((start) => {
      const before = lexing.units.filter((unit) => unit.end <= start).at(-1)
      return before !== undefined && before.name !== "newline"
    })
}

/**
 * known-divergences/comment-takes-line-break.md: the offsets of the C4
 * diagram comments, which leave their following line terminator outside.
 * Null when `text` is no C4 diagram or its lexer rejects it.
 */
export function c4DiagramComments(text: string): number[] | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  if (detection.detected !== "c4") return null
  try {
    return lexC4(diagramInputOf(opened, detection, "c4")).comments.map(
      (comment) => comment.range[0],
    )
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/**
 * known-divergences/name-start-reads-unit.md: the marks that mermaid.js
 * reads before the text of a backquoted name or of a generic type, where
 * that text starts with them; `~` too in a backquoted name.
 */
const NAME_START_MARKS: readonly string[] = ['"', "<<", ">>"]

/** known-divergences/name-start-reads-unit.md: the keywords that mermaid.js reads there, where no word character follows them. */
const NAME_START_KEYWORDS: readonly string[] = [
  "cssClass",
  "callback",
  "link",
  "click",
  "note",
  "href",
]

/** Whether `text` starts with one of the units of `name-start-reads-unit`; `~` counts when `tildeLeads`. */
function startsWithNameStartUnit(text: string, tildeLeads: boolean): boolean {
  if (tildeLeads && text.startsWith("~")) return true
  if (NAME_START_MARKS.some((mark) => text.startsWith(mark))) return true
  return NAME_START_KEYWORDS.some((keyword) => {
    if (!text.startsWith(keyword)) return false
    const after = text.codePointAt(keyword.length)
    return after === undefined || !isWordCharacter(after)
  })
}

/**
 * known-divergences/name-start-reads-unit.md: the offsets, in source
 * order, of the backquoted names and the generic texts of the class
 * diagram `text` whose text starts with a unit that mermaid.js reads
 * before it. The names and texts are the `backquoted` and `generic-text`
 * units of the parser's lexer, read in converted form. Null when `text` is
 * no class diagram or its lexer rejects it.
 */
export function namesStartingWithUnits(text: string): number[] | null {
  const lexing = classLexingOf(text)
  if (lexing === null) return null
  return lexing.units
    .filter(
      (unit) =>
        (unit.name === "backquoted" &&
          startsWithNameStartUnit(unit.text.slice(1), true)) ||
        (unit.name === "generic-text" &&
          startsWithNameStartUnit(unit.text, false)),
    )
    .map((unit) => unit.start)
}

/**
 * known-divergences/headerless-empty-ending.md: whether the parser's
 * lexer rejects the class diagram `text` because its first unit is not a
 * `header` unit (`MISSING_HEADER_MESSAGE`), which the lexer decides.
 */
export function rejectsWithoutHeader(text: string): boolean {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "classDiagram") return false
  try {
    lexClass(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) {
      return error.message === MISSING_HEADER_MESSAGE
    }
    throw error
  }
  return false
}

/** A unit of any diagram's lexer. */
type AnyUnit = DiagramUnit<string>

/**
 * The units of a diagram text as the parser's lexer reads them, and how an
 * empty description block that is a statement is found among them: where
 * a statement starts, and before the separator of a statement (each
 * diagram's Empty description blocks before a separator).
 */
interface DiagramUnits {
  readonly units: readonly AnyUnit[]
  /** The kinds of empty form that the diagram has (see `EMPTY_FORM_KINDS`). */
  readonly emptyFormKinds: readonly EmptyFormKind[]
  /**
   * Whether a statement starts at the empty description block `block`,
   * from the units before it and the units after it, in source order,
   * without those of the empty forms that mermaid.js does not see.
   */
  readonly statementStartsAt: (
    before: readonly AnyUnit[],
    block: EmptyForm<AnyUnit>,
    after: readonly AnyUnit[],
  ) => boolean
  /** The names of the units that separate a statement that needs a separator from what follows it. */
  readonly separators: readonly string[]
  /** Whether the end of the text is such a separator too. */
  readonly endOfTextSeparates: boolean
  /** The range that the reference input leaves out for the removed empty form `form`. */
  readonly removedRangeOf: (form: EmptyForm<AnyUnit>) => Range
}

/**
 * known-divergences/tokenless-empty-forms.md: the empty forms of `text`
 * that mermaid.js reads nothing for and that the reference input leaves
 * out. Null when `text` is of a diagram type without a lexer here, or its
 * lexer rejects it.
 */
export function removedEmptyFormsIn(text: string): EmptyForm<AnyUnit>[] | null {
  const diagram = diagramUnitsOf(text)
  return diagram === null ? null : removedEmptyFormsOf(diagram)
}

/**
 * `text` without its comment regions and without the empty forms that
 * mermaid.js reads nothing for: each empty string, each empty call from its
 * `call` to its `)`, and each empty description block that is no
 * statement, because it lies inside a statement, neither where a statement
 * starts nor before its separator, from its `accDescr` to its `}`, with
 * the whitespace around a block between `direction` and its value in class
 * ({@link classRemovedRangeOf}). This is the reference input for
 * `tokenless-empty-forms`; null where {@link removedEmptyFormsIn} is.
 */
export function withoutEmptyForms(text: string): string | null {
  const diagram = diagramUnitsOf(text)
  if (diagram === null) return null
  return withoutCommentRegionsAnd(text, removedRangesOf(diagram)).text
}

/**
 * known-divergences/tokenless-empty-forms.md: whether the parser's lexer reads
 * the reference input of the flowchart `text` ({@link withoutEmptyForms}) as
 * the units of `text` other than those of the removed empty forms, the same
 * names with the same texts in the same order. Only then does the removal leave
 * the units around each form as they were, and mermaid.js gives the reference
 * input, where it accepts it, the Db of `text`.
 */
export function keepsUnitsWithoutEmptyForms(text: string): boolean {
  const diagram = diagramUnitsOf(text)
  if (diagram === null) return false
  const removed = new Set(
    removedEmptyFormsOf(diagram).flatMap((form) => form.units),
  )
  return readsAsUnits(
    withoutCommentRegionsAnd(text, removedRangesOf(diagram)),
    diagram.units.filter((unit) => !removed.has(unit)),
    new Set(),
  )
}

/** The ranges that the reference input of `diagram` leaves out for its removed empty forms. */
function removedRangesOf(diagram: DiagramUnits): Range[] {
  return removedEmptyFormsOf(diagram).map((form) =>
    diagram.removedRangeOf(form),
  )
}

/**
 * Whether the parser's lexer reads `reference` as `kept`, units of the
 * original text: the same names with the same texts in the same order,
 * except that it may read the text of each unit in `rereadable` as other
 * units that start and end where that unit does in `reference`.
 */
function readsAsUnits(
  reference: ShortenedText,
  kept: readonly AnyUnit[],
  rereadable: ReadonlySet<AnyUnit>,
): boolean {
  const units = diagramUnitsOf(reference.text)?.units
  if (units === undefined) return false
  let next = 0
  for (const unit of kept) {
    if (rereadable.has(unit)) {
      const end = reference.offsetOf(unit.end)
      if (units.at(next)?.start !== reference.offsetOf(unit.start)) {
        return false
      }
      while (next < units.length && units[next].end < end) next += 1
      if (units.at(next)?.end !== end) return false
    } else {
      const read = units.at(next)
      if (read?.name !== unit.name || read.text !== unit.text) return false
    }
    next += 1
  }
  return next === units.length
}

/**
 * The empty forms among the units of `diagram` that mermaid.js reads
 * nothing for: every empty form of another kind, such as an empty string
 * or an empty call, and every empty description block that is no
 * statement, neither where a statement starts nor before its separator.
 * Whether a block is one is read from the units around it other than the
 * `space` units, and, before it, other than the units of the empty forms
 * found here already, which mermaid.js does not see.
 */
function removedEmptyFormsOf(diagram: DiagramUnits): EmptyForm<AnyUnit>[] {
  const { units, emptyFormKinds, statementStartsAt } = diagram
  const removed: EmptyForm<AnyUnit>[] = []
  const removedUnits = new Set<AnyUnit>()
  for (const form of emptyFormsOf(units, emptyFormKinds)) {
    if (form.kind === "empty-description-block") {
      const before = units
        .slice(0, form.units[0].index)
        .filter((unit) => unit.name !== "space" && !removedUnits.has(unit))
      const after = units
        .slice((form.units.at(-1)?.index ?? 0) + 1)
        .filter((unit) => unit.name !== "space")
      if (
        statementStartsAt(before, form, after) ||
        separatorFollows(diagram, after)
      ) {
        continue
      }
    }
    removed.push(form)
    for (const unit of form.units) removedUnits.add(unit)
  }
  return removed
}

/**
 * Each diagram's Empty description blocks before a separator: whether
 * `after`, the units after an empty description block, are other empty
 * description blocks and then a separator of `diagram`, so that the block
 * lies in a `statement-end = empty-description-block* separator`.
 */
function separatorFollows(
  diagram: DiagramUnits,
  after: readonly AnyUnit[],
): boolean {
  const separator = firstAfterEmptyDescriptionBlocks(after)
  return separator === undefined
    ? diagram.endOfTextSeparates
    : diagram.separators.includes(separator.name)
}

/**
 * The first of `units`, the units after an empty description block, that
 * is not a unit of an empty description block right after it; undefined
 * when there is none.
 */
function firstAfterEmptyDescriptionBlocks(
  units: readonly AnyUnit[],
): AnyUnit | undefined {
  let index = 0
  while (startsEmptyDescriptionBlock(units, index, 1)) index += 3
  return units.at(index)
}

/**
 * Whether an empty description block, `accDescr`, `{`, and `}` with no unit
 * between them, has its first unit (`direction` 1) or its last unit
 * (`direction` -1) at `index` of `units`.
 */
function startsEmptyDescriptionBlock(
  units: readonly AnyUnit[],
  index: number,
  direction: 1 | -1,
): boolean {
  const names = ["accDescr", "{", "}"]
  return names.every(
    (name, offset) =>
      units.at(direction === 1 ? index + offset : index - 2 + offset)?.name ===
      name,
  )
}

/** A text with ranges left out of it. */
interface ShortenedText {
  readonly text: string
  /** Where the offset `offset` of the original text, which lies in no range left out, lies in `text`. */
  readonly offsetOf: (offset: number) => number
}

/** `text` without its comment regions and without the ranges `removed`, which may overlap them and each other. */
function withoutCommentRegionsAnd(
  text: string,
  removed: readonly Range[],
): ShortenedText {
  const ranges: Range[] = [...removed]
  for (const entry of lineEntriesOf(text)) {
    if (entry.kind === "region") ranges.push([entry.start, entry.end])
  }
  ranges.sort((left, right) => left[0] - right[0])
  const merged: Range[] = []
  for (const [start, end] of ranges) {
    const last = merged.at(-1)
    if (last !== undefined && start <= last[1]) {
      merged[merged.length - 1] = [last[0], Math.max(last[1], end)]
    } else {
      merged.push([start, end])
    }
  }
  let kept = ""
  let offset = 0
  for (const [start, end] of merged) {
    kept += text.slice(offset, start)
    offset = end
  }
  return {
    text: kept + text.slice(offset),
    offsetOf: (original) =>
      merged
        .filter(([, end]) => end <= original)
        .reduce((shifted, [start, end]) => shifted - (end - start), original),
  }
}

/** The units of the flowchart `text` as the parser's lexer reads them; null when `text` is no flowchart or its lexer rejects it. */
function flowchartLexingOf(text: string): FlowchartLexing | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (
    diagramType !== "flowchart-v2" &&
    diagramType !== "flowchart-elk" &&
    diagramType !== "swimlane"
  ) {
    return null
  }
  try {
    return lexFlowchart(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/**
 * The units of `text` as the parser's lexer reads them, for the diagram
 * types whose lexer the reference inputs use; null for any other type, and
 * when the lexer rejects the text.
 */
function diagramUnitsOf(text: string): DiagramUnits | null {
  const flowchart = flowchartLexingOf(text)
  if (flowchart !== null) return flowchartUnits(flowchart.units)
  const sequence = sequenceLexingOf(text)
  if (sequence !== null) {
    return {
      units: sequence.units,
      emptyFormKinds: EMPTY_FORM_KINDS.sequence,
      statementStartsAt: (before) => sequenceStatementStartsAfter(before),
      separators: ["newline"],
      endOfTextSeparates: false,
      removedRangeOf: (form) => form.range,
    }
  }
  const classLexing = classLexingOf(text)
  if (classLexing !== null) {
    return {
      units: classLexing.units,
      emptyFormKinds: EMPTY_FORM_KINDS.class,
      statementStartsAt: (before) => classStatementStartsAfter(before),
      separators: ["newline"],
      endOfTextSeparates: true,
      removedRangeOf: (form) => classRemovedRangeOf(classLexing.units, form),
    }
  }
  const state = stateLexingOf(text)
  if (state !== null) {
    return {
      units: state.units,
      emptyFormKinds: EMPTY_FORM_KINDS.state,
      statementStartsAt: (before, block, after) =>
        stateStatementStartsAt(text, before, block, after),
      separators: ["newline"],
      endOfTextSeparates: true,
      removedRangeOf: (form) => form.range,
    }
  }
  const er = erLexingOf(text)
  if (er !== null) {
    return {
      units: er.units,
      emptyFormKinds: EMPTY_FORM_KINDS.er,
      statementStartsAt: (before, _block, after) =>
        erStatementStartsAt(before, after),
      // diagrams/er.md, Diagram and statements: nothing separates two
      // statements, so a block is a statement only where one starts.
      separators: [],
      endOfTextSeparates: false,
      removedRangeOf: (form) => form.range,
    }
  }
  const gantt = ganttLexingOf(text)
  if (gantt !== null) {
    return {
      units: gantt.units,
      emptyFormKinds: EMPTY_FORM_KINDS.gantt,
      statementStartsAt: (before, _block, after) =>
        !ganttBlockInsideClickStatement(before, after),
      // diagrams/gantt.md, Diagram and statements: nothing separates two
      // statements, so a block is a statement only where one starts.
      separators: [],
      endOfTextSeparates: false,
      removedRangeOf: (form) => form.range,
    }
  }
  const requirement = requirementLexingOf(text)
  if (requirement !== null) {
    return {
      units: requirement.units,
      emptyFormKinds: EMPTY_FORM_KINDS.requirement,
      statementStartsAt: (before, _block, after) =>
        requirementBlockStandsAlone(before, after),
      // diagrams/requirement.md, Diagram and statements: nothing separates
      // two statements, so a block is a statement only where one starts.
      separators: [],
      endOfTextSeparates: false,
      removedRangeOf: (form) => form.range,
    }
  }
  const quadrant = quadrantLexingOf(text)
  if (quadrant !== null) {
    return {
      units: quadrant.units,
      emptyFormKinds: EMPTY_FORM_KINDS.quadrant,
      statementStartsAt: (before) => quadrantStatementStartsAfter(before),
      // diagrams/quadrant.md, Empty description blocks: a block is a
      // statement where a statement starts and after the last unit of a
      // statement, before its separator, a line break, a `;`, or the end of
      // the text.
      separators: ["newline", ";"],
      endOfTextSeparates: true,
      removedRangeOf: (form) => form.range,
    }
  }
  const block = blockLexingOf(text)
  if (block !== null) {
    return {
      units: block.units,
      emptyFormKinds: EMPTY_FORM_KINDS.block,
      statementStartsAt: (before, _block, after) =>
        blockDiagramBlockStandsAlone(before, after),
      // diagrams/block.md, Diagram and statements: nothing separates two
      // statements, so a block is a statement only where one starts.
      separators: [],
      endOfTextSeparates: false,
      removedRangeOf: (form) => form.range,
    }
  }
  const xychart = xychartLexingOf(text)
  if (xychart !== null) {
    return {
      units: xychart.units,
      emptyFormKinds: EMPTY_FORM_KINDS.xychart,
      statementStartsAt: (before, _block, after) =>
        xychartBlockStandsAlone(before, after),
      // diagrams/xychart.md, Diagram and statements: a statement needs
      // nothing before the next one, so a block is a statement only where
      // one starts.
      separators: [],
      endOfTextSeparates: false,
      removedRangeOf: (form) => form.range,
    }
  }
  const kanban = kanbanLexingOf(text)
  if (kanban !== null) {
    return {
      units: kanban.units,
      emptyFormKinds: EMPTY_FORM_KINDS.kanban,
      // diagrams/kanban.md, Empty forms: as in mindmap, none is a statement.
      statementStartsAt: () => false,
      separators: [],
      endOfTextSeparates: false,
      removedRangeOf: (form) => form.range,
    }
  }
  const mindmap = mindmapLexingOf(text)
  if (mindmap !== null) {
    return {
      units: mindmap.units,
      emptyFormKinds: EMPTY_FORM_KINDS.mindmap,
      // diagrams/mindmap.md, Empty forms: the diagram has no empty
      // description block, and each of its empty forms is left out
      // wherever it stands.
      statementStartsAt: () => false,
      separators: [],
      endOfTextSeparates: false,
      removedRangeOf: (form) => form.range,
    }
  }
  return null
}

/** The units of a flowchart, with how a statement start is found among them. */
function flowchartUnits(units: readonly Unit[]): DiagramUnits {
  return {
    units,
    emptyFormKinds: EMPTY_FORM_KINDS.flowchart,
    statementStartsAt: (before) => flowchartStatementStartsAfter(before),
    separators: ["newline", ";"],
    endOfTextSeparates: true,
    removedRangeOf: (form) => form.range,
  }
}

/** The units of the sequence diagram `text` as the parser's lexer reads them; null when `text` is no sequence diagram or its lexer rejects it. */
function sequenceLexingOf(text: string): SequenceUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "sequence") return null
  try {
    return lexSequence(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** The units of the class diagram `text` as the parser's lexer reads them; null when `text` is no class diagram or its lexer rejects it. */
function classLexingOf(text: string): ClassUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "classDiagram") return null
  try {
    return lexClass(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** The units of the ER diagram `text` as the parser's lexer reads them; null when `text` is no ER diagram or its lexer rejects it. */
function erLexingOf(text: string): ErUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "er") return null
  try {
    return lexEr(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/**
 * diagrams/er.md, Empty description blocks: the units after which the
 * statement before has not ended: a cardinality or a line, the `:` before a
 * role, `:::`, `,`, `[`, and `subgraph` and `class`, which a name must
 * follow.
 */
const ER_UNFINISHED_AFTER: readonly string[] = [
  ...RELATIONSHIP_UNITS,
  ":",
  ":::",
  ",",
  "[",
  "subgraph",
  "class",
]

/**
 * diagrams/er.md, Empty description blocks: the units that continue the
 * statement before them: a cardinality, which starts a relationship, `:::`,
 * `{`, `[`, `]`, which closes an alias or the title of a subgraph, `:`, and
 * `,`.
 */
const ER_CONTINUATIONS: readonly string[] = [
  ...RELATIONSHIP_UNITS,
  ":::",
  "{",
  "[",
  "]",
  ":",
  ",",
]

/**
 * diagrams/er.md, Empty description blocks: whether an empty description
 * block, with `before` and `after` the units before and after it, in
 * source order, is a statement. It lies inside a statement instead where
 * the unit after the blocks continues the statement before it, or where
 * that statement has not ended: after a unit of {@link ER_UNFINISHED_AFTER},
 * inside an alias or the title of a subgraph, a `[` that no `]` has closed,
 * and in the first list of names of a `class` statement, which a second
 * list must follow.
 */
function erStatementStartsAt(
  before: readonly AnyUnit[],
  after: readonly AnyUnit[],
): boolean {
  const last = before.at(-1)
  if (last === undefined) return true
  const next = firstAfterEmptyDescriptionBlocks(after)?.name
  if (next !== undefined && ER_CONTINUATIONS.includes(next)) return false
  if (ER_UNFINISHED_AFTER.includes(last.name)) return false
  if (isInsideOpenBracket(before)) return false
  return !endsFirstListOfClassStatement(before)
}

/**
 * Entities and Subgraphs: whether `before` ends inside an alias or the
 * title of a subgraph: a `[` comes after the last `]`, and no `newline`
 * unit lies after it, since an alias and a title are read on one line.
 */
function isInsideOpenBracket(before: readonly AnyUnit[]): boolean {
  for (let index = before.length - 1; index >= 0; index -= 1) {
    const name = before[index].name
    if (name === "[") return true
    if (name === "]" || name === "newline") return false
  }
  return false
}

/**
 * Other statements, `class-statement`: whether `before` ends with the first
 * list of names of a `class` statement, `"class" name ( "," name )*`, with
 * no second list after it.
 */
function endsFirstListOfClassStatement(before: readonly AnyUnit[]): boolean {
  let index = before.length - 1
  while (before.at(index)?.name === "name") {
    if (before.at(index - 1)?.name !== ",") break
    index -= 2
  }
  return (
    before.at(index)?.name === "name" && before.at(index - 1)?.name === "class"
  )
}

/** The units of the journey diagram `text` as the parser's lexer reads them; null when `text` is no journey diagram or its lexer rejects it. */
function journeyLexingOf(text: string): JourneyUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "journey") return null
  try {
    return lexJourney(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** The units of the requirement diagram `text` as the parser's lexer reads them; null when `text` is no requirement diagram or its lexer rejects it. */
function requirementLexingOf(text: string): RequirementUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "requirement") return null
  try {
    return lexRequirement(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** diagrams/requirement.md, Requirements and Elements: the units that start a requirement or an element, whose body follows its name and classes. */
const REQUIREMENT_DEFINITION_KEYWORDS: readonly RequirementUnitName[] = [
  "requirement",
  "functionalRequirement",
  "interfaceRequirement",
  "performanceRequirement",
  "physicalRequirement",
  "designConstraint",
  "element",
]

/**
 * diagrams/requirement.md, Empty description blocks: the units after which
 * the statement before has not ended: the units that start a requirement
 * or an element, which a name follows; `:::` and `,`, which a name
 * follows; the keyword of a field and its `:`, which a value follows; and
 * the arrows and the relations of a relationship, which more of it
 * follows.
 */
const REQUIREMENT_UNFINISHED_AFTER: readonly RequirementUnitName[] = [
  ...REQUIREMENT_DEFINITION_KEYWORDS,
  ":::",
  ",",
  "id",
  "text",
  "risk",
  "verifyMethod",
  "type",
  "docref",
  ":",
  "-",
  "<-",
  "->",
  "contains",
  "copies",
  "derives",
  "satisfies",
  "verifies",
  "refines",
  "traces",
]

/** diagrams/requirement.md, Grammar: the units of a name, a class, or a name after `style`, `classDef`, or `class`. */
const REQUIREMENT_NAME_UNITS: readonly RequirementUnitName[] = [
  "unquoted-text",
  "string",
  "style-word",
]

/** diagrams/requirement.md, The style context: the units of a style other than a `style-word`. */
const REQUIREMENT_STYLE_MARKS: readonly RequirementUnitName[] = [
  "style-colon",
  "style-semicolon",
  "style-dash",
  "style-hash",
]

/**
 * diagrams/requirement.md, Empty description blocks: whether an empty
 * description block, with `before` the units before it, in source order,
 * stands where a statement starts or on a line of a body, rather than
 * inside a statement. It stands inside a statement after a unit of
 * {@link REQUIREMENT_UNFINISHED_AFTER}, and after a name that a statement
 * needs more after ({@link requirementNameEndsStatement}); everywhere else
 * the statement before has ended, or a body is open: after the header, a
 * `newline` unit, `{`, `}`, the risk or the method of a field, and a style.
 * `after` holds the units after the block, in source order, which decide
 * for a list of classes (see {@link requirementNameEndsStatement}).
 */
function requirementBlockStandsAlone(
  before: readonly AnyUnit[],
  after: readonly AnyUnit[],
): boolean {
  const last = requirementNameAt(before, before.length - 1)
  if (last === undefined) return true
  if (isRequirementUnitIn(REQUIREMENT_UNFINISHED_AFTER, last)) return false
  if (isRequirementUnitIn(REQUIREMENT_NAME_UNITS, last)) {
    const next = firstAfterEmptyDescriptionBlocks(after)?.name
    return requirementNameEndsStatement(before, next === ",")
  }
  return true
}

/** The name of the unit at `position` of `units`; undefined where there is none, before the first unit as after the last. */
function requirementNameAt(
  units: readonly AnyUnit[],
  position: number,
): string | undefined {
  return position < 0 ? undefined : units.at(position)?.name
}

/** Whether `name`, the name of a unit or undefined for none, is one of `names`. */
function isRequirementUnitIn(
  names: readonly RequirementUnitName[],
  name: string | undefined,
): boolean {
  return names.some((candidate) => candidate === name)
}

/**
 * The position in `units` of the unit before the list `name ( "," name )*`
 * whose last name is at `last`; -1 when the list starts the units.
 */
function beforeRequirementNameList(
  units: readonly AnyUnit[],
  last: number,
): number {
  let first = last
  while (
    requirementNameAt(units, first - 1) === "," &&
    isRequirementUnitIn(
      REQUIREMENT_NAME_UNITS,
      requirementNameAt(units, first - 2),
    )
  ) {
    first -= 2
  }
  return first - 1
}

/**
 * diagrams/requirement.md, Grammar: whether the name that `before` ends
 * with ends the statement it belongs to: the target of a relationship, the
 * value of a field, a class of a class shorthand statement, a class of a
 * `class` statement, and a style of a `style` or a `classDef` statement.
 * The name of a requirement or an element, which its body follows, a name
 * that starts a relationship or a class shorthand statement, a name of the
 * first list of a `class` statement, and a name after `style` or
 * `classDef`, which styles follow, do not. A list of classes goes on when
 * `commaFollows`, a `,` coming after the empty description blocks that
 * follow the name; a list of styles ends at the line feed that leaves the
 * style context, which comes before any block.
 */
function requirementNameEndsStatement(
  before: readonly AnyUnit[],
  commaFollows: boolean,
): boolean {
  const last = before.length - 1
  const previous = requirementNameAt(before, last - 1)
  if (previous === "->" || previous === "-" || previous === ":") return true
  if (isRequirementUnitIn(REQUIREMENT_STYLE_MARKS, previous)) return true
  const head = beforeRequirementNameList(before, last)
  const headName = requirementNameAt(before, head)
  if (headName === ":::") {
    const owner = requirementNameAt(before, head - 2)
    return (
      !commaFollows &&
      !isRequirementUnitIn(REQUIREMENT_DEFINITION_KEYWORDS, owner)
    )
  }
  if (isRequirementUnitIn(REQUIREMENT_NAME_UNITS, headName)) {
    const keyword = requirementNameAt(
      before,
      beforeRequirementNameList(before, head),
    )
    if (keyword === "class") return !commaFollows
    return keyword === "style" || keyword === "classDef"
  }
  return false
}

/** The units of kanban `text`; null when detection or lexing does not give kanban units. */
function kanbanLexingOf(text: string): KanbanUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "kanban") return null
  try {
    return lexKanban(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** The units of the mindmap `text` as the parser's lexer reads them, with its diagram comments; null when `text` is no mindmap or its lexer rejects it. */
function mindmapLexingOf(text: string): MindmapUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "mindmap") return null
  try {
    return lexMindmap(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** The Ishikawa units and comments, or null for another diagram or a lexical rejection. */
function ishikawaLexingOf(text: string): IshikawaUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "ishikawa") return null
  try {
    return lexIshikawa(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/**
 * known-divergences/blank-line-after-header-or-comments.md: one line of a
 * mindmap, kanban, or Ishikawa diagram, between two line breaks of its diagram text, as the parser's
 * lexer reads it: a line feed, or the end of a diagram comment that a
 * U+2028 or a U+2029 ends, is a line break (diagrams/mindmap.md, Whitespace
 * and lines).
 */
interface IndentedLine {
  /** The units on the line, the `newline` units left out. */
  readonly units: readonly (MindmapUnit | KanbanUnit | IshikawaUnit)[]
  /** The number of diagram comments on the line: one at most, as a comment runs to the end of its line. */
  readonly comments: number
  /** Whether the line starts at the U+2028 or the U+2029 that ended a diagram comment. */
  readonly afterSeparator: boolean
  /** Whether whitespace stands at the end of the line, before its line break, after a unit. */
  readonly endsWithWhitespace: boolean
}

/** The lines of mindmap, kanban, or Ishikawa `lexing`, in source order (see {@link IndentedLine}). */
function indentedLinesOf(
  lexing: MindmapUnits | KanbanUnits | IshikawaUnits,
): IndentedLine[] {
  const lines: IndentedLine[] = []
  let units: (MindmapUnit | KanbanUnit | IshikawaUnit)[] = []
  let trailingIndentation = false
  let afterSeparator = false
  // The comments are in source order; those before a line break are on the
  // line it ends.
  let nextComment = 0
  for (const unit of lexing.units) {
    if (unit.name !== "newline") {
      trailingIndentation = unit.name === "indentation"
      if (!trailingIndentation) units.push(unit)
      continue
    }
    const zeroWidth = unit.start === unit.end
    // A `newline` unit of n line feeds ends n lines, the last n - 1 of
    // which are empty; one with no characters ends the line of a comment
    // at a U+2028 or a U+2029.
    const breaks = zeroWidth ? 1 : [...unit.text].length
    let comments = 0
    while (
      nextComment < lexing.comments.length &&
      lexing.comments[nextComment].range[0] < unit.start
    ) {
      comments += 1
      nextComment += 1
    }
    lines.push({
      units,
      comments,
      afterSeparator,
      endsWithWhitespace:
        units.length > 0 &&
        ("whitespaceBefore" in unit
          ? unit.whitespaceBefore > 0
          : trailingIndentation),
    })
    for (let empty = 1; empty < breaks; empty += 1) {
      lines.push({
        units: [],
        comments: 0,
        afterSeparator: false,
        endsWithWhitespace: false,
      })
    }
    units = []
    trailingIndentation = false
    afterSeparator = zeroWidth
  }
  return lines
}

/**
 * known-divergences/blank-line-after-header-or-comments.md: the offsets, in
 * source order, of the statements of mindmap, kanban, or Ishikawa `text` before which
 * mermaid.js rejects the blank lines and the diagram comments that stand
 * there, in the four cases of the divergence, and of the first node in
 * case 1 and 2. A statement is a node line, an icon line, or a class line;
 * the header line with a node on it is a statement line. The lines come
 * from the parser's lexer (see {@link IndentedLine}); a line with no unit
 * and no comment is a blank line. Null when `text` is no mindmap, kanban, or
 * Ishikawa diagram, or its lexer rejects it.
 */
export function indentationBlankLinesRejectedByMermaid(
  text: string,
): number[] | null {
  const lexing =
    mindmapLexingOf(text) ?? kanbanLexingOf(text) ?? ishikawaLexingOf(text)
  if (lexing === null) return null
  const lines = indentedLinesOf(lexing)
  const offsets: number[] = []
  let anchor: IndentedLine | null = null
  let gap: IndentedLine[] = []
  for (const line of lines) {
    if (line.units.length === 0) {
      if (anchor !== null) gap.push(line)
      continue
    }
    const next = line.units[0].name === "header" ? line.units[1] : line.units[0]
    if (anchor !== null && next !== undefined) {
      if (indentedGapRejected(anchor, gap, line)) offsets.push(next.start)
    }
    anchor = line
    gap = []
  }
  return offsets
}

/**
 * known-divergences/blank-line-after-header-or-comments.md: whether
 * mermaid.js rejects the lines `gap` between the line `anchor`, the header
 * line or a statement line, and the statement line `next`. The count of
 * comments takes in the one on the line of `anchor`. Cases 1 and 2 hold
 * after a header line without a node, cases 3 and 4 after a statement.
 */
function indentedGapRejected(
  anchor: IndentedLine,
  gap: readonly IndentedLine[],
  next: IndentedLine,
): boolean {
  const count =
    anchor.comments + gap.reduce((sum, line) => sum + line.comments, 0)
  const lastComment = gap.findLastIndex((line) => line.comments > 0)
  // The lines after the last comment, or the whole gap when the comment is
  // on the line of the anchor or there is none: lines without a unit or a
  // comment, the blank lines.
  const afterLastComment = gap.slice(lastComment + 1)
  const blankAfterLastComment = afterLastComment.length > 0
  // The next statement follows the last comment on its line, after the
  // U+2028 or the U+2029 that ended it.
  const followsComment =
    next.afterSeparator && afterLastComment.length === 0 && count > 0
  const afterHeader =
    anchor.units.length === 1 && anchor.units[0].name === "header"
  if (afterHeader) {
    if (count % 2 === 0) {
      return blankAfterLastComment || (count === 0 && anchor.endsWithWhitespace)
    }
    return followsComment
  }
  if (count % 2 === 1) return blankAfterLastComment
  return count > 0 && followsComment
}

/** The units of the XY chart `text` as the parser's lexer reads them, with its diagram comments; null when `text` is no XY chart or its lexer rejects it. */
function xychartLexingOf(text: string): XychartUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "xychart") return null
  try {
    return lexXychart(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** The units of the block diagram `text` as the parser's lexer reads them; null when `text` is no block diagram or its lexer rejects it. */
function blockLexingOf(text: string): BlockUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "block") return null
  try {
    return lexBlock(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/**
 * diagrams/block.md, Empty description blocks: whether an empty
 * description block, with `before` the units before it and `after` the
 * units after it, in source order, stands where a statement starts rather
 * than inside a statement. It stands inside one after an arrow and after
 * `block:`, which a node must follow; before a width or a link, which go
 * on with the node before the block; and between an id and the opening of
 * its shape or block arrow.
 */
function blockDiagramBlockStandsAlone(
  before: readonly AnyUnit[],
  after: readonly AnyUnit[],
): boolean {
  const last = before.at(-1)?.name
  if (last === "arrow" || last === "block:") return false
  const next = firstAfterEmptyDescriptionBlocks(after)?.name
  if (next === ":" || next === "arrow" || next === "opening-arrow") {
    return false
  }
  return !(last === "id" && (next === "shape-open" || next === "<["))
}

/** The units of the quadrant chart `text` as the parser's lexer reads them, with its diagram comments; null when `text` is no quadrant chart or its lexer rejects it. */
function quadrantLexingOf(text: string): QuadrantUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "quadrantChart") return null
  try {
    return lexQuadrant(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/**
 * diagrams/quadrant.md, Empty description blocks: whether a statement
 * starts after `before`, the units before an empty description block
 * without its `space` units: after nothing, the header, a line break, a
 * `;`, or the `}` of a block before it.
 */
function quadrantStatementStartsAfter(before: readonly AnyUnit[]): boolean {
  const last = before.at(-1)?.name
  return (
    last === undefined ||
    last === "header" ||
    last === "newline" ||
    last === ";" ||
    last === "}"
  )
}

/** diagrams/xychart.md, Grammar: the keywords that start a statement that a title, its words, or its data may continue. */
const XYCHART_TEXT_STATEMENTS: readonly XychartUnitName[] = [
  "title",
  "x-axis",
  "y-axis",
  "line",
  "bar",
]

/**
 * diagrams/xychart.md, Empty description blocks: whether an empty
 * description block, with `before` the units before it and `after` the
 * units after it, in source order, stands where a statement starts rather
 * than inside a statement. It stands inside one inside the brackets of the
 * categories or the values; after a statement keyword, `[`, `,`, or `-->`;
 * after the first number of a range; after the title of a plot, which its
 * values follow; after the words of a title or of an axis title when a word
 * follows the block, and after the title of an axis when its data follows;
 * and after the header when an orientation follows. Everywhere else the
 * statement before it has ended.
 */
function xychartBlockStandsAlone(
  before: readonly AnyUnit[],
  after: readonly AnyUnit[],
): boolean {
  const last = before.at(-1)
  if (last === undefined) return true
  if (xychartInsideBrackets(before)) return false
  const next = firstAfterEmptyDescriptionBlocks(after)?.name
  switch (last.name) {
    case "title":
    case "x-axis":
    case "y-axis":
    case "line":
    case "bar":
    case "[":
    case ",":
    case "-->":
      return false
    case "header":
      return next !== "orientation"
    case "number":
      return before.at(-2)?.name === "-->"
    case "word":
    case "string":
      return !xychartTextGoesOn(before, last.name, next)
    default:
      return true
  }
}

/** Whether `before`, the units before a place, leave a `[` open there: the place lies inside the categories or the values. */
function xychartInsideBrackets(before: readonly AnyUnit[]): boolean {
  for (let index = before.length - 1; index >= 0; index -= 1) {
    const name = before[index].name
    if (name === "]") return false
    if (name === "[") return true
  }
  return false
}

/**
 * Whether the statement whose title ends with `before`, the last unit of
 * which is named `last`, a `word` or a `string`, goes on with the unit named
 * `next`: a title with more words, an axis with its data, and a plot, which
 * always goes on with its values.
 */
function xychartTextGoesOn(
  before: readonly AnyUnit[],
  last: string,
  next: string | undefined,
): boolean {
  const keyword = before.findLast((unit) =>
    XYCHART_TEXT_STATEMENTS.some((name) => name === unit.name),
  )?.name
  const moreWords = last === "word" && next === "word"
  switch (keyword) {
    case "title":
      return moreWords
    case "x-axis":
      return moreWords || next === "[" || next === "number"
    case "y-axis":
      return moreWords || next === "number"
    case "line":
    case "bar":
      return true
    default:
      return false
  }
}

/** The units of the timeline `text` as the parser's lexer reads them, with its diagram comments; null when `text` is no timeline or its lexer rejects it. */
function timelineLexingOf(text: string): TimelineUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "timeline") return null
  try {
    return lexTimeline(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** The units of the Gantt chart `text` as the parser's lexer reads them; null when `text` is no Gantt chart or its lexer rejects it. */
function ganttLexingOf(text: string): GanttUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "gantt") return null
  try {
    return lexGantt(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/**
 * diagrams/gantt.md, Empty description blocks, and Empty hrefs and empty
 * calls: the units of each empty form, an empty description block, an
 * empty href, and an empty call.
 */
const GANTT_EMPTY_FORM_UNITS: readonly (readonly string[])[] = [
  ["accDescr", "{", "}"],
  ["href", '"', '"'],
  ["call", "(", ")"],
]

/**
 * diagrams/gantt.md, Click statements: the units of each part, a link and
 * a call with arguments or without, each with the name of its keyword.
 */
const GANTT_PART_UNITS: readonly (readonly [string, readonly string[]])[] = [
  ["href", ["href", '"', "url-text", '"']],
  ["call", ["call", "callback-name", "(", ")"]],
  ["call", ["call", "callback-name", "(", "callback-arguments", ")"]],
]

/**
 * diagrams/gantt.md, Empty description blocks: whether an empty
 * description block, with `before` and `after` the units before and after
 * it, in source order, lies inside a click statement, between its ids and
 * its first part or between its two parts. It does where `before` ends
 * with `click`, its ids, and at most one part, and the first unit of
 * `after` after the empty forms there, of any kind, starts a part of the
 * other kind, a `call` or an `href` that starts no empty form.
 */
function ganttBlockInsideClickStatement(
  before: readonly AnyUnit[],
  after: readonly AnyUnit[],
): boolean {
  let index = 0
  for (;;) {
    const formNames = after.slice(index, index + 3).map((unit) => unit.name)
    const isForm = GANTT_EMPTY_FORM_UNITS.some((form) =>
      form.every((name, offset) => formNames[offset] === name),
    )
    if (!isForm) break
    index += 3
  }
  const next = after.at(index)?.name
  if (next !== "call" && next !== "href") return false
  const namesBefore = before.map((unit) => unit.name)
  const click = namesBefore.lastIndexOf("click")
  if (click === -1) return false
  const rest = namesBefore.slice(click + 1)
  const idCount = rest.findIndex((name) => name !== "id" && name !== ",")
  if (idCount === 0) return false
  if (idCount === -1) return true
  const firstPart = GANTT_PART_UNITS.find(
    ([, partNames]) =>
      partNames.length === rest.length - idCount &&
      partNames.every((name, offset) => rest[idCount + offset] === name),
  )
  return firstPart !== undefined && firstPart[0] !== next
}

/** The units of the state diagram `text` as the parser's lexer reads them; null when `text` is no state diagram or its lexer rejects it. */
function stateLexingOf(text: string): StateUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  const diagramType = detection.detected
  if (diagramType !== "stateDiagram") return null
  try {
    return lexState(diagramInputOf(opened, detection, diagramType))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/**
 * diagrams/state.md, Other statements: whether a statement starts at the
 * empty description block `block` of the state diagram `text`, from the
 * units `before` and `after` it. A statement starts where the text of a
 * line starts and right after each statement, so after every unit but
 * those that a statement continues after: `-->`, `:::`, and the string of
 * an alias. A block right after a state reference on its line, an `id` or
 * `[*]` unit, lies inside the statement of the reference when the unit
 * after it and the empty description blocks right after it continues that
 * statement: `-->`, `:::`, or a description, as in `A accDescr {} --> B` and
 * `A accDescr {} accDescr {} : x`. After a `click` on its line, no statement starts:
 * a click statement needs a separator (Click statements). The blocks before
 * the `{` of a body on the line after a name or an alias id, which the tree
 * holds in `textBeforeBody` (Composite states, aliases, and pseudostates),
 * stand where the text of that line starts or after another such block, so
 * they are kept too.
 */
function stateStatementStartsAt(
  text: string,
  before: readonly AnyUnit[],
  block: EmptyForm<AnyUnit>,
  after: readonly AnyUnit[],
): boolean {
  const last = before.at(-1)
  if (last === undefined) return true
  const between = text.slice(last.end, block.range[0])
  if (between.includes("\n") || between.includes("\r")) return true
  const names = before.map((unit) => unit.name)
  if (names.includes("click", names.lastIndexOf("newline") + 1)) return false
  const next = firstAfterEmptyDescriptionBlocks(after)?.name
  if (
    (last.name === "id" || last.name === "[*]") &&
    (next === "-->" || next === ":::" || next === "description")
  ) {
    return false
  }
  switch (last.name) {
    case "-->":
    case ":::":
    case "string":
      return false
    default:
      return true
  }
}

/** diagrams/class.md, The direction line: the values of a direction. */
const CLASS_DIRECTIONS: readonly string[] = ["TB", "BT", "RL", "LR"]

/**
 * `docs/testing.md`, Known divergences, `tokenless-empty-forms`: the range
 * that the reference input of a class diagram, whose units are `units`,
 * leaves out for the removed empty form `form`: the form, and for each of
 * the empty description blocks between `direction` and its value on one
 * line, also the whitespace around it, so that the two form one word, as
 * mermaid.js joins the two name parts
 * (`direction accDescr {} LR` and `direction accDescr {}accDescr {}LR`
 * become `directionLR`).
 */
function classRemovedRangeOf(
  units: readonly AnyUnit[],
  form: EmptyForm<AnyUnit>,
): Range {
  if (form.kind !== "empty-description-block") return form.range
  const first = form.units[0].index
  const last = form.units.at(-1)?.index ?? first
  let before = first - 1
  while (startsEmptyDescriptionBlock(units, before, -1)) before -= 3
  let after = last + 1
  while (startsEmptyDescriptionBlock(units, after, 1)) after += 3
  const word = units.at(before)
  const value = units.at(after)
  const previous = units.at(first - 1)
  const next = units.at(last + 1)
  if (
    word?.name === "word" &&
    word.text === "direction" &&
    value?.name === "word" &&
    CLASS_DIRECTIONS.includes(value.text) &&
    previous !== undefined &&
    next !== undefined
  ) {
    return [previous.end, next.start]
  }
  return form.range
}

/**
 * diagrams/class.md, Diagram and statements, and Empty description blocks:
 * whether a statement starts after `before`, the units before the place,
 * in source order: after a line break, and after an empty description
 * block, which another statement follows on its line.
 */
function classStatementStartsAfter(before: readonly AnyUnit[]): boolean {
  const last = before.at(-1)
  switch (last?.name) {
    case "newline":
      return true
    case "}":
      return before.at(-2)?.name === "{" && before.at(-3)?.name === "accDescr"
    default:
      return false
  }
}

/**
 * diagrams/sequence.md, Diagram and statements: whether a statement starts
 * after `before`, the units before the place, in source order: after a
 * line break or a `;`, after the keyword `sequenceDiagram`, after the `end`
 * of a box or a block, after a title or an accessibility statement, which
 * run to the end of their line or block, and after a line of an `invalid`
 * unit.
 */
function sequenceStatementStartsAfter(before: readonly AnyUnit[]): boolean {
  const last = before.at(-1)
  switch (last?.name) {
    case "newline":
    case "sequenceDiagram":
    case "end":
    case "title-text":
    case "description-text":
    case "invalid":
      return true
    case "}":
      // The `}` of a description block, with text or empty.
      return (
        before.at(-2)?.name === "description-block-text" ||
        (before.at(-2)?.name === "{" && before.at(-3)?.name === "accDescr")
      )
    default:
      return false
  }
}

/**
 * diagrams/flowchart.md, Diagram and statements: whether a statement starts
 * after `before`, the units before the place, in source order: what the
 * last of them is.
 */
function flowchartStatementStartsAfter(before: readonly AnyUnit[]): boolean {
  const last = before.at(-1)
  switch (last?.name) {
    case "newline":
    case ";":
    case "end":
    case "no-direction":
      return true
    case "}":
      // The `}` of a description block, with text or empty.
      return (
        before.at(-2)?.name === "description-block-text" ||
        (before.at(-2)?.name === "{" && before.at(-3)?.name === "accDescr")
      )
    default:
      return false
  }
}

/** The specification's agentflow units, including retained forms and preserved comments. */
export function agentflowLexingOf(text: string): AgentflowUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  if (detection.detected !== "agentflow") return null
  try {
    return lexAgentflow(diagramInputOf(opened, detection, "agentflow"))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** Treemap ordered lexical units, including visible indentation and composite boundaries. */
export function treemapLexingOf(text: string): TreemapUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  if (detection.detected !== "treemap") return null
  try {
    return lexTreemap(diagramInputOf(opened, detection, "treemap"))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** Railroad ordered lexical units, including visible indentation and composite boundaries. */
export function railroadLexingOf(text: string): RailroadUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  if (
    detection.detected !== "railroad" &&
    detection.detected !== "railroadEbnf" &&
    detection.detected !== "railroadAbnf" &&
    detection.detected !== "railroadPeg"
  )
    return null
  try {
    return lexRailroad(diagramInputOf(opened, detection, detection.detected))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** Wardley ordered units, retaining common conversions and complete authored component boundaries. */
export function wardleyLexingOf(text: string): WardleyUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  if (detection.detected !== "wardley") return null
  try {
    return lexWardley(diagramInputOf(opened, detection, "wardley"))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** Cynefin ordered units, retaining common conversions and complete authored component boundaries. */
export function cynefinLexingOf(text: string): CynefinUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  if (detection.detected !== "cynefin") return null
  try {
    return lexCynefin(diagramInputOf(opened, detection, "cynefin"))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** Eventmodeling ordered units, retaining common conversions and complete authored component boundaries. */
export function eventmodelingLexingOf(text: string): EventmodelingUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  if (detection.detected !== "eventmodeling") return null
  try {
    return lexEventmodeling(diagramInputOf(opened, detection, "eventmodeling"))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** Treeview ordered units and direct box forms, at their original source positions. */
export function treeviewLexingOf(text: string): TreeviewUnits | null {
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  if (detection.detected !== "treeView") return null
  try {
    return lexTreeview(diagramInputOf(opened, detection, "treeView"))
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}
