import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a sankey diagram, as in the other diagram types:
 * the lines that hold a `;` (see `findLinesWithOwnSemicolons`; no `;`
 * separates records, so every `;` is a character of a field or one that the
 * line rule ignores, and a `;` that the rule ignores at the end of its line is
 * kept, since dropping it changes which `;` the rule ignores), and the lines
 * that a `;` decides the end of, which are printed as written (see
 * `findLinesEndedBySemicolon`).
 */
export function findSankeyKeptLines(source: Source): KeptLines {
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
