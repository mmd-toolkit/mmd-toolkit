import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
} from "../../character-classes.ts"
import {
  AMPERSAND,
  APOSTROPHE,
  ASTERISK,
  CHARACTER_TABULATION,
  COLON,
  COMMA,
  DIGIT_ONE,
  DIGIT_ZERO,
  DOLLAR_SIGN,
  EQUALS_SIGN,
  EXCLAMATION_MARK,
  FORM_FEED,
  FULL_STOP,
  GRAVE_ACCENT,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LEFT_SQUARE_BRACKET,
  LINE_FEED,
  LINE_SEPARATOR,
  LINE_TABULATION,
  LOW_LINE,
  NUMBER_SIGN,
  PARAGRAPH_SEPARATOR,
  PERCENT_SIGN,
  PLUS_SIGN,
  QUESTION_MARK,
  QUOTATION_MARK,
  REVERSE_SOLIDUS,
  RIGHT_CURLY_BRACKET,
  RIGHT_SQUARE_BRACKET,
  SEMICOLON,
  SOLIDUS,
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
import { readUnit, significantRangeOf } from "../../diagram-units.ts"
import type { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import {
  isCodePointAt,
  matchWholeWordIgnoringCase,
  matchWord,
  matchWordIgnoringCase,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"
import { UnitLexer } from "../../unit-lexer.ts"

/** diagrams/quadrant.md, Units and contexts: the names of the units. */
export type UnitName =
  // The statement context.
  | "newline"
  | "header"
  | "title"
  | "accTitle"
  | "accDescr"
  | "x-axis"
  | "y-axis"
  | "quadrant-1"
  | "quadrant-2"
  | "quadrant-3"
  | "quadrant-4"
  | "arrow"
  | "classDef"
  | ":::"
  | ":"
  | "["
  | "{"
  | "word"
  | "-"
  | ";"
  | "space"
  // The title context.
  | "title-text"
  // The accessibility contexts.
  | "acc-title-text"
  | "acc-description-text"
  | "description-block-text"
  | "}"
  // The string contexts.
  | "string"
  | "markdown-string"
  // The class name context.
  | "class-name"
  // The point context.
  | "coordinate"
  | ","
  | "]"

/** diagrams/quadrant.md, Units and contexts: one unit of the quadrant lexer. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/quadrant.md, Units and contexts: the contexts of the lexer. */
type Context =
  | "statement"
  | "title"
  | "acc-title"
  | "acc-description"
  | "description-block"
  | "string"
  | "markdown-string"
  | "class-name"
  | "point"

/**
 * Units and contexts: for each context, null when the text may end in it,
 * the statement and the title context; otherwise the message of the error
 * when the text ends in it, which says what is not closed.
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  statement: null,
  title: null,
  "acc-title": "accTitle has no text before the end of the text",
  "acc-description": "accDescr has no text before the end of the text",
  "description-block":
    "The description block has no } before the end of the text",
  string: 'The string has no closing " before the end of the text',
  "markdown-string":
    'The markdown string has no closing `" before the end of the text',
  "class-name": "::: has no class name before the end of the text",
  point: "The point has no ] before the end of the text",
}

/**
 * The statement context, rule 3: the keywords that the spaces before and
 * after them belong to and that anything may follow, in the order in which
 * they are tried.
 */
const SPACED_KEYWORDS: readonly (
  | "x-axis"
  | "y-axis"
  | "quadrant-1"
  | "quadrant-2"
  | "quadrant-3"
  | "quadrant-4"
)[] = [
  "x-axis",
  "y-axis",
  "quadrant-1",
  "quadrant-2",
  "quadrant-3",
  "quadrant-4",
]

/** The statement context, rule 8: the characters of ASCII that are a `word` unit each. */
const WORD_PUNCTUATION: readonly number[] = [
  EXCLAMATION_MARK,
  DOLLAR_SIGN,
  PERCENT_SIGN,
  AMPERSAND,
  APOSTROPHE,
  ASTERISK,
  PLUS_SIGN,
  COMMA,
  FULL_STOP,
  SOLIDUS,
  EQUALS_SIGN,
  QUESTION_MARK,
  REVERSE_SOLIDUS,
  LOW_LINE,
  NUMBER_SIGN,
  GRAVE_ACCENT,
]

/** The statement context, rule 9: the characters that are a unit named by their text. */
const CHARACTER_UNITS: Readonly<Partial<Record<number, "-" | ":" | ";">>> = {
  [HYPHEN_MINUS]: "-",
  [COLON]: ":",
  [SEMICOLON]: ";",
}

/** diagrams/quadrant.md, Lexical structure: what the lexer reads from the diagram text. */
export interface QuadrantLexing {
  readonly units: readonly Unit[]
  /** The diagram comments, in source order. */
  readonly comments: readonly DiagramComment[]
}

/**
 * Units and contexts, Whitespace: whether `codePoint` is whitespace of this
 * diagram type, a space, a tab, a vertical tab, or a form feed; the other
 * whitespace of Notation are characters of a word.
 */
function isQuadrantSpace(codePoint: number): boolean {
  return (
    codePoint === SPACE ||
    codePoint === CHARACTER_TABULATION ||
    codePoint === LINE_TABULATION ||
    codePoint === FORM_FEED
  )
}

/** The statement context, rule 8: whether `codePoint` is outside ASCII. */
function isOutsideAscii(codePoint: number): boolean {
  return codePoint > 0x7f
}

/** The class name context: whether `character` is a word character of ASCII, a letter, a digit, or `_`. */
function isClassNameCharacter(character: DiagramCharacter): boolean {
  return (
    isAsciiLetter(character.codePoint) ||
    isAsciiDigit(character.codePoint) ||
    character.codePoint === LOW_LINE
  )
}

/** The point context: whether `position` is a digit. */
function isDigitAt(position: DiagramPosition): boolean {
  return position !== null && isAsciiDigit(position.codePoint)
}

/**
 * diagrams/quadrant.md, Lexical structure: the lexer that divides the
 * diagram text into units and finds its diagram comments. It keeps a stack
 * of contexts and, at each place, applies the first rule of the current
 * context that matches. The rules are those of the specification, in its
 * order; each method that reads a context names the section it follows.
 * Letters of the keywords are compared case-insensitively.
 */
export class QuadrantUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "statement", END_OF_TEXT_MESSAGES)
  }

  /**
   * Divides the diagram text into units. Throws `ParseError` where no rule
   * matches and where the text ends in a context that may not end there.
   */
  public lex(): QuadrantLexing {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units, comments: this.comments }
  }

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`, whose token leaves out the whitespace at its
   * ends as `ends` says: by default the whitespace of ASCII only, since
   * U+00A0 and the other whitespace outside ASCII are characters of a word
   * that stand in a text and a name, at its ends too, while a title and an
   * accessibility text leave them out at their ends (Units and contexts,
   * Whitespace). Its text is those characters, or `text` when it is given.
   */
  protected override addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-ascii-whitespace",
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

  /**
   * The error for a place where no rule of the current context matches:
   * the character there, or, when only whitespace follows, so that the
   * text ends in the context, the error of the end of the text, as for
   * `:::` at the end of the text.
   */
  protected override noRuleMatches(at: DiagramCharacter): ParseError {
    const endOfText = this.endOfTextError()
    if (skipWhitespace(this.reader, at) === null && endOfText !== null) {
      return endOfText
    }
    return super.noRuleMatches(at)
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
      case "title":
        this.readInTitleContext(at)
        return
      case "acc-title":
        this.readAccessibilityText(at, "acc-title-text")
        return
      case "acc-description":
        this.readAccessibilityText(at, "acc-description-text")
        return
      case "description-block":
        this.readInDescriptionBlockContext(at)
        return
      case "string":
        this.readInStringContext(at)
        return
      case "markdown-string":
        this.readInMarkdownStringContext(at)
        return
      case "class-name":
        this.readInClassNameContext(at)
        return
      case "point":
        this.readInPointContext(at)
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown context ${JSON.stringify(context satisfies never)}`,
        )
    }
  }

  /** diagrams/quadrant.md, The statement context: rules 1 to 10, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readComment(at) ||
      this.readLineFeeds(at) ||
      this.readKeyword(at) ||
      this.readOpeningQuote(at) ||
      this.readClassMarker(at) ||
      this.readPointOpening(at) ||
      this.readHeader(at) ||
      this.readWord(at) ||
      this.readCharacter(at) ||
      this.readSpace(at)
    ) {
      return
    }
    throw this.noRuleMatches(at)
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
   * The statement context, rule 3: a keyword, compared case-insensitively:
   * `title`; `accTitle` or `accDescr` and `:`, or `accDescr` and `{`; a
   * keyword of {@link SPACED_KEYWORDS} or the arrow, with the spaces around
   * it; or `classDef`.
   */
  private readKeyword(at: DiagramCharacter): boolean {
    return (
      this.readTitle(at) ||
      this.readAccessibilityKeyword(at, "accTitle", COLON, "acc-title") ||
      this.readAccessibilityKeyword(at, "accDescr", COLON, "acc-description") ||
      this.readAccessibilityKeyword(
        at,
        "accDescr",
        LEFT_CURLY_BRACKET,
        "description-block",
      ) ||
      this.readSpacedKeyword(at) ||
      this.readArrow(at) ||
      this.readClassDef(at)
    )
  }

  /** The statement context, rule 3: `title`, not followed by a word character, a `title` unit, which enters the title context. */
  private readTitle(at: DiagramCharacter): boolean {
    const match = matchWholeWordIgnoringCase(this.reader, at, "title")
    if (match === null) return false
    const unit = this.read("title", at, match.end)
    this.enter("title", significantRangeOf(unit))
    return true
  }

  /**
   * The statement context, rule 3: `keyword` (`accTitle` or `accDescr`),
   * whitespace of Notation, line feeds and U+00A0 included, and the mark
   * `mark` (`:` or `{`): a
   * unit named by the keyword and one named by the mark, which enter
   * `context`.
   */
  private readAccessibilityKeyword(
    at: DiagramCharacter,
    keyword: "accTitle" | "accDescr",
    mark: typeof COLON | typeof LEFT_CURLY_BRACKET,
    context: Context,
  ): boolean {
    const word = matchWordIgnoringCase(this.reader, at, keyword)
    if (word === null) return false
    const markAt = skipWhitespace(this.reader, word.end)
    if (markAt === null || markAt.codePoint !== mark) return false
    const unit = this.addUnit(keyword, at, word.end)
    this.read(mark === COLON ? ":" : "{", markAt, this.reader.after(markAt))
    this.enter(context, significantRangeOf(unit))
    return true
  }

  /**
   * The statement context, rule 3: a keyword of {@link SPACED_KEYWORDS},
   * with the spaces (U+0020) before and after it, followed by anything: the
   * unit named by the keyword.
   */
  private readSpacedKeyword(at: DiagramCharacter): boolean {
    const start = this.afterSpaces(at)
    for (const keyword of SPACED_KEYWORDS) {
      const match = matchWordIgnoringCase(this.reader, start, keyword)
      if (match !== null) {
        this.read(keyword, at, this.afterSpaces(match.end))
        return true
      }
    }
    return false
  }

  /**
   * The statement context, rule 3: two or more `-` and `>`, with the spaces
   * before and after them: an `arrow` unit.
   */
  private readArrow(at: DiagramCharacter): boolean {
    const start = this.afterSpaces(at)
    if (start === null || start.codePoint !== HYPHEN_MINUS) return false
    const second = this.reader.after(start)
    if (second === null || second.codePoint !== HYPHEN_MINUS) return false
    const head = skipWhile(
      this.reader,
      second,
      (character) => character.codePoint === HYPHEN_MINUS,
    )
    if (head === null || head.codePoint !== GREATER_THAN_SIGN) return false
    this.read("arrow", at, this.afterSpaces(this.reader.after(head)))
    return true
  }

  /** The statement context, rule 3: `classDef`, not followed by a word character, a `classDef` unit. */
  private readClassDef(at: DiagramCharacter): boolean {
    const match = matchWholeWordIgnoringCase(this.reader, at, "classDef")
    if (match === null) return false
    this.read("classDef", at, match.end)
    return true
  }

  /**
   * The statement context, rule 4: `"` followed by a backquote enters the
   * markdown string context, and `"` the string context, entered at it,
   * which read the string from this `"`.
   */
  private readOpeningQuote(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const context = isCodePointAt(this.reader.after(at), GRAVE_ACCENT)
      ? "markdown-string"
      : "string"
    this.enter(context, [at.start, at.end])
    return true
  }

  /** The statement context, rule 5: `:::`, a `:::` unit, which enters the class name context. */
  private readClassMarker(at: DiagramCharacter): boolean {
    const match = matchWord(this.reader, at, ":::")
    if (match === null) return false
    const unit = this.read(":::", at, match.end)
    this.enter("class-name", significantRangeOf(unit))
    return true
  }

  /**
   * The statement context, rule 6, and The point context: whitespace of
   * Notation, line feeds and U+00A0 included, then `:`, whitespace of
   * Notation, and `[`: a `:` unit and a `[` unit, which enter the point
   * context.
   */
  private readPointOpening(at: DiagramCharacter): boolean {
    const colon = skipWhitespace(this.reader, at)
    if (colon === null || colon.codePoint !== COLON) return false
    const bracket = skipWhitespace(this.reader, this.reader.after(colon))
    if (bracket === null || bracket.codePoint !== LEFT_SQUARE_BRACKET) {
      return false
    }
    this.addUnit(":", colon, this.reader.after(colon))
    const unit = this.read("[", bracket, this.reader.after(bracket))
    this.enter("point", significantRangeOf(unit))
    return true
  }

  /** The statement context, rule 7: `quadrantChart`, with the spaces before and after it, the header. */
  private readHeader(at: DiagramCharacter): boolean {
    const match = matchWordIgnoringCase(
      this.reader,
      this.afterSpaces(at),
      "quadrantChart",
    )
    if (match === null) return false
    this.read("header", at, this.afterSpaces(match.end))
    return true
  }

  /**
   * The statement context, rule 8: one or more letters of ASCII, one or
   * more characters outside ASCII, one or more digits, or one character of
   * {@link WORD_PUNCTUATION}: a `word` unit.
   */
  private readWord(at: DiagramCharacter): boolean {
    for (const isRunCharacter of [
      isAsciiLetter,
      isOutsideAscii,
      isAsciiDigit,
    ]) {
      if (isRunCharacter(at.codePoint)) {
        const end = skipWhile(this.reader, at, (character) =>
          isRunCharacter(character.codePoint),
        )
        this.read("word", at, end)
        return true
      }
    }
    if (!WORD_PUNCTUATION.includes(at.codePoint)) return false
    this.read("word", at, this.reader.after(at))
    return true
  }

  /** The statement context, rule 9: `-`, `:`, or `;`, a unit of that character. */
  private readCharacter(at: DiagramCharacter): boolean {
    const name = CHARACTER_UNITS[at.codePoint]
    if (name === undefined) return false
    this.read(name, at, this.reader.after(at))
    return true
  }

  /** The statement context, rule 10: one whitespace character other than a line feed, a `space` unit. */
  private readSpace(at: DiagramCharacter): boolean {
    if (!isQuadrantSpace(at.codePoint)) return false
    this.read("space", at, this.reader.after(at))
    return true
  }

  /** The place after the spaces (U+0020) from `position`. */
  private afterSpaces(position: DiagramPosition): DiagramPosition {
    return skipWhile(
      this.reader,
      position,
      (character) => character.codePoint === SPACE,
    )
  }

  /**
   * The title context: the rest of the line, a `title-text` unit, none when
   * the line ends after the keyword; leaves the context. Its token leaves
   * out the whitespace of Notation at its ends, U+00A0 included
   * (ast/quadrant.md, QuadrantTitleStatement).
   */
  private readInTitleContext(at: DiagramCharacter): void {
    this.leave()
    if (at.codePoint === LINE_FEED) return
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== LINE_FEED,
    )
    this.read("title-text", at, end, "trim-whitespace")
  }

  /**
   * Accessibility values: in the accessibility title context and the
   * accessibility description context, the whitespace of Notation after
   * the `:`, line feeds and U+00A0 included, and then the rest of the line,
   * a unit named `name`, which leaves the context. Its token leaves out the
   * whitespace of Notation at its ends (ast/quadrant.md,
   * QuadrantAccTitleStatement). When only whitespace follows to the end of
   * the text, the text ends in the context.
   */
  private readAccessibilityText(
    at: DiagramCharacter,
    name: "acc-title-text" | "acc-description-text",
  ): void {
    const start = skipWhitespace(this.reader, at)
    if (start === null) {
      this.position = null
      return
    }
    const end = skipWhile(
      this.reader,
      start,
      (character) => character.codePoint !== LINE_FEED,
    )
    this.read(name, start, end, "trim-whitespace")
    this.leave()
  }

  /**
   * Accessibility values: in the description block context, the whitespace
   * of Notation after the `{`, line feeds and U+00A0 included, and then
   * every character up to the next `}`, a `description-block-text` unit,
   * none when only whitespace lies between, whose token leaves out the
   * whitespace of Notation at its ends (ast/quadrant.md,
   * QuadrantAccDescrBlockStatement); then the `}`, a `}` unit, which leaves
   * the context.
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
      this.read("description-block-text", start, closing, "trim-whitespace")
    }
    if (closing === null) return
    this.read("}", closing, this.reader.after(closing))
    this.leave()
  }

  /**
   * diagrams/quadrant.md, Strings: from the opening `"` at `at`, every
   * character up to the next `"`, line feeds included, and that `"`: a
   * `string` unit from the opening `"` to the closing one, whose text is
   * what lies between them; leaves the context. When the text ends in the
   * string, the content is read, and the error of the end of the text is at
   * the opening `"`.
   */
  private readInStringContext(at: DiagramCharacter): void {
    let content = ""
    let position = this.reader.after(at)
    while (position !== null && position.codePoint !== QUOTATION_MARK) {
      content += String.fromCodePoint(position.codePoint)
      position = this.reader.after(position)
    }
    if (position === null) {
      this.position = null
      return
    }
    const end = this.reader.after(position)
    this.addUnit("string", at, end, "trim-ascii-whitespace", content)
    this.position = end
    this.leave()
  }

  /**
   * diagrams/quadrant.md, Strings: from the opening `"` at `at` and the
   * backquote after it, every character up to the next backquote, which a
   * `"` must follow: a `markdown-string` unit from the opening `"` to the
   * closing one, whose text is what lies between the backquotes; leaves the
   * context. A `"` before the closing backquote, and a closing backquote
   * that no `"` follows, are read by no rule.
   */
  private readInMarkdownStringContext(at: DiagramCharacter): void {
    let content = ""
    const backquote = this.reader.after(at)
    let position = backquote === null ? null : this.reader.after(backquote)
    while (position !== null && position.codePoint !== GRAVE_ACCENT) {
      if (position.codePoint === QUOTATION_MARK) {
        throw this.noRuleMatches(position)
      }
      content += String.fromCodePoint(position.codePoint)
      position = this.reader.after(position)
    }
    if (position === null) {
      this.position = null
      return
    }
    const quote = this.reader.after(position)
    if (quote === null) {
      this.position = null
      return
    }
    if (quote.codePoint !== QUOTATION_MARK) throw this.noRuleMatches(quote)
    const end = this.reader.after(quote)
    this.addUnit("markdown-string", at, end, "trim-ascii-whitespace", content)
    this.position = end
    this.leave()
  }

  /**
   * diagrams/quadrant.md, The class name context: one or more word
   * characters of ASCII, a `class-name` unit, which leaves the context.
   */
  private readInClassNameContext(at: DiagramCharacter): void {
    if (!isClassNameCharacter(at)) throw this.noRuleMatches(at)
    this.read(
      "class-name",
      at,
      skipWhile(this.reader, at, isClassNameCharacter),
    )
    this.leave()
  }

  /**
   * diagrams/quadrant.md, The point context: whitespace of Notation, line
   * feeds and U+00A0 included, nothing; a coordinate, a `coordinate` unit; `,`, a `,` unit;
   * and `]` with the spaces after it, a `]` unit, which leaves the context.
   */
  private readInPointContext(at: DiagramCharacter): void {
    if (isWhitespace(at.codePoint)) {
      this.position = skipWhitespace(this.reader, at)
      return
    }
    if (this.readCoordinate(at)) return
    if (at.codePoint === COMMA) {
      this.read(",", at, this.reader.after(at))
      return
    }
    if (at.codePoint === RIGHT_SQUARE_BRACKET) {
      this.read("]", at, this.afterSpaces(this.reader.after(at)))
      this.leave()
      return
    }
    throw this.noRuleMatches(at)
  }

  /**
   * The point context: a coordinate, `1`, or `0` optionally followed by one
   * character other than a line feed, U+2028, and U+2029, and one or more
   * digits: a `coordinate` unit.
   */
  private readCoordinate(at: DiagramCharacter): boolean {
    if (at.codePoint === DIGIT_ONE) {
      this.read("coordinate", at, this.reader.after(at))
      return true
    }
    if (at.codePoint !== DIGIT_ZERO) return false
    const separator = this.reader.after(at)
    const digits = separator === null ? null : this.reader.after(separator)
    const fraction =
      separator !== null &&
      separator.codePoint !== LINE_FEED &&
      separator.codePoint !== LINE_SEPARATOR &&
      separator.codePoint !== PARAGRAPH_SEPARATOR &&
      isDigitAt(digits)
    const end = fraction
      ? skipWhile(this.reader, digits, (character) =>
          isAsciiDigit(character.codePoint),
        )
      : separator
    this.read("coordinate", at, end)
    return true
  }
}
