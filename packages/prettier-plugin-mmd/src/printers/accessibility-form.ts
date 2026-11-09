import type { Node, Range, Token } from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import { lineEndOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isWhitespace } from "./source.ts"
import { printedToken } from "./spelling.ts"
import { treeviewBoxCharacters } from "./treeview-characters.ts"
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
 * The parts of a description block that the conversion to the form with the
 * `:` reads: the tokens, the directives beside the braces, and the text.
 */
interface DescriptionBlockParts {
  readonly keyword: Token
  readonly open: Token
  readonly close: Token
  /** The directives between the keyword and the `{`. */
  readonly beforeBrace: readonly Token[]
  /** The directives between the `{` and the text. */
  readonly beforeText: readonly Token[]
  /** The directives between the text and the `}`. */
  readonly afterText: readonly Token[]
  readonly value: Range
  readonly text: string
}

/**
 * Reads a description block that the form with the `:` can hold, or returns
 * undefined where the statement stays as written (docs/compatibility.md, A
 * description block on one line): the block has a text of one line, with
 * whitespace around it, also a line break (the form with the `:` has the text
 * on the line of the keyword); directives may stand inside the text and beside
 * the braces, and nothing else may. It stays as written where the text has a
 * line break, where it holds a `%%` or a line separator in a diagram type of
 * `diagramTypesEndingTextAtPercent`, where it is on lines of its own and holds
 * `direction`, where a treeView text holds a character of the drawing of a box,
 * and where the block is not closed or has no text. The characters
 * in the `omitted` ranges are not printed (the drawing of a box in a treeView),
 * and count as whitespace.
 */
