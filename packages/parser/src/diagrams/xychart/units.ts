import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
} from "../../character-classes.ts"
import {
  AMPERSAND,
  ASTERISK,
  COLON,
  COMMA,
  EQUALS_SIGN,
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
  RIGHT_SQUARE_BRACKET,
  SEMICOLON,
} from "../../code-points.ts"
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
  matchWholeWordIgnoringCase,
  matchWord,
  matchWordIgnoringCase,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"
import { UnitLexer } from "../../unit-lexer.ts"

/** diagrams/xychart.md, Units and contexts: the names of the units. */
export type UnitName =
  // The statement context.
  | "newline"
  | "header"
  | "orientation"
  | "title"
  | "x-axis"
  | "y-axis"
  | "line"
  | "bar"
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "["
  | "]"
  | "word"
  | ","
  | ";"
  // The axis and the values contexts.
  | "-->"
  | "number"
  // The string context.
  | "string"
  // The accessibility contexts.
  | "acc-title-text"
  | "acc-description-text"
  | "description-block-text"
  | "}"

/** diagrams/xychart.md, Units and contexts: one unit of the xychart lexer. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/xychart.md, Units and contexts: the contexts of the lexer. */
type Context =
  | "statement"
  | "axis"
  | "category"
  | "plot"
  | "values"
  | "string"
  | "title"
  | "description"
  | "description-block"

/**
 * Units and contexts: for each context, null when the text may end in it;
 * otherwise the message of the error when the text ends in it, which says
 * what is not closed. The description block context may end the text, and
 * its block then runs to the end of the text.
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  statement: null,
  axis: null,
  category: "The categories have no ] before the end of the text",
  plot: null,
  values: "The values have no ] before the end of the text",
  string: 'The string has no closing " before the end of the text',
  title: null,
  description: null,
  "description-block": null,
}

/**
 * The statement context, rule 3: the keywords that no word character may
 * follow, in the order in which they are tried, with the unit each is and
 * the context it enters.
 */
const WORD_KEYWORDS: readonly {
  readonly word: string
  readonly unit: UnitName
  readonly enters: Context | null
}[] = [
  { word: "title", unit: "title", enters: null },
  { word: "xychart-beta", unit: "header", enters: null },
  { word: "xychart", unit: "header", enters: null },
  { word: "x-axis", unit: "x-axis", enters: "axis" },
  { word: "y-axis", unit: "y-axis", enters: "axis" },
  { word: "line", unit: "line", enters: "plot" },
  { word: "bar", unit: "bar", enters: "plot" },
]

/** The statement context, rule 3: the orientations, which anything may follow. */
const ORIENTATIONS: readonly string[] = ["vertical", "horizontal"]

/** The statement context, rule 6: the characters that are a `word` unit each. */
const WORD_PUNCTUATION: readonly number[] = [
  HYPHEN_MINUS,
  LOW_LINE,
  FULL_STOP,
  PLUS_SIGN,
  EQUALS_SIGN,
  ASTERISK,
  AMPERSAND,
  NUMBER_SIGN,
]

/** diagrams/xychart.md, Lexical structure: what the lexer reads from the diagram text. */
export interface XychartLexing {
  readonly units: readonly Unit[]
  /** The diagram comments, in source order. */
  readonly comments: readonly DiagramComment[]
}

/**
 * The statement context, rule 3: a keyword found at a place, and how it is
 * read there: a keyword of {@link WORD_KEYWORDS} up to `end`; an
 * orientation up to `end`; or an accessibility keyword up to `end`, then
 * whitespace, and its mark at `mark`.
 */
type KeywordMatch =
  | {
      readonly kind: "word"
      readonly keyword: (typeof WORD_KEYWORDS)[number]
      readonly end: DiagramPosition
    }
  | { readonly kind: "orientation"; readonly end: DiagramPosition }
  | {
      readonly kind: "accessibility"
      readonly keyword: "accTitle" | "accDescr"
      readonly end: DiagramPosition
      readonly mark: DiagramCharacter
      readonly context: Context
    }

