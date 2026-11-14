import type { Node, Range, Token } from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineEndOf,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isWhitespace, textRead } from "./source.ts"
import {
  findStatementAfter,
  holdsStatementAfter,
} from "./accessibility-lines.ts"
import {
  diagramTypesWithJisonAccessibilityLines,
  isReadAsAccValueByOlderVersions,
} from "./acc-value-join.ts"
import { spansLinesThatCannotJoin } from "./layout.ts"
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
 * the `:`. So do these types for a comment of their own kind that does not
 * start with a `%%` (the four railroad types; see `commentsAfterAllowed`).
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
 * The bodies of the diagram types whose lexers read a line with `direction` as
 * the direction of the diagram (`.*direction\s+RL[^\n]*`).
 */
const bodiesReadingDirectionLines: ReadonlySet<string> = new Set([
  "FlowchartDiagram",
  "AgentflowDiagram",
  "ClassDiagram",
  "StateDiagram",
  "ErDiagram",
  "RequirementDiagram",
  "C4Diagram",
  "UsecaseDiagram",
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
  /** The range of the text, without the whitespace around it. */
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
 * line break; where it holds a `%%` or a line separator in a diagram type of
 * `diagramTypesEndingTextAtPercent`; where a treeView text holds a character of
 * the drawing of a box; where a line terminator separates the text from the
 * keyword or from the `}` and a diagram type of `bodiesReadingDirectionLines`
 * holds `direction` in it (also split by a directive); and where the block is
 * not closed or has no text, and where the oldest version that counts reads
 * the block as the value of the empty `accTitle:` or `accDescr:` before it
 * (docs/compatibility.md, Accessibility lines that the oldest version reads to
 * the end). The characters in the `omitted` ranges are not
 * printed (the drawing of a box in a treeView), and count as whitespace.
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
    diagramTypesStoringTheToken.has(source.root.diagramType) ||
    isReadAsAccValueByOlderVersions(source, statement)
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
  // A diagram type may put the whitespace around the text, and the line breaks
  // there, into the first and the last token of the text; a token of
  // whitespace only is no text.
  const first = inner.findIndex(
    (token) => token.type === "RawText" && !isBlank(token),
  )
  const last = inner.findLastIndex(
    (token) => token.type === "RawText" && !isBlank(token),
  )
  const firstToken = inner.findIndex((token) => token.type === "RawText")
  const lastToken = inner.findLastIndex((token) => token.type === "RawText")
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
    inner[firstToken].range[0] !== value.range[0] ||
    inner[lastToken].range[1] !== value.range[1]
  ) {
    return undefined
  }
  const beforeBrace = parts.slice(1, open)
  const beforeText = inner.slice(0, first).filter((token) => !isBlank(token))
  const afterText = inner.slice(last + 1).filter((token) => !isBlank(token))
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
  const textRange: Range = [
    inner[first].range[0] +
      textOf(source, inner[first]).length -
      textOf(source, inner[first]).trimStart().length,
    inner[last].range[1] -
      (textOf(source, inner[last]).length -
        textOf(source, inner[last]).trimEnd().length),
  ]
  const text = source.text.slice(...textRange)
  const spelled = textRead(source, ...textRange)
  // A lexer that reads a whole line starting at its beginning reads a line
  // with `direction` as the direction of the diagram, before or after the rule
  // of `accDescr`, so the form with the `:` reads the description as a
  // direction where the text of the block stood out of the reach of that rule:
  // after a line terminator that is no part of a line (LF, CR, U+2028, U+2029),
  // or with a directive inside the word, which mermaid.js takes away first.
  const apart =
    holdsLineTerminator(textRead(source, statement.range[0], textRange[0])) ||
    holdsLineTerminator(textRead(source, textRange[1], statement.range[1]))
  const endsAtPercent = diagramTypesEndingTextAtPercent.has(
    source.root.diagramType,
  )
  // A directive that is not closed takes the whitespace after it, line breaks
  // included, so in the form with the `:`, which ends at the line, what follows
  // would go on the line of the text.
  const holdsUnclosedDirective = source.root.directives.some(
    (directive) =>
      !directive.closed &&
      statement.range[0] <= directive.range[0] &&
      directive.range[0] < statement.range[1],
  )
  if (
    holdsLineBreak(spelled) ||
    holdsUnclosedDirective ||
    (apart &&
      bodiesReadingDirectionLines.has(source.root.body.type) &&
      spelled.toLowerCase().includes("direction")) ||
    (source.root.diagramType === "treeView" &&
      [...spelled].some((character) =>
        treeviewBoxCharacters.includes(character),
      )) ||
    (endsAtPercent &&
      (spelled.includes("\u2028") ||
        spelled.includes("\u2029") ||
        spelled.includes("%%")))
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
    value: textRange,
    text,
  }
}

/**
 * What a block on one line may be followed by on its line, so that it is
 * written with the `:` first, as "trivia" (whitespace, directives, and, in a
 * diagram type that ends the text of the form with the `:` before a `%%`,
 * comments) or as "statements" (another statement follows, and the printer
 * moves it to a line of its own): the line must then be one that does not keep
 * its statements together, and the diagram type is no C4 diagram, which keeps
 * the statements next to an empty block on their line. The result is undefined
 * where the block stays as written.
 */
