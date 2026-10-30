import { appendItems } from "../../append-items.ts"
import type { DiagramTokenKind, Identifier, StringLiteral } from "../../ast.ts"
import type {
  ErAccDescrBlockStatement,
  ErAttribute,
  ErCardinality,
  ErClassDefStatement,
  ErClassStatement,
  ErDirection,
  ErDirectionStatement,
  ErEntityReference,
  ErEntityStatement,
  ErIdentifier,
  ErIgnoredText,
  ErLiteral,
  ErRelationship,
  ErRelationshipLine,
  ErRelationshipStatement,
  ErStatement,
  ErStyleStatement,
  ErSubgraphStatement,
} from "../../ast/er.ts"
import type { EmptyFormKind } from "../../empty-forms.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** What the grammar makes of the units of an ER diagram. */
export interface ErSyntax {
  /** The statements of the diagram, in source order. */
  readonly body: readonly ErStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** Entities: `entity-name = name | number | quoted-name`. */
const ENTITY_NAMES: readonly UnitName[] = ["name", "number", "quoted-name"]

/** Relationships: the units of `cardinality`. */
const CARDINALITIES: readonly UnitName[] = [
  "zero-or-one",
  "zero-or-more",
  "one-or-more",
  "only-one",
  "md-parent",
]

/** Attributes: `attribute-word = word | tilde-word | backquoted-word`. */
const ATTRIBUTE_WORDS: readonly UnitName[] = [
  "word",
  "tilde-word",
  "backquoted-word",
]

/** Other statements: the units of `style-item = ( style-text | ":" | "#" )+`. */
const STYLE_ITEM_UNITS: readonly UnitName[] = ["style-text", ":", "#"]

/** The direction line: its values, which the text may write in any case. */
const DIRECTIONS: readonly ErDirection[] = ["TB", "BT", "RL", "LR"]

/** Relationships: the cardinality that the unit named `name` is; null for a unit of no cardinality. */
function cardinalityOf(name: UnitName): ErCardinality | null {
  switch (name) {
    case "zero-or-one":
    case "zero-or-more":
    case "one-or-more":
    case "only-one":
    case "md-parent":
      return name
    default:
      return null
  }
}

/** Relationships: the line that the unit named `name` is; null for a unit of no line. */
function lineOf(name: UnitName): ErRelationshipLine | null {
  switch (name) {
    case "identifying":
    case "non-identifying":
      return name
    default:
      return null
  }
}

/**
 * diagrams/er.md, Grammar: the recursive-descent parser over the units of
 * the ER lexer. Each method reads one rule of the grammar, which its
 * comment names, and makes the node that the specification gives for the
 * rule, with the tokens of `docs/tokens/er.md`, Tokens.
 */
export class ErGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(units: readonly Unit[], lexer: SourceLexer) {
    // The ER lexer reads no diagram comments.
    super(units, lexer, EMPTY_FORM_KINDS.er, [])
  }

  /** Diagram and statements: `diagram = "header" line*`. */
  public parseDiagram(): ErSyntax {
    this.addItem("Keyword", [this.take("header")])
    const body = this.parseLines(false)
    return { body, tokens: this.tokensInOrder() }
  }

  /**
   * `docs/tokens/er.md`, Tokens: whitespace belongs to no unit in this
   * diagram (diagrams/er.md, Units and contexts), so a run of the units of
   * an item breaks where characters lie between two of them, as between
   * the units of a style, whose value mermaid.js reads without that
   * whitespace.
   */
  protected override breaksRun(
    kind: DiagramTokenKind,
    previous: Unit,
    unit: Unit,
  ): boolean {
    return super.breaksRun(kind, previous, unit) || previous.end !== unit.start
  }

  /**
   * known-divergences/tokenless-empty-forms.md: an empty description block
   * or empty backquotes where the grammar cannot take them, inside a
   * statement or an attribute.
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    return this.emptyFormErrorAt(unit)
  }

  /**
   * Diagram and statements: `line*`, with `line = statement | newline`: the
   * statements up to the end of the text, or, in the body of a subgraph,
   * up to its `end`.
   */
  private parseLines(inSubgraph: boolean): ErStatement[] {
    const body: ErStatement[] = []
    for (;;) {
      const unit = this.peek()
      if (unit === null) {
        if (inSubgraph) throw this.unexpected(null)
        return body
      }
      if (inSubgraph && unit.name === "end") return body
      if (unit.name === "newline") {
        this.advance()
        continue
      }
      body.push(this.parseStatement())
    }
  }

