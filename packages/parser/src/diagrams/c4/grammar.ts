import { appendItems } from "../../append-items.ts"
import type { StringLiteral } from "../../ast.ts"
import type {
  C4AccDescrBlockStatement,
  C4Argument,
  C4BoundaryKeyword,
  C4BoundaryStatement,
  C4ElementKeyword,
  C4Kind,
  C4Literal,
  C4NamedAttribute,
  C4Statement,
  C4RelationshipKeyword,
  C4UpdateKeyword,
} from "../../ast/c4.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import { C4Rejections } from "./rejections.ts"
import type { C4Lexing, Unit, UnitName } from "./units.ts"

/** The C4 grammar's statements, header kind, and pending tokens. */
export interface C4Syntax {
  readonly kind: C4Kind
  readonly beforeBody: readonly C4AccDescrBlockStatement[]
  readonly body: readonly C4Statement[]
  readonly tokens: readonly PendingToken[]
}

/** ast/c4.md, C4ElementStatement: element keywords. */
const ELEMENTS: readonly C4ElementKeyword[] = [
  "Person",
  "Person_Ext",
  "System",
  "SystemDb",
  "SystemQueue",
  "System_Ext",
  "SystemDb_Ext",
  "SystemQueue_Ext",
  "Container",
  "ContainerDb",
  "ContainerQueue",
  "Container_Ext",
  "ContainerDb_Ext",
  "ContainerQueue_Ext",
  "Component",
  "ComponentDb",
  "ComponentQueue",
  "Component_Ext",
  "ComponentDb_Ext",
  "ComponentQueue_Ext",
]

/** ast/c4.md, C4BoundaryStatement: boundary keywords. */
const BOUNDARIES: readonly C4BoundaryKeyword[] = [
  "Boundary",
  "Enterprise_Boundary",
  "System_Boundary",
  "Container_Boundary",
  "Deployment_Node",
  "Node",
  "Node_L",
  "Node_R",
]

/** ast/c4.md, C4RelationshipStatement: relationship keywords. */
const RELATIONSHIPS: readonly C4RelationshipKeyword[] = [
  "Rel",
  "BiRel",
  "Rel_U",
  "Rel_Up",
  "Rel_D",
  "Rel_Down",
  "Rel_L",
  "Rel_Left",
  "Rel_R",
  "Rel_Right",
  "Rel_Back",
  "RelIndex",
]

/** ast/c4.md, C4UpdateStatement: update keywords. */
const UPDATES: readonly C4UpdateKeyword[] = [
  "UpdateElementStyle",
  "UpdateRelStyle",
  "UpdateLayoutConfig",
]

/** Whether the named unit starts one of the four call families. */
function startsCall(name: UnitName): boolean {
  return [...ELEMENTS, ...BOUNDARIES, ...RELATIONSHIPS, ...UPDATES].some(
    (word) => word === name,
  )
}

/** diagrams/c4.md, Grammar: recursive descent over the C4 units. */
export class C4Grammar extends UnitGrammar<UnitName, Unit> {
  /** Converted argument values are retained only for the specified rejections. */
  private readonly converted = new Map<C4Literal | StringLiteral, string>()

  private readonly rejections: C4Rejections

  public constructor(lexing: C4Lexing, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
    this.rejections = new C4Rejections(this.converted)
  }

  /** Header and statement sequences: header, empty blocks, newline, statements. */
  public parseDiagram(): C4Syntax {
    const header = this.take("header")
    this.addItem("Keyword", [header])
    const kind = this.kindOf(header)
    const beforeBody = this.parseEmptyBlocks()
    this.take("newline")
    const body = this.parseStatements(false)
    if (this.peek() !== null) throw this.unexpected(this.peek())
    return { kind, beforeBody, body, tokens: this.tokensInOrder() }
  }

  /** C4 has no tokenless empty forms; shared token recording handles token cuts. */
  protected knownDivergenceAt(_unit: Unit): ParseError | null {
    return null
  }

  /** ast/c4.md, C4Diagram: the header selects its kind without making a node. */
  private kindOf(header: Unit): C4Kind {
    switch (header.text) {
      case "C4Context":
        return "context"
      case "C4Container":
        return "container"
      case "C4Component":
        return "component"
      case "C4Dynamic":
        return "dynamic"
      case "C4Deployment":
        return "deployment"
      default:
        throw new Error("mmd-toolkit parser bug: unknown C4 header")
    }
  }

