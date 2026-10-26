import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
  isWordCharacter,
} from "../../character-classes.ts"
import {
  APOSTROPHE,
  LEFT_CURLY_BRACKET,
  LINE_FEED,
  LINE_SEPARATOR,
  LOW_LINE,
  PARAGRAPH_SEPARATOR,
  QUOTATION_MARK,
  RIGHT_CURLY_BRACKET,
} from "../../code-points.ts"
import { CommonFormUnitLexer, isHws } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter, DiagramPosition } from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import {
  isCodePointAt,
  matchWord,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"

/** Native atoms and split data components; no imported EOL production. */
type EventmodelingUnitName =
  | "eventmodeling"
  | "resetframe"
  | "readmodel"
  | "processor"
  | "timeframe"
  | "command"
  | "entity"
  | "event"
  | "jsobj"
  | "figma"
  | "given"
  | "json"
  | "salt"
  | "html"
  | "text"
  | "data"
  | "note"
  | "when"
  | "then"
  | "rmo"
  | "cmd"
  | "evt"
  | "pcr"
  | "uri"
  | "->>"
  | "gwt"
  | "ui"
  | "md"
  | "tf"
  | "[["
  | "]]"
  | "rf"
  | "`"
  | "."
  | "frame-name"
  | "inline-open"
  | "inline-text"
  | "inline-close"
  | "inline-string"
  | "block-open"
  | "data-text"
  | "block-close"

/** Ordered units 1-34, in the specification's first-match order. */
const FIXED_UNITS: readonly EventmodelingUnitName[] = [
  "eventmodeling",
  "resetframe",
  "readmodel",
  "processor",
  "timeframe",
  "command",
  "entity",
  "event",
  "jsobj",
  "figma",
  "given",
  "json",
  "salt",
  "html",
  "text",
  "data",
  "note",
  "when",
  "then",
  "rmo",
  "cmd",
  "evt",
  "pcr",
  "uri",
  "->>",
  "gwt",
  "ui",
  "md",
  "tf",
  "[[",
  "]]",
  "rf",
  "`",
  ".",
]

/** Shared forms supply components, not an inherited grammar or whitespace rule. */
export type UnitName = EventmodelingUnitName | CommonFormUnitName

/** Every boundary needed by recursive descent is decided during lexing. */
export type Unit = DiagramUnit<UnitName>

/** Names and references: ASCII letter/underscore, then ASCII word characters. */
function isIdentifierStart(at: DiagramCharacter): boolean {
  return isAsciiLetter(at.codePoint) || at.codePoint === LOW_LINE
}

/** Data: CR has already become LF; LS/PS also stop same-line inline data. */
function isInlineCharacter(at: DiagramCharacter): boolean {
  return (
    at.codePoint !== LINE_FEED &&
    at.codePoint !== LINE_SEPARATOR &&
    at.codePoint !== PARAGRAPH_SEPARATOR
  )
}

/** diagrams/eventmodeling.md, Ordered units: one context with first-match priority. */
export class EventmodelingUnitLexer extends CommonFormUnitLexer<EventmodelingUnitName> {
  /** Rules 1-47: general whitespace includes LF and precedes native hidden forms. */
  protected override readInContext(at: DiagramCharacter): void {
    if (
      this.readFixedUnit(at) ||
      this.readIdentifier(at) ||
      this.readFrameName(at) ||
      this.readInlineData(at) ||
      this.readBlockData(at) ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readNativeWhitespace(at) ||
      this.readYaml(at) ||
      this.readDirective(at) ||
      this.readComment(at) ||
      this.readSlashBlockComment(at) ||
      this.readSlashLineComment(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Keywords have only their explicit identifier alternative; punctuation has none. */
  private readFixedUnit(at: DiagramCharacter): boolean {
    for (const word of FIXED_UNITS) {
      const match =
        word === "eventmodeling"
          ? this.matchKeyword(at, word)
          : matchWord(this.reader, at, word)
      if (match === null) continue
      const identifierEnd = isIdentifierStart(at)
        ? skipWhile(this.reader, this.reader.after(at), (c) =>
            isWordCharacter(c.codePoint),
          )
        : undefined
      this.readUnitOrLongerAlternative(at, word, match.end, "id", identifierEnd)
      return true
    }
    return false
  }

  /** Rule 35: exact reserved words have already won over equal-length names. */
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

  /** Rule 36: one through three digits, retaining zeros as name characters. */
  private readFrameName(at: DiagramCharacter): boolean {
    if (!isAsciiDigit(at.codePoint)) return false
    let end = this.reader.after(at)
    for (let digits = 1; digits < 3 && end !== null; digits += 1) {
      if (!isAsciiDigit(end.codePoint)) break
      end = this.reader.after(end)
    }
    this.read("frame-name", at, end)
    return true
  }

  /** Rule 37: the last same-line matching closer wins; backslashes are ordinary. */
  private readInlineData(at: DiagramCharacter): boolean {
    if (
      at.codePoint !== LEFT_CURLY_BRACKET &&
      at.codePoint !== QUOTATION_MARK &&
      at.codePoint !== APOSTROPHE
    )
      return false
    const closer =
      at.codePoint === LEFT_CURLY_BRACKET ? RIGHT_CURLY_BRACKET : at.codePoint
    let cursor = this.reader.after(at)
    let close: DiagramPosition = null
    while (cursor !== null && isInlineCharacter(cursor)) {
      if (cursor.codePoint === closer) close = cursor
      cursor = this.reader.after(cursor)
    }
    if (close === null) return false
    const end = this.reader.after(close)
    if (at.codePoint === LEFT_CURLY_BRACKET) {
      this.addUnit("inline-open", at, this.reader.after(at))
      this.addPayload("inline-text", this.reader.after(at), close)
      this.read("inline-close", close, end)
    } else this.read("inline-string", at, end, "keep-whitespace")
    return true
  }

  /** Rule 38: prefer a body-present qualifying closer, then the adjacent empty form. */
  private readBlockData(at: DiagramCharacter): boolean {
    if (at.codePoint !== LEFT_CURLY_BRACKET) return false
    const value = this.reader.after(at)
    const lf = skipWhile(this.reader, value, isHws)
    if (!isCodePointAt(lf, LINE_FEED)) return false
    const body = this.reader.after(lf)
    let cursor = body
    while (cursor !== null) {
      if (cursor.codePoint === LINE_FEED) {
        const close = this.reader.after(cursor)
        if (close !== null && this.readBlockClose(at, close)) return true
      }
      cursor = this.reader.after(cursor)
    }
    return body !== null && this.readBlockClose(at, body)
  }

  /** Block-data consumes a following LF, leaving other qualifying whitespace unread. */
  private readBlockClose(
    at: DiagramCharacter,
    close: DiagramCharacter,
  ): boolean {
    if (close.codePoint !== RIGHT_CURLY_BRACKET) return false
    const end = this.reader.after(close)
    if (end !== null && !isWhitespace(end.codePoint)) return false
    this.addUnit("block-open", at, this.reader.after(at))
    this.addPayload("data-text", this.reader.after(at), close)
    this.addUnit("block-close", close, end)
    this.position = isCodePointAt(end, LINE_FEED) ? this.reader.after(end) : end
    return true
  }

  /** Common statements: share the matcher while retaining all EM description-block padding. */
  protected override addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
  ): Unit {
    return super.addUnit(
      name,
      from,
      to,
      name === "block-text" ? "keep-whitespace" : ends,
    )
  }

  /** Text interiors own all surviving whitespace, including whitespace-only values. */
  private addPayload(
    name: "inline-text" | "data-text",
    start: DiagramPosition,
    end: DiagramPosition,
  ): void {
    if (start !== null && !samePosition(start, end))
      this.addUnit(name, start, end, "keep-whitespace")
  }

  /** Rule 42: all Notation whitespace is hidden, with no visible EOL unit. */
  private readNativeWhitespace(at: DiagramCharacter): boolean {
    if (!isWhitespace(at.codePoint)) return false
    this.position = skipWhitespace(this.reader, at)
    return true
  }

  /** Rule 46: first closing mark, without nesting or escape protection. */
  private readSlashBlockComment(at: DiagramCharacter): boolean {
    const opening = matchWord(this.reader, at, "/*")
    if (opening === null) return false
    let cursor = opening.end
    while (cursor !== null) {
      const close = matchWord(this.reader, cursor, "*/")
      if (close !== null) {
        this.comments.push({
          range: [at.start, this.reader.after(cursor)!.end],
          mark: "/*",
          valueStart: this.reader.after(at)!.end,
          valueEnd: cursor.start,
        })
        this.position = close.end
        return true
      }
      cursor = this.reader.after(cursor)
    }
    return false
  }

  /** Rule 47: slash-line text includes LS/PS, stopping before physical LF. */
  private readSlashLineComment(at: DiagramCharacter): boolean {
    const opening = matchWord(this.reader, at, "//")
    if (opening === null) return false
    const end = skipWhile(
      this.reader,
      opening.end,
      (c) => c.codePoint !== LINE_FEED,
    )
    this.comments.push({
      range: [at.start, end?.start ?? at.end],
      mark: "//",
      valueStart: this.reader.after(at)!.end,
    })
    this.position = end
    return true
  }
}