  /** Diagram and statements: `statement`. Nothing separates two statements. */
  private parseStatement(): ErStatement {
    const unit = this.peek()
    switch (unit?.name) {
      case "name":
      case "number":
      case "quoted-name":
        return this.parseEntityOrRelationshipStatement()
      case "subgraph":
        return this.parseSubgraphStatement()
      case "direction-text":
      case "direction":
        return this.parseDirectionStatement()
      case "classDef":
        return this.parseClassDefStatement()
      case "style":
        return this.parseStyleStatement()
      case "class":
        return this.parseClassStatement()
      case "accTitle":
        return this.parseAccTitleStatement()
      case "accDescr":
        return this.nameAt(this.positionAfter(this.next)) === ":"
          ? this.parseAccDescrStatement()
          : this.parseAccDescrBlockStatement()
      default:
        throw this.unexpected(unit)
    }
  }

  /**
   * Empty description blocks: whether the statement read so far goes on
   * with a unit named in `names`, the next unit or the first after the
   * empty description blocks that come next (see
   * {@link ErGrammar.goesOn}).
   */
  private statementGoesOn(names: readonly UnitName[]): boolean {
    return this.goesOn(names, "empty-description-block")
  }

  /**
   * Attributes: whether the attribute read so far goes on with a unit named
   * in `names`, the next unit or the first after the `empty-backquotes`
   * units that come next (see {@link ErGrammar.goesOn}).
   */
  private attributeGoesOn(names: readonly UnitName[]): boolean {
    return this.goesOn(names, "empty-backquotes")
  }

  /**
   * Empty description blocks and Attributes: whether what is read goes on
   * with a unit named in `names`: the next unit, or the first unit after
   * the empty forms of `kind` that come next. Forms written one after
   * another are decided together, by the unit after the last of them; when
   * that unit goes on with what is read, the forms lie inside it, and the
   * input is rejected at the first of them.
   */
  private goesOn(names: readonly UnitName[], kind: EmptyFormKind): boolean {
    const after = this.afterEmptyForms(this.next, [kind])
    const name = this.nameAt(after)
    if (name === null || !names.includes(name)) return false
    if (after !== this.next) throw this.unexpected(this.peek())
    return true
  }

  /**
   * Entities and Relationships: `entity-statement = entity-name alias?
   * class-list? attribute-block?` and `relationship-statement =
   * entity-reference relationship entity-reference ":" role`, with
   * `entity-reference = entity-name class-list?`. An entity with an alias
   * takes no relationship.
   */
  private parseEntityOrRelationshipStatement():
    ErEntityStatement | ErRelationshipStatement {
    const start = this.next
    const name = this.parseEntityName()
    if (this.statementGoesOn(["["])) {
      const alias = this.parseAlias()
      const cssClasses = this.statementGoesOn([":::"])
        ? this.parseClassList()
        : []
      return this.entityStatementFrom(start, name, alias, cssClasses)
    }
    const cssClasses = this.statementGoesOn([":::"])
      ? this.parseClassList()
      : []
    if (this.statementGoesOn(CARDINALITIES)) {
      const left: ErEntityReference = {
        type: "ErEntityReference",
        name,
        cssClasses,
        ...this.placeFrom(start),
      }
      return this.parseRelationshipFrom(start, left)
    }
    return this.entityStatementFrom(start, name, null, cssClasses)
  }

  /** Entities: the entity statement from `start` with the parts read, and its attribute block when one follows. */
  private entityStatementFrom(
    start: number,
    name: ErIdentifier | StringLiteral,
    alias: ErIdentifier | StringLiteral | null,
    cssClasses: readonly ErIdentifier[],
  ): ErEntityStatement {
    const attributes = this.statementGoesOn(["{"])
      ? this.parseAttributeBlock()
      : null
    return {
      type: "ErEntityStatement",
      name,
      alias,
      cssClasses,
      attributes,
      ...this.placeFrom(start),
    }
  }

  /**
   * Entities: `entity-name = name | number | quoted-name`: an ErIdentifier
   * for a `name` or a `number` unit, a StringLiteral for a `quoted-name`
   * unit.
   */
  private parseEntityName(): ErIdentifier | StringLiteral {
    const unit = this.peek()
    if (unit === null || !ENTITY_NAMES.includes(unit.name)) {
      throw this.unexpected(unit)
    }
    this.advance()
    return unit.name === "quoted-name"
      ? this.closedStringLiteralOf(unit)
      : this.erIdentifierOf(unit)
  }

