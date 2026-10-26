import type {
  WardleyAccDescrBlockStatement,
  WardleyAccDescrStatement,
  WardleyAccTitleStatement,
  WardleyAcceleratorStatement,
  WardleyAnchorStatement,
  WardleyAnnotationStatement,
  WardleyAnnotationsStatement,
  WardleyArrow,
  WardleyBodyItem,
  WardleyComponentStatement,
  WardleyCoordinates,
  WardleyDeacceleratorStatement,
  WardleyDecoration,
  WardleyEvolutionStage,
  WardleyEvolutionStatement,
  WardleyEvolveStatement,
  WardleyIdentifier,
  WardleyIgnoredText,
  WardleyInertiaDecoration,
  WardleyLabelOffsetDecoration,
  WardleyLinkStatement,
  WardleyLiteral,
  WardleyNoteStatement,
  WardleyParenthesizedInertiaDecoration,
  WardleyPipelineBodyItem,
  WardleyPipelineComponent,
  WardleyPipelineStatement,
  WardleySizeStatement,
  WardleySourceStrategyDecoration,
  WardleyTitleStatement,
} from "../../ast/wardley.ts"
import type { NumericLiteral, StringLiteral } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { decodeStringEscapes } from "../../string-escapes.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** Semantic names use lexical conversions without changing source-preserving leaves. */
export type WardleyComparisonNames = ReadonlyMap<
  WardleyIdentifier | StringLiteral,
  string
>

/** Complete authored syntax and tokens before shared atomic and semantic checks. */
export interface WardleySyntax {
  readonly textBeforeHeader: readonly WardleyIgnoredText[]
  readonly body: readonly WardleyBodyItem[]
  readonly tokens: readonly PendingToken[]
  readonly comparisonNames: WardleyComparisonNames
}

/** diagrams/wardley.md, Grammar: recursive descent over first-match units. */
export class WardleyGrammar extends UnitGrammar<UnitName, Unit> {
  private readonly comparisonNames = new Map<
    WardleyIdentifier | StringLiteral,
    string
  >()

  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram: retained prefixes, exact header, then source-ordered statements and hidden forms. */
  public parseDiagram(): WardleySyntax {
    const textBeforeHeader = this.parseHiddenForms(true)
    this.keyword("wardley-beta")
    const body: WardleyBodyItem[] = []
    while (this.peek() !== null) {
      if (this.takeIf("newline") !== null) continue
      if (this.isHidden(this.peek())) body.push(this.parseIgnoredText())
      else {
        body.push(this.parseStatement())
        this.parseEol()
      }
    }
    return {
      textBeforeHeader,
      body,
      tokens: this.tokensInOrder(),
      comparisonNames: this.comparisonNames,
    }
  }

  /** Empty strings/blocks remain authored syntax; shared token recording checks indivisible cuts. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** statement and common-statement dispatch; every statement ends before its visible EOL. */
  private parseStatement(): WardleyBodyItem {
    switch (this.peek()?.name) {
      case "anchor":
        return this.parseNamedPosition("anchor")
      case "component":
        return this.parseComponent()
      case "accelerator":
        return this.parseNamedPosition("accelerator")
      case "deaccelerator":
        return this.parseNamedPosition("deaccelerator")
      case "evolve":
        return this.parseEvolve()
      case "pipeline":
        return this.parsePipeline()
      case "note":
        return this.parseNote()
      case "annotations":
        return this.parseAnnotations()
      case "annotation":
        return this.parseAnnotation()
      case "evolution":
        return this.parseEvolution()
      case "size":
        return this.parseSize()
      case "title":
        return this.parseCommonStatement("title")
      case "accTitle":
        return this.parseCommonStatement("accTitle")
      case "accDescr":
        return this.parseCommonStatement("accDescr")
      default:
        return this.parseLink()
    }
  }

