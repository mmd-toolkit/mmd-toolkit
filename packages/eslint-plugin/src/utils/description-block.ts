import type {
  ArchitectureAccDescrBlockStatement,
  CynefinAccDescrBlockStatement,
  EventmodelingAccDescrBlockStatement,
  GitgraphAccDescrBlockStatement,
  Node,
  PacketAccDescrBlockStatement,
  PieAccDescrBlockStatement,
  RadarAccDescrBlockStatement,
  RailroadAccDescrBlockStatement,
  Token,
  TreemapAccDescrBlockStatement,
  TreeviewAccDescrBlockStatement,
  UsecaseAccDescrBlockStatement,
  WardleyAccDescrBlockStatement,
} from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { normalizeLineTerminators } from "./acc-text.ts"
import { textWithoutDirectives } from "./directive-free-text.ts"

/**
 * The line of the `{` of a description block, as mermaid.js reads it:
 * directives are taken out before the text is read, so a line ends at the first
 * line terminator outside the directives, and a directive that spans lines
 * carries the line on.
 */
export interface BraceLine {
  /** Where the line ends, without the whitespace at its end. */
  readonly end: number
  /** Whether text other than a directive stands after the line. */
  readonly textBeyond: boolean
}

/**
 * The line of the `{` of a block, from the tokens `body` after it. A token may
 * hold directives, which `sourceCode.ast.directives` gives; the line of a token
 * ends at its first line terminator outside them. A closing suggestion is not
 * offered for a block that holds a directive that is not closed.
 */
export function braceLineOf(
  sourceCode: MermaidSourceCode,
  brace: Token,
  body: readonly Token[],
): BraceLine {
  const { text } = sourceCode
  const { directives } = sourceCode.ast
  let end = brace.range[1]
  let line = brace.loc.end.line

  for (const [index, token] of body.entries()) {
    if (token.loc.start.line !== line) {
      return { end, textBeyond: textIn(body, index) }
    }
    // Where the line of the token ends: at a line terminator that no
    // directive holds.
    let lineEnd = token.range[1]
    for (let at = token.range[0]; at < token.range[1]; at++) {
      const directive = directives.find(
        (each) => each.range[0] <= at && at < each.range[1],
      )
      if (directive !== undefined) {
        at = directive.range[1] - 1
      } else if (text[at] === "\n" || text[at] === "\r") {
        lineEnd = at
        break
      }
    }
    end = token.range[0] + text.slice(token.range[0], lineEnd).trimEnd().length
    if (lineEnd < token.range[1]) return { end, textBeyond: true }
    line = token.loc.end.line
  }
  return { end, textBeyond: false }
}

/** Whether a token other than a directive is among `tokens`, from `from` on. */
function textIn(tokens: readonly Token[], from: number): boolean {
  return tokens.slice(from).some((token) => token.type !== "Directive")
}

/** The text before an offset on its physical line, without directives. */
function lineBeforeWithoutDirectives(
  sourceCode: MermaidSourceCode,
  index: number,
): string {
  const line = sourceCode.getLocFromIndex(index).line
  return textWithoutDirectives(
    sourceCode,
    sourceCode.getIndexFromLoc({ line, column: 0 }),
    index,
  )
}

/** Keep the block's logical lines together while removing directives and their line breaks. */
function descriptionLinesBefore(
  sourceCode: MermaidSourceCode,
  brace: Token,
  end: number,
): string[] {
  return normalizeLineTerminators(
    textWithoutDirectives(sourceCode, brace.range[1], end),
  ).split("\n")
}

/** Comment lines may have indentation before their `%%`. */
function startsCommentLine(text: string): boolean {
  return text.trimStart().startsWith("%%")
}

interface DescriptionBlockOptions {
  /** Whether comment lines are retained in the block's text instead of separate Comments. */
  readonly commentLinesAreText?: boolean
}

