import type { Node } from "@mmd-toolkit/parser"
import { builders } from "prettier/doc"
import type { AtomLayout } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  findVerbatimStyleLines,
  lineStartOf,
  lineEndOf,
} from "./kept-lines.ts"
import { printAsWritten } from "./lines.ts"
import { readGap } from "./gap.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween } from "./source.ts"

const { literalline } = builders

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
    verbatim: new Set([
      ...findLinesEndedBySemicolon(source),
      ...findVerbatimStyleLines(source),
    ]),
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
  headerHiddenEnds: ReadonlySet<number>,
): BlockRules<Statement> {
  /**
   * Hidden YAML and directives consume LF outside their ranges; closing
   * padding can instead leave that LF visible. Retain closing padding and
   * exclude the next statement's indentation; ordinary following blank lines
   * use the shared gap reading (docs/pie.md, Blank lines and Hidden yaml;
   * diagrams/pie.md, Hidden YAML and Hidden DIRECTIVE).
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

  /** Only exterior ASCII blank lines use the ordinary blank-line decision. */
  function hasOrdinaryHiddenBreak(start: number, end: number): boolean {
    const text = source.text.slice(start, end)
    return (
      text.includes("\n") &&
      [...text].every((char) => char === " " || char === "\t" || char === "\n")
    )
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
      const stop = hiddenGapEnd(start, end, beforeStatement)
      return stop === undefined || hasOrdinaryHiddenBreak(start, stop)
        ? undefined
        : stop
    },
    triviaLineBreak: (start, end, terminal) => {
      const stop = hiddenGapEnd(start, end, !terminal)
      if (stop === undefined) return undefined
      if (!hasOrdinaryHiddenBreak(start, stop))
        return printAsWritten(source, start, stop)
      const gap = readGap(source, start, stop, false)
      const firstBreak = source.text.indexOf("\n", start)
      // The shared gap decision leaves at most one blank line. A spare LF
      // is needed after a statement even on the header's line. Only the
      // header's own hidden forms and EOF use the ordinary edge break.
      // Literal breaks retain the closer's padding; the block supplies the
      // next indentation
      // (docs/pie.md, docs/gitgraph.md, docs/info.md and docs/packet.md,
      // Blank lines).
      const breaks =
        !terminal && !headerHiddenEnds.has(start) && gap.blankAfter
          ? [literalline, literalline]
          : [literalline]
      // The shared terminal path adds LF to input that does not end in LF.
      if (terminal && !source.text.endsWith("\n")) breaks.pop()
      return [printAsWritten(source, start, firstBreak), ...breaks]
    },
  }
}

/**
 * A hidden token consumes LF outside its node range; moving or trimming that
 * gap can reject input. Hidden openers keep authored contact instead of an
 * ordinary spacing rule (diagrams/pie.md and diagrams/gitgraph.md, Hidden YAML
 * and Hidden DIRECTIVE; docs/pie.md and docs/gitgraph.md, Hidden yaml).
 */
export function protectHiddenGaps(
  layout: AtomLayout,
  hidden: readonly Node[],
): AtomLayout {
  const rules = new Map(layout.rules)
  const writtenGapsBefore = new Set<number>()
  for (const item of hidden) {
    rules.delete(item.range[0])
    const next = layout.atoms.find((atom) => atom.start >= item.range[1])
    if (next !== undefined) writtenGapsBefore.add(next.start)
  }
  return { ...layout, rules, writtenGapsBefore }
}