/** The axis and the values contexts: whether `position` is a digit. */
function isDigitAt(position: DiagramPosition): boolean {
  return position !== null && isAsciiDigit(position.codePoint)
}

/**
 * diagrams/xychart.md, Lexical structure: the lexer that divides the
 * diagram text into units and finds its diagram comments. It keeps a stack
 * of contexts and, at each place, applies the first rule of the current
 * context that matches. The rules are those of the specification, in its
 * order; each method that reads a context names the section it follows.
 * Letters of the keywords are compared case-insensitively.
 */
export class XychartUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "statement", END_OF_TEXT_MESSAGES)
  }

  /**
   * Divides the diagram text into units. Throws `ParseError` where no rule
   * matches and where the text ends in a string, the categories, or the
   * values.
   */
  public lex(): XychartLexing {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units, comments: this.comments }
  }

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`, whose token leaves out the whitespace at its
   * ends as `ends` says. Its text is those characters, or `text` when it is
   * given.
   */
  protected override addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
    text: string | null = null,
  ): Unit {
    const unit = readUnit(
      this.reader,
      name,
      this.units.length,
      from,
      to,
      text,
      ends,
    )
    this.units.push(unit)
    return unit
  }

  /** Applies the first rule of `context` that matches at `at`. */
  protected override readInContext(
    at: DiagramCharacter,
    context: Context,
  ): void {
    switch (context) {
      case "statement":
        this.readInStatementContext(at)
        return
      case "axis":
        this.readInAxisContext(at)
        return
      case "category":
        this.readInCategoryContext(at)
        return
      case "plot":
        this.readInPlotContext(at)
        return
      case "values":
        this.readInValuesContext(at)
        return
      case "string":
        this.readInStringContext(at)
        return
      case "title":
        this.readAccessibilityText(at, "acc-title-text")
        return
      case "description":
        this.readAccessibilityText(at, "acc-description-text")
        return
      case "description-block":
        this.readInDescriptionBlockContext(at)
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown context ${JSON.stringify(context satisfies never)}`,
        )
    }
  }

  /** diagrams/xychart.md, The statement context: rules 1 to 8, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readComment(at) ||
      this.readLineFeeds(at) ||
      this.readKeyword(at) ||
      this.readOpeningQuote(at) ||
      this.readCharacter(at, LEFT_SQUARE_BRACKET, "[") ||
      this.readCharacter(at, RIGHT_SQUARE_BRACKET, "]") ||
      this.readWord(at) ||
      this.readCharacter(at, COMMA, ",") ||
      this.readCharacter(at, SEMICOLON, ";") ||
      this.skipWhitespace(at)
    ) {
      return
    }
    throw this.noRuleMatches(at)
  }

  /**
   * The axis context: a line feed, a `;`, and a keyword end the statement,
   * which leaves the context, and are read in the context below, but for a
   * description block, which the statement context rules read on top of
   * it (see {@link XychartUnitLexer.endsStatement}); otherwise
   * rule 1, `[`, a `[` unit that enters the category context, rule 2,
   * `-->`, rule 3, a number, and then the rules of the statement context.
   */
  private readInAxisContext(at: DiagramCharacter): void {
    if (this.endsStatement(at)) {
      this.leave()
      return
    }
    if (
      this.readOpeningBracket(at, "category") ||
      this.readArrow(at) ||
      this.readNumber(at)
    ) {
      return
    }
    this.readInStatementContext(at)
  }

  /**
   * The category context: `]`, a `]` unit that leaves the context, and
   * then the rules of the statement context.
   */
  private readInCategoryContext(at: DiagramCharacter): void {
    if (this.readClosingBracket(at)) return
    this.readInStatementContext(at)
  }

  /**
   * The plot context: it ends with its statement as the axis context does,
   * and a description block does not end it; otherwise `[`, a `[` unit that enters the values context, and then the
   * rules of the statement context.
   */
  private readInPlotContext(at: DiagramCharacter): void {
    if (this.endsStatement(at)) {
      this.leave()
      return
    }
    if (this.readOpeningBracket(at, "values")) return
    this.readInStatementContext(at)
  }

  /**
   * The values context: `]`, a `]` unit that leaves the context, a number
   * as in the axis context, and then the rules of the statement context.
   */
  private readInValuesContext(at: DiagramCharacter): void {
    if (this.readClosingBracket(at) || this.readNumber(at)) return
    this.readInStatementContext(at)
  }

  /**
   * The axis and the plot contexts: whether the statement ends at `at`, at
   * a line feed, a `;`, or a keyword of the statement context, rule 3, but
   * for `accDescr` with `{`, whose description block context goes on top
   * of the context, which goes on after the `}`.
   */
  private endsStatement(at: DiagramCharacter): boolean {
    if (at.codePoint === LINE_FEED || at.codePoint === SEMICOLON) return true
    const keyword = this.keywordAt(at)
    return (
      keyword !== null &&
      !(
        keyword.kind === "accessibility" &&
        keyword.context === "description-block"
      )
    )
  }

  /**
   * The statement context, rule 1, and Comments: `%%` and the rest of its
   * line, up to and not including the line feed, a diagram comment whose
   * value is the source text after the mark.
   */
  private readComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== PERCENT_SIGN) return false
    const second = this.reader.after(at)
    if (second === null || second.codePoint !== PERCENT_SIGN) return false
    const lineFeed = lineFeedAfter(this.reader, second)
    this.comments.push({
      range: [at.start, lineFeed.start],
      mark: "%%",
      valueStart: second.end,
    })
    this.position = lineFeed
    return true
  }

  /** The statement context, rule 2: one or more line feeds, a `newline` unit. */
  private readLineFeeds(at: DiagramCharacter): boolean {
    if (at.codePoint !== LINE_FEED) return false
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint === LINE_FEED,
    )
    this.read("newline", at, end)
    return true
  }

  /**
   * The statement context, rule 3: a keyword, as
   * {@link XychartUnitLexer.keywordAt} finds it: the unit named by it, or
   * the header, which enters the context it names; an `orientation` unit;
   * or a unit named by an accessibility keyword and one named by its mark,
   * which enter its context.
   */
  private readKeyword(at: DiagramCharacter): boolean {
    const keyword = this.keywordAt(at)
    if (keyword === null) return false
    switch (keyword.kind) {
      case "word": {
        const unit = this.read(keyword.keyword.unit, at, keyword.end)
        if (keyword.keyword.enters !== null) {
          this.enter(keyword.keyword.enters, significantRangeOf(unit))
        }
        return true
      }
      case "orientation":
        this.read("orientation", at, keyword.end)
        return true
      case "accessibility": {
        const unit = this.addUnit(keyword.keyword, at, keyword.end)
        const { mark } = keyword
        this.read(
          mark.codePoint === COLON ? ":" : "{",
          mark,
          this.reader.after(mark),
        )
        this.enter(keyword.context, significantRangeOf(unit))
        return true
      }
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown keyword ${JSON.stringify(keyword satisfies never)}`,
        )
    }
  }

  /**
   * The statement context, rule 3: the keyword that starts at `at`, with
   * how to read it; null when none does. The keywords are, in order, those
   * of {@link WORD_KEYWORDS}, which no word character follows; `vertical`
   * and `horizontal`, which anything may follow; and `accTitle` or
   * `accDescr`, whitespace, line feeds included, and `:`, or `accDescr`,
   * whitespace, and `{`.
   */
  private keywordAt(at: DiagramCharacter): KeywordMatch | null {
    for (const keyword of WORD_KEYWORDS) {
      const match = matchWholeWordIgnoringCase(this.reader, at, keyword.word)
      if (match !== null) return { kind: "word", keyword, end: match.end }
    }
    for (const orientation of ORIENTATIONS) {
      const match = matchWordIgnoringCase(this.reader, at, orientation)
      if (match !== null) return { kind: "orientation", end: match.end }
    }
    return (
      this.accessibilityKeywordAt(at, "accTitle", COLON, "title") ??
      this.accessibilityKeywordAt(at, "accDescr", COLON, "description") ??
      this.accessibilityKeywordAt(
        at,
        "accDescr",
        LEFT_CURLY_BRACKET,
        "description-block",
      )
    )
  }

  /**
   * The statement context, rule 3: `keyword` (`accTitle` or `accDescr`) at
   * `at`, whitespace, line feeds included, and the mark `mark` (`:` or
   * `{`), which enter `context`; null when they are not there.
   */
  private accessibilityKeywordAt(
    at: DiagramCharacter,
    keyword: "accTitle" | "accDescr",
    mark: typeof COLON | typeof LEFT_CURLY_BRACKET,
    context: Context,
  ): KeywordMatch | null {
    const word = matchWordIgnoringCase(this.reader, at, keyword)
    if (word === null) return null
    const markAt = skipWhitespace(this.reader, word.end)
    if (markAt === null || markAt.codePoint !== mark) return null
    return {
      kind: "accessibility",
      keyword,
      end: word.end,
      mark: markAt,
      context,
    }
  }

  /**
   * The statement context, rule 4: `"` enters the string context, entered
   * at it, which reads the string from this `"` (see
   * {@link XychartUnitLexer.readInStringContext}).
   */
  private readOpeningQuote(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    this.enter("string", [at.start, at.end])
    return true
  }

  /** The statement context, rules 5 and 7: the character `codePoint`, a unit named `name`. */
  private readCharacter(
    at: DiagramCharacter,
    codePoint: number,
    name: "[" | "]" | "," | ";",
  ): boolean {
    if (at.codePoint !== codePoint) return false
    this.read(name, at, this.reader.after(at))
    return true
  }

  /**
   * The statement context, rule 6: one or more letters of ASCII, one or
   * more digits, or one of `-`, `_`, `.`, `+`, `=`, `*`, `&`, `#`: a `word`
   * unit.
   */
  private readWord(at: DiagramCharacter): boolean {
    if (isAsciiLetter(at.codePoint)) {
      const end = skipWhile(this.reader, at, (character) =>
        isAsciiLetter(character.codePoint),
      )
      this.read("word", at, end)
      return true
    }
    if (isAsciiDigit(at.codePoint)) {
      const end = skipWhile(this.reader, at, (character) =>
        isAsciiDigit(character.codePoint),
      )
      this.read("word", at, end)
      return true
    }
    if (WORD_PUNCTUATION.includes(at.codePoint)) {
      this.read("word", at, this.reader.after(at))
      return true
    }
    return false
  }

  /** The statement context, rule 8: one or more whitespace characters, line feeds included, nothing. */
  private skipWhitespace(at: DiagramCharacter): boolean {
    if (!isWhitespace(at.codePoint)) return false
    this.position = skipWhitespace(this.reader, at)
    return true
  }

  /** The axis and the plot contexts: `[`, a `[` unit that enters `context`, the category or the values context. */
  private readOpeningBracket(
    at: DiagramCharacter,
    context: "category" | "values",
  ): boolean {
    if (at.codePoint !== LEFT_SQUARE_BRACKET) return false
    const unit = this.read("[", at, this.reader.after(at))
    this.enter(context, significantRangeOf(unit))
    return true
  }

  /** The category and the values contexts: `]`, a `]` unit that leaves the context. */
  private readClosingBracket(at: DiagramCharacter): boolean {
    if (at.codePoint !== RIGHT_SQUARE_BRACKET) return false
    this.read("]", at, this.reader.after(at))
    this.leave()
    return true
  }

  /** The axis context, rule 2: `-->`, a `-->` unit. */
  private readArrow(at: DiagramCharacter): boolean {
    const match = matchWord(this.reader, at, "-->")
    if (match === null) return false
    this.read("-->", at, match.end)
    return true
  }

  /**
   * The axis context, rule 3, and the values context: a number, an
   * optional `+` or `-`, then digits with an optional `.` and digits, or
   * `.` and digits: a `number` unit.
   */
  private readNumber(at: DiagramCharacter): boolean {
    const afterSign =
      at.codePoint === PLUS_SIGN || at.codePoint === HYPHEN_MINUS
        ? this.reader.after(at)
        : at
    let end: DiagramPosition
    if (isDigitAt(afterSign)) {
      const afterDigits = this.afterDigits(afterSign)
      end = this.afterFraction(afterDigits) ?? afterDigits
    } else {
      const afterFraction = this.afterFraction(afterSign)
      if (afterFraction === null) return false
      end = afterFraction
    }
    this.read("number", at, end)
    return true
  }

  /** A number: the place after the digits from `position`, which is one. */
  private afterDigits(position: DiagramPosition): DiagramPosition {
    return skipWhile(this.reader, position, (character) =>
      isAsciiDigit(character.codePoint),
    )
  }

  /**
   * A number: the place after `.` and one or more digits at `position`;
   * null when they are not there.
   */
  private afterFraction(position: DiagramPosition): DiagramPosition | null {
    if (position === null || position.codePoint !== FULL_STOP) return null
    const digits = this.reader.after(position)
    return isDigitAt(digits) ? this.afterDigits(digits) : null
  }

  /**
   * diagrams/xychart.md, Strings: from the character after the opening
   * `"`, every character up to the next `"`, line feeds included, and that
   * `"`: a `string` unit from the opening `"` to the closing one, whose
   * text is what lies between them, empty for `""`; leaves the context.
   * When the text ends in the string, the content is read, and the error of
   * the end of the text is at the opening `"`.
   */
  private readInStringContext(at: DiagramCharacter): void {
    const opening = at
    let content = ""
    let position = this.reader.after(opening)
    while (position !== null && position.codePoint !== QUOTATION_MARK) {
      content += String.fromCodePoint(position.codePoint)
      position = this.reader.after(position)
    }
    if (position === null) {
      this.position = null
      return
    }
    this.addUnit(
      "string",
      opening,
      this.reader.after(position),
      "trim-whitespace",
      content,
    )
    this.position = this.reader.after(position)
    this.leave()
  }

  /**
   * Accessibility values: in the accessibility title context and the
   * accessibility description context, the whitespace after the `:`, line
   * feeds included, and then the rest of the line, a unit named `name`,
   * which leaves the context. When only whitespace follows to the end of
   * the text, there is no unit.
   */
  private readAccessibilityText(
    at: DiagramCharacter,
    name: "acc-title-text" | "acc-description-text",
  ): void {
    const start = skipWhitespace(this.reader, at)
    this.leave()
    if (start === null) {
      this.position = null
      return
    }
    const end = skipWhile(
      this.reader,
      start,
      (character) => character.codePoint !== LINE_FEED,
    )
    this.read(name, start, end)
  }

  /**
   * Accessibility values: in the description block context, the whitespace
   * after the `{` and then every character up to the next `}`, a
   * `description-block-text` unit, none when the `}` follows the
   * whitespace; then the `}`, a `}` unit, which leaves the context. Without
   * a `}`, the text runs to the end of the text.
   */
  private readInDescriptionBlockContext(at: DiagramCharacter): void {
    const start = skipWhitespace(this.reader, at)
    if (start === null) {
      this.position = null
      return
    }
    let closing: DiagramPosition = start
    if (start.codePoint !== RIGHT_CURLY_BRACKET) {
      closing = skipWhile(
        this.reader,
        start,
        (character) => character.codePoint !== RIGHT_CURLY_BRACKET,
      )
      this.read("description-block-text", start, closing)
    }
    if (closing === null) return
    this.read("}", closing, this.reader.after(closing))
    this.leave()
  }
}
