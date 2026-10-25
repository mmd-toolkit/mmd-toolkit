import { isAsciiDigit, isWhitespace } from "./character-classes.ts"
import {
  APOSTROPHE,
  CHARACTER_TABULATION,
  COLON,
  DIGIT_ZERO,
  FULL_STOP,
  LEFT_CURLY_BRACKET,
  LINE_FEED,
  LINE_SEPARATOR,
  PARAGRAPH_SEPARATOR,
  QUOTATION_MARK,
  REVERSE_SOLIDUS,
  RIGHT_CURLY_BRACKET,
  SPACE,
} from "./code-points.ts"
import type { DiagramComment } from "./diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "./diagram-text.ts"
import { lineFeedAfter } from "./diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "./diagram-units.ts"
import { readUnit } from "./diagram-units.ts"
import type { LineIndex } from "./positions.ts"
import type { Match } from "./scanning.ts"
import {
  isCodePointAt,
  matchWord,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "./scanning.ts"
import { UnitLexer } from "./unit-lexer.ts"

/** Composite common values, hidden forms, and visible line breaks. */
export type CommonFormUnitName =
  | ":"
  | "accDescr"
  | "accTitle"
  | "title"
  | "{"
  | "}"
  | "line-text"
  | "block-text"
  | "newline"
  | "yaml-block"
  | "directive"

/** Units and native comments from the complete lexical scan. */
export interface CommonFormLexing<Name extends string> {
  readonly units: readonly DiagramUnit<Name>[]
  readonly comments: readonly DiagramComment[]
}

/** Hidden ASCII whitespace and optional composite indentation. */
export function isHws(character: DiagramCharacter): boolean {
  return (
    character.codePoint === SPACE ||
    character.codePoint === CHARACTER_TABULATION
  )
}

/**
 * Lexical structure, Composite common forms and Hidden forms: title and
 * accessibility lines, description blocks ending at the first closing brace, and fenced
 * YAML/DIRECTIVE forms. Also reads ASCII horizontal whitespace, visible
 * newline units and native percent-pair comments. Character and line-break
 * rules follow common.md, Notation and Line terminators.
 */
export abstract class CommonFormUnitLexer<
  Name extends string,
> extends UnitLexer<
  "default",
  Name | CommonFormUnitName,
  DiagramUnit<Name | CommonFormUnitName>
> {
  protected readonly comments: DiagramComment[] = []

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "default", { default: null })
  }

  /** Lexical structure: scan the complete text before grammar decisions, without recovery. */
  public lex(): CommonFormLexing<Name | CommonFormUnitName> {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units, comments: this.comments }
  }

  /** Keep authored component boundaries separate from optional surrounding whitespace. */
  protected override addUnit(
    name: Name | CommonFormUnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
  ): DiagramUnit<Name | CommonFormUnitName> {
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

  /**
   * common.md, Notation (whitespace); diagrams/pie.md and info.md, Keyword
   * boundaries; gitgraph.md, Keywords and components; packet.md, Header
   * boundaries and gaps: common whitespace, EOF or a percent pair must follow.
   */
  protected matchKeyword(at: DiagramCharacter, word: string): Match | null {
    const match = matchWord(this.reader, at, word)
    if (match === null) return null
    const end = match.end
    return end === null ||
      isWhitespace(end.codePoint) ||
      matchWord(this.reader, end, "%%") !== null
      ? match
      : null
  }

  /** Fixed words use the shared boundary unless their Lexical structure explicitly leaves it unchecked. */
  protected readKeyword(
    at: DiagramCharacter,
    word: Name,
    boundary: "required" | "unchecked" = "required",
  ): boolean {
    const match =
      boundary === "required"
        ? this.matchKeyword(at, word)
        : matchWord(this.reader, at, word)
    if (match === null) return false
    this.read(word, at, match.end)
    return true
  }

  /** diagrams/pie.md and packet.md, Ordered rules: each punctuation mark is one component. */
  protected readPunctuation(
    at: DiagramCharacter,
    codePoint: number,
    name: Name | CommonFormUnitName,
  ): boolean {
    if (at.codePoint !== codePoint) return false
    this.read(name, at, this.reader.after(at))
    return true
  }

  /**
   * diagrams/gitgraph.md, Numbers and references; packet.md, Numbers and
   * strings: zero alone, or maximal nonzero ASCII digits whose end is not
   * before a dot. Characters follow common.md, Notation.
   */
  protected readInteger(at: DiagramCharacter, name: Name): boolean {
    if (!isAsciiDigit(at.codePoint)) return false
    if (at.codePoint === DIGIT_ZERO) {
      this.read(name, at, this.reader.after(at))
      return true
    }
    let end = this.reader.after(at)
    let previous = at
    while (end !== null && isAsciiDigit(end.codePoint)) {
      previous = end
      end = this.reader.after(end)
    }
    if (isCodePointAt(end, FULL_STOP)) {
      if (samePosition(previous, at)) return false
      end = previous
    }
    this.read(name, at, end)
    return true
  }

  /**
   * diagrams/pie.md and gitgraph.md, Strings; packet.md, Numbers and strings:
   * matching quotes, with backslash protecting one character other than
   * LF/CR/LS/PS. common.md, Line terminators converts CR and CRLF to LF first.
   */
  protected readString(at: DiagramCharacter, name: Name): boolean {
    const match = this.matchString(at)
    if (match === null) return false
    this.read(name, at, match.end)
    return true
  }

  /** The complete quoted alternative, also used before a label's closing bracket. */
  protected matchString(at: DiagramCharacter): Match | null {
    if (at.codePoint !== QUOTATION_MARK && at.codePoint !== APOSTROPHE)
      return null
    let cursor = this.reader.after(at)
    while (cursor !== null) {
      if (cursor.codePoint === at.codePoint)
        return { end: this.reader.after(cursor) }
      if (cursor.codePoint === REVERSE_SOLIDUS) {
        cursor = this.reader.after(cursor)
        if (
          cursor === null ||
          cursor.codePoint === LINE_FEED ||
          cursor.codePoint === LINE_SEPARATOR ||
          cursor.codePoint === PARAGRAPH_SEPARATOR
        )
          return null
      }
      cursor = this.reader.after(cursor)
    }
    return null
  }

  /** Composite common forms: ASCII colon gap first, otherwise a common-whitespace brace gap. */
  protected readAccDescr(at: DiagramCharacter): boolean {
    const start = skipWhile(this.reader, at, isHws)
    if (start === null) return false
    const word = matchWord(this.reader, start, "accDescr")
    if (word === null) return false
    const colon = skipWhile(this.reader, word.end, isHws)
    if (isCodePointAt(colon, COLON)) {
      this.addUnit("accDescr", start, word.end)
      this.readLineValue(colon)
      return true
    }
    const brace = skipWhitespace(this.reader, word.end)
    if (!isCodePointAt(brace, LEFT_CURLY_BRACKET)) return false
    const value = this.reader.after(brace)
    const close = skipWhile(
      this.reader,
      value,
      (c) => c.codePoint !== RIGHT_CURLY_BRACKET,
    )
    if (close === null) return false
    this.addUnit("accDescr", start, word.end)
    this.addUnit("{", brace, value)
    if (value !== null && !samePosition(value, close))
      this.addUnit("block-text", value, close)
    this.read("}", close, this.reader.after(close))
    return true
  }

  /** Composite common forms: accTitle, ASCII horizontal gap, colon and possibly empty raw line value. */
  protected readAccTitle(at: DiagramCharacter): boolean {
    const start = skipWhile(this.reader, at, isHws)
    if (start === null) return false
    const word = matchWord(this.reader, start, "accTitle")
    if (word === null) return false
    const colon = skipWhile(this.reader, word.end, isHws)
    if (!isCodePointAt(colon, COLON)) return false
    this.addUnit("accTitle", start, word.end)
    this.readLineValue(colon)
    return true
  }

  /** Composite common forms: bare title, or title and exactly one ASCII separator before its line text. */
  protected readTitle(at: DiagramCharacter): boolean {
    const start = skipWhile(this.reader, at, isHws)
    if (start === null) return false
    const word = matchWord(this.reader, start, "title")
    if (word === null) return false
    this.addUnit("title", start, word.end)
    if (word.end !== null && isHws(word.end))
      this.readText(this.reader.after(word.end), "line-text")
    else this.position = word.end
    return true
  }

  /** Composite colon forms separate the atomic punctuation from the text. */
  protected readLineValue(colon: DiagramCharacter): void {
    const value = this.reader.after(colon)
    this.addUnit(":", colon, value)
    this.readText(value, "line-text")
  }

  /** Composite line text ends before LF or the first percent pair, preserving its padding. */
  protected readText(start: DiagramPosition, name: "line-text"): void {
    const end = skipWhile(
      this.reader,
      start,
      (c) =>
        c.codePoint !== LINE_FEED && matchWord(this.reader, c, "%%") === null,
    )
    if (start !== null && !samePosition(start, end))
      this.addUnit(name, start, end, "keep-whitespace")
    this.position = end
  }

  /** Newline: one physical line break, including the appended unwritten LF. */
  protected readNewline(at: DiagramCharacter): boolean {
    if (at.codePoint !== LINE_FEED) return false
    this.read("newline", at, this.reader.after(at))
    return true
  }

  /** Hidden whitespace: only ASCII spaces and tabs are hidden between units. */
  protected readWhitespace(at: DiagramCharacter): boolean {
    if (!isHws(at)) return false
    this.position = skipWhile(this.reader, at, isHws)
    return true
  }

  /** Hidden YAML: prefer a body-present closer after a subsequent LF, then the empty body. */
  protected readYaml(at: DiagramCharacter): boolean {
    const opening = matchWord(this.reader, at, "---")
    if (opening === null) return false
    const lf = skipWhile(this.reader, opening.end, isHws)
    if (!isCodePointAt(lf, LINE_FEED)) return false
    const body = this.reader.after(lf)
    let cursor = body
    while (cursor !== null) {
      if (cursor.codePoint === LINE_FEED) {
        const close = this.reader.after(cursor)
        if (
          close !== null &&
          this.readHiddenCloser(at, close, "---", "yaml-block")
        )
          return true
      }
      cursor = this.reader.after(cursor)
    }
    return body !== null && this.readHiddenCloser(at, body, "---", "yaml-block")
  }

  /** Hidden DIRECTIVE: earliest qualifying closer, including empty or punctuation bodies. */
  protected readDirective(at: DiagramCharacter): boolean {
    const opening = matchWord(this.reader, at, "%%{")
    if (opening === null) return false
    let cursor = opening.end
    while (cursor !== null) {
      if (this.readHiddenCloser(at, cursor, "}%%", "directive")) return true
      cursor = this.reader.after(cursor)
    }
    return false
  }

  /** Hidden-form closing boundaries look at whitespace but consume only an immediately following LF. */
  protected readHiddenCloser(
    at: DiagramCharacter,
    close: DiagramCharacter,
    spelling: string,
    name: "yaml-block" | "directive",
  ): boolean {
    const match = matchWord(this.reader, close, spelling)
    if (match === null) return false
    const end = match.end
    if (end !== null && !isWhitespace(end.codePoint)) return false
    this.addUnit(name, at, end, "keep-whitespace")
    this.position = isCodePointAt(end, LINE_FEED) ? this.reader.after(end) : end
    return true
  }

  /** Comments: maximal physical-line text after the percent pair; LF remains visible. */
  protected readComment(at: DiagramCharacter): boolean {
    const start = skipWhile(this.reader, at, isHws)
    if (start === null) return false
    const mark = matchWord(this.reader, start, "%%")
    if (mark === null) return false
    const end = lineFeedAfter(this.reader, this.reader.after(start)!)
    this.comments.push({
      range: [start.start, end.start],
      mark: "%%",
      valueStart: this.reader.after(start)!.end,
    })
    this.position = end
    return true
  }
}
