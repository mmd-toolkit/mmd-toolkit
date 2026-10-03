import type { Range } from "./ast.ts"
import {
  isLineSegmentSeparator,
  isLineTerminatorCharacter,
  isWhitespace,
} from "./character-classes.ts"
import { LEFT_CURLY_BRACKET, PERCENT_SIGN } from "./code-points.ts"
import type { DirectiveMatch } from "./directives.ts"
import { findDirectives, readDirective } from "./directives.ts"
import type { EntityDelimiter } from "./entities.ts"
import { findEntityDelimiters } from "./entities.ts"
import { decideIgnoredSemicolons } from "./line-rule.ts"
import { lineTerminatorEnd, nextOffset, skipBackWhile } from "./text-cursor.ts"

/**
 * common.md, Reading a source, item 1: a comment region, found by the
 * look-ahead from a comment start.
 */
export interface CommentRegionEntry {
  readonly kind: "region"
  /** The comment start where the look-ahead began. */
  readonly start: number
  /** After the line terminator that ends the comment's line, or the end of the source. */
  readonly end: number
  /** The comment: from the first `%` of its `%%` to the end of its line, without the line terminator ({@link commentEnd}). */
  readonly comment: Range
  /** The offset after the second `%` of the comment's `%%`. Directives can lie between the two `%`. */
  readonly afterMarker: number
  /** The directives inside the region, keyed by their start offset, in source order: those before the comment's `%%` and those inside the comment. */
  readonly directives: ReadonlyMap<number, DirectiveMatch>
}

/**
 * common.md, Reading a source, item 2: a line segment, with what the line
 * rule decides for it.
 */
export interface LineSegmentEntry {
  readonly kind: "segment"
  /** Where the segment starts: a comment start. */
  readonly start: number
  /** Where the separator that ends the segment is (a line terminator, U+2028, or U+2029 outside a directive), or the end of the source. */
  readonly end: number
  /** The offsets of the `;` characters that the line rule ignores. */
  readonly ignoredSemicolons: ReadonlySet<number>
  /** Entities: for the `#` and the `;` of every entity of the segment, keyed by offset, what the lexer reads in its place. */
  readonly entityDelimiters: ReadonlyMap<number, EntityDelimiter>
  /** The directives inside the segment, keyed by their start offset, in source order. */
  readonly directives: ReadonlyMap<number, DirectiveMatch>
}

/** What one look-ahead from a comment start decides: a comment region, or line segments. */
export type LineEntry = CommentRegionEntry | LineSegmentEntry

/** The directives found so far by one look-ahead, keyed by their start offset, in source order. */
function directivesByStart(
  directives: readonly DirectiveMatch[],
): Map<number, DirectiveMatch> {
  return new Map(directives.map((directive) => [directive.range[0], directive]))
}

/** A separator the look-ahead passed while it read over whitespace and directives. */
interface PassedSeparator {
  readonly offset: number
  readonly end: number
}

/**
 * The offset after the directives that start at `offset`, one after
 * another; `offset` itself when none starts there. They join `directives`.
 */
function passDirectives(
  text: string,
  offset: number,
  directives: DirectiveMatch[],
): number {
  let current = offset
  for (;;) {
    const directive = readDirective(text, current)
    if (directive === null) return current
    directives.push(directive)
    current = directive.range[1]
  }
}

/**
 * common.md, Reading a source, items 1 and 2, in one scan. From the comment
 * start `start`, the look-ahead reads forward one character at a time,
 * passing over each directive as a whole and recording it, and decides
 * whether it reaches a comment. Every position is judged for a directive
 * once, here.
 *
 * - When it reaches a `%%` of the text without its directives (two `%` that
 *   are not part of a directive, with nothing but directives between them)
 *   whose next character that is not part of a directive exists and is not
 *   `{` or part of a line terminator, the result is one comment region: from
 *   `start` through the line terminator that ends the comment's line.
 * - When it reaches any other character, the result is the line segments of
 *   the positions it passed: one per line up to the separator that ends the
 *   line of that character, each with the `;` characters that the line rule
 *   ignores. The look-ahead reads on to that separator.
 */
