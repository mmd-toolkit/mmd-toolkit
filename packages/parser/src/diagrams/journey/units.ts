import type { Range } from "../../ast.ts"
import { isWhitespace } from "../../character-classes.ts"
import {
  COLON,
  COMMA,
  LEFT_CURLY_BRACKET,
  LINE_FEED,
  NUMBER_SIGN,
  PERCENT_SIGN,
  RIGHT_CURLY_BRACKET,
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
import { readUnit } from "../../diagram-units.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import {
  isCodePointAt,
  isWhitespaceAt,
  matchWholeWordIgnoringCase,
  matchWordIgnoringCase,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"

/** diagrams/journey.md, Units and contexts: the names of the units. */
export type UnitName =
  // The statement context.
  | "newline"
  | "header"
  | "title"
  | "title-text"
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "section"
  | "section-text"
  | "task-text"
  | "score"
  | ","
  | "person"
  | "ignored-data"
  | ";"
  // The accessibility contexts.
  | "acc-title-text"
  | "acc-description-text"
  | "acc-description-block-text"
  | "}"

/** diagrams/journey.md, Units and contexts: one unit of the journey lexer. */
export interface Unit extends DiagramUnit<UnitName> {
  /**
   * The statement context, rules 12 and 13: for the `:` unit that rule 12
   * or rule 13 reads, whether it starts a data text (rule 12) rather than
   * standing alone (rule 13), which no rule of the grammar takes; null for
   * every other unit, the second colon of a data text included.
   */
  readonly startsData: boolean | null
}

/** diagrams/journey.md, Units and contexts: the contexts of the lexer. */
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

/** diagrams/journey.md, Lexical structure: what the lexer reads from the diagram text. */
export interface JourneyLexing {
  readonly units: readonly Unit[]
  /** The diagram comments, in source order. */
  readonly comments: readonly DiagramComment[]
}

/**
 * The statement context, rules 6 and 12: whether `character` may be a
 * character of a title text or of a data text: any character other than
 * `#`, `;`, and a line feed.
 */
function isTextCharacter(character: DiagramCharacter): boolean {
  return (
    character.codePoint !== NUMBER_SIGN &&
    character.codePoint !== SEMICOLON &&
    character.codePoint !== LINE_FEED
  )
}

/**
 * The statement context, rules 10 and 11, and Tasks: whether `character`
 * may be a character of a section text, of a task text, or of the score
 * part or the people part of a data text, which a `:` ends: a text
 * character other than `:`.
 */
function isTextCharacterOtherThanColon(character: DiagramCharacter): boolean {
  return isTextCharacter(character) && character.codePoint !== COLON
}

/** Tasks: whether `character` may be a character of a person, which a `,` ends too. */
function isPersonCharacter(character: DiagramCharacter): boolean {
  return (
    isTextCharacterOtherThanColon(character) && character.codePoint !== COMMA
  )
}

/**
 * diagrams/journey.md, Lexical structure: the lexer that divides the
 * diagram text into units and finds its diagram comments. It keeps a stack
 * of contexts and, at each place, applies the first rule of the current
 * context that matches. The rules are those of the specification, in its
 * order; each method that reads a context names the section it follows.
 * Letters of the keywords are compared case-insensitively.
 */
export class JourneyUnitLexer {
  private readonly reader: DiagramText

  private readonly lines: LineIndex

  private readonly units: Unit[] = []

  private readonly comments: DiagramComment[] = []

  /** The stack of contexts; the last one is the current context. */
  private readonly contexts: Context[] = ["statement"]

  /** For each context on the stack but the statement context, the unit that entered it, for the error at the end of the text. */
  private readonly entries: Unit[] = []

  /** The place of the next character to read; null at the end of the text. */
  private position: DiagramPosition

  public constructor(reader: DiagramText, lines: LineIndex) {
    this.reader = reader
    this.lines = lines
    this.position = reader.first()
  }

  /**
   * Divides the diagram text into units. Every character other than a line
   * feed, `#`, `:`, and `;` starts a task text in the statement context
   * where no earlier rule matches, and the other contexts read every
   * character, so no place lacks a rule; throws `ParseError` where the text
   * ends in a context that may not end there.
   */
  public lex(): JourneyLexing {
    while (this.position !== null) {
      this.readInContext(this.position, this.currentContext())
    }
    this.checkEndOfText()
    return { units: this.units, comments: this.comments }
  }

  /** The current context: the top of the stack. */
  private currentContext(): Context {
    return this.contexts[this.contexts.length - 1]
  }

  /** Units and contexts: enters `context`, which `entry` entered. */
  private enter(context: Context, entry: Unit): void {
    this.contexts.push(context)
    this.entries.push(entry)
  }

  /** Units and contexts: leaves the current context. */
  private leave(): void {
    this.contexts.pop()
    this.entries.pop()
  }

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`, whose token leaves out the whitespace at its
   * ends as `ends` says.
   */
  private addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
    startsData: boolean | null = null,
  ): Unit {
    const unit: Unit = {
      ...readUnit(this.reader, name, this.units.length, from, to, null, ends),
      startsData,
    }
    this.units.push(unit)
    return unit
  }

  /** Reads the unit named `name` from `at` up to `to`, and goes on after it. */
  private read(
    name: UnitName,
    at: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
  ): Unit {
    const unit = this.addUnit(name, at, to, ends)
    this.position = to
    return unit
  }

  /**
   * Units and contexts: throws when the text ends in a context that may
   * not end there, at the unit that entered it, saying what is not closed.
   */
  private checkEndOfText(): void {
    const message = END_OF_TEXT_MESSAGES[this.currentContext()]
    const entry = this.entries.at(-1)
    if (message === null || entry === undefined) return
    const range: Range = entry.significantRange ?? [entry.start, entry.end]
    throw new ParseError(message, range, this.lines.location(range))
  }

  /** Applies the first rule of `context` that matches at `at`. */
  private readInContext(at: DiagramCharacter, context: Context): void {
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

  /** diagrams/journey.md, The statement context: rules 1 to 14, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readPercentComment(at) ||
      this.readLineFeeds(at) ||
      this.skipWhitespace(at) ||
      this.readHashComment(at) ||
      this.readHeader(at) ||
      this.readKeywordAndText(at, "title", "title-text", isTextCharacter) ||
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
        isTextCharacterOtherThanColon,
      ) ||
      this.readTaskText(at) ||
      this.readData(at) ||
      this.readLoneColon(at) ||
      this.readSemicolon(at)
    ) {
      return
    }
    // Rule 11 takes every character other than a line feed, `#`, `:`, and
    // `;`; rules 2, 4, 13, and 14 take those.
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

  /** The statement context, rule 5: the keyword `journey`, not followed by a word character, a `header` unit. */
  private readHeader(at: DiagramCharacter): boolean {
    const match = matchWholeWordIgnoringCase(this.reader, at, "journey")
    if (match === null) return false
    this.read("header", at, match.end)
    return true
  }

  /**
   * The statement context, rules 6 and 10: `keyword` (`title` or
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
   * The statement context, rules 7 to 9: `keyword` (`accTitle` or
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
    this.enter(context, keywordUnit)
    return true
  }

  /**
   * The statement context, rule 11: one or more characters other than `#`,
   * `:`, `;`, and a line feed: a `task-text` unit, whose token keeps the
   * whitespace at its end, which the description holds.
   */
  private readTaskText(at: DiagramCharacter): boolean {
    if (!isTextCharacterOtherThanColon(at)) return false
    const end = skipWhile(this.reader, at, isTextCharacterOtherThanColon)
    this.read("task-text", at, end, "keep-whitespace")
    return true
  }

  /**
   * The statement context, rule 12, and Tasks: `:` and the data text, one
   * or more characters other than `#`, `;`, and a line feed: a `:` unit
   * that starts data and the units of the data text. Its colons divide it:
   * the score part runs to the second colon or the end of the data text,
   * a `score` unit of the part without the whitespace at its ends, or no
   * unit when the part holds only whitespace; the second colon is a `:`
   * unit, and the people part after it runs to the third colon or the end:
   * a `,` unit for each `,`, and a `person` unit for each stretch between
   * the colon, the commas, and the end, without the whitespace at its
   * ends, or no unit when the stretch holds only whitespace; from the third
   * colon, the rest is an `ignored-data` unit, the colon included and the
   * whitespace at its end left out.
   */
  private readData(at: DiagramCharacter): boolean {
    if (at.codePoint !== COLON) return false
    const afterColon = this.reader.after(at)
    if (afterColon === null || !isTextCharacter(afterColon)) {
      return false
    }
    this.addUnit(":", at, afterColon, "trim-whitespace", true)
    let position = skipWhile(
      this.reader,
      afterColon,
      isTextCharacterOtherThanColon,
    )
    this.readWithoutWhitespaceAtEnds("score", afterColon, position)
    if (isCodePointAt(position, COLON)) {
      const afterSecondColon = this.reader.after(position)
      this.addUnit(":", position, afterSecondColon)
      position = afterSecondColon
      while (position !== null && isTextCharacterOtherThanColon(position)) {
        if (position.codePoint === COMMA) {
          const afterComma = this.reader.after(position)
          this.addUnit(",", position, afterComma)
          position = afterComma
          continue
        }
        const personEnd = skipWhile(this.reader, position, isPersonCharacter)
        this.readWithoutWhitespaceAtEnds("person", position, personEnd)
        position = personEnd
      }
      if (isCodePointAt(position, COLON)) {
        const dataEnd = skipWhile(this.reader, position, isTextCharacter)
        this.readWithoutWhitespaceAtEnds("ignored-data", position, dataEnd)
        position = dataEnd
      }
    }
    this.position = position
    return true
  }

  /**
   * Tasks: the unit named `name` of the characters from `from` up to `to`,
   * without the whitespace at their ends; none when they are all
   * whitespace.
   */
  private readWithoutWhitespaceAtEnds(
    name: "score" | "person" | "ignored-data",
    from: DiagramCharacter,
    to: DiagramPosition,
  ): void {
    let first: DiagramCharacter | null = null
    let afterLast: DiagramPosition = from
    for (
      let position: DiagramPosition = from;
      position !== null && !samePosition(position, to);
      position = this.reader.after(position)
    ) {
      if (isWhitespace(position.codePoint)) continue
      first ??= position
      afterLast = this.reader.after(position)
    }
    if (first !== null) this.addUnit(name, first, afterLast)
  }

  /**
   * The statement context, rule 13: `:`, a `:` unit that starts no data,
   * which no rule of the grammar takes.
   */
  private readLoneColon(at: DiagramCharacter): boolean {
    if (at.codePoint !== COLON) return false
    const after = this.reader.after(at)
    this.addUnit(":", at, after, "trim-whitespace", false)
    this.position = after
    return true
  }

  /** The statement context, rule 14: `;`, a `;` unit, which no rule of the grammar takes. */
  private readSemicolon(at: DiagramCharacter): boolean {
    if (at.codePoint !== SEMICOLON) return false
    this.read(";", at, this.reader.after(at))
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
