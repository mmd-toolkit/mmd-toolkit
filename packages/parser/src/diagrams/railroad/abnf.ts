import type { NumericLiteral } from "../../ast.ts"
import {
  QUOTATION_MARK,
  PERCENT_SIGN,
  HYPHEN_MINUS,
  FULL_STOP,
  ASTERISK,
} from "../../code-points.ts"
import { isAsciiDigit } from "../../character-classes.ts"
import type { DiagramCharacter } from "../../diagram-text.ts"
import type {
  RailroadExpression,
  RailroadRepeatRange,
} from "../../ast/railroad.ts"
import { skipWhile } from "../../scanning.ts"
import { RailroadUnitLexer } from "./units.ts"
import { RailroadGrammar } from "./grammar.ts"

/** ABNF units: semicolon comments can replace a terminator only with a longer match. */
export class AbnfUnitLexer extends RailroadUnitLexer {
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readHeader(at, "railroad-abnf-beta", false) ||
      this.readSymbol(at, "=") ||
      this.readLineComment(at, ";", true) ||
      this.readSymbol(at, ";") ||
      this.readSymbol(at, "/") ||
      this.readSymbol(at, "(") ||
      this.readSymbol(at, ")") ||
      this.readSymbol(at, "[") ||
      this.readSymbol(at, "]") ||
      this.readMetadata(at) ||
      this.readName(at, false) ||
      this.readAbnfString(at) ||
      this.readNumericValue(at) ||
      this.readRepeat(at) ||
      this.readPadding(at) ||
      this.readHidden(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** ABNF string: the next double quote closes it; backslashes are ordinary content. */
  private readAbnfString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const close = skipWhile(
      this.reader,
      this.reader.after(at),
      (c) => c.codePoint !== QUOTATION_MARK,
    )
    if (close === null) return false
    this.read("string", at, this.reader.after(close))
    return true
  }

  /** ABNF numeric value: base letter then hexadecimal runs separated by dots/dashes. */
  private readNumericValue(at: DiagramCharacter): boolean {
    if (at.codePoint !== PERCENT_SIGN) return false
    const base = this.reader.after(at)
    if (
      base === null ||
      ![0x78, 0x58, 0x64, 0x44, 0x62, 0x42].includes(base.codePoint)
    )
      return false
    const digits = this.reader.after(base)
    if (digits === null || !isHex(digits.codePoint)) return false
    let end = skipWhile(this.reader, digits, (c) => isHex(c.codePoint))
    while (
      end !== null &&
      (end.codePoint === HYPHEN_MINUS || end.codePoint === FULL_STOP)
    ) {
      const next = this.reader.after(end)
      if (next === null || !isHex(next.codePoint)) break
      end = skipWhile(this.reader, next, (c) => isHex(c.codePoint))
    }
    this.read("numeric-value", at, end)
    return true
  }

  /** ABNF repeat: native adjacent counts/star, split into indivisible authored components. */
  private readRepeat(at: DiagramCharacter): boolean {
    const star = skipWhile(this.reader, at, (c) => isAsciiDigit(c.codePoint))
    if (star?.codePoint === ASTERISK) {
      if (star !== at) this.addUnit("repeat-minimum", at, star)
      const after = this.reader.after(star)
      this.addUnit("repeat-star", star, after)
      const end = skipWhile(this.reader, after, (c) =>
        isAsciiDigit(c.codePoint),
      )
      if (after !== null && after !== end)
        this.addUnit("repeat-maximum", after, end)
      this.position = end
      return true
    }
    if (!isAsciiDigit(at.codePoint)) return false
    this.read("exact-repeat", at, star)
    return true
  }
}

/** Numeric-value syntax deliberately validates hexadecimal spelling independently of its base letter. */
function isHex(codePoint: number): boolean {
  return (
    isAsciiDigit(codePoint) ||
    (codePoint >= 0x41 && codePoint <= 0x46) ||
    (codePoint >= 0x61 && codePoint <= 0x66)
  )
}

/** ABNF grammar: one optional repeat on a primary, inside concatenation and choice. */
export class AbnfGrammar extends RailroadGrammar {
  protected readonly dialect = "abnf"

  protected override parseExpression(): RailroadExpression {
    return this.parseChoice("/")
  }

  protected override parseTerm(): RailroadExpression {
    const start = this.next
    const exact = this.takeIf("exact-repeat")
    const minimumUnit = exact === null ? this.takeIf("repeat-minimum") : null
    const star = exact === null ? this.takeIf("repeat-star") : null
    let repeat: NumericLiteral | RailroadRepeatRange
    if (exact !== null) repeat = this.numericLiteralOf(exact)
    else if (star !== null) {
      const minimum =
        minimumUnit === null ? null : this.numericLiteralOf(minimumUnit)
      this.addItem("Punctuator", [star])
      const maximumUnit = this.takeIf("repeat-maximum")
      const maximum =
        maximumUnit === null ? null : this.numericLiteralOf(maximumUnit)
      repeat = {
        type: "RailroadRepeatRange",
        minimum,
        maximum,
        ...this.placeFrom(start),
      }
    } else return this.parsePrimary()
    const textBeforeElement = this.parseHidden()
    const element = this.parsePrimary()
    return {
      type: "RailroadRepeatExpression",
      repeat,
      textBeforeElement,
      element,
      ...this.placeFrom(start),
    }
  }

  protected override parsePrimary(): RailroadExpression {
    const unit = this.takeIf("numeric-value")
    if (unit === null) return this.parseNaturalPrimary()
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "RailroadNumericValue",
      value: this.textOf(place.range),
      ...place,
    }
  }
}
