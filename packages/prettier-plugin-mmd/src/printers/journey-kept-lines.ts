import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import {
  endsWithNeededWhitespace,
  findBlankRemainder,
} from "./journey-layout.ts"
import type { Source } from "./source.ts"

/** The kept lines of each source, found once per source. */
const keptLinesBySource = new WeakMap<Source, KeptLines>()

/**
 * Finds the kept lines of a user journey, whose statements stay together
 * (docs/journey.md, Statements one per line): the lines that hold a `;` (see
 * `findLinesWithOwnSemicolons`; no `;` separates statements in a user journey,
 * so every `;` is a character of a text or one that the line rule ignores).
 * A line that a `;` decides the end of is printed as written (see
 * `findLinesEndedBySemicolon`), and so is the line of a task that ends with
 * a colon that needs whitespace after it, when the line goes on with
 * anything but spaces and tabs (see `findBlankRemainder`).
 */
export function findJourneyKeptLines(source: Source): KeptLines {
  const cached = keptLinesBySource.get(source)
  if (cached !== undefined) return cached
  const kept: KeptLines = {
    joined: findLinesWithOwnSemicolons(source),
    verbatim: new Set([
      ...findLinesEndedBySemicolon(source),
      ...findLinesReadByTheirWhitespace(source),
    ]),
    ownIndentation: new Set(),
  }
  keptLinesBySource.set(source, kept)
  return kept
}

/**
 * The lines of the tasks whose colon needs whitespace after it that nothing
 * but a space or a tab may follow on the line: with a directive, a comment,
 * or another whitespace character there, the whitespace is read with what
 * lies around it, and the line is printed as written.
 */
function findLinesReadByTheirWhitespace(source: Source): number[] {
  const body = source.root.body
  if (body.type !== "JourneyDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-journey diagram")
  }
  return body.body
    .filter(
      (statement) =>
        endsWithNeededWhitespace(statement) &&
        findBlankRemainder(source, statement) === null,
    )
    .map((statement) => lineStartOf(source, statement.range[0]))
}
