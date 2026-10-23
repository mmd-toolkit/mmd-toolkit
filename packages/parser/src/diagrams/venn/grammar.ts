import type { Identifier, NumericLiteral, StringLiteral } from "../../ast.ts"
import type {
  VennLabel,
  VennLiteral,
  VennStatement,
  VennStyleProperty,
  VennStyleStatement,
  VennSubsetStatement,
  VennTextStatement,
  VennTitleStatement,
} from "../../ast/venn.ts"
import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName, VennLexing } from "./units.ts"

/** The grammar's written statements and pending tokens. */
export interface VennSyntax {
  readonly body: readonly VennStatement[]
  readonly tokens: readonly PendingToken[]
}

/** diagrams/venn.md, Grammar: recursive descent over venn units. */
export class VennGrammar extends UnitGrammar<UnitName, Unit> {
  /** Rejections outside the grammar: only earlier set names define union members. */
  private readonly sets = new Set<string>()

  public constructor(lexing: VennLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** `diagram = newline* header ( newline | statement )* end`. */
  public parseDiagram(): VennSyntax {
    this.takeAll("newline")
    this.addItem("Keyword", [this.take("header")])
    const body: VennStatement[] = []
    while (this.peek() !== null) {
      if (this.takeIf("newline") !== null) continue
      body.push(this.parseStatement())
    }
    return { body, tokens: this.tokensInOrder() }
  }

  /** No venn tokenless forms; shared recording decides directives and ignored semicolons. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** `statement = subset | text | style | title-line | ignored-text`. */
  private parseStatement(): VennStatement {
    const unit = this.peek()
    switch (unit?.name) {
      case "set-keyword":
      case "union-keyword":
        return this.parseSubset()
      case "text-keyword":
      case "implicit-text-start":
        return this.parseText()
      case "style-keyword":
        return this.parseStyle()
      case "title":
        return this.parseTitle()
      case "ignored-text": {
        this.advance()
        this.addItem("RawText", [unit])
        const place = this.placeOf([unit])
        return {
          type: "VennIgnoredText",
          value: this.unreadTextOf(place.range),
          ...place,
        }
      }
      default:
        throw this.unexpected(unit)
    }
  }

  /** `subset`: set and one name, or union and at least two; optional label, then size. */
  private parseSubset(): VennSubsetStatement {
    const start = this.next
    const keyword = this.peek()!
    this.advance()
    this.addItem("Keyword", [keyword])
    const kind = keyword.name === "set-keyword" ? "set" : "union"
    const nameStart = this.next
    const sets = kind === "set" ? [this.parseName()] : this.parseNameList()
    if (kind === "union" && sets.length < 2)
      throw this.unexpected(this.unitAt(nameStart))
    const label = this.parseLabel()
    const size = this.takeIf(":")
    let numeric: NumericLiteral | null = null
    if (size !== null) {
      this.addItem("Punctuator", [size])
      numeric = this.numericLiteralOf(this.take("number"))
    }
    // Rejections outside the grammar use converted name units, never the
    // written values that the AST retains.
    const names = this.namesFrom(nameStart, sets.length)
    if (kind === "set") this.sets.add(names[0].text)
    else {
      for (const { text, unit } of names) {
        if (!this.sets.has(text)) {
          const place = this.placeOf([unit])
          throw new ParseError(
            "A union member must name an earlier set",
            place.range,
            place.loc,
          )
        }
      }
    }
    return {
      type: "VennSubsetStatement",
      kind,
      sets,
      label,
      size: numeric,
      ...this.placeFrom(start),
    }
  }

  /** Rejections outside the grammar: trim converted outer text, then remove one double-quote pair. */
  private namesFrom(
    start: number,
    count: number,
  ): { readonly text: string; readonly unit: Unit }[] {
    const names: { readonly text: string; readonly unit: Unit }[] = []
    let position = start
    while (names.length < count) {
      const unit = this.unitAt(position)!
      const text = unit.text.trim()
      names.push({
        text:
          text.startsWith('"') && text.endsWith('"') ? text.slice(1, -1) : text,
        unit,
      })
      position = this.positionAfter(this.positionAfter(position))
    }
    return names
  }

  /** `name = identifier | string`. */
  private parseName(): Identifier | StringLiteral {
    const string = this.takeIf("string")
    return string === null
      ? this.identifierOf([this.take("identifier")])
      : this.closedStringLiteralOf(string)
  }

  /** `name-list = name ( "," name )*`, retaining repetitions in written order. */
  private parseNameList(): (Identifier | StringLiteral)[] {
    const names = [this.parseName()]
    while (this.peek()?.name === ",") {
      this.addItem("Punctuator", [this.take(",")])
      names.push(this.parseName())
    }
    return names
  }

  /** `text`: an explicit target list or implicit marker, followed by text-tail. */
  private parseText(): VennTextStatement {
    const start = this.next
    const keyword = this.peek()!
    this.advance()
    this.addItem("Keyword", [keyword])
    const targets =
      keyword.name === "implicit-text-start" ? null : this.parseNameList()
    const number = this.takeIf("number")
    const id =
      number === null ? this.parseName() : this.numericLiteralOf(number)
    const label = number === null ? this.parseLabel() : null
    return {
      type: "VennTextStatement",
      targets,
      id,
      label,
      ...this.placeFrom(start),
    }
  }

  /** `style = style-keyword name-list property ( "," property )*`. */
  private parseStyle(): VennStyleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("style-keyword")])
    const targets = this.parseNameList()
    const properties = [this.parseProperty()]
    while (this.peek()?.name === ",") {
      this.addItem("Punctuator", [this.take(",")])
      properties.push(this.parseProperty())
    }
    return {
      type: "VennStyleStatement",
      targets,
      properties,
      ...this.placeFrom(start),
    }
  }

  /** `property = identifier ":" style-value`; keys are never normalized or deduplicated. */
  private parseProperty(): VennStyleProperty {
    const start = this.next
    const key = this.identifierOf([this.take("identifier")])
    this.addItem("Punctuator", [this.take(":")])
    const value = this.parseStyleValue()
    return { type: "VennStyleProperty", key, value, ...this.placeFrom(start) }
  }

  /** `style-value = string | style-atom+`, keeping written spacing between bare atoms. */
  private parseStyleValue(): StringLiteral | VennLiteral {
    const string = this.takeIf("string")
    if (string !== null) return this.closedStringLiteralOf(string)
    const atoms = this.takeWhile([
      "identifier",
      "number",
      "hex-color",
      "rgb-color",
      "rgba-color",
    ])
    if (atoms.length === 0) throw this.unexpected(this.peek())
    for (const atom of atoms) {
      this.addItem(
        atom.name === "identifier"
          ? "Identifier"
          : atom.name === "number"
            ? "Numeric"
            : "RawText",
        [atom],
      )
    }
    const place = this.placeOf(atoms)
    return { type: "VennLiteral", value: this.textOf(place.range), ...place }
  }

  /** `title-line`: keyword and nonempty title text after its first whitespace separator. */
  private parseTitle(): VennTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("title")])
    const text = this.take("title-text")
    this.addItem("RawText", [text])
    const place = this.placeOf([text])
    const value: VennLiteral = {
      type: "VennLiteral",
      value: this.textOf(place.range),
      ...place,
    }
    return { type: "VennTitleStatement", value, ...this.placeFrom(start) }
  }

  /** `label = quoted-label | bare-label`: brackets enclose a whole string or nonempty text. */
  private parseLabel(): VennLabel | null {
    const start = this.next
    const open = this.takeIf("label-open")
    if (open === null) return null
    this.addItem("Punctuator", [open])
    const string = this.takeIf("label-string")
    const text = string ?? this.take("label-text")
    this.addItem(string === null ? "RawText" : "String", [text])
    this.addItem("Punctuator", [this.take("label-close")])
    const [from, to] = this.placeOf([text]).range
    return {
      type: "VennLabel",
      kind: string === null ? "text" : "string",
      value: this.textOf(string === null ? [from, to] : [from + 1, to - 1]),
      ...this.placeFrom(start),
    }
  }
}
