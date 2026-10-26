import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
  isWordCharacter,
} from "../../character-classes.ts"
import {
  AMPERSAND,
  APOSTROPHE,
  COMMERCIAL_AT,
  COMMA,
  FULL_STOP,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  LINE_FEED,
  PLUS_SIGN,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
  RIGHT_SQUARE_BRACKET,
  SEMICOLON,
  SOLIDUS,
} from "../../code-points.ts"
import { CommonFormUnitLexer, isHws } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter, DiagramPosition } from "../../diagram-text.ts"
import type { DiagramUnit } from "../../diagram-units.ts"
import {
  isCodePointAt,
  matchWord,
  samePosition,
  skipWhile,
} from "../../scanning.ts"

/** diagrams/wardley.md, Ordered units: authored components in first-match order. */
type WardleyUnitName =
  | "["
  | ","
  | "]"
  | "@"
  | "/"
  | "("
  | ")"
  | "-"
  | "decimal"
  | "dependency-arrow"
  | "port"
  | "link-arrow"
  | "flow-open"
  | "flow-label"
  | "flow-marker"
  | "link-label-mark"
  | "link-label"
  | "strategy"
  | "wardley-beta"
  | "size"
  | "evolution"
  | "anchor"
  | "component"
  | "label"
  | "inertia"
  | "evolve"
  | "pipeline"
  | "note"
  | "annotations"
  | "annotation"
  | "accelerator"
  | "deaccelerator"
  | "spaced-name"
  | "integer"
  | "string"

/** Ordered Wardley units and the imported common components. */
export type UnitName = WardleyUnitName | CommonFormUnitName

