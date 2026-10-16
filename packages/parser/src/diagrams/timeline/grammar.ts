import type {
  TimelineAccDescrBlockStatement,
  TimelineAccDescrStatement,
  TimelineAccTitleStatement,
  TimelineEventStatement,
  TimelineLiteral,
  TimelinePeriodStatement,
  TimelineSectionStatement,
  TimelineStatement,
  TimelineTitleStatement,
} from "../../ast/timeline.ts"
import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { TimelineLexing, Unit, UnitName } from "./units.ts"

/** What the grammar makes of the units of a timeline. */
export interface TimelineSyntax {
  /** The direction of the header as written; null when there is none. */
  readonly direction: string | null
  /** The statements of the diagram, in source order. */
  readonly body: readonly TimelineStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/**
 * diagrams/timeline.md, Grammar: the recursive-descent parser over the
 * units of the timeline lexer. Each method reads one rule of the grammar,
 * which its comment names, and makes the node that the specification
 * gives for the rule, with the tokens of `docs/tokens/timeline.md`, Tokens.
 */
export class TimelineGrammar extends UnitGrammar<UnitName, Unit> {
  /** Rejections outside the grammar: whether a period statement has been read, which an event statement needs before it. */
  private periodRead = false

  public constructor(lexing: TimelineLexing, lexer: SourceLexer) {
    // Empty description blocks: a statement starts at every place where a
    // block can be read as one, so no block lies where the grammar cannot
    // take it, and the diagram has none of the empty forms of
    // known-divergences/tokenless-empty-forms.md.
    super(lexing.units, lexer, [], lexing.comments)
  }

  /**
   * Diagram and statements: `diagram = header line*`, with `header =
   * "timeline" direction?` and `line = statement | newline`. Nothing
   * separates two statements.
   */
  public parseDiagram(): TimelineSyntax {
    this.addItem("Keyword", [this.take("header")])
    const directionUnit = this.takeIf("direction")
    let direction: string | null = null
    if (directionUnit !== null) {
      this.addItem("Keyword", [directionUnit])
      direction = this.textOfUnit(directionUnit)
    }
    const body: TimelineStatement[] = []
    for (let unit = this.peek(); unit !== null; unit = this.peek()) {
      if (unit.name === "newline") {
        this.advance()
        continue
      }
      body.push(this.parseStatement(unit))
    }
    return { direction, body, tokens: this.tokensInOrder() }
  }

  /**
   * diagrams/timeline.md, Known divergences: none of them is found at a
   * unit that the grammar cannot read. The directives and the ignored `;`
   * inside a keyword are rejected where the tokens are recorded, and the
   * others read the text otherwise without a unit that this grammar
   * rejects.
   */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** Diagram and statements: `statement`, which starts at `unit`, the next unit. */
  private parseStatement(unit: Unit): TimelineStatement {
    switch (unit.name) {
      case "period-text":
        return this.parsePeriodStatement()
      case ":":
        return this.parseEventStatement()
      case "title":
        return this.parseTitleStatement()
      case "section":
        return this.parseSectionStatement()
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

  /** Periods and events: `period-statement = period-text ( newline* event )*`. */
  private parsePeriodStatement(): TimelinePeriodStatement {
    const start = this.next
    const period = this.literalOf(this.take("period-text"))
    const events = this.parseEvents()
    this.periodRead = true
    return {
      type: "TimelinePeriodStatement",
      period,
      events,
      ...this.placeFrom(start),
    }
  }

  /**
   * Periods and events: `event-statement = event ( newline* event )*`.
   * Rejections outside the grammar: an event statement before the first
   * period is rejected, as its events have no period to belong to.
   */
  private parseEventStatement(): TimelineEventStatement {
    const start = this.next
    if (!this.eventStartsAt(start)) throw this.unexpected(this.peek())
    const events = this.parseEvents()
    const place = this.placeFrom(start)
    if (!this.periodRead) {
      throw new ParseError(
        "An event needs a period before it",
        place.range,
        place.loc,
      )
    }
    return { type: "TimelineEventStatement", events, ...place }
  }

  /**
   * Periods and events: `( newline* event )*`, with `event = ":"
   * event-text`: the events from the next unit on, each after the
   * `newline` units before it; the `newline` units after the last event
   * are left to the lines of the diagram.
   */
  private parseEvents(): TimelineLiteral[] {
    const events: TimelineLiteral[] = []
    for (
      let colon = this.afterUnitsNamed(this.next, ["newline"]);
      this.eventStartsAt(colon);
      colon = this.afterUnitsNamed(this.next, ["newline"])
    ) {
      this.moveTo(colon)
      this.addItem("Punctuator", [this.take(":")])
      events.push(this.literalOf(this.take("event-text")))
    }
    return events
  }

  /**
   * Periods and events: whether an event starts at the position
   * `position`: a `:` unit followed by an `event-text` unit, which rule 13
   * of the statement context reads together; the `:` of rule 15, which no
   * event text follows, starts none.
   */
  private eventStartsAt(position: number): boolean {
    return (
      this.nameAt(position) === ":" &&
      this.nameAt(this.positionAfter(position)) === "event-text"
    )
  }

  /** Titles and sections: `title-statement = "title" title-text`. */
  private parseTitleStatement(): TimelineTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("title")])
    return {
      type: "TimelineTitleStatement",
      value: this.literalOf(this.take("title-text")),
      ...this.placeFrom(start),
    }
  }

  /** Titles and sections: `section-statement = "section" section-text`. */
  private parseSectionStatement(): TimelineSectionStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("section")])
    return {
      type: "TimelineSectionStatement",
      name: this.literalOf(this.take("section-text")),
      ...this.placeFrom(start),
    }
  }

  /** Accessibility statements: `"accTitle" ":" acc-title-text`. */
  private parseAccTitleStatement(): TimelineAccTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accTitle")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "TimelineAccTitleStatement",
      value: this.literalOf(this.take("acc-title-text")),
      ...this.placeFrom(start),
    }
  }

  /** Accessibility statements: `"accDescr" ":" acc-description-text`. */
  private parseAccDescrStatement(): TimelineAccDescrStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "TimelineAccDescrStatement",
      value: this.literalOf(this.take("acc-description-text")),
      ...this.placeFrom(start),
    }
  }

  /**
   * Accessibility statements and Empty description blocks: `"accDescr" "{"
   * acc-description-block-text "}"`, and `empty-description-block =
   * "accDescr" "{" "}"`, a statement without text.
   */
  private parseAccDescrBlockStatement(): TimelineAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("acc-description-block-text")
    this.addItem("Punctuator", [this.take("}")])
    return {
      type: "TimelineAccDescrBlockStatement",
      value: text === null ? null : this.literalOf(text),
      ...this.placeFrom(start),
    }
  }

  /**
   * ast/timeline.md, TimelineLiteral: the text unit `unit`, one `RawText`
   * item, whose value is the written text of its token: the whole unit
   * where its token keeps the whitespace at its ends, and the unit without
   * that whitespace otherwise (`docs/tokens/timeline.md`, Tokens).
   */
  private literalOf(unit: Unit): TimelineLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "TimelineLiteral",
      value: this.textOf(place.range),
      ...place,
    }
  }
}
