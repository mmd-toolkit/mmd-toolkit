import type { Range } from "./ast.ts"
import { isWhitespace } from "./character-classes.ts"
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
   * The source range from the first to the last of its characters that are
   * not whitespace; null for a unit that is all whitespace.
   */
  readonly significantRange: Range | null
}

/**
 * The unit named `name`, the unit number `index` of the text, that reads
 * the characters of `reader` from `from` up to, and not including, `to`.
 * Its text is `text`, or those characters in converted form when `text` is
 * null.
 */
export function readUnit<Name extends string>(
  reader: DiagramText,
  name: Name,
  index: number,
  from: DiagramCharacter,
  to: DiagramPosition,
  text: string | null,
): DiagramUnit<Name> {
  let characters = ""
  let significantStart: number | null = null
  let significantEnd = from.start
  let end = from.start
  for (
    let position: DiagramPosition = from;
    position !== null && !samePosition(position, to);
    position = reader.after(position)
  ) {
    characters += String.fromCodePoint(position.codePoint)
    end = position.end
    if (!isWhitespace(position.codePoint)) {
      significantStart ??= position.start
      significantEnd = position.end
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
