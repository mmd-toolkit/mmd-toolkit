import type { UsecaseArrow } from "../../ast/usecase.ts"
import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
  isWordCharacter,
} from "../../character-classes.ts"
import type { DiagramComment } from "../../diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import { lineFeedAfter } from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import { readUnit, significantRangeOf } from "../../diagram-units.ts"
import type { LineIndex } from "../../positions.ts"
import {
  isCodePointAt,
  matchWord,
  matchWordIgnoringCase,
  samePosition,
  skipWhile,
} from "../../scanning.ts"
import { UnitLexer } from "../../unit-lexer.ts"
import {
  CARRIAGE_RETURN,
  COMMERCIAL_AT,
  LESS_THAN_SIGN,
  GREATER_THAN_SIGN,
  NUMBER_SIGN,
  LOW_LINE,
  CHARACTER_TABULATION,
  SPACE,
  LINE_FEED,
  QUOTATION_MARK,
  APOSTROPHE,
  LEFT_CURLY_BRACKET,
  RIGHT_CURLY_BRACKET,
  REVERSE_SOLIDUS,
  HYPHEN_MINUS,
  FULL_STOP,
} from "../../code-points.ts"

/** diagrams/usecase.md: the explicitly enumerated keyword vocabulary. */
export type Keyword =
  | "usecase-beta"
  | "actor"
  | "systemBoundary"
  | "end"
  | "direction"
  | "TD"
  | "TB"
  | "BT"
  | "LR"
  | "RL"
  | "note"
  | "for"
  | "json"
  | "classDef"
  | "class"
  | "style"
  | "include"
  | "extend"
  | "true"
  | "false"

/** Ordered default-context keywords, each with the Identifier longer alternative. */
export const KEYWORDS: readonly Keyword[] = [
  "usecase-beta",
  "actor",
  "systemBoundary",
  "end",
  "direction",
  "TD",
  "TB",
  "BT",
  "LR",
  "RL",
  "note",
  "for",
  "json",
  "classDef",
  "class",
  "style",
  "include",
  "extend",
  "true",
  "false",
]

/** diagrams/usecase.md, Lexical structure: lexical names, not category names. */
export type UnitName =
  | Keyword
  | "newline"
  | "diagram-comment"
  | "plain-string"
  | "markdown-string"
  | "unclosed-markdown"
  | "accTitle"
  | "accDescr"
  | "accessibility-text"
  | "description-text"
  | "raw-json-id"
  | "json-at"
  | "json-open"
  | "json-text"
  | "json-close"
  | "unclosed-json"
  | "generalization"
  | "dependency-arrow"
  | "<<"
  | ">>"
  | "stereotype-text"
  | "unclosed-stereotype"
  | ":::"
  | "forward-solid"
  | "backward-solid"
  | "forward-circle"
  | "backward-circle"
  | "forward-cross"
  | "backward-cross"
  | "markerless-solid"
  | "@{"
  | "@"
  | "{"
  | "}"
  | "["
  | "]"
  | "("
  | ")"
  | ","
  | ":"
  | "hash-color"
  | "css-identifier"
  | "identifier"
  | "number"
  | "escaped-comma"
  | "-"
  | "."
  | "%"
  | "css-punctuation"
  | "label-punctuation"
  | "label-symbol"

/** All unit text is converted form; ranges still refer to the original source. */
export interface Unit extends DiagramUnit<UnitName> {
  /** Marker structure and written dash/dot count, decided by the operator rule. */
  readonly arrow: Pick<
    UsecaseArrow,
    "startMarker" | "endMarker" | "line" | "length"
  > | null
}

/** The two exclusive modes supplement the default context. */
type Context = "default" | "json" | "stereotype"

const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  default: null,
  json: null,
  stereotype: null,
}

/** Units and native comments, in source order. */
export interface UsecaseLexing {
  readonly units: readonly Unit[]
  readonly comments: readonly DiagramComment[]
}

/** ASCII horizontal whitespace, distinct from the common whitespace set. */
function isHws(character: DiagramCharacter): boolean {
  return (
    character.codePoint === SPACE ||
    character.codePoint === CHARACTER_TABULATION
  )
}

