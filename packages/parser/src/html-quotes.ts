import { QUOTED_VALUE_OPENING, isWordCharacter } from "./character-classes.ts"
import {
  GREATER_THAN_SIGN,
  LESS_THAN_SIGN,
  QUOTATION_MARK,
} from "./code-points.ts"
import { findCodePoint, findCodePoints, skipWhile } from "./text-cursor.ts"

/**
 * common.md, HTML attribute quotes: finds the `"` characters that the lexer
 * reads as `'`: the two quotes of every `="..."` inside every `<tag ...>` of
 * the text from `start` (the position after the frontmatter trivia) to the
 * end. The characters are read as written, directives, comment lines, and
 * ignored `;` characters included; the frontmatter is not looked at. A tag is
 * `<`, one or more word characters, and everything up to the first `>`; tags
 * are found from left to right and do not overlap. Returns the set of the
 * offsets of those `"` characters.
 */
export function findAttributeQuotes(
  text: string,
  start: number,
): ReadonlySet<number> {
  const quotes = new Set<number>()
  let offset = start
  while (offset < text.length) {
    const tagStart = findCodePoint(text, offset, text.length, LESS_THAN_SIGN)
    if (tagStart === null) break
    const nameStart = tagStart + 1
    const nameEnd = skipWhile(text, nameStart, isWordCharacter)
    if (nameEnd === nameStart) {
      offset = nameStart
      continue
    }
    // The attribute part ends at the first `>`. When no `>` follows anywhere
    // in the source, no later `<` can start a tag either.
    const tagEnd = findCodePoint(text, nameEnd, text.length, GREATER_THAN_SIGN)
    if (tagEnd === null) break
    // A quoted value lies inside the attribute part, so its quotes are
    // looked for up to the `>` only: looked for in the rest of the source,
    // a search that finds none would read it all for every tag, which takes
    // time in the square of the number of tags.
    let attributeOffset = nameEnd
    while (attributeOffset < tagEnd) {
      const valueOpening = findCodePoints(
        text,
        attributeOffset,
        tagEnd,
        QUOTED_VALUE_OPENING,
      )
      if (valueOpening === null) break
      const openingQuote = valueOpening + 1
      const closingQuote = findCodePoint(
        text,
        openingQuote + 1,
        tagEnd,
        QUOTATION_MARK,
      )
      if (closingQuote === null) break
      quotes.add(openingQuote)
      quotes.add(closingQuote)
      attributeOffset = closingQuote + 1
    }
    offset = tagEnd + 1
  }
  return quotes
}