  /**
   * Header and statement sequences: a boundary begins with a diagram statement;
   * diagram statements need a newline before the next significant statement;
   * other statements may meet a diagram statement directly. Empty blocks are
   * statements but supply neither a significant statement nor a newline.
   */
  private parseStatements(inBoundary: boolean): C4Statement[] {
    const body: C4Statement[] = []
    let previous: "first" | "other" | "diagram" = "first"
    let newline = false
    for (let unit = this.peek(); unit !== null; unit = this.peek()) {
      if (inBoundary && unit.name === "}") break
      if (this.emptyBlockStarts()) {
        body.push(this.parseDescriptionBlock())
        continue
      }
      if (unit.name === "newline") {
        if (previous === "first" || newline) throw this.unexpected(unit)
        this.advance()
        newline = true
        continue
      }
      const diagram = startsCall(unit.name)
      if (
        (previous === "first" && inBoundary && !diagram) ||
        (previous !== "first" &&
          !newline &&
          (previous === "diagram" || !diagram))
      )
        throw this.unexpected(unit)
      body.push(diagram ? this.parseCall(unit) : this.parseOther())
      previous = diagram ? "diagram" : "other"
      newline = false
    }
    if (previous === "first") throw this.unexpected(this.peek())
    return body
  }

  /** Empty description blocks: recognize only a closed block with no significant text. */
  private emptyBlockStarts(): boolean {
    if (this.nameAt(this.next) !== "accDescr") return false
    const open = this.positionAfter(this.next)
    if (this.nameAt(open) !== "{") return false
    let close = this.positionAfter(open)
    const text = this.unitAt(close)
    if (text?.name === "description-block-text") {
      if (text.significantRange !== null) return false
      close = this.positionAfter(close)
    }
    return this.nameAt(close) === "}"
  }

  /** Empty description blocks: the two beforeBody gaps hold only empty blocks. */
  private parseEmptyBlocks(): C4AccDescrBlockStatement[] {
    const blocks: C4AccDescrBlockStatement[] = []
    while (this.emptyBlockStarts()) blocks.push(this.parseDescriptionBlock())
    return blocks
  }

  /** Calls and arguments: keyword and at least one argument, with a boundary body when required. */
  private parseCall(unit: Unit): C4Statement {
    const start = this.next
    this.advance()
    this.addItem("Keyword", [unit])
    const args = this.parseArguments()
    const element = ELEMENTS.find((word) => word === unit.name)
    if (element !== undefined) {
      this.rejections.element(element, args)
      return {
        type: "C4ElementStatement",
        keyword: element,
        arguments: args,
        ...this.placeFrom(start),
      }
    }
    const boundary = BOUNDARIES.find((word) => word === unit.name)
    if (boundary !== undefined) return this.parseBoundary(start, boundary, args)
    const relationship = RELATIONSHIPS.find((word) => word === unit.name)
    if (relationship !== undefined) {
      this.rejections.relationship(relationship, args)
      return {
        type: "C4RelationshipStatement",
        keyword: relationship,
        arguments: args,
        ...this.placeFrom(start),
      }
    }
    const update = UPDATES.find((word) => word === unit.name)
    if (update === undefined) throw this.unexpected(unit)
    this.rejections.update(update, args)
    return {
      type: "C4UpdateStatement",
      keyword: update,
      arguments: args,
      ...this.placeFrom(start),
    }
  }

  /** Boundaries: the opening brace has one of the two specified line placements. */
  private parseBoundary(
    start: number,
    keyword: C4BoundaryKeyword,
    args: C4Argument[],
  ): C4BoundaryStatement {
    const beforeBody = this.parseEmptyBlocks()
    const newline = this.takeIf("newline")
    if (newline !== null) appendItems(beforeBody, this.parseEmptyBlocks())
    this.addItem("Punctuator", [this.take("{")])
    if (newline === null) this.take("newline")
    else this.takeIf("newline")
    this.rejections.boundary(keyword, args)
    const body = this.parseStatements(true)
    this.addItem("Punctuator", [this.take("}")])
    return {
      type: "C4BoundaryStatement",
      keyword,
      arguments: args,
      beforeBody,
      body,
      ...this.placeFrom(start),
    }
  }

