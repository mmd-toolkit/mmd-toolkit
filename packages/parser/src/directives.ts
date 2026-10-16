import type { Range } from "./ast.ts"
import {
  DIRECTIVE_CLOSING,
  DIRECTIVE_OPENING,
  isLineSegmentSeparator,
  isWhitespace,
  isWordCharacter,
} from "./character-classes.ts"
import { COLON } from "./code-points.ts"
import { findCodePoints, nextOffset } from "./text-cursor.ts"

/** common.md, Where a directive is: one directive found in a text. */
export interface DirectiveMatch {
  readonly range: Range
  /** The directive name. */
  readonly name: string
  /** Where the text between `%%{` and `}%%` (or the end of the directive) is. */
  readonly valueRange: Range
  /** Whether the directive ends with `}%%`. */
  readonly closed: boolean
}

/**
 * The directives of one stretch of the source, a line segment or a comment
 * region, in source order, found by the offset where one starts and by the
 * offset where one ends. Both are made from the one list, and no two
 * directives overlap, so each offset finds at most one. Reading backward,
 * the entity rule asks for the directive that ends before each character;
 * looking through all the directives for every character would take time
 * in the square of their number.
 */
export class DirectiveIndex {
  /** The directives, in source order. */
  public readonly inSourceOrder: readonly DirectiveMatch[]

  private readonly byStart: ReadonlyMap<number, DirectiveMatch>

  private readonly byEnd: ReadonlyMap<number, DirectiveMatch>

  public constructor(directives: readonly DirectiveMatch[]) {
    this.inSourceOrder = directives
    this.byStart = new Map(
      directives.map((directive) => [directive.range[0], directive]),
    )
    this.byEnd = new Map(
      directives.map((directive) => [directive.range[1], directive]),
    )
  }

  /** The directive that starts at `offset`; undefined when none does. */
  public startingAt(offset: number): DirectiveMatch | undefined {
    return this.byStart.get(offset)
  }

  /** The directive that ends at `offset`; undefined when none does. */
  public endingAt(offset: number): DirectiveMatch | undefined {
    return this.byEnd.get(offset)
  }
}

/**
 * A text that the rule of Where a directive is reads one character at a
 * time: a string, or the diagram text that detection reads through the
 * directives and comment regions of the source (common.md, Diagram
 * detection). Offsets are offsets of the underlying text.
 */
export interface DirectiveRuleText {
  /** The character at `offset`, or undefined at the end of the text. */
  readonly codePointAt: (offset: number) => number | undefined
  /** The offset after the character at `offset`. */
  readonly after: (offset: number) => number
}

/** common.md, Where a directive is: where the parts of a directive are in its text. */
export interface DirectiveParts {
  /** Where the name starts and ends. */
  readonly name: Range
  /** The offset after the opening `%%{`. */
  readonly valueStart: number
  /** Where the whitespace after the argument ends, before a closing `}%%`. */
  readonly valueEnd: number
  /** The offset after the directive. */
  readonly end: number
  /** Whether the directive ends with `}%%`. */
  readonly closed: boolean
}

/** The offset after the characters `codePoints` at `offset` of `text`, or null. */
function matchSequence(
  text: DirectiveRuleText,
  offset: number,
  codePoints: readonly number[],
): number | null {
  let current = offset
  for (const expected of codePoints) {
    if (text.codePointAt(current) !== expected) return null
    current = text.after(current)
  }
  return current
}

/** The first offset at or after `offset` of `text` whose character does not satisfy `predicate`. */
function skipCharacters(
  text: DirectiveRuleText,
  offset: number,
  predicate: (codePoint: number) => boolean,
): number {
  let current = offset
  for (;;) {
    const codePoint = text.codePointAt(current)
    if (codePoint === undefined || !predicate(codePoint)) return current
    current = text.after(current)
  }
}

/**
 * common.md, Where a directive is: the parts of the directive that starts at
 * the `%%{` at `start` of `text`, if one does. Returns null when `%%{` is not
 * followed by zero or more whitespace characters and then a word character.
 */
export function matchDirective(
  text: DirectiveRuleText,
  start: number,
): DirectiveParts | null {
  const afterOpening = matchSequence(text, start, DIRECTIVE_OPENING)
  if (afterOpening === null) return null
  const nameStart = skipCharacters(text, afterOpening, isWhitespace)
  const nameEnd = skipCharacters(text, nameStart, isWordCharacter)
  if (nameEnd === nameStart) return null

  // `(whitespace* ":")?` is taken when a `:` follows the name and its
  // whitespace.
  let offset = nameEnd
  const afterNameWhitespace = skipCharacters(text, offset, isWhitespace)
  if (text.codePointAt(afterNameWhitespace) === COLON) {
    offset = text.after(afterNameWhitespace)
  }
  offset = skipCharacters(text, offset, isWhitespace)

  // The argument is a word when a word character comes first; otherwise it is
  // free text, which stops before the first `}%%`, before U+2028 or U+2029,
  // or at the end of the text.
  const argumentCodePoint = text.codePointAt(offset)
  if (argumentCodePoint !== undefined && isWordCharacter(argumentCodePoint)) {
    offset = skipCharacters(text, offset, isWordCharacter)
  } else {
    for (;;) {
      const codePoint = text.codePointAt(offset)
      if (codePoint === undefined || isLineSegmentSeparator(codePoint)) break
      if (matchSequence(text, offset, DIRECTIVE_CLOSING) !== null) break
      offset = text.after(offset)
    }
  }

  // The whitespace after the argument takes everything that follows, line
  // breaks included; the closing `}%%` is then taken if it follows.
  const valueEnd = skipCharacters(text, offset, isWhitespace)
  const afterClosing = matchSequence(text, valueEnd, DIRECTIVE_CLOSING)
  return {
    name: [nameStart, nameEnd],
    valueStart: afterOpening,
    valueEnd,
    end: afterClosing ?? valueEnd,
    closed: afterClosing !== null,
  }
}

/** A string as a {@link DirectiveRuleText}. */
function stringRuleText(text: string): DirectiveRuleText {
  return {
    codePointAt: (offset) => text.codePointAt(offset),
    after: (offset) => nextOffset(text, offset),
  }
}

/**
 * common.md, Where a directive is: reads the directive that starts at the
 * `%%{` at `start` of the string `text`, if one does (see
 * {@link matchDirective}).
 */
export function readDirective(
  text: string,
  start: number,
): DirectiveMatch | null {
  const parts = matchDirective(stringRuleText(text), start)
  if (parts === null) return null
  return {
    range: [start, parts.end],
    name: text.slice(parts.name[0], parts.name[1]),
    valueRange: [parts.valueStart, parts.closed ? parts.valueEnd : parts.end],
    closed: parts.closed,
  }
}

/**
 * common.md, Where a directive is: finds the directives in the text from
 * `from` to the end, in one scan from left to right. After a directive the
 * search continues where it ends; a `%%{` that starts no directive is passed
 * over one character at a time. The lexer finds the directives of the
 * source in its line look-ahead; this scan is the rule applied once more
 * to the diagram text by the condition of the `error` pseudo-diagram
 * (common.md, Diagram detection).
 */
export function findDirectives(text: string, from: number): DirectiveMatch[] {
  const directives: DirectiveMatch[] = []
  let offset = from
  while (offset < text.length) {
    const start = findCodePoints(text, offset, text.length, DIRECTIVE_OPENING)
    if (start === null) break
    const directive = readDirective(text, start)
    if (directive === null) {
      offset = nextOffset(text, start)
    } else {
      directives.push(directive)
      offset = directive.range[1]
    }
  }
  return directives
}
