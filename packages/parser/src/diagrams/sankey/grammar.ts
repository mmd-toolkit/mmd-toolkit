import type { Range, StringLiteral } from "../../ast.ts"
import type {
  SankeyIdentifier,
  SankeyLinkStatement,
  SankeyLiteral,
} from "../../ast/sankey.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import type { NodePlace } from "../../unit-grammar.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { SankeyLexing, Unit, UnitName } from "./units.ts"

/** What the grammar makes of the units of a sankey diagram. */
export interface SankeySyntax {
  /** The links of the diagram, in source order; at least one. */
  readonly body: readonly SankeyLinkStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** The place and the value of a field without quotes (see {@link SankeyGrammar.fieldTextOf}). */
interface FieldText {
  readonly value: string
  readonly place: NodePlace
}

/**
 * diagrams/sankey.md, Grammar: the recursive-descent parser over the units
 * of the sankey lexer. Each method reads one rule of the grammar, which its
 * comment names, and makes the node that the specification gives for the
 * rule, with the tokens of `docs/tokens/sankey.md`, Tokens.
 */
export class SankeyGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: SankeyLexing, lexer: SourceLexer) {
    // known-divergences/tokenless-empty-forms.md has no case in this
    // diagram type: an empty string reads no unit, and the lexer reads no
    // diagram comments.
    super(lexing.units, lexer, [], [])
  }

  /**
   * Diagram and records: `diagram = header newline record ( newline record
   * )*`. A `newline` unit stands for one or more line feeds, and the text
   * ends at its last character that is not whitespace, so no `newline`
   * unit ends it.
   */
  public parseDiagram(): SankeySyntax {
    this.addItem("Keyword", [this.take("header")])
    this.take("newline")
    const body = [this.parseRecord()]
    while (this.peek() !== null) {
      this.take("newline")
      body.push(this.parseRecord())
    }
    return { body, tokens: this.tokensInOrder() }
  }

  /**
   * diagrams/sankey.md, Known divergences: none of them is found at a unit
   * that the grammar cannot read. A directive inside the header keyword is
   * rejected where the tokens are recorded, and the others are decided
   * before the lexer reads the text.
   */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /**
   * Diagram and records: `record = field "," field "," field`, a link. Its
   * range runs from its source to its value, which covers the token of a
   * field of spaces only, the token of no unit (`docs/positions/sankey.md`).
   */
  private parseRecord(): SankeyLinkStatement {
    const source = this.parseId()
    this.addItem("Punctuator", [this.take(",")])
    const target = this.parseId()
    this.addItem("Punctuator", [this.take(",")])
    const value = this.parseValue()
    const range: Range = [source.range[0], value.range[1]]
    return {
      type: "SankeyLinkStatement",
      source,
      target,
      value,
      range,
      loc: this.lines.location(range),
    }
  }

  /** Ids and values: `field = field-text | string` as the first or the second field, the id of a node. */
  private parseId(): SankeyIdentifier | StringLiteral {
    const string = this.takeIf("string")
    if (string !== null) return this.stringLiteralOf(string)
    const { value, place } = this.fieldTextOf(this.take("field-text"))
    return { type: "SankeyIdentifier", name: value, ...place }
  }

  /** Ids and values: `field = field-text | string` as the third field, the value of the link. */
  private parseValue(): SankeyLiteral | StringLiteral {
    const string = this.takeIf("string")
    if (string !== null) return this.stringLiteralOf(string)
    const { value, place } = this.fieldTextOf(this.take("field-text"))
    return { type: "SankeyLiteral", value, ...place }
  }

  /**
   * ast/sankey.md, SankeyIdentifier and SankeyLiteral: the `field-text`
   * unit `unit`, one `RawText` item, whose value is its written text, the
   * field without the spaces at its ends. A field of spaces only has the
   * empty value and the token of its spaces, so that its node has a token
   * (`docs/positions/sankey.md`).
   */
  private fieldTextOf(unit: Unit): FieldText {
    if (unit.significantRange === null) {
      this.addWhitespaceToken("RawText", [unit.start, unit.end])
      return { value: "", place: this.placeOf([unit]) }
    }
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { value: this.textOf(place.range), place }
  }

  /**
   * ast.md, Shared leaf nodes > StringLiteral: the `string` unit `unit`,
   * one `String` item, whose value is its written text between its quotes,
   * `""` and line terminators as written. Every string of this diagram is
   * closed and not empty: the lexer rejects a string that the text ends
   * in, and reads no unit of two quotes.
   */
  private stringLiteralOf(unit: Unit): StringLiteral {
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
}
