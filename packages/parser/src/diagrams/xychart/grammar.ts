import type { NumericLiteral, StringLiteral } from "../../ast.ts"
import type {
  XychartAccDescrBlockStatement,
  XychartAccDescrStatement,
  XychartAccTitleStatement,
  XychartBand,
  XychartHeader,
  XychartLiteral,
  XychartPlotStatement,
  XychartRange,
  XychartStatement,
  XychartTitleStatement,
  XychartValue,
  XychartXAxisStatement,
  XychartYAxisStatement,
} from "../../ast/xychart.ts"
import type { DiagramTokenKind } from "../../ast.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName, XychartLexing } from "./units.ts"

/** What the grammar makes of the units of an XY chart. */
export interface XychartSyntax {
  /** The headers of the diagram, in source order; at least one. */
  readonly headers: readonly XychartHeader[]
  /** The statements of the diagram, in source order. */
  readonly body: readonly XychartStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** Axes: the units that start the data of the x axis, its categories or its range. */
const X_AXIS_DATA_STARTS: readonly UnitName[] = ["[", "number"]

/** Axes: the units that start the data of the y axis, its range. */
const Y_AXIS_DATA_STARTS: readonly UnitName[] = ["number"]

/** Plots: the units that may follow an empty string that is a whole label. */
const LABEL_FOLLOWERS: readonly UnitName[] = [",", "]"]

/**
 * diagrams/xychart.md, Grammar: the recursive-descent parser over the units
 * of the xychart lexer. Each method reads one rule of the grammar, which its
 * comment names, and makes the node that the specification gives for the
 * rule, with the tokens of `docs/tokens/xychart.md`, Tokens.
 */
export class XychartGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: XychartLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, EMPTY_FORM_KINDS.xychart, lexing.comments)
  }

  /**
   * Diagram and statements: `diagram = newline* header-part ( eol |
   * header-part )* ( statement | eol )*`, with `eol = newline | ";"`. A
   * statement needs nothing before the next one.
   */
  public parseDiagram(): XychartSyntax {
    this.takeAll("newline")
    const headers = [this.parseHeaderPart()]
    for (let unit = this.peek(); unit !== null; unit = this.peek()) {
      if (unit.name === "header") {
        headers.push(this.parseHeaderPart())
      } else if (!this.takeEol(unit)) {
        break
      }
    }
    const body: XychartStatement[] = []
    for (let unit = this.peek(); unit !== null; unit = this.peek()) {
      if (!this.takeEol(unit)) body.push(this.parseStatement(unit))
    }
    return { headers, body, tokens: this.tokensInOrder() }
  }

  /**
   * `docs/tokens.md`, Tokens: a run of the units of one item breaks where
   * characters lie between them, as whitespace belongs to no unit here
   * (Units and contexts), so the words of a text with whitespace between
   * them are a token each.
   */
  protected override breaksRun(
    kind: DiagramTokenKind,
    previous: Unit,
    unit: Unit,
  ): boolean {
    return super.breaksRun(kind, previous, unit) || previous.end !== unit.start
  }

  /**
   * known-divergences/tokenless-empty-forms.md: an empty string and an
   * empty description block where the grammar cannot take them (Empty
   * description blocks, Empty strings).
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    return this.emptyFormErrorAt(unit)
  }

  /** Diagram and statements: `eol = newline | ";"`, when `unit`, the next unit, is one; whether it is. */
  private takeEol(unit: Unit): boolean {
    if (unit.name === "newline") {
      this.advance()
      return true
    }
    if (unit.name === ";") {
      this.addItem("Punctuator", [this.take(";")])
      return true
    }
    return false
  }

  /**
   * Diagram and statements: `header-part = header orientation?`. Empty
   * forms between the header and an orientation lie inside the part.
   */
  private parseHeaderPart(): XychartHeader {
    const start = this.next
    this.addItem("Keyword", [this.take("header")])
    const orientationUnit = this.takeIf("orientation")
    let orientation: string | null = null
    if (orientationUnit === null) {
      this.rejectEmptyFormsBefore(["orientation"])
    } else {
      this.addItem("Keyword", [orientationUnit])
      orientation = this.textOfUnit(orientationUnit)
    }
    return { type: "XychartHeader", orientation, ...this.placeFrom(start) }
  }

  /** Diagram and statements: `statement`, which starts at `unit`, the next unit. */
  private parseStatement(unit: Unit): XychartStatement {
    switch (unit.name) {
      case "title":
        return this.parseTitleStatement()
      case "x-axis":
        return this.parseXAxisStatement()
      case "y-axis":
        return this.parseYAxisStatement()
      case "line":
      case "bar":
        return this.parsePlotStatement(unit.name)
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

  /** Titles: `title-statement = "title" ( words | string )`; the title is never empty. */
  private parseTitleStatement(): XychartTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("title")])
    const value =
      this.peek()?.name === "string" ? this.parseString([]) : this.parseWords()
    return { type: "XychartTitleStatement", value, ...this.placeFrom(start) }
  }

  /** Axes: `x-axis-statement = "x-axis" ( axis-title | axis-title? ( band | range ) )`. */
  private parseXAxisStatement(): XychartXAxisStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("x-axis")])
    const title = this.parseAxisTitle(X_AXIS_DATA_STARTS)
    let data: XychartBand | XychartRange | null = null
    if (this.peek()?.name === "[") {
      data = this.parseBand()
    } else if (this.peek()?.name === "number") {
      data = this.parseRange()
    }
    if (title === null && data === null) throw this.unexpected(this.peek())
    return {
      type: "XychartXAxisStatement",
      title,
      data,
      ...this.placeFrom(start),
    }
  }

  /** Axes: `y-axis-statement = "y-axis" ( axis-title | axis-title? range )`. */
  private parseYAxisStatement(): XychartYAxisStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("y-axis")])
    const title = this.parseAxisTitle(Y_AXIS_DATA_STARTS)
    const data = this.peek()?.name === "number" ? this.parseRange() : null
    if (title === null && data === null) throw this.unexpected(this.peek())
    return {
      type: "XychartYAxisStatement",
      title,
      data,
      ...this.placeFrom(start),
    }
  }

  /**
   * Axes: `axis-title = words | string`, when the next unit starts one;
   * null otherwise. A title in quotes may be empty only when the data,
   * which a unit of `dataStarts` starts, follows it, and empty forms
   * between a title and its data, or between its words, lie inside the
   * statement.
   */
  private parseAxisTitle(
    dataStarts: readonly UnitName[],
  ): XychartLiteral | StringLiteral | null {
    const name = this.peek()?.name
    if (name !== "word" && name !== "string") return null
    const title =
      name === "string" ? this.parseString(dataStarts) : this.parseWords()
    this.rejectEmptyFormsBefore(dataStarts)
    return title
  }

  /** Axes: `band = "[" category ( "," category )* "]"`, with `category = words | string`, never empty. */
  private parseBand(): XychartBand {
    const start = this.next
    this.addItem("Punctuator", [this.take("[")])
    const categories = [this.parseCategory()]
    for (
      let comma = this.takeIf(",");
      comma !== null;
      comma = this.takeIf(",")
    ) {
      this.addItem("Punctuator", [comma])
      categories.push(this.parseCategory())
    }
    this.addItem("Punctuator", [this.take("]")])
    return { type: "XychartBand", categories, ...this.placeFrom(start) }
  }

  /** Axes: `category = words | string`; a category is never empty. */
  private parseCategory(): XychartLiteral | StringLiteral {
    return this.peek()?.name === "string"
      ? this.parseString([])
      : this.parseWords()
  }

  /** Axes: `range = number "-->" number`. */
  private parseRange(): XychartRange {
    const startPosition = this.next
    const start = this.parseNumber()
    this.addItem("Punctuator", [this.take("-->")])
    const end = this.parseNumber()
    return {
      type: "XychartRange",
      start,
      end,
      ...this.placeFrom(startPosition),
    }
  }

  /**
   * Plots: `plot-statement = ( "line" | "bar" ) plot-title? "[" value ( ","
   * value )* "]"`, with `plot-title = words | string`, which may be an
   * empty string right before the `[`.
   */
  private parsePlotStatement(kind: "line" | "bar"): XychartPlotStatement {
    const start = this.next
    this.addItem("Keyword", [this.take(kind)])
    let title: XychartLiteral | StringLiteral | null = null
    const name = this.peek()?.name
    if (name === "string") {
      title = this.parseString(["["])
    } else if (name === "word") {
      title = this.parseWords()
    }
    this.addItem("Punctuator", [this.take("[")])
    const values = [this.parseValue()]
    for (
      let comma = this.takeIf(",");
      comma !== null;
      comma = this.takeIf(",")
    ) {
      this.addItem("Punctuator", [comma])
      values.push(this.parseValue())
    }
    this.addItem("Punctuator", [this.take("]")])
    return {
      type: "XychartPlotStatement",
      kind,
      title,
      values,
      ...this.placeFrom(start),
    }
  }

  /** Plots: `value = number string?`; the label may be an empty string that ends the value. */
  private parseValue(): XychartValue {
    const start = this.next
    const value = this.parseNumber()
    const label =
      this.peek()?.name === "string" ? this.parseString(LABEL_FOLLOWERS) : null
    return { type: "XychartValue", value, label, ...this.placeFrom(start) }
  }

  /** Accessibility statements: `acc-title-statement = "accTitle" ":" acc-title-text`; no text at the end of the text. */
  private parseAccTitleStatement(): XychartAccTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accTitle")])
    this.addItem("Punctuator", [this.take(":")])
    const text = this.takeIf("acc-title-text")
    return {
      type: "XychartAccTitleStatement",
      value: text === null ? null : this.accessibilityLiteralOf(text),
      ...this.placeFrom(start),
    }
  }

  /** Accessibility statements: `acc-description-statement = "accDescr" ":" acc-description-text`; no text at the end of the text. */
  private parseAccDescrStatement(): XychartAccDescrStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take(":")])
    const text = this.takeIf("acc-description-text")
    return {
      type: "XychartAccDescrStatement",
      value: text === null ? null : this.accessibilityLiteralOf(text),
      ...this.placeFrom(start),
    }
  }

  /**
   * Accessibility statements and Empty description blocks:
   * `description-block-statement = "accDescr" "{" description-block-text (
   * "}" | end-of-text )`, whose text is left out where it is whitespace
   * only, an empty description block.
   */
  private parseAccDescrBlockStatement(): XychartAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("description-block-text")
    const closing = this.takeIf("}")
    if (closing !== null) this.addItem("Punctuator", [closing])
    return {
      type: "XychartAccDescrBlockStatement",
      value: text === null ? null : this.accessibilityLiteralOf(text),
      closed: closing !== null,
      ...this.placeFrom(start),
    }
  }

  /**
   * Diagram and statements: `words = word+`, an XychartLiteral of `RawText`
   * items, whose value is the written texts of its units joined, without
   * the whitespace between them. Empty forms between two words lie inside
   * the text.
   */
  private parseWords(): XychartLiteral {
    const units = this.takeWhile(["word"])
    if (units.length === 0) throw this.unexpected(this.peek())
    this.rejectEmptyFormsBefore(["word"])
    this.addItem("RawText", units)
    return {
      type: "XychartLiteral",
      value: units.map((unit) => this.textOfUnit(unit)).join(""),
      ...this.placeOf(units),
    }
  }

  /**
   * ast/xychart.md, XychartLiteral: the accessibility text `unit`, one
   * `RawText` item, whose value is its written text without the whitespace
   * at its ends.
   */
  private accessibilityLiteralOf(unit: Unit): XychartLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "XychartLiteral", value: this.textOf(place.range), ...place }
  }

  /**
   * Empty strings and ast.md, Shared leaf nodes > StringLiteral: the next
   * unit, a `string`, one `String` item, whose value is its written text
   * between its quotes. An empty string is a whole text only where a unit
   * of `followers` comes right after it; elsewhere the input is rejected at
   * it. Every string is closed: the lexer rejects one that the text ends
   * in.
   */
  private parseString(followers: readonly UnitName[]): StringLiteral {
    const unit = this.take("string")
    if (this.emptyFormOf(unit) !== null) {
      const after = this.nameAt(this.next)
      if (after === null || !followers.includes(after)) {
        throw this.unexpected(unit)
      }
    }
    this.addItem("String", [unit])
    const place = this.placeOf([unit])
    const [start, end] = place.range
    return {
      type: "StringLiteral",
      value: this.textOf([start + 1, end - 1]),
      raw: this.lexer.text.slice(start, end),
      closed: true,
      ...place,
    }
  }

  /** Axes and plots: the next unit, a `number`, as a NumericLiteral. */
  private parseNumber(): NumericLiteral {
    return this.numericLiteralOf(this.take("number"))
  }

  /**
   * Empty description blocks and empty strings: where a part may end its
   * statement, the empty forms that come next lie inside the statement
   * when the unit after them, one of `goesOn`, takes it on; the input is
   * then rejected at the first of them. Otherwise the statement ends
   * before them, where an empty description block is a statement and an
   * empty string is rejected.
   */
  private rejectEmptyFormsBefore(goesOn: readonly UnitName[]): void {
    const after = this.afterEmptyForms(this.next, EMPTY_FORM_KINDS.xychart)
    const name = this.nameAt(after)
    if (after !== this.next && name !== null && goesOn.includes(name)) {
      throw this.unexpected(this.peek())
    }
  }
}
