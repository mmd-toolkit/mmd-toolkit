import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"

/**
 * Every semicolon stays; only an open directive needs a whole verbatim line.
 * Other prefixes protect complete crossing atoms in the layout (common.md,
 * Style and classDef lines; docs/usecase.md, Statements and semicolons).
 */
export function findUsecaseKeptLines(source: Source): KeptLines {
  return {
    joined: findLinesWithOwnSemicolons(source),
    verbatim: new Set(
      [...findLinesEndedBySemicolon(source)].filter((line) =>
        source.root.directives.some(
          (directive) =>
            !directive.closed &&
            lineStartOf(source, directive.range[1]) === line,
        ),
      ),
    ),
    ownIndentation: new Set(),
  }
}