  /** anchor, accelerator and deaccelerator: required name and decimal coordinate pair. */
  private parseNamedPosition(
    keyword: "anchor" | "accelerator" | "deaccelerator",
  ):
    | WardleyAnchorStatement
    | WardleyAcceleratorStatement
    | WardleyDeacceleratorStatement {
    const start = this.next
    this.keyword(keyword)
    const textBeforeName = this.parseHiddenForms()
    const name = this.parseName()
    const textBeforeCoordinates = this.parseHiddenForms()
    const coordinates = this.parseCoordinates(false)
    const textAfter = this.parseHiddenForms()
    return {
      type:
        keyword === "anchor"
          ? "WardleyAnchorStatement"
          : keyword === "accelerator"
            ? "WardleyAcceleratorStatement"
            : "WardleyDeacceleratorStatement",
      textBeforeName,
      name,
      textBeforeCoordinates,
      coordinates,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** component: name, coordinates, then at most one label, strategy and inertia in that order. */
  private parseComponent(): WardleyComponentStatement {
    const start = this.next
    this.keyword("component")
    const textBeforeName = this.parseHiddenForms()
    const name = this.parseName()
    const textBeforeCoordinates = this.parseHiddenForms()
    const coordinates = this.parseCoordinates(false)
    const decorations: WardleyDecoration[] = []
    let gapStart = this.next
    let gap = this.parseHiddenForms()
    if (this.peek()?.name === "label") {
      decorations.push(this.parseLabelOffset(gapStart, gap))
      gapStart = this.next
      gap = this.parseHiddenForms()
    }
    if (this.peek()?.name === "(") {
      const decoration = this.parseParenthesizedDecoration(gapStart, gap)
      decorations.push(decoration)
      gapStart = this.next
      gap = this.parseHiddenForms()
    }
    if (decorations.at(-1)?.type !== "WardleyParenthesizedInertiaDecoration") {
      if (this.peek()?.name === "inertia") {
        decorations.push(this.parseInertia(gapStart, gap))
        gap = this.parseHiddenForms()
      } else if (this.peek()?.name === "(") {
        const decoration = this.parseParenthesizedDecoration(gapStart, gap)
        if (decoration.type !== "WardleyParenthesizedInertiaDecoration")
          throw this.unexpected(this.unitAt(gapStart))
        decorations.push(decoration)
        gap = this.parseHiddenForms()
      }
    }
    return {
      type: "WardleyComponentStatement",
      textBeforeName,
      name,
      textBeforeCoordinates,
      coordinates,
      decorations,
      textAfter: gap,
      ...this.placeFrom(start),
    }
  }

  /** coordinates and annotation-coordinates: brackets with the two authored values and all named gaps. */
  private parseCoordinates(integers: boolean): WardleyCoordinates {
    const start = this.next
    this.punctuation("[")
    const textBeforeVisibility = this.parseHiddenForms()
    const visibility = this.parseCoordinateValue(integers)
    const textBeforeComma = this.parseHiddenForms()
    this.punctuation(",")
    const textBeforeEvolution = this.parseHiddenForms()
    const evolution = this.parseCoordinateValue(integers)
    const textBeforeClose = this.parseHiddenForms()
    this.punctuation("]")
    return {
      type: "WardleyCoordinates",
      textBeforeVisibility,
      visibility,
      textBeforeComma,
      textBeforeEvolution,
      evolution,
      textBeforeClose,
      ...this.placeFrom(start),
    }
  }

  /** coordinate-value: decimals everywhere, integers additionally in annotation/box pairs. */
  private parseCoordinateValue(integers: boolean): NumericLiteral {
    return this.numericLiteralOf(
      this.take(
        integers && this.peek()?.name === "integer" ? "integer" : "decimal",
      ),
    )
  }

  /** label-offset: two unsigned integer magnitudes, with independent written minus flags. */
  private parseLabelOffset(
    start: number,
    textBefore: WardleyIgnoredText[],
  ): WardleyLabelOffsetDecoration {
    this.keyword("label")
    const textBeforeOpen = this.parseHiddenForms()
    this.punctuation("[")
    const textBeforeX = this.parseHiddenForms()
    const negativeX = this.optionalPunctuation("-")
    const textAfterXSign = negativeX ? this.parseHiddenForms() : []
    const offsetX = this.numericLiteralOf(this.take("integer"))
    const textBeforeComma = this.parseHiddenForms()
    this.punctuation(",")
    const textBeforeY = this.parseHiddenForms()
    const negativeY = this.optionalPunctuation("-")
    const textAfterYSign = negativeY ? this.parseHiddenForms() : []
    const offsetY = this.numericLiteralOf(this.take("integer"))
    const textBeforeClose = this.parseHiddenForms()
    this.punctuation("]")
    return {
      type: "WardleyLabelOffsetDecoration",
      textBefore,
      textBeforeOpen,
      textBeforeX,
      negativeX,
      textAfterXSign,
      offsetX,
      textBeforeComma,
      textBeforeY,
      negativeY,
      textAfterYSign,
      offsetY,
      textBeforeClose,
      ...this.placeFrom(start),
    }
  }

  /** source-strategy and parenthesized inertia have separate, explicitly owned interior gaps. */
  private parseParenthesizedDecoration(
    start: number,
    textBefore: WardleyIgnoredText[],
  ): WardleySourceStrategyDecoration | WardleyParenthesizedInertiaDecoration {
    this.punctuation("(")
    const gap = this.parseHiddenForms()
    if (this.peek()?.name === "inertia") {
      this.keyword("inertia")
      const textBeforeClose = this.parseHiddenForms()
      this.punctuation(")")
      return {
        type: "WardleyParenthesizedInertiaDecoration",
        textBefore,
        textBeforeInertia: gap,
        textBeforeClose,
        ...this.placeFrom(start),
      }
    }
    const strategy = this.take("strategy")
    this.addItem("Keyword", [strategy])
    const textBeforeClose = this.parseHiddenForms()
    this.punctuation(")")
    return {
      type: "WardleySourceStrategyDecoration",
      textBefore,
      textBeforeValue: gap,
      value: strategy.text,
      textBeforeClose,
      ...this.placeFrom(start),
    }
  }

  /** bare inertia: its preceding forms belong to this decoration; following forms belong to the component. */
  private parseInertia(
    start: number,
    textBefore: WardleyIgnoredText[],
  ): WardleyInertiaDecoration {
    this.keyword("inertia")
    return {
      type: "WardleyInertiaDecoration",
      textBefore,
      ...this.placeFrom(start),
    }
  }

  /** link: retain both optional ports and both label forms independently. */
  private parseLink(): WardleyLinkStatement {
    const start = this.next
    const from = this.parseName()
    let gap = this.parseHiddenForms()
    const fromPort = this.parsePort()
    const textBeforeFromPort = fromPort === null ? [] : gap
    if (fromPort !== null) gap = this.parseHiddenForms()
    const arrow = this.parseArrow()
    const textBeforeArrow = arrow === null ? [] : gap
    if (arrow !== null) gap = this.parseHiddenForms()
    const textBeforeTo = gap
    const to = this.parseName()
    gap = this.parseHiddenForms()
    const toPort = this.parsePort()
    const textBeforeToPort = toPort === null ? [] : gap
    if (toPort !== null) gap = this.parseHiddenForms()
    const hasLabel = this.optionalPunctuation("link-label-mark")
    const textBeforeLabel = hasLabel ? gap : []
    const label = hasLabel ? this.literalOf(this.take("link-label")) : null
    const textAfter = hasLabel ? [] : gap
    return {
      type: "WardleyLinkStatement",
      from,
      textBeforeFromPort,
      fromPort,
      textBeforeArrow,
      arrow,
      textBeforeTo,
      to,
      textBeforeToPort,
      toPort,
      textBeforeLabel,
      label,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** Whole port atoms supply only the direction actually written. */
  private parsePort(): string | null {
    const port = this.takeIf("port")
    if (port === null) return null
    this.addItem("Punctuator", [port])
    return port.text === "+<>"
      ? "bidirectional"
      : port.text === "+>"
        ? "forward"
        : "backward"
  }

  /** dependency-arrow/link-arrow: source glyph fields, without derived flow-label interpretation. */
  private parseArrow(): WardleyArrow | null {
    const start = this.next
    const glyph = this.takeIf("dependency-arrow") ?? this.takeIf("link-arrow")
    if (glyph !== null) {
      this.addItem("Punctuator", [glyph])
      return {
        type: "WardleyArrow",
        value: this.textOfUnit(glyph),
        kind: "dependency",
        line: glyph.text === "-.->" ? "dotted" : "solid",
        startMarker: "none",
        label: null,
        endMarker: "arrow",
        ...this.placeFrom(start),
      }
    }
    if (!this.optionalPunctuation("flow-open")) return null
    const label = this.closedStringLiteralOf(this.take("flow-label"))
    const marker = this.take("flow-marker")
    this.addItem("Punctuator", [marker])
    const place = this.placeFrom(start)
    return {
      type: "WardleyArrow",
      value: this.textOf(place.range),
      kind: "flow",
      line: "solid",
      startMarker: marker.text.includes("<") ? "arrow" : "none",
      label,
      endMarker: marker.text.includes(">") ? "arrow" : "none",
      ...place,
    }
  }

  /** evolve: a written reference and decimal, including unresolved references. */
  private parseEvolve(): WardleyEvolveStatement {
    const start = this.next
    this.keyword("evolve")
    const textBeforeComponent = this.parseHiddenForms()
    const component = this.parseName()
    const textBeforeTarget = this.parseHiddenForms()
    const target = this.numericLiteralOf(this.take("decimal"))
    const textAfter = this.parseHiddenForms()
    return {
      type: "WardleyEvolveStatement",
      textBeforeComponent,
      component,
      textBeforeTarget,
      target,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** pipeline: visible opening LF, nonempty component body, and a required closing brace. */
  private parsePipeline(): WardleyPipelineStatement {
    const start = this.next
    this.keyword("pipeline")
    const textBeforeParent = this.parseHiddenForms()
    const parent = this.parseName()
    const textBeforeBody = this.parseHiddenForms()
    this.punctuation("{")
    const textAfterOpen = this.parseHiddenForms()
    this.take("newline")
    const body: WardleyPipelineBodyItem[] = []
    let components = 0
    while (this.peek() !== null && this.peek()?.name !== "}") {
      if (this.takeIf("newline") !== null) continue
      if (this.isHidden(this.peek())) body.push(this.parseIgnoredText())
      else {
        body.push(this.parsePipelineComponent())
        components += 1
        this.parseEol()
      }
    }
    if (components === 0) throw this.unexpected(this.peek())
    this.punctuation("}")
    const textAfter = this.parseHiddenForms()
    return {
      type: "WardleyPipelineStatement",
      textBeforeParent,
      parent,
      textBeforeBody,
      textAfterOpen,
      body,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** pipeline-component: one evolution leaf and at most one label offset, without synthesized coordinates. */
  private parsePipelineComponent(): WardleyPipelineComponent {
    const start = this.next
    this.keyword("component")
    const textBeforeName = this.parseHiddenForms()
    const name = this.parseName()
    const textBeforeOpen = this.parseHiddenForms()
    this.punctuation("[")
    const textBeforeEvolution = this.parseHiddenForms()
    const evolution = this.numericLiteralOf(this.take("decimal"))
    const textBeforeClose = this.parseHiddenForms()
    this.punctuation("]")
    const gapStart = this.next
    const gap = this.parseHiddenForms()
    const labelOffset =
      this.peek()?.name === "label"
        ? this.parseLabelOffset(gapStart, gap)
        : null
    const textAfter = labelOffset === null ? gap : this.parseHiddenForms()
    return {
      type: "WardleyPipelineComponent",
      textBeforeName,
      name,
      textBeforeOpen,
      textBeforeEvolution,
      evolution,
      textBeforeClose,
      labelOffset,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** note: a required closed string and decimal position. */
  private parseNote(): WardleyNoteStatement {
    const start = this.next
    this.keyword("note")
    const textBeforeText = this.parseHiddenForms()
    const text = this.closedStringLiteralOf(this.take("string"))
    const textBeforeCoordinates = this.parseHiddenForms()
    const coordinates = this.parseCoordinates(false)
    const textAfter = this.parseHiddenForms()
    return {
      type: "WardleyNoteStatement",
      textBeforeText,
      text,
      textBeforeCoordinates,
      coordinates,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** annotations: retain every authored box, using integer-or-decimal coordinates. */
  private parseAnnotations(): WardleyAnnotationsStatement {
    const start = this.next
    this.keyword("annotations")
    const textBeforeCoordinates = this.parseHiddenForms()
    const coordinates = this.parseCoordinates(true)
    const textAfter = this.parseHiddenForms()
    return {
      type: "WardleyAnnotationsStatement",
      textBeforeCoordinates,
      coordinates,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** annotation: required integer, comma, integer-or-decimal pair, and quoted text. */
  private parseAnnotation(): WardleyAnnotationStatement {
    const start = this.next
    this.keyword("annotation")
    const textBeforeNumber = this.parseHiddenForms()
    const number = this.numericLiteralOf(this.take("integer"))
    const textBeforeComma = this.parseHiddenForms()
    this.punctuation(",")
    const textBeforeCoordinates = this.parseHiddenForms()
    const coordinates = this.parseCoordinates(true)
    const textBeforeText = this.parseHiddenForms()
    const text = this.closedStringLiteralOf(this.take("string"))
    const textAfter = this.parseHiddenForms()
    return {
      type: "WardleyAnnotationStatement",
      textBeforeNumber,
      number,
      textBeforeComma,
      textBeforeCoordinates,
      coordinates,
      textBeforeText,
      text,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** evolution-statement: at least two stages separated by dependency-arrow punctuation. */
  private parseEvolution(): WardleyEvolutionStatement {
    const start = this.next
    this.keyword("evolution")
    const stages = [this.parseStage()]
    this.punctuation("dependency-arrow")
    stages.push(this.parseStage())
    while (this.optionalPunctuation("dependency-arrow"))
      stages.push(this.parseStage())
    return {
      type: "WardleyEvolutionStatement",
      stages,
      ...this.placeFrom(start),
    }
  }

  /** stage: optional boundary before optional second name, with absent-clause gaps left empty. */
  private parseStage(): WardleyEvolutionStage {
    const start = this.next
    const textBefore = this.parseHiddenForms()
    const name = this.parseName()
    let gap = this.parseHiddenForms()
    const boundaryMark = this.optionalPunctuation("@")
    const textBeforeBoundaryMark = boundaryMark ? gap : []
    const textBeforeBoundary = boundaryMark ? this.parseHiddenForms() : []
    const boundary = boundaryMark
      ? this.numericLiteralOf(this.take("decimal"))
      : null
    if (boundaryMark) gap = this.parseHiddenForms()
    const secondNameMark = this.optionalPunctuation("/")
    const textBeforeSecondNameMark = secondNameMark ? gap : []
    const textBeforeSecondName = secondNameMark ? this.parseHiddenForms() : []
    const secondName = secondNameMark ? this.parseName() : null
    const textAfter = secondNameMark ? this.parseHiddenForms() : gap
    return {
      type: "WardleyEvolutionStage",
      textBefore,
      name,
      textBeforeBoundaryMark,
      textBeforeBoundary,
      boundary,
      textBeforeSecondNameMark,
      textBeforeSecondName,
      secondName,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** size: two unsigned integer leaves, without any extra numeric restriction. */
  private parseSize(): WardleySizeStatement {
    const start = this.next
    this.keyword("size")
    const textBeforeOpen = this.parseHiddenForms()
    this.punctuation("[")
    const textBeforeWidth = this.parseHiddenForms()
    const width = this.numericLiteralOf(this.take("integer"))
    const textBeforeComma = this.parseHiddenForms()
    this.punctuation(",")
    const textBeforeHeight = this.parseHiddenForms()
    const height = this.numericLiteralOf(this.take("integer"))
    const textBeforeClose = this.parseHiddenForms()
    this.punctuation("]")
    const textAfter = this.parseHiddenForms()
    return {
      type: "WardleySizeStatement",
      textBeforeOpen,
      textBeforeWidth,
      width,
      textBeforeComma,
      textBeforeHeight,
      height,
      textBeforeClose,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** name: authored bare/quoted leaves, retaining converted comparison values at lexical boundaries. */
  private parseName(): WardleyIdentifier | StringLiteral {
    const unit = this.peek()
    if (unit?.name === "string") {
      this.advance()
      const node = this.closedStringLiteralOf(unit)
      this.comparisonNames.set(node, decodeStringEscapes(unit.text))
      return node
    }
    if (unit?.name !== "id" && unit?.name !== "spaced-name")
      throw this.unexpected(unit)
    this.advance()
    this.addItem(unit.name === "id" ? "Identifier" : "RawText", [unit])
    const place = this.placeOf([unit])
    const node: WardleyIdentifier = {
      type: "WardleyIdentifier",
      name: this.textOf(place.range),
      ...place,
    }
    this.comparisonNames.set(node, unit.text)
    return node
  }

  /** common-statement: four distinct forms, preserving line padding and trimming only block ends. */
  private parseCommonStatement(
    keyword: "title" | "accTitle" | "accDescr",
  ):
    | WardleyTitleStatement
    | WardleyAccTitleStatement
    | WardleyAccDescrStatement
    | WardleyAccDescrBlockStatement {
    const start = this.next
    this.keyword(keyword)
    const block = keyword === "accDescr" && this.peek()?.name === "{"
    if (keyword !== "title") this.punctuation(block ? "{" : ":")
    const text = this.takeIf(block ? "block-text" : "line-text")
    const value = text?.significantRange == null ? null : this.literalOf(text)
    if (block) this.punctuation("}")
    const textAfter = this.parseHiddenForms()
    return {
      type: block
        ? "WardleyAccDescrBlockStatement"
        : keyword === "title"
          ? "WardleyTitleStatement"
          : keyword === "accTitle"
            ? "WardleyAccTitleStatement"
            : "WardleyAccDescrStatement",
      value,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** WardleyLiteral: authored text outside shared removals, with the unit's specified outer padding. */
  private literalOf(unit: Unit): WardleyLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "WardleyLiteral", value: this.textOf(place.range), ...place }
  }

  /** Fixed words are atomic Keyword items. */
  private keyword(name: UnitName): void {
    this.addItem("Keyword", [this.take(name)])
  }

  /** Complete authored punctuation components are independent items. */
  private punctuation(name: UnitName): void {
    this.addItem("Punctuator", [this.take(name)])
  }

  /** Optional punctuation adds a token exactly when written. */
  private optionalPunctuation(name: UnitName): boolean {
    const unit = this.takeIf(name)
    if (unit === null) return false
    this.addItem("Punctuator", [unit])
    return true
  }

  /** eol: one or more visible newlines or EOF, after any hidden ending has already been consumed. */
  private parseEol(): void {
    if (this.peek() !== null) this.take("newline")
    this.takeAll("newline")
  }

  /** Only whole native YAML and directive forms are named-gap members. */
  private isHidden(unit: Unit | null): boolean {
    return unit?.name === "yaml-block" || unit?.name === "directive"
  }

  /** Read only forms, crossing visible newlines solely before the header. */
  private parseHiddenForms(newlines = false): WardleyIgnoredText[] {
    const forms: WardleyIgnoredText[] = []
    for (;;) {
      if (this.isHidden(this.peek())) forms.push(this.parseIgnoredText())
      else if (newlines && this.takeIf("newline") !== null) continue
      else return forms
    }
  }

  /** WardleyIgnoredText: the whole native form, excluding its consumed final LF and shared trivia. */
  private parseIgnoredText(): WardleyIgnoredText {
    const unit = this.peek()
    if (unit?.name !== "yaml-block" && unit?.name !== "directive")
      throw this.unexpected(unit)
    this.advance()
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "WardleyIgnoredText",
      kind: unit.name,
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }
}