  /** Calls and arguments: a flat, nonempty list, with no entry for a lone comma. */
  private parseArguments(): C4Argument[] {
    const args: C4Argument[] = []
    const opening = this.takeIf("(,") ?? this.take("(")
    // The opening-comma form is one punctuator item, including its spaces.
    this.addItem("Punctuator", [opening])
    if (opening.name === "(,") args.push(null)
    while (this.peek() !== null && this.peek()?.name !== ")") {
      const unit = this.peek()!
      switch (unit.name) {
        case ",":
          this.advance()
          this.addItem("Punctuator", [unit])
          break
        case ",,":
          this.advance()
          this.addItem("Punctuator", [unit])
          args.push(null)
          break
        case "bare":
          this.advance()
          args.push(this.literalOf(unit))
          break
        case "empty-string":
        case "quote-open":
          args.push(this.parseString(false))
          break
        case "$":
          args.push(this.parseNamed())
          break
        default:
          throw this.unexpected(unit)
      }
    }
    if (args.length === 0) throw this.unexpected(this.peek())
    this.addItem("Punctuator", [this.take(")")])
    return args
  }

  /** Strings and named attributes: quoted arguments may be empty; named values must have content. */
  private parseString(named: boolean): StringLiteral {
    const empty = named ? null : this.takeIf("empty-string")
    const units: Unit[] = []
    let converted = ""
    if (empty !== null) units.push(empty)
    else {
      units.push(this.take("quote-open"))
      const text = named ? this.take("string-text") : this.takeIf("string-text")
      if (text !== null) {
        units.push(text)
        converted = text.text.trim()
      }
      units.push(this.take("quote-close"))
    }
    this.addItem("String", units)
    const place = this.placeOf(units)
    const [start, end] = place.range
    const node: StringLiteral = {
      type: "StringLiteral",
      value: this.textOf([start + 1, end - 1]),
      raw: this.lexer.text.slice(start, end),
      closed: true,
      ...place,
    }
    this.converted.set(node, converted)
    return node
  }

  /** `named`: $, an optional key, =, and a nonempty quoted value. */
  private parseNamed(): C4NamedAttribute {
    const start = this.next
    this.addItem("Punctuator", [this.take("$")])
    const key = this.takeIf("key")
    const literal = key === null ? null : this.literalOf(key)
    this.addItem("Punctuator", [this.take("=")])
    const value = this.parseString(true)
    return {
      type: "C4NamedAttribute",
      key: literal,
      value,
      ...this.placeFrom(start),
    }
  }

  /** Title and accessibility statements: the five written forms remain distinct. */
  private parseOther(): C4Statement {
    const start = this.next
    const unit = this.peek()
    if (unit === null) throw this.unexpected(unit)
    if (
      unit.name === "accDescr" &&
      this.nameAt(this.positionAfter(this.next)) === "{"
    ) {
      return this.parseDescriptionBlock()
    }
    if (unit.name === "title" || unit.name === "accDescription") {
      this.advance()
      this.addItem("Keyword", [unit])
      const value = this.literalOf(this.take("line-text"))
      if (value === null) throw this.unexpected(unit)
      return {
        type:
          unit.name === "title"
            ? "C4TitleStatement"
            : "C4AccDescriptionStatement",
        value,
        ...this.placeFrom(start),
      }
    }
    if (unit.name === "accTitle" || unit.name === "accDescr") {
      this.advance()
      this.addItem("Keyword", [unit])
      this.addItem("Punctuator", [this.take(":")])
      const value = this.literalOf(this.take("accessibility-text"))
      return {
        type:
          unit.name === "accTitle"
            ? "C4AccTitleStatement"
            : "C4AccDescrStatement",
        value,
        ...this.placeFrom(start),
      }
    }
    throw this.unexpected(unit)
  }

  /** `description-block` and `empty-block`: accDescr, {, optional text, }. */
  private parseDescriptionBlock(): C4AccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("description-block-text")
    const value = text === null ? null : this.literalOf(text)
    this.addItem("Punctuator", [this.take("}")])
    return { type: "C4AccDescrBlockStatement", value, ...this.placeFrom(start) }
  }

  /** ast/c4.md, C4Literal: written text of the token; a trimmed empty text makes no node. */
  private literalOf(unit: Unit): C4Literal | null {
    this.addItem("RawText", [unit])
    if (unit.significantRange === null) return null
    const place = this.placeOf([unit])
    const node: C4Literal = {
      type: "C4Literal",
      value: this.textOf(place.range),
      ...place,
    }
    this.converted.set(node, unit.text.trim())
    return node
  }
}
