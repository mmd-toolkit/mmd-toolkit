import type { Range, Token } from "@mmd-toolkit/ast"
import { lineEndOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isWhitespace } from "./source.ts"
import { printedToken } from "./spelling.ts"
import { collapseRuns, staysAsWritten } from "./text-runs.ts"

/**
 * The diagram types whose form with the `:` ends the text before a `%%` and
 * reads the rest of the line as a comment, since their grammars are built on
 * the terminal `ACC_DESCR` of the common grammar of mermaid.js. A block reads
 * the `%%` as part of the text, so in these types the two forms differ where
 * the text holds a `%%`, and where a comment follows the block on its line.
 * The other types read the `%%` as part of the text in both forms, and reject
 * a comment after the `}` of a block or take it into the text of the form with
 * the `:`.
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

/**
 * The diagram types whose description is not the text of the block: mermaid.js
 * stores the token as it is written, with the keyword and the braces, so the
 * form with the `:` has another value (docs/compatibility.md, A description
 * block on one line).
 */
const diagramTypesStoringTheToken: ReadonlySet<string> = new Set([
  "eventmodeling",
])

/**
 * The characters that end a line in a text that the form with the `:` reads
 * to its end. U+2028 and U+2029 are no such characters: they are characters of
 * the text in both forms.
 */
const lineBreakCharacters = "\n\r"

/**
 * A description block of a diagram type, as far as the conversion reads it:
 * its range, its text, and, in the diagram types whose tree records it,
 * whether it is closed.
 */
interface DescriptionBlock {
  readonly type: string
  readonly range: readonly [number, number]
  readonly closed?: boolean
  readonly value: { readonly range: readonly [number, number] } | null
}

/** Whether a node of the tree is a description block (`accDescr { ... }`). */
function isDescriptionBlock(
  statement:
    | {
        readonly type?: string
        readonly range: readonly [number, number]
      }
    | undefined,
): statement is DescriptionBlock {
  return (
    statement?.type?.endsWith("AccDescrBlockStatement") === true &&
    "value" in statement &&
    (statement.value === null ||
      (typeof statement.value === "object" && "range" in statement.value)) &&
    (!("closed" in statement) || typeof statement.closed === "boolean")
  )
}

/**
 * The accessibility description `accDescr: text` that stands for a statement
 * `accDescr { text }`, or undefined where the statement stays as written
 * (docs/compatibility.md, A description block on one line). mermaid.js reads
 * the two forms the same, and the examples in its documentation use the form
 * with the `:` for a text of one line and never the block on one line.
 *
 * The statement is a block with a text of one line: the keyword, the `{`, the
 * text, and the `}`, with whitespace around the text, also a line break (the
 * form with the `:` has the text on the line of the keyword). The keyword and
 * the `{` may stand apart, in any whitespace, since the printer joins them. A
 * directive may stand inside the text. The statement stays as written where
 * the text has a line break, where it holds a `%%` in a diagram type of
 * `diagramTypesEndingTextAtPercent`, where the block is not closed or has no
 * text, where a comment or a directive stands between its tokens outside the
 * text, and where a comment follows it on its line in a diagram type that
 * reads the comment as part of the text of the form with the `:`. The caller
 * prints the statement on a line of its own, where no statement stays with it
 * on its line, as the form with the `:` runs to the end of the line; where
 * statements stay together on a line, it passes `endsItsLine` for the last of
 * them, and the statement stays as written where anything but whitespace and
 * trivia follows it on its line. The characters in the `omitted` ranges are
 * not printed (the drawing of a box in a treeView), and count as whitespace.
 */
