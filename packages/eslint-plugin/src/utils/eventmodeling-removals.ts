import { canEditRange } from "./edit-range.ts"
import type {
  EventmodelingAccTitleStatement,
  EventmodelingAccDescrStatement,
  EventmodelingAccDescrBlockStatement,
  Range,
} from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { removalRange } from "./removal.ts"
import { whitespacePartRange } from "./part-removal.ts"

/**
 * Eventmodeling's padded common forms can follow another statement. Line forms
 * own the remainder of that line, except a following comment; blocks leave any
 * following statement intact. A form on lines of its own uses normal removal.
 */
export function eventmodelingRemovalRange(
  sourceCode: MermaidSourceCode,
  node:
    | EventmodelingAccTitleStatement
    | EventmodelingAccDescrStatement
    | EventmodelingAccDescrBlockStatement,
): Range | null {
  if (!canEditRange(sourceCode, node.range)) return null
  const whole = removalRange(sourceCode, node)
  if (whole !== null) return whole
  const start = whitespacePartRange(sourceCode, node)[0]
  const lineStart = sourceCode.getIndexFromLoc({
    line: node.loc.start.line,
    column: 0,
  })
  if (sourceCode.text.slice(lineStart, start).trim() === "") return null
  if (node.type !== "EventmodelingAccDescrBlockStatement") {
    const after = sourceCode.lines[node.loc.end.line - 1].slice(
      node.loc.end.column,
    )
    if (after.trim() !== "") return null
    return [start, node.range[1] + after.length]
  }
  return [start, node.range[1]]
}
