import type { Range, Root } from "../../src/index.ts"
import { ParseError, traverseNodes, visitorKeys } from "../../src/index.ts"
import { buildDetectionInput, detect } from "../../src/detection.ts"
import { findDirectives } from "../../src/directives.ts"
import { lexFlowchart } from "../../src/diagrams/flowchart/index.ts"
import type { SequenceUnits } from "../../src/diagrams/sequence/index.ts"
import { lexSequence } from "../../src/diagrams/sequence/index.ts"
import type { DiagramUnit } from "../../src/diagram-units.ts"
import type { EmptyForm } from "../../src/empty-forms.ts"
import { emptyFormsOf } from "../../src/empty-forms.ts"
import type {
  FlowchartLexing,
  Unit,
} from "../../src/diagrams/flowchart/units.ts"
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
 * only in rejecting a directive inside a unit that is not `RawText` or
 * `Identifier`; the reference input has no directive, so the parser must
 * give for it what mermaid.js gives for `text`. The directives are the
 * ones the parser finds; the fixtures and the comparison of every other
 * input check that scan.
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
 * `text` with every `<` of its frontmatter trivia replaced by `(`: the
 * reference input for `html-tag-in-frontmatter`. No tag starts in the
 * frontmatter of the result, so mermaid.js, which looks for HTML tags from
 * the start of the source, finds in it the tags that the specification
 * finds in the original. The replacement has the same length, so offsets
 * stay. It changes the YAML where the `<` was: a value such as the title
 * then holds `(`, a merge key `<<` or a verbatim tag `!<...>` is no longer
 * one. A comparison therefore takes the values that depend on the
 * frontmatter (title, configuration) from the run of mermaid.js on the
 * reference input, and leaves out a reference input that mermaid.js rejects
 * for its embedded data.
 */
export function withoutFrontmatterTagStarts(text: string): string {
  const textStart = textStartOf(text)
  let frontmatter = ""
  for (const character of text.slice(0, textStart)) {
    frontmatter += character === "<" ? "(" : character
  }
  return frontmatter + text.slice(textStart)
}

/**
 * known-divergences.md, `html-tag-in-frontmatter`: whether mermaid.js reads a different
 * set of `"` characters of the text as `'` than the specification does.
 * mermaid.js finds the tags from the start of the source, so a tag that
 * starts in the frontmatter can reach into the text; the specification
 * finds them from the start of the text. The tests declare the divergence
 * with this; the parser does not tell such an input apart.
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
 * known-divergences.md, `click-reserved-word`: the `click` units of the flowchart
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
 * known-divergences.md, `click-reserved-word`: the reference input of the flowchart
 * `text`. mermaid.js gives it the Db of `text` where it accepts it, where
 * its units are kept ({@link ClickReference.keepsUnits}), and where the text
 * of each click id lies within one leaf node of its tree
 * ({@link clickIdsWithinLeafNodes}). Null where {@link reservedClicksIn} is.
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
 * known-divergences.md, `click-reserved-word`: whether the text of each click id of
 * `reference` lies within the range of one leaf node of `root`, the tree
 * of the reference input. A leaf node is one without child fields.
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
 * known-divergences.md, `comment-takes-character`: the offsets, in source
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

/** A unit of any diagram's lexer. */
type AnyUnit = DiagramUnit<string>

/**
 * The units of a diagram text as the parser's lexer reads them, and how a
 * statement start is found among them: whether a statement starts after
 * the units before a place.
 */
interface DiagramUnits {
  readonly units: readonly AnyUnit[]
  readonly startsStatementAfter: (before: readonly AnyUnit[]) => boolean
}

/**
 * known-divergences.md, `tokenless-empty-forms`: the empty forms of `text`
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
 * `call` to its `)`, and each empty description block that does not start a
 * statement from its `accDescr` to its `}`. This is the reference input
 * for `tokenless-empty-forms`; null where {@link removedEmptyFormsIn} is.
 */
export function withoutEmptyForms(text: string): string | null {
  const removed = removedEmptyFormsIn(text)
  if (removed === null) return null
  return withoutCommentRegionsAnd(
    text,
    removed.map((form) => form.range),
  ).text
}

/**
 * known-divergences.md, `tokenless-empty-forms`: whether the parser's lexer reads the
 * reference input of the flowchart `text` ({@link withoutEmptyForms}) as
 * the units of `text` other than those of the removed empty forms, the
 * same names with the same texts in the same order. Only then does the
 * removal leave the units around each form as they were, and mermaid.js
 * gives the reference input, where it accepts it, the Db of `text`.
 */
export function keepsUnitsWithoutEmptyForms(text: string): boolean {
  const diagram = diagramUnitsOf(text)
  if (diagram === null) return false
  const forms = removedEmptyFormsOf(diagram)
  const removed = new Set(forms.flatMap((form) => form.units))
  return readsAsUnits(
    withoutCommentRegionsAnd(
      text,
      forms.map((form) => form.range),
    ),
    diagram.units.filter((unit) => !removed.has(unit)),
    new Set(),
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
 * description block that does not start a statement. Whether a block
 * starts one is read from the units before it other than the `space` units
 * and the units of the empty forms found here already, which mermaid.js
 * does not see.
 */
function removedEmptyFormsOf({
  units,
  startsStatementAfter,
}: DiagramUnits): EmptyForm<AnyUnit>[] {
  const removed: EmptyForm<AnyUnit>[] = []
  const removedUnits = new Set<AnyUnit>()
  for (const form of emptyFormsOf(units)) {
    if (form.kind === "empty-description-block") {
      const before = units
        .slice(0, form.units[0].index)
        .filter((unit) => unit.name !== "space" && !removedUnits.has(unit))
      if (startsStatementAfter(before)) continue
    }
    removed.push(form)
    for (const unit of form.units) removedUnits.add(unit)
  }
  return removed
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
      startsStatementAfter: sequenceStatementStartsAfter,
    }
  }
  return null
}

/** The units of a flowchart, with how a statement start is found among them. */
function flowchartUnits(units: readonly Unit[]): DiagramUnits {
  return { units, startsStatementAfter: flowchartStatementStartsAfter }
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
