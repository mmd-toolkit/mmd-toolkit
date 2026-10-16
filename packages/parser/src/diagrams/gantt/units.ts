import { isAsciiDigit, isWhitespace } from "../../character-classes.ts"
import {
  COLON,
  COMMA,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LINE_FEED,
  NUMBER_SIGN,
  PERCENT_SIGN,
  QUOTATION_MARK,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
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
import { UnitLexer } from "../../unit-lexer.ts"
import {
  isCodePointAt,
  isWhitespaceAt,
  isWordCharacterAt,
  matchWholeWordIgnoringCase,
  matchWordIgnoringCase,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"

/** diagrams/gantt.md, Units and contexts: the names of the units. */
export type UnitName =
  // The statement context.
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "newline"
  | "href"
  | '"'
  | "call"
  | "click"
  | "header"
  | "dateFormat"
  | "axisFormat"
  | "tickInterval"
  | "setting-text"
  | "inclusiveEndDates"
  | "topAxis"
  | "includes"
  | "excludes"
  | "list-item"
  | ","
  | "todayMarker"
  | "marker-text"
  | "weekday"
  | "weekend"
  | "day"
  | "date"
  | "title"
  | "title-text"
  | "accDescription"
  | "section"
  | "section-text"
  | "task-text"
  | "data-item"
  // The click context.
  | "id"
  // The href context.
  | "url-text"
  // The callback contexts.
  | "("
  | ")"
  | "callback-name"
  | "callback-arguments"
  // The accessibility contexts.
  | "acc-title-text"
  | "acc-description-text"
  | "acc-description-block-text"
  | "}"

/** diagrams/gantt.md, Units and contexts: one unit of the Gantt lexer. */
export interface Unit extends DiagramUnit<UnitName> {
  /**
   * The statement context, rules 26 and 27: for a `:` unit of the statement
   * context, whether it starts a data text (rule 26) rather than standing
   * alone (rule 27), which no rule of the grammar takes; null for every
   * other unit.
   */
  readonly startsData: boolean | null
}

/** diagrams/gantt.md, Units and contexts: the contexts of the lexer. */
type Context =
  | "statement"
  | "click"
  | "href"
  | "callback-name"
  | "callback-arguments"
  | "title"
  | "description"
  | "description-block"

/**
 * Units and contexts: for each context, null when the text may end in it,
 * the statement context only; otherwise the message of the error when the
 * text ends in it, which says what is not closed.
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  statement: null,
  click: "click has no click id before the end of the text",
  href: 'The string has no closing " before the end of the text',
  "callback-name":
    "The callback after call has no ( before the end of the text",
  "callback-arguments":
    "The arguments of the callback have no ) before the end of the text",
  title: "accTitle has no text before the end of the text",
  description: "accDescr has no text before the end of the text",
  "description-block":
    "The description block has no } before the end of the text",
}

/** The statement context, rule 21: the shape of a date, `d` for an ASCII digit and `-` for itself. */
const DATE_SHAPE = "dddd-dd-dd"

/** The statement context, rule 19: the days that may follow `weekday`. */
const WEEKDAY_DAYS: readonly string[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

/** The statement context, rule 20: the days that may follow `weekend`. */
const WEEKEND_DAYS: readonly string[] = ["friday", "saturday"]

/** diagrams/gantt.md, Lexical structure: what the lexer reads from the diagram text. */
export interface GanttLexing {
  readonly units: readonly Unit[]
  /** The diagram comments, in source order. */
  readonly comments: readonly DiagramComment[]
}

/**
 * The statement context, rules 11 and 14 to 17: whether `character` may be
 * a character of a setting text, a list text, or a data text: any
 * character other than `#`, `;`, and a line feed.
 */
function isSettingCharacter(character: DiagramCharacter): boolean {
  return (
    character.codePoint !== NUMBER_SIGN &&
    character.codePoint !== SEMICOLON &&
    character.codePoint !== LINE_FEED
  )
}

/**
 * The statement context, rule 18: whether `character` may be a character
 * of a marker text: any character other than `;` and a line feed.
 */
function isMarkerCharacter(character: DiagramCharacter): boolean {
  return character.codePoint !== SEMICOLON && character.codePoint !== LINE_FEED
}

/**
 * The statement context, rule 25: whether `character` may be a character
 * of a task text: any character other than `:` and a line feed.
 */
function isTaskTextCharacter(character: DiagramCharacter): boolean {
  return character.codePoint !== COLON && character.codePoint !== LINE_FEED
}

/**
 * diagrams/gantt.md, Lexical structure: the lexer that divides the diagram
 * text into units and finds its diagram comments. It keeps a stack of
 * contexts and, at each place, applies the first rule of the current
 * context that matches. The rules are those of the specification, in its
 * order; each method that reads a context names the section it follows.
 * Letters of the keywords are compared case-insensitively.
 */
export class GanttUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "statement", END_OF_TEXT_MESSAGES)
  }

  /**
   * Divides the diagram text into units. Every character other than a line
   * feed and `:` starts a task text in the statement context, and the
   * other contexts read every character, so no place lacks a rule; throws
   * `ParseError` where the text ends in a context that may not end there.
   */
  public lex(): GanttLexing {
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
    startsData: boolean | null = null,
  ): Unit {
    const unit: Unit = {
      ...readUnit(this.reader, name, this.units.length, from, to, null, ends),
      startsData,
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
      case "click":
        this.readInClickContext(at)
        return
      case "href":
        this.readInHrefContext(at)
        return
      case "callback-name":
        this.readInCallbackNameContext(at)
        return
      case "callback-arguments":
        this.readInCallbackArgumentsContext(at)
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

  /** diagrams/gantt.md, The statement context: rules 1 to 27, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readAccessibilityKeyword(at, "accTitle", COLON, "title") ||
      this.readAccessibilityKeyword(at, "accDescr", COLON, "description") ||
      this.readAccessibilityKeyword(
        at,
        "accDescr",
        LEFT_CURLY_BRACKET,
        "description-block",
      ) ||
      this.readComment(at) ||
      this.readLineFeeds(at) ||
      this.skipWhitespace(at) ||
      this.readHref(at) ||
      this.readKeywordEnteringContext(at, "call", "callback-name") ||
      this.readKeywordEnteringContext(at, "click", "click") ||
      this.readKeyword(at, "gantt", "header") ||
      this.readSetting(at, "dateFormat") ||
      this.readKeyword(at, "inclusiveEndDates", "inclusiveEndDates") ||
      this.readKeyword(at, "topAxis", "topAxis") ||
      this.readSetting(at, "axisFormat") ||
      this.readSetting(at, "tickInterval") ||
      this.readList(at, "includes") ||
      this.readList(at, "excludes") ||
      this.readTodayMarker(at) ||
      this.readDay(at, "weekday", WEEKDAY_DAYS) ||
      this.readDay(at, "weekend", WEEKEND_DAYS) ||
      this.readDate(at) ||
      this.readKeywordAndRestOfLine(at, "title", "title-text") ||
      this.readAccDescription(at) ||
      this.readKeywordAndRestOfLine(at, "section", "section-text") ||
      this.readTaskText(at) ||
      this.readData(at) ||
      this.readLoneColon(at)
    ) {
      return
    }
    // Rule 25 takes every character other than `:` and a line feed, rule 5
    // a line feed, and rule 27 a `:`.
    throw new Error(
      `mmd-toolkit parser bug: no rule of the statement context matches at ${at.start}`,
    )
  }

  /**
   * The statement context, rules 1 to 3: `keyword` (`accTitle` or
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
   * The statement context, rule 4, and Comments: `%` and the rest of its
   * line, up to and not including the line feed, a diagram comment. Its
   * mark is `%%` when it starts with `%%`, found in the text without
   * directives, and `%` otherwise; its value is the source text after the
   * mark. A `%%{` that starts no directive is such a comment too.
   */
  private readComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== PERCENT_SIGN) return false
    const second = this.reader.after(at)
    const markLast = isCodePointAt(second, PERCENT_SIGN) ? second : at
    const lineFeed = lineFeedAfter(this.reader, markLast)
    this.comments.push({
      range: [at.start, lineFeed.start],
      mark: markLast === at ? "%" : "%%",
      valueStart: markLast.end,
    })
    this.position = lineFeed
    return true
  }

  /** The statement context, rule 5: one or more line feeds, a `newline` unit. */
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

  /** The statement context, rule 6: one or more whitespace characters, line feeds included, nothing. */
  private skipWhitespace(at: DiagramCharacter): boolean {
    if (!isWhitespace(at.codePoint)) return false
    this.position = skipWhitespace(this.reader, at)
    return true
  }

  /**
   * The statement context, rule 7: `href`, one or more whitespace
   * characters, line feeds included, and `"`: an `href` unit and a `"`
   * unit; enters the href context, which the `"` entered.
   */
  private readHref(at: DiagramCharacter): boolean {
    const word = matchWordIgnoringCase(this.reader, at, "href")
    if (word === null || !isWhitespaceAt(word.end)) return false
    const quote = skipWhitespace(this.reader, word.end)
    if (!isCodePointAt(quote, QUOTATION_MARK)) return false
    this.addUnit("href", at, word.end)
    const opening = this.read('"', quote, this.reader.after(quote))
    this.enter("href", significantRangeOf(opening))
    return true
  }

  /**
   * The statement context, rules 8 and 9: `keyword` (`call` or `click`) and
   * one or more whitespace characters, line feeds included: a unit named
   * by the keyword; enters `context`.
   */
  private readKeywordEnteringContext(
    at: DiagramCharacter,
    keyword: "call" | "click",
    context: "callback-name" | "click",
  ): boolean {
    const word = matchWordIgnoringCase(this.reader, at, keyword)
    if (word === null || !isWhitespaceAt(word.end)) return false
    const unit = this.addUnit(keyword, at, word.end)
    this.position = skipWhitespace(this.reader, word.end)
    this.enter(context, significantRangeOf(unit))
    return true
  }

  /**
   * The keyword `word`, compared case-insensitively and not followed by a
   * word character: a unit named `name` (rules 10, 12, and 13).
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

  /**
   * Keywords and what follows them: `keyword`, compared case-insensitively,
   * exactly one whitespace character, a line feed included, and the first
   * character of its text, which `startsText` takes. The place of that
   * first character; null where the text cannot start.
   */
  private textAfterKeyword(
    at: DiagramCharacter,
    keyword: string,
    startsText: (character: DiagramCharacter) => boolean,
  ): {
    readonly keywordEnd: DiagramCharacter
    readonly text: DiagramCharacter
  } | null {
    const word = matchWordIgnoringCase(this.reader, at, keyword)
    if (word === null || !isWhitespaceAt(word.end)) return null
    const text = this.reader.after(word.end)
    if (text === null || !startsText(text)) return null
    return { keywordEnd: word.end, text }
  }

  /**
   * The statement context, rules 11, 14, and 15: `keyword` (`dateFormat`,
   * `axisFormat`, or `tickInterval`), one whitespace character, a line feed
   * included, and one or more characters other than `#`, `;`, and a line
   * feed: a unit named by the keyword and a `setting-text` unit of the
   * characters after the one whitespace character, whose token keeps the
   * whitespace at its ends.
   */
  private readSetting(
    at: DiagramCharacter,
    keyword: "dateFormat" | "axisFormat" | "tickInterval",
  ): boolean {
    const found = this.textAfterKeyword(at, keyword, isSettingCharacter)
    if (found === null) return false
    this.addUnit(keyword, at, found.keywordEnd)
    const end = skipWhile(this.reader, found.text, isSettingCharacter)
    this.read("setting-text", found.text, end, "keep-whitespace")
    return true
  }

  /**
   * The statement context, rules 16 and 17: `keyword` (`includes` or
   * `excludes`), one whitespace character, a line feed included, and the
   * list text, one or more characters other than `#`, `;`, and a line feed:
   * a unit named by the keyword, a `,` unit for each `,` of the list text,
   * and a `list-item` unit for each maximal run of its characters that are
   * neither whitespace nor `,`; its whitespace belongs to no unit.
   */
  private readList(
    at: DiagramCharacter,
    keyword: "includes" | "excludes",
  ): boolean {
    const found = this.textAfterKeyword(at, keyword, isSettingCharacter)
    if (found === null) return false
    this.addUnit(keyword, at, found.keywordEnd)
    let position: DiagramPosition = found.text
    while (position !== null && isSettingCharacter(position)) {
      if (isWhitespace(position.codePoint)) {
        position = this.reader.after(position)
      } else if (position.codePoint === COMMA) {
        const after = this.reader.after(position)
        this.addUnit(",", position, after)
        position = after
      } else {
        const end = skipWhile(
          this.reader,
          position,
          (character) =>
            isSettingCharacter(character) &&
            !isWhitespace(character.codePoint) &&
            character.codePoint !== COMMA,
        )
        this.addUnit("list-item", position, end)
        position = end
      }
    }
    this.position = position
    return true
  }

  /**
   * The statement context, rule 18: `todayMarker`, one whitespace
   * character, a line feed included, and one or more characters other than
   * `;` and a line feed: a `todayMarker` unit and a `marker-text` unit,
   * which may hold `#`, whose token keeps the whitespace at its ends.
   */
  private readTodayMarker(at: DiagramCharacter): boolean {
    const found = this.textAfterKeyword(at, "todayMarker", isMarkerCharacter)
    if (found === null) return false
    this.addUnit("todayMarker", at, found.keywordEnd)
    const end = skipWhile(this.reader, found.text, isMarkerCharacter)
    this.read("marker-text", found.text, end, "keep-whitespace")
    return true
  }

  /**
   * The statement context, rules 19 and 20: `keyword` (`weekday` or
   * `weekend`), one or more whitespace characters, line feeds included, and
   * one of the keywords `days`: a unit named by the keyword and a `day`
   * unit.
   */
  private readDay(
    at: DiagramCharacter,
    keyword: "weekday" | "weekend",
    days: readonly string[],
  ): boolean {
    const word = matchWordIgnoringCase(this.reader, at, keyword)
    if (word === null || !isWhitespaceAt(word.end)) return false
    const dayAt = skipWhitespace(this.reader, word.end)
    if (dayAt === null) return false
    for (const day of days) {
      const match = matchWholeWordIgnoringCase(this.reader, dayAt, day)
      if (match === null) continue
      this.addUnit(keyword, at, word.end)
      this.read("day", dayAt, match.end)
      return true
    }
    return false
  }

  /**
   * The statement context, rule 21: four digits, `-`, two digits, `-`, and
   * two digits, not followed by a word character: a `date` unit, which no
   * rule of the grammar takes.
   */
  private readDate(at: DiagramCharacter): boolean {
    let position: DiagramPosition = at
    for (const expected of DATE_SHAPE) {
      if (position === null) return false
      const matches =
        expected === "d"
          ? isAsciiDigit(position.codePoint)
          : position.codePoint === HYPHEN_MINUS
      if (!matches) return false
      position = this.reader.after(position)
    }
    if (isWordCharacterAt(position)) return false
    this.read("date", at, position)
    return true
  }

  /**
   * The statement context, rules 22 and 24: `keyword` (`title` or
   * `section`), one whitespace character, a line feed included, and one or
   * more characters other than a line feed: a unit named by the keyword
   * and a unit named `name` of the characters after the one whitespace
   * character, to the end of the line, whose token keeps the whitespace at
   * its ends.
   */
  private readKeywordAndRestOfLine(
    at: DiagramCharacter,
    keyword: "title" | "section",
    name: "title-text" | "section-text",
  ): boolean {
    const found = this.textAfterKeyword(
      at,
      keyword,
      (character) => character.codePoint !== LINE_FEED,
    )
    if (found === null) return false
    this.addUnit(keyword, at, found.keywordEnd)
    const end = skipWhile(
      this.reader,
      found.text,
      (character) => character.codePoint !== LINE_FEED,
    )
    this.read(name, found.text, end, "keep-whitespace")
    return true
  }

  /**
   * The statement context, rule 23: `accDescription`, one whitespace
   * character, and one or more characters other than `#`, `;`, and a line
   * feed: an `accDescription` unit of all of them, which no rule of the
   * grammar takes.
   */
  private readAccDescription(at: DiagramCharacter): boolean {
    const found = this.textAfterKeyword(
      at,
      "accDescription",
      isSettingCharacter,
    )
    if (found === null) return false
    const end = skipWhile(this.reader, found.text, isSettingCharacter)
    this.read("accDescription", at, end)
    return true
  }

  /**
   * The statement context, rule 25: one or more characters other than `:`
   * and a line feed: a `task-text` unit, whose token keeps the whitespace
   * at its end, which the description holds.
   */
  private readTaskText(at: DiagramCharacter): boolean {
    if (!isTaskTextCharacter(at)) return false
    const end = skipWhile(this.reader, at, isTaskTextCharacter)
    this.read("task-text", at, end, "keep-whitespace")
    return true
  }

  /**
   * The statement context, rule 26: `:` and the data text, one or more
   * characters other than `#`, `;`, and a line feed: a `:` unit that starts
   * data, a `,` unit for each `,` of the data text, and, for each stretch
   * of the data text between the `:`, the commas, and its end, a
   * `data-item` unit of the stretch without the whitespace at its ends, or
   * no unit when the stretch holds only whitespace.
   */
  private readData(at: DiagramCharacter): boolean {
    if (at.codePoint !== COLON) return false
    const afterColon = this.reader.after(at)
    if (afterColon === null || !isSettingCharacter(afterColon)) return false
    this.addUnit(":", at, afterColon, "trim-whitespace", true)
    let position: DiagramPosition = afterColon
    while (position !== null && isSettingCharacter(position)) {
      if (position.codePoint === COMMA) {
        const after = this.reader.after(position)
        this.addUnit(",", position, after)
        position = after
        continue
      }
      const stretchEnd = skipWhile(
        this.reader,
        position,
        (character) =>
          isSettingCharacter(character) && character.codePoint !== COMMA,
      )
      this.readDataItem(position, stretchEnd)
      position = stretchEnd
    }
    this.position = position
    return true
  }

  /**
   * The statement context, rule 27: `:`, a `:` unit that starts no data,
   * which no rule of the grammar takes.
   */
  private readLoneColon(at: DiagramCharacter): boolean {
    if (at.codePoint !== COLON) return false
    const after = this.reader.after(at)
    this.addUnit(":", at, after, "trim-whitespace", false)
    this.position = after
    return true
  }

  /**
   * The statement context, rule 26: the `data-item` unit of the stretch of
   * a data text from `from` up to `to`, without the whitespace at its ends;
   * none when the stretch holds only whitespace.
   */
  private readDataItem(from: DiagramCharacter, to: DiagramPosition): void {
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
    if (first !== null) this.addUnit("data-item", first, afterLast)
  }

  /**
   * diagrams/gantt.md, The click context: rule 1, one whitespace character,
   * a line feed included, which leaves the context; rule 2, the id text,
   * one or more characters that are not whitespace: a `,` unit for each
   * `,` and an `id` unit for each maximal run of other characters.
   */
  private readInClickContext(at: DiagramCharacter): void {
    if (isWhitespace(at.codePoint)) {
      this.position = this.reader.after(at)
      this.leave()
      return
    }
    let position: DiagramPosition = at
    while (position !== null && !isWhitespace(position.codePoint)) {
      if (position.codePoint === COMMA) {
        const after = this.reader.after(position)
        this.addUnit(",", position, after)
        position = after
      } else {
        const end = skipWhile(
          this.reader,
          position,
          (character) =>
            !isWhitespace(character.codePoint) && character.codePoint !== COMMA,
        )
        this.addUnit("id", position, end)
        position = end
      }
    }
    this.position = position
  }

  /**
   * diagrams/gantt.md, The href context: rule 1, `"`, a `"` unit, which
   * leaves the context; rule 2, one or more characters other than `"`,
   * line feeds included, a `url-text` unit.
   */
  private readInHrefContext(at: DiagramCharacter): void {
    if (at.codePoint === QUOTATION_MARK) {
      this.read('"', at, this.reader.after(at))
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== QUOTATION_MARK,
    )
    this.read("url-text", at, end)
  }

  /**
   * diagrams/gantt.md, The callback contexts, the callback name context:
   * rule 1, `(`, zero or more whitespace characters, line feeds included,
   * and `)`, a `(` and a `)` unit, which leave the context; rule 2, `(`, a
   * `(` unit, which leaves the context and enters the callback arguments
   * context; rule 3, one or more characters other than `(`, line feeds
   * included, a `callback-name` unit, whose token keeps the whitespace at
   * its end.
   */
  private readInCallbackNameContext(at: DiagramCharacter): void {
    if (at.codePoint === LEFT_PARENTHESIS) {
      const afterOpening = this.reader.after(at)
      const closing = skipWhitespace(this.reader, afterOpening)
      if (isCodePointAt(closing, RIGHT_PARENTHESIS)) {
        this.addUnit("(", at, afterOpening)
        this.read(")", closing, this.reader.after(closing))
        this.leave()
        return
      }
      const opening = this.read("(", at, afterOpening)
      this.leave()
      this.enter("callback-arguments", significantRangeOf(opening))
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== LEFT_PARENTHESIS,
    )
    this.read("callback-name", at, end, "keep-whitespace")
  }

  /**
   * diagrams/gantt.md, The callback contexts, the callback arguments
   * context: rule 1, `)`, a `)` unit, which leaves the context; rule 2, one
   * or more characters other than `)`, line feeds included, a
   * `callback-arguments` unit, whose token keeps the whitespace at its
   * ends.
   */
  private readInCallbackArgumentsContext(at: DiagramCharacter): void {
    if (at.codePoint === RIGHT_PARENTHESIS) {
      this.read(")", at, this.reader.after(at))
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== RIGHT_PARENTHESIS,
    )
    this.read("callback-arguments", at, end, "keep-whitespace")
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
