import type { Token } from "@mmd-toolkit/ast"
import { lineEndOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isSpaceOrTab, isWhitespace } from "./source.ts"
import { printedToken } from "./spelling.ts"
import { collapseRuns, staysAsWritten } from "./text-runs.ts"

/**
 * The diagram types whose form with the `:` ends the text before a `%%` and
 * reads the rest of the line as a comment, since their grammars are built on
 * the terminal `ACC_DESCR` of the common grammar of mermaid.js. A block reads
 * the `%%` as part of the text, so in these types the two forms differ where
 * the text holds a `%%`. The other types read the `%%` as part of the text in
 * both forms.
 */
const diagramTypesEndingTextAtPercent: ReadonlySet<string> = new Set([
  "architecture",
  "cynefin",
  "gitGraph",
  "info",
  "packet",
  "pie",
  "radar",
  "railroad",
  "railroadAbnf",
  "railroadEbnf",
  "railroadPeg",
  "treeView",
  "treemap",
  "wardley",
])

/** The characters that end a line in a text that the printer reads. */
const lineBreakCharacters = "\n\r\u2028\u2029"

/**
 * The accessibility description `accDescr: text` that stands for a statement
 * `accDescr { text }`, or undefined where the statement stays as written
 * (docs/compatibility.md, A description block on one line). mermaid.js reads
 * the two forms the same, and the examples in its documentation use the form
 * with the `:` and never the block on one line.
 *
 * The statement is the block on one line: the keyword, the `{`, a text of one
 * line, and the `}`, with whitespace that holds no line break around the
 * text. The keyword and the `{` may stand apart, in any whitespace, since the
 * printer joins them. It stays as written where the text holds a `%%` in a
 * diagram type of `diagramTypesEndingTextAtPercent`, or whitespace other than a
 * space or a tab, where the block is not closed or has no text, and where a
 * comment or a directive stands inside it or after the `}` on its line. The
 * caller prints the statement on a line of its own, where no statement stays
 * with it on its line, as the form with the `:` runs to the end of the line.
 */
export function printAccessibilityLine(
  source: Source,
  statement:
    | {
        readonly type?: string
        readonly range: readonly [number, number]
      }
    | undefined,
): string | undefined {
  if (statement?.type?.endsWith("AccDescrBlockStatement") !== true) {
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
    !isWhitespaceBetween(source, parts[0], parts[1]) ||
    holdsLineBreak(source.text.slice(parts[1].range[1], parts[3].range[0])) ||
    findTriviaBetween(source, statement.range[0], statement.range[1]).length >
      0 ||
    endsWithTrailingTrivia(source, statement.range[1])
  ) {
    return undefined
  }
  const text = source.text.slice(...value.range).trim()
  if (
    text === "" ||
    (text.includes("%%") &&
      diagramTypesEndingTextAtPercent.has(source.root.diagramType)) ||
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

/** Whether only whitespace lies between two tokens. */
function isWhitespaceBetween(
  source: Source,
  before: Token,
  after: Token,
): boolean {
  return [...source.text.slice(before.range[1], after.range[0])].every(
    isWhitespace,
  )
}

/**
 * Whether a text holds a line break (LF, CR, U+2028, or U+2029). The text
 * between the braces is tested whole, since a diagram type puts the whitespace
 * around the text into the token of the text, or leaves it between the tokens.
 */
function holdsLineBreak(text: string): boolean {
  return [...text].some((character) => lineBreakCharacters.includes(character))
}
