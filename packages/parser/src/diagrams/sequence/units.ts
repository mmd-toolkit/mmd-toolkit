import type { DiagramTokenKind, Range } from "../../ast.ts"
import type {
  SequenceArrowLine,
  SequenceArrowMarker,
} from "../../ast/sequence.ts"
import {
  isAsciiDigit,
  isWhitespace,
  isWordCharacter,
} from "../../character-classes.ts"
import {
  COLON,
  COMMA,
  COMMERCIAL_AT,
  EQUALS_SIGN,
  FULL_STOP,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LESS_THAN_SIGN,
  LINE_FEED,
  NUMBER_SIGN,
  PERCENT_SIGN,
  PLUS_SIGN,
  REVERSE_SOLIDUS,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
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
import type { DiagramUnit } from "../../diagram-units.ts"
import { readUnit } from "../../diagram-units.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import type { Match } from "../../scanning.ts"
import {
  isCodePointAt,
  isWhitespaceAt,
  matchWholeWordIgnoringCase,
  matchWord,
  matchWordIgnoringCase,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"

/**
 * diagrams/sequence.md, Lexical structure: the names of the units. A unit
 * that the specification names by its text, a keyword or a punctuation, has
 * that text, in lower case, as its name.
 */
export type UnitName =
  | "newline"
  | "number"
  | "box"
  | "participant"
  | "actor"
  | "create"
  | "destroy"
  | "loop"
  | "rect"
  | "opt"
  | "alt"
  | "else"
  | "par"
  | "par_over"
  | "and"
  | "critical"
  | "option"
  | "break"
  | "end"
  | "left of"
  | "right of"
  | "links"
  | "link"
  | "properties"
  | "details"
  | "over"
  | "note"
  | "activate"
  | "deactivate"
  | "title"
  | "title:"
  | "title-text"
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "}"
  | "description-text"
  | "description-block-text"
  | "sequenceDiagram"
  | "autonumber"
  | "off"
  | ","
  | "id"
  | "arrow"
  | "+"
  | "-"
  | "()"
  | "invalid"
  | "@{"
  | "data-text"
  | "as"
  | "text"
  | "wrap-prefix"
  | "color-candidate"

/** ast/sequence.md, SequenceArrow: the parts of an arrow that its node holds besides its text. */
export interface ArrowParts {
  readonly startMarker: SequenceArrowMarker
  readonly line: SequenceArrowLine
  readonly endMarker: SequenceArrowMarker
}

/** diagrams/sequence.md, Units and contexts: one unit of the diagram text. */
export interface Unit extends DiagramUnit<UnitName> {
  /** For an `arrow` unit, the parts of its arrow; null for every other unit. */
  readonly arrow: ArrowParts | null
}

/**
 * diagrams/sequence.md, Lexical structure: what the lexer reads from the
 * diagram text: its units, its diagram comments, in source order, the
 * characters other than whitespace at which a rule of the statement context
 * starts its match, in source order, which the tests need to find the
 * places of known-divergences/comment-takes-character.md, and the kind of
 * the token of a `;` that the line rule ignores and that stands alone.
 */
export interface SequenceLexing {
  readonly units: readonly Unit[]
  readonly comments: readonly DiagramComment[]
  readonly statementMatchStarts: readonly Range[]
  readonly ignoredSemicolonKindAt: (offset: number) => DiagramTokenKind
}

/** diagrams/sequence.md, Units and contexts: the contexts of the lexer. */
type Context =
  | "statement"
  | "id"
  | "alias"
  | "line"
  | "data"
  | "title"
  | "description"
  | "description-block"

/**
 * ast/sequence.md, Tokens: the units whose contexts read a `;` as a
 * character of the unit, the title, description, description block, and
 * data contexts (Accessibility values, The data context). Their runs stop
 * only at a line feed or at `}`, so a `;` that the line rule ignores and
 * that lies inside such a unit or right at its end is read there as text.
 */
const UNITS_THAT_READ_SEMICOLONS: readonly UnitName[] = [
  "title-text",
  "description-text",
  "description-block-text",
  "data-text",
]

/** A keyword of the statement context and the context that it enters, if any. */
interface StatementKeyword {
  readonly word: string
  readonly unit: UnitName
  readonly enters: Context | null
}

/**
 * The statement context, rules 6 to 12: the keywords, in the order of the
 * rules. Each is read case-insensitively where no word character follows
 * it, and is a unit named by the keyword.
 */
const STATEMENT_KEYWORDS: readonly StatementKeyword[] = [
  { word: "box", unit: "box", enters: "line" },
  { word: "participant", unit: "participant", enters: "id" },
  { word: "actor", unit: "actor", enters: "id" },
  { word: "create", unit: "create", enters: null },
  { word: "destroy", unit: "destroy", enters: "id" },
  { word: "loop", unit: "loop", enters: "line" },
  { word: "rect", unit: "rect", enters: "line" },
  { word: "opt", unit: "opt", enters: "line" },
  { word: "alt", unit: "alt", enters: "line" },
  { word: "else", unit: "else", enters: "line" },
  { word: "par", unit: "par", enters: "line" },
  { word: "par_over", unit: "par_over", enters: "line" },
  { word: "and", unit: "and", enters: "line" },
  { word: "critical", unit: "critical", enters: "line" },
  { word: "option", unit: "option", enters: "line" },
  { word: "break", unit: "break", enters: "line" },
  { word: "end", unit: "end", enters: null },
  { word: "left of", unit: "left of", enters: null },
  { word: "right of", unit: "right of", enters: null },
  { word: "links", unit: "links", enters: null },
  { word: "link", unit: "link", enters: null },
  { word: "properties", unit: "properties", enters: null },
  { word: "details", unit: "details", enters: null },
  { word: "over", unit: "over", enters: null },
  { word: "note", unit: "note", enters: null },
  { word: "activate", unit: "activate", enters: "id" },
  { word: "deactivate", unit: "deactivate", enters: "id" },
]

/** The statement context, rule 18: the keywords read after the accessibility rules. */
const LATE_STATEMENT_KEYWORDS: readonly UnitName[] = [
  "sequenceDiagram",
  "autonumber",
  "off",
]

/** One arrow of the statement context: its text and its parts (ast/sequence.md, SequenceArrow). */
interface ArrowForm extends ArrowParts {
  readonly text: string
}

/**
 * The statement context, rule 22: the arrows, in the order in which they
 * are tried, each with its markers and line (ast/sequence.md,
 * SequenceArrow): an optional start marker, the line `-` or `--`, and the
 * end marker, or `>` for none.
 */
const ARROWS: readonly ArrowForm[] = [
  { text: "->>", startMarker: "none", line: "solid", endMarker: "arrow" },
  { text: "<<->>", startMarker: "arrow", line: "solid", endMarker: "arrow" },
  { text: "-->>", startMarker: "none", line: "dotted", endMarker: "arrow" },
  { text: "<<-->>", startMarker: "arrow", line: "dotted", endMarker: "arrow" },
  { text: "->", startMarker: "none", line: "solid", endMarker: "none" },
  { text: "-->", startMarker: "none", line: "dotted", endMarker: "none" },
  { text: "-x", startMarker: "none", line: "solid", endMarker: "cross" },
  { text: "--x", startMarker: "none", line: "dotted", endMarker: "cross" },
  { text: "-)", startMarker: "none", line: "solid", endMarker: "open-arrow" },
  { text: "--)", startMarker: "none", line: "dotted", endMarker: "open-arrow" },
  {
    text: "--|\\",
    startMarker: "none",
    line: "dotted",
    endMarker: "half-arrow-top",
  },
  {
    text: "--|/",
    startMarker: "none",
    line: "dotted",
    endMarker: "half-arrow-bottom",
  },
  {
    text: "--\\\\",
    startMarker: "none",
    line: "dotted",
    endMarker: "half-stick-top",
  },
  {
    text: "--//",
    startMarker: "none",
    line: "dotted",
    endMarker: "half-stick-bottom",
  },
  {
    text: "/|--",
    startMarker: "half-arrow-top",
    line: "dotted",
    endMarker: "none",
  },
  {
    text: "\\|--",
    startMarker: "half-arrow-bottom",
    line: "dotted",
    endMarker: "none",
  },
  {
    text: "//--",
    startMarker: "half-stick-top",
    line: "dotted",
    endMarker: "none",
  },
  {
    text: "\\\\--",
    startMarker: "half-stick-bottom",
    line: "dotted",
    endMarker: "none",
  },
  {
    text: "-|\\",
    startMarker: "none",
    line: "solid",
    endMarker: "half-arrow-top",
  },
  {
    text: "-|/",
    startMarker: "none",
    line: "solid",
    endMarker: "half-arrow-bottom",
  },
  {
    text: "-\\\\",
    startMarker: "none",
    line: "solid",
    endMarker: "half-stick-top",
  },
  {
    text: "-//",
    startMarker: "none",
    line: "solid",
    endMarker: "half-stick-bottom",
  },
  {
    text: "/|-",
    startMarker: "half-arrow-top",
    line: "solid",
    endMarker: "none",
  },
  {
    text: "\\|-",
    startMarker: "half-arrow-bottom",
    line: "solid",
    endMarker: "none",
  },
  {
    text: "//-",
    startMarker: "half-stick-top",
    line: "solid",
    endMarker: "none",
  },
  {
    text: "\\\\-",
    startMarker: "half-stick-bottom",
    line: "solid",
    endMarker: "none",
  },
]

/** Id runs, part 2: what may not follow where a continuation would start. */
const CONTINUATION_STOPS: readonly string[] = [
  "-x",
  "-)",
  "-\\",
  "-/",
  "-|\\",
  "-|/",
  "--",
  "/|-",
  "\\|-",
  "//-",
  "\\\\-",
  "()",
]

/** Id runs, part 1: the characters that the first part of an id run may not contain. */
const ID_RUN_START_EXCLUDED: readonly number[] = [
  SOLIDUS,
  REVERSE_SOLIDUS,
  PLUS_SIGN,
  LEFT_PARENTHESIS,
  RIGHT_PARENTHESIS,
  LESS_THAN_SIGN,
  HYPHEN_MINUS,
  GREATER_THAN_SIGN,
  COLON,
  COMMA,
  SEMICOLON,
  LINE_FEED,
]

/** Id runs, part 2: the characters that a continuation may not contain after its `-`. */
const ID_RUN_CONTINUATION_EXCLUDED: readonly number[] = [
  PLUS_SIGN,
  LESS_THAN_SIGN,
  HYPHEN_MINUS,
  GREATER_THAN_SIGN,
  COLON,
  COMMA,
  SEMICOLON,
  LINE_FEED,
]

/** The id context, rules 5 to 7: the characters that an id may not contain. */
const ID_EXCLUDED: readonly number[] = [
  LESS_THAN_SIGN,
  GREATER_THAN_SIGN,
  COLON,
  COMMA,
  SEMICOLON,
  COMMERCIAL_AT,
  LINE_FEED,
]

/** The id context, rule 4: the characters that an id before `@{` may not contain, besides whitespace. */
const ID_BEFORE_DATA_EXCLUDED: readonly number[] = [
  ...ID_EXCLUDED,
  EQUALS_SIGN,
  HYPHEN_MINUS,
]

/** Text parts: the characters that end a text part, and the text after `:` and `title`. */
const TEXT_END: readonly number[] = [NUMBER_SIGN, SEMICOLON, LINE_FEED]

/** The line context, rule 3: the colour functions that a colour candidate may start with, in lower case, longer names first. */
const COLOR_FUNCTIONS: readonly string[] = ["rgba", "rgb", "hsla", "hsl"]

/** Text parts: the wrap prefixes, after an optional `:`, compared case-sensitively. */
const WRAP_PREFIXES: readonly string[] = ["wrap:", "nowrap:"]

/** `text` without the whitespace at its ends. */
function withoutWhitespaceAtEnds(text: string): string {
  const characters = [...text]
  let start = 0
  let end = characters.length
  while (start < end && isWhitespace(characters[start].codePointAt(0) ?? 0)) {
    start += 1
  }
  while (end > start && isWhitespace(characters[end - 1].codePointAt(0) ?? 0)) {
    end -= 1
  }
  return characters.slice(start, end).join("")
}

/**
 * diagrams/sequence.md, Lexical structure: the lexer that divides the
 * diagram text into units and finds its diagram comments. It keeps a stack
 * of contexts and, at each place, applies the first rule of the current
 * context that matches. The rules are those of the specification, in its
 * order; each method that reads a context names the section it follows.
 * Every rule compares letters case-insensitively, except where the
 * specification says otherwise.
 */
export class SequenceUnitLexer {
  private readonly reader: DiagramText

  private readonly lines: LineIndex

  private readonly units: Unit[] = []

  private readonly comments: DiagramComment[] = []

  private readonly statementMatchStarts: Range[] = []

  /** The stack of contexts; the last one is the current context. */
  private readonly contexts: Context[] = ["statement"]

  /** The place of the next character to read; null at the end of the text. */
  private position: DiagramPosition

  /** Where the source ends, where the `newline` unit of the end of the text is. */
  private readonly sourceEnd: number

  public constructor(reader: DiagramText, lines: LineIndex, sourceEnd: number) {
    this.reader = reader
    this.lines = lines
    this.sourceEnd = sourceEnd
    this.position = reader.first()
  }

  /**
   * Divides the diagram text into units. Throws `ParseError` where no rule
   * matches. At the end of the text, it reads a `newline` unit of no
   * characters (The statement context).
   */
  public lex(): SequenceLexing {
    while (this.position !== null) {
      this.readInContext(this.position, this.currentContext())
    }
    this.units.push({
      name: "newline",
      text: "",
      index: this.units.length,
      start: this.sourceEnd,
      end: this.sourceEnd,
      significantRange: null,
      arrow: null,
    })
    return {
      units: this.units,
      comments: this.comments,
      statementMatchStarts: this.statementMatchStarts,
      ignoredSemicolonKindAt: (offset) =>
        this.readsSemicolonAt(offset) ? "RawText" : "Punctuator",
    }
  }

  /**
   * ast/sequence.md, Tokens: whether the context at `offset`, the place of a
   * `;` that the line rule ignores and that lies in no token, reads a `;` as
   * text: whether a unit of {@link UNITS_THAT_READ_SEMICOLONS} holds the
   * place or ends right before it. Everywhere else the statement context
   * reads a `;`, as a `newline` unit; the id and line contexts stop before it
   * and leave.
   */
  private readsSemicolonAt(offset: number): boolean {
    return this.units.some(
      (unit) =>
        UNITS_THAT_READ_SEMICOLONS.includes(unit.name) &&
        unit.start < offset &&
        offset <= unit.end,
    )
  }

  /** The current context: the top of the stack. */
  private currentContext(): Context {
    return this.contexts[this.contexts.length - 1]
  }

  /** Units and contexts: enters `context`, which goes on top of the stack. */
  private enter(context: Context): void {
    this.contexts.push(context)
  }

  /** Units and contexts: leaves the current context. Leaving the statement context keeps it. */
  private leave(): void {
    if (this.contexts.length > 1) this.contexts.pop()
  }

  /** Applies the first rule of `context` that matches at `at`. */
  private readInContext(at: DiagramCharacter, context: Context): void {
    switch (context) {
      case "statement":
        this.readInStatementContext(at)
        return
      case "id":
        this.readInIdContext(at)
        return
      case "alias":
        this.readInAliasContext(at)
        return
      case "line":
        this.readInLineContext(at)
        return
      case "data":
        this.readInDataContext(at)
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

  /** The error for a place where no rule of the current context matches. */
  private noRuleMatches(at: DiagramCharacter): ParseError {
    const range: Range = [at.start, at.end]
    return new ParseError(
      "Unexpected character",
      range,
      this.lines.location(range),
    )
  }

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`. Its text is those characters, or `text` when
   * it is given.
   */
  private addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    text: string | null = null,
  ): void {
    this.units.push({
      ...readUnit(this.reader, name, this.units.length, from, to, text),
      arrow: null,
    })
  }

  /** The characters from `from` up to `to`, in converted form. */
  private textBetween(from: DiagramPosition, to: DiagramPosition): string {
    let text = ""
    for (
      let position = from;
      position !== null && !samePosition(position, to);
      position = this.reader.after(position)
    ) {
      text += String.fromCodePoint(position.codePoint)
    }
    return text
  }

  /** Whether the characters from `from` up to `to` are all whitespace, or none. */
  private isAllWhitespace(from: DiagramPosition, to: DiagramPosition): boolean {
    for (
      let position = from;
      position !== null && !samePosition(position, to);
      position = this.reader.after(position)
    ) {
      if (!isWhitespace(position.codePoint)) return false
    }
    return true
  }

  /** The place after the characters from `from` that are none of `excluded`. */
  private skipNone(
    from: DiagramPosition,
    excluded: readonly number[],
  ): DiagramPosition {
    return skipWhile(
      this.reader,
      from,
      (character) => !excluded.includes(character.codePoint),
    )
  }

  /** The place after the whitespace at `from` other than line feeds. */
  private afterLineWhitespace(from: DiagramPosition): DiagramPosition {
    return skipWhile(
      this.reader,
      from,
      (character) =>
        isWhitespace(character.codePoint) && character.codePoint !== LINE_FEED,
    )
  }

  /** Lexical structure: reads `word` from `at` as a keyword, case-insensitively, where no word character follows it. */
  private keyword(at: DiagramPosition, word: string): Match | null {
    return matchWholeWordIgnoringCase(this.reader, at, word)
  }

  /**
   * A diagram comment: from its mark, which starts at `at` and whose last
   * character is `markLast`, to the end of its line, up to and not including
   * the line feed. The source text after the mark is the comment's value.
   */
  private readComment(at: DiagramCharacter, markLast: DiagramCharacter): void {
    let last = markLast
    let position = this.reader.after(markLast)
    while (position !== null && position.codePoint !== LINE_FEED) {
      last = position
      position = this.reader.after(position)
    }
    this.comments.push({
      range: [at.start, last.end],
      valueStart: markLast.end,
    })
    this.position = position
  }

  /**
   * `#` and the rest of its line, a diagram comment: rule 3 of the
   * statement context, and rule 2 of the id, alias, and line contexts.
   */
  private readHashComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== NUMBER_SIGN) return false
    this.readComment(at, at)
    return true
  }

  /**
   * diagrams/sequence.md, The statement context: applies the first of the
   * 25 rules that matches at `at`.
   */
  private readInStatementContext(at: DiagramCharacter): void {
    if (!isWhitespace(at.codePoint)) {
      this.statementMatchStarts.push([at.start, at.end])
    }
    const applied =
      this.readLineFeeds(at) ||
      this.readWhitespace(at) ||
      this.readHashComment(at) ||
      this.readPercentComment(at) ||
      this.readNumber(at) ||
      this.readStatementKeyword(at) ||
      this.readTitle(at) ||
      this.readAccessibilityMarker(at) ||
      this.readLateStatementKeyword(at) ||
      this.readComma(at) ||
      this.readSemicolon(at) ||
      this.readIdRun(at) ||
      this.readArrow(at) ||
      this.readColonText(at) ||
      this.readSign(at) ||
      this.readInvalid(at)
    if (!applied) throw this.noRuleMatches(at)
  }

  /** The statement context, rule 1: one or more line feeds, a `newline` unit. */
  private readLineFeeds(at: DiagramCharacter): boolean {
    if (at.codePoint !== LINE_FEED) return false
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint === LINE_FEED,
    )
    this.addUnit("newline", at, end)
    this.position = end
    return true
  }

  /**
   * The statement context, rule 2: one or more whitespace characters, the
   * first of which is not a line feed, and the line feeds after them; no
   * unit.
   */
  private readWhitespace(at: DiagramCharacter): boolean {
    if (!isWhitespace(at.codePoint)) return false
    this.position = skipWhitespace(this.reader, at)
    return true
  }

  /**
   * The statement context, rule 4: `%` that `{` does not follow, and the
   * rest of its line, a diagram comment. Its mark is `%%` when it starts
   * with `%%`, and `%` otherwise (Lexical structure). As in the `%%` of a
   * comment line, a directive may lie between the two `%` (ast.md, Comment).
   */
  private readPercentComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== PERCENT_SIGN) return false
    const next = this.reader.after(at)
    if (next?.codePoint === LEFT_CURLY_BRACKET) return false
    this.readComment(at, next?.codePoint === PERCENT_SIGN ? next : at)
    return true
  }

  /**
   * The statement context, rule 5: a number, one or more digits optionally
   * followed by `.` and one or two digits, or `.` followed by one or two
   * digits, which a space, a line feed, or `%%` must follow. Of the forms
   * that start at `at`, the longest that is so followed is read.
   */
  private readNumber(at: DiagramCharacter): boolean {
    const digitsEnd = skipWhile(this.reader, at, (character) =>
      isAsciiDigit(character.codePoint),
    )
    const ends: DiagramPosition[] = []
    const fractionStart = samePosition(digitsEnd, at) ? at : digitsEnd
    if (isCodePointAt(fractionStart, FULL_STOP)) {
      const firstDigit = this.reader.after(fractionStart)
      if (firstDigit !== null && isAsciiDigit(firstDigit.codePoint)) {
        const secondDigit = this.reader.after(firstDigit)
        if (secondDigit !== null && isAsciiDigit(secondDigit.codePoint)) {
          ends.push(this.reader.after(secondDigit))
        }
        ends.push(secondDigit)
      }
    }
    if (!samePosition(digitsEnd, at)) ends.push(digitsEnd)
    const end = ends.find((candidate) => this.endsNumber(candidate))
    if (end === undefined) return false
    this.addUnit("number", at, end)
    this.position = end
    return true
  }

  /** The statement context, rule 5: whether a space, a line feed, or `%%` is at `position`. */
  private endsNumber(position: DiagramPosition): boolean {
    if (position === null) return false
    if (position.codePoint === SPACE || position.codePoint === LINE_FEED) {
      return true
    }
    return matchWord(this.reader, position, "%%") !== null
  }

  /** The statement context, rules 6 to 12: a keyword of {@link STATEMENT_KEYWORDS}. */
  private readStatementKeyword(at: DiagramCharacter): boolean {
    for (const { word, unit, enters } of STATEMENT_KEYWORDS) {
      const match = this.keyword(at, word)
      if (match === null) continue
      this.addUnit(unit, at, match.end)
      this.position = match.end
      if (enters !== null) this.enter(enters)
      return true
    }
    return false
  }

  /**
   * The statement context, rules 13 and 14: `title` or `title:`, one
   * whitespace character, which may be a line feed, and one or more
   * characters other than `#`, `;`, and line feed. The word and the
   * whitespace are a `title` or `title:` unit, and the rest a `title-text`
   * unit.
   */
  private readTitle(at: DiagramCharacter): boolean {
    const word = matchWordIgnoringCase(this.reader, at, "title")
    if (word === null) return false
    const colon = isCodePointAt(word.end, COLON) ? word.end : null
    const whitespace = colon === null ? word.end : this.reader.after(colon)
    if (!isWhitespaceAt(whitespace)) return false
    const textStart = this.reader.after(whitespace)
    const textEnd = this.skipNone(textStart, TEXT_END)
    if (textStart === null || samePosition(textStart, textEnd)) return false
    this.addUnit(colon === null ? "title" : "title:", at, textStart)
    this.addUnit("title-text", textStart, textEnd)
    this.position = textEnd
    return true
  }

  /**
   * The statement context, rules 15 to 17: `accTitle` or `accDescr`,
   * whitespace, `:` (or `{` after `accDescr`), and whitespace. The keyword
   * and the punctuation are a unit each; the whitespace is read outside
   * them.
   */
  private readAccessibilityMarker(at: DiagramCharacter): boolean {
    const title = matchWordIgnoringCase(this.reader, at, "accTitle")
    if (title !== null) {
      const colon = skipWhitespace(this.reader, title.end)
      if (isCodePointAt(colon, COLON)) {
        this.addUnit("accTitle", at, title.end)
        this.addUnit(":", colon, this.reader.after(colon))
        this.position = skipWhitespace(this.reader, this.reader.after(colon))
        this.enter("title")
        return true
      }
    }
    const description = matchWordIgnoringCase(this.reader, at, "accDescr")
    if (description === null) return false
    const mark = skipWhitespace(this.reader, description.end)
    if (isCodePointAt(mark, COLON)) {
      this.addUnit("accDescr", at, description.end)
      this.addUnit(":", mark, this.reader.after(mark))
      this.position = skipWhitespace(this.reader, this.reader.after(mark))
      this.enter("description")
      return true
    }
    if (isCodePointAt(mark, LEFT_CURLY_BRACKET)) {
      this.addUnit("accDescr", at, description.end)
      this.addUnit("{", mark, this.reader.after(mark))
      this.position = skipWhitespace(this.reader, this.reader.after(mark))
      this.enter("description-block")
      return true
    }
    return false
  }

  /** The statement context, rule 18: a keyword of {@link LATE_STATEMENT_KEYWORDS}. */
  private readLateStatementKeyword(at: DiagramCharacter): boolean {
    for (const word of LATE_STATEMENT_KEYWORDS) {
      const match = this.keyword(at, word)
      if (match === null) continue
      this.addUnit(word, at, match.end)
      this.position = match.end
      return true
    }
    return false
  }

  /** The statement context, rule 19: `,`, a `,` unit. */
  private readComma(at: DiagramCharacter): boolean {
    if (at.codePoint !== COMMA) return false
    this.addUnit(",", at, this.reader.after(at))
    this.position = this.reader.after(at)
    return true
  }

  /** The statement context, rule 20: `;`, a `newline` unit. */
  private readSemicolon(at: DiagramCharacter): boolean {
    if (at.codePoint !== SEMICOLON) return false
    this.addUnit("newline", at, this.reader.after(at))
    this.position = this.reader.after(at)
    return true
  }

  /**
   * The statement context, rule 21, and Id runs: an id run, an `id` unit
   * whose text is the run without the whitespace at its ends. The first
   * part is one or more characters other than those of
   * {@link ID_RUN_START_EXCLUDED}; each continuation is zero or more `-` and
   * one or more characters other than those of
   * {@link ID_RUN_CONTINUATION_EXCLUDED}, and does not start where one of
   * {@link CONTINUATION_STOPS} follows.
   */
  private readIdRun(at: DiagramCharacter): boolean {
    let end = this.skipNone(at, ID_RUN_START_EXCLUDED)
    if (samePosition(end, at)) return false
    for (;;) {
      if (this.continuationStopsAt(end)) break
      const dashesEnd = skipWhile(
        this.reader,
        end,
        (character) => character.codePoint === HYPHEN_MINUS,
      )
      const charactersEnd = this.skipNone(
        dashesEnd,
        ID_RUN_CONTINUATION_EXCLUDED,
      )
      if (samePosition(charactersEnd, dashesEnd)) break
      end = charactersEnd
    }
    this.addUnit(
      "id",
      at,
      end,
      withoutWhitespaceAtEnds(this.textBetween(at, end)),
    )
    this.position = end
    return true
  }

  /** Id runs: whether one of {@link CONTINUATION_STOPS} follows at `position`. */
  private continuationStopsAt(position: DiagramPosition): boolean {
    return CONTINUATION_STOPS.some(
      (stop) => matchWordIgnoringCase(this.reader, position, stop) !== null,
    )
  }

  /** The statement context, rule 22: the first arrow of {@link ARROWS} that matches, an `arrow` unit. */
  private readArrow(at: DiagramCharacter): boolean {
    for (const arrow of ARROWS) {
      const match = matchWordIgnoringCase(this.reader, at, arrow.text)
      if (match === null) continue
      this.units.push({
        ...readUnit(
          this.reader,
          "arrow",
          this.units.length,
          at,
          match.end,
          null,
        ),
        arrow: {
          startMarker: arrow.startMarker,
          line: arrow.line,
          endMarker: arrow.endMarker,
        },
      })
      this.position = match.end
      return true
    }
    return false
  }

  /**
   * The statement context, rule 23: `:` and the rest of its line, up to
   * `#`, `;`, or a line feed: a `:` unit, followed by the rest read as a
   * text part.
   */
  private readColonText(at: DiagramCharacter): boolean {
    if (at.codePoint !== COLON) return false
    this.addUnit(":", at, this.reader.after(at))
    this.readTextPart(this.reader.after(at))
    return true
  }

  /** The statement context, rule 24: `+`, `-`, and `()`, a unit named by its text. */
  private readSign(at: DiagramCharacter): boolean {
    if (at.codePoint === PLUS_SIGN) {
      this.addUnit("+", at, this.reader.after(at))
      this.position = this.reader.after(at)
      return true
    }
    if (at.codePoint === HYPHEN_MINUS) {
      this.addUnit("-", at, this.reader.after(at))
      this.position = this.reader.after(at)
      return true
    }
    const parentheses = matchWord(this.reader, at, "()")
    if (parentheses === null) return false
    this.addUnit("()", at, parentheses.end)
    this.position = parentheses.end
    return true
  }

  /** The statement context, rule 25: any other character, an `invalid` unit. */
  private readInvalid(at: DiagramCharacter): boolean {
    this.addUnit("invalid", at, this.reader.after(at))
    this.position = this.reader.after(at)
    return true
  }

  /**
   * Text parts: the text from `from` up to `#`, `;`, or a line feed. Its
   * whitespace at the start belongs to no unit; a wrap prefix, `wrap:` or
   * `nowrap:` after an optional `:`, compared case-sensitively, is a
   * `wrap-prefix` unit; and the rest, when it is not all whitespace, is a
   * `text` unit.
   */
  private readTextPart(from: DiagramPosition): void {
    const end = this.skipNone(from, TEXT_END)
    let start = this.afterLineWhitespace(from)
    if (start !== null && !samePosition(start, end)) {
      const prefix = this.wrapPrefix(start)
      if (prefix !== null) {
        this.addUnit("wrap-prefix", start, prefix.end)
        start = prefix.end
      }
    }
    if (start !== null && !this.isAllWhitespace(start, end)) {
      this.addUnit("text", start, end)
    }
    this.position = end
  }

  /** Text parts: the wrap prefix that starts at `at`, if one does. */
  private wrapPrefix(at: DiagramCharacter): Match | null {
    const prefixStart = at.codePoint === COLON ? this.reader.after(at) : at
    for (const prefix of WRAP_PREFIXES) {
      const match = matchWord(this.reader, prefixStart, prefix)
      if (match !== null) return match
    }
    return null
  }

  /**
   * diagrams/sequence.md, The id context: applies the first of the eight
   * rules that matches at `at`.
   */
  private readInIdContext(at: DiagramCharacter): void {
    if (isWhitespace(at.codePoint) && at.codePoint !== LINE_FEED) {
      this.position = this.afterLineWhitespace(at)
      return
    }
    if (this.readHashComment(at)) return
    const applied =
      this.readDataStart(at) ||
      this.readIdBeforeData(at) ||
      this.readIdBeforeAlias(at) ||
      this.readIdToLineEnd(at) ||
      this.readInvalidId(at)
    if (!applied) throw this.noRuleMatches(at)
  }

  /** The id context, rule 3: `@{`, a `@{` unit; enters the data context. */
  private readDataStart(at: DiagramCharacter): boolean {
    const match = matchWord(this.reader, at, "@{")
    if (match === null) return false
    this.addUnit("@{", at, match.end)
    this.position = match.end
    this.enter("data")
    return true
  }

  /**
   * The id context, rule 4: one or more characters other than those of
   * {@link ID_BEFORE_DATA_EXCLUDED} and whitespace, followed directly by
   * `@{`, which is not read: an `id` unit.
   */
  private readIdBeforeData(at: DiagramCharacter): boolean {
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        !ID_BEFORE_DATA_EXCLUDED.includes(character.codePoint) &&
        !isWhitespace(character.codePoint),
    )
    if (samePosition(end, at)) return false
    if (matchWord(this.reader, end, "@{") === null) return false
    this.addUnit("id", at, end)
    this.position = end
    return true
  }

  /**
   * The id context, rule 5: one or more characters other than those of
   * {@link ID_EXCLUDED} and whitespace, followed by whitespace, the keyword
   * `as`, and one whitespace character, which are not read: an `id` unit;
   * enters the alias context.
   */
  private readIdBeforeAlias(at: DiagramCharacter): boolean {
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        !ID_EXCLUDED.includes(character.codePoint) &&
        !isWhitespace(character.codePoint),
    )
    if (samePosition(end, at) || !this.aliasFollows(end)) return false
    this.addUnit("id", at, end)
    this.position = end
    this.enter("alias")
    return true
  }

  /**
   * The id context, rule 5, and the data context, rule 2: whether
   * whitespace, the keyword `as`, and one whitespace character follow at
   * `position`.
   */
  private aliasFollows(position: DiagramPosition): boolean {
    if (!isWhitespaceAt(position)) return false
    const keyword = this.keyword(skipWhitespace(this.reader, position), "as")
    return keyword !== null && isWhitespaceAt(keyword.end)
  }

  /**
   * The id context, rule 6: one or more characters other than those of
   * {@link ID_EXCLUDED}, followed by zero or more whitespace and a line
   * feed, `;`, or `#`, which are not read: an `id` unit, whose text is the
   * run without the whitespace at its ends; leaves the id context. Of the
   * runs that start at `at`, the longest that is so followed is read.
   */
  private readIdToLineEnd(at: DiagramCharacter): boolean {
    if (ID_EXCLUDED.includes(at.codePoint)) return false
    const ends: DiagramPosition[] = []
    for (
      let position = this.reader.after(at);
      ;
      position = this.reader.after(position)
    ) {
      ends.push(position)
      if (position === null || ID_EXCLUDED.includes(position.codePoint)) break
    }
    const end = ends
      .reverse()
      .find((candidate) => this.lineEndFollows(candidate))
    if (end === undefined) return false
    this.addUnit(
      "id",
      at,
      end,
      withoutWhitespaceAtEnds(this.textBetween(at, end)),
    )
    this.position = end
    this.leave()
    return true
  }

  /** The id context, rule 6: whether zero or more whitespace and a line feed, `;`, or `#` follow at `position`. */
  private lineEndFollows(position: DiagramPosition): boolean {
    for (
      let current = position;
      current !== null;
      current = this.reader.after(current)
    ) {
      if (current.codePoint === LINE_FEED) return true
      if (!isWhitespace(current.codePoint)) {
        return (
          current.codePoint === SEMICOLON || current.codePoint === NUMBER_SIGN
        )
      }
    }
    return false
  }

  /**
   * The id context, rules 7 and 8: zero or more characters other than those
   * of {@link ID_EXCLUDED}, then `<` and the rest of the line; or else one or
   * more characters other than line feed. Both read up to the line feed, so
   * they are one rule here: an `invalid` unit, which leaves the id context.
   */
  private readInvalidId(at: DiagramCharacter): boolean {
    if (at.codePoint === LINE_FEED) return false
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== LINE_FEED,
    )
    this.addUnit("invalid", at, end)
    this.position = end
    this.leave()
    return true
  }

  /**
   * diagrams/sequence.md, The alias context: whitespace other than line
   * feeds; `#` and the rest of its line; the keyword `as`, an `as` unit,
   * which leaves the alias context and the id context and enters the line
   * context; and, at a line feed, a `newline` unit that reads no character,
   * which leaves the alias context and the id context, so that the line
   * feed is read by the statement context.
   */
  private readInAliasContext(at: DiagramCharacter): void {
    if (isWhitespace(at.codePoint) && at.codePoint !== LINE_FEED) {
      this.position = this.afterLineWhitespace(at)
      return
    }
    if (this.readHashComment(at)) return
    if (at.codePoint === LINE_FEED) {
      this.addUnit("newline", at, at)
      this.leave()
      this.leave()
      return
    }
    const match = this.keyword(at, "as")
    if (match === null) throw this.noRuleMatches(at)
    this.addUnit("as", at, match.end)
    this.position = match.end
    this.leave()
    this.leave()
    this.enter("line")
  }

  /**
   * diagrams/sequence.md, The line context: whitespace other than line
   * feeds; `#` and the rest of its line; only as the first unit after
   * `box`, a colour candidate; and the rest of the line up to `#`, `;`, or a
   * line feed, which leaves the context: after `box`, a `text` unit unless
   * it is all whitespace, and after another keyword a text part.
   */
  private readInLineContext(at: DiagramCharacter): void {
    if (isWhitespace(at.codePoint) && at.codePoint !== LINE_FEED) {
      this.position = this.afterLineWhitespace(at)
      return
    }
    if (this.readHashComment(at)) return
    const previous = this.units.at(-1)?.name
    if (previous === "box" && this.readColorCandidate(at)) return
    if (previous === "box" || previous === "color-candidate") {
      const end = this.skipNone(at, TEXT_END)
      if (!this.isAllWhitespace(at, end)) this.addUnit("text", at, end)
      this.position = end
    } else {
      this.readTextPart(at)
    }
    this.leave()
  }

  /**
   * The line context, rule 3: a colour candidate, a `color-candidate` unit:
   * a colour function of {@link COLOR_FUNCTIONS}, zero or more whitespace,
   * `(`, and the characters up to the last `)` before the next `#`, `;`, or
   * line feed; or else one or more word characters.
   */
  private readColorCandidate(at: DiagramCharacter): boolean {
    const characters: DiagramCharacter[] = []
    const lineEnd = this.skipNone(at, TEXT_END)
    for (
      let position: DiagramPosition = at;
      position !== null && !samePosition(position, lineEnd);
      position = this.reader.after(position)
    ) {
      characters.push(position)
    }
    let length = this.colorFunctionLength(characters)
    if (length === null) {
      length = characters.findIndex(
        (character) => !isWordCharacter(character.codePoint),
      )
      if (length === -1) length = characters.length
    }
    if (length === 0) return false
    const end = this.reader.after(characters[length - 1])
    this.addUnit("color-candidate", at, end)
    this.position = end
    return true
  }

  /**
   * The line context, rule 3: how many of `characters` a colour function at
   * their start takes, up to and including the last `)`; null when they do
   * not start with one.
   */
  private colorFunctionLength(
    characters: readonly DiagramCharacter[],
  ): number | null {
    const text = characters.map((character) =>
      String.fromCodePoint(character.codePoint),
    )
    const name = COLOR_FUNCTIONS.find((candidate) =>
      [...candidate].every((letter, index) => text[index] === letter),
    )
    if (name === undefined) return null
    let index = [...name].length
    while (
      index < characters.length &&
      isWhitespace(characters[index].codePoint)
    ) {
      index += 1
    }
    if (characters[index]?.codePoint !== LEFT_PARENTHESIS) return null
    let end = characters.length
    while (end > index && characters[end - 1].codePoint !== RIGHT_PARENTHESIS) {
      end -= 1
    }
    return end > index + 1 ? end : null
  }

  /**
   * diagrams/sequence.md, The data context: one or more characters other
   * than `}`, a `data-text` unit; or `}`, a `}` unit, which leaves the data
   * context, and either enters the alias context, where whitespace, the
   * keyword `as`, and one whitespace character follow, or leaves the id
   * context.
   */
  private readInDataContext(at: DiagramCharacter): void {
    if (at.codePoint !== RIGHT_CURLY_BRACKET) {
      const end = skipWhile(
        this.reader,
        at,
        (character) => character.codePoint !== RIGHT_CURLY_BRACKET,
      )
      this.addUnit("data-text", at, end)
      this.position = end
      return
    }
    const end = this.reader.after(at)
    this.addUnit("}", at, end)
    this.position = end
    this.leave()
    if (this.aliasFollows(end)) {
      this.enter("alias")
    } else {
      this.leave()
    }
  }

  /**
   * Accessibility values, the title and the description contexts: one or
   * more characters other than line feed are a unit named `name`, and the
   * context is left.
   */
  private readRestOfLine(at: DiagramCharacter, name: UnitName): void {
    if (at.codePoint === LINE_FEED) throw this.noRuleMatches(at)
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== LINE_FEED,
    )
    this.addUnit(name, at, end)
    this.position = end
    this.leave()
  }

  /**
   * Accessibility values, the description block context: `}` is a `}` unit
   * and leaves the context, and one or more other characters are a
   * `description-block-text` unit.
   */
  private readInDescriptionBlockContext(at: DiagramCharacter): void {
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      this.addUnit("}", at, this.reader.after(at))
      this.position = this.reader.after(at)
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== RIGHT_CURLY_BRACKET,
    )
    this.addUnit("description-block-text", at, end)
    this.position = end
  }
}
