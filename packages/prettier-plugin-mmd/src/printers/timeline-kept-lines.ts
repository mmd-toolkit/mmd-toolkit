import type { TimelineStatement } from "@mmd-toolkit/ast"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTimelineHeaderLineStatements } from "./timeline-header-line.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a timeline, whose statements stay together
 * (docs/timeline.md, Statements one per line):
 *
 * - The lines that hold a `;` (see `findLinesWithOwnSemicolons`; no `;`
 *   separates statements in a timeline, so every `;` is a character of a text
 *   or one that the line rule ignores). A line that a `;` decides the end of
 *   is printed as written (see `findLinesEndedBySemicolon`).
 * - The lines where a statement ends with whitespace that is part of its text
 *   and another statement follows on the line: `section S : x` is the
 *   section `S ` and an event, and the section would end its line with a
 *   space that only the `:` after it keeps from being trailing whitespace.
 *   A statement moves to a line of its own only when no such whitespace
 *   would be left at the end of the line before it.
 * - The lines of the statements that stay on the line of the header or on the
 *   line where a description block of that line ends. The versions of
 *   mermaid.js that read no direction draw each of these lines as text, so
 *   the statements on a line stay together and the whitespace between them is
 *   that of a text (docs/timeline.md, Header and direction).
 */
export function findTimelineKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const kept: KeptLines = {
    joined: new Set([
      ...findLinesWithOwnSemicolons(source),
      ...findLinesEndingInTextWhitespace(source),
      ...findLinesOfHeaderLineStatements(source),
    ]),
    verbatim: findLinesEndedBySemicolon(source),
    ownIndentation: new Set(),
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * The lines of the statements that stay on a line of the header, where the
 * statements after a description block stand on the line where it ends.
 */
function findLinesOfHeaderLineStatements(source: Source): number[] {
  return findTimelineHeaderLineStatements(source).flatMap((statement) => [
    lineStartOf(source, statement.range[0]),
    lineStartOf(source, statement.range[1] - 1),
  ])
}

/**
 * The lines whose first statement of a pair ends with a space or a tab of
 * its text and is followed by the second one on the same line.
 */
function findLinesEndingInTextWhitespace(source: Source): number[] {
  const body = source.root.body
  if (body.type !== "TimelineDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-timeline diagram")
  }
  const statements: readonly TimelineStatement[] = body.body
  const lines: number[] = []
  for (const [index, statement] of statements.entries()) {
    const next = statements.at(index + 1)
    const last = source.text[statement.range[1] - 1]
    if (
      next !== undefined &&
      (last === " " || last === "\t") &&
      lineStartOf(source, statement.range[1] - 1) ===
        lineStartOf(source, next.range[0])
    ) {
      lines.push(lineStartOf(source, next.range[0]))
    }
  }
  return lines
}
