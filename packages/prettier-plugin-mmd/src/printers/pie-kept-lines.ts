import type { PieDiagram } from "@mmd-toolkit/parser"
import type { KeptLines } from "./kept-lines.ts"
import {
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  lineStartOf,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"

/**
 * Statements on a hidden form's opening and closing lines stay together:
 * moving the form or changing its closing padding can change acceptance
 * (docs/pie.md, Hidden yaml and Hidden directives).
 */
export function findPieKeptLines(
  source: Source,
  diagram: PieDiagram,
): KeptLines {
  const joined = new Set(findLinesWithOwnSemicolons(source))
  for (const item of diagram.body) {
    if (item.type === "PieIgnoredText") {
      joined.add(lineStartOf(source, item.range[0]))
      joined.add(lineStartOf(source, item.range[1] - 1))
    }
  }
  return {
    joined,
    verbatim: findLinesEndedBySemicolon(source),
    writtenIndentation: new Set(),
  }
}