/** ASCII word characters are the only characters of native ids. */
function isWord(character: DiagramCharacter): boolean {
  return isWordCharacter(character.codePoint)
}

/** Rule 37: maximal content outside printable ASCII, excluding physical line breaks and tabs. */
function isLabelSymbol(character: DiagramCharacter): boolean {
  return (
    (character.codePoint < SPACE || character.codePoint > 0x7e) &&
    character.codePoint !== CHARACTER_TABULATION &&
    character.codePoint !== LINE_FEED &&
    character.codePoint !== CARRIAGE_RETURN
  )
}

/** diagrams/usecase.md: hand-written first-match rules, with only the stated longer alternatives. */
export class UsecaseUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  /** Whether only ASCII HWS has been read since the last physical LF. */
  private lineStart = true

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "default", END_OF_TEXT_MESSAGES)
  }

  /** Lex the whole input before grammar decisions, retaining lexical-error priority. */
  public lex(): UsecaseLexing {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units, comments: this.comments }
  }

  /** Each emitted component has its own range; whitespace is kept in text values. */
  protected override addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "keep-whitespace",
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
    const arrow: Unit["arrow"] = [
      "generalization",
      "dependency-arrow",
      "forward-solid",
      "backward-solid",
      "forward-circle",
      "backward-circle",
      "forward-cross",
      "backward-cross",
      "markerless-solid",
    ].includes(name)
      ? {
          startMarker:
            name === "backward-solid"
              ? "arrow"
              : name === "backward-circle"
                ? "circle"
                : name === "backward-cross"
                  ? "cross"
                  : "none",
          endMarker:
            name === "generalization"
              ? "triangle"
              : name === "dependency-arrow" || name === "forward-solid"
                ? "arrow"
                : name === "forward-circle"
                  ? "circle"
                  : name === "forward-cross"
                    ? "cross"
                    : "none",
          line: name === "dependency-arrow" ? "dotted" : "solid",
          length: [...unit.text].filter(
            (character) =>
              character === (name === "dependency-arrow" ? "." : "-"),
          ).length,
        }
      : null
    const result: Unit = { ...unit, arrow }
    this.units.push(result)
    for (const character of unit.text) {
      if (character === "\n") this.lineStart = true
      else if (character !== " " && character !== "\t") this.lineStart = false
    }
    return result
  }

  /** Only the current context's rules apply. */
  protected override readInContext(
    at: DiagramCharacter,
    context: Context,
  ): void {
    switch (context) {
      case "json":
        this.readJson(at)
        return
      case "stereotype":
        this.readStereotype(at)
        return
      case "default":
        this.readDefault(at)
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown usecase context ${context satisfies never}`,
        )
    }
  }

  /** Ordered default rules 1-37; categories never match characters themselves. */
  private readDefault(at: DiagramCharacter): void {
    if (isHws(at)) {
      this.position = skipWhile(this.reader, at, isHws)
      return
    }
    if (this.readMarkdown(at) || this.readComment(at)) return
    if (at.codePoint === LINE_FEED) {
      this.read("newline", at, this.reader.after(at), "trim-whitespace")
      return
    }
    if (
      this.readAccessibility(at) ||
      this.readJsonPrefix(at) ||
      this.readKeyword(at)
    )
      return
    if (
      this.readExact(at, "--|>", "generalization") ||
      this.readExact(at, "..>", "dependency-arrow")
    )
      return
    if (this.readExact(at, "<<", "<<")) {
      this.enter("stereotype", significantRangeOf(this.units.at(-1)!))
      return
    }
    if (this.readExact(at, ":::", ":::")) return
    if (this.readSolid(at, false, true) || this.readSolid(at, true, true))
      return
    if (
      this.readExact(at, "--o", "forward-circle") ||
      this.readExact(at, "o--", "backward-circle") ||
      this.readExact(at, "--x", "forward-cross") ||
      this.readExact(at, "x--", "backward-cross") ||
      this.readSolid(at, false, false)
    )
      return
    for (const mark of [
      "@{",
      "@",
      "{",
      "}",
      "[",
      "]",
      "(",
      ")",
      ",",
      ":",
    ] as const) {
      if (this.readExact(at, mark, mark)) return
    }
    if (
      this.readHash(at) ||
      this.readPlainString(at) ||
      this.readCssIdentifier(at) ||
      this.readIdentifier(at) ||
      this.readNumber(at)
    )
      return
    if (this.readExact(at, "\\,", "escaped-comma")) return
    for (const mark of ["-", ".", "%"] as const)
      if (this.readExact(at, mark, mark)) return
    if ("!#$&*+/=?^_|~".includes(String.fromCodePoint(at.codePoint))) {
      this.read("css-punctuation", at, this.reader.after(at))
      return
    }
    if (";<>\\`".includes(String.fromCodePoint(at.codePoint))) {
      this.read("label-punctuation", at, this.reader.after(at))
      return
    }
    if (isLabelSymbol(at)) {
      this.read("label-symbol", at, skipWhile(this.reader, at, isLabelSymbol))
      return
    }
    throw this.noRuleMatches(at)
  }

  /** Rules 2-3: markdown consumes to the first closing pair; its fallback never becomes plain text. */
  private readMarkdown(at: DiagramCharacter): boolean {
    const opening = matchWord(this.reader, at, '"`')
    if (opening === null) return false
    let end = opening.end
    while (end !== null) {
      const close = matchWord(this.reader, end, '`"')
      if (close !== null) {
        this.read("markdown-string", at, close.end)
        return true
      }
      end = this.reader.after(end)
    }
    this.read("unclosed-markdown", at, null)
    return true
  }

  /** Rule 4: native comments exist only at an ASCII-HWS-only line start. */
  private readComment(at: DiagramCharacter): boolean {
    if (!this.lineStart) return false
    const mark = matchWord(this.reader, at, "%%")
    if (mark === null) return false
    const end = lineFeedAfter(this.reader, at)
    const second = this.reader.after(at)!
    this.comments.push({
      range: [at.start, end.start],
      mark: "%%",
      valueStart: second.end,
    })
    this.read("diagram-comment", at, end)
    return true
  }

  /** Rules 6-8: composite accessibility matches emit keyword, delimiter and complete raw value. */
  private readAccessibility(at: DiagramCharacter): boolean {
    if (!this.lineStart) return false
    for (const [word, delimiter] of [
      ["accDescr", "{"],
      ["accTitle", ":"],
      ["accDescr", ":"],
    ] as const) {
      const keyword = matchWord(this.reader, at, word)
      if (keyword === null) continue
      const mark = skipWhile(this.reader, keyword.end, isHws)
      if (mark === null || mark.codePoint !== delimiter.codePointAt(0)) continue
      const valueStart = this.reader.after(mark)
      const valueEnd = skipWhile(
        this.reader,
        valueStart,
        (c) =>
          c.codePoint !== (delimiter === "{" ? RIGHT_CURLY_BRACKET : LINE_FEED),
      )
      if (delimiter === "{" && valueEnd === null) continue
      this.addUnit(word, at, keyword.end)
      this.addUnit(delimiter, mark, valueStart)
      if (valueStart !== null && !samePosition(valueStart, valueEnd))
        this.addUnit(
          delimiter === "{" ? "description-text" : "accessibility-text",
          valueStart,
          valueEnd,
        )
      if (delimiter === "{" && valueEnd !== null)
        this.read("}", valueEnd, this.reader.after(valueEnd))
      else this.position = valueEnd
      return true
    }
    return false
  }

  /** Rule 9: the JSON prefix is one match but json, raw id and @ have separate atomic boundaries. */
  private readJsonPrefix(at: DiagramCharacter): boolean {
    const word = matchWord(this.reader, at, "json")
    if (word === null || word.end === null || !isHws(word.end)) return false
    const id = skipWhile(this.reader, word.end, isHws)
    if (id === null || !isWord(id)) return false
    const idEnd = skipWhile(this.reader, id, isWord)
    const mark = skipWhile(this.reader, idEnd, isHws)
    if (!isCodePointAt(mark, COMMERCIAL_AT)) return false
    const afterAt = this.reader.after(mark)
    const brace = skipWhile(this.reader, afterAt, isHws)
    if (!isCodePointAt(brace, LEFT_CURLY_BRACKET)) return false
    this.addUnit("json", at, word.end)
    this.addUnit("raw-json-id", id, idEnd)
    this.addUnit("json-at", mark, afterAt)
    this.position = brace
    this.enter("json", [brace.start, brace.end])
    return true
  }

  /** Rule 10: keyword's longer alternative is Identifier alone, without recursively trying Number. */
  private readKeyword(at: DiagramCharacter): boolean {
    for (const word of KEYWORDS) {
      const match = (
        word === "include" || word === "extend"
          ? matchWordIgnoringCase
          : matchWord
      )(this.reader, at, word)
      if (match === null) continue
      const idEnd = isWord(at) ? skipWhile(this.reader, at, isWord) : at
      const longer =
        idEnd !== null && match.end !== null
          ? idEnd.start > match.end.start
          : idEnd === null && match.end !== null
      this.read(longer ? "identifier" : word, at, longer ? idEnd : match.end)
      return true
    }
    return false
  }

  /** Rules 15, 16 and 21: maximal dash count; only forward solid consumes a following >. */
  private readSolid(
    at: DiagramCharacter,
    backward: boolean,
    pointed: boolean,
  ): boolean {
    let from: DiagramPosition = at
    if (backward) {
      if (at.codePoint !== LESS_THAN_SIGN) return false
      from = this.reader.after(at)
    }
    let end = from
    let count = 0
    while (isCodePointAt(end, HYPHEN_MINUS)) {
      count += 1
      end = this.reader.after(end)
    }
    if (count < 2) return false
    if (pointed && !backward) {
      if (!isCodePointAt(end, GREATER_THAN_SIGN)) return false
      end = this.reader.after(end)
    }
    this.read(
      backward
        ? "backward-solid"
        : pointed
          ? "forward-solid"
          : "markerless-solid",
      at,
      end,
    )
    return true
  }

  /** Rule 28: # followed by a positive maximal ASCII hexadecimal run. */
  private readHash(at: DiagramCharacter): boolean {
    if (at.codePoint !== NUMBER_SIGN) return false
    const first = this.reader.after(at)
    const end = skipWhile(
      this.reader,
      first,
      (c) =>
        isAsciiDigit(c.codePoint) ||
        (c.codePoint >= 0x41 && c.codePoint <= 0x46) ||
        (c.codePoint >= 0x61 && c.codePoint <= 0x66),
    )
    if (samePosition(first, end)) return false
    this.read("hash-color", at, end)
    return true
  }

  /** Rule 29: same matching quote, no physical LF and no escape decoding. */
  private readPlainString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK && at.codePoint !== APOSTROPHE)
      return false
    let end = this.reader.after(at)
    while (
      end !== null &&
      end.codePoint !== LINE_FEED &&
      end.codePoint !== at.codePoint
    )
      end = this.reader.after(end)
    if (end === null || end.codePoint !== at.codePoint) return false
    this.read("plain-string", at, this.reader.after(end))
    return true
  }

  /** Rule 30: a CSS word requires at least one nonempty hyphen group, unless it starts with --. */
  private readCssIdentifier(at: DiagramCharacter): boolean {
    const custom = matchWord(this.reader, at, "--")
    const start = custom === null ? at : custom.end
    if (
      start === null ||
      !(isAsciiLetter(start.codePoint) || start.codePoint === LOW_LINE)
    )
      return false
    let end = skipWhile(this.reader, this.reader.after(start), isWord)
    if (custom !== null) {
      end = skipWhile(
        this.reader,
        end,
        (c) => isWord(c) || c.codePoint === HYPHEN_MINUS,
      )
      this.read("css-identifier", at, end)
      return true
    }
    let hyphen = false
    while (isCodePointAt(end, HYPHEN_MINUS)) {
      const next = this.reader.after(end)
      if (next === null || !isWord(next)) break
      hyphen = true
      end = skipWhile(this.reader, next, isWord)
    }
    if (!hyphen) return false
    this.read("css-identifier", at, end)
    return true
  }

  /** Rule 31: Identifier's Number longer alternative can extend an initial integer word. */
  private readIdentifier(at: DiagramCharacter): boolean {
    if (!isWord(at)) return false
    const end = skipWhile(this.reader, at, isWord)
    const number = this.numberEnd(at)
    const longer =
      number !== undefined &&
      (number === null || (end !== null && number.start > end.start))
    this.read(longer ? "number" : "identifier", at, longer ? number! : end)
    return true
  }

  /** Rule 32: digits with optional fraction, or leading dot plus digits, then ASCII letters. */
  private numberEnd(at: DiagramCharacter): DiagramPosition | undefined {
    let end: DiagramPosition = at
    if (at.codePoint === FULL_STOP) {
      end = this.reader.after(at)
      if (end === null || !isAsciiDigit(end.codePoint)) return undefined
      end = skipWhile(this.reader, end, (c) => isAsciiDigit(c.codePoint))
    } else {
      if (!isAsciiDigit(at.codePoint)) return undefined
      end = skipWhile(this.reader, at, (c) => isAsciiDigit(c.codePoint))
      if (isCodePointAt(end, FULL_STOP)) {
        const digit = this.reader.after(end)
        if (digit !== null && isAsciiDigit(digit.codePoint))
          end = skipWhile(this.reader, digit, (c) => isAsciiDigit(c.codePoint))
      }
    }
    return skipWhile(this.reader, end, (c) => isAsciiLetter(c.codePoint))
  }

  /** Rule 32, after Identifier has had its earlier chance. */
  private readNumber(at: DiagramCharacter): boolean {
    const end = this.numberEnd(at)
    if (end === undefined) return false
    this.read("number", at, end)
    return true
  }

  /** Match one exact spelling at its specified priority. */
  private readExact(
    at: DiagramCharacter,
    word: string,
    name: UnitName,
  ): boolean {
    const match = matchWord(this.reader, at, word)
    if (match === null) return false
    this.read(name, at, match.end)
    return true
  }

  /** JSON context: brace depth and double-quoted strings with one-character backslash protection only. */
  private readJson(at: DiagramCharacter): void {
    let end: DiagramPosition = at
    let depth = 0
    let quoted = false
    let escaped = false
    while (end !== null) {
      const current: DiagramCharacter = end
      end = this.reader.after(current)
      if (quoted) {
        if (escaped) escaped = false
        else if (current.codePoint === REVERSE_SOLIDUS) escaped = true
        else if (current.codePoint === QUOTATION_MARK) quoted = false
      } else if (current.codePoint === QUOTATION_MARK) quoted = true
      else if (current.codePoint === LEFT_CURLY_BRACKET) depth += 1
      else if (current.codePoint === RIGHT_CURLY_BRACKET) {
        depth -= 1
        if (depth === 0) {
          const content = this.reader.after(at)
          this.addUnit("json-open", at, content)
          if (content !== null && !samePosition(content, current))
            this.addUnit("json-text", content, current)
          this.read("json-close", current, end)
          this.leave()
          return
        }
      }
    }
    this.read("unclosed-json", at, null)
    this.leave()
  }

  /** Stereotype context: first closer, nonempty non-LF text, then rejected non-LF fallback. */
  private readStereotype(at: DiagramCharacter): void {
    if (this.readExact(at, ">>", ">>")) {
      this.leave()
      return
    }
    let end: DiagramPosition = at
    let nonWhitespace = false
    while (
      end !== null &&
      end.codePoint !== LINE_FEED &&
      matchWord(this.reader, end, ">>") === null
    ) {
      if (!isWhitespace(end.codePoint)) nonWhitespace = true
      end = this.reader.after(end)
    }
    if (end !== null && end.codePoint !== LINE_FEED && nonWhitespace) {
      this.read("stereotype-text", at, end)
      return
    }
    const fallback = skipWhile(
      this.reader,
      at,
      (c) => c.codePoint !== LINE_FEED,
    )
    if (!samePosition(at, fallback))
      this.read("unclosed-stereotype", at, fallback)
    this.leave()
  }
}
