import type {
  PieBodyItem,
  PieDiagram,
  PieIgnoredText,
  PieLiteral,
  PieSectionStatement,
} from "../../ast/pie.ts"
import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { PieLexing, Unit, UnitName } from "./units.ts"

/** Authored fields and token items, before shared recording. */
export interface PieSyntax {
  readonly showData: boolean
  readonly textBeforeHeader: PieDiagram["textBeforeHeader"]
  readonly textBeforeShowData: PieDiagram["textBeforeShowData"]
  readonly body: PieDiagram["body"]
  readonly tokens: readonly PendingToken[]
}

/** diagrams/pie.md, Grammar: recursive descent over visible and retained hidden units. */
export class PieGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: PieLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram: newlines, header, optional next-visible showData and body items. */
  public parseDiagram(): PieSyntax {
    const textBeforeHeader: PieIgnoredText[] = []
    while (this.peek()?.name === "newline" || this.isHidden(this.peek())) {
      if (this.takeIf("newline") === null)
        textBeforeHeader.push(this.parseHidden())
    }
    this.addItem("Keyword", [this.take("pie")])
    const afterHeader = this.parseHiddenForms()
    const flag = this.takeIf("showData")
    if (flag !== null) this.addItem("Keyword", [flag])
    const body: PieBodyItem[] = flag === null ? afterHeader : []
    while (this.peek() !== null) {
      if (this.takeIf("newline") !== null) continue
      body.push(
        this.isHidden(this.peek()) ? this.parseHidden() : this.parseStatement(),
      )
    }
    return {
      showData: flag !== null,
      textBeforeHeader,
      textBeforeShowData: flag === null ? [] : afterHeader,
      body,
      tokens: this.tokensInOrder(),
    }
  }

  /** Empty strings and blocks are real syntax; atomic-boundary checks are shared. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** section-statement and the four common-statement productions. */
  private parseStatement(): Exclude<PieBodyItem, PieIgnoredText> {
    if (this.peek()?.name === "string") return this.parseSection()
    const start = this.next
    const keyword = this.peek()
    if (
      keyword?.name !== "title" &&
      keyword?.name !== "accTitle" &&
      keyword?.name !== "accDescr"
    )
      throw this.unexpected(keyword)
    this.advance()
    this.addItem("Keyword", [keyword])
    const block = keyword.name === "accDescr" && this.peek()?.name === "{"
    if (keyword.name !== "title")
      this.addItem("Punctuator", [this.take(block ? "{" : ":")])
    const text = this.takeIf(block ? "block-text" : "line-text")
    const value = text?.significantRange == null ? null : this.literalOf(text)
    if (block) this.addItem("Punctuator", [this.take("}")])
    const textAfter = this.parseHiddenForms()
    const place = this.placeFrom(start)
    this.parseEol()
    return {
      type: block
        ? "PieAccDescrBlockStatement"
        : keyword.name === "title"
          ? "PieTitleStatement"
          : keyword.name === "accTitle"
            ? "PieAccTitleStatement"
            : "PieAccDescrStatement",
      value,
      textAfter,
      ...place,
    }
  }

  /** section-statement: hidden forms belong only to their named component gaps. */
  private parseSection(): PieSectionStatement {
    const start = this.next
    const label = this.closedStringLiteralOf(this.take("string"))
    const textBeforeColon = this.parseHiddenForms()
    this.addItem("Punctuator", [this.take(":")])
    const textBeforeValue = this.parseHiddenForms()
    const value = this.numericLiteralOf(this.take("pie-number"))
    const textAfter = this.parseHiddenForms()
    const place = this.placeFrom(start)
    this.parseEol()
    // Rejection outside the grammar: double conversion, including underflow
    // to negative zero, decides the comparison even for duplicate labels.
    if (value.value < 0)
      throw new ParseError(
        "A pie section value cannot be negative",
        value.range,
        value.loc,
      )
    return {
      type: "PieSectionStatement",
      label,
      textBeforeColon,
      textBeforeValue,
      value,
      textAfter,
      ...place,
    }
  }

  /** eol = newline+ | end-of-text; hidden forms supply no visible separator. */
  private parseEol(): void {
    if (this.peek() === null) return
    this.take("newline")
    this.takeAll("newline")
  }

  /** PieLiteral: one complete line value or trimmed block interior, with no empty literal. */
  private literalOf(unit: Unit): PieLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "PieLiteral", value: this.textOf(place.range), ...place }
  }

  /** Hidden YAML and DIRECTIVE are retained, unlike ordinary trivia and comments. */
  private isHidden(unit: Unit | null): boolean {
    return unit?.name === "yaml-block" || unit?.name === "directive"
  }

  /** All consecutive hidden forms in one authored gap, without joining occurrences. */
  private parseHiddenForms(): PieIgnoredText[] {
    const forms: PieIgnoredText[] = []
    while (this.isHidden(this.peek())) forms.push(this.parseHidden())
    return forms
  }

  /** PieIgnoredText: one RawText item, without its consumed following LF. */
  private parseHidden(): PieIgnoredText {
    const unit = this.peek()
    if (unit?.name !== "yaml-block" && unit?.name !== "directive")
      throw this.unexpected(unit)
    this.advance()
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "PieIgnoredText",
      kind: unit.name,
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }
}
