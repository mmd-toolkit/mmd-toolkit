import { isAsciiDigit } from "../../character-classes.ts"
import {
  COLON,
  DIGIT_ZERO,
  FULL_STOP,
  HYPHEN_MINUS,
} from "../../code-points.ts"
import { CommonFormUnitLexer } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter, DiagramPosition } from "../../diagram-text.ts"
import type { DiagramUnit } from "../../diagram-units.ts"
import { isCodePointAt, samePosition, skipWhile } from "../../scanning.ts"

/** diagrams/pie.md, Ordered rules: composite forms split at component boundaries. */
type PieUnitName = "showData" | "pie" | "pie-number" | "string"

/** Diagram-specific units and the shared common-form components. */
export type UnitName = PieUnitName | CommonFormUnitName

/** One lexical component; the converted text is never an AST value. */
export type Unit = DiagramUnit<UnitName>

/** The numeric vocabulary is restricted to ASCII digits. */
function isDigit(character: DiagramCharacter): boolean {
  return isAsciiDigit(character.codePoint)
}

/** diagrams/pie.md, Lexical structure: take the first complete match, never the longest alternative. */
export class PieUnitLexer extends CommonFormUnitLexer<PieUnitName> {
  /** Ordered rules 1-13, tried again after every successful match. */
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readKeyword(at, "showData") ||
      this.readKeyword(at, "pie") ||
      this.readPunctuation(at, COLON, ":") ||
      this.readNumber(at) ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readString(at, "string") ||
      this.readNewline(at) ||
      this.readWhitespace(at) ||
      this.readYaml(at) ||
      this.readDirective(at) ||
      this.readComment(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Rule 4, Numbers: optional minus, fraction before integer, and no final dot boundary. */
  private readNumber(at: DiagramCharacter): boolean {
    const first = at.codePoint === HYPHEN_MINUS ? this.reader.after(at) : at
    if (first === null || !isDigit(first)) return false
    const digitsEnd = skipWhile(this.reader, first, isDigit)
    if (isCodePointAt(digitsEnd, FULL_STOP)) {
      const fraction = this.reader.after(digitsEnd)
      if (fraction !== null && isDigit(fraction)) {
        let end: DiagramPosition = fraction
        let previous: DiagramCharacter | null = null
        let count = 0
        while (end !== null && isDigit(end)) {
          previous = end
          count += 1
          end = this.reader.after(end)
        }
        if (!isCodePointAt(end, FULL_STOP)) {
          this.read("pie-number", at, end)
          return true
        }
        if (count > 1) {
          this.read("pie-number", at, previous)
          return true
        }
      }
    }
    let end =
      first.codePoint === DIGIT_ZERO ? this.reader.after(first) : digitsEnd
    if (isCodePointAt(end, FULL_STOP)) {
      let previous: DiagramPosition = first
      let cursor = this.reader.after(first)
      while (!samePosition(cursor, end) && cursor !== null) {
        previous = cursor
        cursor = this.reader.after(cursor)
      }
      if (samePosition(previous, first)) return false
      end = previous
    }
    this.read("pie-number", at, end)
    return true
  }
}
