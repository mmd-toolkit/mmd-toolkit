import type { Range, Root } from "../../src/index.ts"
import { ParseError, traverseNodes, visitorKeys } from "../../src/index.ts"
import { buildDetectionInput, detect } from "../../src/detection.ts"
import { findDirectives } from "../../src/directives.ts"
import type { ClassUnits } from "../../src/diagrams/class/index.ts"
import { lexClass } from "../../src/diagrams/class/index.ts"
import { MISSING_HEADER_MESSAGE } from "../../src/diagrams/class/units.ts"
import { lexFlowchart } from "../../src/diagrams/flowchart/index.ts"
import type { SequenceUnits } from "../../src/diagrams/sequence/index.ts"
import { lexSequence } from "../../src/diagrams/sequence/index.ts"
import type { StateUnits } from "../../src/diagrams/state/index.ts"
import { lexState } from "../../src/diagrams/state/index.ts"
import type { DiagramUnit } from "../../src/diagram-units.ts"
import type { EmptyForm } from "../../src/empty-forms.ts"
import { EMPTY_FORM_KINDS, emptyFormsOf } from "../../src/empty-forms.ts"
import type { EmptyFormKind } from "../../src/empty-forms.ts"
import type {
  FlowchartLexing,
  Unit,
} from "../../src/diagrams/flowchart/units.ts"
import { isWordCharacter } from "../../src/character-classes.ts"
import { openSource } from "../../src/parse.ts"
import { readFrontmatterTrivia } from "../../src/frontmatter.ts"
import { findAttributeQuotes } from "../../src/html-quotes.ts"
import { LineIndex } from "../../src/positions.ts"

/** Where the text after the frontmatter trivia starts. */
export function textStartOf(text: string): number {
  return readFrontmatterTrivia(text, new LineIndex(text))?.textStart ?? 0
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
  for (const entry of openSource(text).lexer.lineEntries()) {
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
  const { lexer, frontmatter } = openSource(text)
  const diagramType = detect(buildDetectionInput(lexer).detectionText)
  if (diagramType !== "classDiagram") return false
  try {
    lexClass({ lexer, frontmatter, diagramType })
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
 * nothing for: every empty string and every empty call, and every empty
 * description block that is no statement, neither where a statement
 * starts nor before its separator. Whether a block is one is read from the
 * units around it other than the `space` units, and, before it, other than
 * the units of the empty forms found here already, which mermaid.js does
 * not see.
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
  for (const entry of openSource(text).lexer.lineEntries()) {
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
  const { lexer, frontmatter } = openSource(text)
  const diagramType = detect(buildDetectionInput(lexer).detectionText)
  if (
    diagramType !== "flowchart-v2" &&
    diagramType !== "flowchart-elk" &&
    diagramType !== "swimlane"
  ) {
    return null
  }
  try {
    return lexFlowchart({ lexer, frontmatter, diagramType })
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
  const { lexer, frontmatter } = openSource(text)
  const diagramType = detect(buildDetectionInput(lexer).detectionText)
  if (diagramType !== "sequence") return null
  try {
    return lexSequence({ lexer, frontmatter, diagramType })
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** The units of the class diagram `text` as the parser's lexer reads them; null when `text` is no class diagram or its lexer rejects it. */
function classLexingOf(text: string): ClassUnits | null {
  const { lexer, frontmatter } = openSource(text)
  const diagramType = detect(buildDetectionInput(lexer).detectionText)
  if (diagramType !== "classDiagram") return null
  try {
    return lexClass({ lexer, frontmatter, diagramType })
  } catch (error) {
    if (error instanceof ParseError) return null
    throw error
  }
}

/** The units of the state diagram `text` as the parser's lexer reads them; null when `text` is no state diagram or its lexer rejects it. */
function stateLexingOf(text: string): StateUnits | null {
  const { lexer, frontmatter } = openSource(text)
  const diagramType = detect(buildDetectionInput(lexer).detectionText)
  if (diagramType !== "stateDiagram") return null
  try {
    return lexState({ lexer, frontmatter, diagramType })
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