/**
 * Whether the text of the closed block whose `{` is `brace` and whose text is
 * `body` holds a `{` after the line of the block's `{` (a line is what
 * `braceLineOf` gives, which a directive may carry on). A `{` on the line of
 * the block's `{` is a `{` of the description. The closing `}` holds no `{`, so
 * it does not matter whether it is among the tokens of `body`. Where comment
 * lines are retained as text, their opening braces do not count.
 */
export function holdsBraceAfterBraceLine(
  sourceCode: MermaidSourceCode,
  brace: Token,
  body: readonly Token[],
  options: DescriptionBlockOptions = {},
): boolean {
  if (options.commentLinesAreText) {
    const last = body.at(-1)
    if (last === undefined) return false
    return descriptionLinesBefore(sourceCode, brace, last.range[1])
      .slice(1)
      .some((line) => !startsCommentLine(line) && line.includes("{"))
  }
  const { end } = braceLineOf(sourceCode, brace, body)
  return body
    .filter((token) => token.type !== "Directive")
    .some((token) =>
      sourceCode.text
        .slice(Math.max(token.range[0], end), token.range[1])
        .includes("{"),
    )
}

/**
 * Whether the closed block whose `{` is `brace` and whose text is `body` ends
 * at a `}` written for another statement: its text holds a `{` after the line
 * of the block's `{`, and the `}` that closes it (`closing`) does not stand
 * alone on its line: only whitespace and directives stand before it there,
 * whatever follows it. A `}` alone on its line is the author's: it closes the
 * block as written. `closing` is the last token of the block. Where comment
 * lines are text, a closing brace on one of them is not blamed on a later statement.
 */
export function closedByBraceOfOtherStatement(
  sourceCode: MermaidSourceCode,
  brace: Token,
  body: readonly Token[],
  closing: Token,
  options: DescriptionBlockOptions = {},
): boolean {
  const before = options.commentLinesAreText
    ? (descriptionLinesBefore(sourceCode, brace, closing.range[0]).at(-1) ?? "")
    : lineBeforeWithoutDirectives(sourceCode, closing.range[0])
  if (
    before.trim() === "" ||
    (options.commentLinesAreText && startsCommentLine(before))
  ) {
    return false
  }
  return holdsBraceAfterBraceLine(sourceCode, brace, body, options)
}

/**
 * Whether a comment lies in the description block `block`, between its `{` and
 * its `}`. A comment before the `{` or after the `}` is no part of the block.
 * A block without a `}` ends at its last token.
 */
export function blockHoldsComment(
  sourceCode: MermaidSourceCode,
  block: Node,
): boolean {
  const opening = sourceCode.getFirstToken(block, {
    filter: (token) => token.type === "Punctuator" && token.value === "{",
  })
  const closing =
    sourceCode.getLastToken(block, {
      filter: (token) => token.type === "Punctuator" && token.value === "}",
    }) ?? sourceCode.getLastToken(block)
  return (
    opening !== null &&
    closing !== null &&
    sourceCode.commentsExistBetween(opening, closing)
  )
}

/** A closed block with neither description text nor a comment to fill in later. */
export function isEmptyDescriptionBlock(
  sourceCode: MermaidSourceCode,
  node:
    | PieAccDescrBlockStatement
    | UsecaseAccDescrBlockStatement
    | GitgraphAccDescrBlockStatement
    | PacketAccDescrBlockStatement
    | ArchitectureAccDescrBlockStatement
    | RadarAccDescrBlockStatement
    | TreemapAccDescrBlockStatement
    | RailroadAccDescrBlockStatement
    | CynefinAccDescrBlockStatement
    | WardleyAccDescrBlockStatement
    | EventmodelingAccDescrBlockStatement
    | TreeviewAccDescrBlockStatement,
): boolean {
  return (
    (node.value?.value ?? "").trim() === "" &&
    !blockHoldsComment(sourceCode, node)
  )
}
