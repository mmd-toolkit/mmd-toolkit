import { isAsciiDigit } from "../../character-classes.ts"
import {
  COLON,
  COMMA,
  FULL_STOP,
  LEFT_CURLY_BRACKET,
  LEFT_SQUARE_BRACKET,
  RIGHT_CURLY_BRACKET,
  RIGHT_SQUARE_BRACKET,
} from "../../code-points.ts"
import { CommonFormUnitLexer } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter } from "../../diagram-text.ts"
import type { DiagramUnit } from "../../diagram-units.ts"
import { isCodePointAt, matchWord, skipWhile } from "../../scanning.ts"

/** diagrams/radar.md, Ordered rules: authored components, in first-match order. */
type RadarUnitName =
  | "radar-beta"
  | "showLegend"
  | "graticule"
  | "curve"
  | "ticks"
  | "axis"
  | "max"
  | "min"
  | ","
  | "["
  | "]"
  | "graticule-value"
  | "boolean-value"
  | "number"
  | "string"

/** Diagram units and shared composite common-form components. */
export type UnitName = RadarUnitName | CommonFormUnitName

/** Converted spelling is retained for double conversion only. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/radar.md, Lexical structure: one context, without recovery. */
export class RadarUnitLexer extends CommonFormUnitLexer<RadarUnitName> {
  /** Rules 1-28, restarted after the first applicable complete match. */
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readJoinedHeader(at) ||
      this.readKeyword(at, "radar-beta") ||
      this.readWord(at, "showLegend") ||
      this.readWord(at, "graticule") ||
      this.readWord(at, "curve") ||
      this.readWord(at, "ticks") ||
      this.readWord(at, "axis") ||
      this.readWord(at, "max") ||
      this.readWord(at, "min") ||
      this.readPunctuation(at, COLON, ":") ||
      this.readPunctuation(at, COMMA, ",") ||
      this.readPunctuation(at, LEFT_SQUARE_BRACKET, "[") ||
      this.readPunctuation(at, RIGHT_SQUARE_BRACKET, "]") ||
      this.readPunctuation(at, LEFT_CURLY_BRACKET, "{") ||
      this.readPunctuation(at, RIGHT_CURLY_BRACKET, "}") ||
      this.readValue(at, "circle", "graticule-value") ||
      this.readValue(at, "polygon", "graticule-value") ||
      this.readValue(at, "true", "boolean-value") ||
      this.readValue(at, "false", "boolean-value") ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readNumber(at) ||
      this.readString(at, "string") ||
      this.readId(at) ||
      this.readNewline(at) ||
      this.readWhitespace(at) ||
      this.readYaml(at) ||
      this.readDirective(at) ||
      this.readComment(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Joined header: split only the word and colon, with no suffix boundary. */
  private readJoinedHeader(at: DiagramCharacter): boolean {
    const match = matchWord(this.reader, at, "radar-beta:")
    if (match === null) return false
    const colon = matchWord(this.reader, at, "radar-beta")!.end!
    this.addUnit("radar-beta", at, colon)
    this.read(":", colon, match.end)
    return true
  }

  /** Fixed enum/boolean words have no suffix boundary or longer-id alternative. */
  private readValue(
    at: DiagramCharacter,
    word: string,
    name: "graticule-value" | "boolean-value",
  ): boolean {
    const match = matchWord(this.reader, at, word)
    if (match === null) return false
    this.read(name, at, match.end)
    return true
  }

  /** Numbers: unsigned fraction first, then the shared zero/nonzero integer rule. */
  private readNumber(at: DiagramCharacter): boolean {
    if (!isAsciiDigit(at.codePoint)) return false
    const dot = skipWhile(this.reader, at, (c) => isAsciiDigit(c.codePoint))
    if (isCodePointAt(dot, FULL_STOP)) {
      let end = this.reader.after(dot)
      let previous: DiagramCharacter | null = null
      let count = 0
      while (end !== null && isAsciiDigit(end.codePoint)) {
        previous = end
        count += 1
        end = this.reader.after(end)
      }
      if (count > 0 && (!isCodePointAt(end, FULL_STOP) || count > 1)) {
        this.read("number", at, isCodePointAt(end, FULL_STOP) ? previous : end)
        return true
      }
    }
    return this.readInteger(at, "number")
  }
}
