import type { DiagramTokenKind, Frontmatter, Range } from "./ast.ts"
import {
  FRONTMATTER_DELIMITER,
  isLineWhitespace,
  isWhitespace,
} from "./character-classes.ts"
import type { LineIndex } from "./positions.ts"
import {
  lineTerminatorEnd,
  matchCharacters,
  matchCodePoints,
  nextOffset,
  skipWhile,
} from "./text-cursor.ts"

/**
 * common.md, Frontmatter: where the parts of a frontmatter block are. Every
 * offset is relative to the text the block was found in.
 */
export interface FrontmatterMatch {
  /** Where the block starts: the start of the opening line, indent included. */
  readonly start: number
  /** Where the `---` of the opening line starts, after its indent. */
  readonly openingDelimiterStart: number
  /** Just after the `---` of the closing line. */
  readonly closingDelimiterEnd: number
  /** Where the body starts and ends: the body's lines without the last line terminator. */
  readonly bodyStart: number
  readonly bodyEnd: number
  /**
   * Where the frontmatter trivia ends: after the line terminator of the
   * closing line and the whitespace-only lines after it.
   */
  readonly end: number
}

/** One line of the text: its content and the line terminator that ends it. */
interface Line {
  readonly start: number
  /** Just after the last content character, before the line terminator. */
  readonly contentEnd: number
  /** Just after the line terminator, or `contentEnd` when the text ends first. */
  readonly next: number
  readonly hasTerminator: boolean
}

/** Reads the line that starts at `offset`. */
function readLine(text: string, offset: number): Line {
  let current = offset
  while (current < text.length) {
    const terminatorEnd = lineTerminatorEnd(text, current)
    if (terminatorEnd !== null) {
      return {
        start: offset,
        contentEnd: current,
        next: terminatorEnd,
        hasTerminator: true,
      }
    }
    current = nextOffset(text, current)
  }
  return {
    start: offset,
    contentEnd: current,
    next: current,
    hasTerminator: false,
  }
}

/** Notation: a whitespace-only line is empty or consists of line whitespace. */
function isWhitespaceOnly(text: string, line: Line): boolean {
  return skipWhile(text, line.start, isLineWhitespace) >= line.contentEnd
}

/**
 * Frontmatter, condition 3: the indent of a delimiter line equals the
 * opening indent character for character. `indent` is the line whitespace
 * cut from the opening line. Returns the offset after it, or null.
 */
function matchIndent(
  text: string,
  offset: number,
  indent: string,
): number | null {
  return matchCharacters(text, offset, indent)
}

/**
 * Frontmatter, condition 3: a delimiter line consists of exactly `indent`,
 * `---`, optional line whitespace, and a line terminator. Returns the offset
 * after the `---`, or null.
 */
function delimiterEnd(text: string, line: Line, indent: string): number | null {
  if (!line.hasTerminator) return null
  const afterIndent = matchIndent(text, line.start, indent)
  if (afterIndent === null) return null
  const afterDashes = matchCodePoints(text, afterIndent, FRONTMATTER_DELIMITER)
  if (afterDashes === null) return null
  if (skipWhile(text, afterDashes, isLineWhitespace) !== line.contentEnd) {
    return null
  }
  return afterDashes
}

/**
 * common.md, Frontmatter: decides whether the text has frontmatter starting
 * at `start`, and where its parts are. Returns null when it has none.
 */
export function matchFrontmatter(
  text: string,
  start: number,
): FrontmatterMatch | null {
  // Condition 1: the opening line is an indent, `---`, optional line
  // whitespace, and a line terminator.
  const indentEnd = skipWhile(text, start, isLineWhitespace)
  const indent = text.slice(start, indentEnd)
  const openingLine = readLine(text, start)
  if (delimiterEnd(text, openingLine, indent) === null) return null

  // Condition 4: the first content line is the first line after the opening
  // line that is not whitespace-only. The whitespace-only lines before it are
  // remembered for condition 5.
  let lastWhitespaceOnlyLine: Line | null = null
  let line = readLine(text, openingLine.next)
  while (isWhitespaceOnly(text, line)) {
    if (!line.hasTerminator) return null
    lastWhitespaceOnlyLine = line
    line = readLine(text, line.next)
  }
  const firstContentLine = line

  // Condition 4: the closing line is the first delimiter line after the first
  // content line, and the body runs from the first content line up to it.
  let previousLine = firstContentLine
  while (previousLine.hasTerminator) {
    line = readLine(text, previousLine.next)
    const closingDelimiterEnd = delimiterEnd(text, line, indent)
    if (closingDelimiterEnd !== null) {
      return finish(
        text,
        start,
        indentEnd,
        firstContentLine.start,
        previousLine.contentEnd,
        line,
        closingDelimiterEnd,
      )
    }
    previousLine = line
  }

  // Condition 5: the first content line is itself the closing line when it is
  // a delimiter line and a whitespace-only line lies before it; the body is
  // the last of those lines.
  const firstContentDelimiterEnd = delimiterEnd(text, firstContentLine, indent)
  if (firstContentDelimiterEnd === null || lastWhitespaceOnlyLine === null) {
    return null
  }
  return finish(
    text,
    start,
    indentEnd,
    lastWhitespaceOnlyLine.start,
    lastWhitespaceOnlyLine.contentEnd,
    firstContentLine,
    firstContentDelimiterEnd,
  )
}

