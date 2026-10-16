import type { Range } from "@mmd-toolkit/parser"
import { spansLinesThatCannotJoin, toAsciiLowerCase } from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTriviaBetween,
  isWhitespace,
} from "./source.ts"

/**
 * Whether the first line that is printed for an accessibility statement holds
 * `direction` and, after whitespace (line feeds included) and the comment
 * lines and directives that the lexer does not read, one of the directions
 * `TB`, `BT`, `RL`, and `LR`, in any case and not necessarily ending at a word
 * boundary (the direction line of the diagram type, in its specification). The line is judged as the
 * lexer reads it, without the directives and the comment lines. The direction
 * may stand after the line, in the source that follows it.
 */
export function holdsDirection(
  source: Source,
  statement: {
    readonly range: Range
    /**
     * The text of an `accTitle` or `accDescr:` statement, as the lexer reads
     * it; null for an `accDescr { ... }` block, whose first line is read
     * from the source.
     */
    readonly text: string | null
  },
): boolean {
  const [start, end] = statement.range
  let view: string
  if (
    statement.text !== null &&
    !spansLinesThatCannotJoin(source, start, end)
  ) {
    // The value of the tree is the text that the lexer reads, without the
    // directives inside it.
    const keyword = findStructuralToken(source, start)
    view = `${keyword?.value ?? ""}: ${statement.text}`
  } else {
    view = readableText(source, start, end)
  }
  let headEnd = 0
  while (headEnd < view.length && !isLineEnd(view[headEnd])) headEnd++
  const head = toAsciiLowerCase(view.slice(0, headEnd))
  const remainder = view.slice(headEnd)
  let from = head.indexOf("direction")
  while (from !== -1) {
    const afterKeyword = from + "direction".length
    let position = afterKeyword
    while (position < head.length && isWhitespace(head[position])) position++
    if (position < head.length) {
      if (
        position > afterKeyword &&
        isDirection(head.slice(position, position + 2))
      ) {
        return true
      }
    } else if (
      isDirectionAfterHead(source, remainder, end, position > afterKeyword)
    ) {
      return true
    }
    from = head.indexOf("direction", from + 1)
  }
  return false
}

/**
 * Whether a direction follows the first line of an accessibility statement,
 * after whitespace: in the rest of the statement, or, where only whitespace
 * is left of it, in the source after the statement. `separated` says whether
 * whitespace stands between `direction` and the end of the first line.
 */
function isDirectionAfterHead(
  source: Source,
  remainder: string,
  statementEnd: number,
  separated: boolean,
): boolean {
  let index = 0
  while (index < remainder.length && isWhitespace(remainder[index])) index++
  if (index < remainder.length) {
    return (
      (separated || index > 0) &&
      isDirection(toAsciiLowerCase(remainder.slice(index, index + 2)))
    )
  }
  const next = skipWhitespaceAndTrivia(source, statementEnd)
  return (
    (separated || index > 0 || next > statementEnd) &&
    isDirection(toAsciiLowerCase(source.text.slice(next, next + 2)))
  )
}

/**
 * The text from `from` to `to` as the lexer reads it: without the directives
 * and the comment lines.
 */
function readableText(source: Source, from: number, to: number): string {
  let text = ""
  let position = from
  while (position < to) {
    const trivia = findTriviaBetween(source, position, position + 1).at(0)
    if (trivia === undefined) {
      text += source.text[position]
      position++
    } else {
      position = trivia.range[1]
    }
  }
  return text
}

/** Whether a text of two characters is a direction, in lower case. */
function isDirection(text: string): boolean {
  return ["tb", "bt", "rl", "lr"].includes(text)
}

/**
 * The offset after the whitespace, the comments, and the directives that
 * start at `offset`, or `offset` when none does.
 */
function skipWhitespaceAndTrivia(source: Source, offset: number): number {
  let position = offset
  for (;;) {
    const trivia = findTriviaBetween(source, position, position + 1).at(0)
    if (trivia !== undefined) {
      position = trivia.range[1]
    } else if (
      position < source.text.length &&
      isWhitespace(source.text[position])
    ) {
      position++
    } else {
      return position
    }
  }
}

/** Whether a character ends a line for the run before `direction`: a line feed, U+2028, or U+2029. */
function isLineEnd(character: string): boolean {
  return character === "\n" || character === "\u2028" || character === "\u2029"
}
