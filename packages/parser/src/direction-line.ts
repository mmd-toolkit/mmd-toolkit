import {
  LINE_FEED,
  LINE_SEPARATOR,
  PARAGRAPH_SEPARATOR,
} from "./code-points.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "./diagram-text.ts"
import type { Match } from "./scanning.ts"
import {
  isWhitespaceAt,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "./scanning.ts"
import { isWhitespace } from "./character-classes.ts"

/** The units of a direction line, as flowchart.md and class.md name them. */
export type DirectionLineUnitName =
  "direction-text" | "direction" | "direction-value"

/** One unit of a direction line: its name and the characters it reads, from `from` up to, and not including, `to`. */
export interface DirectionLineUnit {
  readonly name: DirectionLineUnitName
  readonly from: DiagramCharacter
  readonly to: DiagramPosition
}

/** A direction line: its units, in source order, and the place after it, the line feed that ends its line. */
export interface DirectionLineMatch {
  readonly units: readonly DirectionLineUnit[]
  readonly end: DiagramPosition
}

/**
 * How the rule compares a word with the text: `matchWord` of `scanning.ts`
 * where the diagram compares letters as written (flowchart and class), and
 * `matchWordIgnoringCase` where it compares them case-insensitively
 * (state).
 */
export type WordMatcher = (
  reader: DiagramText,
  from: DiagramPosition,
  word: string,
) => Match | null

/** For a value, the last `direction` of the run that the value follows. */
interface Occurrence {
  readonly keyword: DiagramCharacter
  readonly keywordEnd: DiagramPosition
  readonly value: DiagramCharacter
  readonly valueEnd: DiagramPosition
}

/**
 * diagrams/flowchart.md, diagrams/class.md, and diagrams/state.md, The
 * direction line, which the diagram types share with their own lists of values
 * (flowchart has `TD` as well) and their own way of comparing words (state
 * compares them case-insensitively). From a place: a run of characters without
 * line feeds, U+2028, or U+2029; `direction`; one or more whitespace, line
 * feeds included; one of the values; and every character up to the next line
 * feed. The values are tried in their order, and for a value the last
 * `direction` of the run that it follows is taken. The characters before
 * `direction` and after the value are `direction-text` units, unless they are
 * empty or all whitespace.
 */
export class DirectionLineRule {
  private readonly reader: DiagramText

  /** The values, in the order in which they are tried. */
  private readonly values: readonly string[]

  /** How `direction` and the values are compared with the text. */
  private readonly matchWord: WordMatcher

  /**
   * No direction line starts at a source offset before this one and at or
   * after the place where the rule last found none. The rule looks at the
   * rest of a line, and what it does not find from one place it does not
   * find from a later place of the same line.
   */
  private noDirectionLineBefore = 0

  public constructor(
    reader: DiagramText,
    values: readonly string[],
    matchWord: WordMatcher,
  ) {
    this.reader = reader
    this.values = values
    this.matchWord = matchWord
  }

  /** The direction line that starts at `at`; null when none does. */
  public match(at: DiagramCharacter): DirectionLineMatch | null {
    if (at.start < this.noDirectionLineBefore) return null
    const lastByValue = new Map<string, Occurrence>()
    let runEnd: DiagramPosition = at
    while (
      runEnd !== null &&
      runEnd.codePoint !== LINE_FEED &&
      runEnd.codePoint !== LINE_SEPARATOR &&
      runEnd.codePoint !== PARAGRAPH_SEPARATOR
    ) {
      const keyword = this.matchWord(this.reader, runEnd, "direction")
      if (keyword !== null && isWhitespaceAt(keyword.end)) {
        const value = skipWhitespace(this.reader, keyword.end)
        for (const candidate of this.values) {
          const valueMatch = this.matchWord(this.reader, value, candidate)
          if (value !== null && valueMatch !== null) {
            lastByValue.set(candidate, {
              keyword: runEnd,
              keywordEnd: keyword.end,
              value,
              valueEnd: valueMatch.end,
            })
          }
        }
      }
      runEnd = this.reader.after(runEnd)
    }
    const found = this.values
      .map((value) => lastByValue.get(value))
      .find((occurrence) => occurrence !== undefined)
    if (found === undefined) {
      this.noDirectionLineBefore = runEnd === null ? Infinity : runEnd.start
      return null
    }
    const lineEnd = skipWhile(
      this.reader,
      found.valueEnd,
      (character) => character.codePoint !== LINE_FEED,
    )
    const units: DirectionLineUnit[] = []
    if (!this.isBlank(at, found.keyword)) {
      units.push({ name: "direction-text", from: at, to: found.keyword })
    }
    units.push({
      name: "direction",
      from: found.keyword,
      to: found.keywordEnd,
    })
    units.push({
      name: "direction-value",
      from: found.value,
      to: found.valueEnd,
    })
    if (found.valueEnd !== null && !this.isBlank(found.valueEnd, lineEnd)) {
      units.push({ name: "direction-text", from: found.valueEnd, to: lineEnd })
    }
    return { units, end: lineEnd }
  }

  /** Whether the characters from `from` up to `to` are none or all whitespace. */
  private isBlank(from: DiagramCharacter, to: DiagramPosition): boolean {
    const firstSignificant = skipWhile(
      this.reader,
      from,
      (character) =>
        !samePosition(character, to) && isWhitespace(character.codePoint),
    )
    return samePosition(firstSignificant, to)
  }
}
