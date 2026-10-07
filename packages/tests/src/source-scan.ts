import { isWhitespace, isWordCharacter } from "./db-from-tree/characters.ts"

// Reading the source for the two things that every rule after the
// frontmatter depends on, from the text alone: the directives
// (common.md, Where a directive is) and the comment lines (common.md, Comment
// lines). Both are decided by the characters around a position, not by the
// diagram, so they are found here, once, for the converted form of the
// diagram text and for the check of a recorded tree.

/** A range of the source: the offset of its start and of its end. */
export type ScanRange = readonly [start: number, end: number]

/** A directive that the scan found. */
export interface ScannedDirective {
  /**
   * The range the tree records (ast.md, Directive): the match of the scan
   * without the whitespace at its end, which only an unclosed directive can
   * have.
   */
  readonly range: ScanRange
  /** Where the scan ends: the text without the directive goes on there. */
  readonly scanEnd: number
  /** Whether the directive ends with `}%%`. */
  readonly closed: boolean
}

/** A comment line that the scan found, with its comment region. */
export interface ScannedCommentLine {
  /** The offset of the first `%` of the `%%` of the comment. */
  readonly commentStart: number
  /**
   * Where the comment ends, as the tree records it (parser/docs/tokens.md,
   * Comment).
   */
  readonly commentEnd: number
  /**
   * The comment region: from the earliest comment start to which only
   * whitespace and directives lead from the comment, to the end of the line
   * terminator that ends the comment's line, if there is one.
   */
  readonly region: ScanRange
}

/** What the scan found. */
export interface SourceScan {
  /** The directives, in order. */
  readonly directives: readonly ScannedDirective[]
  /** The comment lines, in order. */
  readonly commentLines: readonly ScannedCommentLine[]
}

const LINE_FEED = 0x0a
const CARRIAGE_RETURN = 0x0d
const LINE_SEPARATOR = 0x2028
const PARAGRAPH_SEPARATOR = 0x2029
const PERCENT = 0x25
const LEFT_BRACE = 0x7b
const COLON = 0x3a

/** The end of the whitespace that starts at `offset`. */
function skipWhitespace(text: string, offset: number): number {
  let end = offset
  while (end < text.length && isWhitespace(text.charCodeAt(end))) end++
  return end
}

/**
 * Where a directive is: the directive that starts at `start`, with `%%{`
 * there, if any:
 *
 * ```text
 * directive  = "%%{" whitespace* name (whitespace* ":")? whitespace* argument? whitespace* "}%%"?
 * name       = word
 * argument   = word | free-text
 * free-text  = (any character except U+2028 and U+2029)*
 * ```
 *
 * where the free text stops before the first `}%%`.
 */
function scanDirectiveAt(text: string, start: number): ScannedDirective | null {
  if (!text.startsWith("%%{", start)) return null
  const nameStart = skipWhitespace(text, start + 3)
  if (!isWordCharacter(text.charCodeAt(nameStart))) return null
  let nameEnd = nameStart
  while (isWordCharacter(text.charCodeAt(nameEnd))) nameEnd++
  const afterName = skipWhitespace(text, nameEnd)
  const afterColon =
    text.charCodeAt(afterName) === COLON ? afterName + 1 : nameEnd
  const argumentStart = skipWhitespace(text, afterColon)
  let argumentEnd = argumentStart
  if (isWordCharacter(text.charCodeAt(argumentStart))) {
    while (isWordCharacter(text.charCodeAt(argumentEnd))) argumentEnd++
  } else {
    while (
      argumentEnd < text.length &&
      !text.startsWith("}%%", argumentEnd) &&
      text.charCodeAt(argumentEnd) !== LINE_SEPARATOR &&
      text.charCodeAt(argumentEnd) !== PARAGRAPH_SEPARATOR
    ) {
      argumentEnd++
    }
  }
  const scanned = skipWhitespace(text, argumentEnd)
  if (text.startsWith("}%%", scanned)) {
    return { range: [start, scanned + 3], scanEnd: scanned + 3, closed: true }
  }
  // The range leaves out the whitespace at the end of the match, which a free
  // text that runs to the end of the text has too.
  let end = scanned
  while (end > start && isWhitespace(text.charCodeAt(end - 1))) end--
  return { range: [start, end], scanEnd: scanned, closed: false }
}

