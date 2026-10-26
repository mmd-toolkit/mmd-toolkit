import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
  isWordCharacter,
} from "../../character-classes.ts"
import {
  APOSTROPHE,
  COLON,
  COMMA,
  FULL_STOP,
  LINE_FEED,
  LOW_LINE,
  QUOTATION_MARK,
  SEMICOLON,
} from "../../code-points.ts"
import { CommonFormUnitLexer, isHws } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter, DiagramText } from "../../diagram-text.ts"
import type { DiagramUnit } from "../../diagram-units.ts"
import type { LineIndex } from "../../positions.ts"
import {
  isCodePointAt,
  matchWord,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"

/** diagrams/treemap.md, Ordered rules: authored components of native units. */
type TreemapUnitName =
  | "treemap-beta"
  | "treemap"
  | "classDef"
  | "class-name"
  | "style-text"
  | ";"
  | ":::"
  | ","
  | "indentation"
  | "number"
  | "string"

/** Composite common forms use the shared character rules, without common EOL. */
export type UnitName = TreemapUnitName | CommonFormUnitName

/** The indentation unit's converted text counts spaces/tabs after common removals. */
export type Unit = DiagramUnit<UnitName>

/** Names, numbers and strings: identifier starts exclude digits. */
function isIdentifierStart(character: DiagramCharacter): boolean {
  return isAsciiLetter(character.codePoint) || character.codePoint === LOW_LINE
}

/** Names, numbers and strings: the character set of one complete numeric unit. */
function isNumberCharacter(character: DiagramCharacter): boolean {
  return (
    isAsciiDigit(character.codePoint) ||
    character.codePoint === LOW_LINE ||
    character.codePoint === FULL_STOP ||
    character.codePoint === COMMA
  )
}

/** diagrams/treemap.md, Ordered rules: first applicable rule, without recovery. */
export class TreemapUnitLexer extends CommonFormUnitLexer<TreemapUnitName> {
  private readonly passedTriviaEnd: number

  public constructor(
    reader: DiagramText,
    lines: LineIndex,
    passedTriviaEnd: number,
  ) {
    super(reader, lines)
    this.passedTriviaEnd = passedTriviaEnd
  }

  /** Rules 1-15: indentation precedes hidden WS, and comma/identifier precede number. */
  protected override readInContext(at: DiagramCharacter): void {
    // Detection-passed trivia is excluded before applying the native unit rules.
    if (at.start < this.passedTriviaEnd && isWhitespace(at.codePoint)) {
      this.position = skipWhitespace(this.reader, at)
      return
    }
    if (
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readKeyword(at, "treemap-beta", "unchecked") ||
      this.readKeyword(at, "treemap", "unchecked") ||
      this.readClassDefinition(at) ||
      this.readClassMarker(at) ||
      this.readPunctuation(at, COLON, ":") ||
      this.readPunctuation(at, COMMA, ",") ||
      this.readIndentation(at) ||
      this.readComment(at) ||
      this.skipNewline(at) ||
      this.readIdentifier(at) ||
      this.readNumber(at) ||
      this.readQuotedName(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Class definitions: a complete composite, split at authored atomic boundaries. */
  private readClassDefinition(at: DiagramCharacter): boolean {
    const word = matchWord(this.reader, at, "classDef")
    if (word?.end == null || !isWhitespace(word.end.codePoint)) return false
    const name = skipWhitespace(this.reader, word.end)
    if (name === null || !isIdentifierStart(name)) return false
    const second = this.reader.after(name)
    if (second === null || !isWordCharacter(second.codePoint)) return false
    const nameEnd = skipWhile(this.reader, second, (c) =>
      isWordCharacter(c.codePoint),
    )
    let end = nameEnd
    const style =
      end !== null && isWhitespace(end.codePoint)
        ? skipWhitespace(this.reader, end)
        : null
    if (style !== null) {
      end = skipWhile(
        this.reader,
        style,
        (c) => c.codePoint !== SEMICOLON && c.codePoint !== LINE_FEED,
      )
    } else if (end !== null && isWhitespace(end.codePoint)) {
      end = null
    }
    this.addUnit("classDef", at, word.end)
    this.addUnit("class-name", name, nameEnd)
    if (style !== null && !samePosition(style, end))
      this.addUnit("style-text", style, end, "keep-whitespace")
    if (isCodePointAt(end, SEMICOLON))
      this.read(";", end, this.reader.after(end))
    else this.position = end
    return true
  }

  /** Ordered rules, rule 6: the class marker is one indivisible punctuation atom. */
  private readClassMarker(at: DiagramCharacter): boolean {
    const match = matchWord(this.reader, at, ":::")
    if (match === null) return false
    this.read(":::", at, match.end)
    return true
  }

  /** Headers and indentation: maximal ASCII run; hidden WS can never win here. */
  private readIndentation(at: DiagramCharacter): boolean {
    if (!isHws(at)) return false
    this.read("indentation", at, skipWhile(this.reader, at, isHws))
    return true
  }

  /** Ordered rules, rule 12: physical newlines are hidden, never separators. */
  private skipNewline(at: DiagramCharacter): boolean {
    if (at.codePoint !== LINE_FEED) return false
    this.position = this.reader.after(at)
    return true
  }

  /** Names, numbers and strings: ASCII letter/underscore followed by word characters. */
  private readIdentifier(at: DiagramCharacter): boolean {
    if (!isIdentifierStart(at)) return false
    this.read(
      "id",
      at,
      skipWhile(this.reader, this.reader.after(at), (c) =>
        isWordCharacter(c.codePoint),
      ),
    )
    return true
  }

  /** Names, numbers and strings: a maximal digit/underscore/dot/comma run. */
  private readNumber(at: DiagramCharacter): boolean {
    if (!isNumberCharacter(at)) return false
    this.read("number", at, skipWhile(this.reader, at, isNumberCharacter))
    return true
  }

  /** Names, numbers and strings: the next matching quote closes, without escaping. */
  private readQuotedName(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK && at.codePoint !== APOSTROPHE)
      return false
    const close = skipWhile(
      this.reader,
      this.reader.after(at),
      (c) => c.codePoint !== at.codePoint,
    )
    if (close === null) return false
    this.read("string", at, this.reader.after(close))
    return true
  }
}
