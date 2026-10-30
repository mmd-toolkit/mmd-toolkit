import {
  CARRIAGE_RETURN,
  EQUALS_SIGN,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LINE_FEED,
  LINE_SEPARATOR,
  LOW_LINE,
  PARAGRAPH_SEPARATOR,
  PERCENT_SIGN,
  QUOTATION_MARK,
  RIGHT_CURLY_BRACKET,
  SPACE,
} from "./code-points.ts"

/**
 * Character classes. common.md, Notation: a character is a Unicode code
 * point, and every function here takes a code point and answers a question
 * about that one character. The fixed token sequences of the common rules
 * are here too, as the code points that make them.
 */

// Fixed token sequences of the common rules, as the code points that make them.

/** common.md, Where a directive is: `%%{`. */
export const DIRECTIVE_OPENING: readonly number[] = [
  PERCENT_SIGN,
  PERCENT_SIGN,
  LEFT_CURLY_BRACKET,
]

/** common.md, Where a directive is: `}%%`. */
export const DIRECTIVE_CLOSING: readonly number[] = [
  RIGHT_CURLY_BRACKET,
  PERCENT_SIGN,
  PERCENT_SIGN,
]

/** common.md, Comment lines and Diagram detection: `%%`. */
export const COMMENT_MARKER: readonly number[] = [PERCENT_SIGN, PERCENT_SIGN]

/** common.md, Frontmatter: `---`. */
export const FRONTMATTER_DELIMITER: readonly number[] = [
  HYPHEN_MINUS,
  HYPHEN_MINUS,
  HYPHEN_MINUS,
]

/** common.md, HTML attribute quotes: the `="` that opens a quoted value. */
export const QUOTED_VALUE_OPENING: readonly number[] = [
  EQUALS_SIGN,
  QUOTATION_MARK,
]

/**
 * Notation: whitespace is U+0009 to U+000D, U+0020, U+00A0, U+1680,
 * U+2000 to U+200A, U+2028, U+2029, U+202F, U+205F, U+3000, and U+FEFF.
 */
export function isWhitespace(codePoint: number): boolean {
  return (
    (codePoint >= 0x0009 && codePoint <= 0x000d) ||
    codePoint === SPACE ||
    codePoint === 0x00a0 ||
    codePoint === 0x1680 ||
    (codePoint >= 0x2000 && codePoint <= 0x200a) ||
    codePoint === LINE_SEPARATOR ||
    codePoint === PARAGRAPH_SEPARATOR ||
    codePoint === 0x202f ||
    codePoint === 0x205f ||
    codePoint === 0x3000 ||
    codePoint === 0xfeff
  )
}

/** Line terminators: `\r` and `\n` are the characters a line terminator is made of. */
export function isLineTerminatorCharacter(codePoint: number): boolean {
  return codePoint === LINE_FEED || codePoint === CARRIAGE_RETURN
}

/** Notation: line whitespace is whitespace that is not part of a line terminator. */
export function isLineWhitespace(codePoint: number): boolean {
  return isWhitespace(codePoint) && !isLineTerminatorCharacter(codePoint)
}

/** Notation: U+2028 and U+2029 end a line segment but are not line terminators. */
export function isLineSegmentSeparator(codePoint: number): boolean {
  return codePoint === LINE_SEPARATOR || codePoint === PARAGRAPH_SEPARATOR
}

/** Notation: an ASCII letter, an ASCII digit, or `_`. */
export function isWordCharacter(codePoint: number): boolean {
  return (
    isAsciiLetter(codePoint) ||
    isAsciiDigit(codePoint) ||
    codePoint === LOW_LINE
  )
}

/** Notation: whether the character is outside ASCII (above U+007F). */
export function isOutsideAscii(codePoint: number): boolean {
  return codePoint > 0x7f
}

/** An ASCII letter, `A` to `Z` or `a` to `z`. */
export function isAsciiLetter(codePoint: number): boolean {
  return (
    (codePoint >= 0x41 && codePoint <= 0x5a) ||
    (codePoint >= 0x61 && codePoint <= 0x7a)
  )
}

/** An ASCII digit, `0` to `9`. */
export function isAsciiDigit(codePoint: number): boolean {
  return codePoint >= 0x30 && codePoint <= 0x39
}

/** Notation: whether the character is outside the Basic Multilingual Plane (above U+FFFF). */
export function isOutsideBmp(codePoint: number): boolean {
  return codePoint > 0xffff
}

/** Whether the code unit is a high surrogate, U+D800 to U+DBFF. */
export function isHighSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xd800 && codeUnit <= 0xdbff
}

/** Whether the code unit is a low surrogate, U+DC00 to U+DFFF. */
export function isLowSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff
}

/** Whether the code point is a surrogate code unit (a lone surrogate, when read as a character). */
function isSurrogate(codePoint: number): boolean {
  return isHighSurrogate(codePoint) || isLowSurrogate(codePoint)
}

/**
 * Notation: the canonical form of a character for case-insensitive matching.
 * For a BMP character it is the uppercase from the full Unicode mapping when
 * that is a single BMP character, except that a character outside ASCII whose
 * uppercase is ASCII keeps itself. Any other character keeps itself.
 */
export function canonicalize(codePoint: number): number {
  if (isOutsideBmp(codePoint) || isSurrogate(codePoint)) return codePoint
  const upper = String.fromCodePoint(codePoint).toUpperCase()
  if (upper.length !== 1) return codePoint
  const upperCodePoint = upper.codePointAt(0)
  if (upperCodePoint === undefined) return codePoint
  if (codePoint > 0x7f && upperCodePoint <= 0x7f) return codePoint
  return upperCodePoint
}

/**
 * Notation: two characters match case-insensitively when they are the same
 * character or have the same canonical form.
 */
export function matchesIgnoringCase(left: number, right: number): boolean {
  return left === right || canonicalize(left) === canonicalize(right)
}
