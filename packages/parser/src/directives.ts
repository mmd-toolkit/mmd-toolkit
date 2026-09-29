import type { Range } from "./ast.ts"
import {
  DIRECTIVE_CLOSING,
  DIRECTIVE_OPENING,
  isLineSegmentSeparator,
  isWhitespace,
  isWordCharacter,
} from "./character-classes.ts"
import { COLON } from "./code-points.ts"
import {
  findCodePoints,
  matchCodePoints,
  nextOffset,
  skipWhile,
} from "./text-cursor.ts"

/** common.md, Where a directive is: one directive found in a text. */
export interface DirectiveMatch {
  readonly range: Range
  /** The directive name. */
  readonly name: string
  /** Where the text between `%%{` and `}%%` (or the end of the directive) is. */
  readonly valueRange: Range
  /** Whether the directive ends with `}%%`. */
  readonly closed: boolean
}

/**
 * common.md, Where a directive is: reads the directive that starts at the
 * `%%{` at `start`, if one does. Returns null when `%%{` is not followed by
 * zero or more whitespace characters and then a word character.
 */
export function readDirective(
  text: string,
  start: number,
): DirectiveMatch | null {
  const afterOpening = matchCodePoints(text, start, DIRECTIVE_OPENING)
  if (afterOpening === null) return null
  const nameStart = skipWhile(text, afterOpening, isWhitespace)
  const nameEnd = skipWhile(text, nameStart, isWordCharacter)
  if (nameEnd === nameStart) return null
  const name = text.slice(nameStart, nameEnd)

  // `(whitespace* ":")?` is taken when a `:` follows the name and its whitespace.
  let offset = nameEnd
  const afterNameWhitespace = skipWhile(text, offset, isWhitespace)
  if (text.codePointAt(afterNameWhitespace) === COLON) {
    offset = afterNameWhitespace + 1
  }
  offset = skipWhile(text, offset, isWhitespace)

  // The argument is a word when a word character comes first; otherwise it is
  // free text, which stops before the first `}%%`, before U+2028 or U+2029,
  // or at the end of the text.
  const argumentCodePoint = text.codePointAt(offset)
  if (argumentCodePoint !== undefined && isWordCharacter(argumentCodePoint)) {
    offset = skipWhile(text, offset, isWordCharacter)
  } else {
    while (offset < text.length) {
      const codePoint = text.codePointAt(offset)
      if (codePoint === undefined || isLineSegmentSeparator(codePoint)) break
      if (matchCodePoints(text, offset, DIRECTIVE_CLOSING) !== null) break
      offset = nextOffset(text, offset)
    }
  }

  // The whitespace after the argument takes everything that follows, line
  // breaks included; the closing `}%%` is then taken if it follows.
  const valueEnd = skipWhile(text, offset, isWhitespace)
  const afterClosing = matchCodePoints(text, valueEnd, DIRECTIVE_CLOSING)
  const closed = afterClosing !== null
  const end = closed ? afterClosing : valueEnd
  return {
    range: [start, end],
    name,
    valueRange: [afterOpening, closed ? valueEnd : end],
    closed,
  }
}

/**
 * common.md, Where a directive is: finds the directives in the text from
 * `from` to the end, in one scan from left to right. After a directive the
 * search continues where it ends; a `%%{` that starts no directive is passed
 * over one character at a time. The lexer finds the directives of the
 * source in its line look-ahead; this scan is the second directive scan of
 * detection, which runs over the detection text (common.md, Diagram
 * detection).
 */
export function findDirectives(text: string, from: number): DirectiveMatch[] {
  const directives: DirectiveMatch[] = []
  let offset = from
  while (offset < text.length) {
    const start = findCodePoints(text, offset, DIRECTIVE_OPENING)
    if (start === null) break
    const directive = readDirective(text, start)
    if (directive === null) {
      offset = nextOffset(text, start)
    } else {
      directives.push(directive)
      offset = directive.range[1]
    }
  }
  return directives
}