function readDescriptionBlock(
  source: Source,
  statement:
    | {
        readonly type?: string
        readonly range: readonly [number, number]
      }
    | undefined,
  omitted: readonly Range[],
): DescriptionBlockParts | undefined {
  if (
    !isDescriptionBlock(statement) ||
    statement.value === null ||
    statement.closed === false ||
    diagramTypesStoringTheToken.has(source.root.diagramType)
  ) {
    return undefined
  }
  const { value } = statement
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
  const open = parts.findIndex(
    (token, at) => at > 0 && token.type === "Punctuator",
  )
  const close = parts.at(-1)
  const inner = parts.slice(open + 1, -1)
  const first = inner.findIndex((token) => token.type === "RawText")
  const last = inner.findLastIndex((token) => token.type === "RawText")
  if (
    open < 1 ||
    close === undefined ||
    textOf(source, parts[open]) !== "{" ||
    textOf(source, close) !== "}" ||
    first === -1 ||
    inner.some(
      (token) => token.type !== "RawText" && token.type !== "Directive",
    ) ||
    parts.slice(1, open).some((token) => token.type !== "Directive") ||
    inner[first].range[0] !== value.range[0] ||
    inner[last].range[1] !== value.range[1]
  ) {
    return undefined
  }
  const beforeBrace = parts.slice(1, open)
  const beforeText = inner.slice(0, first)
  const afterText = inner.slice(last + 1)
  if (
    ![
      [parts[0], ...beforeBrace, parts[open], ...beforeText, inner[first]],
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
    ) ||
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
    holdsLineBreak(source.text.slice(parts[open].range[1], value.range[0])) ||
    holdsLineBreak(source.text.slice(value.range[1], close.range[0]))
  const endsAtPercent = diagramTypesEndingTextAtPercent.has(
    source.root.diagramType,
  )
  if (
    text === "" ||
    !inner.some(
      (token) =>
        token.type === "RawText" && textOf(source, token).trim() !== "",
    ) ||
    holdsLineBreak(text) ||
    (onLinesOfItsOwn && text.toLowerCase().includes("direction")) ||
    (source.root.diagramType === "treeView" &&
      [...text].some((character) =>
        treeviewBoxCharacters.includes(character),
      )) ||
    (endsAtPercent &&
      (text.includes("\u2028") ||
        text.includes("\u2029") ||
        inner.some(
          (token) =>
            token.type === "RawText" && textOf(source, token).includes("%%"),
        )))
  ) {
    return undefined
  }
  return {
    keyword: parts[0],
    open: parts[open],
    close,
    beforeBrace,
    beforeText,
    afterText,
    value: [value.range[0], value.range[1]],
    text,
  }
}

/**
 * Whether what follows a block on its line lets it be written with the `:`:
 * only whitespace and directives follow, and, in a diagram type that ends the
 * text of the form with the `:` before a `%%`, comments too (the other types
 * read a comment after the `}` as part of the text of the form with the `:`).
 */
function followedOnlyByTrivia(source: Source, end: number): boolean {
  return (
    endsWithTrivia(source, end) &&
    (diagramTypesEndingTextAtPercent.has(source.root.diagramType) ||
      findTriviaBetween(source, end, lineEndOf(source, end)).every(
        (item) => item.type === "Directive",
      ))
  )
}

/**
 * The accessibility description `accDescr: text` that stands for a statement
 * `accDescr { text }`, or undefined where the statement stays as written
 * (docs/compatibility.md, A description block on one line). mermaid.js reads
 * the two forms the same, and the examples in its documentation use the form
 * with the `:` for a text of one line and never the block on one line. The
 * block is read by `readDescriptionBlock`. A directive before the `{` or
 * between the `{` and the text is not printed here: `rewriteDirectiveBlocks`
 * writes such a block with the `:` before the text is read, so that the rules
 * of the diagram type print the whitespace next to the directive. The caller
 * prints the statement on a line of its own, where no statement stays with it
 * on its line, as the form with the `:` runs to the end of the line; where
 * statements stay together on a line, it passes `endsItsLine` for the last of
 * them, and the statement stays as written where anything but whitespace and
 * trivia follows it on its line.
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
  const block = readDescriptionBlock(source, statement, omitted)
  if (
    block === undefined ||
    statement === undefined ||
    block.beforeBrace.length > 0 ||
    block.beforeText.length > 0 ||
    (endsItsLine && !endsWithTrivia(source, statement.range[1])) ||
    !commentsAfterAllowed(source, statement.range[1])
  ) {
    return undefined
  }
  // Whitespace before a directive that follows the text is kept as one space,
  // or none where the source has none.
  const trailingDirectives = block.afterText
    .map(
      (token) =>
        (isWhitespace(source.text[token.range[0] - 1]) ? " " : "") +
        textOf(source, token),
    )
    .join("")
  return `${printedToken(source, block.keyword)}: ${
    staysAsWritten(source, ...block.value)
      ? block.text
      : collapseRuns(block.text)
  }${trailingDirectives}`
}

/**
 * Whether the comments that follow a block on its line (there are none, or the
 * diagram type ends the text of the form with the `:` before a `%%`) leave the
 * form with the `:` the same.
 */
function commentsAfterAllowed(source: Source, end: number): boolean {
  return (
    diagramTypesEndingTextAtPercent.has(source.root.diagramType) ||
    findTriviaBetween(source, end, lineEndOf(source, end)).every(
      (item) => item.type === "Directive",
    )
  )
}

/**
 * The text of the document with every description block that has a directive
 * before its text, or before its `{`, written with the `:` as the author would
 * write it: the whitespace before the `{` is left out, the `{` becomes the `:`,
 * and the `}` is left out. The form with the `:` is then printed by the rules
 * of the diagram type, so that the whitespace next to the directive is the one
 * that the same text written with the `:` gets (docs/compatibility.md, A
 * description block on one line). The result is undefined where there is no
 * such block. A block is rewritten where it stands on one line, and only
 * whitespace, directives, and, in a diagram type that ends the text before a
 * `%%`, comments follow it.
 */
export function rewriteDirectiveBlocks(source: Source): string | undefined {
  const edits: [number, number, string][] = []
  forEachNode(source.root.body, (node) => {
    const block = readDescriptionBlock(source, node, [])
    if (
      block === undefined ||
      (block.beforeBrace.length === 0 && block.beforeText.length === 0) ||
      holdsLineBreak(source.text.slice(...node.range)) ||
      !followedOnlyByTrivia(source, node.range[1])
    ) {
      return
    }
    let gapStart = block.open.range[0]
    while (isWhitespace(source.text[gapStart - 1])) gapStart--
    edits.push(
      [gapStart, block.open.range[1], ":"],
      [block.close.range[0], block.close.range[1], ""],
    )
  })
  if (edits.length === 0) return undefined
  let text = source.text
  for (const [start, end, replacement] of edits.sort((a, b) => b[0] - a[0])) {
    text = text.slice(0, start) + replacement + text.slice(end)
  }
  return text
}

/** Calls `visit` for every node below `node`, in order. */
function forEachNode(node: Node, visit: (node: Node) => void): void {
  visit(node)
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child !== null && child !== undefined)
        forEachNode(child as Node, visit)
    }
  }
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
