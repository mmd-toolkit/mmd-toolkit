import { appendItems } from "../../append-items.ts"
import { isWhitespace } from "../../character-classes.ts"
import {
  ASTERISK,
  DOLLAR_SIGN,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LEFT_PARENTHESIS,
  LESS_THAN_SIGN,
  LINE_SEPARATOR,
  NUMBER_SIGN,
  PARAGRAPH_SEPARATOR,
  PLUS_SIGN,
  RIGHT_PARENTHESIS,
  SPACE,
  TILDE,
} from "../../code-points.ts"
import type { DiagramCharacter, DiagramPosition } from "../../diagram-text.ts"

/** diagrams/class.md, Member lines: the units that a member line is divided into. */
export type MemberLineUnitName =
  | "blank-member"
  | "<<"
  | ">>"
  | "annotation-name"
  | "visibility"
  | "member-name"
  | "("
  | "parameters"
  | ")"
  | "classifier"
  | "return-type"
  | "ignored-text"

/** diagrams/class.md, Member lines: what a member line is. */
export type MemberLineKind = "blank" | "annotation" | "method" | "attribute"

/** One unit of a member line: its name and its characters, from `from` up to, and not including, `to`. */
export interface MemberLinePart {
  readonly name: MemberLineUnitName
  readonly from: DiagramCharacter
  readonly to: DiagramPosition
}

/** A member line, divided: what it is, and its units in source order. */
export interface DividedMemberLine {
  readonly kind: MemberLineKind
  readonly parts: readonly MemberLinePart[]
}

/** Member lines: the visibility marks, at the start of a method or attribute line. */
const VISIBILITY_MARKS: readonly number[] = [
  PLUS_SIGN,
  HYPHEN_MINUS,
  NUMBER_SIGN,
  TILDE,
]

/** Member lines: the classifier marks. */
const CLASSIFIER_MARKS: readonly number[] = [DOLLAR_SIGN, ASTERISK]

/** A part of a text, as indices into its characters: from `start` up to, and not including, `end`. */
interface Span {
  readonly start: number
  readonly end: number
}

/** The parts of a method line around and inside its parentheses, as found in one text. */
interface MethodDivision {
  readonly parts: readonly NamedSpan[]
  /** Where the return type ends, the start of what follows the part that mermaid.js reads. */
  readonly end: number
}

/** A span with the name of the unit that it is. */
interface NamedSpan extends Span {
  readonly name: MemberLineUnitName
}

/** The steps of Member lines over the characters of one line. */
class MemberLineDivision {
  private readonly characters: readonly DiagramCharacter[]

  public constructor(characters: readonly DiagramCharacter[]) {
    this.characters = characters
  }

  /** `span` without the whitespace at its ends; null when it is empty or all whitespace. */
  public trimmed(span: Span): Span | null {
    let { start, end } = span
    while (start < end && this.isWhitespaceAt(start)) start += 1
    while (end > start && this.isWhitespaceAt(end - 1)) end -= 1
    return start === end ? null : { start, end }
  }

  /**
   * Member lines: the `member-name` unit of the member name text `text`:
   * the text without the whitespace at its end, and without the whitespace
   * at its start unless its first character is a space (U+0020), which
   * mermaid.js reads; a text of only whitespace is the unit when it starts
   * with a space. Null when there is no unit, also for an empty text, whose
   * first character is none.
   */
  public memberNameOf(text: Span): Span | null {
    const trimmed = this.trimmed(text)
    if (text.start === text.end || !this.isAt(text.start, SPACE)) return trimmed
    return { start: text.start, end: trimmed?.end ?? text.end }
  }

  /**
   * Member lines: what the member text `text` is, an annotation line, a
   * method line, or an attribute line, tried in that order, and its units;
   * null units for a method line that cannot be divided.
   */
  public divide(text: Span): {
    readonly kind: MemberLineKind
    readonly spans: readonly NamedSpan[] | null
  } {
    if (this.isAnnotationLine(text)) {
      return {
        kind: "annotation",
        spans: this.annotationLine(text),
      }
    }
    if (this.isMethodLine(text)) {
      return { kind: "method", spans: this.methodLine(text) }
    }
    return { kind: "attribute", spans: this.attributeLine(text) }
  }

