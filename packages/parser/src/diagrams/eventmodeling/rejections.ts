import type { EventmodelingBodyItem } from "../../ast/eventmodeling.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"

/**
 * diagrams/eventmodeling.md, Semantic acceptance conditions: mermaid.js
 * rejects an input in which two frames, time frames or reset frames in any
 * combination and wherever they stand, have the same name as written. The
 * frames are walked in source order, and the first frame whose name an
 * earlier frame has throws a `ParseError` at that name.
 */
export function rejectRepeatedFrameNames(
  body: readonly EventmodelingBodyItem[],
  lines: LineIndex,
): void {
  const names = new Set<string>()
  for (const item of body) {
    if (
      item.type !== "EventmodelingTimeFrameStatement" &&
      item.type !== "EventmodelingResetFrameStatement"
    ) {
      continue
    }
    const { name } = item
    if (names.has(name.name)) {
      throw new ParseError(
        "A frame with this name exists already",
        name.range,
        lines.location(name.range),
      )
    }
    names.add(name.name)
  }
}
