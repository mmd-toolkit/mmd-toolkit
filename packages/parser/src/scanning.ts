import {
  isWhitespace,
  isWordCharacter,
  matchesIgnoringCase,
} from "./character-classes.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "./diagram-text.ts"

/** What a rule has read from a place: the place after it. */
export interface Match {
  /** The place after the last character read. */
  readonly end: DiagramPosition
}

/** Whether `a` and `b` are the same place in the diagram text. */
export function samePosition(a: DiagramPosition, b: DiagramPosition): boolean {
  if (a === null || b === null) return a === b
  return (
    a.start === b.start &&
    a.offsetInConvertedForm === b.offsetInConvertedForm &&
    a.endOfText === b.endOfText
  )
}

/** Whether the character at `position` is `codePoint`; false at the end of the text. */
export function isCodePointAt(
  position: DiagramPosition,
  codePoint: number,
): position is DiagramCharacter {
  return position !== null && position.codePoint === codePoint
}

/** Whether a whitespace character, a line feed included, is at `position`. */
export function isWhitespaceAt(
  position: DiagramPosition,
): position is DiagramCharacter {
  return position !== null && isWhitespace(position.codePoint)
}

/** common.md, Notation: whether a word character is at `position`. */
export function isWordCharacterAt(position: DiagramPosition): boolean {
  return position !== null && isWordCharacter(position.codePoint)
}

/** The place after the characters from `from` that `accepts` takes, as many as possible. */
export function skipWhile(
  reader: DiagramText,
  from: DiagramPosition,
  accepts: (character: DiagramCharacter) => boolean,
): DiagramPosition {
  let position = from
  while (position !== null && accepts(position)) {
    position = reader.after(position)
  }
  return position
}

/** The place after the whitespace at `from`, line feeds included. */
export function skipWhitespace(
  reader: DiagramText,
  from: DiagramPosition,
): DiagramPosition {
  return skipWhile(reader, from, (character) =>
    isWhitespace(character.codePoint),
  )
}

/** Reads the characters of `word` from `from`, one by one; null when the diagram text differs. */
export function matchWord(
  reader: DiagramText,
  from: DiagramPosition,
  word: string,
): Match | null {
  let position = from
  for (const expected of word) {
    if (position === null || position.codePoint !== expected.codePointAt(0)) {
      return null
    }
    position = reader.after(position)
  }
  return { end: position }
}

/** Reads `word` from `from` when no word character follows it; null otherwise. */
export function matchWholeWord(
  reader: DiagramText,
  from: DiagramPosition,
  word: string,
): Match | null {
  const match = matchWord(reader, from, word)
  return match === null || isWordCharacterAt(match.end) ? null : match
}

/**
 * Notation: reads the characters of `word` from `from`, one by one,
 * comparing them case-insensitively; null when the diagram text differs.
 */
export function matchWordIgnoringCase(
  reader: DiagramText,
  from: DiagramPosition,
  word: string,
): Match | null {
  let position = from
  for (const expected of word) {
    const codePoint = expected.codePointAt(0)
    if (
      position === null ||
      codePoint === undefined ||
      !matchesIgnoringCase(position.codePoint, codePoint)
    ) {
      return null
    }
    position = reader.after(position)
  }
  return { end: position }
}

/**
 * Reads `word` from `from`, case-insensitively, when no word character
 * follows it; null otherwise.
 */
export function matchWholeWordIgnoringCase(
  reader: DiagramText,
  from: DiagramPosition,
  word: string,
): Match | null {
  const match = matchWordIgnoringCase(reader, from, word)
  return match === null || isWordCharacterAt(match.end) ? null : match
}
