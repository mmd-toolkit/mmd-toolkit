import type {
  CynefinBodyItem,
  CynefinDomainStatement,
  CynefinDomainItem,
  CynefinTransitionStatement,
  CynefinArrow,
  CynefinIgnoredText,
  CynefinTitleStatement,
  CynefinAccTitleStatement,
  CynefinAccDescrStatement,
  CynefinAccDescrBlockStatement,
  CynefinLiteral,
} from "../../ast/cynefin.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** Authored fields and pending tokens, before shared atomic-boundary checks. */
export interface CynefinSyntax {
  readonly textBeforeHeader: readonly CynefinIgnoredText[]
  readonly body: readonly CynefinBodyItem[]
  readonly tokens: readonly PendingToken[]
}

/** diagrams/cynefin.md, Grammar: complete consumption without semantic rejection. */
export class CynefinGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram = newline* header newline* (domain-block | transition | common-statement | newline)*. */
  public parseDiagram(): CynefinSyntax {
    const textBeforeHeader = this.parseHiddenForms(true)
    this.parseHeader()
    const body: CynefinBodyItem[] = []
    while (this.peek() !== null) {
      if (this.takeIf("newline") !== null) continue
      if (this.isHidden(this.peek())) body.push(this.parseIgnoredText())
      else body.push(this.parseStatement())
    }
    return { textBeforeHeader, body, tokens: this.tokensInOrder() }
  }

  /** header = header-colon | header-bare; only the colon alternative owns punctuation. */
  private parseHeader(): void {
    const header = this.takeIf("header-colon") ?? this.take("header-bare")
    this.addItem("Keyword", [header])
    if (header.name === "header-colon")
      this.addItem("Punctuator", [this.take(":")])
  }

  /** Empty strings and blocks are authored nodes; atomic cuts use the shared recorder. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** Dispatch only the productions allowed at a statement boundary. */
  private parseStatement(): CynefinBodyItem {
    switch (this.peek()?.name) {
      case "domain-name": {
        const afterName = this.afterUnitsNamed(this.next + 1, [
          "yaml-block",
          "directive",
        ])
        return this.nameAt(afterName) === "transition-arrow"
          ? this.parseTransition()
          : this.parseDomain()
      }
      case "title":
        return this.parseCommonStatement("title")
      case "accTitle":
        return this.parseCommonStatement("accTitle")
      case "accDescr":
        return this.parseCommonStatement("accDescr")
      default:
        throw this.unexpected(this.peek())
    }
  }

  /** domain-block: immediate forms belong to the name; forms after LF need an actual next item. */
  private parseDomain(): CynefinDomainStatement {
    const start = this.next
    const name = this.parseDomainName()
    const textAfterName = this.parseHiddenForms()
    const items: CynefinDomainItem[] = []
    for (;;) {
      const itemStart = this.afterUnitsNamed(this.next, [
        "newline",
        "yaml-block",
        "directive",
      ])
      if (this.nameAt(itemStart) !== "string") break
      items.push(this.parseDomainItem())
    }
    return {
      type: "CynefinDomainStatement",
      name,
      textAfterName,
      items,
      ...this.placeFrom(start),
    }
  }

  /** domain-item = string, retaining leading forms after LF and immediate suffix forms. */
  private parseDomainItem(): CynefinDomainItem {
    const start = this.next
    const textBefore = this.parseHiddenForms(true)
    const label = this.closedStringLiteralOf(this.take("string"))
    const textAfter = this.parseHiddenForms()
    return {
      type: "CynefinDomainItem",
      textBefore,
      label,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** A fixed domain is a Keyword token and a plain authored string field. */
  private parseDomainName(): string {
    const unit = this.take("domain-name")
    this.addItem("Keyword", [unit])
    return this.textOfUnit(unit)
  }

  /** transition = domain-name transition-arrow domain-name (label-colon string)? eol. */
  private parseTransition(): CynefinTransitionStatement {
    const start = this.next
    const from = this.parseDomainName()
    const textBeforeArrow = this.parseHiddenForms()
    const unit = this.take("transition-arrow")
    this.addItem("Punctuator", [unit])
    const arrow: CynefinArrow = {
      type: "CynefinArrow",
      value: "-->",
      startMarker: "none",
      line: "solid",
      endMarker: "arrow",
      ...this.placeOf([unit]),
    }
    const textBeforeTo = this.parseHiddenForms()
    const to = this.parseDomainName()
    const gap = this.parseHiddenForms()
    const colon = this.takeIf(":")
    if (colon !== null) this.addItem("Punctuator", [colon])
    const textBeforeColon = colon === null ? [] : gap
    const textBeforeLabel = colon === null ? [] : this.parseHiddenForms()
    const label =
      colon === null ? null : this.closedStringLiteralOf(this.take("string"))
    const textAfter = colon === null ? gap : this.parseHiddenForms()
    const place = this.placeFrom(start)
    this.parseEol()
    return {
      type: "CynefinTransitionStatement",
      from,
      textBeforeArrow,
      arrow,
      textBeforeTo,
      to,
      textBeforeColon,
      textBeforeLabel,
      label,
      textAfter,
      ...place,
    }
  }

  /** eol = newline+ | end-of-text; a hidden consumed LF does not satisfy it. */
  private parseEol(): void {
    if (this.peek() !== null) this.take("newline")
    this.takeAll("newline")
  }

  /** Composite common forms require EOL/EOF after their retained suffixes. */
  private parseCommonStatement(
    keyword: "title" | "accTitle" | "accDescr",
  ):
    | CynefinTitleStatement
    | CynefinAccTitleStatement
    | CynefinAccDescrStatement
    | CynefinAccDescrBlockStatement {
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
        ? "CynefinAccDescrBlockStatement"
        : keyword === "title"
          ? "CynefinTitleStatement"
          : keyword === "accTitle"
            ? "CynefinAccTitleStatement"
            : "CynefinAccDescrStatement",
      value,
      textAfter,
      ...place,
    }
  }

  /** CynefinLiteral: line padding remains owned; block units trim outer common whitespace. */
  private literalOf(unit: Unit): CynefinLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "CynefinLiteral", value: this.textOf(place.range), ...place }
  }

  /** Only native YAML and native DIRECTIVE forms are retained gap elements. */
  private isHidden(unit: Unit | null): boolean {
    return unit?.name === "yaml-block" || unit?.name === "directive"
  }

  /** Read forms in source order, crossing visible newlines only in grammar positions that allow them. */
  private parseHiddenForms(newlines = false): CynefinIgnoredText[] {
    const forms: CynefinIgnoredText[] = []
    for (;;) {
      if (this.isHidden(this.peek())) forms.push(this.parseIgnoredText())
      else if (newlines && this.takeIf("newline") !== null) continue
      else return forms
    }
  }

  /** CynefinIgnoredText: authored fenced form, excluding its consumed following LF. */
  private parseIgnoredText(): CynefinIgnoredText {
    const unit = this.peek()
    if (unit?.name !== "yaml-block" && unit?.name !== "directive")
      throw this.unexpected(unit)
    this.advance()
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "CynefinIgnoredText",
      kind: unit.name,
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }
}
