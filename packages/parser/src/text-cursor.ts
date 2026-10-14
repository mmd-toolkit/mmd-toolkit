/**
 * Walking a text. The source stays a string; an offset counts UTF-16 code
 * units, as the positions of ast.md do, and every function here moves
 * forward one character (code point) at a time. Comparisons are made
 * character by character with the classes of `character-classes.ts`; no
 * function here matches a string literal.
 */
import {
  isHighSurrogate,
  isLowSurrogate,
  isOutsideBmp,
  matchesIgnoringCase,
} from "./character-classes.ts"
import { CARRIAGE_RETURN, LINE_FEED } from "./code-points.ts"

/** Notation: a character outside the BMP occupies two UTF-16 code units. */
function codeUnitLength(codePoint: number): number {
  return isOutsideBmp(codePoint) ? 2 : 1
}

/**
 * Returns the offset of the character after the one at `offset`. A surrogate
 * pair is one character; a lone surrogate is one character too.
 */
export function nextOffset(text: string, offset: number): number {
  const codePoint = text.codePointAt(offset)
  return codePoint === undefined ? offset : offset + codeUnitLength(codePoint)
}

/**
 * Returns the character that ends at `offset`, or undefined at the start of
 * the text. A surrogate pair ending at `offset` is one character.
 */
export function codePointBefore(
  text: string,
  offset: number,
): number | undefined {
  if (offset <= 0) return undefined
  const codeUnit = text.charCodeAt(offset - 1)
  if (isLowSurrogate(codeUnit) && offset >= 2) {
    const high = text.charCodeAt(offset - 2)
    if (isHighSurrogate(high)) return text.codePointAt(offset - 2)
  }
  return codeUnit
}

/**
 * Returns the offset of the character that ends at `offset`, as
 * {@link codePointBefore} reads it, or `offset` at the start of the text.
 */
export function previousOffset(text: string, offset: number): number {
  const codePoint = codePointBefore(text, offset)
  return codePoint === undefined ? offset : offset - codeUnitLength(codePoint)
}

/**
 * Line terminators: `\r\n`, a lone `\r`, and a lone `\n` are each one line
 * terminator. Returns the offset after the line terminator that starts at
 * `offset`, or null when none starts there.
 */
export function lineTerminatorEnd(text: string, offset: number): number | null {
  const codePoint = text.codePointAt(offset)
  if (codePoint === LINE_FEED) return offset + 1
  if (codePoint === CARRIAGE_RETURN) {
    return text.codePointAt(offset + 1) === LINE_FEED ? offset + 2 : offset + 1
  }
  return null
}

/**
 * Returns the first offset at or after `offset` whose character does not
 * satisfy `predicate`, or the end of the text.
 */
export function skipWhile(
  text: string,
  offset: number,
  predicate: (codePoint: number) => boolean,
): number {
  let current = offset
  while (current < text.length) {
    const codePoint = text.codePointAt(current)
    if (codePoint === undefined || !predicate(codePoint)) break
    current += codeUnitLength(codePoint)
  }
  return current
}

/**
 * Returns the last offset at or before `offset` whose character before it
 * does not satisfy `predicate`, or the start of the text: the backward
 * counterpart of {@link skipWhile}.
 */
export function skipBackWhile(
  text: string,
  offset: number,
  predicate: (codePoint: number) => boolean,
): number {
  let current = offset
  for (;;) {
    const codePoint = codePointBefore(text, current)
    if (codePoint === undefined || !predicate(codePoint)) break
    current -= codeUnitLength(codePoint)
  }
  return current
}

/**
 * Whether the fixed sequence `codePoints` (a token such as `%%{`) occurs at
 * `offset`, character by character. Returns the offset after it, or null.
 */
export function matchCodePoints(
  text: string,
  offset: number,
  codePoints: readonly number[],
): number | null {
  let current = offset
  for (const expected of codePoints) {
    if (text.codePointAt(current) !== expected) return null
    current += codeUnitLength(expected)
  }
  return current
}

/** Returns the offset of the first character `codePoint` at or after `from` and before `end`, or null. */
export function findCodePoint(
  text: string,
  from: number,
  end: number,
  codePoint: number,
): number | null {
  for (let offset = from; offset < end; offset = nextOffset(text, offset)) {
    if (text.codePointAt(offset) === codePoint) return offset
  }
  return null
}

/**
 * Returns the offset of the first occurrence of the fixed sequence
 * `codePoints` at or after `from` that ends at `end` or before it, looking
 * at each character boundary in turn, or null.
 */
export function findCodePoints(
  text: string,
  from: number,
  end: number,
  codePoints: readonly number[],
): number | null {
  for (let offset = from; offset < end; offset = nextOffset(text, offset)) {
    const after = matchCodePoints(text, offset, codePoints)
    if (after !== null && after <= end) return offset
  }
  return null
}

/**
 * Whether `characters`, a string that comes from data (a keyword of the
 * detector table, an indent cut from the input), occurs at `offset`. Each
 * character of it is compared with the character of the text. Returns the
 * offset after the match, or null. A lone surrogate does not match half of a
 * surrogate pair, because each side is read one character at a time.
 */
export function matchCharacters(
  text: string,
  offset: number,
  characters: string,
): number | null {
  let textOffset = offset
  let charactersOffset = 0
  while (charactersOffset < characters.length) {
    const expected = characters.codePointAt(charactersOffset)
    if (expected === undefined || text.codePointAt(textOffset) !== expected) {
      return null
    }
    textOffset += codeUnitLength(expected)
    charactersOffset += codeUnitLength(expected)
  }
  return textOffset
}

/**
 * Like {@link matchCharacters}, comparing characters case-insensitively in
 * the sense of Notation.
 */
export function matchCharactersIgnoringCase(
  text: string,
  offset: number,
  characters: string,
): number | null {
  let textOffset = offset
  let charactersOffset = 0
  while (charactersOffset < characters.length) {
    const expected = characters.codePointAt(charactersOffset)
    const actual = text.codePointAt(textOffset)
    if (
      expected === undefined ||
      actual === undefined ||
      !matchesIgnoringCase(actual, expected)
    ) {
      return null
    }
    textOffset += codeUnitLength(actual)
    charactersOffset += codeUnitLength(expected)
  }
  return textOffset
}
