import type {
  ArchitectureAccDescrBlockStatement,
  ArchitectureAccDescrStatement,
  ArchitectureAccTitleStatement,
  ArchitectureAlignmentStatement,
  ArchitectureAlignmentMember,
  ArchitectureArrow,
  ArchitectureBodyItem,
  ArchitectureEdgeStatement,
  ArchitectureGroupStatement,
  ArchitectureServiceStatement,
  ArchitectureJunctionStatement,
  ArchitectureIgnoredText,
  ArchitectureLabel,
  ArchitectureLiteral,
  ArchitectureTitleStatement,
} from "../../ast/architecture.ts"
import type { Identifier } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** Written fields and tokens before shared atomic-boundary and semantic checks. */
export interface ArchitectureSyntax {
  readonly textBeforeHeader: readonly ArchitectureIgnoredText[]
  readonly body: readonly ArchitectureBodyItem[]
  readonly tokens: readonly PendingToken[]
}

/** diagrams/architecture.md, Grammar: recursive descent over complete lexical components. */
export class ArchitectureGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram = newline* header (statement | newline)* EOF, retaining every hidden form. */
  public parseDiagram(): ArchitectureSyntax {
    const textBeforeHeader: ArchitectureIgnoredText[] = []
    while (this.peek()?.name === "newline" || this.isHidden(this.peek())) {
      if (this.takeIf("newline") === null)
        textBeforeHeader.push(this.parseIgnoredText())
    }
    this.addItem("Keyword", [this.take("architecture-beta")])
    const body: ArchitectureBodyItem[] = []
    while (this.peek() !== null) {
      if (this.takeIf("newline") !== null) continue
      if (this.isHidden(this.peek())) body.push(this.parseIgnoredText())
      else {
        body.push(this.parseStatement())
        this.parseEol()
      }
    }
    return { textBeforeHeader, body, tokens: this.tokensInOrder() }
  }

  /** Architecture retains empty text/common values; shared token recording checks indivisible cuts. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** statement alternatives are selected by their first complete component. */
  private parseStatement(): ArchitectureBodyItem {
    const unit = this.peek()
    switch (unit?.name) {
      case "group":
        return this.parseGroup()
      case "service":
        return this.parseService()
      case "junction":
        return this.parseJunction()
      case "id":
        return this.parseEdge()
      case "align":
        return this.parseAlignment()
      case "title":
        return this.parseCommonStatement("title")
      case "accTitle":
        return this.parseCommonStatement("accTitle")
      case "accDescr":
        return this.parseCommonStatement("accDescr")
      default:
        throw this.unexpected(unit)
    }
  }

  /** group = group id icon? label? parent?; absent optional fields own no gaps. */
  private parseGroup(): ArchitectureGroupStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("group")])
    const textBeforeId = this.parseHiddenForms()
    const id = this.identifierOf([this.take("id")])
    const gap = this.parseHiddenForms()
    const icon = this.peek()?.name === "(" ? this.parseIcon() : null
    const fields = this.parseDeclarationTail(
      icon === null ? gap : this.parseHiddenForms(),
    )
    return {
      type: "ArchitectureGroupStatement",
      textBeforeId,
      id,
      textBeforeIcon: icon === null ? [] : gap,
      icon,
      ...fields,
      ...this.placeFrom(start),
    }
  }

  /** service = service id (string | icon)? label? parent?. */
  private parseService(): ArchitectureServiceStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("service")])
    const textBeforeId = this.parseHiddenForms()
    const id = this.identifierOf([this.take("id")])
    const gap = this.parseHiddenForms()
    const icon =
      this.peek()?.name === "("
        ? this.parseIcon()
        : this.peek()?.name === "string"
          ? this.closedStringLiteralOf(this.take("string"))
          : null
    const fields = this.parseDeclarationTail(
      icon === null ? gap : this.parseHiddenForms(),
    )
    return {
      type: "ArchitectureServiceStatement",
      textBeforeId,
      id,
      textBeforeIcon: icon === null ? [] : gap,
      icon,
      ...fields,
      ...this.placeFrom(start),
    }
  }

  /** Shared ordered label and parent suffix after an optional declaration icon. */
  private parseDeclarationTail(before: ArchitectureIgnoredText[]): {
    readonly textBeforeTitle: readonly ArchitectureIgnoredText[]
    readonly title: ArchitectureLabel | null
    readonly textBeforeIn: readonly ArchitectureIgnoredText[]
    readonly textBeforeParent: readonly ArchitectureIgnoredText[]
    readonly in: Identifier | null
    readonly textAfter: readonly ArchitectureIgnoredText[]
  } {
    let gap = before
    let title: ArchitectureLabel | null = null
    let textBeforeTitle: ArchitectureIgnoredText[] = []
    if (this.peek()?.name === "[") {
      textBeforeTitle = gap
      title = this.parseLabel()
      gap = this.parseHiddenForms()
    }
    return {
      textBeforeTitle,
      title,
      ...this.parseParent(gap),
    }
  }

  /** junction = junction id parent?. */
  private parseJunction(): ArchitectureJunctionStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("junction")])
    const textBeforeId = this.parseHiddenForms()
    const id = this.identifierOf([this.take("id")])
    const fields = this.parseParent(this.parseHiddenForms())
    return {
      type: "ArchitectureJunctionStatement",
      textBeforeId,
      id,
      ...fields,
      ...this.placeFrom(start),
    }
  }

  /** parent = in id; a gap before absent in belongs to the statement suffix. */
  private parseParent(gap: ArchitectureIgnoredText[]): {
    readonly textBeforeIn: readonly ArchitectureIgnoredText[]
    readonly textBeforeParent: readonly ArchitectureIgnoredText[]
    readonly in: Identifier | null
    readonly textAfter: readonly ArchitectureIgnoredText[]
  } {
    const keyword = this.takeIf("in")
    if (keyword === null)
      return {
        textBeforeIn: [],
        textBeforeParent: [],
        in: null,
        textAfter: gap,
      }
    this.addItem("Keyword", [keyword])
    const textBeforeParent = this.parseHiddenForms()
    const parent = this.identifierOf([this.take("id")])
    return {
      textBeforeIn: gap,
      textBeforeParent,
      in: parent,
      textAfter: this.parseHiddenForms(),
    }
  }

  /** icon = ( icon-name ); delimiters remain outside its Identifier. */
  private parseIcon(): Identifier {
    this.addItem("Punctuator", [this.take("(")])
    const icon = this.identifierOf([this.take("icon-name")])
    this.addItem("Punctuator", [this.take(")")])
    return icon
  }

  /** label = [ (label-string | label-text) ]; the lexer has already chosen kind. */
  private parseLabel(): ArchitectureLabel {
    const start = this.next
    this.addItem("Punctuator", [this.take("[")])
    const string = this.takeIf("label-string")
    const content = string ?? this.take("label-text")
    this.addItem(string === null ? "RawText" : "String", [content])
    const valueRange = this.placeOf([content]).range
    const value = this.textOf(
      string === null ? valueRange : [valueRange[0] + 1, valueRange[1] - 1],
    )
    this.addItem("Punctuator", [this.take("]")])
    return {
      type: "ArchitectureLabel",
      kind: string === null ? "text" : "string",
      value,
      ...this.placeFrom(start),
    }
  }

  /** group-modifier = { group }; its interior is an indivisible word. */
  private parseGroupModifier(): boolean {
    const open = this.takeIf("{")
    if (open === null) return false
    this.addItem("Punctuator", [open])
    this.addItem("Keyword", [this.take("group")])
    this.addItem("Punctuator", [this.take("}")])
    return true
  }

  /** edge = id group-modifier? arrow id group-modifier?. */
  private parseEdge(): ArchitectureEdgeStatement {
    const start = this.next
    const lhsId = this.identifierOf([this.take("id")])
    let gap = this.parseHiddenForms()
    const lhsGroup = this.parseGroupModifier()
    const textBeforeLhsGroup = lhsGroup ? gap : []
    if (lhsGroup) gap = this.parseHiddenForms()
    const textBeforeArrow = gap
    const arrow = this.parseArrow()
    const textBeforeRhsId = this.parseHiddenForms()
    const rhsId = this.identifierOf([this.take("id")])
    gap = this.parseHiddenForms()
    const rhsGroup = this.parseGroupModifier()
    const textBeforeRhsGroup = rhsGroup ? gap : []
    const textAfter = rhsGroup ? this.parseHiddenForms() : gap
    return {
      type: "ArchitectureEdgeStatement",
      lhsId,
      textBeforeLhsGroup,
      lhsGroup,
      textBeforeArrow,
      arrow,
      textBeforeRhsId,
      rhsId,
      textBeforeRhsGroup,
      rhsGroup,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** arrow = : direction marker? line marker? direction :; line = -- | - label -. */
  private parseArrow(): ArchitectureArrow {
    const start = this.next
    this.addItem("Punctuator", [this.take(":")])
    const textBeforeStartDirection = this.parseHiddenForms()
    const startDirection = this.parseDirection()
    let gap = this.parseHiddenForms()
    const startMarker = this.parseMarker()
    const textBeforeStartMarker = startMarker === "arrow" ? gap : []
    if (startMarker === "arrow") gap = this.parseHiddenForms()
    const textBeforeLine = gap
    const doubleDash = this.takeIf("--")
    let textBeforeTitle: ArchitectureIgnoredText[] = []
    let title: ArchitectureLabel | null = null
    let textBeforeEndDash: ArchitectureIgnoredText[] = []
    if (doubleDash !== null) this.addItem("Punctuator", [doubleDash])
    else {
      this.addItem("Punctuator", [this.take("-")])
      textBeforeTitle = this.parseHiddenForms()
      title = this.parseLabel()
      textBeforeEndDash = this.parseHiddenForms()
      this.addItem("Punctuator", [this.take("-")])
    }
    gap = this.parseHiddenForms()
    const endMarker = this.parseMarker()
    const textBeforeEndMarker = endMarker === "arrow" ? gap : []
    if (endMarker === "arrow") gap = this.parseHiddenForms()
    const textBeforeEndDirection = gap
    const endDirection = this.parseDirection()
    const textBeforeEndColon = this.parseHiddenForms()
    this.addItem("Punctuator", [this.take(":")])
    const place = this.placeFrom(start)
    return {
      type: "ArchitectureArrow",
      value: this.textOf(place.range),
      textBeforeStartDirection,
      startDirection,
      textBeforeStartMarker,
      startMarker,
      textBeforeLine,
      line: "solid",
      textBeforeTitle,
      title,
      textBeforeEndDash,
      textBeforeEndMarker,
      endMarker,
      textBeforeEndDirection,
      endDirection,
      textBeforeEndColon,
      ...place,
    }
  }

  /** A port direction is one fixed written L/R/T/B. */
  private parseDirection(): ArchitectureArrow["startDirection"] {
    const direction = this.take("port-direction")
    this.addItem("Keyword", [direction])
    return direction.text as ArchitectureArrow["startDirection"]
  }

  /** Optional arrow-marker; reversed spellings keep the same presence field. */
  private parseMarker(): "arrow" | "none" {
    const marker = this.takeIf("arrow-marker")
    if (marker === null) return "none"
    this.addItem("Punctuator", [marker])
    return "arrow"
  }

  /** alignment = align (row | column) id id+; each member owns its entire preceding hidden gap. */
  private parseAlignment(): ArchitectureAlignmentStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("align")])
    const textBeforeDirection = this.parseHiddenForms()
    const direction = this.takeIf("row") ?? this.take("column")
    this.addItem("Keyword", [direction])
    const members: ArchitectureAlignmentMember[] = []
    for (let member = 0; member < 2; member += 1)
      members.push(this.parseAlignmentMember())
    let gapStart = this.next
    let gap = this.parseHiddenForms()
    while (this.peek()?.name === "id") {
      members.push(this.parseAlignmentMember(gap, gapStart))
      gapStart = this.next
      gap = this.parseHiddenForms()
    }
    return {
      type: "ArchitectureAlignmentStatement",
      textBeforeDirection,
      direction: direction.name as "row" | "column",
      members,
      textAfter: gap,
      ...this.placeFrom(start),
    }
  }

  /** Alignment member: retained forms followed by one required ID. */
  private parseAlignmentMember(
    gap?: ArchitectureIgnoredText[],
    start = this.next,
  ): ArchitectureAlignmentMember {
    const textBeforeId = gap ?? this.parseHiddenForms()
    const id = this.identifierOf([this.take("id")])
    return {
      type: "ArchitectureAlignmentMember",
      textBeforeId,
      id,
      ...this.placeFrom(start),
    }
  }

  /** Common-statement productions: composite line forms or a closed description block, then EOL. */
  private parseCommonStatement(
    keyword: "title" | "accTitle" | "accDescr",
  ):
    | ArchitectureTitleStatement
    | ArchitectureAccTitleStatement
    | ArchitectureAccDescrStatement
    | ArchitectureAccDescrBlockStatement {
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
    return {
      type: block
        ? "ArchitectureAccDescrBlockStatement"
        : keyword === "title"
          ? "ArchitectureTitleStatement"
          : keyword === "accTitle"
            ? "ArchitectureAccTitleStatement"
            : "ArchitectureAccDescrStatement",
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

  /** ast/architecture.md, ArchitectureLiteral: line units keep padding; block units trim common whitespace. */
  private literalOf(unit: Unit): ArchitectureLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "ArchitectureLiteral",
      value: this.textOf(place.range),
      ...place,
    }
  }

  /** Hidden forms may occupy only the gaps and body positions named by ast/architecture.md. */
  private isHidden(unit: Unit | null): boolean {
    return unit?.name === "yaml-block" || unit?.name === "directive"
  }

  /** Each separately recognized form is one leaf in source order. */
  private parseHiddenForms(): ArchitectureIgnoredText[] {
    const forms: ArchitectureIgnoredText[] = []
    while (this.isHidden(this.peek())) forms.push(this.parseIgnoredText())
    return forms
  }

  /** ast/architecture.md, ArchitectureIgnoredText: RawText from opener to closer, excluding its consumed LF. */
  private parseIgnoredText(): ArchitectureIgnoredText {
    const unit = this.peek()
    if (unit?.name !== "yaml-block" && unit?.name !== "directive")
      throw this.unexpected(unit)
    this.advance()
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "ArchitectureIgnoredText",
      kind: unit.name,
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }
}
