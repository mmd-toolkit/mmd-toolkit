import type { Range } from "@mmd-toolkit/ast"
import { lineEndOf } from "./kept-lines.ts"
import { spansLinesThatCannotJoin, toAsciiLowerCase } from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTriviaBetween,
  isWhitespace,
  skipRemoved,
  textRead,
} from "./source.ts"

/**
 * Whether anything but whitespace, comments, and directives follows `end` on
 * its line: another statement, or a `;`.
 */
export function holdsStatementAfter(source: Source, end: number): boolean {
  const lineEnd = lineEndOf(source, end)
  let position = end
  for (const item of findTriviaBetween(source, end, lineEnd)) {
    if (![...source.text.slice(position, item.range[0])].every(isWhitespace))
      return true
    position = Math.max(position, item.range[1])
  }
  return ![...source.text.slice(position, lineEnd)].every(isWhitespace)
}

/**
 * Whether the first line that is printed for an accessibility statement holds
 * `direction` and, after whitespace (line feeds included) and the comment
 * lines and directives that the lexer does not read, one of the directions
 * `TB`, `BT`, `RL`, and `LR`, in any case and not necessarily ending at a word
 * boundary (the direction line of the diagram type, in its specification). The line is judged as the
 * lexer reads it, without the directives and the comment lines. The direction
 * may stand after the line, in the source that follows it.
 * `caseSensitive` follows a lexer that requires the written keyword and values
 * in exactly this case, rather than the default case-insensitive rule.
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
  options: { readonly caseSensitive?: boolean } = {},
): boolean {
  const caseSensitive = options.caseSensitive === true
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
    view = textRead(source, start, end)
  }
  let headEnd = 0
  while (headEnd < view.length && !isLineEnd(view[headEnd])) headEnd++
  const head = caseSensitive
    ? view.slice(0, headEnd)
    : toAsciiLowerCase(view.slice(0, headEnd))
  const remainder = view.slice(headEnd)
  let from = head.indexOf("direction")
  while (from !== -1) {
    const afterKeyword = from + "direction".length
    let position = afterKeyword
    while (position < head.length && isWhitespace(head[position])) position++
    if (position < head.length) {
      if (
        position > afterKeyword &&
        isDirection(head.slice(position, position + 2), caseSensitive)
      ) {
        return true
      }
    } else if (
      isDirectionAfterHead(
        source,
        remainder,
        end,
        position > afterKeyword,
        caseSensitive,
      )
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
  caseSensitive: boolean,
): boolean {
  let index = 0
  while (index < remainder.length && isWhitespace(remainder[index])) index++
  if (index < remainder.length) {
    return (
      (separated || index > 0) &&
      isDirection(remainder.slice(index, index + 2), caseSensitive)
    )
  }
  const next = skipWhitespaceAndRemoved(source, statementEnd)
  const second = skipRemoved(source, next + 1)
  const hasWhitespace = [...textRead(source, statementEnd, next)].some(
    isWhitespace,
  )
  return (
    (separated || index > 0 || hasWhitespace) &&
    isDirection(
      textRead(source, next, Math.min(second + 1, source.text.length)),
      caseSensitive,
    )
  )
}

/** Whether two characters match the direction values under the selected case rule. */
function isDirection(text: string, caseSensitive: boolean): boolean {
  const candidate = caseSensitive ? text : toAsciiLowerCase(text)
  return ["TB", "BT", "RL", "LR"].some(
    (value) => candidate === (caseSensitive ? value : value.toLowerCase()),
  )
}

/**
 * The offset of the first character from `offset` on that the lexer reads and
 * that is no whitespace (see `skipRemoved`), or the end of the text.
 */
function skipWhitespaceAndRemoved(source: Source, offset: number): number {
  let position = skipRemoved(source, offset)
  while (position < source.text.length && isWhitespace(source.text[position])) {
    position = skipRemoved(source, position + 1)
  }
  return position
}

/** Whether a character ends a line for the run before `direction`: a line feed, U+2028, or U+2029. */
function isLineEnd(character: string): boolean {
  return character === "\n" || character === "\u2028" || character === "\u2029"
}