  /** Member lines, item 1: the member text starts with `<<` and ends with `>>`. */
  public isAnnotationLine(text: Span): boolean {
    return (
      text.end - text.start >= 4 &&
      this.isAt(text.start, LESS_THAN_SIGN) &&
      this.isAt(text.start + 1, LESS_THAN_SIGN) &&
      this.isAt(text.end - 2, GREATER_THAN_SIGN) &&
      this.isAt(text.end - 1, GREATER_THAN_SIGN)
    )
  }

  /** Member lines, item 1: `<<`, the text between, whitespace included, when it is not empty, and `>>`. */
  public annotationLine(text: Span): NamedSpan[] {
    const spans: NamedSpan[] = [
      { name: "<<", start: text.start, end: text.start + 2 },
    ]
    if (text.end - 2 > text.start + 2) {
      spans.push({
        name: "annotation-name",
        start: text.start + 2,
        end: text.end - 2,
      })
    }
    spans.push({ name: ">>", start: text.end - 2, end: text.end })
    return spans
  }

  /** Member lines, item 2: the member text has a `)`, and its first `)` is not its first character. */
  public isMethodLine(text: Span): boolean {
    for (let index = text.start; index < text.end; index += 1) {
      if (this.isAt(index, RIGHT_PARENTHESIS)) return index !== text.start
    }
    return false
  }

  /**
   * Member lines: an attribute line, a `visibility` unit for a visibility
   * mark at its start, a `classifier` unit for a classifier mark at its end,
   * and the `member-name` unit of the text between, its member name text
   * (see {@link MemberLineDivision.memberNameOf}).
   */
  public attributeLine(text: Span): NamedSpan[] {
    const spans: NamedSpan[] = []
    let { start, end } = text
    if (this.isMarkAt(start, VISIBILITY_MARKS)) {
      spans.push({ name: "visibility", start, end: start + 1 })
      start += 1
    }
    let classifier: NamedSpan | null = null
    if (end > start && this.isMarkAt(end - 1, CLASSIFIER_MARKS)) {
      classifier = { name: "classifier", start: end - 1, end }
      end -= 1
    }
    const name = this.memberNameOf({ start, end })
    if (name !== null) spans.push({ name: "member-name", ...name })
    if (classifier !== null) spans.push(classifier)
    return spans
  }

  /**
   * Member lines: a method line. Without U+2028 and U+2029, the member text
   * is divided; with them, the first of its segments that can be divided
   * is, and the text before that segment and after the return type are
   * `ignored-text` units. Null when nothing can be divided.
   */
  public methodLine(text: Span): NamedSpan[] | null {
    const segments = this.segmentsOf(text)
    for (const [index, segment] of segments.entries()) {
      const next = segments.at(index + 1)
      const division = this.divideWithVisibility(segment, next ?? null)
      if (division === null) continue
      const spans: NamedSpan[] = []
      const before = this.trimmed({ start: text.start, end: segment.start })
      if (before !== null) spans.push({ name: "ignored-text", ...before })
      appendItems(spans, division.parts)
      const after = this.trimmed({ start: division.end, end: text.end })
      if (after !== null) spans.push({ name: "ignored-text", ...after })
      return spans
    }
    return null
  }

  /** Member lines: the parts of `text` between U+2028 and U+2029, its segments; `text` itself without either. */
  private segmentsOf(text: Span): Span[] {
    const segments: Span[] = []
    let start = text.start
    for (let index = text.start; index < text.end; index += 1) {
      if (this.isMarkAt(index, [LINE_SEPARATOR, PARAGRAPH_SEPARATOR])) {
        segments.push({ start, end: index })
        start = index + 1
      }
    }
    segments.push({ start, end: text.end })
    return segments
  }

  /**
   * Member lines: the division of a method text, `segment`, as it is
   * written, with the whitespace at its start. The visibility mark, if it
   * is the first character of the text, is set apart and the rest divided;
   * when the rest cannot be divided, the whole text is. `next` is the
   * segment after it, if any, into which the return type runs when the
   * closing parenthesis is the last character of `segment`.
   */
  private divideWithVisibility(
    segment: Span,
    next: Span | null,
  ): MethodDivision | null {
    if (this.trimmed(segment) === null) return null
    if (this.isMarkAt(segment.start, VISIBILITY_MARKS)) {
      const rest = this.divideAtParentheses(
        { start: segment.start + 1, end: segment.end },
        segment,
        next,
      )
      if (rest !== null) {
        return {
          ...rest,
          parts: [
            {
              name: "visibility",
              start: segment.start,
              end: segment.start + 1,
            },
            ...rest.parts,
          ],
        }
      }
    }
    return this.divideAtParentheses(segment, segment, next)
  }

