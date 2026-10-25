import type {
  PacketAccDescrBlockStatement,
  PacketAccDescrStatement,
  PacketAccTitleStatement,
  PacketBodyItem,
  PacketIgnoredText,
  PacketLiteral,
  PacketTitleStatement,
  PacketRangeBlockStatement,
  PacketSingleBlockStatement,
  PacketRelativeBlockStatement,
} from "../../ast/packet.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** Written diagram fields and pending tokens, before common token-boundary checks. */
export interface PacketSyntax {
  readonly textBeforeHeader: readonly PacketIgnoredText[]
  readonly body: readonly PacketBodyItem[]
  readonly tokens: readonly PendingToken[]
}

/** diagrams/packet.md, Grammar: recursive descent over all components and retained hidden forms. */
export class PacketGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram = newline* header (block | common-statement | newline)* EOF, with retained hidden forms. */
  public parseDiagram(): PacketSyntax {
    const textBeforeHeader: PacketIgnoredText[] = []
    while (this.peek()?.name === "newline" || this.isHidden(this.peek())) {
      if (this.takeIf("newline") === null)
        textBeforeHeader.push(this.parseIgnoredText())
    }
    const header = this.takeIf("packet-beta") ?? this.take("packet")
    this.addItem("Keyword", [header])
    const body: PacketBodyItem[] = []
    while (this.peek() !== null) {
      if (this.takeIf("newline") !== null) continue
      body.push(
        this.isHidden(this.peek())
          ? this.parseIgnoredText()
          : this.parseStatement(),
      )
    }
    return {
      textBeforeHeader,
      body,
      tokens: this.tokensInOrder(),
    }
  }

  /** Empty common values and blocks are real packet syntax; atomic cuts are checked by shared token recording. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** body-item's statement alternatives are decided by their first component. */
  private parseStatement():
    | PacketRangeBlockStatement
    | PacketSingleBlockStatement
    | PacketRelativeBlockStatement
    | PacketTitleStatement
    | PacketAccTitleStatement
    | PacketAccDescrStatement
    | PacketAccDescrBlockStatement {
    const unit = this.peek()
    if (unit?.name === "integer" || unit?.name === "relative-plus")
      return this.parseBlock()
    if (unit?.name === "title") return this.parseCommonStatement("title")
    if (unit?.name === "accTitle") return this.parseCommonStatement("accTitle")
    if (unit?.name === "accDescr") return this.parseCommonStatement("accDescr")
    throw this.unexpected(unit)
  }

  /** block = (range-block | single-block | relative-block) eol; hidden forms have one named owner. */
  private parseBlock():
    | PacketRangeBlockStatement
    | PacketSingleBlockStatement
    | PacketRelativeBlockStatement {
    const beginning = this.next
    const plus = this.takeIf("relative-plus")
    if (plus !== null) {
      this.addItem("Punctuator", [plus])
      const textBeforeCount = this.parseHiddenForms()
      const count = this.numericLiteralOf(this.take("integer"))
      const textBeforeColon = this.parseHiddenForms()
      this.addItem("Punctuator", [this.take(":")])
      const textBeforeLabel = this.parseHiddenForms()
      const label = this.closedStringLiteralOf(this.take("string"))
      const textAfter = this.parseHiddenForms()
      const place = this.placeFrom(beginning)
      this.parseEol()
      return {
        type: "PacketRelativeBlockStatement",
        textBeforeCount,
        count,
        textBeforeColon,
        textBeforeLabel,
        label,
        textAfter,
        ...place,
      }
    }
    const start = this.numericLiteralOf(this.take("integer"))
    const between = this.parseHiddenForms()
    const dash = this.takeIf("range-dash")
    if (dash !== null) {
      this.addItem("Punctuator", [dash])
      const textBeforeEnd = this.parseHiddenForms()
      const end = this.numericLiteralOf(this.take("integer"))
      const textBeforeColon = this.parseHiddenForms()
      this.addItem("Punctuator", [this.take(":")])
      const textBeforeLabel = this.parseHiddenForms()
      const label = this.closedStringLiteralOf(this.take("string"))
      const textAfter = this.parseHiddenForms()
      const place = this.placeFrom(beginning)
      this.parseEol()
      return {
        type: "PacketRangeBlockStatement",
        start,
        textBeforeDash: between,
        textBeforeEnd,
        end,
        textBeforeColon,
        textBeforeLabel,
        label,
        textAfter,
        ...place,
      }
    }
    this.addItem("Punctuator", [this.take(":")])
    const textBeforeLabel = this.parseHiddenForms()
    const label = this.closedStringLiteralOf(this.take("string"))
    const textAfter = this.parseHiddenForms()
    const place = this.placeFrom(beginning)
    this.parseEol()
    return {
      type: "PacketSingleBlockStatement",
      start,
      textBeforeColon: between,
      textBeforeLabel,
      label,
      textAfter,
      ...place,
    }
  }

  /** Common-statement productions: composite line forms or a closed description block, then EOL. */
  private parseCommonStatement(
    keyword: "title" | "accTitle" | "accDescr",
  ):
    | PacketTitleStatement
    | PacketAccTitleStatement
    | PacketAccDescrStatement
    | PacketAccDescrBlockStatement {
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
        ? "PacketAccDescrBlockStatement"
        : keyword === "title"
          ? "PacketTitleStatement"
          : keyword === "accTitle"
            ? "PacketAccTitleStatement"
            : "PacketAccDescrStatement",
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

  /** ast/packet.md, PacketLiteral: line units keep padding; block units trim common whitespace. */
  private literalOf(unit: Unit): PacketLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "PacketLiteral", value: this.textOf(place.range), ...place }
  }

  /** Hidden forms may occupy only the gaps and body positions named by ast/packet.md. */
  private isHidden(unit: Unit | null): boolean {
    return unit?.name === "yaml-block" || unit?.name === "directive"
  }

  /** Each separately recognized form is one leaf in source order. */
  private parseHiddenForms(): PacketIgnoredText[] {
    const forms: PacketIgnoredText[] = []
    while (this.isHidden(this.peek())) forms.push(this.parseIgnoredText())
    return forms
  }

  /** ast/packet.md, PacketIgnoredText: RawText from opener to closer, excluding its consumed LF. */
  private parseIgnoredText(): PacketIgnoredText {
    const unit = this.peek()
    if (unit?.name !== "yaml-block" && unit?.name !== "directive")
      throw this.unexpected(unit)
    this.advance()
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "PacketIgnoredText",
      kind: unit.name,
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }
}
