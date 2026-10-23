import {
  COMMA,
  LINE_FEED,
  QUOTATION_MARK,
  SPACE,
  TILDE,
} from "../../code-points.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import { readUnit } from "../../diagram-units.ts"
import type { LineIndex } from "../../positions.ts"
import {
  isCodePointAt,
  matchWholeWordIgnoringCase,
  samePosition,
  skipWhile,
} from "../../scanning.ts"
import { UnitLexer } from "../../unit-lexer.ts"

/** diagrams/sankey.md, Units and contexts: the names of the units. */
export type UnitName = "header" | "newline" | "," | "field-text" | "string"

/** diagrams/sankey.md, Units and contexts: one unit of the sankey lexer. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/sankey.md, Units and contexts: the contexts of the lexer. */
type Context = "record" | "string"

/**
 * Units and contexts: for each context, null when the text may end in it,
 * the record context only; otherwise the message of the error when the
 * text ends in it, which says what is not closed.
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  record: null,
  string: 'The string has no closing " before the end of the text',
}

/** The record context, rules 1 and 2: the header keywords, in the order in which they are tried. */
const HEADER_KEYWORDS: readonly string[] = ["sankey-beta", "sankey"]

/** diagrams/sankey.md, Lexical structure: what the lexer reads from the diagram text. */
export interface SankeyLexing {
  readonly units: readonly Unit[]
}

/** Characters: whether `codePoint` is a character from U+0020 to U+007E, the space and the printable characters of ASCII. */
function isPrintableAscii(codePoint: number): boolean {
  return codePoint >= SPACE && codePoint <= TILDE
}

/** The record context, rule 6: whether `character` may be a character of a `field-text` unit: a printable character of ASCII other than `"` and `,`. */
function isFieldCharacter(character: DiagramCharacter): boolean {
  return (
    isPrintableAscii(character.codePoint) &&
    character.codePoint !== QUOTATION_MARK &&
    character.codePoint !== COMMA
  )
}

/**
 * Strings: whether `character` may be a character of a string other than
 * `"`: a printable character of ASCII, a `,` among them, or a line feed.
 */
function isStringCharacter(character: DiagramCharacter): boolean {
  return (
    (isPrintableAscii(character.codePoint) &&
      character.codePoint !== QUOTATION_MARK) ||
    character.codePoint === LINE_FEED
  )
}

/**
 * diagrams/sankey.md, Lexical structure: the lexer that divides the diagram
 * text into units. It keeps a stack of contexts and, at each place, applies
 * the first rule of the current context that matches. The rules are those
 * of the specification, in its order; each method that reads a context
 * names the section it follows. The letters of the header are compared
 * case-insensitively. The lexer reads no diagram comments.
 */
export class SankeyUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  /** The record context, rules 1 and 2: the first character of the text, where a header may start. */
  private readonly textStart: DiagramCharacter

  /** Strings: the `"` that opened the string that the string context reads. */
  private openingQuote: DiagramCharacter | null = null

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "record", END_OF_TEXT_MESSAGES)
    this.textStart = reader.first()
  }

  /**
   * Divides the diagram text into units. Throws `ParseError` where no rule
   * matches and where the text ends in a string.
   */
  public lex(): SankeyLexing {
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

  /** Applies the first rule of `context` that matches at `at`. */
  protected override readInContext(
    at: DiagramCharacter,
    context: Context,
  ): void {
    switch (context) {
      case "record":
        this.readInRecordContext(at)
        return
      case "string":
        this.readInStringContext(at)
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown context ${JSON.stringify(context satisfies never)}`,
        )
    }
  }

  /** diagrams/sankey.md, The record context: rules 1 to 6, in order. */
  private readInRecordContext(at: DiagramCharacter): void {
    if (
      this.readHeader(at) ||
      this.readLineFeeds(at) ||
      this.readComma(at) ||
      this.readOpeningQuote(at) ||
      this.readFieldText(at)
    ) {
      return
    }
    throw this.noRuleMatches(at)
  }

  /**
   * The record context, rules 1 and 2: where the text starts, the keyword
   * `sankey-beta`, and then the keyword `sankey`, each compared
   * case-insensitively and not followed by a word character: a `header`
   * unit.
   */
  private readHeader(at: DiagramCharacter): boolean {
    if (!samePosition(at, this.textStart)) return false
    for (const keyword of HEADER_KEYWORDS) {
      const match = matchWholeWordIgnoringCase(this.reader, at, keyword)
      if (match !== null) {
        this.read("header", at, match.end)
        return true
      }
    }
    return false
  }

  /** The record context, rule 3: one or more line feeds, a `newline` unit. */
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

  /** The record context, rule 4: `,`, a `,` unit. */
  private readComma(at: DiagramCharacter): boolean {
    if (at.codePoint !== COMMA) return false
    this.read(",", at, this.reader.after(at))
    return true
  }

  /** The record context, rule 5: `"` enters the string context, entered at it. */
  private readOpeningQuote(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    this.openingQuote = at
    this.enter("string", [at.start, at.end])
    this.position = this.reader.after(at)
    return true
  }

  /**
   * The record context, rule 6: one or more printable characters of ASCII
   * other than `"` and `,`, as many as possible: a `field-text` unit, whose
   * token leaves out the spaces at its ends.
   */
  private readFieldText(at: DiagramCharacter): boolean {
    if (!isFieldCharacter(at)) return false
    this.read("field-text", at, skipWhile(this.reader, at, isFieldCharacter))
    return true
  }

  /**
   * diagrams/sankey.md, Strings: from the character after the opening `"`,
   * one or more characters, each a printable character of ASCII other than
   * `"`, a line feed, or `""`, and then a `"` that no `"` follows, which
   * leaves the context: a `string` unit from the opening `"` to the closing
   * one. Two quotes with nothing between them read no unit and leave the
   * context. A character that a string may not hold is read by no rule;
   * when the text ends in the string, the content is read, and the error
   * of the end of the text is at the opening `"`.
   */
  private readInStringContext(at: DiagramCharacter): void {
    let position: DiagramPosition = at
    while (position !== null) {
      if (position.codePoint === QUOTATION_MARK) {
        const afterQuote = this.reader.after(position)
        if (isCodePointAt(afterQuote, QUOTATION_MARK)) {
          position = this.reader.after(afterQuote)
          continue
        }
        this.readString(at, position, afterQuote)
        return
      }
      if (!isStringCharacter(position)) throw this.noRuleMatches(position)
      position = this.reader.after(position)
    }
    this.position = null
  }

  /**
   * Strings: the string whose content starts at `contentStart` and whose
   * closing `"` is `closing`, followed by `end`: a `string` unit from the
   * opening `"` to the closing one, or none when nothing lies between
   * them; leaves the string context.
   */
  private readString(
    contentStart: DiagramCharacter,
    closing: DiagramCharacter,
    end: DiagramPosition,
  ): void {
    const opening = this.openingQuote
    if (opening === null) {
      throw new Error("mmd-toolkit parser bug: a string has no opening quote")
    }
    if (!samePosition(contentStart, closing)) {
      this.addUnit("string", opening, end)
    }
    this.position = end
    this.leave()
  }
}