/**
 * Builds the match once the closing line is known. The frontmatter trivia
 * extends through the closing line's terminator and the whitespace-only
 * lines after it, with their line terminators; a whitespace-only line at the
 * end of the source that has no line terminator is not part of it.
 */
function finish(
  text: string,
  start: number,
  openingDelimiterStart: number,
  bodyStart: number,
  bodyEnd: number,
  closingLine: Line,
  closingDelimiterEnd: number,
): FrontmatterMatch {
  let end = closingLine.next
  while (end < text.length) {
    const line = readLine(text, end)
    if (!isWhitespaceOnly(text, line) || !line.hasTerminator) break
    end = line.next
  }
  return {
    start,
    openingDelimiterStart,
    closingDelimiterEnd,
    bodyStart,
    bodyEnd,
    end,
  }
}

/** ast.md, Frontmatter: the `Frontmatter` of the tree, and where the text after the frontmatter trivia starts. */
export interface FrontmatterTrivia {
  /** The `Frontmatter`: from the `---` of the opening line through the closing `---`. */
  readonly frontmatter: Frontmatter
  /** Where the text starts: after the line terminator of the closing line and the whitespace-only lines after it. */
  readonly textStart: number
}

/**
 * common.md, Frontmatter, and ast.md, Frontmatter: decides once, at the
 * start of the source, whether it has frontmatter, and builds its
 * `Frontmatter`. Returns null when the source has no frontmatter.
 */
export function readFrontmatterTrivia(
  text: string,
  lines: LineIndex,
): FrontmatterTrivia | null {
  const match = matchFrontmatter(text, 0)
  if (match === null) return null
  const range: Range = [match.openingDelimiterStart, match.closingDelimiterEnd]
  const valueRange: Range = [match.bodyStart, match.bodyEnd]
  return {
    frontmatter: {
      type: "Frontmatter",
      value: text.slice(...valueRange),
      valueRange,
      range,
      loc: lines.location(range),
    },
    textStart: match.end,
  }
}

/** One token of the frontmatter: its kind and its range. */
export interface FrontmatterToken {
  readonly kind: DiagramTokenKind
  readonly range: Range
}

/**
 * ast.md, Frontmatter: the tokens in the range of `frontmatter` of the
 * source `text`, in order: the opening `---`, a `Punctuator`; the body, a
 * `RawText` from its first character that is not whitespace to its last,
 * when it is not all whitespace; and the closing `---`, a `Punctuator`.
 * Everything else in the range is whitespace and line terminators.
 */
export function frontmatterTokensOf(
  text: string,
  frontmatter: Frontmatter,
): FrontmatterToken[] {
  const [start, end] = frontmatter.range
  const delimiterLength = FRONTMATTER_DELIMITER.length
  const tokens: FrontmatterToken[] = [
    { kind: "Punctuator", range: [start, start + delimiterLength] },
  ]
  const body = significantRangeOf(text, frontmatter.valueRange)
  if (body !== null) tokens.push({ kind: "RawText", range: body })
  tokens.push({ kind: "Punctuator", range: [end - delimiterLength, end] })
  return tokens
}

/** The range from the first to the last character of `range` in `text` that is not whitespace; null when there is none. */
function significantRangeOf(text: string, [from, to]: Range): Range | null {
  let start: number | null = null
  let end = from
  for (let offset = from; offset < to; offset = nextOffset(text, offset)) {
    if (!isWhitespace(text.codePointAt(offset) ?? 0)) {
      start ??= offset
      end = nextOffset(text, offset)
    }
  }
  return start === null ? null : [start, end]
}
