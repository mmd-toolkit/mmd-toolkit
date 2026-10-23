import type {
  InfoAccDescrBlockStatement,
  InfoAccDescrStatement,
  InfoAccTitleStatement,
  InfoBodyItem,
  InfoIgnoredText,
  InfoLiteral,
  InfoTitleStatement,
} from "../../ast/info.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { InfoLexing, Unit, UnitName } from "./units.ts"

/** Written diagram fields and pending tokens, before common token-boundary checks. */
export interface InfoSyntax {
  readonly showInfo: boolean
  readonly textBeforeHeader: readonly InfoIgnoredText[]
  readonly textBeforeShowInfo: readonly InfoIgnoredText[]
  readonly body: readonly InfoBodyItem[]
  readonly tokens: readonly PendingToken[]
}

/** diagrams/info.md, Grammar: recursive descent over all components and retained hidden forms. */
export class InfoGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: InfoLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram = newline* info newline* (showInfo newline*)? common-statements? EOF; hidden forms supply no visible separator. */
  public parseDiagram(): InfoSyntax {
    const textBeforeHeader: InfoIgnoredText[] = []
    while (this.peek()?.name === "newline" || this.isHidden(this.peek())) {
      if (this.takeIf("newline") === null)
        textBeforeHeader.push(this.parseIgnoredText())
    }
    this.addItem("Keyword", [this.take("info")])
    const between: InfoIgnoredText[] = []
    while (this.peek()?.name === "newline" || this.isHidden(this.peek())) {
      if (this.takeIf("newline") === null) between.push(this.parseIgnoredText())
    }
    const flag = this.takeIf("showInfo")
    if (flag !== null) this.addItem("Keyword", [flag])
    const body: InfoBodyItem[] = flag === null ? [...between] : []
    while (this.peek() !== null) {
      if (this.takeIf("newline") !== null) continue
      body.push(
        this.isHidden(this.peek())
          ? this.parseIgnoredText()
          : this.parseStatement(),
      )
    }
    return {
      showInfo: flag !== null,
      textBeforeHeader,
      textBeforeShowInfo: flag === null ? [] : between,
      body,
      tokens: this.tokensInOrder(),
    }
  }

  /** Empty common values and blocks are real info syntax; atomic cuts are checked by shared token recording. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** body-item's statement alternatives are decided by their first component. */
  private parseStatement():
    | InfoTitleStatement
    | InfoAccTitleStatement
    | InfoAccDescrStatement
    | InfoAccDescrBlockStatement {
    const unit = this.peek()
    if (unit?.name === "title") return this.parseCommonStatement("title")
    if (unit?.name === "accTitle") return this.parseCommonStatement("accTitle")
    if (unit?.name === "accDescr") return this.parseCommonStatement("accDescr")
    throw this.unexpected(unit)
  }

  /** Common-statement productions: composite line forms or a closed description block, then EOL. */
  private parseCommonStatement(
    keyword: "title" | "accTitle" | "accDescr",
  ):
    | InfoTitleStatement
    | InfoAccTitleStatement
    | InfoAccDescrStatement
    | InfoAccDescrBlockStatement {
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
        ? "InfoAccDescrBlockStatement"
        : keyword === "title"
          ? "InfoTitleStatement"
          : keyword === "accTitle"
            ? "InfoAccTitleStatement"
            : "InfoAccDescrStatement",
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

  /** ast/info.md, InfoLiteral: line units keep padding; block units trim common whitespace. */
  private literalOf(unit: Unit): InfoLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "InfoLiteral", value: this.textOf(place.range), ...place }
  }

  /** Hidden forms may occupy only the gaps and body positions named by ast/info.md. */
  private isHidden(unit: Unit | null): boolean {
    return unit?.name === "yaml-block" || unit?.name === "directive"
  }

  /** Each separately recognized form is one leaf in source order. */
  private parseHiddenForms(): InfoIgnoredText[] {
    const forms: InfoIgnoredText[] = []
    while (this.isHidden(this.peek())) forms.push(this.parseIgnoredText())
    return forms
  }

  /** ast/info.md, InfoIgnoredText: RawText from opener to closer, excluding its consumed LF. */
  private parseIgnoredText(): InfoIgnoredText {
    const unit = this.peek()
    if (unit?.name !== "yaml-block" && unit?.name !== "directive")
      throw this.unexpected(unit)
    this.advance()
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "InfoIgnoredText",
      kind: unit.name,
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }
}