export function printAccessibilityLine(
  source: Source,
  statement:
    | {
        readonly type?: string
        readonly range: readonly [number, number]
      }
    | undefined,
  endsItsLine = false,
  omitted: readonly Range[] = [],
): string | undefined {
  if (
    !isDescriptionBlock(statement) ||
    statement.value === null ||
    statement.closed === false
  ) {
    return undefined
  }
  const { value } = statement
  if (diagramTypesStoringTheToken.has(source.root.diagramType)) {
    return undefined
  }
  const tokens = source.root.tokens.filter(
    (token) =>
      !omitted.some(
        (range) => range[0] <= token.range[0] && token.range[1] <= range[1],
      ),
  )
  // The keyword is the first token of the statement, but for the prefix of a
  // branch in the box of a treeView, which the printer draws again.
  const index = tokens.findIndex(
    (token) => token.range[0] >= statement.range[0] && token.type === "Keyword",
  )
  const end = tokens.findIndex((token) => token.range[1] === statement.range[1])
  const parts = index === -1 || end === -1 ? [] : tokens.slice(index, end + 1)
  // A directive after the text and before the `}` is printed after the text,
  // as the form with the `:` prints it in every diagram type. A directive
  // before the `{` or between the `{` and the text stays where it is: the form
  // with the `:` prints the whitespace around it by a rule of the diagram type.
  const close = parts.at(-1)
  const inner = parts.slice(2, -1)
  const last = inner.findLastIndex((token) => token.type === "RawText")
  const afterText = inner.slice(last + 1)
  if (
    close === undefined ||
    textOf(source, parts[1]) !== "{" ||
    textOf(source, close) !== "}" ||
    inner[0]?.type !== "RawText" ||
    inner.some(
      (token) => token.type !== "RawText" && token.type !== "Directive",
    ) ||
    afterText.some((token) => token.type !== "Directive") ||
    inner[0].range[0] !== value.range[0] ||
    inner[last].range[1] !== value.range[1] ||
    ![
      [parts[0], parts[1], inner[0]],
      [inner[last], ...afterText, close],
    ].every((run) =>
      run.every(
        (token, at) =>
          at === 0 ||
          isWhitespaceBetween(
            source,
            run[at - 1].range[1],
            token.range[0],
            omitted,
          ),
      ),
    )
  ) {
    return undefined
  }
  if (
    findTriviaBetween(source, statement.range[0], statement.range[1]).some(
      (item) => item.type !== "Directive",
    )
  ) {
    return undefined
  }
  const text = source.text.slice(...value.range).trim()
  // A text on a line of its own in a block is read line by line: some lexers
  // read a line with `direction` as the direction of the diagram, which they
  // do not do for the text of the form with the `:`.
  const onLinesOfItsOwn =
    holdsLineBreak(source.text.slice(parts[1].range[1], value.range[0])) ||
    holdsLineBreak(source.text.slice(value.range[1], close.range[0]))
  if (
    text === "" ||
    !inner.some(
      (token) =>
        token.type === "RawText" && textOf(source, token).trim() !== "",
    ) ||
    holdsLineBreak(text) ||
    (onLinesOfItsOwn && text.toLowerCase().includes("direction")) ||
    (diagramTypesEndingTextAtPercent.has(source.root.diagramType) &&
      (text.includes("\u2028") || text.includes("\u2029"))) ||
    (diagramTypesEndingTextAtPercent.has(source.root.diagramType) &&
      inner.some(
        (token) =>
          token.type === "RawText" && textOf(source, token).includes("%%"),
      ))
  ) {
    return undefined
  }
  const trailing = findTriviaBetween(
    source,
    statement.range[1],
    lineEndOf(source, statement.range[1]),
  )
  if (
    (endsItsLine && !endsWithTrivia(source, statement.range[1])) ||
    (trailing.some((item) => item.type !== "Directive") &&
      !diagramTypesEndingTextAtPercent.has(source.root.diagramType))
  ) {
    return undefined
  }
  // Whitespace before a directive that follows the text is kept as one space,
  // or none where the source has none.
  const trailingDirectives = afterText
    .map(
      (token) =>
        (isWhitespace(source.text[token.range[0] - 1]) ? " " : "") +
        textOf(source, token),
    )
    .join("")
  return `${printedToken(source, parts[0])}: ${
    staysAsWritten(source, ...value.range) ? text : collapseRuns(text)
  }${trailingDirectives}`
}

/**
 * Whether only whitespace, comments, and directives stand between `end` and
 * the end of its line.
 */
function endsWithTrivia(source: Source, end: number): boolean {
  const lineEnd = lineEndOf(source, end)
  let position = end
  for (const item of findTriviaBetween(source, end, lineEnd)) {
    if (!isWhitespaceBetween(source, position, item.range[0])) return false
    position = Math.max(position, item.range[1])
  }
  return isWhitespaceBetween(source, position, lineEnd)
}

/** The text of a token. */
function textOf(source: Source, token: Token): string {
  return source.text.slice(...token.range)
}

/**
 * Whether only whitespace lies between two offsets, not counting the
 * characters in the `omitted` ranges.
 */
function isWhitespaceBetween(
  source: Source,
  start: number,
  end: number,
  omitted: readonly Range[] = [],
): boolean {
  for (let offset = start; offset < end; offset++) {
    if (
      !isWhitespace(source.text[offset]) &&
      !omitted.some((range) => range[0] <= offset && offset < range[1])
    ) {
      return false
    }
  }
  return true
}

/**
 * Whether a text holds a line break (LF or CR) that the form with the `:`
 * would end its text at.
 */
function holdsLineBreak(text: string): boolean {
  return [...text].some((character) => lineBreakCharacters.includes(character))
}
