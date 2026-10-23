import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a quadrant chart, as in the other diagram types: the
 * lines that hold a `;` other than one that separates statements (see
 * `findLinesWithOwnSemicolons`: a `;` that is a character of a title or of an
 * accessibility text, or one that the line rule ignores and that does not end
 * its line), whose statements stay together with their `;`, and the lines
 * that a `;` decides the end of, which are printed as written (see
 * `findLinesEndedBySemicolon`). A `;` that separates statements is dropped
 * with the line break that replaces it (docs/quadrant.md, Statements one per
 * line).
 */
export function findQuadrantKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const kept: KeptLines = {
    joined: findLinesWithOwnSemicolons(source),
    verbatim: findLinesEndedBySemicolon(source),
    writtenIndentation: new Set(),
  }
  keptLinesBySource.set(source, kept)
  return kept
}
