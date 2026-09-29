import { isWhitespace } from "./character-classes.ts"
import { COLON, NUMBER_SIGN, SEMICOLON } from "./code-points.ts"
import type { DirectiveMatch } from "./directives.ts"
import type { LineSegmentReading } from "./line-segment.ts"
import { segmentCharacterAt } from "./line-segment.ts"

/** Whether `keyword` (an ASCII word) occurs at `offset` of the segment. Returns the offset after it, or null. */
function matchKeyword(
  reading: LineSegmentReading,
  offset: number,
  keyword: string,
): number | null {
  let current = offset
  for (let index = 0; index < keyword.length; index += 1) {
    const character = segmentCharacterAt(reading, current)
    if (
      character === null ||
      character.codePoint !== keyword.codePointAt(index)
    ) {
      return null
    }
    current = character.next
  }
  return current
}

/**
 * common.md, `style` and `classDef` lines: whether the segment matches the
 * rule for `keyword`: it contains the keyword; later a `:` followed by zero
 * or more characters that are not whitespace and then a `#`; and later than
 * that `#`, a `;`.
 */
function matchesLineRule(
  reading: LineSegmentReading,
  keyword: string,
): boolean {
  let offset = reading.start
  let afterKeyword: number | null = null
  for (;;) {
    afterKeyword = matchKeyword(reading, offset, keyword)
    if (afterKeyword !== null) break
    const character = segmentCharacterAt(reading, offset)
    if (character === null) return false
    offset = character.next
  }
  offset = afterKeyword
  for (;;) {
    const character = segmentCharacterAt(reading, offset)
    if (character === null) return false
    if (character.codePoint === COLON) {
      let hashCharacter = segmentCharacterAt(reading, character.next)
      while (
        hashCharacter !== null &&
        hashCharacter.codePoint !== NUMBER_SIGN &&
        !isWhitespace(hashCharacter.codePoint)
      ) {
        hashCharacter = segmentCharacterAt(reading, hashCharacter.next)
      }
      if (hashCharacter !== null && hashCharacter.codePoint === NUMBER_SIGN) {
        return lastSemicolon(reading, hashCharacter.next) !== null
      }
    }
    offset = character.next
  }
}

/** The offset of the last `;` of the segment at or after `from`, or null. */
function lastSemicolon(
  reading: LineSegmentReading,
  from: number,
): number | null {
  let found: number | null = null
  let offset = from
  for (;;) {
    const character = segmentCharacterAt(reading, offset)
    if (character === null) return found
    if (character.codePoint === SEMICOLON) found = character.start
    offset = character.next
  }
}

/**
 * common.md, `style` and `classDef` lines: the `;` characters of the line
 * segment `[start, end)`, whose directives are `directives`, that the rule
 * ignores. The segment is read without its directives, so a match can have
 * a directive between two of its characters. mermaid.js removes the `;`
 * from the text; the lexer reads the source as written and skips them. When
 * the segment matches the `style` rule, its last `;` is ignored; then the
 * `classDef` rule is applied to the segment without that `;`. Returns the
 * set of their offsets.
 */
export function decideIgnoredSemicolons(
  text: string,
  start: number,
  end: number,
  directives: ReadonlyMap<number, DirectiveMatch>,
): ReadonlySet<number> {
  const ignoredSemicolons = new Set<number>()
  for (const keyword of ["style", "classDef"]) {
    const reading: LineSegmentReading = {
      text,
      start,
      end,
      directives,
      ignoredSemicolons,
    }
    if (!matchesLineRule(reading, keyword)) continue
    const semicolon = lastSemicolon(reading, start)
    if (semicolon !== null) ignoredSemicolons.add(semicolon)
  }
  return ignoredSemicolons
}