/** Converted lexical spelling is carried to semantic name comparisons. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/wardley.md, Lexical structure: one context, first complete match wins. */
export class WardleyUnitLexer extends CommonFormUnitLexer<WardleyUnitName> {
  /** Priorities 1-8, including the minus punctuation's explicit longer alternatives. */
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readPunctuation(at, LEFT_SQUARE_BRACKET, "[") ||
      this.readPunctuation(at, COMMA, ",") ||
      this.readPunctuation(at, RIGHT_SQUARE_BRACKET, "]") ||
      this.readPunctuation(at, COMMERCIAL_AT, "@") ||
      this.readPunctuation(at, SOLIDUS, "/") ||
      this.readPunctuation(at, LEFT_PARENTHESIS, "(") ||
      this.readPunctuation(at, RIGHT_PARENTHESIS, ")") ||
      this.readMinus(at) ||
      this.readPunctuation(at, LEFT_CURLY_BRACKET, "{") ||
      this.readPunctuation(at, RIGHT_CURLY_BRACKET, "}") ||
      this.readDecimal(at) ||
      this.readPort(at) ||
      this.readLinkArrow(at) ||
      this.readLinkLabel(at) ||
      this.readStrategy(at) ||
      this.readKeyword(at, "wardley-beta", "unchecked") ||
      this.readKeyword(at, "size", "unchecked") ||
      this.readKeyword(at, "evolution", "unchecked") ||
      this.readKeyword(at, "anchor", "unchecked") ||
      this.readKeyword(at, "component", "unchecked") ||
      this.readKeyword(at, "label", "unchecked") ||
      this.readKeyword(at, "inertia", "unchecked") ||
      this.readKeyword(at, "evolve", "unchecked") ||
      this.readKeyword(at, "pipeline", "unchecked") ||
      this.readKeyword(at, "note", "unchecked") ||
      this.readKeyword(at, "annotations", "unchecked") ||
      this.readKeyword(at, "annotation", "unchecked") ||
      this.readKeyword(at, "accelerator", "unchecked") ||
      this.readKeyword(at, "deaccelerator", "unchecked") ||
      this.readSpacedName(at) ||
      this.readWhitespace(at) ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readInteger(at, "integer") ||
      this.readString(at, "string") ||
      this.readId(at) ||
      this.readNewline(at) ||
      this.readDirective(at) ||
      this.readComment(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Minus has dependency-arrow, link-arrow and hidden-yaml as its only longer alternatives. */
  private readMinus(at: DiagramCharacter): boolean {
    if (at.codePoint !== HYPHEN_MINUS) return false
    return (
      this.readGlyph(at, "->", "dependency-arrow") ||
      this.readLinkArrow(at) ||
      this.readYaml(at) ||
      this.readPunctuation(at, HYPHEN_MINUS, "-")
    )
  }

  /** Numbers: nonempty ASCII digit runs on both sides of exactly one dot. */
  private readDecimal(at: DiagramCharacter): boolean {
    if (!isAsciiDigit(at.codePoint)) return false
    const dot = skipWhile(this.reader, at, (c) => isAsciiDigit(c.codePoint))
    if (!isCodePointAt(dot, FULL_STOP)) return false
    const fraction = this.reader.after(dot)
    if (fraction === null || !isAsciiDigit(fraction.codePoint)) return false
    this.read(
      "decimal",
      at,
      skipWhile(this.reader, fraction, (c) => isAsciiDigit(c.codePoint)),
    )
    return true
  }

  /** Whole arrow, port and strategy atoms retain their independent token boundaries. */
  private readGlyph(
    at: DiagramCharacter,
    word: string,
    name: WardleyUnitName,
  ): boolean {
    const match = matchWord(this.reader, at, word)
    if (match === null) return false
    this.read(name, at, match.end)
    return true
  }

  /** Ports: bidirectional before forward before backward. */
  private readPort(at: DiagramCharacter): boolean {
    return (
      this.readGlyph(at, "+<>", "port") ||
      this.readGlyph(at, "+>", "port") ||
      this.readGlyph(at, "+<", "port")
    )
  }

  /** Link arrows: three glyphs, or plus, a whole raw single-quoted label, and its marker. */
  private readLinkArrow(at: DiagramCharacter): boolean {
    if (
      this.readGlyph(at, "-->", "link-arrow") ||
      this.readGlyph(at, "-.->", "link-arrow") ||
      this.readPunctuation(at, GREATER_THAN_SIGN, "link-arrow")
    )
      return true
    if (at.codePoint !== PLUS_SIGN) return false
    const quote = this.reader.after(at)
    if (!isCodePointAt(quote, APOSTROPHE)) return false
    const close = skipWhile(
      this.reader,
      this.reader.after(quote),
      (c) => c.codePoint !== APOSTROPHE,
    )
    if (close === null) return false
    const marker = this.reader.after(close)
    if (marker === null) return false
    const end =
      matchWord(this.reader, marker, "<>") ??
      matchWord(this.reader, marker, "<") ??
      matchWord(this.reader, marker, ">")
    if (end === null) return false
    this.addUnit("flow-open", at, quote)
    this.addUnit("flow-label", quote, marker)
    this.read("flow-marker", marker, end.end)
    return true
  }

  /** Link label: a semicolon and nonempty physical-line content, retaining all its padding. */
  private readLinkLabel(at: DiagramCharacter): boolean {
    if (at.codePoint !== SEMICOLON) return false
    const value = this.reader.after(at)
    if (value === null || value.codePoint === LINE_FEED) return false
    const end = skipWhile(this.reader, value, (c) => c.codePoint !== LINE_FEED)
    this.addUnit("link-label-mark", at, value)
    this.read("link-label", value, end, "keep-whitespace")
    return true
  }

  /** Fixed strategy alternatives have no suffix boundary or longer-name alternative. */
  private readStrategy(at: DiagramCharacter): boolean {
    return (
      this.readGlyph(at, "build", "strategy") ||
      this.readGlyph(at, "buy", "strategy") ||
      this.readGlyph(at, "outsource", "strategy") ||
      this.readGlyph(at, "market", "strategy")
    )
  }

  /** Spaced names: authored ASCII parts, with greedy internal HWS and no trailing padding. */
  private readSpacedName(at: DiagramCharacter): boolean {
    if (!isAsciiLetter(at.codePoint)) return false
    const title = matchWord(this.reader, at, "title")
    if (
      (title?.end != null && isWhitespace(title.end.codePoint)) ||
      matchWord(this.reader, at, "accTitle") !== null ||
      matchWord(this.reader, at, "accDescr") !== null
    )
      return false
    let end = this.namePartEnd(this.reader.after(at))
    for (;;) {
      const next = skipWhile(this.reader, end, isHws)
      if (
        samePosition(next, end) ||
        next === null ||
        (!isAsciiLetter(next.codePoint) && next.codePoint !== LEFT_PARENTHESIS)
      )
        break
      end = this.namePartEnd(this.reader.after(next))
    }
    this.read("spaced-name", at, end)
    return true
  }

  /** A part continues with word characters, parentheses, ampersand, or a dash not before greater-than. */
  private namePartEnd(at: DiagramPosition): DiagramPosition {
    return skipWhile(
      this.reader,
      at,
      (c) =>
        isWordCharacter(c.codePoint) ||
        c.codePoint === LEFT_PARENTHESIS ||
        c.codePoint === RIGHT_PARENTHESIS ||
        c.codePoint === AMPERSAND ||
        (c.codePoint === HYPHEN_MINUS &&
          !isCodePointAt(this.reader.after(c), GREATER_THAN_SIGN)),
    )
  }
}
