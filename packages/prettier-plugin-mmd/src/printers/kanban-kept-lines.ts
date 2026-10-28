import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"
import { findCommentEnds } from "./indentation-lines.ts"
import { kanbanLines } from "./kanban-layout.ts"

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
 * does. Every line of the board that is kept has an indentation of its own
 * (see `KeptLines.ownIndentation`), and so has the line of a node that starts
 * with a directive, also on a line that a comment region joins to the line
 * before it (docs/kanban.md, Directives): the printer decides it from the role
 * of the node, with `placeLine`.
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
  // A comment-ending separator already protects the selected semicolon's
  // boundary. Use joined layout on these lines so leading directives on the
  // next node receive their planned indentation (docs/kanban.md, Indentation
  // and Whitespace characters).
  const commentLines = new Set(
    findCommentEnds(source).map((end) => lineStartOf(source, end)),
  )
  const verbatim = new Set(
    [...findLinesEndedBySemicolon(source)].filter(
      (line) => !commentLines.has(line),
    ),
  )
  const directiveLines = kanbanLines(source)
    .filter((line) => line.leading !== null)
    .map((line) => lineStartOf(source, line.range[0]))
  const kept: KeptLines = {
    joined,
    verbatim,
    ownIndentation: new Set([...joined, ...verbatim, ...directiveLines]),
  }
  keptLinesBySource.set(source, kept)
  return kept
}
