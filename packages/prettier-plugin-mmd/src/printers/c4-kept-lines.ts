import type { C4Statement } from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineEndOf,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import {
  findFirstIndex,
  findTokensBetween,
  isCommentLine,
  isWhitespace,
} from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Semicolons never separate C4 statements. Empty description blocks supply
 * neither a statement separator nor a newline, so their neighbours stay on
 * their written line (diagrams/c4.md, Empty description blocks;
 * docs/c4.md, Empty description blocks and Line rule and semicolons).
 */
export function findC4KeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const diagram = source.root.body
  if (diagram.type !== "C4Diagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-C4 diagram")
  }
  const joined = new Set(findLinesWithOwnSemicolons(source))

  /** Keeps a null block attached to the closing brace on its written line. */
  function visit(statements: readonly C4Statement[]): void {
    for (const statement of statements) {
      if (statement.type === "C4BoundaryStatement") {
        visit(statement.body)
        const last = statement.body.at(-1)
        if (
          last?.type === "C4AccDescrBlockStatement" &&
          last.value === null &&
          lineStartOf(source, last.range[1] - 1) ===
            lineStartOf(source, statement.range[1] - 1)
        )
          joined.add(lineStartOf(source, last.range[1] - 1))
      }
    }
  }

  visit(diagram.body)
  const verbatim = new Set(findLinesEndedBySemicolon(source))
  const nonDirectiveTokens = source.root.tokens.filter(
    (token) => token.type !== "Directive",
  )
  for (const directive of source.trivia.filter(
    (item) => item.type === "Directive",
  )) {
    if (directive.range[0] < diagram.range[0]) continue
    const line = lineStartOf(source, directive.range[0])
    const end = lineEndOf(source, directive.range[1])
    const first = findFirstIndex(
      nonDirectiveTokens,
      (token) => token.range[0] >= line,
    )
    const next = nonDirectiveTokens[first]
    if (next !== undefined && next.range[0] < end) verbatim.add(line)
  }
  const kept: KeptLines = {
    joined,
    verbatim,
    ownIndentation: new Set(),
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * Keeps the complete gap after a diagram comment, including recovery lines
 * and terminal gaps. Common standalone comment lines use ordinary alignment
 * (diagrams/c4.md, Comments; docs/c4.md, Blank lines and Comments).
 */
export function c4KeptGapEnd(
  source: Source,
  start: number,
  end: number,
  beforeStatement: boolean,
): number | undefined {
  const takesBreak = source.root.comments.some((comment) => {
    if (comment.range[1] > end) return false
    if (
      comment.range[0] < start &&
      (comment.range[1] > start ||
        source.text.slice(comment.range[1], start).includes("\n"))
    )
      return false
    const following = source.text.slice(comment.range[1], end)
    const firstBreak = following.indexOf("\n")
    if (firstBreak === -1) return false
    if (
      firstBreak === following.lastIndexOf("\n") &&
      following.slice(firstBreak + 1).trim() === "" &&
      !following.includes("\u2028") &&
      !following.includes("\u2029")
    )
      return false
    const line = lineStartOf(source, comment.range[0])
    const standalone = findTokensBetween(source, line, comment.range[0]).every(
      (token) => token.type === "Directive",
    )
    return !standalone || !isCommentLine(source.text, source.root, comment)
  })
  if (!takesBreak) return undefined
  if (!beforeStatement) return end
  let stop = end
  while (
    stop > start &&
    source.text[stop - 1] !== "\n" &&
    isWhitespace(source.text[stop - 1])
  ) {
    stop--
  }
  return stop
}
