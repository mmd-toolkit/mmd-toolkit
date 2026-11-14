import {
  isLineTerminatorCode,
  isWhitespace,
} from "../db-from-tree/characters.ts"
import type { SourceScan } from "../source-scan.ts"

// common.md, `style` and `classDef` lines: the `;` that the line rule ignores,
// found from the text alone. A tree records them as `IgnoredSemicolon` tokens
// (or inside a comment), so the check of a tree compares what it records with
// what the text says.

/** The words whose rules the line rule applies in this order, `style` first. */
const RULE_WORDS = ["style", "classDef"] as const

/**
 * Whether the rule of `word` matches the line segment `chars`: `word`, then
 * later a `:`, then characters that are not whitespace and a `#`, then later a
 * `;`.
 */
function matchesRule(chars: string, word: string): boolean {
  const wordStart = chars.indexOf(word)
  if (wordStart === -1) return false
  // The `#` that follows a `:` with no whitespace between is the earliest one
  // that a match can use: a later `;` after it is after every later `#` too.
  let afterColon = false
  for (let offset = wordStart + word.length; offset < chars.length; offset++) {
    const character = chars.charAt(offset)
    if (character === "#" && afterColon) {
      return chars.includes(";", offset + 1)
    }
    if (character === ":") afterColon = true
    else if (isWhitespace(chars.charCodeAt(offset))) afterColon = false
  }
  return false
}

/** Adds to `found` the `;` of the line segment of `offsets` that the line rule ignores. */
function addIgnoredSemicolons(
  text: string,
  offsets: readonly number[],
  found: Set<number>,
): void {
  let visible = offsets
  for (const word of RULE_WORDS) {
    const chars = visible.map((offset) => text.charAt(offset)).join("")
    if (!matchesRule(chars, word)) continue
    const last = chars.lastIndexOf(";")
    found.add(visible[last])
    visible = visible.filter((_, index) => index !== last)
  }
}

/**
 * common.md, `style` and `classDef` lines: the offsets of the `;` that the line
 * rule ignores in `text` after `textStart`, the end of the frontmatter. The
 * rule reads each line segment, the text between two line terminators, U+2028,
 * or U+2029 that no directive takes, without the directives and without the
 * comment regions of `scan`.
 */
function semicolonsIgnoredByLineRule(
  text: string,
  textStart: number,
  scan: SourceScan,
): ReadonlySet<number> {
  const taken = new Uint8Array(text.length)
  for (const directive of scan.directives) {
    taken.fill(1, directive.range[0], directive.scanEnd)
  }
  const inRegion = new Uint8Array(text.length)
  for (const line of scan.commentLines) {
    inRegion.fill(1, line.region[0], line.region[1])
  }
  const found = new Set<number>()
  let segment: number[] = []

  /** Reads the line segment that ends here, and starts the next one. */
  function endSegment(): void {
    addIgnoredSemicolons(text, segment, found)
    segment = []
  }

  for (let offset = textStart; offset < text.length; offset++) {
    if (inRegion[offset] === 1) {
      endSegment()
    } else if (taken[offset] !== 1) {
      const code = text.charCodeAt(offset)
      if (isLineTerminatorCode(code) || code === 0x2028 || code === 0x2029) {
        endSegment()
      } else {
        segment.push(offset)
      }
    }
  }
  endSegment()
  return found
}

/**
 * The line rule applied to one text: which of its `;` the rule ignores. It
 * reads the text when the first question comes, which only a comment that ends
 * with a `;` asks.
 */
export class LineRule {
  private readonly text: string

  private readonly textStart: number

  private readonly scan: SourceScan

  private semicolons: ReadonlySet<number> | undefined

  public constructor(text: string, textStart: number, scan: SourceScan) {
    this.text = text
    this.textStart = textStart
    this.scan = scan
  }

  /** Whether the line rule ignores the `;` at `offset`. */
  public ignores(offset: number): boolean {
    this.semicolons ??= semicolonsIgnoredByLineRule(
      this.text,
      this.textStart,
      this.scan,
    )
    return this.semicolons.has(offset)
  }
}
