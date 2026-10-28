import { appendItems } from "../../append-items.ts"
import type { NodeBase, Range } from "../../ast.ts"
import type {
  RailroadBodyItem,
  RailroadExpression,
  RailroadExpressionMember,
  RailroadIgnoredText,
  RailroadLiteral,
  RailroadRule,
} from "../../ast/railroad.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { Place } from "../../diagram-parsing.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** Parsed authored content; finishDiagram supplies the shared root and complete token records. */
export interface RailroadSyntax {
  readonly textBeforeHeader: readonly RailroadIgnoredText[]
  readonly body: readonly RailroadBodyItem[]
  readonly tokens: readonly PendingToken[]
}

/** Shared layout, metadata, named gaps and natural expression productions. */
export abstract class RailroadGrammar extends UnitGrammar<UnitName, Unit> {
  protected abstract readonly dialect: "ir" | "ebnf" | "abnf" | "peg"

  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram: header, a metadata prefix, then rules; hidden forms remain source-ordered body items. */
  public parseDiagram(): RailroadSyntax {
    const textBeforeHeader = this.parseHidden()
    this.addItem("Keyword", [this.take("header")])
    const body: RailroadBodyItem[] = []
    let hasRule = false
    while (this.peek() !== null) {
      appendItems(body, this.parseHidden())
      if (this.peek() === null) break
      const name = this.peek()!.name
      if (
        !hasRule &&
        (name === "title" || name === "accTitle" || name === "accDescr")
      )
        body.push(this.parseMetadata(name))
      else {
        body.push(this.parseRule())
        hasRule = true
      }
    }
    return { textBeforeHeader, body, tokens: this.tokensInOrder() }
  }

  /** No empty-form or semantic gate is defined for railroad. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** The dialect's complete expression production. */
  protected abstract parseExpression(): RailroadExpression

  /** Natural term production; IR implements constructors directly. */
  protected parseTerm(): RailroadExpression {
    return this.parsePrimary()
  }

  /** Natural primary production, overridden for special sequences, numeric values and PEG dot. */
  protected parsePrimary(): RailroadExpression {
    return this.parseNaturalPrimary()
  }

  /** A natural choice owns only explicit-separator gaps, leaving outer gaps to its parent. */
  protected parseChoice(separator: "|" | "/"): RailroadExpression {
    const first = this.parseSequence()
    if (this.nameAfterHidden() !== separator) return first
    const alternatives: RailroadExpressionMember[] = []
    let expression = first
    let textBefore: RailroadIgnoredText[] = []
    while (this.nameAfterHidden() === separator) {
      const textAfter = this.parseHidden()
      alternatives.push(this.member(expression, textBefore, textAfter))
      this.symbol(separator)
      textBefore = this.parseHidden()
      expression = this.parseSequence()
    }
    alternatives.push(this.member(expression, textBefore, []))
    return {
      type: "RailroadChoiceExpression",
      alternatives,
      ...this.span(first, expression),
    }
  }

  /** Natural sequences: adjacency gaps belong to the next member; comma gaps straddle their separator. */
  private parseSequence(): RailroadExpression {
    const first = this.parseTerm()
    const elements: RailroadExpressionMember[] = []
    let expression = first
    let textBefore: RailroadIgnoredText[] = []
    for (;;) {
      const name = this.nameAfterHidden()
      const comma = this.dialect === "ebnf" && name === ","
      if (!comma && !this.startsTerm(name)) break
      const gap = this.parseHidden()
      elements.push(this.member(expression, textBefore, comma ? gap : []))
      if (comma) this.symbol(",")
      textBefore = comma ? this.parseHidden() : gap
      expression = this.parseTerm()
    }
    if (elements.length === 0) return first
    elements.push(this.member(expression, textBefore, []))
    return {
      type: "RailroadSequenceExpression",
      elements,
      ...this.span(first, expression),
    }
  }

  /** The finite FIRST sets of the three natural term productions. */
  private startsTerm(name: UnitName | null): boolean {
    if (name === "name" || name === "string" || name === "(") return true
    if (this.dialect === "ebnf")
      return name === "[" || name === "{" || name === "special-sequence"
    if (this.dialect === "abnf")
      return (
        name === "[" ||
        name === "numeric-value" ||
        name === "exact-repeat" ||
        name === "repeat-minimum" ||
        name === "repeat-star"
      )
    return (
      this.dialect === "peg" && (name === "." || name === "&" || name === "!")
    )
  }

