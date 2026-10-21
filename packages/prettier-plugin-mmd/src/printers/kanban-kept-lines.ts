import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a kanban board (docs/kanban.md, Line rule and kept
 * lines): the lines that hold a `;`, which is never a separator in a board
 * (see `findLinesWithOwnSemicolons`), and the lines that a `;` decides the end
 * of, which are printed as written (see `findLinesEndedBySemicolon`). On the
 * first, the text from the first character that is not whitespace to the last
 * `;` stays as written, and the indentation and the whitespace after a shape
 * are the printer's, as on any line. The header line is not one of them: the
 * node on it moves to a line of its own, as the text after the header always
 * does.
 */
export function findKanbanKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const header = findTokenStartingAt(source, source.root.body.range[0])
  const headerLine =
    header === undefined ? -1 : lineStartOf(source, header.range[1] - 1)
  const joined = new Set(
    [...findLinesWithOwnSemicolons(source)].filter(
      (line) => line !== headerLine,
    ),
  )
  const verbatim = findLinesEndedBySemicolon(source)
  const kept: KeptLines = {
    joined,
    verbatim,
    writtenIndentation: new Set([...joined, ...verbatim]),
  }
  keptLinesBySource.set(source, kept)
  return kept
}