function followingOf(
  source: Source,
  end: number,
): "trivia" | "statements" | undefined {
  if (!holdsStatementAfter(source, end)) {
    return commentsAfterAllowed(source, end) ? "trivia" : undefined
  }
  const line = lineStartOf(source, end - 1)
  return source.root.diagramType !== "c4" &&
    !findLinesWithOwnSemicolons(source).has(line) &&
    !findLinesEndedBySemicolon(source).has(line)
    ? "statements"
    : undefined
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
 * on its line, as the form with the `:` runs to the end of the line. Where
 * what the source holds after the statement stays on its printed line, the
 * caller passes `keepsFollowingOnItsLine`. The statement then stays as written
 * where anything but whitespace and trivia follows it on its line. The caller
 * passes `printedFrom` at the first preceding statement that stays on the
 * printed line, or at the block itself when it is printed alone; for a stretch,
 * it is the stretch start, but never before the source line of the block.
 */
export function printAccessibilityLine(
  source: Source,
  statement:
    | {
        readonly type?: string
        readonly range: readonly [number, number]
      }
    | undefined,
  printedFrom: number,
  keepsFollowingOnItsLine = false,
  omitted: readonly Range[] = [],
): string | undefined {
  const block = readDescriptionBlock(source, statement, omitted)
  if (
    block === undefined ||
    statement === undefined ||
    block.beforeBrace.length > 0 ||
    block.beforeText.length > 0 ||
    (keepsFollowingOnItsLine &&
      holdsStatementAfter(source, statement.range[1])) ||
    !commentsAfterAllowed(source, statement.range[1])
  ) {
    return undefined
  }
  // Keep the block where joining its lines changes the ignored `;` or the
  // end of its last line. Include only preceding statements that stay on its
  // printed line, since the line rule reads them too (docs/compatibility.md,
  // A description block on one line).
  if (
    spansLinesThatCannotJoin(source, printedFrom, statement.range[1], {
      ignoresTrivia: true,
    })
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
 * Whether the comments that follow a block on its line leave the form with the
 * `:` the same: there are none, or the diagram type ends the text of the form
 * with the `:` before a `%%` and they start with a `%%`. A comment of another
 * kind in such a diagram type (the `; c` of an ABNF diagram, the `# c` of a
 * PEG diagram, the `(* c *)` of an EBNF diagram, and the comment that opens
 * with a slash and an asterisk in a railroad and an EBNF diagram) is part of
 * the text of the form with the `:`.
 */
function commentsAfterAllowed(source: Source, end: number): boolean {
  const endsTextAtPercent =
    diagramTypesEndingTextAtPercent.has(source.root.diagramType) &&
    !diagramTypesWithJisonAccessibilityLines.has(source.root.diagramType)
  // The comments after a statement that follows the block on its line stay
  // with that statement, which goes to a line of its own.
  return findTriviaBetween(
    source,
    end,
    findStatementAfter(source, end) ?? lineEndOf(source, end),
  ).every(
    (item) =>
      item.type === "Directive" ||
      textRead(source, ...item.range) === "" ||
      (endsTextAtPercent && source.text.startsWith("%%", item.range[0])),
  )
}

/**
 * The text of the document with every description block that has a directive
 * before its text, or before its `{`, written with the `:` as the author would
 * write it: `keyword: text`, with the directives where they stand, no
 * whitespace before the `:`, one space after it, and no `}`. The form with the `:` is then printed by the rules
 * of the diagram type, so that the whitespace next to the directive is the one
 * that the same text written with the `:` gets (docs/compatibility.md, A
 * description block on one line). The result is undefined where there is no
 * such block. A block is rewritten where it stands on one line and what
 * follows it is allowed by `followingOf`: then the `}` is left out, or becomes
 * a line break before the statements that follow it.
 */
export function rewriteDirectiveBlocks(source: Source): string | undefined {
  const edits: [number, number, string][] = []
  forEachNode(source.root.body, (node) => {
    const block = readDescriptionBlock(source, node, [])
    if (
      block === undefined ||
      (block.beforeBrace.length === 0 && block.beforeText.length === 0) ||
      holdsLineBreak(textRead(source, ...node.range))
    ) {
      return
    }
    const following = followingOf(source, node.range[1])
    if (following === undefined) return
    let gapStart = block.open.range[0]
    while (isWhitespace(source.text[gapStart - 1])) gapStart--
    let textStart = block.open.range[1]
    while (isWhitespace(source.text[textStart])) textStart++
    let textEnd = block.close.range[0]
    while (isWhitespace(source.text[textEnd - 1])) textEnd--
    edits.push(
      [gapStart, textStart, ": "],
      [textEnd, block.close.range[1], following === "trivia" ? "" : "\n"],
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

/** Whether a token is a text of whitespace only. */
function isBlank(token: Token): boolean {
  return token.type === "RawText" && token.value.trim() === ""
}

/**
 * Whether a text holds a character that ends a line for a rule that reads from
 * the start of a line to its end: LF, CR, U+2028, or U+2029.
 */
function holdsLineTerminator(text: string): boolean {
  return [...text].some((character) => "\n\r\u2028\u2029".includes(character))
}

/**
 * Whether a text holds a line break (LF or CR) that the form with the `:`
 * would end its text at.
 */
function holdsLineBreak(text: string): boolean {
  return [...text].some((character) => lineBreakCharacters.includes(character))
}