  /** Entities: `alias = "[" entity-name "]"`. */
  private parseAlias(): ErIdentifier | StringLiteral {
    this.addItem("Punctuator", [this.take("[")])
    const alias = this.parseEntityName()
    this.addItem("Punctuator", [this.take("]")])
    return alias
  }

  /** Entities: `class-list = ":::" name ( "," name )*`. */
  private parseClassList(): ErIdentifier[] {
    this.addItem("Punctuator", [this.take(":::")])
    const names = [this.erIdentifierOf(this.take("name"))]
    while (this.statementGoesOn([","])) {
      this.addItem("Punctuator", [this.take(",")])
      names.push(this.erIdentifierOf(this.take("name")))
    }
    return names
  }

  /** Entities: `attribute-block = "{" block-item* "}"`, with `block-item = attribute | empty-backquotes`. */
  private parseAttributeBlock(): (ErAttribute | ErIgnoredText)[] {
    this.addItem("Punctuator", [this.take("{")])
    const items: (ErAttribute | ErIgnoredText)[] = []
    for (;;) {
      const unit = this.peek()
      if (unit === null || unit.name === "}") break
      items.push(
        unit.name === "empty-backquotes"
          ? this.parseIgnoredBackquotes()
          : this.parseAttribute(),
      )
    }
    this.addItem("Punctuator", [this.take("}")])
    return items
  }

  /**
   * ast/er.md, ErIgnoredText: a run of `empty-backquotes` units between two
   * attributes, before the first, or after the last, one node; each unit
   * is a `String` item of its own.
   */
  private parseIgnoredBackquotes(): ErIgnoredText {
    const units = this.takeWhile(["empty-backquotes"])
    for (const unit of units) this.addItem("String", [unit])
    const place = this.placeOf(units)
    return { type: "ErIgnoredText", value: this.textOf(place.range), ...place }
  }

  /**
   * Attributes: `attribute = attribute-word "?"? attribute-word key-list?
   * comment-string?`, with `key-list = key ( "," key )*`.
   */
  private parseAttribute(): ErAttribute {
    const start = this.next
    const dataType = this.parseAttributeWord()
    const optional = this.attributeGoesOn(["?"])
    if (optional) this.addItem("Punctuator", [this.take("?")])
    const name = this.parseAttributeWord()
    const keys: Identifier[] = []
    if (this.attributeGoesOn(["key"])) {
      keys.push(this.identifierOf([this.take("key")]))
      while (this.attributeGoesOn([","])) {
        this.addItem("Punctuator", [this.take(",")])
        keys.push(this.identifierOf([this.take("key")]))
      }
    }
    const comment = this.attributeGoesOn(["comment-string"])
      ? this.closedStringLiteralOf(this.take("comment-string"))
      : null
    return {
      type: "ErAttribute",
      dataType,
      optional,
      name,
      keys,
      comment,
      ...this.placeFrom(start),
    }
  }

  /**
   * Attributes: `attribute-word = word | tilde-word | backquoted-word`: an
   * ErIdentifier for a `word` or a `tilde-word` unit, a StringLiteral for a
   * `backquoted-word` unit.
   */
  private parseAttributeWord(): ErIdentifier | StringLiteral {
    const unit = this.peek()
    if (unit === null || !ATTRIBUTE_WORDS.includes(unit.name)) {
      throw this.unexpected(unit)
    }
    this.advance()
    return unit.name === "backquoted-word"
      ? this.closedStringLiteralOf(unit)
      : this.erIdentifierOf(unit)
  }

  /**
   * ast/er.md, ErIdentifier: the `name`, `number`, `style-text`, `word`, or
   * `tilde-word` unit `unit`, whose name is its written text, whitespace
   * included. `docs/tokens/er.md`, Tokens: a `tilde-word` is a text unit,
   * one `RawText` item; the others are name units, one `Identifier` item.
   */
  private erIdentifierOf(unit: Unit): ErIdentifier {
    this.addItem(unit.name === "tilde-word" ? "RawText" : "Identifier", [unit])
    const place = this.placeOf([unit])
    return { type: "ErIdentifier", name: this.textOf(place.range), ...place }
  }

