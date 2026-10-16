import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"

/**
 * Keeps complete semicolon segments, including their indentation and inline
 * trivia (docs/kanban.md, Line rule and kept lines). Kanban has no semicolon
 * separators, so `isDroppedSemicolon` never drops one. The shared scans also
 * protect unclosed-directive stops and Unicode segment boundaries.
 */
export function findKanbanKeptLines(source: Source): KeptLines {
  const lines = new Set([
    ...findLinesWithOwnSemicolons(source),
    ...findLinesEndedBySemicolon(source),
  ])
  return { joined: lines, verbatim: lines, writtenIndentation: lines }
}
