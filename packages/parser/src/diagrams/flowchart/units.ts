import type { Range } from "../../ast.ts"
import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
} from "../../character-classes.ts"
import {
  AMPERSAND,
  APOSTROPHE,
  ASTERISK,
  CIRCUMFLEX_ACCENT,
  COLON,
  COMMA,
  COMMERCIAL_AT,
  DOLLAR_SIGN,
  EQUALS_SIGN,
  EXCLAMATION_MARK,
  FULL_STOP,
  GRAVE_ACCENT,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LATIN_SMALL_LETTER_V,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  LESS_THAN_SIGN,
  LINE_FEED,
  LOW_LINE,
  NUMBER_SIGN,
  PERCENT_SIGN,
  PLUS_SIGN,
  QUESTION_MARK,
  QUOTATION_MARK,
  REVERSE_SOLIDUS,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
  RIGHT_SQUARE_BRACKET,
  SOLIDUS,
  TILDE,
  VERTICAL_LINE,
} from "../../code-points.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import type {
  ClosedArrowParts,
  LinkTextKind,
  OpeningArrowParts,
} from "./arrows.ts"
import { matchArrow, matchClosedArrow } from "./arrows.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import type { Match } from "../../scanning.ts"
import {
  isCodePointAt,
  isWhitespaceAt,
  isWordCharacterAt,
  matchWholeWord,
  matchWord,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"
import { isUnicodeLetter } from "../../unicode-letters.ts"
import { DirectionLineRule } from "../../direction-line.ts"
import type { DiagramUnit } from "../../diagram-units.ts"
import { readUnit } from "../../diagram-units.ts"

/**
 * diagrams/flowchart.md, Lexical structure: the names of the units. A unit
 * that the specification names by its text has that text as its name.
 */
export type UnitName =
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "}"
  | "data-start"
  | "data-quote"
  | "data-text"
  | "call"
  | "callback-name"
  | "callback-arguments"
  | "string"
  | "markdown-string"
  | "empty-string"
  | "style"
  | "default"
  | "linkStyle"
  | "interpolate"
  | "classDef"
  | "class"
  | "href"
  | "click"
  | "click-id"
  | "click-comma"
  | "header-keyword"
  | "no-direction"
  | "header-direction"
  | "subgraph"
  | "end"
  | "link-target"
  | "direction-text"
  | "direction"
  | "direction-value"
  | "edge-id"
  | "@"
  | "number"
  | "#"
  | ":::"
  | "&"
  | ";"
  | ","
  | "*"
  | "arrow"
  | "opening-arrow"
  | "link-text-char"
  | "(-"
  | "(["
  | "[["
  | ">"
  | "[("
  | "((("
  | "[|"
  | "[/"
  | "[\\"
  | "^"
  | "v"
  | "id-run"
  | "-"
  | "letter"
  | "|"
  | "("
  | "["
  | "])"
  | "]]"
  | ")]"
  | ")))"
  | ")"
  | "]"
  | "text-run"
  | "backslash-end"
  | "slash-end"
  | "ellipse-end"
  | "title-text"
  | "description-text"
  | "description-block-text"
  | "newline"
  | "space"

/**
 * diagrams/flowchart.md, Lexical structure: what the lexer reads from the
 * diagram text: its units; the whitespace characters with which it left a
 * click context, which belong to no unit and which the Db leaves out of a
 * subgraph's name text and of a style (Db normalization).
 */
export interface FlowchartLexing {
  readonly units: readonly Unit[]
  readonly clickContextExits: readonly Range[]
}

/**
 * diagrams/flowchart.md, Units and contexts: one unit of the diagram text.
 * The text of a string unit is the content between its quotes.
 */
export interface Unit extends DiagramUnit<UnitName> {
  /**
   * Strings: for a `string` or `markdown-string` unit, where its content,
   * its one run, lies in the source; null for every other unit.
   */
  readonly content: Range | null
  /**
   * Arrows: for an `arrow` or `opening-arrow` unit, the parts of the arrow
   * that its node holds; null for every other unit.
   */
  readonly arrow: ClosedArrowParts | OpeningArrowParts | null
}

/** diagrams/flowchart.md, Units and contexts: the contexts of the lexer. */
type Context =
  | "statement"
  | "header"
  | "title"
  | "description"
  | "description-block"
  | "data"
  | "data-string"
  | "click"
  | "callback-name"
  | "callback-arguments"
  | "label"
  | "slanted"
  | "ellipse"
  | "dash-link-text"
  | "thick-link-text"
  | "dotted-link-text"

/** The keywords of the statement context, rule 7, in the order in which they are tried. */
const STATEMENT_KEYWORDS = [
  "style",
  "default",
  "linkStyle",
  "interpolate",
  "classDef",
  "class",
] as const

/** The header keywords of the statement context, rule 10, in the order in which they are tried. */
const HEADER_KEYWORDS = [
  "flowchart-elk",
  "swimlane-beta",
  "graph",
  "flowchart",
] as const

/** The link targets of the statement context, rule 13. */
const LINK_TARGETS = ["_self", "_blank", "_parent", "_top"] as const

/** The direction line: the values, in the order in which they are tried. */
const DIRECTION_LINE_VALUES: readonly string[] = ["TB", "BT", "RL", "LR", "TD"]

/** The directions of the header context that are words, rule 2. */
const HEADER_DIRECTION_WORDS = [
  "LR",
  "RL",
  "TB",
  "BT",
  "TD",
  "BR",
  "v",
] as const

/** The units of the statement context, rule 17, in the order in which they are tried. */
const STATEMENT_PUNCTUATION = ["#", ":::", ":", "&", ";", ",", "*"] as const

/**
 * The units of the statement context, rule 19, in the order in which they
 * are tried, each with the context that it enters, if any.
 */
const SHAPE_OPENERS: readonly {
  readonly name: UnitName & string
  readonly enters: Context | null
}[] = [
  { name: "(-", enters: "ellipse" },
  { name: "([", enters: "label" },
  { name: "[[", enters: "label" },
  { name: ">", enters: "label" },
  { name: "[(", enters: "label" },
  { name: "(((", enters: "label" },
  { name: "[|", enters: null },
  { name: "[/", enters: "slanted" },
  { name: "[\\", enters: "slanted" },
  { name: "^", enters: null },
]

/** The units that close a label, label context rule 4, in the order in which they are tried. */
const LABEL_CLOSERS = ["])", "]]", ")]", ")))", "|", ")", "]", "}"] as const

/** The context of the text of a link with an opening arrow of each kind. */
const LINK_TEXT_CONTEXTS: Readonly<Record<LinkTextKind, Context>> = {
  dash: "dash-link-text",
  thick: "thick-link-text",
  dotted: "dotted-link-text",
}

/** The character that the text of a link of each kind cannot contain. */
const LINK_TEXT_FORBIDDEN: Readonly<Record<LinkTextKind, number>> = {
  dash: HYPHEN_MINUS,
  thick: EQUALS_SIGN,
  dotted: FULL_STOP,
}

/** Whether the character is one of `codePoints`. */
function isOneOf(
  character: DiagramCharacter,
  codePoints: readonly number[],
): boolean {
  return codePoints.includes(character.codePoint)
}

/** Statement context, rule 21: the characters of an id run that are not ASCII letters or digits, other than `-`. */
const ID_RUN_PUNCTUATION: readonly number[] = [
  EXCLAMATION_MARK,
  QUOTATION_MARK,
  NUMBER_SIGN,
  DOLLAR_SIGN,
  PERCENT_SIGN,
  AMPERSAND,
  APOSTROPHE,
  ASTERISK,
  PLUS_SIGN,
  FULL_STOP,
  GRAVE_ACCENT,
  QUESTION_MARK,
  REVERSE_SOLIDUS,
  LOW_LINE,
  SOLIDUS,
]

/** Statement context, rule 21: the characters of an id run other than `-`, which depends on what follows it. */
function isIdRunCharacter(codePoint: number): boolean {
  return (
    isAsciiLetter(codePoint) ||
    isAsciiDigit(codePoint) ||
    ID_RUN_PUNCTUATION.includes(codePoint)
  )
}

/**
 * diagrams/flowchart.md, Lexical structure: the lexer that divides the
 * diagram text into units. It keeps a stack of contexts and, at each place,
 * applies the first rule of the current context that matches. The rules are
 * those of the specification, in its order; each method that reads a context
 * names the section it follows.
 *
 * The lexer does not depend on the grammar: a rule alone decides which
 * context is entered or left.
 */
export class UnitLexer {
  private readonly reader: DiagramText

  private readonly lines: LineIndex

  private readonly units: Unit[] = []

  /**
   * Click and callbacks: the whitespace characters with which the lexer
   * left a click context, rule 2, in source order. They belong to no unit.
   */
  private readonly clickContextExits: Range[] = []

  /** The stack of contexts; the last one is the current context. */
  private readonly contexts: Context[] = ["statement"]

  /** The place of the next character to read; null at the end of the text. */
  private position: DiagramPosition

  /** Statement context, rule 10: whether a header keyword was read already. */
  private headerKeywordRead = false

  /** Statement context, rule 14: the direction line, with the values of the flowchart. */
  private readonly directionLine: DirectionLineRule

  public constructor(reader: DiagramText, lines: LineIndex) {
    this.reader = reader
    this.lines = lines
    this.position = reader.first()
    this.directionLine = new DirectionLineRule(reader, DIRECTION_LINE_VALUES)
  }

  /** Divides the diagram text into units. Throws `ParseError` where no rule matches. */
  public lex(): FlowchartLexing {
    while (this.position !== null) {
      this.readInContext(this.position, this.currentContext())
    }
    // Click and callbacks: the text may not end in a callback context. The
    // error is at the unit that entered the context: the `call` for the
    // callback name context, and the `(` that opens the arguments for the
    // callback arguments context.
    const context = this.currentContext()
    if (context === "callback-name") {
      throw this.unclosedAt(
        this.lastUnitNamed("call"),
        "The callback after call has no ( before the end of the text",
      )
    }
    if (context === "callback-arguments") {
      throw this.unclosedAt(
        this.lastUnitNamed("("),
        "The arguments of the callback have no ) before the end of the text",
      )
    }
    return {
      units: this.units,
      clickContextExits: this.clickContextExits,
    }
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
      case "header":
        this.readInHeaderContext(at)
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
      case "data":
        this.readInDataContext(at)
        return
      case "data-string":
        this.readInDataStringContext(at)
        return
      case "click":
        this.readInClickContext(at)
        return
      case "callback-name":
        this.readInCallbackNameContext(at)
        return
      case "callback-arguments":
        this.readInCallbackArgumentsContext(at)
        return
      case "label":
        this.readInLabelContext(at)
        return
      case "slanted":
        this.readInSlantedContext(at)
        return
      case "ellipse":
        this.readInEllipseContext(at)
        return
      case "dash-link-text":
        this.readInLinkTextContext(at, "dash")
        return
      case "thick-link-text":
        this.readInLinkTextContext(at, "thick")
        return
      case "dotted-link-text":
        this.readInLinkTextContext(at, "dotted")
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
   * and not including, `to`. Its text is those characters.
   */
  private addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
  ): void {
    this.addUnitWithText(name, from, to, null, null)
  }

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`. Its text is `text`, or those characters when
   * `text` is null; `content` is where the content of a string lies.
   */
  private addUnitWithText(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    text: string | null,
    content: Range | null,
  ): void {
    this.units.push({
      ...readUnit(this.reader, name, this.units.length, from, to, text),
      content,
      arrow: null,
    })
  }

  /**
   * Adds the `arrow` or `opening-arrow` unit, as its parts say, that reads
   * the characters from `from` up to, and not including, `to`: the arrow
   * with the whitespace around it.
   */
  private addArrowUnit(
    from: DiagramCharacter,
    to: DiagramPosition,
    parts: ClosedArrowParts | OpeningArrowParts,
  ): void {
    const name = parts.form === "closed" ? "arrow" : "opening-arrow"
    this.units.push({
      ...readUnit(this.reader, name, this.units.length, from, to, null),
      content: null,
      arrow: parts,
    })
  }

  /** The place after the whitespace at `from`, line feeds included. */
  private afterWhitespace(from: DiagramPosition): DiagramPosition {
    return skipWhitespace(this.reader, from)
  }

  /** Reads `word` from `at`, one character at a time; null when the diagram text differs. */
  private word(at: DiagramPosition, word: string): Match | null {
    return matchWord(this.reader, at, word)
  }

  /** Reads `word` from `at` when no word character follows it; null otherwise. */
  private wholeWord(at: DiagramPosition, word: string): Match | null {
    return matchWholeWord(this.reader, at, word)
  }

  /**
   * diagrams/flowchart.md, The statement context: applies the first of the
   * 26 rules that matches at `at`.
   */
  private readInStatementContext(at: DiagramCharacter): void {
    const applied =
      this.readAccessibilityMarker(at) ||
      this.readDataStart(at) ||
      this.readCallKeyword(at) ||
      this.readString(at) ||
      this.readStatementKeyword(at) ||
      this.readHrefKeyword(at) ||
      this.readClickKeyword(at) ||
      this.readHeaderKeyword(at) ||
      this.readSubgraphKeyword(at) ||
      this.readEndKeyword(at) ||
      this.readLinkTarget(at) ||
      this.readDirectionLine(at) ||
      this.readEdgeId(at) ||
      this.readNumber(at) ||
      this.readStatementPunctuation(at) ||
      this.readArrow(at) ||
      this.readShapeOpener(at) ||
      this.readLetterV(at) ||
      this.readIdRun(at) ||
      this.readMinus(at) ||
      this.readLetter(at) ||
      this.readLabelOpener(at) ||
      this.readNewline(at) ||
      this.readSpace(at)
    if (!applied) throw this.noRuleMatches(at)
  }

  /**
   * Statement context, rules 1 to 3: `accTitle` or `accDescr`, whitespace,
   * `:` (or `{` after `accDescr`), and whitespace. The keyword and the
   * punctuation are a unit each; the whitespace is read outside them.
   */
  private readAccessibilityMarker(at: DiagramCharacter): boolean {
    const title = this.word(at, "accTitle")
    if (title !== null) {
      const colon = this.afterWhitespace(title.end)
      if (isCodePointAt(colon, COLON)) {
        this.addUnit("accTitle", at, title.end)
        this.addUnit(":", colon, this.reader.after(colon))
        this.position = this.afterWhitespace(this.reader.after(colon))
        this.enter("title")
        return true
      }
    }
    const description = this.word(at, "accDescr")
    if (description === null) return false
    const mark = this.afterWhitespace(description.end)
    if (isCodePointAt(mark, COLON)) {
      this.addUnit("accDescr", at, description.end)
      this.addUnit(":", mark, this.reader.after(mark))
      this.position = this.afterWhitespace(this.reader.after(mark))
      this.enter("description")
      return true
    }
    if (isCodePointAt(mark, LEFT_CURLY_BRACKET)) {
      this.addUnit("accDescr", at, description.end)
      this.addUnit("{", mark, this.reader.after(mark))
      this.position = this.afterWhitespace(this.reader.after(mark))
      this.enter("description-block")
      return true
    }
    return false
  }

  /** Statement context, rule 4: `@{` is a `data-start` unit and enters the data context. */
  private readDataStart(at: DiagramCharacter): boolean {
    const match = this.word(at, "@{")
    if (match === null) return false
    this.addUnit("data-start", at, match.end)
    this.position = match.end
    this.enter("data")
    return true
  }

  /**
   * Statement context, rule 5: `call` and one or more whitespace. The word
   * is a `call` unit; the rule enters the callback name context.
   */
  private readCallKeyword(at: DiagramCharacter): boolean {
    const match = this.word(at, "call")
    if (match === null || !isWhitespaceAt(match.end)) return false
    this.addUnit("call", at, match.end)
    this.position = this.afterWhitespace(match.end)
    this.enter("callback-name")
    return true
  }

  /**
   * Statement context, rule 7: a keyword that no word character follows is a
   * unit named by its text.
   */
  private readStatementKeyword(at: DiagramCharacter): boolean {
    for (const keyword of STATEMENT_KEYWORDS) {
      const match = this.wholeWord(at, keyword)
      if (match !== null) {
        this.addUnit(keyword, at, match.end)
        this.position = match.end
        return true
      }
    }
    return false
  }

  /** Statement context, rule 8: `href` and one whitespace character; the word is an `href` unit. */
  private readHrefKeyword(at: DiagramCharacter): boolean {
    const match = this.word(at, "href")
    if (match === null || !isWhitespaceAt(match.end)) return false
    this.addUnit("href", at, match.end)
    this.position = this.reader.after(match.end)
    return true
  }

  /**
   * Statement context, rule 9: `click` and one or more whitespace. The word
   * is a `click` unit; the rule enters the click context.
   */
  private readClickKeyword(at: DiagramCharacter): boolean {
    const match = this.word(at, "click")
    if (match === null || !isWhitespaceAt(match.end)) return false
    this.addUnit("click", at, match.end)
    this.position = this.afterWhitespace(match.end)
    this.enter("click")
    // Click and callbacks: the text may not end in the click context before
    // it reads anything. The error is at the `click`.
    if (this.position === null) {
      throw this.unclosedAt(
        this.lastUnitNamed("click"),
        "click has no click id before the end of the text",
      )
    }
    return true
  }

  /**
   * The error for a text that ends in a context that may not end there,
   * with the message `message`, at `entry`, the unit that entered it.
   */
  private unclosedAt(entry: Unit, message: string): ParseError {
    const range: Range = entry.significantRange ?? [entry.start, entry.end]
    return new ParseError(message, range, this.lines.location(range))
  }

  /** The last unit named `name` read so far; the context that the caller asks about was entered by it. */
  private lastUnitNamed(name: UnitName): Unit {
    const unit = this.units
      .filter((candidate) => candidate.name === name)
      .at(-1)
    if (unit === undefined) {
      throw new Error(`mmd-toolkit parser bug: no ${name} unit read`)
    }
    return unit
  }

  /**
   * Statement context, rule 10: a header keyword that no word character
   * follows. The first one in the text also enters the header context.
   */
  private readHeaderKeyword(at: DiagramCharacter): boolean {
    for (const keyword of HEADER_KEYWORDS) {
      const match = this.wholeWord(at, keyword)
      if (match !== null) {
        this.addUnit("header-keyword", at, match.end)
        this.position = match.end
        if (!this.headerKeywordRead) this.enter("header")
        this.headerKeywordRead = true
        return true
      }
    }
    return false
  }

  /** Statement context, rule 11: `subgraph` that no word character follows. */
  private readSubgraphKeyword(at: DiagramCharacter): boolean {
    const match = this.wholeWord(at, "subgraph")
    if (match === null) return false
    this.addUnit("subgraph", at, match.end)
    this.position = match.end
    return true
  }

  /**
   * Statement context, rule 12: `end` that no word character follows, and
   * all whitespace after it, line feeds included, as one `end` unit.
   */
  private readEndKeyword(at: DiagramCharacter): boolean {
    const match = this.wholeWord(at, "end")
    if (match === null) return false
    const end = this.afterWhitespace(match.end)
    this.addUnit("end", at, end)
    this.position = end
    return true
  }

  /** Statement context, rule 13: a link target that no word character follows. */
  private readLinkTarget(at: DiagramCharacter): boolean {
    for (const target of LINK_TARGETS) {
      const match = this.wholeWord(at, target)
      if (match !== null) {
        this.addUnit("link-target", at, match.end)
        this.position = match.end
        return true
      }
    }
    return false
  }

  /**
   * Statement context, rule 14, The direction line: the units of the
   * direction line that starts at `at`, with the values of the flowchart
   * (see `DirectionLineRule`).
   */
  private readDirectionLine(at: DiagramCharacter): boolean {
    const line = this.directionLine.match(at)
    if (line === null) return false
    for (const unit of line.units) this.addUnit(unit.name, unit.from, unit.to)
    this.position = line.end
    return true
  }

  /**
   * Statement context, rule 15: an edge id. A run of characters that are
   * neither whitespace nor `"`, ending with an `@` that is followed by a
   * character other than `{` and `"`; the run ends at the last such `@`
   * before the next whitespace or `"`. The characters before that `@` are
   * an `edge-id` unit, and the `@` is an `@` unit.
   */
  private readEdgeId(at: DiagramCharacter): boolean {
    let lastAt: DiagramCharacter | null = null
    for (
      let position: DiagramPosition = at;
      position !== null &&
      !isWhitespace(position.codePoint) &&
      position.codePoint !== QUOTATION_MARK;
      position = this.reader.after(position)
    ) {
      if (position.codePoint !== COMMERCIAL_AT || samePosition(position, at)) {
        continue
      }
      const following = this.reader.after(position)
      if (
        following !== null &&
        following.codePoint !== LEFT_CURLY_BRACKET &&
        following.codePoint !== QUOTATION_MARK
      ) {
        lastAt = position
      }
    }
    if (lastAt === null) return false
    this.addUnit("edge-id", at, lastAt)
    this.addUnit("@", lastAt, this.reader.after(lastAt))
    this.position = this.reader.after(lastAt)
    return true
  }

  /** Statement context, rule 16: one or more ASCII digits are a `number` unit. */
  private readNumber(at: DiagramCharacter): boolean {
    const end = skipWhile(this.reader, at, (character) =>
      isAsciiDigit(character.codePoint),
    )
    if (samePosition(end, at)) return false
    this.addUnit("number", at, end)
    this.position = end
    return true
  }

  /** Statement context, rule 17: `#`, `:::`, `:`, `&`, `;`, `,`, or `*`, a unit named by its text. */
  private readStatementPunctuation(at: DiagramCharacter): boolean {
    for (const punctuation of STATEMENT_PUNCTUATION) {
      const match = this.word(at, punctuation)
      if (match !== null) {
        this.addUnit(punctuation, at, match.end)
        this.position = match.end
        return true
      }
    }
    return false
  }

  /**
   * Statement context, rule 18, and Arrows: zero or more whitespace, the
   * arrow itself, and zero or more whitespace, as one unit. A closed arrow
   * is an `arrow` unit; an opening arrow is an `opening-arrow` unit and
   * enters the link text context of its kind.
   */
  private readArrow(at: DiagramCharacter): boolean {
    const arrow = matchArrow(this.reader, this.afterWhitespace(at))
    if (arrow === null) return false
    const end = this.afterWhitespace(arrow.end)
    this.addArrowUnit(at, end, arrow.parts)
    this.position = end
    if (arrow.parts.form === "opening") {
      this.enter(LINK_TEXT_CONTEXTS[arrow.parts.opens])
    }
    return true
  }

  /**
   * Statement context, rule 19: the units that open a shape other than with
   * a single `(`, `[`, or `{`, and `^`, each named by its text; then `\|`,
   * which is rejected.
   */
  private readShapeOpener(at: DiagramCharacter): boolean {
    for (const opener of SHAPE_OPENERS) {
      const match = this.word(at, opener.name)
      if (match !== null) {
        this.addUnit(opener.name, at, match.end)
        this.position = match.end
        if (opener.enters !== null) this.enter(opener.enters)
        return true
      }
    }
    if (this.word(at, "\\|") !== null) throw this.noRuleMatches(at)
    return false
  }

  /** Statement context, rule 20: `v` that no word character follows is a `v` unit. */
  private readLetterV(at: DiagramCharacter): boolean {
    if (at.codePoint !== LATIN_SMALL_LETTER_V) return false
    const end = this.reader.after(at)
    if (isWordCharacterAt(end)) return false
    this.addUnit("v", at, end)
    this.position = end
    return true
  }

  /**
   * Statement context, rule 21: an id run, as many characters as possible,
   * each an ASCII letter or digit, one of the listed characters, or a `-`
   * followed by a character other than `>`, `-`, and `.`.
   */
  private readIdRun(at: DiagramCharacter): boolean {
    const end = skipWhile(this.reader, at, (character) => {
      if (character.codePoint !== HYPHEN_MINUS) {
        return isIdRunCharacter(character.codePoint)
      }
      const following = this.reader.after(character)
      return (
        following !== null &&
        !isOneOf(following, [GREATER_THAN_SIGN, HYPHEN_MINUS, FULL_STOP])
      )
    })
    if (samePosition(end, at)) return false
    this.addUnit("id-run", at, end)
    this.position = end
    return true
  }

  /** Statement context, rule 22: `-` is a `-` unit. */
  private readMinus(at: DiagramCharacter): boolean {
    if (at.codePoint !== HYPHEN_MINUS) return false
    this.addUnit("-", at, this.reader.after(at))
    this.position = this.reader.after(at)
    return true
  }

  /** Statement context, rule 23: a Unicode letter is a `letter` unit of one character. */
  private readLetter(at: DiagramCharacter): boolean {
    if (!isUnicodeLetter(at.codePoint)) return false
    this.addUnit("letter", at, this.reader.after(at))
    this.position = this.reader.after(at)
    return true
  }

  /** Statement context, rule 24: `|`, `(`, `[`, or `{` is a unit named by its text and enters the label context. */
  private readLabelOpener(at: DiagramCharacter): boolean {
    for (const opener of ["|", "(", "[", "{"] as const) {
      const match = this.word(at, opener)
      if (match !== null) {
        this.addUnit(opener, at, match.end)
        this.position = match.end
        this.enter("label")
        return true
      }
    }
    return false
  }

  /** Statement context, rule 25: one or more line feeds are a `newline` unit. */
  private readNewline(at: DiagramCharacter): boolean {
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint === LINE_FEED,
    )
    if (samePosition(end, at)) return false
    this.addUnit("newline", at, end)
    this.position = end
    return true
  }

  /** Statement context, rule 26: one or more whitespace characters other than line feeds are a `space` unit. */
  private readSpace(at: DiagramCharacter): boolean {
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        isWhitespace(character.codePoint) && character.codePoint !== LINE_FEED,
    )
    if (samePosition(end, at)) return false
    this.addUnit("space", at, end)
    this.position = end
    return true
  }

  /**
   * diagrams/flowchart.md, Strings: a string starts at a `"` and is read in
   * the string context, or in the markdown string context when a backtick
   * follows the `"`. These contexts may enter further string contexts, and
   * the string ends when the lexer leaves the context that its opening `"`
   * entered. The whole string is one unit: an `empty-string` unit without
   * content, a `string` or `markdown-string` unit whose text is its one run
   * of content, and rejected with two or more runs.
   */
  private readString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    /** The string contexts entered and not left yet; the last one is the current one. */
    const stringContexts: ("string" | "markdown-string")[] = []
    const runs: {
      readonly name: UnitName
      readonly text: string
      readonly range: Range
    }[] = []
    let position = this.enterStringContext(at, stringContexts)
    while (stringContexts.length > 0) {
      if (position === null) throw this.noRuleMatches(at)
      const current = stringContexts[stringContexts.length - 1]
      if (current === "string") {
        if (position.codePoint === QUOTATION_MARK) {
          const following = this.reader.after(position)
          if (isCodePointAt(following, GRAVE_ACCENT)) {
            // String context, rule 1.
            position = this.enterStringContext(position, stringContexts)
          } else {
            // String context, rule 2.
            stringContexts.pop()
            position = following
          }
        } else {
          // String context, rule 3.
          const end = skipWhile(
            this.reader,
            position,
            (character) => character.codePoint !== QUOTATION_MARK,
          )
          runs.push({
            name: "string",
            text: this.textBetween(position, end),
            range: this.rangeBetween(position, end),
          })
          position = end
        }
      } else if (position.codePoint === GRAVE_ACCENT) {
        // Markdown string context, rule 2; a backtick that `"` does not
        // follow matches no rule.
        const following = this.reader.after(position)
        if (!isCodePointAt(following, QUOTATION_MARK)) {
          throw this.noRuleMatches(position)
        }
        stringContexts.pop()
        position = this.reader.after(following)
      } else if (position.codePoint === QUOTATION_MARK) {
        // Markdown string context, rules 3 and 4.
        position = this.enterStringContext(position, stringContexts)
      } else {
        // Markdown string context, rule 1.
        const end = skipWhile(
          this.reader,
          position,
          (character) =>
            character.codePoint !== GRAVE_ACCENT &&
            character.codePoint !== QUOTATION_MARK,
        )
        runs.push({
          name: "markdown-string",
          text: this.textBetween(position, end),
          range: this.rangeBetween(position, end),
        })
        position = end
      }
    }
    if (runs.length > 1) throw this.noRuleMatches(at)
    if (runs.length === 0) {
      this.addUnitWithText("empty-string", at, position, "", null)
    } else {
      const [run] = runs
      this.addUnitWithText(run.name, at, position, run.text, run.range)
    }
    this.position = position
    return true
  }

  /**
   * Strings: enters the string context that the `"` at `quote` opens: the
   * markdown string context when a backtick follows it, and the string
   * context otherwise. Returns the place after the `"`, and after the
   * backtick.
   */
  private enterStringContext(
    quote: DiagramCharacter,
    stringContexts: ("string" | "markdown-string")[],
  ): DiagramPosition {
    const following = this.reader.after(quote)
    if (isCodePointAt(following, GRAVE_ACCENT)) {
      stringContexts.push("markdown-string")
      return this.reader.after(following)
    }
    stringContexts.push("string")
    return following
  }

  /** Where the characters from `from` up to, and not including, `to` lie in the source. */
  private rangeBetween(from: DiagramCharacter, to: DiagramPosition): Range {
    let end = from.start
    for (
      let position: DiagramPosition = from;
      position !== null && !samePosition(position, to);
      position = this.reader.after(position)
    ) {
      end = position.end
    }
    return [from.start, end]
  }

  /** The characters from `from` up to, and not including, `to`, in converted form. */
  private textBetween(from: DiagramCharacter, to: DiagramPosition): string {
    let text = ""
    for (
      let position: DiagramPosition = from;
      position !== null && !samePosition(position, to);
      position = this.reader.after(position)
    ) {
      text += String.fromCodePoint(position.codePoint)
    }
    return text
  }

  /**
   * diagrams/flowchart.md, The header context: whitespace that contains a
   * line feed, up to and including its last line feed, is a `no-direction`
   * unit; zero or more whitespace and a direction is a `header-direction`
   * unit of the direction. Both leave the context. A `"` is a string, after
   * which the lexer is back in the header context.
   */
  private readInHeaderContext(at: DiagramCharacter): void {
    // Rule 3; rules 1 and 2 start with whitespace or a direction, never
    // with `"`.
    if (this.readString(at)) return
    let lastLineFeed: DiagramCharacter | null = null
    let direction: DiagramPosition = at
    while (isWhitespaceAt(direction)) {
      if (direction.codePoint === LINE_FEED) lastLineFeed = direction
      direction = this.reader.after(direction)
    }
    if (lastLineFeed !== null) {
      const afterLastLineFeed = this.reader.after(lastLineFeed)
      this.addUnit("no-direction", at, afterLastLineFeed)
      this.position = afterLastLineFeed
      this.leave()
      return
    }
    if (direction === null) throw this.noRuleMatches(at)
    for (const word of HEADER_DIRECTION_WORDS) {
      const match = this.wholeWord(direction, word)
      if (match !== null) {
        this.addUnit("header-direction", direction, match.end)
        this.position = match.end
        this.leave()
        return
      }
    }
    if (
      isOneOf(direction, [LESS_THAN_SIGN, GREATER_THAN_SIGN, CIRCUMFLEX_ACCENT])
    ) {
      this.addUnit("header-direction", direction, this.reader.after(direction))
      this.position = this.reader.after(direction)
      this.leave()
      return
    }
    throw this.noRuleMatches(direction)
  }

  /**
   * diagrams/flowchart.md, Accessibility values: in the title context and
   * in the description context, a line feed leaves the context without
   * being read, and one or more other characters are a unit named `name`.
   */
  private readRestOfLine(
    at: DiagramCharacter,
    name: "title-text" | "description-text",
  ): void {
    if (at.codePoint === LINE_FEED) {
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== LINE_FEED,
    )
    this.addUnit(name, at, end)
    this.position = end
  }

  /**
   * Accessibility values: in the description block context, `}` is a `}`
   * unit and leaves the context, and one or more other characters are a
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

  /**
   * diagrams/flowchart.md, Data blocks, the data context: `"` is a
   * `data-quote` unit and enters the data string context; one or more
   * characters other than `}`, `^`, and `"` are a `data-text` unit; `}` is a
   * `}` unit and leaves the context.
   */
  private readInDataContext(at: DiagramCharacter): void {
    if (at.codePoint === QUOTATION_MARK) {
      this.addUnit("data-quote", at, this.reader.after(at))
      this.position = this.reader.after(at)
      this.enter("data-string")
      return
    }
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      this.addUnit("}", at, this.reader.after(at))
      this.position = this.reader.after(at)
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        !isOneOf(character, [
          RIGHT_CURLY_BRACKET,
          CIRCUMFLEX_ACCENT,
          QUOTATION_MARK,
        ]),
    )
    if (samePosition(end, at)) throw this.noRuleMatches(at)
    this.addUnit("data-text", at, end)
    this.position = end
  }

  /**
   * Data blocks, the data string context: `"` is a `data-quote` unit and
   * leaves the context, and one or more other characters are a `data-text`
   * unit.
   */
  private readInDataStringContext(at: DiagramCharacter): void {
    if (at.codePoint === QUOTATION_MARK) {
      this.addUnit("data-quote", at, this.reader.after(at))
      this.position = this.reader.after(at)
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== QUOTATION_MARK,
    )
    this.addUnit("data-text", at, end)
    this.position = end
  }

  /**
   * diagrams/flowchart.md, Click and callbacks, the click context: `"` is
   * a string, after which the lexer is back in the click context; one
   * whitespace character leaves the context; one or more characters other
   * than whitespace are read at once: each `,` among them is a
   * `click-comma` unit, and each run of the other characters is a
   * `click-id` unit. So the string rule applies only at the start of the
   * context and right after a string, and a `"` after a `,` or inside an id
   * belongs to the id.
   */
  private readInClickContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    if (isWhitespace(at.codePoint)) {
      this.clickContextExits.push([at.start, at.end])
      this.position = this.reader.after(at)
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => !isWhitespace(character.codePoint),
    )
    let position: DiagramPosition = at
    while (position !== null && !samePosition(position, end)) {
      if (position.codePoint === COMMA) {
        const afterComma = this.reader.after(position)
        this.addUnit("click-comma", position, afterComma)
        position = afterComma
      } else {
        const runEnd = skipWhile(
          this.reader,
          position,
          (character) =>
            character.codePoint !== COMMA && !isWhitespace(character.codePoint),
        )
        this.addUnit("click-id", position, runEnd)
        position = runEnd
      }
    }
    this.position = end
  }

  /**
   * Click and callbacks, the callback name context: `(`, whitespace, and
   * `)` are a `(` unit and a `)` unit and leave the context; `(` alone is a
   * `(` unit, leaves the context, and enters the callback arguments
   * context; one or more characters other than `(` are a `callback-name`
   * unit.
   */
  private readInCallbackNameContext(at: DiagramCharacter): void {
    if (at.codePoint !== LEFT_PARENTHESIS) {
      const end = skipWhile(
        this.reader,
        at,
        (character) => character.codePoint !== LEFT_PARENTHESIS,
      )
      this.addUnit("callback-name", at, end)
      this.position = end
      return
    }
    this.addUnit("(", at, this.reader.after(at))
    this.leave()
    const closing = this.afterWhitespace(this.reader.after(at))
    if (isCodePointAt(closing, RIGHT_PARENTHESIS)) {
      this.addUnit(")", closing, this.reader.after(closing))
      this.position = this.reader.after(closing)
      return
    }
    this.position = this.reader.after(at)
    this.enter("callback-arguments")
  }

  /**
   * Click and callbacks, the callback arguments context: `)` is a `)` unit
   * and leaves the context, and one or more other characters are a
   * `callback-arguments` unit.
   */
  private readInCallbackArgumentsContext(at: DiagramCharacter): void {
    if (at.codePoint === RIGHT_PARENTHESIS) {
      this.addUnit(")", at, this.reader.after(at))
      this.position = this.reader.after(at)
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== RIGHT_PARENTHESIS,
    )
    this.addUnit("callback-arguments", at, end)
    this.position = end
  }

  /**
   * The label, slanted, and ellipse contexts, rule 2: zero or more
   * whitespace and three or more `~` are rejected.
   */
  private rejectTildesAt(at: DiagramCharacter): void {
    let tildes = 0
    let position = this.afterWhitespace(at)
    while (isCodePointAt(position, TILDE)) {
      tildes += 1
      position = this.reader.after(position)
    }
    if (tildes >= 3) throw this.noRuleMatches(at)
  }

  /**
   * diagrams/flowchart.md, The label context: a string; whitespace and
   * `~~~`, rejected; `(-`, `([`, or `(((`, rejected; a unit that closes a
   * label, which leaves the context; `(` or `{`, which enters the label
   * context; one or more characters other than `[`, `]`, `(`, `)`, `{`,
   * `}`, `|`, and `"`, a `text-run` unit.
   */
  private readInLabelContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    this.rejectTildesAt(at)
    for (const rejected of ["(-", "([", "((("]) {
      if (this.word(at, rejected) !== null) throw this.noRuleMatches(at)
    }
    for (const closer of LABEL_CLOSERS) {
      const match = this.word(at, closer)
      if (match !== null) {
        this.addUnit(closer, at, match.end)
        this.position = match.end
        this.leave()
        return
      }
    }
    for (const opener of ["(", "{"] as const) {
      const match = this.word(at, opener)
      if (match !== null) {
        this.addUnit(opener, at, match.end)
        this.position = match.end
        this.enter("label")
        return
      }
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        !isOneOf(character, [
          LEFT_SQUARE_BRACKET,
          RIGHT_SQUARE_BRACKET,
          LEFT_PARENTHESIS,
          RIGHT_PARENTHESIS,
          LEFT_CURLY_BRACKET,
          RIGHT_CURLY_BRACKET,
          VERTICAL_LINE,
          QUOTATION_MARK,
        ]),
    )
    if (samePosition(end, at)) throw this.noRuleMatches(at)
    this.addUnit("text-run", at, end)
    this.position = end
  }

  /**
   * diagrams/flowchart.md, The slanted context: a string; whitespace and
   * `~~~`, rejected; one of `\`, `(`, `?`, `=`, `]`, `)` followed by `]`, a
   * `backslash-end` unit, which leaves the context; `/]`, a `slash-end`
   * unit, which leaves the context; `/` or `\` not followed by `]`, or one
   * or more characters other than `\`, `[`, `]`, `(`, `)`, `{`, `}`, and
   * `/`, a `text-run` unit.
   */
  private readInSlantedContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    this.rejectTildesAt(at)
    const following = this.reader.after(at)
    const closesWithBracket = isCodePointAt(following, RIGHT_SQUARE_BRACKET)
    if (
      closesWithBracket &&
      isOneOf(at, [
        REVERSE_SOLIDUS,
        LEFT_PARENTHESIS,
        QUESTION_MARK,
        EQUALS_SIGN,
        RIGHT_SQUARE_BRACKET,
        RIGHT_PARENTHESIS,
      ])
    ) {
      this.addUnit("backslash-end", at, this.reader.after(following))
      this.position = this.reader.after(following)
      this.leave()
      return
    }
    if (closesWithBracket && at.codePoint === SOLIDUS) {
      this.addUnit("slash-end", at, this.reader.after(following))
      this.position = this.reader.after(following)
      this.leave()
      return
    }
    if (isOneOf(at, [SOLIDUS, REVERSE_SOLIDUS])) {
      this.addUnit("text-run", at, following)
      this.position = following
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        !isOneOf(character, [
          REVERSE_SOLIDUS,
          LEFT_SQUARE_BRACKET,
          RIGHT_SQUARE_BRACKET,
          LEFT_PARENTHESIS,
          RIGHT_PARENTHESIS,
          LEFT_CURLY_BRACKET,
          RIGHT_CURLY_BRACKET,
          SOLIDUS,
        ]),
    )
    if (samePosition(end, at)) throw this.noRuleMatches(at)
    this.addUnit("text-run", at, end)
    this.position = end
  }

  /**
   * diagrams/flowchart.md, The ellipse context: a string; whitespace and
   * `~~~`, rejected; `-`, `/`, or `)` followed by `)`, an `ellipse-end`
   * unit, which leaves the context; one character other than `(`, `)`,
   * `[`, `]`, `{`, and `}`, a `text-run` unit of that one character, or of
   * the whole placeholder of an entity.
   */
  private readInEllipseContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    this.rejectTildesAt(at)
    const following = this.reader.after(at)
    if (
      isOneOf(at, [HYPHEN_MINUS, SOLIDUS, RIGHT_PARENTHESIS]) &&
      isCodePointAt(following, RIGHT_PARENTHESIS)
    ) {
      this.addUnit("ellipse-end", at, this.reader.after(following))
      this.position = this.reader.after(following)
      this.leave()
      return
    }
    if (
      isOneOf(at, [
        LEFT_PARENTHESIS,
        RIGHT_PARENTHESIS,
        LEFT_SQUARE_BRACKET,
        RIGHT_SQUARE_BRACKET,
        LEFT_CURLY_BRACKET,
        RIGHT_CURLY_BRACKET,
      ])
    ) {
      throw this.noRuleMatches(at)
    }
    const end = this.afterOneCharacter(at)
    this.addUnit("text-run", at, end)
    this.position = end
  }

  /**
   * diagrams/flowchart.md, The link text contexts: a string; a closed arrow
   * of the same kind with its whitespace, an `arrow` unit, which leaves the
   * context; one character other than the kind's character, or, in the
   * dash context, a `-` that another `-` does not follow, a
   * `link-text-char` unit, which is the whole placeholder of an entity.
   */
  private readInLinkTextContext(
    at: DiagramCharacter,
    kind: LinkTextKind,
  ): void {
    if (this.readString(at)) return
    const arrow = matchClosedArrow(this.reader, this.afterWhitespace(at), kind)
    if (arrow !== null) {
      const end = this.afterWhitespace(arrow.end)
      this.addArrowUnit(at, end, arrow.parts)
      this.position = end
      this.leave()
      return
    }
    const following = this.reader.after(at)
    if (at.codePoint === LINK_TEXT_FORBIDDEN[kind]) {
      const isLoneDash =
        kind === "dash" && !isCodePointAt(following, HYPHEN_MINUS)
      if (!isLoneDash) throw this.noRuleMatches(at)
    }
    const end = this.afterOneCharacter(at)
    this.addUnit("link-text-char", at, end)
    this.position = end
  }

  /**
   * common.md, Entities: where a rule that reads one character at a time
   * ends its unit at `at`. That is after the one character, except at the
   * start of the placeholder of an entity: the placeholder stands for the
   * entity's source characters as a whole, so the rule reads all of it as
   * one unit, which holds the whole entity.
   */
  private afterOneCharacter(at: DiagramCharacter): DiagramPosition {
    const { placeholderEnd } = at
    let end = this.reader.after(at)
    if (placeholderEnd === null) return end
    while (end !== null && end.start < placeholderEnd) {
      end = this.reader.after(end)
    }
    return end
  }
}