  /**
   * Relationships: the rest of `relationship-statement` after the entity
   * reference `left`, which starts at `start`: `relationship
   * entity-reference ":" role`, with `relationship = cardinality
   * relationship-line cardinality` and `role = string | quoted-name |
   * name`.
   */
  private parseRelationshipFrom(
    start: number,
    left: ErEntityReference,
  ): ErRelationshipStatement {
    const relationshipStart = this.next
    const leftCardinality = this.takeCardinality()
    const line = this.takeLine()
    const rightCardinality = this.takeCardinality()
    const relationship: ErRelationship = {
      type: "ErRelationship",
      leftCardinality,
      line,
      rightCardinality,
      ...this.placeFrom(relationshipStart),
    }
    const rightStart = this.next
    const rightName = this.parseEntityName()
    const right: ErEntityReference = {
      type: "ErEntityReference",
      name: rightName,
      cssClasses: this.statementGoesOn([":::"]) ? this.parseClassList() : [],
      ...this.placeFrom(rightStart),
    }
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "ErRelationshipStatement",
      left,
      relationship,
      right,
      role: this.parseRole(),
      ...this.placeFrom(start),
    }
  }

  /** Relationships: `cardinality`, one unit of a cardinality. */
  private takeCardinality(): ErCardinality {
    const unit = this.peek()
    const cardinality = unit === null ? null : cardinalityOf(unit.name)
    if (unit === null || cardinality === null) throw this.unexpected(unit)
    this.advance()
    this.addRelationshipItem(unit)
    return cardinality
  }

  /** Relationships: `relationship-line`, one unit of a line. */
  private takeLine(): ErRelationshipLine {
    const unit = this.peek()
    const line = unit === null ? null : lineOf(unit.name)
    if (unit === null || line === null) throw this.unexpected(unit)
    this.advance()
    this.addRelationshipItem(unit)
    return line
  }

  /**
   * `docs/tokens/er.md`, Tokens: a cardinality or a line unit is a
   * `Keyword` item when it is written with a word and a `Punctuator` item
   * when it is written with symbols.
   */
  private addRelationshipItem(unit: Unit): void {
    this.addItem(unit.writtenAsWord === true ? "Keyword" : "Punctuator", [unit])
  }

  /**
   * Relationships: `role = string | quoted-name | name`: a StringLiteral
   * for a `string` or a `quoted-name` unit, an ErIdentifier for a `name`
   * unit.
   */
  private parseRole(): StringLiteral | ErIdentifier {
    const unit = this.peek()
    if (unit?.name === "string" || unit?.name === "quoted-name") {
      this.advance()
      return this.closedStringLiteralOf(unit)
    }
    return this.erIdentifierOf(this.take("name"))
  }

  /**
   * Subgraphs: `subgraph-statement = "subgraph" entity-name
   * subgraph-title? empty-description-block* newline line* "end"`, with
   * `subgraph-title = "[" entity-name+ "]"`. The empty description blocks
   * of the header line are the first statements of the body.
   */
  private parseSubgraphStatement(): ErSubgraphStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("subgraph")])
    const id = this.parseEntityName()
    let title: (ErIdentifier | StringLiteral)[] | null = null
    if (this.nameAt(this.next) === "[") {
      this.addItem("Punctuator", [this.take("[")])
      title = [this.parseEntityName()]
      while (ENTITY_NAMES.includes(this.nameAt(this.next) ?? "invalid")) {
        title.push(this.parseEntityName())
      }
      this.addItem("Punctuator", [this.take("]")])
    }
    const separator = this.statementEndAt(["newline"], false)
    const body: ErStatement[] = []
    while (this.next < separator) body.push(this.parseAccDescrBlockStatement())
    this.take("newline")
    appendItems(body, this.parseLines(true))
    this.addItem("Keyword", [this.take("end")])
    return {
      type: "ErSubgraphStatement",
      id,
      title,
      body,
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `direction-statement = direction-text? "direction"
   * "direction-value" direction-text?`, each `direction-text` an
   * ErIgnoredText.
   */
  private parseDirectionStatement(): ErDirectionStatement {
    const start = this.next
    const textBefore = this.optionalIgnoredText(this.takeIf("direction-text"))
    this.addItem("Keyword", [this.take("direction")])
    const value = this.take("direction-value")
    this.addItem("Keyword", [value])
    const written = this.textOfUnit(value).toUpperCase()
    const direction = DIRECTIONS.find((candidate) => candidate === written)
    if (direction === undefined) throw this.unexpected(value)
    const textAfter = this.optionalIgnoredText(this.takeIf("direction-text"))
    return {
      type: "ErDirectionStatement",
      textBefore,
      direction,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** ast/er.md, ErIgnoredText: the `direction-text` unit `unit`, one `RawText` item; null for none. */
  private optionalIgnoredText(unit: Unit | null): ErIgnoredText | null {
    if (unit === null) return null
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "ErIgnoredText", value: this.textOf(place.range), ...place }
  }

  /**
   * Other statements: `class-def-statement = "classDef" style-text ( ","
   * style-text )* styles statement-end`.
   */
  private parseClassDefStatement(): ErClassDefStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("classDef")])
    const cssClasses = this.parseStyleNames()
    const styles = this.parseStyles()
    this.parseStatementEnd()
    return {
      type: "ErClassDefStatement",
      cssClasses,
      styles,
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `style-statement = "style" style-text ( ","
   * style-text )* styles statement-end`.
   */
  private parseStyleStatement(): ErStyleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("style")])
    const entities = this.parseStyleNames()
    const styles = this.parseStyles()
    this.parseStatementEnd()
    return {
      type: "ErStyleStatement",
      entities,
      styles,
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: the names of a `classDef` or a `style` statement,
   * `style-text ( "," style-text )*`, which end at the first unit that no
   * `,` precedes; each an ErIdentifier.
   */
  private parseStyleNames(): ErIdentifier[] {
    const names = [this.erIdentifierOf(this.take("style-text"))]
    while (this.nameAt(this.next) === ",") {
      this.addItem("Punctuator", [this.take(",")])
      names.push(this.erIdentifierOf(this.take("style-text")))
    }
    return names
  }

  /** Other statements: `styles = style-item ( "," style-item )*`. */
  private parseStyles(): ErLiteral[] {
    const styles = [this.parseStyleItem()]
    while (this.nameAt(this.next) === ",") {
      this.addItem("Punctuator", [this.take(",")])
      styles.push(this.parseStyleItem())
    }
    return styles
  }

  /**
   * Other statements: `style-item = ( style-text | ":" | "#" )+`, one
   * `RawText` item, an ErLiteral whose value is the written texts of its
   * units joined in order (ast/er.md, ErLiteral).
   */
  private parseStyleItem(): ErLiteral {
    const units = this.takeWhile(STYLE_ITEM_UNITS)
    if (units.length === 0) throw this.unexpected(this.peek())
    this.addItem("RawText", units)
    return {
      type: "ErLiteral",
      value: units.map((unit) => this.textOfUnit(unit)).join(""),
      ...this.placeOf(units),
    }
  }

  /** Other statements: `statement-end = newline | ";"`; the `newline` is a line of its own. */
  private parseStatementEnd(): void {
    if (this.nameAt(this.next) === "newline") return
    this.addItem("Punctuator", [this.take(";")])
  }

  /**
   * Other statements: `class-statement = "class" name ( "," name )* name (
   * "," name )*`, the names of entities or subgraphs and the classes.
   */
  private parseClassStatement(): ErClassStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("class")])
    const entities = [this.erIdentifierOf(this.take("name"))]
    while (this.nameAt(this.next) === ",") {
      this.addItem("Punctuator", [this.take(",")])
      entities.push(this.erIdentifierOf(this.take("name")))
    }
    const cssClasses = [this.erIdentifierOf(this.take("name"))]
    while (this.statementGoesOn([","])) {
      this.addItem("Punctuator", [this.take(",")])
      cssClasses.push(this.erIdentifierOf(this.take("name")))
    }
    return {
      type: "ErClassStatement",
      entities,
      cssClasses,
      ...this.placeFrom(start),
    }
  }

  /** Other statements: `"accTitle" ":" title-text`. */
  private parseAccTitleStatement(): ErStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accTitle")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "ErAccTitleStatement",
      value: this.literalOf(this.take("title-text")),
      ...this.placeFrom(start),
    }
  }

  /** Other statements: `"accDescr" ":" description-text`. */
  private parseAccDescrStatement(): ErStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "ErAccDescrStatement",
      value: this.literalOf(this.take("description-text")),
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements and Empty description blocks: `"accDescr" "{"
   * description-block-text "}"`, and `empty-description-block =
   * "accDescr" "{" "}"`, a statement without text.
   */
  private parseAccDescrBlockStatement(): ErAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("description-block-text")
    this.addItem("Punctuator", [this.take("}")])
    return {
      type: "ErAccDescrBlockStatement",
      value: text === null ? null : this.literalOf(text),
      ...this.placeFrom(start),
    }
  }

  /** ast/er.md, ErLiteral: the text unit `unit`, one `RawText` item, without the whitespace at its ends. */
  private literalOf(unit: Unit): ErLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "ErLiteral", value: this.textOf(place.range), ...place }
  }
}
