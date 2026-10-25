import type {
  PieAccDescrBlockStatement,
  PieAccDescrStatement,
  PieAccTitleStatement,
  PieBodyItem,
  PieIgnoredText,
  PieLiteral,
  PieSectionStatement,
  PieTitleStatement,
} from "../../ast/pie.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** Written diagram fields and pending tokens, before common token-boundary checks. */
export interface PieSyntax {
  readonly showData: boolean
  readonly textBeforeHeader: readonly PieIgnoredText[]
  readonly textBeforeShowData: readonly PieIgnoredText[]
  readonly body: readonly PieBodyItem[]
  readonly tokens: readonly PendingToken[]
}

/** diagrams/pie.md, Grammar: recursive descent over all components and retained hidden forms. */
export class PieGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram = newline* pie showData? body-item* EOF; hidden forms supply no visible separator. */
  public parseDiagram(): PieSyntax {
    const textBeforeHeader: PieIgnoredText[] = []
    while (this.peek()?.name === "newline" || this.isHidden(this.peek())) {
      if (this.takeIf("newline") === null)
        textBeforeHeader.push(this.parseIgnoredText())
    }
    this.addItem("Keyword", [this.take("pie")])
    const between = this.parseHiddenForms()
    const flag = this.takeIf("showData")
    if (flag !== null) this.addItem("Keyword", [flag])
    const body: PieBodyItem[] = flag === null ? [...between] : []
    while (this.peek() !== null) {
      if (this.takeIf("newline") !== null) continue
      body.push(
        this.isHidden(this.peek())
          ? this.parseIgnoredText()
          : this.parseStatement(),
      )
    }
    return {
      showData: flag !== null,
      textBeforeHeader,
      textBeforeShowData: flag === null ? [] : between,
      body,
      tokens: this.tokensInOrder(),
    }
  }

  /** Empty labels and blocks are real pie syntax; atomic cuts are checked by shared token recording. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** body-item's statement alternatives are decided by their first component. */
  private parseStatement():
    | PieSectionStatement
    | PieTitleStatement
    | PieAccTitleStatement
    | PieAccDescrStatement
    | PieAccDescrBlockStatement {
    const unit = this.peek()
    if (unit?.name === "string") return this.parseSectionStatement()
    if (unit?.name === "title") return this.parseCommonStatement("title")
    if (unit?.name === "accTitle") return this.parseCommonStatement("accTitle")
    if (unit?.name === "accDescr") return this.parseCommonStatement("accDescr")
    throw this.unexpected(unit)
  }

  /** section-statement = string : pie-number eol, retaining each hidden form in its own gap. */
  private parseSectionStatement(): PieSectionStatement {
    const start = this.next
    const label = this.closedStringLiteralOf(this.take("string"))
    const textBeforeColon = this.parseHiddenForms()
    this.addItem("Punctuator", [this.take(":")])
    const textBeforeValue = this.parseHiddenForms()
    const value = this.numericLiteralOf(this.take("pie-number"))
    const textAfter = this.parseHiddenForms()
    const place = this.placeFrom(start)
    this.parseEol()
    // Rejection outside the grammar: IEEE double negativity, including every
    // duplicate occurrence. Negative zero and negative underflow remain valid.
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

  /** Common-statement productions: composite line forms or a closed description block, then EOL. */
  private parseCommonStatement(
    keyword: "title" | "accTitle" | "accDescr",
  ):
    | PieTitleStatement
    | PieAccTitleStatement
    | PieAccDescrStatement
    | PieAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const block = keyword === "accDescr" && this.peek()?.name === "{"
    if (keyword !== "title")
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
        : keyword === "title"
          ? "PieTitleStatement"
          : keyword === "accTitle"
            ? "PieAccTitleStatement"
            : "PieAccDescrStatement",
      value,
      textAfter,
      ...place,
    }
  }

  /** eol = newline+ | EOF; consuming a hidden form's only LF cannot separate later statements. */
  private parseEol(): void {
    if (this.peek() !== null) this.take("newline")
    this.takeAll("newline")
  }

  /** ast/pie.md, PieLiteral: line units keep padding; block units trim common whitespace. */
  private literalOf(unit: Unit): PieLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "PieLiteral", value: this.textOf(place.range), ...place }
  }

  /** Hidden forms may occupy only the gaps and body positions named by ast/pie.md. */
  private isHidden(unit: Unit | null): boolean {
    return unit?.name === "yaml-block" || unit?.name === "directive"
  }

  /** Each separately recognized form is one leaf in source order. */
  private parseHiddenForms(): PieIgnoredText[] {
    const forms: PieIgnoredText[] = []
    while (this.isHidden(this.peek())) forms.push(this.parseIgnoredText())
    return forms
  }

  /** ast/pie.md, PieIgnoredText: RawText from opener to closer, excluding its consumed LF. */
  private parseIgnoredText(): PieIgnoredText {
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