  /** Shared natural names, quoted leaves and authored groups, without singleton elimination. */
  protected parseNaturalPrimary(): RailroadExpression {
    const name = this.peek()?.name
    if (name === "name") return this.identifierOf([this.take("name")])
    if (name === "string")
      return this.closedStringLiteralOf(this.take("string"))
    if (
      name !== "(" &&
      !(name === "[" && this.dialect !== "peg") &&
      !(name === "{" && this.dialect === "ebnf")
    )
      throw this.unexpected(this.peek())
    const start = this.next
    this.symbol(name)
    const textBeforeElement = this.parseHidden()
    const element = this.parseExpression()
    const textBeforeClose = this.parseHidden()
    this.symbol(name === "(" ? ")" : name === "[" ? "]" : "}")
    return {
      type:
        name === "("
          ? "RailroadGroupExpression"
          : name === "["
            ? "RailroadOptionalGroupExpression"
            : "RailroadRepetitionGroupExpression",
      textBeforeElement,
      element,
      textBeforeClose,
      ...this.placeFrom(start),
    }
  }

  /** rule: name, dialect assignment, complete definition and required visible semicolon. */
  private parseRule(): RailroadRule {
    const start = this.next
    const name = this.identifierOf([this.take("name")])
    const textBeforeOperator = this.parseHidden()
    if (this.dialect === "peg") this.symbol("<-")
    else if (this.dialect === "ebnf" && this.peek()?.name === "::=")
      this.symbol("::=")
    else this.symbol("=")
    const textBeforeDefinition = this.parseHidden()
    const definition = this.parseExpression()
    const textBeforeTerminator = this.parseHidden()
    this.symbol(";")
    return {
      type: "RailroadRule",
      name,
      textBeforeOperator,
      textBeforeDefinition,
      definition,
      textBeforeTerminator,
      ...this.placeFrom(start),
    }
  }

  /** Metadata units are split at keyword, colon/brace and authored value boundaries. */
  private parseMetadata(
    keyword: "title" | "accTitle" | "accDescr",
  ): RailroadBodyItem {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const block = keyword === "accDescr" && this.peek()?.name === "{"
    if (keyword !== "title") this.symbol(block ? "{" : ":")
    const unit = this.takeIf(block ? "block-text" : "line-text")
    const value = unit?.significantRange == null ? null : this.literalOf(unit)
    if (block) this.symbol("}")
    return {
      type: block
        ? "RailroadAccDescrBlockStatement"
        : keyword === "title"
          ? "RailroadTitleStatement"
          : keyword === "accTitle"
            ? "RailroadAccTitleStatement"
            : "RailroadAccDescrStatement",
      value,
      ...this.placeFrom(start),
    }
  }

  /** Native hidden forms are whole RawText items with their source spelling and named kind. */
  protected parseHidden(): RailroadIgnoredText[] {
    const result: RailroadIgnoredText[] = []
    for (;;) {
      const name = this.peek()?.name
      if (name !== "yaml-block" && name !== "directive") return result
      const unit = this.take(name)
      this.addItem("RawText", [unit])
      const place = this.placeOf([unit])
      result.push({
        type: "RailroadIgnoredText",
        kind: name,
        value: this.textOf(place.range),
        ...place,
      })
    }
  }

  /** Inspect the next visible boundary without taking hidden forms from their eventual owner. */
  protected nameAfterHidden(): UnitName | null {
    return this.nameAt(
      this.afterUnitsNamed(this.next, ["yaml-block", "directive"]),
    )
  }

  /** Record an authored punctuation component. */
  protected symbol(name: UnitName): void {
    this.addItem("Punctuator", [this.take(name)])
  }

  /** List members range over exactly their owned forms and expression core. */
  protected member(
    expression: RailroadExpression,
    textBefore: readonly RailroadIgnoredText[],
    textAfter: readonly RailroadIgnoredText[],
  ): RailroadExpressionMember {
    return {
      type: "RailroadExpressionMember",
      textBefore,
      expression,
      textAfter,
      ...this.span(textBefore[0] ?? expression, textAfter.at(-1) ?? expression),
    }
  }

  /** A composite expression spans its first and last authored child or delimiter. */
  protected span(first: Place, last: Place): Place {
    const range: Range = [first.range[0], last.range[1]]
    return { range, loc: this.lines.location(range) }
  }

  /** A postfix extends its operand through the operator just consumed. */
  protected throughPrevious(element: NodeBase): Place {
    return this.span(
      element,
      this.placeOf([this.unitAt(this.positionBefore(this.next))!]),
    )
  }

  /** Authored metadata text; block units alone trim their outer Notation whitespace. */
  private literalOf(unit: Unit): RailroadLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "RailroadLiteral",
      value: this.textOf(place.range),
      ...place,
    }
  }
}
