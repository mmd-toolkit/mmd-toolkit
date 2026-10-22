import type { Doc } from "prettier"
import { printAsWritten } from "./lines.ts"
import type { Range } from "@mmd-toolkit/parser"
import type { Source } from "./source.ts"
import { findTriviaBetween } from "./source.ts"

/** Directives before node text, whose intervening gaps count as indentation. */
export interface LeadingDirectives {
  readonly directives: readonly Range[]
  readonly gaps: readonly number[]
  readonly textStart: number
}

/**
 * The offsets of the U+2028 and U+2029 that end a diagram comment. Such a
 * separator is a node-line boundary even without a line feed
 * (diagrams/kanban.md and diagrams/ishikawa.md, Comments). Joined comment
 * fragments are already one trivia item, so their internal separators cannot
 * split a line.
 */
export function findCommentEnds(source: Source): number[] {
  return source.trivia
    .filter(
      (item) =>
        item.type === "Comment" &&
        (source.text[item.range[1]] === "\u2028" ||
          source.text[item.range[1]] === "\u2029"),
    )
    .map((item) => item.range[1])
}

/**
 * The directives that stand before the text of a line, which starts at
 * `textStart`, and the whitespace after each of them. The text of a node is
 * read without its directives, so all the whitespace before it is its
 * indentation, whatever lies between (diagrams/kanban.md, Directives inside
 * units; diagrams/ishikawa.md, Directives).
 */
export function findLeadingDirectives(
  source: Source,
  from: number,
  textStart: number,
): LeadingDirectives {
  const directives = findTriviaBetween(source, from, textStart)
    .filter((item) => item.type === "Directive")
    .map((item) => item.range)
  const gaps = directives.map((range, index) => {
    const next = directives[index + 1]?.[0] ?? textStart
    return source.text.slice(range[1], next).length
  })
  return { directives, gaps, textStart }
}

/**
 * Keeps leading directive gaps while they fit, shortening from the last gap,
 * then supplies the remaining indentation before the first directive
 * (docs/kanban.md, Directives; docs/ishikawa.md, Inline directives).
 */
export function placeLeadingDirectives(
  source: Source,
  leading: LeadingDirectives,
  column: number,
  character: string,
): {
  readonly indentation: string
  readonly head: Doc
  readonly column: string
} {
  const gaps = [...leading.gaps]
  let excess = gaps.reduce((sum, gap) => sum + gap, 0) - column
  for (let index = gaps.length - 1; index >= 0 && excess > 0; index--) {
    const cut = Math.min(gaps[index], excess)
    gaps[index] -= cut
    excess -= cut
  }
  const written = gaps.reduce((sum, gap) => sum + gap, 0)
  return {
    indentation: character.repeat(column - written),
    head: leading.directives.map((range, index) => [
      printAsWritten(source, range[0], range[1]),
      character.repeat(gaps[index]),
    ]),
    column: character.repeat(column),
  }
}
