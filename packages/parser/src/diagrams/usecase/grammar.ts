import type { Identifier, Range, StringLiteral } from "../../ast.ts"
import type {
  UsecaseActor,
  UsecaseActorStatement,
  UsecaseArrow,
  UsecaseClassStatement,
  UsecaseEntity,
  UsecaseEntityStatement,
  UsecaseIdentifier,
  UsecaseJsonStatement,
  UsecaseLabel,
  UsecaseLiteral,
  UsecaseMetadata,
  UsecaseMetadataProperty,
  UsecaseOpeningArrow,
  UsecaseRelationshipStatement,
  UsecaseStatement,
  UsecaseStyleDeclaration,
  UsecaseSystemBoundaryStatement,
} from "../../ast/usecase.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import { UsecaseRejections } from "./rejections.ts"
import { KEYWORDS } from "./units.ts"
import type { Unit, UnitName, UsecaseLexing } from "./units.ts"

/** The grammar's statements and tokens, before shared token-boundary checks. */
export interface UsecaseSyntax {
  readonly body: readonly UsecaseStatement[]
  readonly tokens: readonly PendingToken[]
}

/** Lexical Word is a category, distinct from exact Identifier positions. */
function isWord(unit: Unit | null): boolean {
  return (
    unit !== null &&
    (unit.name === "identifier" || KEYWORDS.some((name) => name === unit.name))
  )
}

/** diagrams/usecase.md, Categories and unquoted text: positive bare label units. */
function isLabelText(unit: Unit | null): boolean {
  return (
    isWord(unit) ||
    (unit !== null &&
      (
        [
          "number",
          "@",
          ",",
          ":",
          "hash-color",
          "css-identifier",
          "escaped-comma",
          "-",
          ".",
          "%",
          "css-punctuation",
          "label-punctuation",
          "label-symbol",
        ] as readonly UnitName[]
      ).includes(unit.name))
  )
}

/** Style components are an explicit finite grammar, although their values stay opaque. */
function isStyleComponent(unit: Unit | null): boolean {
  return (
    isWord(unit) ||
    (unit !== null &&
      (
        [
          "plain-string",
          "number",
          "hash-color",
          "css-identifier",
          "escaped-comma",
          "-",
          ".",
          "%",
          "css-punctuation",
          ":",
          "(",
          ")",
          "[",
          "]",
          "{",
          "}",
          "@",
          "markerless-solid",
        ] as readonly UnitName[]
      ).includes(unit.name))
  )
}

/** The seven association operator unit names. */
const ASSOCIATIONS: readonly UnitName[] = [
  "forward-solid",
  "backward-solid",
  "markerless-solid",
  "forward-circle",
  "backward-circle",
  "forward-cross",
  "backward-cross",
]

/** Converted leaf values are retained only for the specified model validation. */
export type ConvertedLeaf =
  UsecaseLabel | UsecaseLiteral | StringLiteral | Identifier

/** diagrams/usecase.md, Grammar: recursive descent over every lexical unit. */
export class UsecaseGrammar extends UnitGrammar<UnitName, Unit> {
  private readonly converted = new Map<ConvertedLeaf, string>()

