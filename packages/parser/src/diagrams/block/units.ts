import { isAsciiDigit, isWhitespace } from "../../character-classes.ts"
import {
  COLON,
  COMMA,
  EQUALS_SIGN,
  FULL_STOP,
  GRAVE_ACCENT,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LATIN_SMALL_LETTER_O,
  LATIN_SMALL_LETTER_X,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  LESS_THAN_SIGN,
  LINE_FEED,
  QUOTATION_MARK,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
} from "../../code-points.ts"
import type {
  BlockArrowEndMarker,
  BlockArrowLine,
  BlockArrowStartMarker,
} from "../../ast/block.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import { readUnit, significantRangeOf } from "../../diagram-units.ts"
import type { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import {
  isBefore,
  isCodePointAt,
  isWhitespaceAt,
  isWordCharacterAt,
  matchWholeWord,
  matchWord,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"
import type { Match } from "../../scanning.ts"
import { UnitLexer } from "../../unit-lexer.ts"

/** diagrams/block.md, Units and contexts: the names of the units. */
export type UnitName =
  // The statement context.
  | "block-beta"
  | "block:"
  | "block"
  | "columns"
  | "digits"
  | "auto"
  | "space:"
  | "space"
  | "default"
  | "linkStyle"
  | "interpolate"
  | "classDef"
  | "class"
  | "style"
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "end"
  | "shape-open"
  | "<["
  | "id"
  | "arrow"
  | "opening-arrow"
  // The string contexts.
  | "string"
  | "markdown-string"
  // The description block context.
  | "description-block-text"
  | "}"
  // The shape context.
  | "shape-close"
  // The block arrow and directions contexts.
  | "]>"
  | "("
  | "direction"
  | "direction-space"
  | ")"
  | ","
  // The class definition, class, and style contexts.
  | "class-id"
  | "id-comma"
  | "class-id-space"
  | "class-name"
  | "style-text"

/**
 * diagrams/block.md, Edges: the parts of an arrow that its node holds
 * besides its text (ast/block.md, BlockArrow).
 */
export interface ClosedArrowParts {
  readonly form: "closed"
  readonly startMarker: BlockArrowStartMarker
  readonly line: BlockArrowLine
  readonly length: number
  readonly endMarker: BlockArrowEndMarker
}

/**
 * diagrams/block.md, Edges: the parts of an opening arrow that its node
 * holds besides its text (ast/block.md, BlockOpeningArrow).
 */
export interface OpeningArrowParts {
  readonly form: "opening"
  readonly startMarker: BlockArrowStartMarker
  readonly line: BlockArrowLine
}

/**
 * diagrams/block.md, Units and contexts: one unit of the block lexer. The
 * text of a string unit is the content between its quotes.
 */
export interface Unit extends DiagramUnit<UnitName> {
  /** Edges: for an `arrow` or an `opening-arrow` unit, its parts; null for every other unit. */
  readonly arrow: ClosedArrowParts | OpeningArrowParts | null
}

/** diagrams/block.md, Units and contexts: the contexts of the lexer. */
type Context =
  | "statement"
  | "string"
  | "markdown-string"
  | "description-block"
  | "shape"
  | "block-arrow"
  | "directions-opening"
  | "directions"
  | "edge-label"
  | "class-def"
  | "class"
  | "style"

/**
 * Units and contexts: for each context, null when the text may end in it,
 * the statement context only; otherwise the message of the error when the
 * text ends in it, which says what is not closed.
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  statement: null,
  string: 'The string has no closing " before the end of the text',
  "markdown-string":
    'The markdown string has no closing `" before the end of the text',
  "description-block":
    "The description block has no } before the end of the text",
  shape: "The shape has no closing before the end of the text",
  "block-arrow": "The block arrow has no ]> before the end of the text",
  "directions-opening":
    "The block arrow has no directions before the end of the text",
  directions: "The directions have no ) before the end of the text",
  "edge-label": "The edge label has no arrow before the end of the text",
  "class-def": "classDef has no styles before the end of the text",
  class: "class has no ids before the end of the text",
  style: "style has no ids before the end of the text",
}

/** Shapes: the openings of a shape, in the order in which they are tried. */
const SHAPE_OPENINGS: readonly string[] = [
  "-)",
  "(-",
  "))",
  ")",
  "(((",
  "((",
  "{{",
  "{",
  ">",
  "([",
  "(",
  "[[",
  "[|",
  "[(",
  "[\\",
  "[/",
  "[",
]

/** Shapes: the closings of a shape, in the order in which they are tried. */
const SHAPE_CLOSINGS: readonly string[] = [
  "(((",
  ")))",
  "))",
  "}}",
  "}",
  "(-",
  "-)",
  "((",
  "]]",
  "(",
  "])",
  "\\]",
  "/]",
  ")]",
  ")",
  "]>",
  "]",
]

/** Block arrows: the directions, in the order in which they are tried. */
const DIRECTIONS: readonly string[] = ["right", "left", "up", "down", "x", "y"]

/**
 * The statement context, rule 11: the characters other than whitespace
 * that an id may not hold.
 */
const NOT_IN_ID: readonly number[] = [
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  HYPHEN_MINUS,
  RIGHT_PARENTHESIS,
  LEFT_CURLY_BRACKET,
  RIGHT_CURLY_BRACKET,
  LESS_THAN_SIGN,
  GREATER_THAN_SIGN,
  COLON,
  EQUALS_SIGN,
]

/** diagrams/block.md, Lexical structure: what the lexer reads from the diagram text. */
export interface BlockLexing {
  readonly units: readonly Unit[]
}

/** The statement context, rule 11: whether `character` is a character of an id. */
function isIdCharacter(character: DiagramCharacter): boolean {
  return (
    !isWhitespace(character.codePoint) &&
    !NOT_IN_ID.includes(character.codePoint)
  )
}

/** Classes and styles: whether `character` is whitespace other than a line feed. */
function isWhitespaceInLine(character: DiagramCharacter): boolean {
  return isWhitespace(character.codePoint) && character.codePoint !== LINE_FEED
}

/** Whether `position` is a digit of ASCII. */
function isDigitAt(position: DiagramPosition): position is DiagramCharacter {
  return position !== null && isAsciiDigit(position.codePoint)
}

/** An arrow read from some place: where it ends, and its parts. */
interface ArrowMatch {
  readonly end: DiagramPosition
  readonly parts: ClosedArrowParts | OpeningArrowParts
}

/**
 * Edges: the end marker that the character at `position` writes after a
 * line, `>`, `x`, or `o`; null for another character.
 */
function endMarkerAt(position: DiagramPosition): BlockArrowEndMarker | null {
  if (isCodePointAt(position, GREATER_THAN_SIGN)) return "arrow"
  if (isCodePointAt(position, LATIN_SMALL_LETTER_X)) return "cross"
  if (isCodePointAt(position, LATIN_SMALL_LETTER_O)) return "circle"
  return null
}

/** The characters at `from` that are `codePoint`, as many as possible: how many, and the place after them. */
function countRun(
  reader: DiagramText,
  from: DiagramPosition,
  codePoint: number,
): { readonly count: number; readonly end: DiagramPosition } {
  let count = 0
  let position = from
  while (isCodePointAt(position, codePoint)) {
    count += 1
    position = reader.after(position)
  }
  return { count, end: position }
}

/**
 * Edges: from `from`, after the start marker, a solid or a thick line of
 * `lineCharacter`: two or more of them and an end marker `x`, `o`, or `>`,
 * three or more and no end marker, or two, an opening arrow. All the line
 * characters are taken. Null when fewer than two stand there.
 */
function matchSolidOrThick(
  reader: DiagramText,
  from: DiagramPosition,
  lineCharacter: number,
  line: BlockArrowLine,
  startMarker: BlockArrowStartMarker,
): ArrowMatch | null {
  const run = countRun(reader, from, lineCharacter)
  if (run.count < 2) return null
  const endMarker = endMarkerAt(run.end)
  if (endMarker !== null && run.end !== null) {
    return {
      end: reader.after(run.end),
      parts: {
        form: "closed",
        startMarker,
        line,
        length: run.count,
        endMarker,
      },
    }
  }
  if (run.count >= 3) {
    return {
      end: run.end,
      parts: {
        form: "closed",
        startMarker,
        line,
        length: run.count,
        endMarker: "none",
      },
    }
  }
  return { end: run.end, parts: { form: "opening", startMarker, line } }
}

/**
 * Edges: from `from`, the rest of a dotted line after its optional `-`:
 * one or more `.`, `-`, and an optional end marker `x`, `o`, or `>`; null
 * when it does not stand there.
 */
function matchDotted(
  reader: DiagramText,
  from: DiagramPosition,
  startMarker: BlockArrowStartMarker,
): ArrowMatch | null {
  const dots = countRun(reader, from, FULL_STOP)
  if (dots.count === 0 || !isCodePointAt(dots.end, HYPHEN_MINUS)) return null
  const afterDash = reader.after(dots.end)
  const endMarker = endMarkerAt(afterDash) ?? "none"
  return {
    end:
      endMarker === "none" || afterDash === null
        ? afterDash
        : reader.after(afterDash),
    parts: {
      form: "closed",
      startMarker,
      line: "dotted",
      length: dots.count,
      endMarker,
    },
  }
}

/**
 * diagrams/block.md, Edges: an arrow or an opening arrow at `at`, without
 * the whitespace around it: an optional `<`, then a solid, a thick, or a
 * dotted line with its end marker, or `--`, `==`, or `-.`, an opening
 * arrow; null when none stands there. An `x` or an `o` before the line
 * starts an id, so `<` is the only start marker read.
 */
function matchArrow(
  reader: DiagramText,
  at: DiagramCharacter,
): ArrowMatch | null {
  const startMarker: BlockArrowStartMarker =
    at.codePoint === LESS_THAN_SIGN ? "arrow" : "none"
  const line = startMarker === "arrow" ? reader.after(at) : at
  if (line === null) return null
  switch (line.codePoint) {
    case HYPHEN_MINUS: {
      const solid = matchSolidOrThick(
        reader,
        line,
        HYPHEN_MINUS,
        "solid",
        startMarker,
      )
      if (solid !== null) return solid
      const afterDash = reader.after(line)
      const dotted = matchDotted(reader, afterDash, startMarker)
      if (dotted !== null) return dotted
      if (afterDash === null || afterDash.codePoint !== FULL_STOP) return null
      return {
        end: reader.after(afterDash),
        parts: { form: "opening", startMarker, line: "dotted" },
      }
    }
    case EQUALS_SIGN:
      return matchSolidOrThick(reader, line, EQUALS_SIGN, "thick", startMarker)
    case FULL_STOP:
      return matchDotted(reader, line, startMarker)
    default:
      return null
  }
}

/**
 * diagrams/block.md, Lexical structure: the lexer that divides the
 * diagram text into units. It keeps a stack of contexts and, at each
 * place, applies the first rule of the current context that matches. The
 * rules are those of the specification, in its order; each method that
 * reads a context names the section it follows. The keywords are read in
 * their case only.
 */
export class BlockUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "statement", END_OF_TEXT_MESSAGES)
  }

  /**
   * Divides the diagram text into units. Throws `ParseError` where no rule
   * matches and where the text ends in a context that may not end there.
   */
  public lex(): BlockLexing {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units }
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
    return this.pushUnit(
      readUnit(this.reader, name, this.units.length, from, to, text, ends),
      null,
    )
  }

  /**
   * Edges: reads the arrow `match` at `at`, a unit named `name` with the
   * parts of the arrow, and goes on after it.
   */
  private readArrowUnit(
    name: "arrow" | "opening-arrow",
    at: DiagramCharacter,
    match: ArrowMatch,
  ): Unit {
    const unit = this.pushUnit(
      readUnit(this.reader, name, this.units.length, at, match.end, null),
      match.parts,
    )
    this.position = match.end
    return unit
  }

  /** Adds the unit read as `read`, with the parts of its arrow, `arrow`, or null for a unit that is no arrow. */
  private pushUnit(
    read: DiagramUnit<UnitName>,
    arrow: ClosedArrowParts | OpeningArrowParts | null,
  ): Unit {
    const unit: Unit = { ...read, arrow }
    this.units.push(unit)
    return unit
  }

  /**
   * The error for a place where no rule of the current context matches:
   * the character there, or, when only whitespace follows, so that the
   * text ends in the context, the error of the end of the text, as for a
   * shape that the text ends in.
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
      case "string":
        this.readInStringContext(at)
        return
      case "markdown-string":
        this.readInMarkdownStringContext(at)
        return
      case "description-block":
        this.readInDescriptionBlockContext(at)
        return
      case "shape":
        this.readInShapeContext(at)
        return
      case "block-arrow":
        this.readInBlockArrowContext(at)
        return
      case "directions-opening":
        this.readInDirectionsOpeningContext(at)
        return
      case "directions":
        this.readInDirectionsContext(at)
        return
      case "edge-label":
        this.readInEdgeLabelContext(at)
        return
      case "class-def":
        this.readInClassDefContext(at)
        return
      case "class":
        this.readInClassContext(at)
        return
      case "style":
        this.readInStyleContext(at)
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown context ${JSON.stringify(context satisfies never)}`,
        )
    }
  }

  /** diagrams/block.md, The statement context: rules 1 to 13, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readBlockKeyword(at) ||
      this.readWhitespace(at) ||
      this.readColumns(at) ||
      this.readOpeningQuote(at) ||
      this.readSpace(at) ||
      this.readReservedWord(at) ||
      this.readClassKeyword(at) ||
      this.readAccessibilityKeyword(at) ||
      this.readEnd(at) ||
      this.readOpening(at) ||
      this.readId(at) ||
      this.readArrow(at) ||
      this.readWidth(at)
    ) {
      return
    }
    throw this.noRuleMatches(at)
  }

  /**
   * The statement context, rule 1: `block-beta`, `block:`, and `block`,
   * the first and the last not followed by a word character: a unit named
   * by the keyword, which the grammar reads as the header or as the
   * opening of a composite.
   */
  private readBlockKeyword(at: DiagramCharacter): boolean {
    const header = matchWholeWord(this.reader, at, "block-beta")
    if (header !== null) {
      this.read("block-beta", at, header.end)
      return true
    }
    const keyed = matchWord(this.reader, at, "block:")
    if (keyed !== null) {
      this.read("block:", at, keyed.end)
      return true
    }
    const plain = matchWholeWord(this.reader, at, "block")
    if (plain === null) return false
    this.read("block", at, plain.end)
    return true
  }

  /** The statement context, rule 2: one or more whitespace characters, line feeds included, which read no unit. */
  private readWhitespace(at: DiagramCharacter): boolean {
    if (!isWhitespace(at.codePoint)) return false
    this.position = skipWhitespace(this.reader, at)
    return true
  }

  /**
   * The statement context, rule 3: `columns`, whitespace, line feeds
   * included, and digits, a `columns` unit and a `digits` unit; or
   * `columns`, whitespace, and `auto`, not followed by a word character, a
   * `columns` unit and an `auto` unit. The number ends at the first
   * character that is no digit.
   */
  private readColumns(at: DiagramCharacter): boolean {
    const keyword = matchWord(this.reader, at, "columns")
    if (keyword === null || !isWhitespaceAt(keyword.end)) return false
    const value = skipWhitespace(this.reader, keyword.end)
    if (isDigitAt(value)) {
      this.addUnit("columns", at, keyword.end)
      this.readDigits(value)
      return true
    }
    const auto = matchWholeWord(this.reader, value, "auto")
    if (auto === null || value === null) return false
    this.addUnit("columns", at, keyword.end)
    this.read("auto", value, auto.end)
    return true
  }

  /**
   * The statement context, rule 4, and Strings: `"` followed by a
   * backquote enters the markdown string context, and `"` the string
   * context, entered at it, which read the string from this `"`.
   */
  private readOpeningQuote(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const context = isCodePointAt(this.reader.after(at), GRAVE_ACCENT)
      ? "markdown-string"
      : "string"
    this.enter(context, [at.start, at.end])
    return true
  }

  /**
   * The statement context, rule 5: `space:` and digits, a `space:` unit and
   * a `digits` unit; and `space` not followed by a word character, a
   * `space` unit.
   */
  private readSpace(at: DiagramCharacter): boolean {
    const keyed = matchWord(this.reader, at, "space:")
    if (keyed !== null && isDigitAt(keyed.end)) {
      this.addUnit("space:", at, keyed.end)
      this.readDigits(keyed.end)
      return true
    }
    const plain = matchWholeWord(this.reader, at, "space")
    if (plain === null) return false
    this.read("space", at, plain.end)
    return true
  }

  /**
   * The statement context, rule 6: `default`, `linkStyle`, and
   * `interpolate`, not followed by a word character: a unit named by the
   * word, which no rule of the grammar takes.
   */
  private readReservedWord(at: DiagramCharacter): boolean {
    for (const word of ["default", "linkStyle", "interpolate"] as const) {
      const match = matchWholeWord(this.reader, at, word)
      if (match !== null) {
        this.read(word, at, match.end)
        return true
      }
    }
    return false
  }

  /**
   * The statement context, rule 7: `classDef`, `class`, and `style`
   * followed by whitespace: a unit named by the keyword, which enters the
   * class definition, class, or style context.
   */
  private readClassKeyword(at: DiagramCharacter): boolean {
    for (const keyword of ["classDef", "class", "style"] as const) {
      const match = matchWord(this.reader, at, keyword)
      if (match !== null && isWhitespaceAt(match.end)) {
        const unit = this.read(keyword, at, match.end)
        this.enter(
          keyword === "classDef" ? "class-def" : keyword,
          significantRangeOf(unit),
        )
        return true
      }
    }
    return false
  }

  /**
   * The statement context, rule 8: `accTitle`, whitespace, and `:`, and
   * `accDescr`, whitespace, and `:`, an `accTitle` or `accDescr` unit and a
   * `:` unit, which no rule of the grammar takes; and `accDescr`,
   * whitespace, and `{`, an `accDescr` unit and a `{` unit, which enter the
   * description block context (Empty description blocks).
   */
  private readAccessibilityKeyword(at: DiagramCharacter): boolean {
    for (const keyword of ["accTitle", "accDescr"] as const) {
      const word = matchWord(this.reader, at, keyword)
      if (word === null) continue
      const mark = skipWhitespace(this.reader, word.end)
      if (isCodePointAt(mark, COLON)) {
        this.addUnit(keyword, at, word.end)
        this.read(":", mark, this.reader.after(mark))
        return true
      }
      if (keyword === "accDescr" && isCodePointAt(mark, LEFT_CURLY_BRACKET)) {
        const unit = this.addUnit(keyword, at, word.end)
        this.read("{", mark, this.reader.after(mark))
        this.enter("description-block", significantRangeOf(unit))
        return true
      }
    }
    return false
  }

  /** The statement context, rule 9: `end`, not followed by a word character, an `end` unit. */
  private readEnd(at: DiagramCharacter): boolean {
    const match = matchWholeWord(this.reader, at, "end")
    if (match === null) return false
    this.read("end", at, match.end)
    return true
  }

  /**
   * The statement context, rule 10: the opening of a shape, a
   * `shape-open` unit, which enters the shape context; and `<[`, a `<[`
   * unit, which enters the block arrow context.
   */
  private readOpening(at: DiagramCharacter): boolean {
    for (const opening of SHAPE_OPENINGS) {
      const match = matchWord(this.reader, at, opening)
      if (match !== null) {
        const unit = this.read("shape-open", at, match.end)
        this.enter("shape", significantRangeOf(unit))
        return true
      }
    }
    const blockArrow = matchWord(this.reader, at, "<[")
    if (blockArrow === null) return false
    const unit = this.read("<[", at, blockArrow.end)
    this.enter("block-arrow", significantRangeOf(unit))
    return true
  }

  /**
   * The statement context, rule 11: one or more characters other than
   * whitespace and those of {@link NOT_IN_ID}, an `id` unit.
   */
  private readId(at: DiagramCharacter): boolean {
    if (!isIdCharacter(at)) return false
    this.read("id", at, skipWhile(this.reader, at, isIdCharacter))
    return true
  }

  /**
   * The statement context, rule 12: an arrow, an `arrow` unit, or an
   * opening arrow, an `opening-arrow` unit, which enters the edge label
   * context (see {@link matchArrow}).
   */
  private readArrow(at: DiagramCharacter): boolean {
    const match = matchArrow(this.reader, at)
    if (match === null) return false
    if (match.parts.form === "closed") {
      this.readArrowUnit("arrow", at, match)
      return true
    }
    const unit = this.readArrowUnit("opening-arrow", at, match)
    this.enter("edge-label", significantRangeOf(unit))
    return true
  }

  /** The statement context, rule 13: `:` and digits, a `:` unit and a `digits` unit. */
  private readWidth(at: DiagramCharacter): boolean {
    if (at.codePoint !== COLON) return false
    const digits = this.reader.after(at)
    if (!isDigitAt(digits)) return false
    this.addUnit(":", at, digits)
    this.readDigits(digits)
    return true
  }

  /** One or more digits of ASCII from `at`, a `digits` unit. */
  private readDigits(at: DiagramCharacter): void {
    this.read(
      "digits",
      at,
      skipWhile(this.reader, at, (character) =>
        isAsciiDigit(character.codePoint),
      ),
    )
  }

  /**
   * diagrams/block.md, Strings: from the opening `"` at `at`, every
   * character up to the next `"`, line feeds included, and that `"`: a
   * `string` unit from the opening `"` to the closing one, whose text is
   * what lies between them; leaves the context. When the text ends in the
   * string, the error of the end of the text is at the opening `"`.
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
    this.addUnit("string", at, end, "trim-whitespace", content)
    this.position = end
    this.leave()
  }

  /**
   * diagrams/block.md, Strings: from the opening `"` at `at` and the
   * backquote after it, every character up to the next backquote, which a
   * `"` must follow: a `markdown-string` unit from the opening `"` to the
   * closing one, whose text is what lies between the backquotes; leaves the
   * context. A closing backquote that no `"` follows is read by no rule.
   */
  private readInMarkdownStringContext(at: DiagramCharacter): void {
    let content = ""
    const backquote = this.reader.after(at)
    let position = backquote === null ? null : this.reader.after(backquote)
    while (position !== null && position.codePoint !== GRAVE_ACCENT) {
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
    this.addUnit("markdown-string", at, end, "trim-whitespace", content)
    this.position = end
    this.leave()
  }

  /**
   * diagrams/block.md, Empty description blocks: in the description block
   * context, the whitespace after the `{`, line feeds included, and then
   * every character up to the next `}`, a `description-block-text` unit,
   * none when only whitespace lies between, which no rule of the grammar
   * takes; then the `}`, a `}` unit, which leaves the context.
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

  /**
   * diagrams/block.md, Shapes: in the shape context, `"`, which enters a
   * string context; and a closing, a `shape-close` unit, which leaves the
   * context. The context has no rule for whitespace.
   */
  private readInShapeContext(at: DiagramCharacter): void {
    if (this.readOpeningQuote(at)) return
    for (const closing of SHAPE_CLOSINGS) {
      const match = matchWord(this.reader, at, closing)
      if (match !== null) {
        this.read("shape-close", at, match.end)
        this.leave()
        return
      }
    }
    throw this.noRuleMatches(at)
  }

  /**
   * diagrams/block.md, Block arrows: in the block arrow context, `"`, which
   * enters a string context; and `]>`, a `]>` unit, which leaves the
   * context for the one that reads the whitespace and the `(` before the
   * directions. The context has no rule for whitespace.
   */
  private readInBlockArrowContext(at: DiagramCharacter): void {
    if (this.readOpeningQuote(at)) return
    const match = matchWord(this.reader, at, "]>")
    if (match === null) throw this.noRuleMatches(at)
    const unit = this.read("]>", at, match.end)
    this.leave()
    this.enter("directions-opening", significantRangeOf(unit))
  }

  /**
   * Block arrows: after the `]>`, whitespace, line feeds included, which
   * reads no unit; and `(`, a `(` unit, which leaves the context for the
   * directions context.
   */
  private readInDirectionsOpeningContext(at: DiagramCharacter): void {
    if (this.readWhitespace(at)) return
    if (at.codePoint !== LEFT_PARENTHESIS) throw this.noRuleMatches(at)
    const unit = this.read("(", at, this.reader.after(at))
    this.leave()
    this.enter("directions", significantRangeOf(unit))
  }

  /**
   * Block arrows: in the directions context, whitespace, line feeds
   * included; `,`, a `,` unit; a direction of {@link DIRECTIONS}, a
   * `direction` unit; and `)`, a `)` unit, which leaves the context. The
   * whitespace that a direction holds (ast/block.md, BlockArrowShape) is a
   * `direction-space` unit whose token keeps it: the whitespace after a
   * direction, and the whitespace after the `(` when a direction follows
   * it; other whitespace, such as that after a `,`, reads no unit.
   */
  private readInDirectionsContext(at: DiagramCharacter): void {
    if (isWhitespace(at.codePoint)) {
      const end = skipWhitespace(this.reader, at)
      const previous = this.units.at(-1)?.name
      if (
        previous === "direction" ||
        (previous === "(" && this.directionAt(end) !== null)
      ) {
        this.read("direction-space", at, end, "keep-whitespace")
      } else {
        this.position = end
      }
      return
    }
    if (at.codePoint === COMMA) {
      this.read(",", at, this.reader.after(at))
      return
    }
    if (at.codePoint === RIGHT_PARENTHESIS) {
      this.read(")", at, this.reader.after(at))
      this.leave()
      return
    }
    const direction = this.directionAt(at)
    if (direction === null) throw this.noRuleMatches(at)
    this.read("direction", at, direction.end)
  }

  /** Block arrows: the first direction of {@link DIRECTIONS} that stands at `at`; null when none does. */
  private directionAt(at: DiagramPosition): Match | null {
    for (const direction of DIRECTIONS) {
      const match = matchWord(this.reader, at, direction)
      if (match !== null) return match
    }
    return null
  }

  /**
   * Edges: in the edge label context, whitespace, line feeds included,
   * which reads no unit; `"`, which enters a string context; and an arrow,
   * an `arrow` unit, which leaves the context.
   */
  private readInEdgeLabelContext(at: DiagramCharacter): void {
    if (this.readWhitespace(at) || this.readOpeningQuote(at)) return
    const match = matchArrow(this.reader, at)
    if (match === null || match.parts.form !== "closed") {
      throw this.noRuleMatches(at)
    }
    this.readArrowUnit("arrow", at, match)
    this.leave()
  }

  /**
   * diagrams/block.md, Classes and styles: in the class definition context,
   * after the whitespace, line feeds included, one or more word characters
   * of ASCII, a `class-id` unit, which whitespace must follow, line feeds
   * included; then, after that whitespace, the rest of the line, the
   * styles (see {@link BlockUnitLexer.readStyles}). Leaves the context.
   */
  private readInClassDefContext(at: DiagramCharacter): void {
    const name = this.readClassId(skipWhitespace(this.reader, at))
    if (name === null) return
    if (!isWhitespaceAt(name)) throw this.noRuleMatches(name)
    const styles = skipWhitespace(this.reader, name)
    if (styles === null) {
      this.position = null
      return
    }
    this.readStyles(styles)
    this.leave()
  }

  /**
   * Classes and styles: in the class context, after the whitespace, line
   * feeds included, the ids (see {@link BlockUnitLexer.readClassIds}); then
   * the rest of the line, a `class-name` unit, none when it is all
   * whitespace. Leaves the context.
   */
  private readInClassContext(at: DiagramCharacter): void {
    const rest = this.readClassIds(skipWhitespace(this.reader, at))
    if (rest === null) return
    const end = skipWhile(
      this.reader,
      rest,
      (character) => character.codePoint !== LINE_FEED,
    )
    if (samePosition(skipWhile(this.reader, rest, isWhitespaceInLine), end)) {
      this.position = end
    } else {
      this.read("class-name", rest, end)
    }
    this.leave()
  }

  /**
   * Classes and styles: in the style context, after the whitespace, line
   * feeds included, the ids (see {@link BlockUnitLexer.readClassIds}); then
   * the whitespace of the line, which reads no unit, and the rest of the
   * line, the styles (see {@link BlockUnitLexer.readStyles}). Leaves the
   * context.
   */
  private readInStyleContext(at: DiagramCharacter): void {
    const rest = this.readClassIds(skipWhitespace(this.reader, at))
    if (rest === null) return
    const styles = skipWhile(this.reader, rest, isWhitespaceInLine)
    if (styles === null) {
      this.position = null
      return
    }
    this.readStyles(styles)
    this.leave()
  }

  /**
   * Classes and styles: one or more word characters of ASCII from `at`, a
   * `class-id` unit; the place after it. When the text ends before it, the
   * text ends in the context; null then.
   */
  private readClassId(at: DiagramPosition): DiagramPosition {
    if (at === null) {
      this.position = null
      return null
    }
    if (!isWordCharacterAt(at)) throw this.noRuleMatches(at)
    const end = skipWhile(this.reader, at, (character) =>
      isWordCharacterAt(character),
    )
    this.read("class-id", at, end)
    return end
  }

  /**
   * Classes and styles: the ids of the class and the style contexts from
   * `at`, a `class-id` unit, and then, as long as a `,`, whitespace or none,
   * line feeds included, and a word character follow, an `id-comma` unit,
   * a `class-id-space` unit of that whitespace, none when there is none,
   * and another `class-id` unit; the place after the last. The whitespace
   * belongs to the id after it (ast/block.md, BlockClassStatement), and a
   * directive or a comment line in it lies in no `class-id` unit. When the
   * text ends before the first id, the text ends in the context; null then.
   */
  private readClassIds(at: DiagramPosition): DiagramPosition {
    let end = this.readClassId(at)
    while (isCodePointAt(end, COMMA)) {
      const afterComma = this.reader.after(end)
      const next = skipWhitespace(this.reader, afterComma)
      if (!isWordCharacterAt(next)) break
      this.addUnit("id-comma", end, afterComma)
      if (afterComma !== null && !samePosition(afterComma, next)) {
        this.addUnit("class-id-space", afterComma, next, "keep-whitespace")
      }
      end = this.readClassId(next)
    }
    return end
  }

  /**
   * Classes and styles: the styles from `at`, where the rest of the line
   * starts after the whitespace that the statement reads, a character that
   * is no whitespace, or the line feed when the line has nothing more: the
   * rest of the line without the whitespace at its end, divided at each
   * `,`, a `,` unit. A style is the part between two `,`, with the
   * whitespace at its ends, a `style-text` unit whose token keeps that
   * whitespace, also when it is all whitespace; none when the part is empty
   * (ast/block.md, BlockLiteral). The whitespace at the end of the line and
   * the line feed are left to the statement context.
   */
  private readStyles(at: DiagramCharacter): void {
    let restEnd: DiagramPosition = at
    for (
      let position: DiagramPosition = at;
      position !== null && position.codePoint !== LINE_FEED;
      position = this.reader.after(position)
    ) {
      if (!isWhitespace(position.codePoint)) {
        restEnd = this.reader.after(position)
      }
    }
    let start: DiagramPosition = at
    for (;;) {
      const end = skipWhile(
        this.reader,
        start,
        (character) =>
          character.codePoint !== COMMA && isBefore(character, restEnd),
      )
      if (start !== null && !samePosition(start, end)) {
        this.addUnit("style-text", start, end, "keep-whitespace")
      }
      if (!isCodePointAt(end, COMMA) || !isBefore(end, restEnd)) {
        this.position = end
        return
      }
      start = this.reader.after(end)
      this.addUnit(",", end, start)
    }
  }
}
