import { appendItems } from "../../append-items.ts"
import type {
  RadarAccDescrBlockStatement,
  RadarAccDescrStatement,
  RadarAccTitleStatement,
  RadarAxis,
  RadarAxisStatement,
  RadarBodyItem,
  RadarCurve,
  RadarCurveStatement,
  RadarEntry,
  RadarIgnoredText,
  RadarLiteral,
  RadarNamedEntry,
  RadarNumberEntry,
  RadarOption,
  RadarOptionsStatement,
  RadarTitleStatement,
} from "../../ast/radar.ts"
import type { StringLiteral } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** Authored diagram fields and tokens before shared atomic-boundary checks. */
export interface RadarSyntax {
  readonly textBeforeHeader: readonly RadarIgnoredText[]
  readonly textBeforeColon: readonly RadarIgnoredText[]
  readonly body: readonly RadarBodyItem[]
  readonly tokens: readonly PendingToken[]
}

/** diagrams/radar.md, Grammar: recursive descent over the ordered lexical units. */
export class RadarGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram and header: retained forms before the header and an optional separate colon. */
  public parseDiagram(): RadarSyntax {
    const textBeforeHeader = this.parseHiddenForms(true)
    this.addItem("Keyword", [this.take("radar-beta")])
    const gap = this.parseHiddenForms()
    const colon = this.takeIf(":")
    if (colon !== null) this.addItem("Punctuator", [colon])
    const textBeforeColon = colon === null ? [] : gap
    const body: RadarBodyItem[] = colon === null ? [...gap] : []
    while (this.peek() !== null) {
      if (this.takeIf("newline") !== null) continue
      if (this.isHidden(this.peek())) body.push(this.parseIgnoredText())
      else body.push(this.parseStatement())
    }
    return {
      textBeforeHeader,
      textBeforeColon,
      body,
      tokens: this.tokensInOrder(),
    }
  }

  /** Empty labels/blocks are retained; indivisible cuts are checked by the shared recorder. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** Only common statements require visible EOL; other groups may be adjacent. */
  private parseStatement(): RadarBodyItem {
    switch (this.peek()?.name) {
      case "axis":
        return this.parseAxisStatement()
      case "curve":
        return this.parseCurveStatement()
      case "showLegend":
      case "ticks":
      case "max":
      case "min":
      case "graticule":
        return this.parseOptionsStatement()
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

  /** axis-statement = axis axis (comma axis)*. */
  private parseAxisStatement(): RadarAxisStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("axis")])
    const axes = [this.parseAxis()]
    while (this.parseComma()) axes.push(this.parseAxis())
    return { type: "RadarAxisStatement", axes, ...this.placeFrom(start) }
  }

  /** axis = id label?; hidden forms before an absent label become its suffix. */
  private parseAxis(): RadarAxis {
    const start = this.next
    const textBefore = this.parseHiddenForms()
    const name = this.identifierOf([this.take("id")])
    const gap = this.parseHiddenForms()
    const fields = this.parseLabel(gap)
    const textAfter = fields.label === null ? gap : this.parseHiddenForms()
    return {
      type: "RadarAxis",
      textBefore,
      name,
      ...fields,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** curve-statement = curve curve (comma curve)*. */
  private parseCurveStatement(): RadarCurveStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("curve")])
    const curves = [this.parseCurve()]
    while (this.parseComma()) curves.push(this.parseCurve())
    return { type: "RadarCurveStatement", curves, ...this.placeFrom(start) }
  }

  /** curve = id label? { entries }; keep every authored entry and hidden gap. */
  private parseCurve(): RadarCurve {
    const start = this.next
    const textBefore = this.parseHiddenForms()
    const name = this.identifierOf([this.take("id")])
    const gap = this.parseHiddenForms()
    const fields = this.parseLabel(gap)
    const textBeforeEntries =
      fields.label === null ? gap : this.parseHiddenForms()
    this.addItem("Punctuator", [this.take("{")])
    const entries = this.parseEntries()
    this.addItem("Punctuator", [this.take("}")])
    const textAfter = this.parseHiddenForms()
    return {
      type: "RadarCurve",
      textBefore,
      name,
      ...fields,
      textBeforeEntries,
      entries,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** Optional bracketed string, with three independent hidden-form gaps. */
  private parseLabel(gap: RadarIgnoredText[]): {
    readonly textBeforeLabel: readonly RadarIgnoredText[]
    readonly textBeforeLabelValue: readonly RadarIgnoredText[]
    readonly label: StringLiteral | null
    readonly textBeforeLabelClose: readonly RadarIgnoredText[]
  } {
    const open = this.takeIf("[")
    if (open === null)
      return {
        textBeforeLabel: [],
        textBeforeLabelValue: [],
        label: null,
        textBeforeLabelClose: [],
      }
    this.addItem("Punctuator", [open])
    const textBeforeLabelValue = this.parseHiddenForms()
    const label = this.closedStringLiteralOf(this.take("string"))
    const textBeforeLabelClose = this.parseHiddenForms()
    this.addItem("Punctuator", [this.take("]")])
    return {
      textBeforeLabel: gap,
      textBeforeLabelValue,
      label,
      textBeforeLabelClose,
    }
  }

  /** entries: homogeneous, nonempty; visible newlines precede entries or the closing brace only. */
  private parseEntries(): RadarEntry[] {
    const entries: RadarEntry[] = []
    let kind: "number" | "id" | null = null
    for (;;) {
      const start = this.next
      const textBefore = this.parseHiddenForms(true)
      kind ??= this.peek()?.name === "id" ? "id" : "number"
      const entry =
        kind === "id"
          ? this.parseNamedEntry(start, textBefore)
          : this.parseNumberEntry(start, textBefore)
      entries.push(entry)
      if (!this.parseComma()) return entries
    }
  }

  /** number-entry = number, with forms before the next comma or closing brace. */
  private parseNumberEntry(
    start: number,
    textBefore: RadarIgnoredText[],
  ): RadarNumberEntry {
    const value = this.numericLiteralOf(this.take("number"))
    const textAfter = this.parseEntrySuffix()
    return {
      type: "RadarNumberEntry",
      textBefore,
      value,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** named-entry = id colon? number; an absent colon has no owned gap. */
  private parseNamedEntry(
    start: number,
    textBefore: RadarIgnoredText[],
  ): RadarNamedEntry {
    const axis = this.identifierOf([this.take("id")])
    const gap = this.parseHiddenForms()
    const colon = this.takeIf(":")
    if (colon !== null) this.addItem("Punctuator", [colon])
    const textBeforeColon = colon === null ? [] : gap
    const textBeforeValue = colon === null ? gap : this.parseHiddenForms()
    const value = this.numericLiteralOf(this.take("number"))
    const textAfter = this.parseEntrySuffix()
    return {
      type: "RadarNamedEntry",
      textBefore,
      axis,
      textBeforeColon,
      textBeforeValue,
      value,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** Trailing entry newlines may precede only the closing brace, retaining forms across them. */
  private parseEntrySuffix(): RadarIgnoredText[] {
    const forms = this.parseHiddenForms()
    if (this.peek()?.name === "newline") {
      appendItems(forms, this.parseHiddenForms(true))
      if (this.peek()?.name !== "}") throw this.unexpected(this.peek())
    }
    return forms
  }

  /** options-statement = option (comma option)*; adjacency without a comma starts a new group. */
  private parseOptionsStatement(): RadarOptionsStatement {
    const start = this.next
    const options = [this.parseOption()]
    while (this.parseComma()) options.push(this.parseOption())
    return { type: "RadarOptionsStatement", options, ...this.placeFrom(start) }
  }

  /** The five option productions keep numeric leaves and fixed written string values. */
  private parseOption(): RadarOption {
    const start = this.next
    const textBefore = this.parseHiddenForms()
    const keyword = this.peek()
    if (
      keyword === null ||
      !["showLegend", "ticks", "max", "min", "graticule"].includes(keyword.name)
    )
      throw this.unexpected(keyword)
    this.advance()
    this.addItem("Keyword", [keyword])
    const textBeforeValue = this.parseHiddenForms()
    if (keyword.name === "showLegend" || keyword.name === "graticule") {
      const unit = this.take(
        keyword.name === "showLegend" ? "boolean-value" : "graticule-value",
      )
      this.addItem("Keyword", [unit])
      const textAfter = this.parseHiddenForms()
      return {
        type:
          keyword.name === "showLegend"
            ? "RadarShowLegendOption"
            : "RadarGraticuleOption",
        textBefore,
        textBeforeValue,
        value: this.textOfUnit(unit),
        textAfter,
        ...this.placeFrom(start),
      }
    }
    const value = this.numericLiteralOf(this.take("number"))
    const textAfter = this.parseHiddenForms()
    return {
      type:
        keyword.name === "ticks"
          ? "RadarTicksOption"
          : keyword.name === "max"
            ? "RadarMaxOption"
            : "RadarMinOption",
      textBefore,
      textBeforeValue,
      value,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** Commas are punctuation owned by the written group or entry list. */
  private parseComma(): boolean {
    const comma = this.takeIf(",")
    if (comma === null) return false
    this.addItem("Punctuator", [comma])
    return true
  }

  /** Composite common forms require EOL/EOF after their retained suffixes. */
  private parseCommonStatement(
    keyword: "title" | "accTitle" | "accDescr",
  ):
    | RadarTitleStatement
    | RadarAccTitleStatement
    | RadarAccDescrStatement
    | RadarAccDescrBlockStatement {
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
    if (this.peek() !== null) this.take("newline")
    this.takeAll("newline")
    return {
      type: block
        ? "RadarAccDescrBlockStatement"
        : keyword === "title"
          ? "RadarTitleStatement"
          : keyword === "accTitle"
            ? "RadarAccTitleStatement"
            : "RadarAccDescrStatement",
      value,
      textAfter,
      ...place,
    }
  }

  /** RadarLiteral: line padding remains owned; block units trim outer common whitespace. */
  private literalOf(unit: Unit): RadarLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "RadarLiteral", value: this.textOf(place.range), ...place }
  }

  /** Only native YAML and native DIRECTIVE forms are retained gap elements. */
  private isHidden(unit: Unit | null): boolean {
    return unit?.name === "yaml-block" || unit?.name === "directive"
  }

  /** Read forms in source order, crossing visible newlines only in grammar positions that allow them. */
  private parseHiddenForms(newlines = false): RadarIgnoredText[] {
    const forms: RadarIgnoredText[] = []
    for (;;) {
      if (this.isHidden(this.peek())) forms.push(this.parseIgnoredText())
      else if (newlines && this.takeIf("newline") !== null) continue
      else return forms
    }
  }

  /** RadarIgnoredText: authored fenced form, excluding its consumed following LF. */
  private parseIgnoredText(): RadarIgnoredText {
    const unit = this.peek()
    if (unit?.name !== "yaml-block" && unit?.name !== "directive")
      throw this.unexpected(unit)
    this.advance()
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "RadarIgnoredText",
      kind: unit.name,
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }
}