/**
 * Scans `text` from `textStart`, the end of the frontmatter, for the
 * directives and the comment lines.
 */
export function scanSource(text: string, textStart: number): SourceScan {
  const directives: ScannedDirective[] = []
  for (let offset = textStart; offset < text.length;) {
    const directive = scanDirectiveAt(text, offset)
    if (directive === null) {
      offset++
    } else {
      directives.push(directive)
      offset = directive.scanEnd
    }
  }
  // What the scan of a directive takes, whitespace after an unclosed
  // directive included: the text without the directives goes on after it.
  const inDirective = new Uint8Array(text.length)
  for (const directive of directives) {
    inDirective.fill(1, directive.range[0], directive.scanEnd)
  }

  /** The first offset from `offset` on that is not in a directive. */
  function skipDirectives(offset: number): number {
    let end = offset
    while (end < text.length && inDirective[end] === 1) end++
    return end
  }

  /** Comment lines: whether a comment starts right at `offset`. */
  function isCommentStart(offset: number): boolean {
    if (offset === textStart) return true
    if (inDirective[offset - 1] === 1) return false
    const before = text.charCodeAt(offset - 1)
    if (before === CARRIAGE_RETURN) {
      return text.charCodeAt(offset) !== LINE_FEED
    }
    return (
      before === LINE_FEED ||
      before === LINE_SEPARATOR ||
      before === PARAGRAPH_SEPARATOR
    )
  }

  /**
   * Comment lines, condition 1: the earliest comment start from which only
   * whitespace and directives lead to `offset`; -1 where none does.
   */
  function regionStartOf(offset: number): number {
    let earliest = -1
    let current = offset
    for (;;) {
      if (isCommentStart(current)) earliest = current
      if (current <= textStart) break
      if (inDirective[current - 1] === 1) {
        while (current > textStart && inDirective[current - 1] === 1) current--
      } else if (isWhitespace(text.charCodeAt(current - 1))) {
        current--
      } else {
        break
      }
    }
    return earliest
  }

  /**
   * Comment lines: the end of the line that holds `offset`: the offset of the
   * next line terminator that is not part of a directive, or the end of the
   * text.
   */
  function lineEndOf(offset: number): number {
    let end = offset
    while (end < text.length) {
      const code = text.charCodeAt(end)
      if (
        (code === LINE_FEED || code === CARRIAGE_RETURN) &&
        inDirective[end] !== 1
      ) {
        return end
      }
      end++
    }
    return text.length
  }

  /** The offset after the line terminator at `offset`, if there is one. */
  function afterLineTerminator(offset: number): number {
    if (offset >= text.length) return offset
    const isCrLf =
      text.charCodeAt(offset) === CARRIAGE_RETURN &&
      text.charCodeAt(offset + 1) === LINE_FEED
    return offset + (isCrLf ? 2 : 1)
  }

  const commentLines: ScannedCommentLine[] = []
  for (let offset = textStart; offset < text.length;) {
    if (inDirective[offset] === 1 || text.charCodeAt(offset) !== PERCENT) {
      offset++
      continue
    }
    // The two `%` of the `%%`, with the directives between them skipped.
    const second = skipDirectives(offset + 1)
    const after = skipDirectives(second + 1)
    const character = text.charCodeAt(after)
    const isComment =
      text.charCodeAt(second) === PERCENT &&
      after < text.length &&
      character !== LEFT_BRACE &&
      character !== LINE_FEED &&
      character !== CARRIAGE_RETURN
    const regionStart = isComment ? regionStartOf(offset) : -1
    if (regionStart === -1) {
      offset++
      continue
    }
    const lineEnd = lineEndOf(after)
    // A comment that runs to the end of the text leaves out the whitespace
    // at its end that a directive took.
    const lastDirective = directives.find(
      (directive) =>
        directive.range[1] <= lineEnd &&
        lineEnd <= directive.scanEnd &&
        directive.range[1] < directive.scanEnd,
    )
    const commentEnd =
      lineEnd === text.length && lastDirective !== undefined
        ? lastDirective.range[1]
        : lineEnd
    const regionEnd = afterLineTerminator(lineEnd)
    commentLines.push({
      commentStart: offset,
      commentEnd,
      region: [regionStart, regionEnd],
    })
    offset = regionEnd
  }
  return { directives, commentLines }
}
