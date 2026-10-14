import type { Identifier, StringLiteral } from "../../ast.ts"
import type {
  GanttAccDescrBlockStatement,
  GanttAccDescrStatement,
  GanttAccTitleStatement,
  GanttCallback,
  GanttClickStatement,
  GanttDay,
  GanttLiteral,
  GanttStatement,
  GanttTaskStatement,
  GanttWeekendDay,
} from "../../ast/gantt.ts"
import { matchesIgnoringCase } from "../../character-classes.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import type { NodePlace } from "../../unit-grammar.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { GanttLexing, Unit, UnitName } from "./units.ts"

/** What the grammar makes of the units of a Gantt chart. */
export interface GanttSyntax {
  /** The statements of the diagram, in source order. */
  readonly body: readonly GanttStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** Tasks: the words that are tags at the front of the data, in exactly this case. */
const TAGS: readonly string[] = ["active", "done", "crit", "milestone", "vert"]

/** Settings, `weekday-statement`: the days, in lower case. */
const WEEKDAYS: readonly GanttDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

/** Settings, `weekend-statement`: the days, in lower case. */
const WEEKEND_DAYS: readonly GanttWeekendDay[] = ["friday", "saturday"]

/** Whether `text` is `word` with its letters in any case (Notation). */
function isWordInAnyCase(text: string, word: string): boolean {
  const written = [...text]
  const expected = [...word]
  return (
    written.length === expected.length &&
    written.every((character, index) =>
      matchesIgnoringCase(
        character.codePointAt(0) ?? 0,
        expected[index].codePointAt(0) ?? 0,
      ),
    )
  )
}

/**
 * diagrams/gantt.md, Grammar: the recursive-descent parser over the units
 * of the Gantt lexer. Each method reads one rule of the grammar, which its
 * comment names, and makes the node that the specification gives for the
 * rule, with the tokens of `docs/tokens/gantt.md`, Tokens.
 */
export class GanttGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: GanttLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, EMPTY_FORM_KINDS.gantt, lexing.comments)
  }

  /**
   * Diagram and statements: `diagram = header line*`, with `line =
   * statement | newline`. Nothing separates two statements.
   */
  public parseDiagram(): GanttSyntax {
    this.addItem("Keyword", [this.take("header")])
    const body: GanttStatement[] = []
    for (let unit = this.peek(); unit !== null; unit = this.peek()) {
      if (unit.name === "newline") {
        this.advance()
        continue
      }
      body.push(this.parseStatement(unit))
    }
    return { body, tokens: this.tokensInOrder() }
  }

  /**
   * known-divergences/tokenless-empty-forms.md: an empty href or an empty
   * call, which no rule of the grammar takes wherever it stands, and an
   * empty description block where the grammar cannot take it, inside a
   * click statement (Empty description blocks, Empty hrefs and empty
   * calls).
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    return this.emptyFormErrorAt(unit)
  }

  /** Diagram and statements: `statement`, which starts at `unit`, the next unit. */
  private parseStatement(unit: Unit): GanttStatement {
    switch (unit.name) {
      case "task-text":
        return this.parseTaskStatement()
      case "click":
        return this.parseClickStatement()
      case "dateFormat":
        return {
          type: "GanttDateFormatStatement",
          ...this.parseSetting("dateFormat", "setting-text"),
        }
      case "axisFormat":
        return {
          type: "GanttAxisFormatStatement",
          ...this.parseSetting("axisFormat", "setting-text"),
        }
      case "tickInterval":
        return {
          type: "GanttTickIntervalStatement",
          ...this.parseSetting("tickInterval", "setting-text"),
        }
      case "todayMarker":
        return {
          type: "GanttTodayMarkerStatement",
          ...this.parseSetting("todayMarker", "marker-text"),
        }
      case "includes":
        return { type: "GanttIncludesStatement", ...this.parseList("includes") }
      case "excludes":
        return { type: "GanttExcludesStatement", ...this.parseList("excludes") }
      case "inclusiveEndDates": {
        const start = this.next
        this.addItem("Keyword", [this.take("inclusiveEndDates")])
        return {
          type: "GanttInclusiveEndDatesStatement",
          ...this.placeFrom(start),
        }
      }
      case "topAxis":
        throw this.rejectedOutsideGrammar(
          "A topAxis statement cannot be written in a Gantt chart",
          [unit],
        )
      case "weekday": {
        const { word, ...place } = this.parseDayStatement("weekday", WEEKDAYS)
        return { type: "GanttWeekdayStatement", day: word, ...place }
      }
      case "weekend": {
        const { word, ...place } = this.parseDayStatement(
          "weekend",
          WEEKEND_DAYS,
        )
        return { type: "GanttWeekendStatement", day: word, ...place }
      }
      case "title":
        return {
          type: "GanttTitleStatement",
          ...this.parseSetting("title", "title-text"),
        }
      case "section": {
        const { value, ...place } = this.parseSetting("section", "section-text")
        return { type: "GanttSectionStatement", name: value, ...place }
      }
      case "accTitle":
        return this.parseAccTitleStatement()
      case "accDescr":
        return this.nameAt(this.positionAfter(this.next)) === ":"
          ? this.parseAccDescrStatement()
          : this.parseAccDescrBlockStatement()
      default:
        throw this.unexpected(unit)
    }
  }

  /**
   * Tasks: `task-statement = task-text ":" data-item? ( "," data-item? )*`,
   * whose `:` starts data. The items are taken from the front as tags as
   * long as the first remaining item is one of {@link TAGS}; a task whose
   * data holds tags only is rejected outside the grammar.
   */
  private parseTaskStatement(): GanttTaskStatement {
    const start = this.next
    const description = this.literalOf(this.take("task-text"))
    const colon = this.peek()
    if (colon?.name !== ":" || colon.startsData !== true) {
      throw this.unexpected(colon)
    }
    this.advance()
    this.addItem("Punctuator", [colon])
    const data: (Unit | null)[] = [this.takeIf("data-item")]
    while (this.nameAt(this.next) === ",") {
      this.addItem("Punctuator", [this.take(",")])
      data.push(this.takeIf("data-item"))
    }
    const tagCount = data.findIndex(
      (unit) => unit === null || !TAGS.includes(unit.text),
    )
    const tagUnits = data
      .slice(0, tagCount === -1 ? data.length : tagCount)
      .filter((unit) => unit !== null)
    if (tagUnits.length === data.length) {
      throw this.rejectedOutsideGrammar(
        "The data of a task needs an item after its tags",
        tagUnits,
      )
    }
    const tags = tagUnits.map((unit) => this.tagOf(unit))
    const items = data
      .slice(tagUnits.length)
      .map((unit) => (unit === null ? null : this.literalOf(unit)))
    return {
      type: "GanttTaskStatement",
      description,
      tags,
      items,
      ...this.placeFrom(start),
    }
  }

  /**
   * Click statements: `click-statement = "click" ( id | "," )+ ( call-part
   * href-part? | href-part call-part? )`. A part is one that is not an
   * empty href or an empty call; an empty form before the first part, or
   * between the two, lies inside the statement (Empty description blocks,
   * Empty hrefs and empty calls).
   */
  private parseClickStatement(): GanttClickStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("click")])
    const ids = this.parseClickIds()
    let call: GanttCallback | null = null
    let href: StringLiteral | null = null
    if (this.startsPart("call")) {
      call = this.parseCallPart()
      if (this.clickGoesOn("href")) href = this.parseHrefPart()
    } else if (this.startsPart("href")) {
      href = this.parseHrefPart()
      if (this.clickGoesOn("call")) call = this.parseCallPart()
    } else {
      throw this.unexpected(this.peek())
    }
    return {
      type: "GanttClickStatement",
      ids,
      call,
      href,
      ...this.placeFrom(start),
    }
  }

  /**
   * Click statements: the ids, `( id | "," )+`: an Identifier for each `id`
   * unit and null for each place between the commas, before the first, or
   * after the last that holds none, so that there is one id more than
   * there are commas.
   */
  private parseClickIds(): (Identifier | null)[] {
    const units = this.takeWhile(["id", ","])
    if (units.length === 0) throw this.unexpected(this.peek())
    const ids: (Identifier | null)[] = []
    let current: Identifier | null = null
    for (const unit of units) {
      if (unit.name === ",") {
        this.addItem("Punctuator", [unit])
        ids.push(current)
        current = null
      } else {
        current = this.identifierOf([unit])
      }
    }
    ids.push(current)
    return ids
  }

  /** Click statements: whether the next unit starts a part named `name`, a `call` or an `href` that starts no empty form. */
  private startsPart(name: "call" | "href"): boolean {
    const unit = this.peek()
    return unit?.name === name && this.emptyFormOf(unit) === null
  }

  /**
   * Click statements: whether the click statement goes on with its second
   * part, named `name`: the next unit, or the first unit after the empty
   * forms that come next, starts it. Forms written there are decided
   * together, by the unit after the last of them; when it starts the
   * second part, they lie inside the statement, and the input is rejected
   * at the first of them; otherwise the statement ends before them, where
   * an empty description block is a statement and an empty href or an
   * empty call is rejected.
   */
  private clickGoesOn(name: "call" | "href"): boolean {
    const after = this.afterEmptyForms(this.next, EMPTY_FORM_KINDS.gantt)
    const unit = this.unitAt(after)
    if (unit?.name !== name || this.emptyFormOf(unit) !== null) return false
    if (after !== this.next) throw this.unexpected(this.peek())
    return true
  }

  /** Click statements: `call-part = "call" callback-name "(" callback-arguments? ")"`. */
  private parseCallPart(): GanttCallback {
    const start = this.next
    this.addItem("Keyword", [this.take("call")])
    const name = this.literalOf(this.take("callback-name"))
    this.addItem("Punctuator", [this.take("(")])
    const argsUnit = this.takeIf("callback-arguments")
    const args = argsUnit === null ? null : this.literalOf(argsUnit)
    this.addItem("Punctuator", [this.take(")")])
    return { type: "GanttCallback", name, args, ...this.placeFrom(start) }
  }

  /**
   * Click statements: `href-part = "href" '"' url-text '"'`. The string is
   * a StringLiteral, one `String` item from its opening to its closing
   * `"`, whose value is its written text between them; it is always closed,
   * since the text may not end in the href context.
   */
  private parseHrefPart(): StringLiteral {
    this.addItem("Keyword", [this.take("href")])
    const units = [this.take('"'), this.take("url-text"), this.take('"')]
    this.addItem("String", units)
    const place = this.placeOf(units)
    const [start, end] = place.range
    return {
      type: "StringLiteral",
      value: this.textOf([start + 1, end - 1]),
      raw: this.lexer.text.slice(start, end),
      closed: true,
      ...place,
    }
  }

  /**
   * Settings, and Titles and sections: a keyword `keyword` and the text
   * unit named `textName` after it, whose GanttLiteral is the value.
   */
  private parseSetting(
    keyword:
      | "dateFormat"
      | "axisFormat"
      | "tickInterval"
      | "todayMarker"
      | "title"
      | "section",
    textName: "setting-text" | "marker-text" | "title-text" | "section-text",
  ): NodePlace & { readonly value: GanttLiteral } {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const value = this.literalOf(this.take(textName))
    return { value, ...this.placeFrom(start) }
  }

  /**
   * Settings: `includes-statement = "includes" ( list-item | "," )*` and
   * `excludes-statement = "excludes" ( list-item | "," )*`: an Identifier
   * for each `list-item` unit.
   */
  private parseList(
    keyword: "includes" | "excludes",
  ): NodePlace & { readonly items: readonly Identifier[] } {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const items: Identifier[] = []
    for (const unit of this.takeWhile(["list-item", ","])) {
      if (unit.name === ",") {
        this.addItem("Punctuator", [unit])
      } else {
        items.push(this.identifierOf([unit]))
      }
    }
    return { items, ...this.placeFrom(start) }
  }

  /**
   * Settings: `weekday-statement = "weekday" day` and `weekend-statement =
   * "weekend" day`: the day of `days` that the `day` unit writes, in any
   * case.
   */
  private parseDayStatement<Day extends string>(
    keyword: "weekday" | "weekend",
    days: readonly Day[],
  ): NodePlace & { readonly word: Day } {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const unit = this.take("day")
    this.addItem("Keyword", [unit])
    const word = days.find((day) => isWordInAnyCase(unit.text, day))
    if (word === undefined) {
      throw new Error(
        `mmd-toolkit parser bug: the day ${JSON.stringify(unit.text)} is no day of ${keyword}`,
      )
    }
    return { word, ...this.placeFrom(start) }
  }

  /** Accessibility statements: `"accTitle" ":" acc-title-text`. */
  private parseAccTitleStatement(): GanttAccTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accTitle")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "GanttAccTitleStatement",
      value: this.literalOf(this.take("acc-title-text")),
      ...this.placeFrom(start),
    }
  }

  /** Accessibility statements: `"accDescr" ":" acc-description-text`. */
  private parseAccDescrStatement(): GanttAccDescrStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "GanttAccDescrStatement",
      value: this.literalOf(this.take("acc-description-text")),
      ...this.placeFrom(start),
    }
  }

  /**
   * Accessibility statements and Empty description blocks: `"accDescr" "{"
   * acc-description-block-text "}"`, and `empty-description-block =
   * "accDescr" "{" "}"`, a statement without text.
   */
  private parseAccDescrBlockStatement(): GanttAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("acc-description-block-text")
    this.addItem("Punctuator", [this.take("}")])
    return {
      type: "GanttAccDescrBlockStatement",
      value: text === null ? null : this.literalOf(text),
      ...this.placeFrom(start),
    }
  }

  /**
   * ast/gantt.md, GanttTaskStatement: the tag of the `data-item` unit
   * `unit`, an Identifier whose name is its written text. A `data-item` is
   * a text unit (diagrams/gantt.md, Directives inside units), so it is one
   * `RawText` item, which a directive may cut, as for an item
   * (`docs/tokens/gantt.md`, Tokens).
   */
  private tagOf(unit: Unit): Identifier {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "Identifier", name: this.textOf(place.range), ...place }
  }

  /**
   * ast/gantt.md, GanttLiteral: the text unit `unit`, one `RawText` item,
   * whose value is the written text of its token: the whole unit where its
   * token keeps the whitespace at its ends, and the unit without that
   * whitespace otherwise (`docs/tokens/gantt.md`, Tokens).
   */
  private literalOf(unit: Unit): GanttLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "GanttLiteral", value: this.textOf(place.range), ...place }
  }

  /**
   * Rejections outside the grammar: the error for an input that the
   * grammar of mermaid.js accepts and its Db rejects, with the message
   * `message`, from the first to the last of `units`.
   */
  private rejectedOutsideGrammar(
    message: string,
    units: readonly Unit[],
  ): ParseError {
    const { range } = this.placeOf(units)
    return new ParseError(message, range, this.lines.location(range))
  }
}
