import type { Token } from "@mmd-toolkit/ast"
import { lineEndOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isSpaceOrTab, isWhitespace } from "./source.ts"
import { printedToken } from "./spelling.ts"
import { collapseRuns, staysAsWritten } from "./text-runs.ts"

/**
 * The diagram types whose accessibility description stays in the form it is
 * written in: the columns of the lines of an event modeling diagram are part
 * of its grammar, and the colon form was not compared there.
 */
const diagramTypesKept: ReadonlySet<string> = new Set(["eventmodeling"])

/**
 * The accessibility description `accDescr: text` that stands for a statement
 * `accDescr { text }`, or undefined where the statement stays as written
 * (docs/compatibility.md, Spellings that are drawn the same). mermaid.js reads
 * the two forms the same, and the examples in its documentation use the form
 * with the `:` and never the block on one line.
 *
 * The statement is the block on one line: the keyword, the `{`, a text of one
 * line, and the `}`, with whitespace that holds no line break around the
 * text. The keyword and the `{` may stand apart, in any whitespace, since the
 * printer joins them. It stays as written where the text holds a `%%` (a
 * diagram of some types reads the rest of the line after it differently in the
 * form with the `:`), starts with a `{`, or holds whitespace other than a
 * space or a tab,
 * where the block is not closed, or has no text, where a comment or a
 * directive stands after the `}` on its line, where it holds one, and in the
 * diagram types of `diagramTypesKept`. The caller prints the statement on a
 * line of its own, where no statement stays with it on its line, as the form
 * with the `:` runs to the end of the line.
 */
export function printAccessibilityLine(
  source: Source,
  statement: {
    readonly type?: string
    readonly range: readonly [number, number]
  },
): string | undefined {
  if (
    diagramTypesKept.has(source.root.diagramType) ||
    statement.type?.endsWith("AccDescrBlockStatement") !== true
  ) {
    return undefined
  }
  const { value, closed } = statement as typeof statement & {
    readonly value?: { readonly range: readonly [number, number] } | null
    readonly closed?: boolean
  }
  if (value === undefined || value === null || closed === false) {
    return undefined
  }
  const tokens = source.root.tokens
  const index = tokens.findIndex(
    (token) => token.range[0] === statement.range[0],
  )
  const parts = tokens.slice(index, index + 4)
  if (
    index === -1 ||
    parts.length !== 4 ||
    textOf(source, parts[1]) !== "{" ||
    parts[2].type !== "RawText" ||
    parts[2].range[0] !== value.range[0] ||
    parts[2].range[1] !== value.range[1] ||
    textOf(source, parts[3]) !== "}" ||
    parts[3].range[1] !== statement.range[1] ||
    !isWhitespaceBetween(source, parts[0], parts[1], true) ||
    !isWhitespaceBetween(source, parts[1], parts[2], false) ||
    !isWhitespaceBetween(source, parts[2], parts[3], false) ||
    findTriviaBetween(source, statement.range[0], statement.range[1]).length >
      0 ||
    endsWithTrailingTrivia(source, statement.range[1])
  ) {
    return undefined
  }
  const text = source.text.slice(...value.range).trim()
  if (
    text === "" ||
    text.startsWith("{") ||
    text.includes("%%") ||
    [...text].some(
      (character) => isWhitespace(character) && !isSpaceOrTab(character),
    )
  ) {
    return undefined
  }
  return `${printedToken(source, parts[0])}: ${
    staysAsWritten(source, ...value.range) ? text : collapseRuns(text)
  }`
}

/**
 * Whether the printer keeps a comment or a directive on the line of a
 * statement that ends at `end`: one that stands after the statement and ends
 * the line. Trivia that a statement follows on the line goes with that
 * statement.
 */
function endsWithTrailingTrivia(source: Source, end: number): boolean {
  const lineEnd = lineEndOf(source, end)
  // A directive is a token of the tree, and no statement.
  const next = source.root.tokens.find(
    (token) => token.range[0] >= end && token.type !== "Directive",
  )
  const stop = next === undefined ? lineEnd : Math.min(next.range[0], lineEnd)
  return (
    (next === undefined || next.range[0] >= lineEnd) &&
    findTriviaBetween(source, end, stop).length > 0
  )
}

/** The text of a token. */
function textOf(source: Source, token: Token): string {
  return source.text.slice(...token.range)
}

/**
 * Whether only whitespace lies between two tokens: any whitespace where
 * `breaks` is true, otherwise whitespace that is no line break (LF, CR,
 * U+2028, and U+2029).
 */
function isWhitespaceBetween(
  source: Source,
  before: Token,
  after: Token,
  breaks: boolean,
): boolean {
  return [...source.text.slice(before.range[1], after.range[0])].every(
    (character) =>
      isWhitespace(character) &&
      (breaks || !lineBreakCharacters.includes(character)),
  )
}

/** The characters that end a line in a text that the printer reads. */
const lineBreakCharacters = "\n\r\u2028\u2029"
