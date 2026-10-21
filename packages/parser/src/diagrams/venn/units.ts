import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
  isWordCharacter,
} from "../../character-classes.ts"
import {
  CHARACTER_TABULATION,
  COLON,
  COMMA,
  FULL_STOP,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LEFT_SQUARE_BRACKET,
  LINE_FEED,
  LOW_LINE,
  NUMBER_SIGN,
  PERCENT_SIGN,
  PLUS_SIGN,
  QUOTATION_MARK,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
  RIGHT_SQUARE_BRACKET,
  SEMICOLON,
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
  isWhitespaceAt,
  matchWholeWordIgnoringCase,
  matchWordIgnoringCase,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"
import { UnitLexer } from "../../unit-lexer.ts"

/** Units and contexts: whole label and title matches are divided at their delimiters. */
export type UnitName =
  | "header"
  | "set-keyword"
  | "union-keyword"
  | "text-keyword"
  | "style-keyword"
  | "implicit-text-start"
  | "newline"
  | "title"
  | "title-text"
  | "label-open"
  | "label-text"
  | "label-string"
  | "label-close"
  | "identifier"
  | "number"
  | "string"
  | "hex-color"
  | "rgb-color"
  | "rgba-color"
  | ","
  | ":"
  | "ignored-text"

/** One unit of the venn diagram text. */
export type Unit = DiagramUnit<UnitName>

/** Units and contexts: a newline enters line start; value matches have no context. */
type Context = "ordinary" | "line-start"

/** Both contexts may end the text; strings and labels must match whole. */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  ordinary: null,
  "line-start": null,
}

/** Units and contexts, rule 13: bounded keywords, in rule order. */
const KEYWORDS: readonly { readonly word: string; readonly name: UnitName }[] =
  [
    { word: "venn-beta", name: "header" },
    { word: "set", name: "set-keyword" },
    { word: "union", name: "union-keyword" },
    { word: "text", name: "text-keyword" },
    { word: "style", name: "style-keyword" },
  ]

/** The units and diagram comments in source order. */
export interface VennLexing {
  readonly units: readonly Unit[]
  readonly comments: readonly DiagramComment[]
}

/** Units and contexts, rules 3 to 6 and 10: only ASCII space and tab. */
function isIndent(character: DiagramCharacter): boolean {
  return (
    character.codePoint === SPACE ||
    character.codePoint === CHARACTER_TABULATION
  )
}

/** Units and contexts, rule 12: title content ends before converted #, LF, or semicolon. */
function isTitleText(character: DiagramCharacter): boolean {
  return (
    character.codePoint !== NUMBER_SIGN &&
    character.codePoint !== LINE_FEED &&
    character.codePoint !== SEMICOLON
  )
}

/** Units and contexts, rule 17: ASCII hexadecimal digits. */
function isHexDigit(character: DiagramCharacter): boolean {
  const code = character.codePoint
  return (
    isAsciiDigit(code) ||
    (code >= 0x41 && code <= 0x46) ||
    (code >= 0x61 && code <= 0x66)
  )
}

