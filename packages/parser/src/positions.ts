import type { Location, Position, Range } from "./ast.ts"
import { firstIndexWhere } from "./ordered-search.ts"
import { lineTerminatorEnd, nextOffset } from "./text-cursor.ts"

/**
 * ast.md, Positions: lines are counted from 1 and end at `\r\n`, a lone `\r`,
 * or `\n`; columns are counted from 0 in UTF-16 code units. U+2028 and
 * U+2029 do not end a line.
 */
export class LineIndex {
  /** The offset at which each line starts; the first line starts at 0. */
  private readonly lineStarts: readonly number[]

  public constructor(text: string) {
    const lineStarts = [0]
    let offset = 0
    while (offset < text.length) {
      const terminatorEnd = lineTerminatorEnd(text, offset)
      if (terminatorEnd === null) {
        offset = nextOffset(text, offset)
      } else {
        offset = terminatorEnd
        lineStarts.push(offset)
      }
    }
    this.lineStarts = lineStarts
  }

  /** The position of `offset`. */
  public position(offset: number): Position {
    // The last line that starts at the offset or before it; the first line
    // starts at 0.
    const index =
      firstIndexWhere(this.lineStarts, (start) => start > offset) - 1
    return { line: index + 1, column: offset - this.lineStarts[index] }
  }

  /** The location of `range`. */
  public location(range: Range): Location {
    return { start: this.position(range[0]), end: this.position(range[1]) }
  }
}
