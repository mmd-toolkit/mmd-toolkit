import { isAsciiDigit, isWordCharacter } from "./character-classes.ts"
import { NUMBER_SIGN, SEMICOLON } from "./code-points.ts"
import type { LineSegmentReading } from "./line-segment.ts"
import { segmentCharacterAt } from "./line-segment.ts"

/** Entities: the characters of the placeholders, U+FB02, U+00B0, U+00B6, and U+00DF. */
const PLACEHOLDER_OPENING = "\uFB02\u00B0"
const PLACEHOLDER_NUMERIC_OPENING = "\uFB02\u00B0\u00B0"
const PLACEHOLDER_CLOSING = "\u00B6\u00DF"

/** common.md, Entities: what the lexer reads in place of the `#` or the `;` of an entity. */
export interface EntityDelimiter {
  /** The opening of the placeholder for the `#`, the closing for the `;`. */
  readonly text: string
  /**
   * For the `#`, the offset after the entity's `;`, where the placeholder
   * that the opening starts ends; null for the `;`.
   */
  readonly placeholderEnd: number | null
}

/**
 * common.md, Entities: finds the entities `#` word `;` of a line segment,
 * from left to right, in the segment without its directives, so that an
 * entity can have a directive between two of its characters. The `;` is not
 * one that the line rule ignores. Entities do not overlap.
 *
 * The lexer reads an entity as its placeholder: the `#` as the opening of
 * the placeholder, which tells whether the word consists of ASCII digits
 * only, the word as itself, and the `;` as the closing. Returns, for the
 * `#` and the `;` of every entity, keyed by offset, what the lexer reads in
 * its place, and for the `#`, where the placeholder ends.
 */
export function findEntityDelimiters(
  reading: LineSegmentReading,
): ReadonlyMap<number, EntityDelimiter> {
  const delimiters = new Map<number, EntityDelimiter>()
  let offset = reading.start
  for (;;) {
    const character = segmentCharacterAt(reading, offset)
    if (character === null) return delimiters
    if (character.codePoint !== NUMBER_SIGN) {
      offset = character.next
      continue
    }
    let wordEnd = character.next
    let hasWord = false
    let numeric = true
    let following = segmentCharacterAt(reading, wordEnd)
    while (following !== null && isWordCharacter(following.codePoint)) {
      hasWord = true
      if (!isAsciiDigit(following.codePoint)) numeric = false
      wordEnd = following.next
      following = segmentCharacterAt(reading, wordEnd)
    }
    if (hasWord && following !== null && following.codePoint === SEMICOLON) {
      delimiters.set(character.start, {
        text: numeric ? PLACEHOLDER_NUMERIC_OPENING : PLACEHOLDER_OPENING,
        placeholderEnd: following.next,
      })
      delimiters.set(following.start, {
        text: PLACEHOLDER_CLOSING,
        placeholderEnd: null,
      })
      offset = following.next
    } else {
      // No entity starts at this `#`. The word holds no `#`, so the search
      // goes on after it.
      offset = wordEnd
    }
  }
}
