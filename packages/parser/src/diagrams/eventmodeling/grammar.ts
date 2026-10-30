import type {
  EventmodelingBodyItem,
  EventmodelingIgnoredText,
  EventmodelingTimeFrameStatement,
  EventmodelingResetFrameStatement,
  EventmodelingQualifiedName,
  EventmodelingQualifiedNamePart,
  EventmodelingSourceReference,
  EventmodelingArrow,
  EventmodelingDataReference,
  EventmodelingInlineData,
  EventmodelingDataBlock,
  EventmodelingModelEntityStatement,
  EventmodelingDataEntityStatement,
  EventmodelingNoteStatement,
  EventmodelingGwtStatement,
  EventmodelingGwtClause,
  EventmodelingGwtItem,
  EventmodelingTitleStatement,
  EventmodelingAccTitleStatement,
  EventmodelingAccDescrStatement,
  EventmodelingAccDescrBlockStatement,
  EventmodelingLiteral,
} from "../../ast/eventmodeling.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** entity-type: exact written aliases, without normalization. */
const ENTITY_TYPES: readonly UnitName[] = [
  "rmo",
  "readmodel",
  "ui",
  "cmd",
  "command",
  "evt",
  "event",
  "pcr",
  "processor",
]

/** data-type: a tag selects a word, never a payload validator. */
const DATA_TYPES: readonly UnitName[] = [
  "json",
  "jsobj",
  "figma",
  "salt",
  "uri",
  "md",
  "html",
  "text",
]

/** Authored fields and pending tokens, before shared atomic-boundary checks. */
export interface EventmodelingSyntax {
  readonly textBeforeHeader: readonly EventmodelingIgnoredText[]
  readonly body: readonly EventmodelingBodyItem[]
  readonly tokens: readonly PendingToken[]
}