export function lookAheadFromCommentStart(
  text: string,
  start: number,
): LineEntry[] {
  const directives: DirectiveMatch[] = []
  const separators: PassedSeparator[] = []
  let offset = start
  while (offset < text.length) {
    const directive = readDirective(text, offset)
    if (directive !== null) {
      directives.push(directive)
      offset = directive.range[1]
      continue
    }
    const terminatorEnd = lineTerminatorEnd(text, offset)
    if (terminatorEnd !== null) {
      separators.push({ offset, end: terminatorEnd })
      offset = terminatorEnd
      continue
    }
    const codePoint = text.codePointAt(offset)
    if (codePoint === undefined) break
    if (isLineSegmentSeparator(codePoint)) {
      separators.push({ offset, end: offset + 1 })
      offset += 1
      continue
    }
    if (codePoint === PERCENT_SIGN) {
      // Comment lines: the first `%` is not part of a directive (judged
      // above). The second `%` is the next character that is not part of
      // a directive, and so is the character that must follow the `%%`.
      const secondPercent = passDirectives(text, offset + 1, directives)
      if (text.codePointAt(secondPercent) !== PERCENT_SIGN) {
        return segmentsUpTo(text, start, separators, directives, secondPercent)
      }
      const afterMarker = secondPercent + 1
      const following = passDirectives(text, afterMarker, directives)
      const followingCodePoint = text.codePointAt(following)
      if (
        followingCodePoint !== undefined &&
        followingCodePoint !== LEFT_CURLY_BRACKET &&
        !isLineTerminatorCharacter(followingCodePoint)
      ) {
        return [
          commentRegion(
            text,
            start,
            offset,
            afterMarker,
            following,
            directives,
          ),
        ]
      }
      return segmentsUpTo(text, start, separators, directives, following)
    }
    if (isWhitespace(codePoint)) {
      offset = nextOffset(text, offset)
      continue
    }
    return segmentsUpTo(text, start, separators, directives, offset)
  }
  return segmentsUpTo(text, start, separators, directives, text.length)
}

/**
 * Comment lines: the region of the comment whose `%%` starts at `marker`
 * and ends before `afterMarker`. The comment extends to the next line
 * terminator that is not part of a directive; U+2028 and U+2029 do not end
 * it. Its range ends as {@link commentEnd} says. The look-ahead has read up
 * to `resumeAt`.
 */
function commentRegion(
  text: string,
  start: number,
  marker: number,
  afterMarker: number,
  resumeAt: number,
  directives: DirectiveMatch[],
): CommentRegionEntry {
  let offset = resumeAt
  while (offset < text.length) {
    const directive = readDirective(text, offset)
    if (directive !== null) {
      directives.push(directive)
      offset = directive.range[1]
    } else if (lineTerminatorEnd(text, offset) !== null) {
      break
    } else {
      offset = nextOffset(text, offset)
    }
  }
  return {
    kind: "region",
    start,
    end: lineTerminatorEnd(text, offset) ?? offset,
    comment: [marker, commentEnd(text, marker, offset)],
    afterMarker,
    directives: directivesByStart(directives),
  }
}

/**
 * ast.md, Comment, and Comment lines: where the range of a comment that
 * starts at `start` and runs to `lineEnd` ends. `lineEnd` is where the line
 * terminator that ends the comment starts, which is not part of a
 * directive, or the end of the text when no such line terminator follows.
 * The range ends at `lineEnd`, except where the scan of a directive in the
 * comment takes the whitespace up to the end of the text, its line
 * terminators included, which only an unclosed one does: the range then
 * leaves out that whitespace, as the range of the directive does, so no
 * comment ends with a line terminator. Comment lines and the diagram
 * comments of each diagram end by this rule.
 */
export function commentEnd(
  text: string,
  start: number,
  lineEnd: number,
): number {
  if (lineEnd < text.length) return lineEnd
  const last = findDirectives(text, start).at(-1)
  if (last === undefined || last.range[1] !== text.length) return lineEnd
  return skipBackWhile(text, text.length, isWhitespace)
}

/**
 * The line segments from `start`: one for each separator the look-ahead
 * passed, and the last one from the last separator through the rest of its
 * line, read on from `resumeAt` to the separator that ends it. Each segment
 * gets the directives inside it and the `;` characters that the line rule
 * ignores.
 */
function segmentsUpTo(
  text: string,
  start: number,
  separators: readonly PassedSeparator[],
  directives: DirectiveMatch[],
  resumeAt: number,
): LineSegmentEntry[] {
  let offset = resumeAt
  while (offset < text.length) {
    const directive = readDirective(text, offset)
    if (directive !== null) {
      directives.push(directive)
      offset = directive.range[1]
      continue
    }
    const codePoint = text.codePointAt(offset)
    if (
      codePoint === undefined ||
      isLineTerminatorCharacter(codePoint) ||
      isLineSegmentSeparator(codePoint)
    ) {
      break
    }
    offset = nextOffset(text, offset)
  }
  const entries: LineSegmentEntry[] = []
  let segmentStart = start
  for (const separator of separators) {
    entries.push(segment(text, segmentStart, separator.offset, directives))
    segmentStart = separator.end
  }
  entries.push(segment(text, segmentStart, offset, directives))
  return entries
}

/** One line segment, with the directives inside it, the `;` characters that the line rule ignores, and its entities. */
function segment(
  text: string,
  start: number,
  end: number,
  directives: readonly DirectiveMatch[],
): LineSegmentEntry {
  const inside = directivesByStart(
    directives.filter(
      (directive) => start <= directive.range[0] && directive.range[1] <= end,
    ),
  )
  const ignoredSemicolons = decideIgnoredSemicolons(text, start, end, inside)
  return {
    kind: "segment",
    start,
    end,
    ignoredSemicolons,
    entityDelimiters: findEntityDelimiters({
      text,
      start,
      end,
      directives: inside,
      ignoredSemicolons,
    }),
    directives: inside,
  }
}
