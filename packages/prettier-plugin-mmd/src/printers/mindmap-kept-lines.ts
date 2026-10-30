import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
} from "./kept-lines.ts"
import { findLeadingDirectiveRuns } from "./mindmap-layout.ts"
import type { Source } from "./source.ts"
import { lineStartOf } from "./kept-lines.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a mindmap, whose statements stay together
 * (docs/mindmap.md, Comments): the lines that hold a `;` (see
 * `findLinesWithOwnSemicolons`; no `;` separates statements in a mindmap, so
 * every `;` is a character of a text or one that the line rule ignores), and
 * the lines that a `;` decides the end of, which are printed as written (see
 * `findLinesEndedBySemicolon`). A mindmap has one statement on a line, so
 * the lines keep a comment after it on the line.
 */
export function findMindmapKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const directiveLines = findLinesStartingWithDirective(source)
  const kept: KeptLines = {
    joined: findLinesWithOwnSemicolons(source),
    verbatim: new Set([
      ...findLinesEndedBySemicolon(source),
      ...directiveLines,
    ]),
    ownIndentation: directiveLines,
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * The lines of the nodes that start with a directive, whose indentation
 * counts the whitespace after the directive (see `findLeadingDirectiveRuns`):
 * they are printed as written from the directive, with the indentation before
 * it decided by the printer.
 */
function findLinesStartingWithDirective(source: Source): ReadonlySet<number> {
  return new Set(
    [...findLeadingDirectiveRuns(source).values()].map((run) =>
      lineStartOf(source, run.start),
    ),
  )
}