/** diagrams/eventmodeling.md, Grammar: complete consumption, without linking or validation. */
export class EventmodelingGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram = hidden* eventmodeling body-item* end-of-text; there is no EOL. */
  public parseDiagram(): EventmodelingSyntax {
    const textBeforeHeader = this.parseHiddenForms()
    this.parseKeyword("eventmodeling")
    const body: EventmodelingBodyItem[] = []
    while (this.peek() !== null) body.push(this.parseBodyItem())
    return { textBeforeHeader, body, tokens: this.tokensInOrder() }
  }

  /** Empty payloads have nodes; shared recording handles indivisible atomic cuts. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** body-item: dispatch only complete top-level productions. */
  private parseBodyItem(): EventmodelingBodyItem {
    switch (this.peek()?.name) {
      case "tf":
      case "timeframe":
      case "rf":
      case "resetframe":
        return this.parseFrame()
      case "entity":
        return this.parseModelEntity()
      case "data":
        return this.parseDataEntity()
      case "note":
        return this.parseNote()
      case "gwt":
        return this.parseGwt()
      case "title":
        return this.parseCommonStatement("title")
      case "accTitle":
        return this.parseCommonStatement("accTitle")
      case "accDescr":
        return this.parseCommonStatement("accDescr")
      case "yaml-block":
      case "directive":
        return this.parseIgnoredText()
      default:
        throw this.unexpected(this.peek())
    }
  }

  /** time-frame / reset-frame: each optional component owns its preceding hidden forms. */
  private parseFrame():
    EventmodelingTimeFrameStatement | EventmodelingResetFrameStatement {
    const start = this.next
    const keyword = this.peek()!
    this.parseKeyword(keyword.name)
    const textBeforeName = this.parseHiddenForms()
    const name = this.identifierOf([this.take("frame-name")])
    const textBeforeModelEntityType = this.parseHiddenForms()
    const modelEntityType = this.parseChoice(ENTITY_TYPES)
    const textBeforeEntityIdentifier = this.parseHiddenForms()
    const entityIdentifier = this.parseQualifiedName()
    const sourceFrames: EventmodelingSourceReference[] = []
    while (this.nextVisibleName() === "->>")
      sourceFrames.push(this.parseSource())
    const dataReference =
      this.nextVisibleName() === "[[" ? this.parseDataReference() : null
    const next = this.nextVisibleName()
    const data =
      next === "`" || next === "inline-open" || next === "inline-string"
        ? this.parseData("inline")
        : null
    return {
      type:
        keyword.name === "tf" || keyword.name === "timeframe"
          ? "EventmodelingTimeFrameStatement"
          : "EventmodelingResetFrameStatement",
      textBeforeName,
      name,
      textBeforeModelEntityType,
      modelEntityType,
      textBeforeEntityIdentifier,
      entityIdentifier,
      sourceFrames,
      dataReference,
      data,
      ...this.placeFrom(start),
    }
  }

  /** qualified-name = identifier (hidden* dot hidden* identifier)*. */
  private parseQualifiedName(): EventmodelingQualifiedName {
    const start = this.next
    const head = this.identifierOf([this.take("id")])
    const tail: EventmodelingQualifiedNamePart[] = []
    while (this.nextVisibleName() === ".") {
      const memberStart = this.next
      const textBeforeDot = this.parseHiddenForms()
      this.parsePunctuation(".")
      const textBeforeName = this.parseHiddenForms()
      const name = this.identifierOf([this.take("id")])
      tail.push({
        type: "EventmodelingQualifiedNamePart",
        textBeforeDot,
        textBeforeName,
        name,
        ...this.placeFrom(memberStart),
      })
    }
    return {
      type: "EventmodelingQualifiedName",
      head,
      tail,
      ...this.placeFrom(start),
    }
  }

  /** source = ->> frame-name, preserving every occurrence and its own arrow. */
  private parseSource(): EventmodelingSourceReference {
    const start = this.next
    const textBefore = this.parseHiddenForms()
    const unit = this.take("->>")
    this.addItem("Punctuator", [unit])
    const arrow: EventmodelingArrow = {
      type: "EventmodelingArrow",
      value: "->>",
      startMarker: "none",
      line: "solid",
      endMarker: "arrow",
      ...this.placeOf([unit]),
    }
    const textBeforeFrame = this.parseHiddenForms()
    const frame = this.identifierOf([this.take("frame-name")])
    return {
      type: "EventmodelingSourceReference",
      textBefore,
      arrow,
      textBeforeFrame,
      frame,
      ...this.placeFrom(start),
    }
  }

  /** data-reference = [[ identifier ]], with independent authored delimiters and gaps. */
  private parseDataReference(): EventmodelingDataReference {
    const start = this.next
    const textBefore = this.parseHiddenForms()
    this.parsePunctuation("[[")
    const textBeforeName = this.parseHiddenForms()
    const name = this.identifierOf([this.take("id")])
    const textBeforeClose = this.parseHiddenForms()
    this.parsePunctuation("]]")
    return {
      type: "EventmodelingDataReference",
      textBefore,
      textBeforeName,
      name,
      textBeforeClose,
      ...this.placeFrom(start),
    }
  }

  private parseData(kind: "inline"): EventmodelingInlineData

  private parseData(kind: "block"): EventmodelingDataBlock

  /** inline-value / block-value: optional type-tag, then the required lexical body kind. */
  private parseData(
    kind: "inline" | "block",
  ): EventmodelingInlineData | EventmodelingDataBlock {
    const start = this.next
    const textBefore = this.parseHiddenForms()
    let dataType: string | null = null
    let textBeforeDataType: EventmodelingIgnoredText[] = []
    let textBeforeTypeClose: EventmodelingIgnoredText[] = []
    let textBeforeValue: EventmodelingIgnoredText[] = []
    if (this.peek()?.name === "`") {
      this.parsePunctuation("`")
      textBeforeDataType = this.parseHiddenForms()
      dataType = this.parseChoice(DATA_TYPES)
      textBeforeTypeClose = this.parseHiddenForms()
      this.parsePunctuation("`")
      textBeforeValue = this.parseHiddenForms()
    }
    const fields = {
      textBefore,
      dataType,
      textBeforeDataType,
      textBeforeTypeClose,
      textBeforeValue,
    }
    if (kind === "block") {
      this.parsePunctuation("block-open")
      const value = this.literalOf(this.take("data-text"))
      this.parsePunctuation("block-close")
      return {
        type: "EventmodelingDataBlock",
        ...fields,
        value,
        ...this.placeFrom(start),
      }
    }
    let value: EventmodelingInlineData["value"]
    if (this.peek()?.name === "inline-string")
      value = this.closedStringLiteralOf(this.take("inline-string"))
    else {
      this.parsePunctuation("inline-open")
      const text = this.takeIf("inline-text")
      value = text === null ? null : this.literalOf(text)
      this.parsePunctuation("inline-close")
    }
    return {
      type: "EventmodelingInlineData",
      ...fields,
      value,
      ...this.placeFrom(start),
    }
  }

  /** model-entity = entity qualified-name, without declaration resolution. */
  private parseModelEntity(): EventmodelingModelEntityStatement {
    const start = this.next
    this.parseKeyword("entity")
    const textBeforeName = this.parseHiddenForms()
    const name = this.parseQualifiedName()
    return {
      type: "EventmodelingModelEntityStatement",
      textBeforeName,
      name,
      ...this.placeFrom(start),
    }
  }

  /** data-entity = data identifier block-value, retaining unused and duplicate declarations. */
  private parseDataEntity(): EventmodelingDataEntityStatement {
    const start = this.next
    this.parseKeyword("data")
    const textBeforeName = this.parseHiddenForms()
    const name = this.identifierOf([this.take("id")])
    const data = this.parseData("block")
    return {
      type: "EventmodelingDataEntityStatement",
      textBeforeName,
      name,
      data,
      ...this.placeFrom(start),
    }
  }

  /** note = note frame-name block-value, without linking its frame. */
  private parseNote(): EventmodelingNoteStatement {
    const start = this.next
    this.parseKeyword("note")
    const textBeforeSourceFrame = this.parseHiddenForms()
    const sourceFrame = this.identifierOf([this.take("frame-name")])
    const data = this.parseData("block")
    return {
      type: "EventmodelingNoteStatement",
      textBeforeSourceFrame,
      sourceFrame,
      data,
      ...this.placeFrom(start),
    }
  }

  /** gwt = gwt frame-name given-clause when-clause? then-clause. */
  private parseGwt(): EventmodelingGwtStatement {
    const start = this.next
    this.parseKeyword("gwt")
    const textBeforeSourceFrame = this.parseHiddenForms()
    const sourceFrame = this.identifierOf([this.take("frame-name")])
    const given = this.parseGwtClause("given")
    const when =
      this.nextVisibleName() === "when" ? this.parseGwtClause("when") : null
    const then = this.parseGwtClause("then")
    return {
      type: "EventmodelingGwtStatement",
      textBeforeSourceFrame,
      sourceFrame,
      given,
      when,
      then,
      ...this.placeFrom(start),
    }
  }

  /** Each clause requires at least one item; leading forms belong to the following clause/item. */
  private parseGwtClause(
    kind: "given" | "when" | "then",
  ): EventmodelingGwtClause {
    const start = this.next
    const textBefore = this.parseHiddenForms()
    this.parseKeyword(kind)
    const body = [this.parseGwtItem()]
    for (;;) {
      const name = this.nextVisibleName()
      if (name === null || !ENTITY_TYPES.includes(name)) break
      body.push(this.parseGwtItem())
    }
    return {
      type: "EventmodelingGwtClause",
      textBefore,
      kind,
      body,
      ...this.placeFrom(start),
    }
  }

  /** gwt-item = entity-type identifier, preserving the written unassigned type word. */
  private parseGwtItem(): EventmodelingGwtItem {
    const start = this.next
    const textBefore = this.parseHiddenForms()
    const modelEntityType = this.parseChoice(ENTITY_TYPES)
    const textBeforeEntityIdentifier = this.parseHiddenForms()
    const entityIdentifier = this.identifierOf([this.take("id")])
    return {
      type: "EventmodelingGwtItem",
      textBefore,
      modelEntityType,
      textBeforeEntityIdentifier,
      entityIdentifier,
      ...this.placeFrom(start),
    }
  }

  /** Common statements have authored payloads, no common-converter trimming and no following EOL. */
  private parseCommonStatement(
    keyword: "title" | "accTitle" | "accDescr",
  ):
    | EventmodelingTitleStatement
    | EventmodelingAccTitleStatement
    | EventmodelingAccDescrStatement
    | EventmodelingAccDescrBlockStatement {
    const start = this.next
    this.parseKeyword(keyword)
    const block = keyword === "accDescr" && this.peek()?.name === "{"
    if (keyword !== "title") this.parsePunctuation(block ? "{" : ":")
    const text = this.takeIf(block ? "block-text" : "line-text")
    const value = text === null ? null : this.literalOf(text)
    if (block) this.parsePunctuation("}")
    return {
      type: block
        ? "EventmodelingAccDescrBlockStatement"
        : keyword === "title"
          ? "EventmodelingTitleStatement"
          : keyword === "accTitle"
            ? "EventmodelingAccTitleStatement"
            : "EventmodelingAccDescrStatement",
      value,
      ...this.placeFrom(start),
    }
  }

  /** Literal: the complete source-preserving payload, including owned padding and line endings. */
  private literalOf(unit: Unit): EventmodelingLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "EventmodelingLiteral",
      value: this.textOf(place.range),
      ...place,
    }
  }

  /** Fixed words and their written choices are separate indivisible Keyword items. */
  private parseKeyword(name: UnitName): string {
    const unit = this.take(name)
    this.addItem("Keyword", [unit])
    return this.textOfUnit(unit)
  }

  /** An entity/data type must be one of the grammar's exact keyword alternatives. */
  private parseChoice(names: readonly UnitName[]): string {
    const unit = this.peek()
    if (unit === null || !names.includes(unit.name)) throw this.unexpected(unit)
    return this.parseKeyword(unit.name)
  }

  /** Each authored punctuation component gets its own indivisible item. */
  private parsePunctuation(name: UnitName): void {
    this.addItem("Punctuator", [this.take(name)])
  }

  /** Look past hidden forms without consuming them before an optional component exists. */
  private nextVisibleName(): UnitName | null {
    return this.nameAt(
      this.afterUnitsNamed(this.next, ["yaml-block", "directive"]),
    )
  }

  /** Named gaps contain only whole native ignored forms, in source order. */
  private parseHiddenForms(): EventmodelingIgnoredText[] {
    const forms: EventmodelingIgnoredText[] = []
    while (
      this.peek()?.name === "yaml-block" ||
      this.peek()?.name === "directive"
    )
      forms.push(this.parseIgnoredText())
    return forms
  }

  /** IgnoredText: native delimiters are text; a consumed following LF lies outside. */
  private parseIgnoredText(): EventmodelingIgnoredText {
    const unit = this.peek()
    if (unit?.name !== "yaml-block" && unit?.name !== "directive")
      throw this.unexpected(unit)
    this.advance()
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "EventmodelingIgnoredText",
      kind: unit.name,
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }
}
