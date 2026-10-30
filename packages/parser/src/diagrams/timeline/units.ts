import { isWhitespace } from "../../character-classes.ts"
import {
  CHARACTER_TABULATION,
  COLON,
  LEFT_CURLY_BRACKET,
  LINE_FEED,
  NUMBER_SIGN,
  PERCENT_SIGN,
  RIGHT_CURLY_BRACKET,
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
import type { LineIndex } from "../../positions.ts"
import { UnitLexer } from "../../unit-lexer.ts"
import {
  isCodePointAt,
  isWhitespaceAt,
  matchWholeWordIgnoringCase,
  matchWordIgnoringCase,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"

/** diagrams/timeline.md, Units and contexts: the names of the units. */
export type UnitName =
  // The statement context.
  | "newline"
  | "header"
  | "direction"
  | "title"
  | "title-text"
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "section"
  | "section-text"
  | "event-text"
  | "period-text"
  // The accessibility contexts.
  | "acc-title-text"
  | "acc-description-text"
  | "acc-description-block-text"
  | "}"

/** diagrams/timeline.md, Units and contexts: one unit of the timeline lexer. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/timeline.md, Units and contexts: the contexts of the lexer. */
type Context = "statement" | "title" | "description" | "description-block"

/**
 * Units and contexts: for each context, null when the text may end in it,
 * the statement context only; otherwise the message of the error when the
 * text ends in it, which says what is not closed.
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  statement: null,
  title: "accTitle has no text before the end of the text",
  description: "accDescr has no text before the end of the text",
  "description-block":
    "The description block has no } before the end of the text",
}

/** The statement context, rules 5 and 6: the directions, in the order in which they are tried. */
const DIRECTIONS: readonly string[] = ["LR", "TD"]

/** diagrams/timeline.md, Lexical structure: what the lexer reads from the diagram text. */
export interface TimelineLexing {
  readonly units: readonly Unit[]
  /** The diagram comments, in source order. */
  readonly comments: readonly DiagramComment[]
}

/** The statement context, rule 8: whether `character` may be a character of a title text: any character other than a line feed. */
function isTitleCharacter(character: DiagramCharacter): boolean {
  return character.codePoint !== LINE_FEED
}

/**
 * The statement context, rule 12: whether `character` may be a character
 * of a section text: any character other than `:` and a line feed.
 */
function isSectionCharacter(character: DiagramCharacter): boolean {
  return character.codePoint !== COLON && character.codePoint !== LINE_FEED
}

/**
 * The statement context, rule 14: whether `character` may be a character
 * of a period: any character other than `#`, `:`, and a line feed.
 */
function isPeriodCharacter(character: DiagramCharacter): boolean {
  return (
    character.codePoint !== NUMBER_SIGN &&
    character.codePoint !== COLON &&
    character.codePoint !== LINE_FEED
  )
}

/** The statement context, rules 5 and 6: whether `character` is a space or a tab, which may stand between the header and its direction. */
function isSpaceOrTab(character: DiagramCharacter): boolean {
  return (
    character.codePoint === SPACE ||
    character.codePoint === CHARACTER_TABULATION
  )
}

/**
 * diagrams/timeline.md, Lexical structure: the lexer that divides the
 * diagram text into units and finds its diagram comments. It keeps a stack
 * of contexts and, at each place, applies the first rule of the current
 * context that matches. The rules are those of the specification, in its
 * order; each method that reads a context names the section it follows.
 * Letters of the keywords are compared case-insensitively.
 */
export class TimelineUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "statement", END_OF_TEXT_MESSAGES)
  }

  /**
   * Divides the diagram text into units. Every character other than a line
   * feed, `#`, and `:` starts a period in the statement context where no
   * earlier rule matches, rule 15 reads every `:` that rule 13 does not,
   * and the other contexts read every character, so no place lacks a rule;
   * throws `ParseError` where the text ends in a context that may not end
   * there.
   */
  public lex(): TimelineLexing {
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

  /** diagrams/timeline.md, The statement context: rules 1 to 15, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readPercentComment(at) ||
      this.readLineFeeds(at) ||
      this.skipWhitespace(at) ||
      this.readHashComment(at) ||
      this.readHeader(at) ||
      this.readKeywordAndText(at, "title", "title-text", isTitleCharacter) ||
      this.readAccessibilityKeyword(at, "accTitle", COLON, "title") ||
      this.readAccessibilityKeyword(at, "accDescr", COLON, "description") ||
      this.readAccessibilityKeyword(
        at,
        "accDescr",
        LEFT_CURLY_BRACKET,
        "description-block",
      ) ||
      this.readKeywordAndText(
        at,
        "section",
        "section-text",
        isSectionCharacter,
      ) ||
      this.readEvent(at) ||
      this.readPeriod(at) ||
      this.readLoneColon(at)
    ) {
      return
    }
    // Rule 14 takes every character other than a line feed, `#`, and `:`;
    // rules 2, 4, and 15 take those.
    throw new Error(
      `mmd-toolkit parser bug: no rule of the statement context matches at ${at.start}`,
    )
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

  /**
   * The statement context, rule 1, and Comments: `%`, not followed by `{`,
   * a diagram comment. Its mark is `%%` when it starts with `%%`, found in
   * the text without directives, and `%` otherwise. A `%%{` that starts no
   * directive is such a comment too, since its first `%` is followed by a
   * `%`.
   */
  private readPercentComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== PERCENT_SIGN) return false
    const second = this.reader.after(at)
    if (isCodePointAt(second, LEFT_CURLY_BRACKET)) return false
    if (isCodePointAt(second, PERCENT_SIGN)) {
      this.readComment(at, second, "%%")
    } else {
      this.readComment(at, at, "%")
    }
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

  /** The statement context, rule 3: one or more whitespace characters, line feeds included, nothing. */
  private skipWhitespace(at: DiagramCharacter): boolean {
    if (!isWhitespace(at.codePoint)) return false
    this.position = skipWhitespace(this.reader, at)
    return true
  }

  /** The statement context, rule 4, and Comments: `#`, a diagram comment with the mark `#`. */
  private readHashComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== NUMBER_SIGN) return false
    this.readComment(at, at, "#")
    return true
  }

  /**
   * The statement context, rules 5 to 7: the keyword `timeline`, a `header`
   * unit, and, when one or more spaces or tabs and the keyword `LR` or `TD`
   * follow it, a `direction` unit of that keyword.
   */
  private readHeader(at: DiagramCharacter): boolean {
    const header = matchWholeWordIgnoringCase(this.reader, at, "timeline")
    if (header === null) return false
    this.read("header", at, header.end)
    const spacesEnd = skipWhile(this.reader, header.end, isSpaceOrTab)
    if (spacesEnd === null || samePosition(spacesEnd, header.end)) return true
    for (const direction of DIRECTIONS) {
      const match = matchWholeWordIgnoringCase(
        this.reader,
        spacesEnd,
        direction,
      )
      if (match !== null) {
        this.read("direction", spacesEnd, match.end)
        return true
      }
    }
    return true
  }

  /**
   * The statement context, rules 8 and 12: `keyword` (`title` or
   * `section`), compared case-insensitively, one whitespace character, a
   * line feed included, and one or more characters that
   * `isCharacterOfText` takes: a unit named by the keyword and a unit named
   * `name` of the characters after the one whitespace character, whose
   * token keeps the whitespace at its ends.
   */
  private readKeywordAndText(
    at: DiagramCharacter,
    keyword: "title" | "section",
    name: "title-text" | "section-text",
    isCharacterOfText: (character: DiagramCharacter) => boolean,
  ): boolean {
    const word = matchWordIgnoringCase(this.reader, at, keyword)
    if (word === null || !isWhitespaceAt(word.end)) return false
    const text = this.reader.after(word.end)
    if (text === null || !isCharacterOfText(text)) return false
    this.addUnit(keyword, at, word.end)
    const end = skipWhile(this.reader, text, isCharacterOfText)
    this.read(name, text, end, "keep-whitespace")
    return true
  }

  /**
   * The statement context, rules 9 to 11: `keyword` (`accTitle` or
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

  /**
   * The statement context, rule 13: `:`, one whitespace character, a line
   * feed included, and the event text, one or more characters, each a
   * character other than `:` and a line feed or a `:` that no whitespace
   * follows: a `:` unit and an `event-text` unit, whose token keeps the
   * whitespace at its ends.
   */
  private readEvent(at: DiagramCharacter): boolean {
    if (at.codePoint !== COLON) return false
    const separator = this.reader.after(at)
    if (!isWhitespaceAt(separator)) return false
    const text = this.reader.after(separator)
    if (text === null || !this.continuesEvent(text)) return false
    this.addUnit(":", at, separator)
    const end = skipWhile(this.reader, text, (character) =>
      this.continuesEvent(character),
    )
    this.read("event-text", text, end, "keep-whitespace")
    return true
  }

  /**
   * The statement context, rule 13: whether `character` may be a character
   * of an event text: a character other than `:` and a line feed, or a `:`
   * that no whitespace follows.
   */
  private continuesEvent(character: DiagramCharacter): boolean {
    if (character.codePoint === LINE_FEED) return false
    if (character.codePoint !== COLON) return true
    return !isWhitespaceAt(this.reader.after(character))
  }

  /**
   * The statement context, rule 14: one or more characters other than `#`,
   * `:`, and a line feed: a `period-text` unit, whose token keeps the
   * whitespace at its end, which the period holds.
   */
  private readPeriod(at: DiagramCharacter): boolean {
    if (!isPeriodCharacter(at)) return false
    const end = skipWhile(this.reader, at, isPeriodCharacter)
    this.read("period-text", at, end, "keep-whitespace")
    return true
  }

  /** The statement context, rule 15: `:`, a `:` unit that starts no event, which no rule of the grammar takes. */
  private readLoneColon(at: DiagramCharacter): boolean {
    if (at.codePoint !== COLON) return false
    this.read(":", at, this.reader.after(at))
    return true
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
    name: "acc-title-text" | "acc-description-text",
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
   * `}`, line feeds included, are an `acc-description-block-text` unit.
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
    this.read("acc-description-block-text", at, end)
  }
}
