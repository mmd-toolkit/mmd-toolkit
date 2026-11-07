/** A line terminator, as Markdown, Mermaid, and editors read them. */
export type LineEnding = "\n" | "\r\n" | "\r"

/** A line of a text and the terminator that ends it. */
export interface Line {
  readonly text: string
  /** `""` for the last line of a text, which no terminator ends. */
  readonly ending: LineEnding | ""
}

/** A place in a text: a line and a column in UTF-16 code units, both from 1. */
export interface Position {
  readonly line: number
  readonly column: number
}

const byteOrderMark = "\uFEFF"

/**
 * A text as the tool reads it: its byte order mark apart, and the rest as its
 * lines and as one text whose lines all end with `\n`, as Prettier reads a text
 * before it parses it.
 */
export interface ReadText {
  readonly byteOrderMark: string
  /** The lines of the text after the byte order mark, with their own endings. */
  readonly lines: readonly Line[]
  /** The text after the byte order mark, with every line ending `\n`. */
  readonly normalized: string
}

/** Reads a text into its byte order mark, its lines, and its normalized form. */
export function readText(text: string): ReadText {
  const mark = text.startsWith(byteOrderMark) ? byteOrderMark : ""
  const lines = splitLines(text.slice(mark.length))
  return {
    byteOrderMark: mark,
    lines,
    normalized: lines.map((line) => line.text).join("\n"),
  }
}

/**
 * Splits a text into lines at `\n`, `\r\n`, and `\r`. Joining the lines with
 * their endings gives the text back; the last line is `""` when the text ends
 * with a line terminator.
 */
export function splitLines(text: string): Line[] {
  const lines: Line[] = []
  let start = 0
  for (let index = 0; index < text.length; index++) {
    const character = text[index]
    if (character !== "\n" && character !== "\r") continue
    const ending: LineEnding =
      character === "\r" && text[index + 1] === "\n" ? "\r\n" : character
    lines.push({ text: text.slice(start, index), ending })
    index += ending.length - 1
    start = index + 1
  }
  lines.push({ text: text.slice(start), ending: "" })
  return lines
}

/**
 * The line ending that the tool writes in a file: the first line ending of the
 * file, or `\n` in a file without one (README, Code blocks in detail).
 */
export function lineEndingOf(text: string): LineEnding {
  for (let index = 0; index < text.length; index++) {
    if (text[index] === "\n") return "\n"
    if (text[index] === "\r") return text[index + 1] === "\n" ? "\r\n" : "\r"
  }
  return "\n"
}

/** The position of an offset in a text whose lines end with `\n`. */
export function positionIn(text: string, offset: number): Position {
  let line = 1
  let lineStart = 0
  for (let index = 0; index < offset; index++) {
    if (text[index] === "\n") {
      line++
      lineStart = index + 1
    }
  }
  return { line, column: offset - lineStart + 1 }
}
