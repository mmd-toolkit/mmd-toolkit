import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import type { IshikawaLine } from "./ishikawa-layout.ts"
import { indentationShowsTree } from "./ishikawa-layout.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

/**
 * Whether a root that stands on the line of the header stays there: where the
 * indentation of the nodes is kept as written (docs/ishikawa.md, Indentation),
 * or where a directive touches the root.
 */
export function keepsRootOnHeaderLine(lines: readonly IshikawaLine[]): boolean {
  const root = lines[0]
  return (
    root?.keepsHeaderGroup === true ||
    (root?.indentation === null && !indentationShowsTree(lines))
  )
}

/**
 * Semicolons never separate nodes. Header-line roots can move whole, except
 * when a header directive touches the root (docs/ishikawa.md, Standalone
 * directives and Line rule and kept lines).
 */
export function findIshikawaKeptLines(
  source: Source,
  lines: readonly IshikawaLine[],
): KeptLines {
  const header = findTokenStartingAt(source, source.root.body.range[0])
  const headerLine =
    header === undefined ? -1 : lineStartOf(source, header.range[0])
  const joined = new Set(
    [...findLinesWithOwnSemicolons(source)].filter(
      (line) => line !== headerLine,
    ),
  )
  if (keepsRootOnHeaderLine(lines)) joined.add(headerLine)
  const verbatim = new Set(
    [...findLinesEndedBySemicolon(source)].filter((line) =>
      source.root.directives.some(
        (directive) =>
          !directive.closed && lineStartOf(source, directive.range[1]) === line,
      ),
    ),
  )
  return {
    joined,
    verbatim,
    ownIndentation: new Set([...joined, ...verbatim]),
  }
}
