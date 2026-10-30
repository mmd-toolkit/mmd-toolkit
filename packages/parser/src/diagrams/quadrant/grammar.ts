import type { Identifier } from "../../ast.ts"
import type {
  QuadrantAccDescrBlockStatement,
  QuadrantAccDescrStatement,
  QuadrantAccTitleStatement,
  QuadrantAxisStatement,
  QuadrantClassDefStatement,
  QuadrantIdentifier,
  QuadrantLabel,
  QuadrantLiteral,
  QuadrantPointStatement,
  QuadrantQuadrantStatement,
  QuadrantStatement,
  QuadrantTitleStatement,
} from "../../ast/quadrant.ts"
import { isAsciiDigit, isAsciiLetter } from "../../character-classes.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { QuadrantLexing, Unit, UnitName } from "./units.ts"

/** What the grammar makes of the units of a quadrant chart. */
export interface QuadrantSyntax {
  /** The statements of the diagram, in source order. */
  readonly body: readonly QuadrantStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** Texts: the units of `text-rest`, which go on with a text. */
const TEXT_REST_UNITS: readonly UnitName[] = ["word", "-", "space"]

/** Quadrants: the number of each quadrant keyword. */
const QUADRANT_NUMBERS: Readonly<
  Partial<Record<UnitName, QuadrantQuadrantStatement["quadrant"]>>
> = {
  "quadrant-1": 1,
  "quadrant-2": 2,
  "quadrant-3": 3,
  "quadrant-4": 4,
}

/** Rejections outside the grammar: the message of the error for a style that mermaid.js does not take. */
const STYLE_MESSAGE =
  "A style must be radius, color, stroke-color, or stroke-width with a value of its form"

/** Whether `text` is one or more digits of ASCII. */
function isDigits(text: string): boolean {
  return (
    text.length > 0 &&
    [...text].every((character) => isAsciiDigit(character.charCodeAt(0)))
  )
}

/** Whether `character`, one character, is a hexadecimal digit. */
function isHexDigit(character: string): boolean {
  const lower = character.toLowerCase()
  return isAsciiDigit(lower.charCodeAt(0)) || (lower >= "a" && lower <= "f")
}

/** Rejections outside the grammar: whether `text` is a hex code of three or six digits, with or without `#`. */
function isHexColor(text: string): boolean {
  const digits = text.startsWith("#") ? text.slice(1) : text
  return (
    (digits.length === 3 || digits.length === 6) &&
    [...digits].every(isHexDigit)
  )
}

/**
 * diagrams/quadrant.md, Rejections outside the grammar: whether mermaid.js
 * takes the style whose written text is `style`: a name, a `:`, and a
 * value, with whitespace around the `:` or not, where a second `:` ends the
 * value. The names, in lower case only, are `radius`, whose value is
 * digits, `color` and `stroke-color`, whose value is a hex code, and
 * `stroke-width`, whose value is digits and `px`.
 */
function isTakenStyle(style: string): boolean {
  const colon = style.indexOf(":")
  if (colon === -1) return false
  const name = style.slice(0, colon).trim()
  const rest = style.slice(colon + 1)
  const nextColon = rest.indexOf(":")
  const value = (nextColon === -1 ? rest : rest.slice(0, nextColon)).trim()
  switch (name) {
    case "radius":
      return isDigits(value)
    case "color":
    case "stroke-color":
      return isHexColor(value)
    case "stroke-width":
      return value.endsWith("px") && isDigits(value.slice(0, -2))
    default:
      return false
  }
}

/** Points: whether `unit` is a `style-word`: a word of letters or of digits, `#`, `:`, or `-`. */
function isStyleWord(unit: Unit): boolean {
  if (unit.name === ":" || unit.name === "-") return true
  if (unit.name !== "word") return false
  const first = unit.text.charCodeAt(0)
  return unit.text === "#" || isAsciiLetter(first) || isAsciiDigit(first)
}

/**
 * Classes: whether `unit` is a unit of `class-def-name`: a word of letters,
 * digits, or characters outside ASCII, one of `&`, `#`, and `*`, or `-`,
 * `,`, or `:`.
 */
function isClassDefNameUnit(unit: Unit): boolean {
  if (unit.name === ":" || unit.name === "-") return true
  if (unit.name !== "word") return false
  if (["&", "#", "*", ","].includes(unit.text)) return true
  const first = unit.text.charCodeAt(0)
  return isAsciiLetter(first) || isAsciiDigit(first) || first > 0x7f
}

/**
 * diagrams/quadrant.md, Grammar: the recursive-descent parser over the
 * units of the quadrant lexer. Each method reads one rule of the grammar,
 * which its comment names, and makes the node that the specification gives
 * for the rule, with the tokens of `docs/tokens/quadrant.md`, Tokens.
 */
export class QuadrantGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: QuadrantLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, EMPTY_FORM_KINDS.quadrant, lexing.comments)
  }

  /**
   * Diagram and statements: `diagram = header line ( eol line )*`, with
   * `eol = newline | ";" | end-of-text`.
   */
  public parseDiagram(): QuadrantSyntax {
    this.addItem("Keyword", [this.take("header")])
    const body: QuadrantStatement[] = []
    this.parseLine(body)
    for (let unit = this.peek(); unit !== null; unit = this.peek()) {
      if (unit.name === "newline") {
        this.advance()
      } else if (unit.name === ";") {
        this.addItem("Punctuator", [this.take(";")])
      } else {
        throw this.unexpected(unit)
      }
      this.parseLine(body)
    }
    return { body, tokens: this.tokensInOrder() }
  }

  /**
   * known-divergences/tokenless-empty-forms.md: an empty string and an
   * empty markdown string, which no rule of the grammar takes, and an empty
   * description block inside a statement (Empty description blocks, Empty
   * strings).
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    return this.emptyFormErrorAt(unit)
  }

  /**
   * Diagram and statements: `line = blanks ( statement blanks |
   * description-block-statement empty-description-block* )?`, whose
   * statements go to `body`: a description block with text is followed by
   * nothing but empty description blocks, with no whitespace.
   */
  private parseLine(body: QuadrantStatement[]): void {
    this.parseBlanks(body)
    const unit = this.peek()
    if (unit === null || unit.name === "newline" || unit.name === ";") return
    if (
      unit.name === "accDescr" &&
      this.nameAt(this.positionAfter(this.next)) === "{"
    ) {
      body.push(this.parseAccDescrBlockStatement())
      while (this.emptyBlockStartsAt(this.next)) {
        body.push(this.parseAccDescrBlockStatement())
      }
      return
    }
    body.push(this.parseStatement(unit))
    this.parseBlanks(body)
  }

  /**
   * Diagram and statements: `blanks = ( space | empty-description-block
   * )*`, whose empty description blocks are statements of `body`.
   */
  private parseBlanks(body: QuadrantStatement[]): void {
    for (let unit = this.peek(); unit !== null; unit = this.peek()) {
      if (unit.name === "space") {
        this.advance()
      } else if (this.emptyBlockStartsAt(this.next)) {
        body.push(this.parseAccDescrBlockStatement())
      } else {
        return
      }
    }
  }

  /** Empty description blocks: whether an empty description block starts at the position `position`. */
  private emptyBlockStartsAt(position: number): boolean {
    const unit = this.unitAt(position)
    const form = unit === null ? null : this.emptyFormOf(unit)
    return form?.kind === "empty-description-block" && form.units[0] === unit
  }

  /** Diagram and statements: `statement`, which starts at `unit`, the next unit. */
  private parseStatement(unit: Unit): QuadrantStatement {
    switch (unit.name) {
      case "title":
        return this.parseTitleStatement()
      case "accTitle":
        return this.parseAccTitleStatement()
      case "accDescr":
        return this.parseAccDescrStatement()
      case "x-axis":
      case "y-axis":
        return this.parseAxisStatement(unit.name)
      case "quadrant-1":
      case "quadrant-2":
      case "quadrant-3":
      case "quadrant-4":
        return this.parseQuadrantStatement(unit.name)
      case "classDef":
        return this.parseClassDefStatement()
      case "word":
      case "string":
      case "markdown-string":
        return this.parsePointStatement()
      default:
        throw this.unexpected(unit)
    }
  }

  /** Titles and accessibility statements: `title-statement = "title" title-text`, whose text may be empty. */
  private parseTitleStatement(): QuadrantTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("title")])
    const text = this.takeIf("title-text")
    return {
      type: "QuadrantTitleStatement",
      value:
        text === null || text.significantRange === null
          ? null
          : this.literalOf([text]),
      ...this.placeFrom(start),
    }
  }

  /** Titles and accessibility statements: `acc-title-statement = "accTitle" ":" acc-title-text`. */
  private parseAccTitleStatement(): QuadrantAccTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accTitle")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "QuadrantAccTitleStatement",
      value: this.literalOf([this.take("acc-title-text")]),
      ...this.placeFrom(start),
    }
  }

  /** Titles and accessibility statements: `acc-description-statement = "accDescr" ":" acc-description-text`. */
  private parseAccDescrStatement(): QuadrantAccDescrStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "QuadrantAccDescrStatement",
      value: this.literalOf([this.take("acc-description-text")]),
      ...this.placeFrom(start),
    }
  }

  /**
   * Titles and accessibility statements: `description-block-statement =
   * "accDescr" "{" description-block-text "}"` and
   * `empty-description-block = "accDescr" "{" "}"`.
   */
  private parseAccDescrBlockStatement(): QuadrantAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("description-block-text")
    this.addItem("Punctuator", [this.take("}")])
    return {
      type: "QuadrantAccDescrBlockStatement",
      value: text === null ? null : this.literalOf([text]),
      ...this.placeFrom(start),
    }
  }

  /**
   * Axes: `axis-statement = ( "x-axis" | "y-axis" ) text ( arrow text? )?`.
   * Empty forms between the first text and the arrow, and between the
   * arrow and the second text, lie inside the statement.
   */
  private parseAxisStatement(
    keyword: "x-axis" | "y-axis",
  ): QuadrantAxisStatement {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const startText = this.parseText()
    this.rejectEmptyFormsBefore((unit) => unit.name === "arrow")
    const arrowUnit = this.takeIf("arrow")
    let end: QuadrantLabel | null = null
    if (arrowUnit !== null) {
      this.addItem("Punctuator", [arrowUnit])
      if (this.textStartsAt(this.next)) {
        end = this.parseText()
      } else {
        this.rejectEmptyFormsBefore((unit) => this.textStartsAt(unit.index))
      }
    }
    return {
      type: "QuadrantAxisStatement",
      axis: keyword === "x-axis" ? "x" : "y",
      start: startText,
      arrow: arrowUnit !== null,
      end,
      ...this.placeFrom(start),
    }
  }

  /** Quadrants: `quadrant-statement = ( "quadrant-1" | ... | "quadrant-4" ) text`. */
  private parseQuadrantStatement(
    keyword: "quadrant-1" | "quadrant-2" | "quadrant-3" | "quadrant-4",
  ): QuadrantQuadrantStatement {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const quadrant = QUADRANT_NUMBERS[keyword]
    if (quadrant === undefined) {
      throw new Error(`mmd-toolkit parser bug: ${keyword} has no number`)
    }
    return {
      type: "QuadrantQuadrantStatement",
      quadrant,
      text: this.parseText(),
      ...this.placeFrom(start),
    }
  }

  /**
   * Points: `point-statement = text ( ":::" class-name )? ":" "["
   * coordinate "," coordinate "]" styles?`. Empty forms between the `]`
   * and the styles lie inside the statement.
   */
  private parsePointStatement(): QuadrantPointStatement {
    const start = this.next
    const name = this.parseText()
    let className: Identifier | null = null
    const marker = this.takeIf(":::")
    if (marker !== null) {
      this.addItem("Punctuator", [marker])
      className = this.identifierOf([this.take("class-name")])
    }
    this.addItem("Punctuator", [this.take(":")])
    this.addItem("Punctuator", [this.take("[")])
    const x = this.literalOf([this.take("coordinate")])
    this.addItem("Punctuator", [this.take(",")])
    const y = this.literalOf([this.take("coordinate")])
    this.addItem("Punctuator", [this.take("]")])
    let styles: QuadrantLiteral[] = []
    const next = this.peek()
    if (next !== null && (next.name === "space" || isStyleWord(next))) {
      styles = this.parseStyles()
    } else {
      this.rejectEmptyFormsBefore(isStyleWord)
    }
    return {
      type: "QuadrantPointStatement",
      name,
      className,
      x,
      y,
      styles,
      ...this.placeFrom(start),
    }
  }

  /**
   * Classes: `class-def-statement = "classDef" space class-def-name space
   * styles`, with `class-def-name = ( word-of-name | "-" | "," | ":" )+`,
   * a QuadrantIdentifier, one `Identifier` item.
   */
  private parseClassDefStatement(): QuadrantClassDefStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("classDef")])
    this.take("space")
    const nameUnits: Unit[] = []
    for (
      let unit = this.peek();
      unit !== null && isClassDefNameUnit(unit);
      unit = this.peek()
    ) {
      nameUnits.push(unit)
      this.advance()
    }
    if (nameUnits.length === 0) throw this.unexpected(this.peek())
    this.addItem("Identifier", nameUnits)
    const namePlace = this.placeOf(nameUnits)
    const name: QuadrantIdentifier = {
      type: "QuadrantIdentifier",
      name: this.textOf(namePlace.range),
      ...namePlace,
    }
    this.take("space")
    const styles = this.parseStyles()
    return {
      type: "QuadrantClassDefStatement",
      name,
      styles,
      ...this.placeFrom(start),
    }
  }

  /**
   * Points: `styles = style ( "," style )*`, with `style = ( style-word |
   * space )+`, each a QuadrantLiteral of `RawText` items. Empty forms
   * between the styles lie inside the statement. Rejections outside the
   * grammar: once the styles are read, a style that mermaid.js does not
   * take makes the input rejected, at the first such style.
   */
  private parseStyles(): QuadrantLiteral[] {
    const styles = [this.parseStyle()]
    for (
      let unit = this.peek();
      unit !== null && unit.name === "word" && unit.text === ",";
      unit = this.peek()
    ) {
      this.addItem("Punctuator", [unit])
      this.advance()
      styles.push(this.parseStyle())
    }
    this.rejectEmptyFormsBefore(
      (unit) =>
        isStyleWord(unit) || (unit.name === "word" && unit.text === ","),
    )
    const rejected = styles.find((style) => !isTakenStyle(style.value))
    if (rejected !== undefined) {
      throw new ParseError(STYLE_MESSAGE, rejected.range, rejected.loc)
    }
    return styles
  }

  /** Points: `style = ( style-word | space )+`. */
  private parseStyle(): QuadrantLiteral {
    const units: Unit[] = []
    for (
      let unit = this.peek();
      unit !== null && (unit.name === "space" || isStyleWord(unit));
      unit = this.peek()
    ) {
      units.push(unit)
      this.advance()
    }
    if (units.length === 0) throw this.unexpected(this.peek())
    return this.literalOf(units)
  }

  /**
   * Texts: `text = bare-text | ( string | markdown-string ) text-rest?`,
   * with `bare-text = word text-rest?` and `text-rest = ( word | "-" |
   * space )+`. An empty string and an empty markdown string are no text.
   * Empty forms between the words of a text lie inside it.
   */
  private parseText(): QuadrantLabel {
    const first = this.peek()
    if (first === null || !this.textStartsAt(first.index)) {
      throw this.unexpected(first)
    }
    if (this.emptyFormOf(first) !== null) throw this.unexpected(first)
    this.advance()
    const rest = this.takeWhile(TEXT_REST_UNITS)
    this.rejectEmptyFormsBefore(
      (unit) => unit.name === "word" || unit.name === "-",
    )
    if (first.name === "word") {
      this.addItem("RawText", [first, ...rest])
      const place = this.placeOf([first, ...rest])
      return {
        type: "QuadrantLabel",
        kind: "text",
        value: this.textOf(place.range),
        ...place,
      }
    }
    this.addItem("String", [first])
    this.addItem("RawText", rest)
    const place = this.placeOf([first, ...rest])
    const delimiter = first.name === "markdown-string" ? 2 : 1
    const content = this.textOf([
      first.start + delimiter,
      first.end - delimiter,
    ])
    const after =
      place.range[1] > first.end ? this.textOf([first.end, place.range[1]]) : ""
    return {
      type: "QuadrantLabel",
      kind: first.name === "markdown-string" ? "markdown" : "string",
      value: content + after,
      ...place,
    }
  }

  /** Texts: whether a text starts at the position `position`: a `word`, a `string`, or a `markdown-string` unit. */
  private textStartsAt(position: number): boolean {
    const name = this.nameAt(position)
    return name === "word" || name === "string" || name === "markdown-string"
  }

  /**
   * ast/quadrant.md, QuadrantLiteral: the units `units`, one `RawText`
   * item, whose value is their written text without the whitespace at its
   * ends.
   */
  private literalOf(units: readonly Unit[]): QuadrantLiteral {
    this.addItem("RawText", units)
    const place = this.placeOf(units)
    const value = units.some((unit) => unit.significantRange !== null)
      ? this.textOf(place.range)
      : ""
    return { type: "QuadrantLiteral", value, ...place }
  }

  /**
   * Empty description blocks and Empty strings: where a part may end its
   * statement, the spaces and empty forms that come next lie inside the
   * statement when the unit after them is one that `goesOn` takes; the
   * input is then rejected at the first empty form. Otherwise the statement
   * ends before them, where an empty description block is a statement.
   */
  private rejectEmptyFormsBefore(goesOn: (unit: Unit) => boolean): void {
    let firstForm: Unit | null = null
    let position = this.next
    for (
      let unit = this.unitAt(position);
      unit !== null;
      unit = this.unitAt(position)
    ) {
      const form = this.emptyFormOf(unit)
      if (form !== null && form.units[0] === unit) {
        firstForm ??= unit
        position = this.positionAfter(form.units[form.units.length - 1].index)
      } else if (unit.name === "space") {
        position = this.positionAfter(position)
      } else {
        break
      }
    }
    const after = this.unitAt(position)
    if (firstForm !== null && after !== null && goesOn(after)) {
      throw this.unexpected(firstForm)
    }
  }
}
