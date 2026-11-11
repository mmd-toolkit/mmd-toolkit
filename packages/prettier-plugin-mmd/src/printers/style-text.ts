import type { TextEdit } from "./layout.ts"
import type { Source } from "./source.ts"
import { isSpaceOrTab, isWhitespace } from "./source.ts"

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
    const character = text[position]
    if (character === "\\") {
      position = endOfEscape(text, position, end)
    } else if (character === '"' || character === "'") {
      position = endOfQuoted(text, position, end)
    } else if (text.startsWith("/*", position)) {
      const close = text.indexOf("*/", position + "/*".length)
      position = close === -1 || close + "*/".length > end ? end : close + 2
    } else if (text.slice(position, position + 4).toLowerCase() === "url(") {
      position = endOfUrl(text, position + "url(".length, end)
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
function endOfEscape(text: string, backslashAt: number, end: number): number {
  let digits = 0
  while (
    digits < 6 &&
    backslashAt + 1 + digits < end &&
    isHexDigit(text[backslashAt + 1 + digits])
  )
    digits++
  if (digits === 0) return backslashAt + 2
  const after = backslashAt + 1 + digits
  return after < end && isSpaceOrTab(text[after]) ? after + 1 : after
}

/** Whether a character is a hexadecimal digit. */
function isHexDigit(character: string | undefined): boolean {
  return character !== undefined && "0123456789abcdefABCDEF".includes(character)
}

/** The offset after the string that starts with the quote at `quoteAt`. */
function endOfQuoted(text: string, quoteAt: number, end: number): number {
  for (let index = quoteAt + 1; index < end; index++) {
    if (text[index] === "\\") index++
    else if (text[index] === text[quoteAt]) return index + 1
  }
  return end
}

/** The offset after the `)` that closes the `url(` whose text starts at `from`. */
function endOfUrl(text: string, from: number, end: number): number {
  for (let index = from; index < end; index++) {
    const character = text[index]
    if (character === "\\") index++
    else if (character === '"' || character === "'")
      index = endOfQuoted(text, index, end) - 1
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
    const character = text[position]
    if (character === "\\") {
      position = endOfEscape(text, position, end)
    } else if (character === '"' || character === "'") {
      position = endOfQuoted(text, position, end)
    } else if (text.startsWith("/*", position)) {
      const close = text.indexOf("*/", position + "/*".length)
      position = close === -1 || close + "*/".length > end ? end : close + 2
    } else if (text.slice(position, position + 4).toLowerCase() === "url(") {
      position = endOfUrl(text, position + "url(".length, end)
    } else if (character === "#") {
      let digitsEnd = position + 1
      while (digitsEnd < end && isHexDigit(text[digitsEnd])) digitsEnd++
      const digits = digitsEnd - position - 1
      const before = position === start ? undefined : text[position - 1]
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
        const lower = text.slice(position, digitsEnd).toLowerCase()
        if (lower !== text.slice(position, digitsEnd)) {
          edits.push({ range: [position, digitsEnd], replacement: lower })
        }
      }
      position = digitsEnd
    } else position++
  }
  return edits
}
