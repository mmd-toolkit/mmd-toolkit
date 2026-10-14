import { isAsciiDigit, isWordCharacter } from "./character-classes.ts"
import { NUMBER_SIGN, SEMICOLON } from "./code-points.ts"

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

/** One character of {@link EntityText}. */
export interface EntityTextCharacter {
  readonly codePoint: number
  /** Where the character is in the source. */
  readonly start: number
  /** The offset after it. */
  readonly next: number
}

/**
 * common.md, Entities: the text that entities are found in, the source
 * without its directives and comment regions, the characters before and
 * after a directive following one another. A `;` that the line rule ignores
 * is a character of it.
 */
export interface EntityText {
  /** The character at or after `offset`; null at the end of the source. */
  characterFrom(offset: number): EntityTextCharacter | null
  /** The character before `offset`, in the text without its directives; null at the start of the reading. A comment region is not left out, which reads the same: no entity runs across one. */
  characterBefore(offset: number): EntityTextCharacter | null
  /** Whether the `;` at `offset` is one that the line rule ignores. */
  isIgnoredSemicolon(offset: number): boolean
}

/**
 * common.md, Entities: what the lexer reads in place of the character at
 * `offset` of `text`, when it is the `#` or the `;` of an entity
 * `#` word `;`, whose `;` is not one that the line rule ignores; null for
 * every other character. `offset` is where a character of `text` starts.
 *
 * The decision reads only the entity: from a `#`, forward over the word to
 * the `;`; from a `;`, back over the word to the `#`. A word holds neither a
 * `#` nor a `;`, so two entities cannot overlap, and the entity that a
 * position belongs to is the one that finding them from left to right
 * finds.
 */
export function entityDelimiterAt(
  text: EntityText,
  offset: number,
): EntityDelimiter | null {
  const character = text.characterFrom(offset)
  if (character === null) return null
  if (character.codePoint === NUMBER_SIGN) return openingAt(text, character)
  if (character.codePoint === SEMICOLON) return closingAt(text, character)
  return null
}

/**
 * The opening of the placeholder for the `#` `numberSign`, which tells
 * whether the word consists of ASCII digits only, when an entity starts
 * there.
 */
function openingAt(
  text: EntityText,
  numberSign: EntityTextCharacter,
): EntityDelimiter | null {
  let hasWord = false
  let numeric = true
  let following = text.characterFrom(numberSign.next)
  while (following !== null && isWordCharacter(following.codePoint)) {
    hasWord = true
    if (!isAsciiDigit(following.codePoint)) numeric = false
    following = text.characterFrom(following.next)
  }
  if (
    !hasWord ||
    following === null ||
    following.codePoint !== SEMICOLON ||
    text.isIgnoredSemicolon(following.start)
  ) {
    return null
  }
  return {
    text: numeric ? PLACEHOLDER_NUMERIC_OPENING : PLACEHOLDER_OPENING,
    placeholderEnd: following.next,
  }
}

/** The closing of the placeholder for the `;` `semicolon`, when an entity ends there. */
function closingAt(
  text: EntityText,
  semicolon: EntityTextCharacter,
): EntityDelimiter | null {
  if (text.isIgnoredSemicolon(semicolon.start)) return null
  let hasWord = false
  let preceding = text.characterBefore(semicolon.start)
  while (preceding !== null && isWordCharacter(preceding.codePoint)) {
    hasWord = true
    preceding = text.characterBefore(preceding.start)
  }
  if (!hasWord || preceding === null || preceding.codePoint !== NUMBER_SIGN) {
    return null
  }
  return { text: PLACEHOLDER_CLOSING, placeholderEnd: null }
}
