import type {
  JourneyAccDescrBlockStatement,
  JourneyAccDescrStatement,
  JourneyAccTitleStatement,
  JourneyIgnoredText,
  JourneyLiteral,
  JourneySectionStatement,
  JourneyStatement,
  JourneyTaskStatement,
  JourneyTitleStatement,
} from "../../ast/journey.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { JourneyLexing, Unit, UnitName } from "./units.ts"

/** What the grammar makes of the units of a journey diagram. */
export interface JourneySyntax {
  /** The statements of the diagram, in source order. */
  readonly body: readonly JourneyStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/**
 * diagrams/journey.md, Grammar: the recursive-descent parser over the units
 * of the journey lexer. Each method reads one rule of the grammar, which its
 * comment names, and makes the node that the specification gives for the
 * rule, with the tokens of `docs/tokens/journey.md`, Tokens.
 */
export class JourneyGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: JourneyLexing, lexer: SourceLexer) {
    // Empty description blocks: a statement starts at every place where a
    // block can be read as one, so no block lies where the grammar cannot
    // take it, and the diagram has none of the empty forms of
    // known-divergences/tokenless-empty-forms.md.
    super(lexing.units, lexer, [], lexing.comments)
  }

  /**
   * Diagram and statements: `diagram = header line*`, with `line =
   * statement | newline`. Nothing separates two statements.
   */
  public parseDiagram(): JourneySyntax {
    this.addItem("Keyword", [this.take("header")])
    const body: JourneyStatement[] = []
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
   * diagrams/journey.md, Known divergences: none of them is found at a unit
   * that the grammar cannot read. The directives and the ignored `;` inside
   * a keyword are rejected where the tokens are recorded, and the others
   * read the text otherwise without a unit that this grammar rejects.
   */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** Diagram and statements: `statement`, which starts at `unit`, the next unit. */
  private parseStatement(unit: Unit): JourneyStatement {
    switch (unit.name) {
      case "task-text":
        return this.parseTaskStatement()
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

  /**
   * Tasks: `task-statement = task-text ":" score? ( ":" person? ( ","
   * person? )* ignored-data? )?`, whose first `:` starts data. The data
   * ends at a `#`, a `;`, or a line feed, so a `:` right after its first
   * colon or its score is its second colon.
   */
  private parseTaskStatement(): JourneyTaskStatement {
    const start = this.next
    const description = this.literalOf(this.take("task-text"))
    const colon = this.peek()
    if (colon?.name !== ":" || colon.startsData !== true) {
      throw this.unexpected(colon)
    }
    this.advance()
    this.addItem("Punctuator", [colon])
    const scoreUnit = this.takeIf("score")
    const score = scoreUnit === null ? null : this.literalOf(scoreUnit)
    const people: (JourneyLiteral | null)[] = []
    let textAfter: JourneyIgnoredText | null = null
    const secondColon = this.takeIf(":")
    if (secondColon !== null) {
      this.addItem("Punctuator", [secondColon])
      people.push(this.parsePerson())
      for (
        let comma = this.takeIf(",");
        comma !== null;
        comma = this.takeIf(",")
      ) {
        this.addItem("Punctuator", [comma])
        people.push(this.parsePerson())
      }
      const ignored = this.takeIf("ignored-data")
      if (ignored !== null) textAfter = this.ignoredTextOf(ignored)
    }
    return {
      type: "JourneyTaskStatement",
      description,
      score,
      people,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** Tasks: `person?`, the next `person` unit; null for an empty person, where there is none. */
  private parsePerson(): JourneyLiteral | null {
    const unit = this.takeIf("person")
    return unit === null ? null : this.literalOf(unit)
  }

  /** Titles and sections: `title-statement = "title" title-text`. */
  private parseTitleStatement(): JourneyTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("title")])
    return {
      type: "JourneyTitleStatement",
      value: this.literalOf(this.take("title-text")),
      ...this.placeFrom(start),
    }
  }

  /** Titles and sections: `section-statement = "section" section-text`. */
  private parseSectionStatement(): JourneySectionStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("section")])
    return {
      type: "JourneySectionStatement",
      name: this.literalOf(this.take("section-text")),
      ...this.placeFrom(start),
    }
  }

  /** Accessibility statements: `"accTitle" ":" acc-title-text`. */
  private parseAccTitleStatement(): JourneyAccTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accTitle")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "JourneyAccTitleStatement",
      value: this.literalOf(this.take("acc-title-text")),
      ...this.placeFrom(start),
    }
  }

  /** Accessibility statements: `"accDescr" ":" acc-description-text`. */
  private parseAccDescrStatement(): JourneyAccDescrStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "JourneyAccDescrStatement",
      value: this.literalOf(this.take("acc-description-text")),
      ...this.placeFrom(start),
    }
  }

  /**
   * Accessibility statements and Empty description blocks: `"accDescr" "{"
   * acc-description-block-text "}"`, and `empty-description-block =
   * "accDescr" "{" "}"`, a statement without text.
   */
  private parseAccDescrBlockStatement(): JourneyAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("acc-description-block-text")
    this.addItem("Punctuator", [this.take("}")])
    return {
      type: "JourneyAccDescrBlockStatement",
      value: text === null ? null : this.literalOf(text),
      ...this.placeFrom(start),
    }
  }

  /**
   * ast/journey.md, JourneyLiteral: the text unit `unit`, one `RawText`
   * item, whose value is the written text of its token: the whole unit
   * where its token keeps the whitespace at its ends, and the unit without
   * that whitespace otherwise (`docs/tokens/journey.md`, Tokens).
   */
  private literalOf(unit: Unit): JourneyLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "JourneyLiteral", value: this.textOf(place.range), ...place }
  }

  /**
   * ast/journey.md, JourneyIgnoredText: the `ignored-data` unit `unit`, one
   * `RawText` item, whose value is the written text of its range.
   */
  private ignoredTextOf(unit: Unit): JourneyIgnoredText {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "JourneyIgnoredText",
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }
}
