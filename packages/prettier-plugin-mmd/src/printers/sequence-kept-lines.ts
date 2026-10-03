import type { KeptLines } from "./kept-lines.ts"
import { findLinesWithOwnSemicolons } from "./kept-lines.ts"
import type { Source } from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a sequence diagram: the lines that hold a `;`
 * other than one that separates statements (see
 * `findLinesWithOwnSemicolons`). No line of a sequence diagram is printed
 * as written.
 */
export function findSequenceKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const { root } = source
  if (root.body.type !== "SequenceDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-sequence")
  }
  const kept: KeptLines = {
    joined: findLinesWithOwnSemicolons(source, true),
    verbatim: new Set(),
    writtenIndentation: new Set(),
  }
  keptLinesBySource.set(source, kept)
  return kept
}