  public constructor(lexing: UsecaseLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram: one header line followed by blank/comment lines and statements. */
  public parseDiagram(): UsecaseSyntax {
    this.keyword("usecase-beta")
    this.lineEnd()
    const body: UsecaseStatement[] = []
    while (this.peek() !== null) {
      if (this.triviaLine()) continue
      body.push(this.parseStatement())
    }
    new UsecaseRejections(this.converted).check(body)
    return { body, tokens: this.tokensInOrder() }
  }

  /** No empty forms are erased in this grammar; common atomic-boundary checks apply at recording. */
  protected knownDivergenceAt(_unit: Unit): ParseError | null {
    return null
  }

  /** line-end: physical newline or source end, never a semicolon. */
  private lineEnd(): void {
    if (this.peek() !== null) this.take("newline")
  }

  /** top-line and boundary-line: blank and native comment lines have no statement nodes. */
  private triviaLine(): boolean {
    if (this.takeIf("newline") !== null) return true
    if (this.takeIf("diagram-comment") === null) return false
    this.lineEnd()
    return true
  }

  /** statement: metadata-assignment precedes entity-statement under its immediate-block guard. */
  private parseStatement(): UsecaseStatement {
    const start = this.next
    const first = this.peek()!
    let node: UsecaseStatement
    switch (first.name) {
      case "accTitle":
      case "accDescr":
        node = this.parseAccessibility()
        break
      case "direction":
        node = this.parseDirection()
        break
      case "actor":
        node = this.parseActorStatement(false)
        break
      case "systemBoundary":
        node = this.parseBoundary()
        break
      case "note":
        node = this.parseNote()
        break
      case "json":
        node = this.parseJson()
        break
      case "classDef":
        node = this.parseClassDef()
        break
      case "class":
        node = this.parseClass()
        break
      case "style":
        node = this.parseStyle()
        break
      default:
        if (
          this.nameAt(this.positionAfter(start)) === "@{" &&
          (first.name === "identifier" ||
            first.name === "plain-string" ||
            first.name === "markdown-string")
        ) {
          const target =
            first.name === "identifier" ? this.identifier() : this.parseLabel()
          const metadata = this.parseMetadata()
          node = {
            type: "UsecaseMetadataAssignmentStatement",
            target,
            metadata,
            ...this.placeFrom(start),
          }
        } else {
          if (
            first.name === "identifier" &&
            [
              "allowmixing",
              "newpage",
              "package",
              "rectangle",
              "skinparam",
            ].includes(first.text.toLowerCase())
          )
            throw this.unexpected(first)
          const entity = this.parseEntity()
          node = this.atLineEnd()
            ? {
                type: "UsecaseEntityStatement",
                entity,
                ...this.placeFrom(start),
              }
            : this.parseRelation(start, entity)
        }
    }
    this.lineEnd()
    return node
  }

  /** A complete statement stops before LF or EOF. */
  private atLineEnd(): boolean {
    return this.peek() === null || this.peek()?.name === "newline"
  }

  /** actor-statement: either a comma list or one relationship, with declarations only inside boundaries. */
  private parseActorStatement(
    inBoundary: boolean,
  ): UsecaseActorStatement | UsecaseRelationshipStatement {
    const start = this.next
    this.keyword("actor")
    const actors = [this.parseActor()]
    if (this.peek()?.name === ",") {
      while (this.takePunctuatorIf(",")) actors.push(this.parseActor())
    } else if (!inBoundary && !this.atLineEnd())
      return this.parseRelation(start, actors[0])
    return { type: "UsecaseActorStatement", actors, ...this.placeFrom(start) }
  }

  /** actor-item: actor-name, metadata, stereotype, and classes in precisely that order. */
  private parseActor(): UsecaseActor {
    const start = this.next
    const { id, label } = this.parseName(false)
    const metadata = this.peek()?.name === "@{" ? this.parseMetadata() : null
    const stereotype = this.parseStereotype()
    const classes = this.parseClassSuffix()
    return {
      type: "UsecaseActor",
      id,
      label,
      metadata,
      stereotype,
      classes,
      ...this.placeFrom(start),
    }
  }

  /** entity-name: a written occurrence remains an Entity even when it resolves to another symbol kind. */
  private parseEntity(): UsecaseEntity {
    const start = this.next
    const { id, label, shape } = this.parseName(true)
    const metadata = this.peek()?.name === "@{" ? this.parseMetadata() : null
    const stereotype = this.parseStereotype()
    const classes = this.parseClassSuffix()
    return {
      type: "UsecaseEntity",
      id,
      shape,
      label,
      metadata,
      stereotype,
      classes,
      ...this.placeFrom(start),
    }
  }

  /** actor-name, entity-name, boundary-name: exact id plus optional shape, or a quoted-only label. */
  private parseName(brackets: boolean): {
    readonly id: Identifier | null
    readonly label: UsecaseLabel | null
    readonly shape: UsecaseEntity["shape"]
  } {
    if (
      this.peek()?.name === "plain-string" ||
      this.peek()?.name === "markdown-string"
    )
      return { id: null, label: this.parseLabel(), shape: null }
    const id = this.identifier()
    const opening = this.peek()?.name
    if (opening !== "(" && !(brackets && opening === "["))
      return { id, label: null, shape: null }
    this.punctuator(opening)
    const label = this.parseLabel()
    this.punctuator(opening === "(" ? ")" : "]")
    return { id, label, shape: opening === "(" ? "ellipse" : "rectangle" }
  }

  /** node-label and edge-label: one quoted unit or a positive bare run, without mixing. */
  private parseLabel(): UsecaseLabel {
    const first = this.peek()
    let kind: UsecaseLabel["kind"] = "text"
    const units: Unit[] = []
    if (first?.name === "plain-string" || first?.name === "markdown-string") {
      kind = first.name === "plain-string" ? "string" : "markdown"
      this.advance()
      units.push(first)
      this.addItem("String", units)
    } else {
      while (isLabelText(this.peek())) {
        units.push(this.peek()!)
        this.advance()
      }
      if (units.length === 0) throw this.unexpected(first)
      this.addItem("RawText", units)
    }
    const place = this.placeOf(units)
    const delimiter = kind === "text" ? 0 : kind === "string" ? 1 : 2
    const value = this.textOf([
      place.range[0] + delimiter,
      place.range[1] - delimiter,
    ])
    const node: UsecaseLabel = { type: "UsecaseLabel", kind, value, ...place }
    const converted = this.joinConverted(units)
    this.converted.set(
      node,
      delimiter === 0 ? converted : converted.slice(delimiter, -delimiter),
    )
    return node
  }

  /** A bare run keeps only the ASCII whitespace between its units, with common trivia omitted. */
  private joinConverted(units: readonly Unit[]): string {
    return units
      .map(
        (unit, index) =>
          (index === 0 ? "" : this.textOf([units[index - 1].end, unit.start])) +
          unit.text,
      )
      .join("")
  }

  /** metadata: property separators and at most two trailing comma/newline units. */
  private parseMetadata(): UsecaseMetadata {
    const start = this.next
    this.punctuator("@{")
    this.takeAll("newline")
    const properties: UsecaseMetadataProperty[] = []
    if (this.peek()?.name !== "}") {
      for (;;) {
        properties.push(this.parseMetadataProperty())
        const comma = this.takePunctuatorIf(",")
        let tailSize = comma ? 1 : 0
        while (this.takeIf("newline") !== null) tailSize += 1
        if (tailSize <= 2 && this.peek()?.name === "}") break
        if (tailSize === 0) break
        if (!comma) {
          // After a newline, a comma requires another property.
          this.takePunctuatorIf(",")
          this.takeAll("newline")
        }
      }
    }
    this.punctuator("}")
    return { type: "UsecaseMetadata", properties, ...this.placeFrom(start) }
  }

  /** metadata-property: keys are exact ids/plain strings; only unquoted true/false add scalar alternatives. */
  private parseMetadataProperty(): UsecaseMetadataProperty {
    const start = this.next
    const key = this.parseMetadataScalar(false)
    this.punctuator(":")
    const value = this.parseMetadataScalar(true)
    return {
      type: "UsecaseMetadataProperty",
      key,
      value,
      ...this.placeFrom(start),
    }
  }

  /** Bare booleans remain Identifier nodes; quoted scalar values preserve raw and decode nothing. */
  private parseMetadataScalar(boolean: boolean): Identifier | StringLiteral {
    const unit = this.peek()
    if (unit?.name === "plain-string") {
      this.advance()
      const node = this.closedStringLiteralOf(unit)
      this.converted.set(node, unit.text.slice(1, -1))
      return node
    }
    if (boolean && (unit?.name === "true" || unit?.name === "false")) {
      this.advance()
      const node = this.identifierOf([unit])
      this.converted.set(node, unit.text)
      return node
    }
    return this.identifier()
  }

  /** stereotype: delimiters are punctuation; the complete interior, including padding, is a Literal. */
  private parseStereotype(): UsecaseLiteral | null {
    if (!this.takePunctuatorIf("<<")) return null
    const unit = this.take("stereotype-text")
    const node = this.literalOf([unit])
    this.punctuator(">>")
    return node
  }

  /** class-suffix: no holes or trailing empty items. */
  private parseClassSuffix(): Identifier[] {
    return this.takePunctuatorIf(":::") ? this.identifierList() : []
  }

  /** boundary-statement: declarations only until the required closing end keyword. */
  private parseBoundary(): UsecaseSystemBoundaryStatement {
    const start = this.next
    this.keyword("systemBoundary")
    const { id, label: title } = this.parseName(true)
    const metadata = this.peek()?.name === "@{" ? this.parseMetadata() : null
    const classes = this.parseClassSuffix()
    this.lineEnd()
    const body: (UsecaseActorStatement | UsecaseEntityStatement)[] = []
    while (this.peek()?.name !== "end") {
      if (this.peek() === null) throw this.unexpected(null)
      if (this.triviaLine()) continue
      if (this.peek()?.name === "actor") {
        const node = this.parseActorStatement(true)
        if (node.type !== "UsecaseActorStatement")
          throw new Error("mmd-toolkit parser bug: boundary relationship")
        body.push(node)
      } else {
        const entity = this.parseEntity()
        body.push({
          type: "UsecaseEntityStatement",
          entity,
          range: entity.range,
          loc: entity.loc,
        })
      }
      this.lineEnd()
    }
    this.keyword("end")
    return {
      type: "UsecaseSystemBoundaryStatement",
      id,
      title,
      metadata,
      classes,
      body,
      ...this.placeFrom(start),
    }
  }

  /** relation-tail: optional authored edge id, semantic operator or sole/split association, then one endpoint. */
  private parseRelation(
    start: number,
    source: UsecaseActor | UsecaseEntity,
  ): UsecaseRelationshipStatement {
    let id: Identifier | null = null
    if (
      this.peek()?.name === "identifier" &&
      this.nameAt(this.positionAfter(this.next)) === "@"
    ) {
      id = this.identifier()
      this.punctuator("@")
    }
    const operator = this.peek()
    if (operator === null) throw this.unexpected(null)
    let kind: UsecaseRelationshipStatement["kind"] = "association"
    let opening: UsecaseOpeningArrow | null = null
    let label: UsecaseLabel | null = null
    let arrow: UsecaseArrow
    if (operator.name === "generalization") {
      this.advance()
      arrow = this.arrowOf(operator)
      kind = "generalization"
    } else if (operator.name === "dependency-arrow") {
      this.advance()
      arrow = this.arrowOf(operator)
      this.punctuator(":")
      const word = this.peek()
      if (word?.name !== "include" && word?.name !== "extend")
        throw this.unexpected(word)
      this.keyword(word.name)
      kind = word.name
    } else {
      if (!ASSOCIATIONS.includes(operator.name)) throw this.unexpected(operator)
      this.advance()
      if (this.splitCloses(operator)) {
        const parts = this.arrowParts(operator)
        this.addItem("Punctuator", [operator])
        opening = {
          type: "UsecaseOpeningArrow",
          value: this.textOfUnit(operator),
          startMarker: parts.startMarker,
          line: "solid",
          length: 2,
          ...this.placeOf([operator]),
        }
        label = this.parseLabel()
        const closing = this.peek()
        if (closing === null || !this.canCloseSplit(operator, closing))
          throw this.unexpected(closing)
        this.advance()
        arrow = this.arrowOf(closing)
      } else arrow = this.arrowOf(operator)
    }
    const target = this.parseEntity()
    return {
      type: "UsecaseRelationshipStatement",
      source,
      id,
      kind,
      opening,
      label,
      arrow,
      target,
      ...this.placeFrom(start),
    }
  }

  /** The split guard scans compatible units, without relaxing the label production itself. */
  private splitCloses(opening: Unit): boolean {
    if (!["--", "<--", "o--", "x--"].includes(opening.text)) return false
    let count = 0
    for (let index = this.next; ; index = this.positionAfter(index)) {
      const unit = this.unitAt(index)
      if (unit === null) return false
      if (count > 0 && this.canCloseSplit(opening, unit)) return true
      if (
        !isLabelText(unit) &&
        unit.name !== "plain-string" &&
        unit.name !== "markdown-string"
      )
        return false
      count += 1
    }
  }

  /** Only the right-half spellings listed by split-association can close its opener. */
  private canCloseSplit(opening: Unit, closing: Unit): boolean {
    return opening.text === "--"
      ? [
          "forward-solid",
          "markerless-solid",
          "forward-circle",
          "forward-cross",
        ].some((name) => name === closing.name)
      : closing.name === "markerless-solid"
  }

  /** UsecaseArrow: the lexer determines marker vocabulary and written dash/dot count. */
  private arrowOf(unit: Unit): UsecaseArrow {
    this.addItem("Punctuator", [unit])
    return {
      type: "UsecaseArrow",
      value: this.textOfUnit(unit),
      ...this.arrowParts(unit),
      ...this.placeOf([unit]),
    }
  }

  /** Operator units carry the lexical structure directly. */
  private arrowParts(
    unit: Unit,
  ): Pick<UsecaseArrow, "startMarker" | "endMarker" | "line" | "length"> {
    if (unit.arrow === null)
      throw new Error("mmd-toolkit parser bug: usecase arrow has no parts")
    return unit.arrow
  }

  /** note-statement: a target id and one node-label, without generated note children. */
  private parseNote(): UsecaseStatement {
    const start = this.next
    this.keyword("note")
    this.keyword("for")
    const target = this.identifier()
    const label = this.parseLabel()
    return {
      type: "UsecaseNoteStatement",
      target,
      label,
      ...this.placeFrom(start),
    }
  }

  /** json-statement: prefix components, one balanced opaque object and optional classes. */
  private parseJson(): UsecaseJsonStatement {
    const start = this.next
    this.keyword("json")
    const id = this.identifierOf([this.take("raw-json-id")])
    const blockStart = this.next
    this.punctuator("json-at")
    const open = this.take("json-open")
    this.addItem("Punctuator", [open])
    const content = this.takeIf("json-text")
    if (content !== null) this.addItem("RawText", [content])
    const close = this.take("json-close")
    this.addItem("Punctuator", [close])
    const data = {
      type: "UsecaseJsonDataBlock" as const,
      value: this.textOf([open.end, close.start]),
      ...this.placeFrom(blockStart),
    }
    const classes = this.parseClassSuffix()
    return {
      type: "UsecaseJsonStatement",
      id,
      data,
      classes,
      ...this.placeFrom(start),
    }
  }

  /** direction-statement: the fixed direction word stays a scalar and a Keyword token. */
  private parseDirection(): UsecaseStatement {
    const start = this.next
    this.keyword("direction")
    const unit = this.peek()
    if (
      unit?.name !== "TD" &&
      unit?.name !== "TB" &&
      unit?.name !== "BT" &&
      unit?.name !== "LR" &&
      unit?.name !== "RL"
    )
      throw this.unexpected(unit)
    this.keyword(unit.name)
    return {
      type: "UsecaseDirectionStatement",
      direction: unit.name,
      ...this.placeFrom(start),
    }
  }

  /** class-def-statement: one name list followed by nonempty CSS declarations. */
  private parseClassDef(): UsecaseStatement {
    const start = this.next
    this.keyword("classDef")
    const classes = this.identifierList()
    const styles = this.parseStyles()
    return {
      type: "UsecaseClassDefStatement",
      classes,
      styles,
      ...this.placeFrom(start),
    }
  }

  /** class-statement: its two adjacent id lists stay distinct source fields. */
  private parseClass(): UsecaseClassStatement {
    const start = this.next
    this.keyword("class")
    const targets = this.identifierList()
    const classes = this.identifierList()
    return {
      type: "UsecaseClassStatement",
      targets,
      classes,
      ...this.placeFrom(start),
    }
  }

  /** style-statement: one exact target id and nonempty CSS declarations. */
  private parseStyle(): UsecaseStatement {
    const start = this.next
    this.keyword("style")
    const target = this.identifier()
    const styles = this.parseStyles()
    return {
      type: "UsecaseStyleStatement",
      target,
      styles,
      ...this.placeFrom(start),
    }
  }

  /** styles: commas separate complete declarations and cannot trail. */
  private parseStyles(): UsecaseStyleDeclaration[] {
    const styles = [this.parseStyleDeclaration()]
    while (this.takePunctuatorIf(",")) styles.push(this.parseStyleDeclaration())
    return styles
  }

  /** style-declaration: atomic name components, then a single opaque value with leading HWS. */
  private parseStyleDeclaration(): UsecaseStyleDeclaration {
    const start = this.next
    const names: Unit[] = []
    if (this.peek()?.name === "markerless-solid") {
      names.push(this.take("markerless-solid"))
      if (!isWord(this.peek())) throw this.unexpected(this.peek())
      names.push(this.peek()!)
      this.advance()
    } else {
      if (!isWord(this.peek()) && this.peek()?.name !== "css-identifier")
        throw this.unexpected(this.peek())
      names.push(this.peek()!)
      this.advance()
    }
    for (const name of names)
      this.addItem(
        name.name === "markerless-solid" ? "Punctuator" : "Identifier",
        [name],
      )
    const namePlace = this.placeOf(names)
    const name: UsecaseIdentifier = {
      type: "UsecaseIdentifier",
      name: this.textOf(namePlace.range),
      ...namePlace,
    }
    const colon = this.take(":")
    this.addItem("Punctuator", [colon])
    const units: Unit[] = []
    while (isStyleComponent(this.peek())) {
      units.push(this.peek()!)
      this.advance()
    }
    if (units.length === 0) throw this.unexpected(this.peek())
    const value = this.literalOf(units, colon.end)
    return {
      type: "UsecaseStyleDeclaration",
      name,
      value,
      ...this.placeFrom(start),
    }
  }

  /** Accessibility statements: raw line values and first-close block interiors preserve all padding. */
  private parseAccessibility(): UsecaseStatement {
    const start = this.next
    const first = this.peek()!
    this.keyword(first.name)
    const block = this.peek()?.name === "{"
    this.punctuator(block ? "{" : ":")
    const text = this.takeIf(block ? "description-text" : "accessibility-text")
    const value = text === null ? null : this.literalOf([text])
    if (block) this.punctuator("}")
    return {
      type: block
        ? "UsecaseAccDescrBlockStatement"
        : first.name === "accTitle"
          ? "UsecaseAccTitleStatement"
          : "UsecaseAccDescrStatement",
      value,
      ...this.placeFrom(start),
    }
  }

  /** UsecaseLiteral: preserve its complete range, including leading CSS HWS when specified. */
  private literalOf(units: readonly Unit[], start?: number): UsecaseLiteral {
    const first =
      start === undefined
        ? units[0].start
        : (this.diagramTextIn([start, units[0].start])?.[0] ?? units[0].start)
    const range: Range = [first, units[units.length - 1].end]
    this.addWhitespaceToken("RawText", range)
    const node: UsecaseLiteral = {
      type: "UsecaseLiteral",
      value: this.textOf(range),
      range,
      loc: this.lines.location(range),
    }
    this.converted.set(node, this.joinConverted(units))
    return node
  }

  /** Exact native ids use the shared Identifier helper. */
  private identifier(): Identifier {
    const unit = this.take("identifier")
    const node = this.identifierOf([unit])
    this.converted.set(node, unit.text)
    return node
  }

  /** A comma list always has at least one id and no holes. */
  private identifierList(): Identifier[] {
    const ids = [this.identifier()]
    while (this.takePunctuatorIf(",")) ids.push(this.identifier())
    return ids
  }

  /** A fixed word is one atomic Keyword item. */
  private keyword(name: UnitName): void {
    this.addItem("Keyword", [this.take(name)])
  }

  /** One compound delimiter remains one atomic Punctuator item. */
  private punctuator(name: UnitName): void {
    this.addItem("Punctuator", [this.take(name)])
  }

  /** Optional punctuation records a token only when it is actually present. */
  private takePunctuatorIf(name: UnitName): boolean {
    const unit = this.takeIf(name)
    if (unit === null) return false
    this.addItem("Punctuator", [unit])
    return true
  }
}
