import { isAsciiDigit, isWhitespace } from "../../character-classes.ts"
import {
  APOSTROPHE,
  CHARACTER_TABULATION,
  COLON,
  DIGIT_ZERO,
  FULL_STOP,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LINE_FEED,
  LINE_SEPARATOR,
  PARAGRAPH_SEPARATOR,
  QUOTATION_MARK,
  REVERSE_SOLIDUS,
  RIGHT_CURLY_BRACKET,
  SPACE,
} from "../../code-points.ts"
import type { DiagramComment } from "../../diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import { lineFeedAfter } from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import { readUnit } from "../../diagram-units.ts"
import type { LineIndex } from "../../positions.ts"
import {
  isCodePointAt,
  matchWord,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"
import { UnitLexer } from "../../unit-lexer.ts"

/** diagrams/pie.md, Ordered rules: composite matches emit their authored components. */
export type UnitName =
  | "showData"
  | "pie"
  | ":"
  | "pie-number"
  | "accDescr"
  | "accTitle"
  | "title"
  | "{"
  | "}"
  | "line-text"
  | "block-text"
  | "string"
  | "newline"
  | "yaml-block"
  | "directive"

/** The source-positioned units; hidden forms keep their own lexical identity. */
export type Unit = DiagramUnit<UnitName>

/** All lexical units and native comments, in source order. */
export interface PieLexing {
  readonly units: readonly Unit[]
  readonly comments: readonly DiagramComment[]
}

/** Hidden ASCII whitespace, also the indentation of composite common forms. */
function isHws(character: DiagramCharacter): boolean {
  return (
    character.codePoint === SPACE ||
    character.codePoint === CHARACTER_TABULATION
  )
}

/** Numbers use ASCII digits only. */
function isDigit(character: DiagramCharacter): boolean {
  return isAsciiDigit(character.codePoint)
}

/** diagrams/pie.md, Ordered rules: first match, with no longest-match or recovery pass. */
export class PieUnitLexer extends UnitLexer<"default", UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "default", { default: null })
  }

  /** Lex the whole input before recursive descent. */
  public lex(): PieLexing {
    this.readToEnd()
    return { units: this.units, comments: this.comments }
  }

  /** Keep padding only where a value rule explicitly reads it. */
  protected override addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
  ): Unit {
    const unit = readUnit(
      this.reader,
      name,
      this.units.length,
      from,
      to,
      null,
      ends,
    )
    this.units.push(unit)
    return unit
  }

  /** Ordered rules 1-13, restarted after each complete match. */
  protected override readInContext(at: DiagramCharacter): void {
    if (this.readKeyword(at, "showData") || this.readKeyword(at, "pie")) return
    if (at.codePoint === COLON) {
      this.read(":", at, this.reader.after(at))
      return
    }
    if (
      this.readNumber(at) ||
      this.readAccDescr(at) ||
      this.readColonLine(at, "accTitle") ||
      this.readTitle(at) ||
      this.readString(at)
    )
      return
    if (at.codePoint === LINE_FEED) {
      this.read("newline", at, this.reader.after(at))
      return
    }
    if (isHws(at)) {
      this.position = skipWhile(this.reader, at, isHws)
      return
    }
    if (
      this.readYaml(at) ||
      this.readHiddenDirective(at) ||
      this.readComment(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Rules 1-2: exact word followed by common whitespace, EOF, or a percent pair. */
  private readKeyword(at: DiagramCharacter, word: "showData" | "pie"): boolean {
    const match = matchWord(this.reader, at, word)
    if (match === null || !this.boundaryAt(match.end, true)) return false
    this.read(word, at, match.end)
    return true
  }

  /** The boundary shared by keywords and hidden closers; only keywords admit a percent pair. */
  private boundaryAt(at: DiagramPosition, percentPair = false): boolean {
    return (
      at === null ||
      isWhitespace(at.codePoint) ||
      (percentPair && matchWord(this.reader, at, "%%") !== null)
    )
  }

  /** Rule 4: optional minus, fraction before integer, and no match ending before a dot. */
  private readNumber(at: DiagramCharacter): boolean {
    const first = at.codePoint === HYPHEN_MINUS ? this.reader.after(at) : at
    if (first === null || !isDigit(first)) return false
    const digitsEnd = skipWhile(this.reader, first, isDigit)
    if (isCodePointAt(digitsEnd, FULL_STOP)) {
      const fraction = this.reader.after(digitsEnd)
      if (fraction !== null && isDigit(fraction)) {
        const end = skipWhile(this.reader, fraction, isDigit)
        if (!isCodePointAt(end, FULL_STOP)) {
          this.read("pie-number", at, end)
          return true
        }
      }
    }
    const end =
      first.codePoint === DIGIT_ZERO ? this.reader.after(first) : digitsEnd
    if (isCodePointAt(end, FULL_STOP)) return false
    this.read("pie-number", at, end)
    return true
  }

  /** Rule 5: colon line first; otherwise a common-whitespace gap and a first-close block. */
  private readAccDescr(at: DiagramCharacter): boolean {
    if (this.readColonLine(at, "accDescr")) return true
    const keyword = skipWhile(this.reader, at, isHws)
    const word = matchWord(this.reader, keyword, "accDescr")
    if (word === null || keyword === null) return false
    const open = skipWhitespace(this.reader, word.end)
    if (!isCodePointAt(open, LEFT_CURLY_BRACKET)) return false
    const start = this.reader.after(open)
    const close = skipWhile(
      this.reader,
      start,
      (c) => c.codePoint !== RIGHT_CURLY_BRACKET,
    )
    if (close === null) return false
    this.addUnit("accDescr", keyword, word.end)
    this.addUnit("{", open, start)
    if (start !== null && !samePosition(start, close))
      this.addUnit("block-text", start, close)
    this.read("}", close, this.reader.after(close))
    return true
  }

  /** Rules 5-6: optional ASCII indentation, exact keyword, ASCII colon gap, and same-line text. */
  private readColonLine(
    at: DiagramCharacter,
    name: "accDescr" | "accTitle",
  ): boolean {
    const keyword = skipWhile(this.reader, at, isHws)
    const word = matchWord(this.reader, keyword, name)
    if (word === null || keyword === null) return false
    const colon = skipWhile(this.reader, word.end, isHws)
    if (!isCodePointAt(colon, COLON)) return false
    const start = this.reader.after(colon)
    this.addUnit(name, keyword, word.end)
    this.addUnit(":", colon, start)
    this.readLineText(start)
    return true
  }

  /** Rule 7: title prefix, optionally followed by exactly one ASCII separator and the line value. */
  private readTitle(at: DiagramCharacter): boolean {
    const keyword = skipWhile(this.reader, at, isHws)
    const word = matchWord(this.reader, keyword, "title")
    if (word === null || keyword === null) return false
    this.addUnit("title", keyword, word.end)
    if (word.end !== null && isHws(word.end))
      this.readLineText(this.reader.after(word.end))
    else this.position = word.end
    return true
  }

  /** Composite line values stop before the first percent pair or physical LF, preserving all padding. */
  private readLineText(start: DiagramPosition): void {
    const end = skipWhile(
      this.reader,
      start,
      (c) =>
        c.codePoint !== LINE_FEED && matchWord(this.reader, c, "%%") === null,
    )
    if (start !== null && !samePosition(start, end))
      this.addUnit("line-text", start, end, "keep-whitespace")
    this.position = end
  }

  /** Rule 8: matching quotes, arbitrary unescaped content, and one non-line-break character after backslash. */
  private readString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK && at.codePoint !== APOSTROPHE)
      return false
    let end = this.reader.after(at)
    while (end !== null) {
      if (end.codePoint === at.codePoint) {
        this.read("string", at, this.reader.after(end))
        return true
      }
      if (end.codePoint === REVERSE_SOLIDUS) {
        end = this.reader.after(end)
        if (
          end === null ||
          end.codePoint === LINE_FEED ||
          end.codePoint === LINE_SEPARATOR ||
          end.codePoint === PARAGRAPH_SEPARATOR
        )
          return false
      }
      end = this.reader.after(end)
    }
    return false
  }

  /** Rule 11: opener with ASCII padding and LF, then the earliest qualifying unindented line-start fence. */
  private readYaml(at: DiagramCharacter): boolean {
    const opening = matchWord(this.reader, at, "---")
    if (opening === null) return false
    const lf = skipWhile(this.reader, opening.end, isHws)
    if (!isCodePointAt(lf, LINE_FEED)) return false
    let end = this.reader.after(lf)
    let lineStart = true
    while (end !== null) {
      const close = lineStart ? matchWord(this.reader, end, "---") : null
      if (close !== null && this.boundaryAt(close.end)) {
        this.readHidden("yaml-block", at, close.end)
        return true
      }
      lineStart = end.codePoint === LINE_FEED
      end = this.reader.after(end)
    }
    return false
  }

  /** Rule 12: earliest qualifying }%% after %%{; failed whole matches fall through to comments. */
  private readHiddenDirective(at: DiagramCharacter): boolean {
    const opening = matchWord(this.reader, at, "%%{")
    if (opening === null) return false
    let end = opening.end
    while (end !== null) {
      const close = matchWord(this.reader, end, "}%%")
      if (close !== null && this.boundaryAt(close.end)) {
        this.readHidden("directive", at, close.end)
        return true
      }
      end = this.reader.after(end)
    }
    return false
  }

  /** Hidden forms retain their fences and consume one following LF outside their written ranges. */
  private readHidden(
    name: "yaml-block" | "directive",
    at: DiagramCharacter,
    end: DiagramPosition,
  ): void {
    this.addUnit(name, at, end)
    this.position = isCodePointAt(end, LINE_FEED) ? this.reader.after(end) : end
  }

  /** Rule 13: a percent pair through the physical line end, leaving its LF visible. */
  private readComment(at: DiagramCharacter): boolean {
    const mark = matchWord(this.reader, at, "%%")
    if (mark === null) return false
    const end = lineFeedAfter(this.reader, at)
    this.comments.push({
      range: [at.start, end.start],
      mark: "%%",
      valueStart: this.reader.after(at)!.end,
    })
    this.position = end
    return true
  }
}
