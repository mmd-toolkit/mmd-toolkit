import type { Node } from "@mmd-toolkit/parser"
import type { AtomLayout } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
  lineEndOf,
} from "./kept-lines.ts"
import { printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween } from "./source.ts"

/**
 * Hidden body openers and closers share a line with their written neighbors
 * (docs/pie.md and docs/gitgraph.md, Hidden yaml and Hidden directives).
 */
export function findHiddenKeptLines(
  source: Source,
  hidden: readonly Node[],
): KeptLines {
  const joined = new Set(findLinesWithOwnSemicolons(source))
  for (const item of hidden) {
    joined.add(lineStartOf(source, item.range[0]))
    joined.add(lineStartOf(source, item.range[1] - 1))
  }
  return {
    joined,
    verbatim: findLinesEndedBySemicolon(source),
    writtenIndentation: new Set(),
  }
}

/**
 * Preserve consumed LF and closing padding outside hidden ranges, while the
 * ordinary shared block printer still aligns standalone trivia.
 */
export function hiddenBlockRules<Statement extends Node>(
  source: Source,
  hiddenEnds: ReadonlySet<number>,
  kept: KeptLines,
  printedEnd: (item: Statement) => number,
): BlockRules<Statement> {
  /**
   * Hidden YAML and directives consume LF outside their ranges; closing
   * padding can instead leave that LF visible. Keep both as written, removing
   * only the next statement's indentation (docs/pie.md, Hidden yaml and
   * Hidden directives; diagrams/pie.md, Hidden YAML and Hidden DIRECTIVE).
   */
  function hiddenGapEnd(
    start: number,
    end: number,
    beforeStatement: boolean,
  ): number | undefined {
    if (!hiddenEnds.has(start)) return undefined
    let stop = end
    if (beforeStatement) {
      while (
        stop > start &&
        (source.text[stop - 1] === " " || source.text[stop - 1] === "\t")
      )
        stop--
    }
    return stop
  }

  return {
    kept,
    printedEnd,
    joiningRegionsInValues: true,
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
    // A hidden form keeps its closing line joined; comments on that line
    // still retain their trailing text (docs/pie.md, Comments).
    keepsTrailingWhitespaceInKeptTrivia: true,
    // Inline successors use the joined-line path and keep their closing
    // padding. A whitespace-only tail belongs to the following gap instead,
    // so the same gap rule receives single-line and multiline boundaries.
    diagramLineEnd: (offset) =>
      hiddenEnds.has(offset) &&
      source.text.slice(offset, lineEndOf(source, offset)).trim() === ""
        ? offset
        : undefined,
    keptInlineGapEnd: (start) =>
      hiddenEnds.has(start) ? lineEndOf(source, start) : start,
    keptGapEnd: (start, end, beforeStatement) => {
      if (findTriviaBetween(source, start, end).length > 0) return undefined
      return hiddenGapEnd(start, end, beforeStatement)
    },
    triviaLineBreak: (start, end) => {
      const stop = hiddenGapEnd(start, end, true)
      return stop === undefined
        ? undefined
        : printAsWritten(source, start, stop)
    },
  }
}

/**
 * A hidden token consumes LF outside its node range; moving or trimming that
 * gap can reject input (diagrams/pie.md and diagrams/gitgraph.md, Hidden YAML
 * and Hidden DIRECTIVE; docs/pie.md and docs/gitgraph.md, Hidden yaml).
 */
export function protectHiddenGaps(
  layout: AtomLayout,
  hidden: readonly Node[],
): AtomLayout {
  const writtenGapsBefore = new Set<number>()
  for (const item of hidden) {
    const next = layout.atoms.find((atom) => atom.start >= item.range[1])
    if (next !== undefined) writtenGapsBefore.add(next.start)
  }
  return { ...layout, writtenGapsBefore }
}
