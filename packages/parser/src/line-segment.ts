import type { DirectiveMatch } from "./directives.ts"
import { nextOffset } from "./text-cursor.ts"

/**
 * common.md, `style` and `classDef` lines: a line segment as the line rule
 * reads it, without its directives, the characters before and after a
 * directive following one another, and without the `;` characters that the
 * rule has ignored so far.
 */
export interface LineSegmentReading {
  readonly text: string
  /** Where the segment starts. */
  readonly start: number
  /** Where the separator that ends the segment is, or the end of the source. */
  readonly end: number
  /** The directives inside the segment, keyed by their start offset. */
  readonly directives: ReadonlyMap<number, DirectiveMatch>
  /** The offsets of the `;` characters that the line rule ignores. */
  readonly ignoredSemicolons: ReadonlySet<number>
}

/** One character of a line segment. */
export interface SegmentCharacter {
  readonly codePoint: number
  /** Where the character is. */
  readonly start: number
  /** The offset after it. */
  readonly next: number
}

/**
 * The first character of the segment at or after `offset`: the directives
 * and the ignored `;` characters there are left out. Returns null at the
 * segment's end.
 */
export function segmentCharacterAt(
  reading: LineSegmentReading,
  offset: number,
): SegmentCharacter | null {
  let current = offset
  for (;;) {
    const directive = reading.directives.get(current)
    if (directive !== undefined) {
      current = directive.range[1]
    } else if (reading.ignoredSemicolons.has(current)) {
      current += 1
    } else {
      break
    }
  }
  if (current >= reading.end) return null
  const codePoint = reading.text.codePointAt(current)
  if (codePoint === undefined) return null
  return { codePoint, start: current, next: nextOffset(reading.text, current) }
}
