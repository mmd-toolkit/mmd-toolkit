import type { DiagramTokenKind, Frontmatter, Range } from "./ast.ts"
import {
  FRONTMATTER_DELIMITER,
  isLineWhitespace,
  isWhitespace,
} from "./character-classes.ts"
import type { LineIndex } from "./positions.ts"
import { lineTerminatorEnd, nextOffset } from "./text-cursor.ts"

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

/** Source-positioned text for the frontmatter shape, including detection's second reading. */
export interface FrontmatterText {
  readonly codePointAt: (offset: number) => number | undefined
  readonly after: (offset: number) => number
}

/** Reads one physical line without making a rewritten detection text. */
function readLine(text: FrontmatterText, offset: number): Line {
  let current = offset
  for (;;) {
    const codePoint = text.codePointAt(current)
    if (codePoint === undefined || codePoint === 0x0a) {
      return {
        start: offset,
        contentEnd: current,
        next: codePoint === undefined ? current : text.after(current),
        hasTerminator: codePoint !== undefined,
      }
    }
    current = text.after(current)
  }
}

/** The first position after characters accepted by `accepts`. */
function afterWhile(
  text: FrontmatterText,
  start: number,
  accepts: (codePoint: number) => boolean,
): number {
  let at = start
  for (
    let codePoint = text.codePointAt(at);
    codePoint !== undefined && accepts(codePoint);
    codePoint = text.codePointAt(at)
  )
    at = text.after(at)
  return at
}

/** Notation: a whitespace-only line is empty or consists of line whitespace. */
function isWhitespaceOnly(text: FrontmatterText, line: Line): boolean {
  return afterWhile(text, line.start, isLineWhitespace) >= line.contentEnd
}

/** Frontmatter, condition 3: the same indent, three dashes, padding and a physical LF. */
function delimiterEnd(
  text: FrontmatterText,
  line: Line,
  indent: readonly number[],
): number | null {
  if (!line.hasTerminator) return null
  let at = line.start
  for (const expected of [...indent, ...FRONTMATTER_DELIMITER]) {
    if (text.codePointAt(at) !== expected) return null
    at = text.after(at)
  }
  return afterWhile(text, at, isLineWhitespace) === line.contentEnd ? at : null
}

/**
 * common.md, Frontmatter: decides whether the text has frontmatter starting
 * at `start`, and where its parts are. Returns null when it has none.
 */
export function matchFrontmatter(
  text: string,
  start: number,
): FrontmatterMatch | null {
  return matchFrontmatterIn(
    {
      codePointAt: (offset) =>
        text.codePointAt(offset) === 0x0d ? 0x0a : text.codePointAt(offset),
      after: (offset) =>
        lineTerminatorEnd(text, offset) ?? nextOffset(text, offset),
    },
    start,
  )
}

/** Common Frontmatter shape on source-positioned text; detection retains any matching block. */
export function matchFrontmatterIn(
  text: FrontmatterText,
  start: number,
): FrontmatterMatch | null {
  const indent: number[] = []
  let indentEnd = start
  for (
    let codePoint = text.codePointAt(indentEnd);
    codePoint !== undefined && isLineWhitespace(codePoint);
    codePoint = text.codePointAt(indentEnd)
  ) {
    indent.push(codePoint)
    indentEnd = text.after(indentEnd)
  }
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
  text: FrontmatterText,
  start: number,
  openingDelimiterStart: number,
  bodyStart: number,
  bodyEnd: number,
  closingLine: Line,
  closingDelimiterEnd: number,
): FrontmatterMatch {
  let end = closingLine.next
  while (text.codePointAt(end) !== undefined) {
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
