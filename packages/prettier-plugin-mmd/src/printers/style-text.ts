import type { TextEdit } from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findDirectiveEndingAt,
  findTriviaAt,
  isSpaceOrTab,
  isWhitespace,
  skipRemoved,
} from "./source.ts"

/**
 * The edits that print each run of spaces and tabs inside the text of a style,
 * at `[start, end)`, as one space. CSS reads a run as one whitespace, so the
 * figure is the same, except where the run is a character of the value: inside
 * a string (`"…"` or `'…'`), inside a comment, inside the parentheses of
 * `url(`, and the escape after a backslash (see `endOfEscape`). A string, a
 * comment, or `url(` that is not closed runs to the end of the text.
 * The runs at the ends of the text are the business of the caller.
 */
export function styleRunEdits(
  source: Source,
  start: number,
  end: number,
): TextEdit[] {
  const { text } = source
  const edits: TextEdit[] = []
  let position = start
  while (position < end) {
    const regionEnd = endOfStyleRegion(source, position, end)
    const character = text[position]
    if (regionEnd !== undefined) {
      position = regionEnd
    } else if (isSpaceOrTab(character)) {
      let runEnd = position
      while (runEnd < end && isSpaceOrTab(text[runEnd])) runEnd++
      if (
        position > start &&
        runEnd < end &&
        !(runEnd - position === 1 && character === " ")
      )
        edits.push({ range: [position, runEnd], replacement: " " })
      position = runEnd
    } else position++
  }
  return edits
}

/**
 * The offset after the escape that starts with the backslash at `backslashAt`.
 * CSS reads one to six hexadecimal digits after a backslash, and one space or
 * tab after them, as the escape; any other character after a backslash, a
 * space or a tab included, is the escaped character. The whitespace after the
 * escape is a run like any other (`Arial\20  Black` is `Arial`, the escape
 * `\20 `, one space, and `Black`).
 */
function endOfEscape(source: Source, backslashAt: number, end: number): number {
  let position = skipRemoved(source, backslashAt + 1)
  let digits = 0
  while (digits < 6 && position < end && isHexDigit(source.text[position])) {
    digits++
    position = skipRemoved(source, position + 1)
  }
  if (digits === 0) return Math.min(position + 1, end)
  return position < end && isSpaceOrTab(source.text[position])
    ? position + 1
    : Math.min(position, end)
}

/**
 * The offset after a CSS mark, ignoring directives between its characters,
 * or undefined where that mark does not start here (common.md, Reading a source).
 */
function endOfStyleMark(
  source: Source,
  start: number,
  end: number,
  mark: string,
): number | undefined {
  let position = start
  for (const character of mark) {
    position = skipRemoved(source, position)
    if (position >= end || source.text[position].toLowerCase() !== character)
      return undefined
    position++
  }
  return position
}

/**
 * The offset after a directive or a CSS region whose contents stay as written.
 * Both scans use the same boundaries, read without directives: their arguments
 * can contain CSS punctuation of their own (docs/compatibility.md, Colors that
 * are drawn the same).
 */
function endOfStyleRegion(
  source: Source,
  position: number,
  end: number,
): number | undefined {
  const trivia = findTriviaAt(source, position)
  if (trivia?.type === "Directive") return Math.min(trivia.range[1], end)
  const character = source.text[position]
  if (character === "\\") return endOfEscape(source, position, end)
  if (character === '"' || character === "'")
    return endOfQuoted(source, position, end)
  const commentStart = endOfStyleMark(source, position, end, "/*")
  if (commentStart !== undefined) {
    for (let index = commentStart; index < end; index++) {
      index = skipRemoved(source, index)
      const close = endOfStyleMark(source, index, end, "*/")
      if (close !== undefined) return close
    }
    return end
  }
  const urlStart = endOfStyleMark(source, position, end, "url(")
  return urlStart === undefined ? undefined : endOfUrl(source, urlStart, end)
}

/** Whether a character is a hexadecimal digit. */
function isHexDigit(character: string | undefined): boolean {
  return character !== undefined && "0123456789abcdefABCDEF".includes(character)
}

/** The offset after the string that starts with the quote at `quoteAt`. */
function endOfQuoted(source: Source, quoteAt: number, end: number): number {
  for (let index = quoteAt + 1; index < end; index++) {
    index = skipRemoved(source, index)
    if (index >= end) break
    if (source.text[index] === "\\") index = skipRemoved(source, index + 1)
    else if (source.text[index] === source.text[quoteAt]) return index + 1
  }
  return end
}

/** The offset after the `)` that closes the `url(` whose text starts at `from`. */
function endOfUrl(source: Source, from: number, end: number): number {
  for (let index = from; index < end; index++) {
    index = skipRemoved(source, index)
    if (index >= end) break
    const character = source.text[index]
    if (character === "\\") index = skipRemoved(source, index + 1)
    else if (character === '"' || character === "'")
      index = endOfQuoted(source, index, end) - 1
    else if (character === ")") return index + 1
  }
  return end
}

/**
 * The edits that print each color in the text of a style, at `[start, end)`,
 * in lower case: a `#` and 3, 4, 6, or 8 hexadecimal digits, as CSS reads a
 * color, and as the CSS formatter of Prettier prints it (docs/compatibility.md,
 * Colors that are drawn the same). It is a color only as a word of its own: it
 * starts the text or follows whitespace, a `:`, a `,`, or a `(`, and it ends the
 * text or is followed by whitespace, a `,`, a `)`, or a `!`, or by the `;` that
 * ends the text, which the line rule of mermaid.js ignores. A `;` inside the
 * text makes it the placeholder of an entity (`#f00;`, or the word `#f00stroke`
 * once the `;` is taken away, common.md, `style` and `classDef` lines), a longer
 * or shorter run of digits is no color, and nothing inside a string, a comment,
 * the parentheses of `url(`, or after a backslash is one.
 */
export function styleColorEdits(
  source: Source,
  start: number,
  end: number,
): TextEdit[] {
  const { text } = source
  const edits: TextEdit[] = []
  let position = start
  while (position < end) {
    const regionEnd = endOfStyleRegion(source, position, end)
    const character = text[position]
    if (regionEnd !== undefined) {
      position = regionEnd
    } else if (character === "#") {
      const digitPositions: number[] = []
      let digitsEnd = skipRemoved(source, position + 1)
      while (digitsEnd < end && isHexDigit(text[digitsEnd])) {
        digitPositions.push(digitsEnd)
        digitsEnd = skipRemoved(source, digitsEnd + 1)
      }
      const digits = digitPositions.length
      let beforeAt = position
      for (;;) {
        const directive = findDirectiveEndingAt(source, beforeAt)
        if (directive === undefined || directive.range[0] < start) break
        beforeAt = directive.range[0]
      }
      const before = beforeAt === start ? undefined : text[beforeAt - 1]
      const after = text[digitsEnd]
      if (
        (digits === 3 || digits === 4 || digits === 6 || digits === 8) &&
        (before === undefined ||
          isWhitespace(before) ||
          ":,(".includes(before)) &&
        (after === undefined ||
          isWhitespace(after) ||
          ",)!".includes(after) ||
          (after === ";" && digitsEnd === end))
      ) {
        // Edit only the written digits: a directive between them stays whole.
        for (const digit of digitPositions) {
          const lower = text[digit].toLowerCase()
          if (lower !== text[digit])
            edits.push({ range: [digit, digit + 1], replacement: lower })
        }
      }
      position = digitsEnd
    } else position++
  }
  return edits
}
