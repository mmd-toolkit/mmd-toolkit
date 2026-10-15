import type { Range } from "../../ast.ts"
import type {
  RequirementKind,
  RequirementRelationship,
  RequirementRisk,
  RequirementVerifyMethod,
} from "../../ast/requirement.ts"
import { isWhitespace, isWordCharacter } from "../../character-classes.ts"
import {
  COLON,
  COMMA,
  EQUALS_SIGN,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LESS_THAN_SIGN,
  LINE_FEED,
  NUMBER_SIGN,
  PERCENT_SIGN,
  QUOTATION_MARK,
  RIGHT_CURLY_BRACKET,
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
import { readUnit, significantRangeOf } from "../../diagram-units.ts"
import { DirectionLineRule } from "../../direction-line.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import { UnitLexer } from "../../unit-lexer.ts"
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

/** The statement context, rule 15: the names of the field keywords. */
type FieldKeyword = "id" | "text" | "risk" | "verifyMethod" | "type" | "docref"

/** diagrams/requirement.md, The statement context, rule 15: the keywords that are units named by themselves, in the order of the rule. */
export type KeywordUnitName =
  | FieldKeyword
  | RequirementKind
  | RequirementRisk
  | RequirementVerifyMethod
  | "element"
  | RequirementRelationship

/** diagrams/requirement.md, Units and contexts: the names of the units. */
export type UnitName =
  // The statement context.
  | "title"
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "direction-text"
  | "direction"
  | "direction-value"
  | "newline"
  | "header"
  | "}"
  | ":::"
  | KeywordUnitName
  | "style"
  | "classDef"
  | "class"
  | "<-"
  | "->"
  | "-"
  | "string"
  | "empty-string"
  | "unquoted-text"
  | ","
  // The style context.
  | "style-word"
  | "style-colon"
  | "style-semicolon"
  | "style-percent"
  | "style-dash"
  | "style-hash"
  // The accessibility contexts.
  | "title-text"
  | "description-text"
  | "description-block-text"

/** diagrams/requirement.md, Units and contexts: one unit of the requirement lexer. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/requirement.md, Units and contexts: the contexts of the lexer. */
type Context =
  "statement" | "style" | "title" | "description" | "description-block"

/**
 * Units and contexts: for each context, null when the text may end in it,
 * the statement context and the style context; otherwise the message of
 * the error when the text ends in it, which says what is not closed.
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  statement: null,
  style: null,
  title: "accTitle has no text before the end of the text",
  description: "accDescr has no text before the end of the text",
  "description-block":
    "The description block has no } before the end of the text",
}

/** The direction line: the values, in the order in which they are tried. */
const DIRECTION_LINE_VALUES: readonly string[] = ["TB", "BT", "RL", "LR"]

/**
 * The statement context, rule 15: the keywords, each as the specification
 * writes it, which is the name of its unit, in the order of the rule.
 */
const KEYWORDS: readonly KeywordUnitName[] = [
  "id",
  "text",
  "risk",
  "verifyMethod",
  "requirement",
  "functionalRequirement",
  "interfaceRequirement",
  "performanceRequirement",
  "physicalRequirement",
  "designConstraint",
  "low",
  "medium",
  "high",
  "analysis",
  "demonstration",
  "inspection",
  "test",
  "element",
  "contains",
  "copies",
  "derives",
  "satisfies",
  "verifies",
  "refines",
  "traces",
  "type",
  "docref",
]

/**
 * The statement context, rules 16 to 18: the keywords that enter the
 * style context, each as the specification writes it, which is the name
 * of its unit.
 */
const STYLE_KEYWORDS: readonly ("style" | "classDef" | "class")[] = [
  "style",
  "classDef",
  "class",
]

/** diagrams/requirement.md, Lexical structure: what the lexer reads from the diagram text. */
export interface RequirementLexing {
  readonly units: readonly Unit[]
  /** The diagram comments, in source order. */
  readonly comments: readonly DiagramComment[]
}

/**
 * The statement context, rule 1: whether `character` may be a character of
 * the text of a `title` unit: any character other than `#`, a line feed,
 * and `;`.
 */
function isTitleCharacter(character: DiagramCharacter): boolean {
  return (
    character.codePoint !== NUMBER_SIGN &&
    character.codePoint !== LINE_FEED &&
    character.codePoint !== SEMICOLON
  )
}

/**
 * Names and values: whether `character` may follow the first character of
 * an unquoted text: any character other than `:`, `,`, a line feed, `{`,
 * `<`, `>`, `-`, and `=`.
 */
function continuesUnquotedText(character: DiagramCharacter): boolean {
  return (
    character.codePoint !== COLON &&
    character.codePoint !== COMMA &&
    character.codePoint !== LINE_FEED &&
    character.codePoint !== LEFT_CURLY_BRACKET &&
    character.codePoint !== LESS_THAN_SIGN &&
    character.codePoint !== GREATER_THAN_SIGN &&
    character.codePoint !== HYPHEN_MINUS &&
    character.codePoint !== EQUALS_SIGN
  )
}

/**
 * diagrams/requirement.md, Lexical structure: the lexer that divides the
 * diagram text into units and finds its diagram comments. It keeps a stack
 * of contexts and, at each place, applies the first rule of the current
 * context that matches. The rules are those of the specification, in its
 * order; each method that reads a context names the section it follows.
 * Letters of the keywords are compared case-insensitively.
 */
export class RequirementUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  /** The statement context, rule 5: the direction line, with the values of this diagram, compared case-insensitively. */
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
   * matches, at a string that the text ends in, and where the text ends in
   * a context that may not end there.
   */
  public lex(): RequirementLexing {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units, comments: this.comments }
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
      case "statement":
        this.readInStatementContext(at)
        return
      case "style":
        this.readInStyleContext(at)
        return
      case "title":
        this.readAccessibilityText(at, "title-text")
        return
      case "description":
        this.readAccessibilityText(at, "description-text")
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

  /** diagrams/requirement.md, The statement context: rules 1 to 24, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readTitle(at) ||
      this.readAccessibilityKeyword(at, "accTitle", COLON, "title") ||
      this.readAccessibilityKeyword(at, "accDescr", COLON, "description") ||
      this.readAccessibilityKeyword(
        at,
        "accDescr",
        LEFT_CURLY_BRACKET,
        "description-block",
      ) ||
      this.readDirectionLine(at) ||
      this.readLineFeeds(at) ||
      this.skipWhitespace(at) ||
      this.readHashComment(at) ||
      this.readPercentComment(at) ||
      this.readHeader(at) ||
      this.readCharacters(at, "{", "{") ||
      this.readCharacters(at, "}", "}") ||
      this.readCharacters(at, ":::", ":::") ||
      this.readCharacters(at, ":", ":") ||
      this.readKeyword(at) ||
      this.readStyleKeyword(at) ||
      this.readCharacters(at, "<-", "<-") ||
      this.readCharacters(at, "->", "->") ||
      this.readCharacters(at, "-", "-") ||
      this.readString(at) ||
      this.readUnquotedText(at) ||
      this.readCharacters(at, ",", ",")
    ) {
      return
    }
    throw this.noRuleMatches(at)
  }

  /**
   * The statement context, rule 1: `title`, one whitespace character, a
   * line feed included, and one or more characters other than `#`, a line
   * feed, and `;`: a `title` unit of all of them, which no rule of the
   * grammar takes.
   */
  private readTitle(at: DiagramCharacter): boolean {
    const word = matchWordIgnoringCase(this.reader, at, "title")
    if (word === null || !isWhitespaceAt(word.end)) return false
    const text = this.reader.after(word.end)
    if (text === null || !isTitleCharacter(text)) return false
    this.read("title", at, skipWhile(this.reader, text, isTitleCharacter))
    return true
  }

  /**
   * The statement context, rules 2 to 4: `keyword` (`accTitle` or
   * `accDescr`), zero or more whitespace characters, line feeds included,
   * the mark `mark` (`:` or `{`), and zero or more whitespace characters,
   * line feeds included: a unit named by the keyword and one named by the
   * mark; enters `context`.
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
    if (!isCodePointAt(markAt, mark)) return false
    const keywordUnit = this.addUnit(keyword, at, word.end)
    const afterMark = this.reader.after(markAt)
    this.addUnit(mark === COLON ? ":" : "{", markAt, afterMark)
    this.position = skipWhitespace(this.reader, afterMark)
    this.enter(context, significantRangeOf(keywordUnit))
    return true
  }

  /** The statement context, rule 5: a direction line (see `DirectionLineRule`). */
  private readDirectionLine(at: DiagramCharacter): boolean {
    const line = this.directionLine.match(at)
    if (line === null) return false
    for (const unit of line.units) this.addUnit(unit.name, unit.from, unit.to)
    this.position = line.end
    return true
  }

  /** The statement context, rule 6: one or more line feeds, a `newline` unit. */
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

  /** The statement context, rule 7: one or more whitespace characters, line feeds included, nothing. */
  private skipWhitespace(at: DiagramCharacter): boolean {
    if (!isWhitespace(at.codePoint)) return false
    this.position = skipWhitespace(this.reader, at)
    return true
  }

  /**
   * Comments: the diagram comment whose mark starts at `at` and ends with
   * `markLast`, and the rest of its line, up to and not including the line
   * feed; its value is the source text after the mark.
   */
  private readComment(
    at: DiagramCharacter,
    markLast: DiagramCharacter,
    mark: DiagramComment["mark"],
  ): void {
    const lineFeed = lineFeedAfter(this.reader, markLast)
    this.comments.push({
      range: [at.start, lineFeed.start],
      mark,
      valueStart: markLast.end,
    })
    this.position = lineFeed
  }

  /** The statement context, rule 8, and Comments: `#`, a diagram comment with the mark `#`. */
  private readHashComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== NUMBER_SIGN) return false
    this.readComment(at, at, "#")
    return true
  }

  /**
   * The statement context, rule 9, and Comments: `%`, a diagram comment.
   * Its mark is `%%` when it starts with `%%`, found in the text without
   * directives, and `%` otherwise.
   */
  private readPercentComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== PERCENT_SIGN) return false
    const second = this.reader.after(at)
    if (isCodePointAt(second, PERCENT_SIGN)) {
      this.readComment(at, second, "%%")
    } else {
      this.readComment(at, at, "%")
    }
    return true
  }

  /** The statement context, rule 10: the keyword `requirementDiagram`, a `header` unit. */
  private readHeader(at: DiagramCharacter): boolean {
    const match = matchWholeWordIgnoringCase(
      this.reader,
      at,
      "requirementDiagram",
    )
    if (match === null) return false
    this.read("header", at, match.end)
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

  /** The statement context, rule 15: one of the keywords, a unit named by the keyword. */
  private readKeyword(at: DiagramCharacter): boolean {
    for (const keyword of KEYWORDS) {
      const match = matchWholeWordIgnoringCase(this.reader, at, keyword)
      if (match !== null) {
        this.read(keyword, at, match.end)
        return true
      }
    }
    return false
  }

  /**
   * The statement context, rules 16 to 18: the keyword `style`,
   * `classDef`, or `class`, a unit named by the keyword; enters the style
   * context.
   */
  private readStyleKeyword(at: DiagramCharacter): boolean {
    for (const keyword of STYLE_KEYWORDS) {
      const match = matchWholeWordIgnoringCase(this.reader, at, keyword)
      if (match !== null) {
        const unit = this.read(keyword, at, match.end)
        this.enter("style", significantRangeOf(unit))
        return true
      }
    }
    return false
  }

  /**
   * The statement context, rule 22, and the style context, rule 8
   * (Strings): `"`, zero or more characters other than `"`, line feeds
   * included, and `"`: a `string` unit when a character lies between the
   * quotes, and an `empty-string` unit otherwise. A string must be closed:
   * no later rule reads a `"`, so the input is rejected at the opening
   * quote of a string that the text ends in.
   */
  private readString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const contentStart = this.reader.after(at)
    const closing = skipWhile(
      this.reader,
      contentStart,
      (character) => character.codePoint !== QUOTATION_MARK,
    )
    if (closing === null) {
      const range: Range = [at.start, at.end]
      throw new ParseError(
        'The string has no closing " before the end of the text',
        range,
        this.lines.location(range),
      )
    }
    this.read(
      samePosition(closing, contentStart) ? "empty-string" : "string",
      at,
      this.reader.after(closing),
    )
    return true
  }

  /**
   * The statement context, rule 23 (Names and values): an ASCII word
   * character and zero or more characters that `continuesUnquotedText`
   * takes, as many as possible: an `unquoted-text` unit, whose token
   * leaves out the whitespace at its end, which the unit reads.
   */
  private readUnquotedText(at: DiagramCharacter): boolean {
    if (!isWordCharacter(at.codePoint)) return false
    const end = skipWhile(
      this.reader,
      this.reader.after(at),
      continuesUnquotedText,
    )
    this.read("unquoted-text", at, end)
    return true
  }

  /** diagrams/requirement.md, The style context: rules 1 to 10, in order. */
  private readInStyleContext(at: DiagramCharacter): void {
    if (isWordCharacter(at.codePoint)) {
      // Rule 1: one or more ASCII word characters.
      const end = skipWhile(this.reader, at, (character) =>
        isWordCharacter(character.codePoint),
      )
      this.read("style-word", at, end)
      return
    }
    if (
      this.readCharacters(at, ":", "style-colon") ||
      this.readCharacters(at, ";", "style-semicolon") ||
      this.readCharacters(at, "%", "style-percent") ||
      this.readCharacters(at, "-", "style-dash") ||
      this.readCharacters(at, "#", "style-hash")
    ) {
      return
    }
    if (at.codePoint === SPACE) {
      // Rule 7: a space, nothing.
      this.position = this.reader.after(at)
      return
    }
    if (this.readString(at)) return
    if (at.codePoint === LINE_FEED) {
      // Rule 9: a line feed, nothing; leaves the style context.
      this.position = this.reader.after(at)
      this.leave()
      return
    }
    if (this.readCharacters(at, ",", ",")) return
    throw this.noRuleMatches(at)
  }

  /**
   * Accessibility values: in the title context and the description
   * context, one or more characters other than a line feed, a unit named
   * `name`, which leaves the context. The whitespace after the colon was
   * read with it, so the text starts at a character that is not
   * whitespace.
   */
  private readAccessibilityText(
    at: DiagramCharacter,
    name: "title-text" | "description-text",
  ): void {
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== LINE_FEED,
    )
    this.read(name, at, end)
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
