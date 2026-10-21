import type { DiagramTokenKind, StringLiteral } from "../../ast.ts"
import type {
  RequirementAccDescrBlockStatement,
  RequirementAccDescrStatement,
  RequirementAccTitleStatement,
  RequirementClassDefStatement,
  RequirementClassShorthandStatement,
  RequirementClassStatement,
  RequirementDirection,
  RequirementDirectionStatement,
  RequirementElementField,
  RequirementElementStatement,
  RequirementIdentifier,
  RequirementIgnoredText,
  RequirementKind,
  RequirementLiteral,
  RequirementName,
  RequirementRelationship,
  RequirementRelationshipStatement,
  RequirementRequirementStatement,
  RequirementRisk,
  RequirementRiskField,
  RequirementStatement,
  RequirementStyleStatement,
  RequirementValueField,
  RequirementVerifyMethod,
  RequirementVerifyMethodField,
} from "../../ast/requirement.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { RequirementLexing, Unit, UnitName } from "./units.ts"

/** What the grammar makes of the units of a requirement diagram. */
export interface RequirementSyntax {
  /** The statements of the diagram, in source order. */
  readonly body: readonly RequirementStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** Requirements: the units of `requirement-kind`, which are the kinds. */
const REQUIREMENT_KINDS: readonly RequirementKind[] = [
  "requirement",
  "functionalRequirement",
  "interfaceRequirement",
  "performanceRequirement",
  "physicalRequirement",
  "designConstraint",
]

/** Requirements: the risks of `requirement-field`. */
const RISKS: readonly RequirementRisk[] = ["low", "medium", "high"]

/** Requirements: the methods of `requirement-field`. */
const VERIFY_METHODS: readonly RequirementVerifyMethod[] = [
  "analysis",
  "demonstration",
  "inspection",
  "test",
]

/** Relationships: the units of `relation`, which are the relationships. */
const RELATIONSHIPS: readonly RequirementRelationship[] = [
  "contains",
  "copies",
  "derives",
  "satisfies",
  "verifies",
  "refines",
  "traces",
]

/** Diagram and statements: `name = unquoted-text | string`. */
const NAMES: readonly UnitName[] = ["unquoted-text", "string"]

/** Styles and classes: `style-name = style-word | string`. */
const STYLE_NAMES: readonly UnitName[] = ["style-word", "string"]

/** Styles and classes: `class-name = style-word | unquoted-text | string`. */
const CLASS_NAMES: readonly UnitName[] = [
  "style-word",
  "unquoted-text",
  "string",
]

/**
 * Styles and classes: the units of `style-item = ( style-word |
 * style-colon | style-semicolon | style-dash | style-hash )+`.
 */
const STYLE_ITEM_UNITS: readonly UnitName[] = [
  "style-word",
  "style-colon",
  "style-semicolon",
  "style-dash",
  "style-hash",
]

/** The direction line: its values, which the text may write in any case. */
const DIRECTIONS: readonly RequirementDirection[] = ["TB", "BT", "RL", "LR"]

/** The member of `members` that the unit named `name` is; null for a unit of none. */
function memberNamed<Member extends UnitName>(
  members: readonly Member[],
  name: UnitName,
): Member | null {
  return members.find((member) => member === name) ?? null
}

/**
 * diagrams/requirement.md, Grammar: the recursive-descent parser over the
 * units of the requirement lexer. Each method reads one rule of the
 * grammar, which its comment names, and makes the node that the
 * specification gives for the rule, with the tokens of
 * `docs/tokens/requirement.md`, Tokens.
 */
export class RequirementGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: RequirementLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, EMPTY_FORM_KINDS.requirement, lexing.comments)
  }

  /**
   * Diagram and statements: `diagram = "header" empty-description-block*
   * newline line*`, with `line = statement | newline`. The empty
   * description blocks of the header line are the first statements.
   * Nothing separates two statements.
   */
  public parseDiagram(): RequirementSyntax {
    this.addItem("Keyword", [this.take("header")])
    const body: RequirementStatement[] = []
    const separator = this.statementEndAt(["newline"], false)
    while (this.next < separator) body.push(this.parseAccDescrBlockStatement())
    this.take("newline")
    for (let unit = this.peek(); unit !== null; unit = this.peek()) {
      if (unit.name === "newline") {
        this.advance()
        continue
      }
      body.push(this.parseStatement(unit))
    }
    return { body, tokens: this.tokensInOrder() }
  }

  /**
   * `docs/tokens/requirement.md`, Tokens: whitespace belongs to no unit
   * between the units of a style (diagrams/requirement.md, The style
   * context), so a run of the units of an item breaks where characters lie
   * between two of them, whose value mermaid.js reads without that
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
   * known-divergences/tokenless-empty-forms.md: an empty string, which no
   * rule of the grammar takes wherever it stands, and an empty description
   * block where the grammar cannot take it, inside a statement (Strings,
   * Empty description blocks).
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    return this.emptyFormErrorAt(unit)
  }

  /** Diagram and statements: `statement`, which starts at `unit`, the next unit. */
  private parseStatement(unit: Unit): RequirementStatement {
    const kind = memberNamed(REQUIREMENT_KINDS, unit.name)
    if (kind !== null) return this.parseRequirementStatement(kind)
    switch (unit.name) {
      case "element":
        return this.parseElementStatement()
      case "unquoted-text":
      case "string":
        return this.parseRelationshipOrShorthandStatement()
      case "direction-text":
      case "direction":
        return this.parseDirectionStatement()
      case "style":
        return this.parseStyleStatement()
      case "classDef":
        return this.parseClassDefStatement()
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
   * with a unit named in `names`: the next unit, or the first unit after
   * the empty description blocks that come next. Blocks written one after
   * another are decided together, by the unit after the last of them; when
   * that unit goes on with the statement, the blocks lie inside it, and the
   * input is rejected at the first of them.
   */
  private statementGoesOn(names: readonly UnitName[]): boolean {
    const after = this.afterEmptyForms(this.next, ["empty-description-block"])
    const name = this.nameAt(after)
    if (name === null || !names.includes(name)) return false
    if (after !== this.next) throw this.unexpected(this.peek())
    return true
  }

  /**
   * Requirements: `requirement-statement = requirement-kind name
   * class-list? requirement-body`, whose kind is `kind`, the next unit.
   */
  private parseRequirementStatement(
    kind: RequirementKind,
  ): RequirementRequirementStatement {
    const start = this.next
    this.addItem("Keyword", [this.take(kind)])
    const name = this.parseName(NAMES)
    const cssClasses = this.statementGoesOn([":::"])
      ? this.parseClassList()
      : []
    const body = this.parseBody(() => this.parseRequirementField())
    return {
      type: "RequirementRequirementStatement",
      requirementType: kind,
      name,
      cssClasses,
      body,
      ...this.placeFrom(start),
    }
  }

  /** Requirements: `class-list = ":::" name ( "," name )*`. */
  private parseClassList(): RequirementName[] {
    this.addItem("Punctuator", [this.take(":::")])
    return this.parseNameList(NAMES)
  }

  /**
   * Requirements and Elements: `requirement-body = "{"
   * empty-description-block* newline requirement-line*
   * empty-description-block* "}"`, with `requirement-line =
   * empty-description-block* requirement-field? empty-description-block*
   * newline`, and `element-body` the same with `element-field`, which
   * `parseField` reads. Each empty description block is an item of the
   * body.
   */
  private parseBody<Field>(
    parseField: () => Field,
  ): (Field | RequirementIgnoredText)[] {
    this.addItem("Punctuator", [this.take("{")])
    const items: (Field | RequirementIgnoredText)[] = this.parseIgnoredBlocks()
    this.take("newline")
    for (;;) {
      items.push(...this.parseIgnoredBlocks())
      const unit = this.peek()
      if (unit?.name === "}") break
      if (unit?.name === "newline") {
        this.advance()
        continue
      }
      items.push(parseField())
      items.push(...this.parseIgnoredBlocks())
      this.take("newline")
    }
    this.addItem("Punctuator", [this.take("}")])
    return items
  }

  /**
   * Empty description blocks: the empty description blocks from the next
   * unit on, each a RequirementIgnoredText, an item of a body, whose units
   * are the `Keyword` item `accDescr` and the `Punctuator` items `{` and
   * `}`.
   */
  private parseIgnoredBlocks(): RequirementIgnoredText[] {
    const blocks: RequirementIgnoredText[] = []
    for (
      let unit = this.peek();
      unit !== null &&
      this.emptyFormOf(unit)?.kind === "empty-description-block";
      unit = this.peek()
    ) {
      const accDescr = this.take("accDescr")
      const opening = this.take("{")
      const closing = this.take("}")
      this.addItem("Keyword", [accDescr])
      this.addItem("Punctuator", [opening])
      this.addItem("Punctuator", [closing])
      const place = this.placeOf([accDescr, closing])
      blocks.push({
        type: "RequirementIgnoredText",
        value: this.unreadTextOf(place.range),
        ...place,
      })
    }
    return blocks
  }

  /**
   * Requirements: `requirement-field = ( "id" | "text" ) ":" field-value |
   * "risk" ":" ( "low" | "medium" | "high" ) | "verifyMethod" ":" (
   * "analysis" | "demonstration" | "inspection" | "test" )`.
   */
  private parseRequirementField():
    | RequirementValueField
    | RequirementRiskField
    | RequirementVerifyMethodField {
    const start = this.next
    const keyword = this.peek()
    switch (keyword?.name) {
      case "id":
      case "text": {
        const field = keyword.name
        this.takeFieldKeyword(field)
        return {
          type: "RequirementValueField",
          field,
          value: this.parseFieldValue(),
          ...this.placeFrom(start),
        }
      }
      case "risk": {
        this.takeFieldKeyword("risk")
        return {
          type: "RequirementRiskField",
          risk: this.takeWord(RISKS),
          ...this.placeFrom(start),
        }
      }
      case "verifyMethod": {
        this.takeFieldKeyword("verifyMethod")
        return {
          type: "RequirementVerifyMethodField",
          verifyMethod: this.takeWord(VERIFY_METHODS),
          ...this.placeFrom(start),
        }
      }
      default:
        throw this.unexpected(keyword)
    }
  }

  /** Requirements and Elements: the keyword `keyword` of a field and the `:` after it. */
  private takeFieldKeyword(keyword: UnitName): void {
    this.addItem("Keyword", [this.take(keyword)])
    this.addItem("Punctuator", [this.take(":")])
  }

  /** The next unit, a `Keyword` item, which must be one of `words`; the word it is. */
  private takeWord<Word extends UnitName>(words: readonly Word[]): Word {
    const unit = this.peek()
    const word = unit === null ? null : memberNamed(words, unit.name)
    if (unit === null || word === null) throw this.unexpected(unit)
    this.advance()
    this.addItem("Keyword", [unit])
    return word
  }

  /**
   * Requirements: `field-value = unquoted-text | string`: a
   * RequirementLiteral for an `unquoted-text` unit, a StringLiteral for a
   * `string` unit.
   */
  private parseFieldValue(): RequirementLiteral | StringLiteral {
    const unit = this.peek()
    if (unit?.name === "string") {
      this.advance()
      return this.closedStringLiteralOf(unit)
    }
    return this.literalOf(this.take("unquoted-text"))
  }

  /**
   * Elements: `element-statement = "element" name class-list?
   * element-body`.
   */
  private parseElementStatement(): RequirementElementStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("element")])
    const name = this.parseName(NAMES)
    const cssClasses = this.statementGoesOn([":::"])
      ? this.parseClassList()
      : []
    const body = this.parseBody(() => this.parseElementField())
    return {
      type: "RequirementElementStatement",
      name,
      cssClasses,
      body,
      ...this.placeFrom(start),
    }
  }

  /** Elements: `element-field = ( "type" | "docref" ) ":" field-value`. */
  private parseElementField(): RequirementElementField {
    const start = this.next
    const keyword = this.peek()
    if (keyword?.name !== "type" && keyword?.name !== "docref") {
      throw this.unexpected(keyword)
    }
    const field = keyword.name
    this.takeFieldKeyword(field)
    return {
      type: "RequirementElementField",
      field,
      value: this.parseFieldValue(),
      ...this.placeFrom(start),
    }
  }

  /**
   * Relationships and Styles and classes: a statement that starts with a
   * name: `relationship-statement = name "-" relation "->" name | name "<-"
   * relation "-" name`, or `class-shorthand-statement = name ":::" name (
   * "," name )*`, as the unit after the name says.
   */
  private parseRelationshipOrShorthandStatement():
    RequirementRelationshipStatement | RequirementClassShorthandStatement {
    const start = this.next
    const name = this.parseName(NAMES)
    const unit = this.peek()
    switch (unit?.name) {
      case ":::":
        return {
          type: "RequirementClassShorthandStatement",
          name,
          cssClasses: this.parseClassList(),
          ...this.placeFrom(start),
        }
      case "-":
        return this.parseRelationshipFrom(start, name, "-", "->", "forward")
      case "<-":
        return this.parseRelationshipFrom(start, name, "<-", "-", "backward")
      default:
        throw this.unexpected(unit)
    }
  }

  /**
   * Relationships: the rest of `relationship-statement` after the name
   * `left`, which starts at `start`: `opening`, `relation`, `closing`, and
   * the right name.
   */
  private parseRelationshipFrom(
    start: number,
    left: RequirementName,
    opening: UnitName,
    closing: UnitName,
    arrow: RequirementRelationshipStatement["arrow"],
  ): RequirementRelationshipStatement {
    this.addItem("Punctuator", [this.take(opening)])
    const relationship = this.takeWord(RELATIONSHIPS)
    this.addItem("Punctuator", [this.take(closing)])
    const right = this.parseName(NAMES)
    return {
      type: "RequirementRelationshipStatement",
      left,
      relationship,
      arrow,
      right,
      ...this.placeFrom(start),
    }
  }

  /**
   * Styles and classes: `direction-statement = direction-text? "direction"
   * "direction-value" direction-text?`, each `direction-text` a
   * RequirementIgnoredText.
   */
  private parseDirectionStatement(): RequirementDirectionStatement {
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
      type: "RequirementDirectionStatement",
      textBefore,
      direction,
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /** ast/requirement.md, RequirementIgnoredText: the `direction-text` unit `unit`, one `RawText` item; null for none. */
  private optionalIgnoredText(
    unit: Unit | null,
  ): RequirementIgnoredText | null {
    if (unit === null) return null
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "RequirementIgnoredText",
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }

  /** Styles and classes: `style-statement = "style" style-names styles`. */
  private parseStyleStatement(): RequirementStyleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("style")])
    const names = this.parseNameList(STYLE_NAMES)
    return {
      type: "RequirementStyleStatement",
      names,
      styles: this.parseStyles(),
      ...this.placeFrom(start),
    }
  }

  /** Styles and classes: `class-def-statement = "classDef" style-names styles`. */
  private parseClassDefStatement(): RequirementClassDefStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("classDef")])
    const cssClasses = this.parseNameList(STYLE_NAMES)
    return {
      type: "RequirementClassDefStatement",
      cssClasses,
      styles: this.parseStyles(),
      ...this.placeFrom(start),
    }
  }

  /**
   * Styles and classes: `styles = style-item ( "," style-item )*`. The
   * styles end at the line feed that leaves the style context, before
   * which no empty description block is read, so a block before a `,`
   * stands after the statement.
   */
  private parseStyles(): RequirementLiteral[] {
    const styles = [this.parseStyleItem()]
    while (this.nameAt(this.next) === ",") {
      this.addItem("Punctuator", [this.take(",")])
      styles.push(this.parseStyleItem())
    }
    return styles
  }

  /**
   * Styles and classes: `style-item = ( style-word | style-colon |
   * style-semicolon | style-dash | style-hash )+`, one `RawText` item, a
   * RequirementLiteral whose value is the written texts of its units joined
   * in order (ast/requirement.md, RequirementLiteral). The units are those
   * of the style context, so a style ends at the line feed that leaves it.
   */
  private parseStyleItem(): RequirementLiteral {
    const units = this.takeWhile(STYLE_ITEM_UNITS)
    if (units.length === 0) throw this.unexpected(this.peek())
    this.addItem("RawText", units)
    return {
      type: "RequirementLiteral",
      value: units.map((unit) => this.textOfUnit(unit)).join(""),
      ...this.placeOf(units),
    }
  }

  /**
   * Styles and classes: `class-statement = "class" class-names
   * class-names`, with `class-names = class-name ( "," class-name )*`: the
   * names of requirements or elements, and the classes.
   */
  private parseClassStatement(): RequirementClassStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("class")])
    const names = this.parseNameList(CLASS_NAMES)
    return {
      type: "RequirementClassStatement",
      names,
      cssClasses: this.parseNameList(CLASS_NAMES),
      ...this.placeFrom(start),
    }
  }

  /**
   * A list of names, `name ( "," name )*`, each one of the units named in
   * `names`; the list ends at the first name that no `,` precedes.
   */
  private parseNameList(names: readonly UnitName[]): RequirementName[] {
    const list = [this.parseName(names)]
    while (this.statementGoesOn([","])) {
      this.addItem("Punctuator", [this.take(",")])
      list.push(this.parseName(names))
    }
    return list
  }

  /**
   * One name, the next unit, which must be one of the units named in
   * `names`: a StringLiteral for a `string` unit, a RequirementIdentifier
   * otherwise.
   */
  private parseName(names: readonly UnitName[]): RequirementName {
    const unit = this.peek()
    if (unit === null || !names.includes(unit.name)) {
      throw this.unexpected(unit)
    }
    this.advance()
    return unit.name === "string"
      ? this.closedStringLiteralOf(unit)
      : this.identifierOfName(unit)
  }

  /** Styles and classes: `"accTitle" ":" title-text`. */
  private parseAccTitleStatement(): RequirementAccTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accTitle")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "RequirementAccTitleStatement",
      value: this.literalOf(this.take("title-text")),
      ...this.placeFrom(start),
    }
  }

  /** Styles and classes: `"accDescr" ":" description-text`. */
  private parseAccDescrStatement(): RequirementAccDescrStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take(":")])
    return {
      type: "RequirementAccDescrStatement",
      value: this.literalOf(this.take("description-text")),
      ...this.placeFrom(start),
    }
  }

  /**
   * Styles and classes and Empty description blocks: `"accDescr" "{"
   * description-block-text "}"`, and `empty-description-block =
   * "accDescr" "{" "}"`, a statement without text where a statement
   * starts.
   */
  private parseAccDescrBlockStatement(): RequirementAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("description-block-text")
    this.addItem("Punctuator", [this.take("}")])
    return {
      type: "RequirementAccDescrBlockStatement",
      value: text === null ? null : this.literalOf(text),
      ...this.placeFrom(start),
    }
  }

  /**
   * ast/requirement.md, RequirementIdentifier: the `unquoted-text` or
   * `style-word` unit `unit`, whose name is its written text without the
   * whitespace at its end. diagrams/requirement.md, Directives inside
   * units: an `unquoted-text` is a text unit, one `RawText` item, as it may
   * hold several words; a `style-word` is a name unit, one `Identifier`
   * item.
   */
  private identifierOfName(unit: Unit): RequirementIdentifier {
    this.addItem(unit.name === "unquoted-text" ? "RawText" : "Identifier", [
      unit,
    ])
    const place = this.placeOf([unit])
    return {
      type: "RequirementIdentifier",
      name: this.textOf(place.range),
      ...place,
    }
  }

  /**
   * ast/requirement.md, RequirementLiteral: the text unit `unit`, an
   * `unquoted-text` unit that is a value or an accessibility text, one
   * `RawText` item, without the whitespace at its ends.
   */
  private literalOf(unit: Unit): RequirementLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "RequirementLiteral",
      value: this.textOf(place.range),
      ...place,
    }
  }
}
