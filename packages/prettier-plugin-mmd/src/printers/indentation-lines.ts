import type { Doc } from "prettier"
import { lineEndOf, lineStartOf } from "./kept-lines.ts"
import { printAsWritten } from "./lines.ts"
import type { Range } from "@mmd-toolkit/parser"
import type { Source } from "./source.ts"
import {
  findCommentLineEnds,
  findFirstIndex,
  findTriviaBetween,
} from "./source.ts"

/** Directives before node text, whose intervening gaps count as indentation. */
export interface LeadingDirectives {
  readonly directives: readonly Range[]
  readonly gaps: readonly number[]
  readonly textStart: number
}

const commentEndsBySource = new WeakMap<Source, readonly number[]>()

/**
 * The offsets of the U+2028 and U+2029 that end a diagram comment, in source
 * order. Such a separator is a node-line boundary even without a line feed
 * (diagrams/kanban.md, diagrams/mindmap.md, and diagrams/ishikawa.md,
 * Comments). Joined comment fragments are already one trivia item, so their
 * internal separators cannot split a line. A `;` that the line rule ignores
 * right after a comment does not hide its separator (see
 * `findCommentLineEnds`; docs/kanban.md, Indentation and Line rule and kept
 * lines). Found once per source, and read with the functions below, which
 * search it instead of scanning it.
 */
export function findCommentEnds(source: Source): readonly number[] {
  const cached = commentEndsBySource.get(source)
  if (cached !== undefined) return cached
  const ends = findCommentLineEnds(source)
    .map((end) => end.offset)
    .filter(
      (offset) =>
        source.text[offset] === "\u2028" || source.text[offset] === "\u2029",
    )
  commentEndsBySource.set(source, ends)
  return ends
}

/** Whether the U+2028 or U+2029 at `offset` ends a diagram comment. */
export function isCommentEnd(source: Source, offset: number): boolean {
  const ends = findCommentEnds(source)
  return ends[findFirstIndex(ends, (end) => end >= offset)] === offset
}

/**
 * Where the line of a node that holds `offset` starts: at the last separator
 * that ends a diagram comment at or before it, when that lies on the line of
 * the source, and otherwise where the line of the source does (see
 * `lineStartOf`). The separator is the first character of its line (see
 * `findCommentEnds`).
 */
export function findNodeLineStart(source: Source, offset: number): number {
  const ends = findCommentEnds(source)
  const end = ends[findFirstIndex(ends, (candidate) => candidate > offset) - 1]
  const lineStart = lineStartOf(source, offset)
  return end !== undefined && end > lineStart ? end : lineStart
}

/**
 * Where the text of the line of a node that holds `offset` begins: the
 * whitespace and the directives before the text start there. mermaid.js removes
 * a comment region that starts right after the separator that starts the line
 * (`Source.joiningRegions`), with the whitespace and the directives before its
 * comment, and the text after the region goes on the line of the separator. The
 * indentation of the node is that separator, as one character, and the
 * whitespace after the last such region, so what the region holds counts for
 * nothing. Where no region lies on the line, this is where the line starts (see
 * `findNodeLineStart`). A kanban board and a mindmap read the directives and
 * the whitespace of an inline-directive line from here; an Ishikawa diagram
 * reads them from the start of the line (see `ishikawaLines`).
 */
export function findNodeLineTextStart(source: Source, offset: number): number {
  const lineStart = findNodeLineStart(source, offset)
  const { joiningRegions } = source
  const region =
    joiningRegions[findFirstIndex(joiningRegions, (it) => it.end > offset) - 1]
  return region !== undefined && region.start >= lineStart
    ? region.end
    : lineStart
}

/**
 * The first separator that ends a diagram comment at or after `offset` and
 * before the line feed that ends the line of the source, or undefined: the
 * text up to it is one line of the diagram, and the text after it another.
 */
export function findCommentEndInLine(
  source: Source,
  offset: number,
): number | undefined {
  const ends = findCommentEnds(source)
  const end = ends[findFirstIndex(ends, (candidate) => candidate >= offset)]
  return end !== undefined && end < lineEndOf(source, offset) ? end : undefined
}

/**
 * Where the line of a node that holds `offset` ends: at a separator that ends
 * a diagram comment (see `findCommentEndInLine`), and otherwise where the line
 * of the source does (see `lineEndOf`).
 */
export function findNodeLineEnd(source: Source, offset: number): number {
  return findCommentEndInLine(source, offset) ?? lineEndOf(source, offset)
}

/**
 * The directives that stand before the text of a line, which starts at
 * `textStart`, and the whitespace after each of them. The text of a node is
 * read without its directives, so all the whitespace before it is its
 * indentation (diagrams/kanban.md, Directives inside units;
 * diagrams/ishikawa.md, Directives). A gap is the length of whatever lies
 * between two directives, or between the last one and the text: this function
 * does not check that it is whitespace, which `findLeadingDirectiveRun` of a
 * mindmap does.
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
