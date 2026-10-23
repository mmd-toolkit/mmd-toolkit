import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineEndOf,
  lineStartOf,
} from "./kept-lines.ts"
import { findCommentEnds } from "./indentation-lines.ts"
import type { IshikawaLine } from "./ishikawa-layout.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

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
  const root = lines[0]
  if (root?.keepsHeaderGroup === true) joined.add(headerLine)
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
    writtenIndentation: new Set([...joined, ...verbatim]),
  }
}

/** Only actual diagram-comment endings cut kept stretches, never value LS/PS. */
export function ishikawaDiagramLineEnd(source: Source, offset: number): number {
  return Math.min(
    lineEndOf(source, offset),
    ...findCommentEnds(source).filter((ending) => ending >= offset),
  )
}
