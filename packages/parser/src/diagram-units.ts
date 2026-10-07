import type { Range } from "./ast.ts"
import { isLineSegmentSeparator, isWhitespace } from "./character-classes.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "./diagram-text.ts"
import { samePosition } from "./scanning.ts"

/**
 * common.md, A directive is a token boundary, and each diagram's Units and
 * contexts: one unit that a diagram's lexer reads from its diagram text.
 * `Name` is the diagram's set of unit names.
 */
export interface DiagramUnit<Name extends string> {
  /** The name, which the grammar uses. */
  readonly name: Name
  /** The text of the unit in converted form: the characters it read, unless the diagram gives the unit another text. */
  readonly text: string
  /** Which unit of the text this is, counted from 0. */
  readonly index: number
  /** Where the unit starts in the source. */
  readonly start: number
  /** Where the unit ends in the source: the offset after its last character. */
  readonly end: number
  /**
   * The source range of its token (`docs/tokens.md`, Tokens): from the first to the
   * last of its characters that are not whitespace, unless the diagram keeps
   * the whitespace at its ends (see {@link UnitEnds}); null for a unit that
   * has no token, as one that is all whitespace.
   */
  readonly significantRange: Range | null
  /**
   * common.md, A directive is a token boundary: the source range from the
   * first to the last of its characters that are not whitespace, inside
   * which a unit that may have no directive has none; null for a unit that
   * is all whitespace.
   */
  readonly nonWhitespaceRange: Range | null
}

/**
 * `docs/tokens.md`, Tokens, and each diagram's Tokens: which whitespace at the ends of
 * a unit its token leaves out. The token of most units leaves out all of it;
 * a diagram document names the units whose tokens keep the whitespace that
 * mermaid.js reads as part of a value:
 *
 * - `"trim-whitespace"`: all whitespace at the ends is left out.
 * - `"keep-whitespace"`: the token is the whole unit, which is not empty.
 * - `"trim-whitespace-but-line-separators"`: the whitespace at the ends is
 *   left out, except U+2028 and U+2029, which count as characters that are
 *   not whitespace.
 */
export type UnitEnds =
  "trim-whitespace" | "keep-whitespace" | "trim-whitespace-but-line-separators"

/**
 * The unit named `name`, the unit number `index` of the text, that reads
 * the characters of `reader` from `from` up to, and not including, `to`.
 * Its text is `text`, or those characters in converted form when `text` is
 * null; its token leaves out the whitespace at its ends as `ends` says.
 */
export function readUnit<Name extends string>(
  reader: DiagramText,
  name: Name,
  index: number,
  from: DiagramCharacter,
  to: DiagramPosition,
  text: string | null,
  ends: UnitEnds = "trim-whitespace",
): DiagramUnit<Name> {
  let characters = ""
  let significantStart: number | null = null
  let significantEnd = from.start
  let nonWhitespaceStart: number | null = null
  let nonWhitespaceEnd = from.start
  let end = from.start
  for (
    let position: DiagramPosition = from;
    position !== null && !samePosition(position, to);
    position = reader.after(position)
  ) {
    characters += String.fromCodePoint(position.codePoint)
    end = position.end
    // The `\n` of End of text has no source characters, so a token that
    // keeps it ends at the last source character it read, before the
    // directives and comment regions after that (`docs/tokens.md`, Tokens).
    if (isKeptAtEnds(position.codePoint, ends) && !position.endOfText) {
      significantStart ??= position.start
      significantEnd = position.end
    }
    if (!isWhitespace(position.codePoint)) {
      nonWhitespaceStart ??= position.start
      nonWhitespaceEnd = position.end
    }
  }
  return {
    name,
    text: text ?? characters,
    index,
    start: from.start,
    end,
    significantRange:
      significantStart === null ? null : [significantStart, significantEnd],
    nonWhitespaceRange:
      nonWhitespaceStart === null
        ? null
        : [nonWhitespaceStart, nonWhitespaceEnd],
  }
}

/** Whether a character `codePoint` at the ends of a unit is part of its token, as `ends` says. */
function isKeptAtEnds(codePoint: number, ends: UnitEnds): boolean {
  switch (ends) {
    case "trim-whitespace":
      return !isWhitespace(codePoint)
    case "keep-whitespace":
      return true
    case "trim-whitespace-but-line-separators":
      return !isWhitespace(codePoint) || isLineSegmentSeparator(codePoint)
    default:
      throw new Error(
        `mmd-toolkit parser bug: unknown unit ends ${JSON.stringify(ends satisfies never)}`,
      )
  }
}

/**
 * The source range of `unit` without the whitespace at its ends. Only for a
 * unit that the caller knows is not all whitespace, such as a delimiter, a
 * keyword, or a unit of an empty form; any other is a bug of the parser.
 */
export function significantRangeOf(unit: DiagramUnit<string>): Range {
  if (unit.significantRange === null) {
    throw new Error(
      `mmd-toolkit parser bug: the ${unit.name} unit at ${unit.start} is all whitespace`,
    )
  }
  return unit.significantRange
}
