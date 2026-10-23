import { isWhitespace } from "../../character-classes.ts"
import {
  CHARACTER_TABULATION,
  COLON,
  LEFT_CURLY_BRACKET,
  LINE_FEED,
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

/** diagrams/info.md, Ordered rules: composite forms split at component boundaries. */
export type UnitName =
  | "showInfo"
  | "info"
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

/** One lexical component; the converted text is never an AST value. */
export type Unit = DiagramUnit<UnitName>

/** The ordered rules have one context and require complete composite matches. */
type Context = "default"
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  default: null,
}

/** Units and native comments from the complete lexical scan. */
export interface InfoLexing {
  readonly units: readonly Unit[]
  readonly comments: readonly DiagramComment[]
}

/** Hidden ASCII whitespace and optional composite indentation. */
function isHws(character: DiagramCharacter): boolean {
  return (
    character.codePoint === SPACE ||
    character.codePoint === CHARACTER_TABULATION
  )
}

/** diagrams/info.md, Ordered rules: take the first complete match, never the longest alternative. */
export class InfoUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "default", END_OF_TEXT_MESSAGES)
  }

  /** Lex the complete text before grammar decisions; there is no recovery. */
  public lex(): InfoLexing {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units, comments: this.comments }
  }

  /** Keep authored component boundaries separate from optional surrounding whitespace. */
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

  /** Ordered rules 1-10, tried again after every successful match. */
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readKeyword(at, "showInfo") ||
      this.readKeyword(at, "info") ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readNewline(at) ||
      this.readWhitespace(at) ||
      this.readYaml(at) ||
      this.readDirective(at) ||
      this.readComment(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Rules 1-2, Keyword boundaries: whitespace, EOF or a percent pair must follow. */
  private readKeyword(
    at: DiagramCharacter,
    word: "info" | "showInfo",
  ): boolean {
    const match = matchWord(this.reader, at, word)
    if (match === null) return false
    const end = match.end
    if (
      end !== null &&
      !isWhitespace(end.codePoint) &&
      matchWord(this.reader, end, "%%") === null
    )
      return false
    this.read(word, at, end)
    return true
  }

  /** Rule 3, Composite common forms: ASCII colon gap first, otherwise a common-whitespace brace gap. */
  private readAccDescr(at: DiagramCharacter): boolean {
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

  /** Rule 4: accTitle, ASCII horizontal gap, colon and possibly empty raw line value. */
  private readAccTitle(at: DiagramCharacter): boolean {
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

  /** Rule 5: bare title, or title and exactly one ASCII separator before its line text. */
  private readTitle(at: DiagramCharacter): boolean {
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
  private readLineValue(colon: DiagramCharacter): void {
    const value = this.reader.after(colon)
    this.addUnit(":", colon, value)
    this.readText(value, "line-text")
  }

  /** Composite line text ends before LF or the first percent pair, preserving its padding. */
  private readText(start: DiagramPosition, name: "line-text"): void {
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

  /** Rule 6: one physical line break, including the appended unwritten LF. */
  private readNewline(at: DiagramCharacter): boolean {
    if (at.codePoint !== LINE_FEED) return false
    this.read("newline", at, this.reader.after(at))
    return true
  }

  /** Rule 7: only ASCII spaces and tabs are hidden between units. */
  private readWhitespace(at: DiagramCharacter): boolean {
    if (!isHws(at)) return false
    this.position = skipWhile(this.reader, at, isHws)
    return true
  }

  /** Rule 8, Hidden YAML: prefer a body-present closer after a subsequent LF, then the empty body. */
  private readYaml(at: DiagramCharacter): boolean {
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

  /** Rule 9, Hidden DIRECTIVE: earliest qualifying closer, including empty or punctuation bodies. */
  private readDirective(at: DiagramCharacter): boolean {
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
  private readHiddenCloser(
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

  /** Rule 10, Comments: maximal physical-line text after the percent pair; LF remains visible. */
  private readComment(at: DiagramCharacter): boolean {
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