  /**
   * Member lines: `text` divided at its opening parenthesis, the last `(`
   * that is not its first character and that a `)` follows, and at its
   * closing parenthesis, the last `)`. Null when it has no opening
   * parenthesis.
   */
  private divideAtParentheses(
    text: Span,
    segment: Span,
    next: Span | null,
  ): MethodDivision | null {
    let closing = -1
    for (let index = text.end - 1; index >= text.start; index -= 1) {
      if (this.isAt(index, RIGHT_PARENTHESIS)) {
        closing = index
        break
      }
    }
    let opening = -1
    for (let index = closing - 1; index > text.start; index -= 1) {
      if (this.isAt(index, LEFT_PARENTHESIS)) {
        opening = index
        break
      }
    }
    if (closing === -1 || opening === -1) return null
    const spans: NamedSpan[] = []
    const name = this.memberNameOf({ start: text.start, end: opening })
    if (name !== null) spans.push({ name: "member-name", ...name })
    spans.push({ name: "(", start: opening, end: opening + 1 })
    const parameters = this.trimmed({ start: opening + 1, end: closing })
    if (parameters !== null) spans.push({ name: "parameters", ...parameters })
    spans.push({ name: ")", start: closing, end: closing + 1 })
    // The return type runs to the end of the segment, or to the end of the
    // next segment when the closing parenthesis ends this one.
    const returnEnd =
      closing === segment.end - 1 && next !== null ? next.end : segment.end
    let returnStart = closing + 1
    let classifierFound = false
    if (
      returnStart < returnEnd &&
      this.isMarkAt(returnStart, CLASSIFIER_MARKS)
    ) {
      spans.push({
        name: "classifier",
        start: returnStart,
        end: returnStart + 1,
      })
      returnStart += 1
      classifierFound = true
    }
    const returnType = this.trimmed({ start: returnStart, end: returnEnd })
    if (returnType !== null) {
      if (
        !classifierFound &&
        this.isMarkAt(returnType.end - 1, CLASSIFIER_MARKS)
      ) {
        // mermaid.js trims the return type before it removes the mark, so
        // the whitespace before the mark is part of the return type.
        if (returnType.end - 1 > returnType.start) {
          spans.push({
            name: "return-type",
            start: returnType.start,
            end: returnType.end - 1,
          })
        }
        spans.push({
          name: "classifier",
          start: returnType.end - 1,
          end: returnType.end,
        })
      } else {
        spans.push({ name: "return-type", ...returnType })
      }
    }
    return {
      parts: spans,
      end: returnEnd,
    }
  }

  /** Whether the character at `index` is `codePoint`. */
  private isAt(index: number, codePoint: number): boolean {
    return this.characters[index]?.codePoint === codePoint
  }

  /** Whether the character at `index` is one of `marks`. */
  private isMarkAt(index: number, marks: readonly number[]): boolean {
    const character = this.characters.at(index)
    return character !== undefined && marks.includes(character.codePoint)
  }

  /** Whether the character at `index` is whitespace. */
  private isWhitespaceAt(index: number): boolean {
    return isWhitespace(this.characters[index].codePoint)
  }
}

/**
 * diagrams/class.md, Member lines: the division of one member line, the
 * characters `characters`, which `end` follows. The whitespace at the ends
 * of the line belongs to no unit, and a line of only whitespace is a
 * `blank-member` unit. Null when the line is a method line that cannot be
 * divided, which the caller rejects.
 */
export function divideMemberLine(
  characters: readonly DiagramCharacter[],
  end: DiagramPosition,
): DividedMemberLine | null {
  const division = new MemberLineDivision(characters)
  const text = division.trimmed({ start: 0, end: characters.length })
  if (text === null) {
    return {
      kind: "blank",
      parts: [{ name: "blank-member", from: characters[0], to: end }],
    }
  }
  const { kind, spans } = division.divide(text)
  if (spans === null) return null
  return {
    kind,
    parts: spans.map((span) => ({
      name: span.name,
      from: characters[span.start],
      to: characters.at(span.end) ?? end,
    })),
  }
}
