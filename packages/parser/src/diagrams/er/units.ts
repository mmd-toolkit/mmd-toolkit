import type { Range } from "../../ast.ts"
import type { ErCardinality, ErRelationshipLine } from "../../ast/er.ts"
import {
  isAsciiDigit,
  isAsciiLetter,
  isLineSegmentSeparator,
  isOutsideAscii,
  isWhitespace,
  isWordCharacter,
} from "../../character-classes.ts"
import {
  APOSTROPHE,
  ASTERISK,
  BACKSPACE,
  CHARACTER_TABULATION,
  COLON,
  COMMA,
  DIGIT_ONE,
  FULL_STOP,
  GRAVE_ACCENT,
  HYPHEN_MINUS,
  LATIN_CAPITAL_LETTER_A_WITH_GRAVE,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  LINE_FEED,
  LINE_TABULATION,
  LOW_LINE,
  PERCENT_SIGN,
  QUESTION_MARK,
  QUOTATION_MARK,
  REVERSE_SOLIDUS,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
  RIGHT_SQUARE_BRACKET,
  SPACE,
  TILDE,
  VERTICAL_LINE,
} from "../../code-points.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import { readUnit, significantRangeOf } from "../../diagram-units.ts"
import { DirectionLineRule } from "../../direction-line.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import { UnitLexer } from "../../unit-lexer.ts"
import {
  isCodePointAt,
  isWordCharacterAt,
  matchSpacedWords,
  matchWholeWordIgnoringCase,
  matchWord,
  matchWordIgnoringCase,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"

/** diagrams/er.md, Units and contexts: the names of the units. */
export type UnitName =
  // The statement context.
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "direction-text"
  | "direction"
  | "direction-value"
  | "newline"
  | "quoted-name"
  | "string"
  | "header"
  | "#"
  | ","
  | ":::"
  | "["
  | "]"
  | "style"
  | "classDef"
  | "class"
  | "subgraph"
  | "end"
  | ErCardinality
  | ErRelationshipLine
  | "number"
  | "name"
  | "invalid"
  // The attribute block context.
  | "key"
  | "tilde-word"
  | "word"
  | "backquoted-word"
  | "empty-backquotes"
  | "comment-string"
  | "}"
  | "?"
  // The style context.
  | "style-text"
  | ";"
  // The accessibility contexts.
  | "title-text"
  | "description-text"
  | "description-block-text"

/** diagrams/er.md, Units and contexts: one unit of the ER lexer. */
export interface Unit extends DiagramUnit<UnitName> {
  /**
   * The cardinalities, numbers, and lines: for a cardinality or a line
   * unit, whether it is written with a word (`one or more`, `many(0)`,
   * `to`, `u`) rather than with symbols (`|o`, `1+`, `--`); null for every
   * other unit. `docs/tokens/er.md`, Tokens, gives the two their kinds.
   */
  readonly writtenAsWord: boolean | null
}

/** diagrams/er.md, Units and contexts: the contexts of the lexer. */
type Context =
  | "statement"
  | "attribute-block"
  | "style"
  | "title"
  | "description"
  | "description-block"

/**
 * Units and contexts: for each context, null when the text may end in it,
 * the statement context only; otherwise the message of the error when the
 * text ends in it, which says what is not closed. The style context is
 * left by the `newline` unit of the line feed that the lexer reads after
 * the last character, unless whitespace takes that line feed (rule 2).
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  statement: null,
  "attribute-block": "The attribute block has no } before the end of the text",
  style:
    "The classDef or style statement has no line feed before the end of the text",
  title: "accTitle has no text before the end of the text",
  description: "accDescr has no text before the end of the text",
  "description-block":
    "The description block has no } before the end of the text",
}

/** The direction line: the values, in the order in which they are tried. */
const DIRECTION_LINE_VALUES: readonly string[] = ["TB", "BT", "RL", "LR"]

/** The attribute block context, rule 2: the keys. */
const KEYS: readonly string[] = ["PK", "FK", "UK"]

/** The units of a relationship, the cardinalities and the lines (rule 22). */
export const RELATIONSHIP_UNITS: readonly UnitName[] = [
  "zero-or-one",
  "zero-or-more",
  "one-or-more",
  "only-one",
  "md-parent",
  "identifying",
  "non-identifying",
]

/**
 * One spelling of a cardinality or a line that rule 22 tries: a keyword of
 * one or more words, or a run of characters, compared case-insensitively,
 * with no word character after it where `wordBoundary` holds, and written
 * with a word (`many(0)`) or with symbols (`|o`) as `writtenAsWord` says.
 */
type Spelling =
  | { readonly words: readonly string[] }
  | {
      readonly characters: string
      readonly wordBoundary: boolean
      readonly writtenAsWord: boolean
    }

/**
 * The cardinalities, numbers, and lines: rules 1 to 9 of rule 22, in order,
 * each with the unit that it makes. Rules 10 to 13 read numbers, and rules
 * 14 to 16 come after them ({@link LATE_SPELLINGS}).
 */
const EARLY_SPELLINGS: readonly [Spelling, UnitName][] = [
  [{ words: ["one", "or", "zero"] }, "zero-or-one"],
  [{ words: ["one", "or", "more"] }, "one-or-more"],
  [{ words: ["one", "or", "many"] }, "one-or-more"],
  [
    { characters: "1+", wordBoundary: false, writtenAsWord: false },
    "one-or-more",
  ],
  [
    { characters: "|o", wordBoundary: true, writtenAsWord: false },
    "zero-or-one",
  ],
  [{ words: ["zero", "or", "one"] }, "zero-or-one"],
  [{ words: ["zero", "or", "more"] }, "zero-or-more"],
  [{ words: ["zero", "or", "many"] }, "zero-or-more"],
  [
    { characters: "0+", wordBoundary: false, writtenAsWord: false },
    "zero-or-more",
  ],
  [
    { characters: "}o", wordBoundary: true, writtenAsWord: false },
    "zero-or-more",
  ],
  [
    { characters: "many(0)", wordBoundary: false, writtenAsWord: true },
    "zero-or-more",
  ],
  [
    { characters: "many(1)", wordBoundary: false, writtenAsWord: true },
    "one-or-more",
  ],
  [{ words: ["many"] }, "zero-or-more"],
  [
    { characters: "}|", wordBoundary: false, writtenAsWord: false },
    "one-or-more",
  ],
  [{ words: ["one"] }, "only-one"],
  [{ words: ["only", "one"] }, "only-one"],
]

/**
 * The cardinalities, numbers, and lines: rule 14 of rule 22, after the
 * numbers; rule 15, `md-parent`, follows it
 * ({@link ErUnitLexer.readMdParent}), and rule 16 after that
 * ({@link LINE_SPELLINGS}).
 */
const SYMBOL_CARDINALITIES: readonly [Spelling, UnitName][] = [
  [{ characters: "||", wordBoundary: false, writtenAsWord: false }, "only-one"],
  [
    { characters: "o|", wordBoundary: false, writtenAsWord: false },
    "zero-or-one",
  ],
  [
    { characters: "o{", wordBoundary: false, writtenAsWord: false },
    "zero-or-more",
  ],
  [
    { characters: "|{", wordBoundary: false, writtenAsWord: false },
    "one-or-more",
  ],
]

/** Rule 16: the lines, in order. */
const LINE_SPELLINGS: readonly [Spelling, UnitName][] = [
  [
    { characters: "..", wordBoundary: false, writtenAsWord: false },
    "non-identifying",
  ],
  [
    { characters: "--", wordBoundary: false, writtenAsWord: false },
    "identifying",
  ],
  [{ words: ["to"] }, "identifying"],
  [{ words: ["optionally", "to"] }, "non-identifying"],
  [
    { characters: ".-", wordBoundary: false, writtenAsWord: false },
    "non-identifying",
  ],
  [
    { characters: "-.", wordBoundary: false, writtenAsWord: false },
    "non-identifying",
  ],
]

/** Rule 11: the lines that may follow a `1` directly, which make it `only-one`. */
const LINES_AFTER_ONE: readonly string[] = ["--", "..", ".-", "-."]

/** diagrams/er.md, Lexical structure: what the lexer reads from the diagram text. */
export interface ErLexing {
  readonly units: readonly Unit[]
}

/**
 * Names: whether `codePoint` is a character of a name in the statement
 * context: a character outside ASCII, a word character, `-`, `*`, or `.`.
 */
function isNameCharacter(codePoint: number): boolean {
  return (
    isOutsideAscii(codePoint) ||
    isWordCharacter(codePoint) ||
    codePoint === HYPHEN_MINUS ||
    codePoint === ASTERISK ||
    codePoint === FULL_STOP
  )
}

/**
 * The attribute block context, rule 4: whether `codePoint` may start a
 * word: `*`, an ASCII letter, `_`, or a character from U+00C0 on.
 */
function startsWord(codePoint: number): boolean {
  return (
    codePoint === ASTERISK ||
    isAsciiLetter(codePoint) ||
    codePoint === LOW_LINE ||
    codePoint >= LATIN_CAPITAL_LETTER_A_WITH_GRAVE
  )
}

/**
 * The attribute block context, rule 4: whether `codePoint` may follow the
 * first character of a word: an ASCII letter, an ASCII digit, `-`, `_`,
 * `[`, `]`, `(`, `)`, `.`, `,`, `*`, or a character from U+00C0 on.
 */
function continuesWord(codePoint: number): boolean {
  return (
    isAsciiLetter(codePoint) ||
    isAsciiDigit(codePoint) ||
    codePoint === HYPHEN_MINUS ||
    codePoint === LOW_LINE ||
    codePoint === LEFT_SQUARE_BRACKET ||
    codePoint === RIGHT_SQUARE_BRACKET ||
    codePoint === LEFT_PARENTHESIS ||
    codePoint === RIGHT_PARENTHESIS ||
    codePoint === FULL_STOP ||
    codePoint === COMMA ||
    codePoint === ASTERISK ||
    codePoint >= LATIN_CAPITAL_LETTER_A_WITH_GRAVE
  )
}

/**
 * The style context, rule 6: whether `codePoint` is a character of a
 * `style-text` unit: a character outside ASCII, a word character, `-`, or
 * `*`.
 */
function isStyleTextCharacter(codePoint: number): boolean {
  return (
    isOutsideAscii(codePoint) ||
    isWordCharacter(codePoint) ||
    codePoint === HYPHEN_MINUS ||
    codePoint === ASTERISK
  )
}

/**
 * The statement context, rule 7: whether `codePoint` may lie inside a
 * quoted name: any character other than `"`, `%`, line feed, U+000B,
 * U+0008, and `\`.
 */
function mayBeInQuotedName(codePoint: number): boolean {
  return (
    codePoint !== QUOTATION_MARK &&
    codePoint !== PERCENT_SIGN &&
    codePoint !== LINE_FEED &&
    codePoint !== LINE_TABULATION &&
    codePoint !== BACKSPACE &&
    codePoint !== REVERSE_SOLIDUS
  )
}

/** The attribute block context, rule 3: whether `character` ends a line segment: a line feed, U+2028, or U+2029. */
function endsLineSegment(character: DiagramCharacter): boolean {
  return (
    character.codePoint === LINE_FEED ||
    isLineSegmentSeparator(character.codePoint)
  )
}

/**
 * diagrams/er.md, Lexical structure: the lexer that divides the diagram
 * text into units. It keeps a stack of contexts and, at each place,
 * applies the first rule of the current context that matches. The rules
 * are those of the specification, in its order; each method that reads a
 * context names the section it follows. Letters are compared
 * case-insensitively.
 */
export class ErUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  /** The statement context, rule 4: the direction line, with the values of ER. */
  private readonly directionLine: DirectionLineRule

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "statement", END_OF_TEXT_MESSAGES)
    this.directionLine = new DirectionLineRule(
      reader,
      DIRECTION_LINE_VALUES,
      matchWordIgnoringCase,
    )
  }

  /**
   * Divides the diagram text into units. Throws `ParseError` where no rule
   * matches and where the text ends in a context that may not end there.
   */
  public lex(): ErLexing {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units }
  }

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`, whose token leaves out the whitespace at its
   * ends as `ends` says.
   */
  protected override addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
    writtenAsWord: boolean | null = null,
  ): Unit {
    const unit: Unit = {
      ...readUnit(this.reader, name, this.units.length, from, to, null, ends),
      writtenAsWord,
    }
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
      case "attribute-block":
        this.readInAttributeBlockContext(at)
        return
      case "style":
        this.readInStyleContext(at)
        return
      case "title":
        this.readRestOfLine(at, "title-text")
        return
      case "description":
        this.readRestOfLine(at, "description-text")
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

  /** diagrams/er.md, The statement context: rules 1 to 24, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readAccessibilityKeyword(at, "accTitle", ":", "title") ||
      this.readAccessibilityKeyword(at, "accDescr", ":", "description") ||
      this.readAccessibilityKeyword(at, "accDescr", "{", "description-block") ||
      this.readDirectionLine(at) ||
      this.skipSpacesAndTabs(at) ||
      this.readLineFeeds(at) ||
      this.readQuotedName(at) ||
      this.readString(at) ||
      this.readKeyword(at, "erDiagram", "header") ||
      this.readOpeningBrace(at) ||
      this.readCharacters(at, "#", "#") ||
      this.readCharacters(at, ",", ",") ||
      this.readCharacters(at, ":::", ":::") ||
      this.readCharacters(at, ":", ":") ||
      this.readCharacters(at, "[", "[") ||
      this.readCharacters(at, "]", "]") ||
      this.readStyleKeyword(at, "style", "style") ||
      this.readStyleKeyword(at, "classDef", "classDef") ||
      this.readKeyword(at, "class", "class") ||
      this.readKeyword(at, "subgraph", "subgraph") ||
      this.readEnd(at) ||
      this.readRelationshipUnit(at) ||
      this.readName(at)
    ) {
      return
    }
    // Rule 24: any other character other than a line feed.
    this.read("invalid", at, this.reader.after(at))
  }

  /**
   * The statement context, rules 1 to 3: `keyword` (`accTitle` or
   * `accDescr`), zero or more whitespace characters, line feeds included,
   * `mark` (`:` or `{`), and zero or more whitespace characters, line feeds
   * included: a unit named by the keyword and one named by the mark; enters
   * `context`.
   */
  private readAccessibilityKeyword(
    at: DiagramCharacter,
    keyword: "accTitle" | "accDescr",
    mark: ":" | "{",
    context: Context,
  ): boolean {
    const word = matchWordIgnoringCase(this.reader, at, keyword)
    if (word === null) return false
    const markAt = skipWhitespace(this.reader, word.end)
    const markCodePoint = mark === ":" ? COLON : LEFT_CURLY_BRACKET
    if (!isCodePointAt(markAt, markCodePoint)) return false
    const keywordUnit = this.addUnit(keyword, at, word.end)
    const afterMark = this.reader.after(markAt)
    this.addUnit(mark, markAt, afterMark)
    this.position = skipWhitespace(this.reader, afterMark)
    this.enter(context, significantRangeOf(keywordUnit))
    return true
  }

  /** The statement context, rule 4: a direction line (see `DirectionLineRule`). */
  private readDirectionLine(at: DiagramCharacter): boolean {
    const line = this.directionLine.match(at)
    if (line === null) return false
    for (const unit of line.units) this.addUnit(unit.name, unit.from, unit.to)
    this.position = line.end
    return true
  }

  /** The statement context, rule 5: one or more spaces or tabs, nothing. */
  private skipSpacesAndTabs(at: DiagramCharacter): boolean {
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        character.codePoint === SPACE ||
        character.codePoint === CHARACTER_TABULATION,
    )
    if (samePosition(end, at)) return false
    this.position = end
    return true
  }

  /** The statement context, rule 6, and the style context, rule 1: one or more line feeds, a `newline` unit. */
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
   * The statement context, rule 7: `"`, one or more characters other than
   * `"`, `%`, line feed, U+000B, U+0008, and `\`, and `"`: a `quoted-name`
   * unit.
   */
  private readQuotedName(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const contentStart = this.reader.after(at)
    const closing = skipWhile(this.reader, contentStart, (character) =>
      mayBeInQuotedName(character.codePoint),
    )
    if (
      samePosition(closing, contentStart) ||
      !isCodePointAt(closing, QUOTATION_MARK)
    ) {
      return false
    }
    this.read("quoted-name", at, this.reader.after(closing))
    return true
  }

  /**
   * The statement context, rule 8: `"`, zero or more characters other than
   * `"`, line feeds included, and `"`: a `string` unit, which may be empty.
   */
  private readString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const closing = skipWhile(
      this.reader,
      this.reader.after(at),
      (character) => character.codePoint !== QUOTATION_MARK,
    )
    if (closing === null) return false
    this.read("string", at, this.reader.after(closing))
    return true
  }

  /**
   * The keyword `word`, compared case-insensitively and not followed by a
   * word character: a unit named `name`.
   */
  private readKeyword(
    at: DiagramCharacter,
    word: string,
    name: UnitName,
  ): boolean {
    const match = matchWholeWordIgnoringCase(this.reader, at, word)
    if (match === null) return false
    this.read(name, at, match.end)
    return true
  }

  /** The statement context, rule 10: `{`, a `{` unit; enters the attribute block context. */
  private readOpeningBrace(at: DiagramCharacter): boolean {
    if (at.codePoint !== LEFT_CURLY_BRACKET) return false
    const brace = this.read("{", at, this.reader.after(at))
    this.enter("attribute-block", significantRangeOf(brace))
    return true
  }

  /** The characters of `characters`, as written: a unit named `name`. */
  private readCharacters(
    at: DiagramCharacter,
    characters: string,
    name: UnitName,
  ): boolean {
    const match = matchWord(this.reader, at, characters)
    if (match === null) return false
    this.read(name, at, match.end)
    return true
  }

  /** The statement context, rules 17 and 18: the keyword `style` or `classDef`; enters the style context. */
  private readStyleKeyword(
    at: DiagramCharacter,
    word: string,
    name: "style" | "classDef",
  ): boolean {
    const match = matchWholeWordIgnoringCase(this.reader, at, word)
    if (match === null) return false
    const keyword = this.read(name, at, match.end)
    this.enter("style", significantRangeOf(keyword))
    return true
  }

  /**
   * The statement context, rule 21: the keyword `end` and zero or more
   * whitespace characters, line feeds included: an `end` unit, whose token
   * leaves the whitespace out.
   */
  private readEnd(at: DiagramCharacter): boolean {
    const match = matchWholeWordIgnoringCase(this.reader, at, "end")
    if (match === null) return false
    this.read("end", at, skipWhitespace(this.reader, match.end))
    return true
  }

  /**
   * The statement context, rule 22: the cardinalities, numbers, and lines,
   * rules 1 to 16 in order.
   */
  private readRelationshipUnit(at: DiagramCharacter): boolean {
    for (const [spelling, name] of EARLY_SPELLINGS) {
      if (this.readSpelling(at, spelling, name)) return true
    }
    if (this.readNumber(at)) return true
    for (const [spelling, name] of SYMBOL_CARDINALITIES) {
      if (this.readSpelling(at, spelling, name)) return true
    }
    if (this.readMdParent(at)) return true
    for (const [spelling, name] of LINE_SPELLINGS) {
      if (this.readSpelling(at, spelling, name)) return true
    }
    return false
  }

  /**
   * One spelling of a cardinality or a line: a keyword of one or more
   * words, each compared case-insensitively, with one space between two
   * words and no word character after the last, which is written with a
   * word; or characters, as {@link Spelling} says.
   */
  private readSpelling(
    at: DiagramCharacter,
    spelling: Spelling,
    name: UnitName,
  ): boolean {
    if ("words" in spelling) {
      const words = matchSpacedWords(
        this.reader,
        at,
        spelling.words,
        matchWordIgnoringCase,
      )
      const last = words?.at(-1)
      if (last === undefined) return false
      this.readRelationship(name, at, last.end, true)
      return true
    }
    const match = matchWordIgnoringCase(this.reader, at, spelling.characters)
    if (match === null) return false
    if (spelling.wordBoundary && isWordCharacterAt(match.end)) return false
    this.readRelationship(name, at, match.end, spelling.writtenAsWord)
    return true
  }

  /** Reads a cardinality or a line unit named `name`, from `at` up to `to`, written with a word or not. */
  private readRelationship(
    name: UnitName,
    at: DiagramCharacter,
    to: DiagramPosition,
    writtenAsWord: boolean,
  ): void {
    this.addUnit(name, at, to, "trim-whitespace", writtenAsWord)
    this.position = to
  }

  /**
   * The cardinalities, numbers, and lines, rules 10 to 13: one or more
   * ASCII digits, `.`, and one or more ASCII digits, a `number`; `1` that
   * {@link ErUnitLexer.oneIsOnlyOne} reads as `only-one`; `1` not followed
   * by a word character, a `number`; one or more ASCII digits, a
   * `number`.
   */
  private readNumber(at: DiagramCharacter): boolean {
    if (!isAsciiDigit(at.codePoint)) return false
    const digitsEnd = skipWhile(this.reader, at, (character) =>
      isAsciiDigit(character.codePoint),
    )
    if (isCodePointAt(digitsEnd, FULL_STOP)) {
      const fraction = this.reader.after(digitsEnd)
      if (fraction !== null && isAsciiDigit(fraction.codePoint)) {
        const end = skipWhile(this.reader, fraction, (character) =>
          isAsciiDigit(character.codePoint),
        )
        this.read("number", at, end)
        return true
      }
    }
    if (at.codePoint === DIGIT_ONE) {
      const afterOne = this.reader.after(at)
      if (this.oneIsOnlyOne(afterOne)) {
        this.readRelationship("only-one", at, afterOne, false)
        return true
      }
      if (!isWordCharacterAt(afterOne)) {
        this.read("number", at, afterOne)
        return true
      }
    }
    this.read("number", at, digitsEnd)
    return true
  }

  /**
   * The cardinalities, numbers, and lines, rule 11: whether a `1` followed
   * by `afterOne` is `only-one`: followed by one or more whitespace
   * characters, line feeds included, and an ASCII letter, `_`, `"`, `'`,
   * or an ASCII digit; or followed directly by `--`, `..`, `.-`, or `-.`.
   */
  private oneIsOnlyOne(afterOne: DiagramPosition): boolean {
    if (afterOne !== null && isWhitespace(afterOne.codePoint)) {
      const next = skipWhitespace(this.reader, afterOne)
      return (
        next !== null &&
        (isAsciiLetter(next.codePoint) ||
          next.codePoint === LOW_LINE ||
          next.codePoint === QUOTATION_MARK ||
          next.codePoint === APOSTROPHE ||
          isAsciiDigit(next.codePoint))
      )
    }
    return LINES_AFTER_ONE.some(
      (line) => matchWord(this.reader, afterOne, line) !== null,
    )
  }

  /**
   * The cardinalities, numbers, and lines, rule 15: `u`, compared
   * case-insensitively, followed by `.`, `-`, or `|`: `md-parent`, which
   * reads the `u` only.
   */
  private readMdParent(at: DiagramCharacter): boolean {
    const letter = matchWordIgnoringCase(this.reader, at, "u")
    if (letter === null) return false
    const next = letter.end
    if (
      !isCodePointAt(next, FULL_STOP) &&
      !isCodePointAt(next, HYPHEN_MINUS) &&
      !isCodePointAt(next, VERTICAL_LINE)
    ) {
      return false
    }
    this.readRelationship("md-parent", at, next, true)
    return true
  }

  /**
   * The statement context, rule 23 (Names): one or more characters of a
   * name, as many as possible, a `name` unit, whose token keeps whitespace
   * outside ASCII at its ends, a character of the name.
   */
  private readName(at: DiagramCharacter): boolean {
    if (!isNameCharacter(at.codePoint)) return false
    const end = skipWhile(this.reader, at, (character) =>
      isNameCharacter(character.codePoint),
    )
    this.read("name", at, end, "keep-whitespace")
    return true
  }

  /** diagrams/er.md, The attribute block context: rules 1 to 8, in order. */
  private readInAttributeBlockContext(at: DiagramCharacter): void {
    if (isWhitespace(at.codePoint)) {
      // Rule 1: one or more whitespace characters, line feeds included.
      this.position = skipWhitespace(this.reader, at)
      return
    }
    if (
      this.readKey(at) ||
      this.readTildeWord(at) ||
      this.readWord(at) ||
      this.readBackquotedWord(at) ||
      this.readCommentString(at)
    ) {
      return
    }
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      // Rule 7: `}` leaves the attribute block context.
      this.read("}", at, this.reader.after(at))
      this.leave()
      return
    }
    // Rule 8: any other character, which is no line feed, U+2028, or U+2029
    // (rule 1 reads those): a `?` or a `,` unit, or an `invalid` unit,
    // which no rule of the grammar takes.
    const name: UnitName =
      at.codePoint === QUESTION_MARK
        ? "?"
        : at.codePoint === COMMA
          ? ","
          : "invalid"
    this.read(name, at, this.reader.after(at))
  }

  /**
   * The attribute block context, rule 2: `PK`, `FK`, or `UK`, compared
   * case-insensitively, not followed by a word character: a `key` unit.
   */
  private readKey(at: DiagramCharacter): boolean {
    for (const key of KEYS) {
      const match = matchWholeWordIgnoringCase(this.reader, at, key)
      if (match !== null) {
        this.read("key", at, match.end)
        return true
      }
    }
    return false
  }

  /**
   * The attribute block context, rule 3: a tilde word. From `at`, a run of
   * one or more characters other than whitespace that holds a `~`, where a
   * second `~` follows on the same line segment, a run of characters
   * without line feeds, U+2028, or U+2029; the unit runs from `at` through
   * the last `~` of that line segment and the characters other than
   * whitespace right after it: a `tilde-word` unit, which may hold
   * whitespace.
   */
  private readTildeWord(at: DiagramCharacter): boolean {
    // The run from `at` must hold a `~`; it ends at whitespace, which also
    // ends a line segment. When it ends without one, the rest of the line
    // segment is not read: reading it for each word of a long line would
    // take time in the square of the length of the line.
    const firstTilde = skipWhile(
      this.reader,
      at,
      (character) =>
        character.codePoint !== TILDE && !isWhitespace(character.codePoint),
    )
    if (!isCodePointAt(firstTilde, TILDE)) return false
    let lastTilde: DiagramCharacter | null = null
    for (
      let position = this.reader.after(firstTilde);
      position !== null && !endsLineSegment(position);
      position = this.reader.after(position)
    ) {
      if (position.codePoint === TILDE) lastTilde = position
    }
    if (lastTilde === null) return false
    const end = skipWhile(
      this.reader,
      this.reader.after(lastTilde),
      (character) => !isWhitespace(character.codePoint),
    )
    this.read("tilde-word", at, end)
    return true
  }

  /**
   * The attribute block context, rule 4: a word, a first character that
   * `startsWord` takes and zero or more that `continuesWord` takes: a
   * `word` unit, whose token keeps the whitespace from U+00C0 on that ends
   * it, a character of the word.
   */
  private readWord(at: DiagramCharacter): boolean {
    if (!startsWord(at.codePoint)) return false
    const end = skipWhile(this.reader, this.reader.after(at), (character) =>
      continuesWord(character.codePoint),
    )
    this.read("word", at, end, "keep-whitespace")
    return true
  }

  /**
   * The attribute block context, rule 5: `` ` ``, one or more characters
   * other than `` ` ``, line feeds included, and `` ` ``: a
   * `backquoted-word` unit, backquotes included; two backquotes with
   * nothing between them, an `empty-backquotes` unit. The text may not end
   * inside a backquoted word: the input is then rejected, at its opening
   * backquote.
   */
  private readBackquotedWord(at: DiagramCharacter): boolean {
    if (at.codePoint !== GRAVE_ACCENT) return false
    const contentStart = this.reader.after(at)
    const closing = skipWhile(
      this.reader,
      contentStart,
      (character) => character.codePoint !== GRAVE_ACCENT,
    )
    if (closing === null) {
      const range: Range = [at.start, at.end]
      throw new ParseError(
        "The backquoted word has no closing ` before the end of the text",
        range,
        this.lines.location(range),
      )
    }
    this.read(
      samePosition(closing, contentStart)
        ? "empty-backquotes"
        : "backquoted-word",
      at,
      this.reader.after(closing),
    )
    return true
  }

  /**
   * The attribute block context, rule 6: `"`, zero or more characters other
   * than `"`, line feeds included, and `"`: a `comment-string` unit, which
   * may be empty.
   */
  private readCommentString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const closing = skipWhile(
      this.reader,
      this.reader.after(at),
      (character) => character.codePoint !== QUOTATION_MARK,
    )
    if (closing === null) return false
    this.read("comment-string", at, this.reader.after(closing))
    return true
  }

  /** diagrams/er.md, The style context: rules 1 to 7, in order. */
  private readInStyleContext(at: DiagramCharacter): void {
    if (this.readLineFeeds(at)) {
      // Rule 1: the `newline` unit leaves the style context.
      this.leave()
      return
    }
    if (isWhitespace(at.codePoint)) {
      // Rule 2: one or more whitespace characters, line feeds included.
      this.position = skipWhitespace(this.reader, at)
      return
    }
    if (
      this.readCharacters(at, ":", ":") ||
      this.readCharacters(at, ",", ",") ||
      this.readCharacters(at, "#", "#") ||
      this.readStyleText(at) ||
      this.readCharacters(at, ";", ";")
    ) {
      return
    }
    throw this.noRuleMatches(at)
  }

  /**
   * The style context, rule 6: one or more characters that
   * `isStyleTextCharacter` takes: a `style-text` unit, whose token keeps
   * the whitespace outside ASCII that ends it, a character of it.
   */
  private readStyleText(at: DiagramCharacter): boolean {
    if (!isStyleTextCharacter(at.codePoint)) return false
    const end = skipWhile(this.reader, at, (character) =>
      isStyleTextCharacter(character.codePoint),
    )
    this.read("style-text", at, end, "keep-whitespace")
    return true
  }

  /**
   * Accessibility values: in the title context and the description
   * context, zero or more characters other than line feed, a unit named
   * `name`; the context is left.
   */
  private readRestOfLine(
    at: DiagramCharacter,
    name: "title-text" | "description-text",
  ): void {
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== LINE_FEED,
    )
    if (!samePosition(end, at)) this.read(name, at, end)
    this.leave()
  }

  /**
   * Accessibility values: in the description block context, `}` is a `}`
   * unit and leaves the context, and one or more characters other than
   * `}`, line feeds included, are a `description-block-text` unit.
   */
  private readInDescriptionBlockContext(at: DiagramCharacter): void {
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      this.read("}", at, this.reader.after(at))
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== RIGHT_CURLY_BRACKET,
    )
    this.read("description-block-text", at, end)
  }
}
