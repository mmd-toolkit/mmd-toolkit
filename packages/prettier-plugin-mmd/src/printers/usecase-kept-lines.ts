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
    unjoined: findAccessibilityLinesBeforeEmptyRegion(source),
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

/**
 * The lines of a one-line accessibility statement whose value ends at a
 * U+2028 or U+2029 that a comment region follows, when the line after the
 * region holds no text. The statement ends at the character only where the
 * whitespace after the region is no part of its value: whitespace at the start
 * of the line after the region belongs to the value, so a line that starts
 * with whitespace (before a directive, or alone) keeps the statement as written
 * (docs/usecase.md, Line terminators). A system boundary cannot hold an
 * accessibility statement, so only the statements of the body are read.
 * The printer leaves out the whitespace at the end of such a value and prints
 * a region on a line of its own, so the statement is no joined line and its
 * text is printed as that of any statement.
 */
function findAccessibilityLinesBeforeEmptyRegion(
  source: Source,
): ReadonlySet<number> {
  const diagram = source.root.body
  if (diagram.type !== "UsecaseDiagram") {
    throw new Error("prettier-plugin-mmd: kept lines of a non-usecase diagram")
  }
  const lines = new Set<number>()
  for (const statement of diagram.body) {
    if (
      statement.type !== "UsecaseAccTitleStatement" &&
      statement.type !== "UsecaseAccDescrStatement"
    )
      continue
    const end = statement.range[1]
    const character = source.text[end - 1]
    if (
      (character === "\u2028" || character === "\u2029") &&
      source.joiningRegions.some(
        (region) => region.start === end && !region.joinsText,
      )
    ) {
      lines.add(lineStartOf(source, statement.range[0]))
    }
  }
  return lines
}