/** diagrams/venn.md, Lexical structure: ordered rules, without longest-match selection. */
export class VennUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  /** Text and implicit text mode: a subset enables it until an ordinary line start. */
  private implicitText = false

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "ordinary", END_OF_TEXT_MESSAGES)
  }

  /** Reads all units and comments. The grammar rejects incomplete declarations. */
  public lex(): VennLexing {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units, comments: this.comments }
  }

  /** Makes a unit, keeping value whitespace only when requested. */
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

  /** Units and contexts: rules 1 to 22 in order in both contexts. */
  protected override readInContext(
    at: DiagramCharacter,
    context: Context,
  ): void {
    if (this.readComment(at, false) || this.readCommentPrefix(at)) return
    if (context === "line-start" && this.readLineStart(at)) return
    if (
      this.readNewline(at) ||
      this.readComment(at, true) ||
      this.readSpace(at) ||
      this.readTitle(at) ||
      this.readKeyword(at) ||
      this.readLabel(at) ||
      this.readNumber(at) ||
      this.readHexColor(at) ||
      this.readColor(at, "rgba", 4) ||
      this.readColor(at, "rgb", 3) ||
      this.readIdentifier(at) ||
      this.readString(at) ||
      this.readPunctuation(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Rules 1 and 9: %% through the character before LF; rule 1 excludes %%{. */
  private readComment(at: DiagramCharacter, braces: boolean): boolean {
    if (at.codePoint !== PERCENT_SIGN) return false
    const second = this.reader.after(at)
    if (!isCodePointAt(second, PERCENT_SIGN)) return false
    if (!braces && isCodePointAt(this.reader.after(second), LEFT_CURLY_BRACKET))
      return false
    const end = lineFeedAfter(this.reader, second)
    this.comments.push({
      range: [at.start, end.start],
      mark: "%%",
      valueStart: second.end,
    })
    this.position = end
    return true
  }

  /** Rule 2: one UTF-16 code unit before %%, except }, swallowed separately from the comment. */
  private readCommentPrefix(at: DiagramCharacter): boolean {
    if (at.codePoint === RIGHT_CURLY_BRACKET || at.codePoint > 0xffff)
      return false
    const percent = this.reader.after(at)
    if (!isCodePointAt(percent, PERCENT_SIGN)) return false
    const second = this.reader.after(percent)
    if (!isCodePointAt(second, PERCENT_SIGN)) return false
    if (!isWhitespace(at.codePoint)) this.addUnit("ignored-text", at, percent)
    const end = lineFeedAfter(this.reader, second)
    this.comments.push({
      range: [percent.start, end.start],
      mark: "%%",
      valueStart: second.end,
    })
    this.position = end
    return true
  }

  /** Rules 3 to 7: preserve the mode across blank lines; only indented bounded text is implicit. */
  private readLineStart(at: DiagramCharacter): boolean {
    if (isIndent(at)) {
      const after = skipWhile(this.reader, at, isIndent)
      if (
        this.implicitText &&
        after !== null &&
        after.codePoint !== LINE_FEED
      ) {
        const keyword = matchWholeWordIgnoringCase(this.reader, after, "text")
        if (keyword !== null) {
          this.read("implicit-text-start", after, keyword.end)
          this.leave()
          return true
        }
      }
      this.position = after
      return true
    }
    if (at.codePoint === LINE_FEED) return false
    this.implicitText = false
    this.leave()
    return false
  }

  /** Rule 8: one or more LF enter line start. */
  private readNewline(at: DiagramCharacter): boolean {
    if (at.codePoint !== LINE_FEED) return false
    this.read(
      "newline",
      at,
      skipWhile(this.reader, at, (c) => c.codePoint === LINE_FEED),
    )
    if (this.currentContext() !== "line-start")
      this.enter("line-start", [at.start, at.end])
    return true
  }

  /** Rule 10: ASCII spaces and tabs supply no unit. */
  private readSpace(at: DiagramCharacter): boolean {
    if (!isIndent(at)) return false
    this.position = skipWhile(this.reader, at, isIndent)
    return true
  }

  /** Rule 12: a whole title-line match split into keyword and nonempty text after one separator. */
  private readTitle(at: DiagramCharacter): boolean {
    const word = matchWordIgnoringCase(this.reader, at, "title")
    if (word === null || !isWhitespaceAt(word.end)) return false
    const value = this.reader.after(word.end)
    if (value === null || !isTitleText(value)) return false
    this.addUnit("title", at, word.end)
    this.read(
      "title-text",
      value,
      skipWhile(this.reader, value, isTitleText),
      "keep-whitespace",
    )
    return true
  }

  /** Rule 13: bounded keywords; a subset's flag is usable only if its grammar completes. */
  private readKeyword(at: DiagramCharacter): boolean {
    for (const { word, name } of KEYWORDS) {
      const match = matchWholeWordIgnoringCase(this.reader, at, word)
      if (match === null) continue
      this.read(name, at, match.end)
      if (name === "set-keyword" || name === "union-keyword")
        this.implicitText = true
      return true
    }
    return false
  }

  /** Rules 14 and 15: match a complete label before dividing its brackets and interior. */
  private readLabel(at: DiagramCharacter): boolean {
    if (at.codePoint !== LEFT_SQUARE_BRACKET) return false
    const content = this.reader.after(at)
    if (content === null) return false
    if (content.codePoint === QUOTATION_MARK) {
      const quote = skipWhile(
        this.reader,
        this.reader.after(content),
        (c) => c.codePoint !== QUOTATION_MARK,
      )
      if (quote === null) return false
      const close = this.reader.after(quote)
      if (!isCodePointAt(close, RIGHT_SQUARE_BRACKET)) return false
      this.addUnit("label-open", at, content)
      this.addUnit("label-string", content, close, "keep-whitespace")
      this.read("label-close", close, this.reader.after(close))
      return true
    }
    if (content.codePoint === RIGHT_SQUARE_BRACKET) return false
    const close = skipWhile(
      this.reader,
      content,
      (c) =>
        c.codePoint !== RIGHT_SQUARE_BRACKET && c.codePoint !== QUOTATION_MARK,
    )
    if (!isCodePointAt(close, RIGHT_SQUARE_BRACKET)) return false
    this.addUnit("label-open", at, content)
    this.addUnit("label-text", content, close, "keep-whitespace")
    this.read("label-close", close, this.reader.after(close))
    return true
  }

  /** Rule 16: decimal digits, with an optional sign and a fractional part with at least one digit. */
  private readNumber(at: DiagramCharacter): boolean {
    let position: DiagramPosition = at
    if (position.codePoint === PLUS_SIGN || position.codePoint === HYPHEN_MINUS)
      position = this.reader.after(position)
    const first = position
    position = skipWhile(this.reader, position, (c) =>
      isAsciiDigit(c.codePoint),
    )
    const integer = position !== first
    if (isCodePointAt(position, FULL_STOP)) {
      const fraction = this.reader.after(position)
      if (fraction !== null && isAsciiDigit(fraction.codePoint)) {
        position = skipWhile(this.reader, fraction, (c) =>
          isAsciiDigit(c.codePoint),
        )
      } else if (!integer) return false
    } else if (!integer) return false
    this.read("number", at, position)
    return true
  }

  /** Rule 17: # followed by three through eight hexadecimal digits, taking at most eight. */
  private readHexColor(at: DiagramCharacter): boolean {
    if (at.codePoint !== NUMBER_SIGN) return false
    let end = this.reader.after(at)
    let digits = 0
    while (end !== null && isHexDigit(end) && digits < 8) {
      end = this.reader.after(end)
      digits += 1
    }
    if (digits < 3) return false
    this.read("hex-color", at, end)
    return true
  }

  /** Rules 18 and 19: whole rgba/rgb matches; channels are nonempty runs of digits or dots. */
  private readColor(
    at: DiagramCharacter,
    word: "rgba" | "rgb",
    channels: number,
  ): boolean {
    const prefix = matchWordIgnoringCase(this.reader, at, `${word}(`)
    if (prefix === null) return false
    let end = prefix.end
    for (let channel = 0; channel < channels; channel += 1) {
      const start = skipWhitespace(this.reader, end)
      if (start === null) return false
      end = skipWhile(
        this.reader,
        start,
        (c) => isAsciiDigit(c.codePoint) || c.codePoint === FULL_STOP,
      )
      if (end === start) return false
      end = skipWhitespace(this.reader, end)
      if (
        !isCodePointAt(
          end,
          channel === channels - 1 ? RIGHT_PARENTHESIS : COMMA,
        )
      )
        return false
      end = this.reader.after(end)
    }
    this.read(word === "rgba" ? "rgba-color" : "rgb-color", at, end)
    return true
  }

  /** Rule 20: ASCII letter or underscore, followed by word characters or hyphens. */
  private readIdentifier(at: DiagramCharacter): boolean {
    if (!isAsciiLetter(at.codePoint) && at.codePoint !== LOW_LINE) return false
    this.read(
      "identifier",
      at,
      skipWhile(
        this.reader,
        this.reader.after(at),
        (c) => isWordCharacter(c.codePoint) || c.codePoint === HYPHEN_MINUS,
      ),
    )
    return true
  }

  /** Rule 21: a complete quoted string, with no escape syntax. */
  private readString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const close = skipWhile(
      this.reader,
      this.reader.after(at),
      (c) => c.codePoint !== QUOTATION_MARK,
    )
    if (close === null) return false
    this.read("string", at, this.reader.after(close), "keep-whitespace")
    return true
  }

  /** Rule 22: commas and colons, each a separate unit. */
  private readPunctuation(at: DiagramCharacter): boolean {
    if (at.codePoint !== COMMA && at.codePoint !== COLON) return false
    this.read(at.codePoint === COMMA ? "," : ":", at, this.reader.after(at))
    return true
  }
}
