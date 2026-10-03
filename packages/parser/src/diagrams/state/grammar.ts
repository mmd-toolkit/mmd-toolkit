import type { DiagramTokenKind, Identifier, StringLiteral } from "../../ast.ts"
import type {
  StateAliasDefinitionStatement,
  StateClassDefStatement,
  StateClassStatement,
  StateClickStatement,
  StateCompositeStatement,
  StateDirection,
  StateDirectionStatement,
  StateIgnoredStatement,
  StateIgnoredText,
  StateLiteral,
  StateNoteStatement,
  StateFloatingNoteStatement,
  StatePseudostateDefinitionStatement,
  StatePseudostateKind,
  StateReference,
  StateStatement,
  StateStyleStatement,
} from "../../ast/state.ts"
import type { UnitWithKind } from "../../diagram-parsing.ts"
import type { EmptyForm } from "../../empty-forms.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { PseudostateMark, Unit, UnitName } from "./units.ts"
import { PSEUDOSTATE_MARKS } from "./units.ts"

/** What the grammar makes of the units of a state diagram. */
export interface StateSyntax {
  /** The statements of the diagram, in source order. */
  readonly body: readonly StateStatement[]
  /** The units that are not all whitespace, in source order. */
  readonly units: readonly UnitWithKind[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
  /**
   * Building the summary from the tree, Ids: the id of each state that a
   * composite state, a definition, or an alias names, in converted form,
   * which the rejections outside the grammar read.
   */
  readonly stateIds: ReadonlyMap<Identifier | StateLiteral, string>
}

/** The state context, rule 4: the kind of each pseudostate mark. */
const PSEUDOSTATE_KINDS: Readonly<
  Record<PseudostateMark, StatePseudostateKind>
> = {
  "<<fork>>": "fork",
  "<<join>>": "join",
  "<<choice>>": "choice",
  "[[fork]]": "fork",
  "[[join]]": "join",
  "[[choice]]": "choice",
}

/** The direction line: its values, which the text may write in any case. */
const DIRECTIONS: readonly StateDirection[] = ["TB", "BT", "RL", "LR"]

/** The units that start a state statement of the state context, without `state`. */
const STATE_CONTEXT_STARTS: readonly UnitName[] = [
  "state-name",
  "string",
  "empty-string",
  "pseudostate-name",
  ...PSEUDOSTATE_MARKS,
]

/**
 * diagrams/state.md, Grammar: the recursive-descent parser over the units
 * of the state lexer. Each method reads one rule of the grammar, which its
 * comment names, and makes the node that the specification gives for the
 * rule, with the tokens of ast/state.md, Tokens.
 */
export class StateGrammar extends UnitGrammar<UnitName, Unit> {
  private readonly stateIds = new Map<Identifier | StateLiteral, string>()

  public constructor(units: readonly Unit[], lexer: SourceLexer) {
    super(units, lexer, EMPTY_FORM_KINDS.state)
  }

  /** Diagram and statements: `diagram = newline* "header" line*`. */
  public parseDiagram(): StateSyntax {
    this.takeAll("newline")
    this.addItem("Keyword", [this.take("header")])
    const body = this.parseLines(false)
    return {
      body,
      units: this.unitsWithKindInOrder(),
      tokens: this.tokensInOrder(),
      stateIds: this.stateIds,
    }
  }

  /**
   * ast/state.md, Tokens: a run of units of a `RawText` item goes on over
   * the whitespace between them; a run of an item of another kind breaks
   * where characters lie between two of its units, because whitespace
   * belongs to no unit (diagrams/state.md, Units and contexts).
   */
  protected override breaksRun(
    kind: DiagramTokenKind,
    previous: Unit,
    unit: Unit,
  ): boolean {
    if (super.breaksRun(kind, previous, unit)) return true
    return kind !== "RawText" && previous.end !== unit.start
  }

  /**
   * Diagram and statements: `line*`, with `line = statement | newline`: the
   * statements up to the end of the text, or, in a body, up to its `}`.
   */
  private parseLines(inBody: boolean): StateStatement[] {
    const body: StateStatement[] = []
    for (;;) {
      const unit = this.peek()
      if (unit === null || (inBody && unit.name === "}")) return body
      if (unit.name === "newline") {
        this.take("newline")
        continue
      }
      body.push(this.parseStatement())
    }
  }

  /** Diagram and statements: `statement`. */
  private parseStatement(): StateStatement {
    const unit = this.peek()
    switch (unit?.name) {
      case "id":
      case "[*]":
        return this.parseStateStatement()
      case "state":
        return this.parseStateKeywordStatement()
      case "--":
        return this.parseDivider()
      case "note":
        return this.parseNoteStatement()
      case "click":
        return this.parseClickStatement()
      case "classDef":
        return this.parseClassDefStatement()
      case "class":
        return this.parseClassStatement()
      case "style":
        return this.parseStyleStatement()
      case "direction-text":
      case "direction":
        return this.parseDirectionStatement()
      case "accTitle":
      case "accDescr":
        return this.parseAccessibilityStatement()
      case "scale":
        return this.parseScaleStatement()
      case "hide":
        return this.parseHideStatement()
      default:
        if (unit !== null && STATE_CONTEXT_STARTS.includes(unit.name)) {
          return this.parseStateContextStatement(this.next)
        }
        throw this.unexpected(unit ?? null)
    }
  }

  /**
   * States and transitions: `definition-statement = state-reference
   * description?` and `transition-statement = state-reference "-->"
   * state-reference description?`.
   */
  private parseStateStatement(): StateStatement {
    const start = this.next
    const from = this.parseStateReference()
    const arrow = this.takeIf("-->")
    if (arrow === null) {
      return {
        type: "StateDefinitionStatement",
        reference: from,
        description: this.parseDescription(),
        ...this.placeFrom(start),
      }
    }
    this.addItem("Punctuator", [arrow])
    const to = this.parseStateReference()
    return {
      type: "StateTransitionStatement",
      from,
      to,
      label: this.parseDescription(),
      ...this.placeFrom(start),
    }
  }

  /** States and transitions: `state-reference = ( id | "[*]" ) ( ":::" id )?`. */
  private parseStateReference(): StateReference {
    const start = this.next
    const terminal = this.takeIf("[*]")
    let state: Identifier | StateReference["state"]
    if (terminal !== null) {
      this.addItem("Punctuator", [terminal])
      state = { type: "StateTerminal", ...this.placeOf([terminal]) }
    } else {
      state = this.stateIdOf(this.take("id"))
    }
    let cssClass: Identifier | null = null
    const separator = this.takeIf(":::")
    if (separator !== null) {
      this.addItem("Punctuator", [separator])
      cssClass = this.identifierOf([this.take("id")])
    }
    return {
      type: "StateReference",
      state,
      cssClass,
      ...this.placeFrom(start),
    }
  }

  /** Building the summary from the tree, Ids: the Identifier of the id unit `unit`, whose converted text is kept as the id of its state. */
  private stateIdOf(unit: Unit): Identifier {
    const identifier = this.identifierOf([unit])
    this.stateIds.set(identifier, unit.text)
    return identifier
  }

  /**
   * States and transitions: `description?`: the text of a `description`
   * unit after its `:`, a StateLiteral, null when it is all whitespace; the
   * `:` is a `Punctuator` item.
   */
  private parseDescription(): StateLiteral | null {
    const unit = this.takeIf("description")
    if (unit === null) return null
    if (unit.description === null) {
      throw new Error(
        `mmd-toolkit parser bug: the description at ${unit.start} has no parts`,
      )
    }
    this.addItem("Punctuator", [unit.description.colon])
    return this.optionalLiteral(unit.description.text)
  }

  /**
   * ast/state.md, StateLiteral: the literal of the unit `unit`, one
   * `RawText` item; null when the unit is all whitespace, whose item then
   * has no token.
   */
  private optionalLiteral(unit: Unit | null): StateLiteral | null {
    if (unit === null) return null
    this.addItem("RawText", [unit])
    if (unit.significantRange === null) return null
    const place = this.placeOf([unit])
    return { type: "StateLiteral", value: this.textOf(place.range), ...place }
  }

  /** ast/state.md, StateIgnoredText: the text of the unit `unit`, one `RawText` item; null when the unit is all whitespace. */
  private optionalIgnoredText(unit: Unit | null): StateIgnoredText | null {
    if (unit === null) return null
    this.addItem("RawText", [unit])
    if (unit.significantRange === null) return null
    const place = this.placeOf([unit])
    return {
      type: "StateIgnoredText",
      value: this.textOf(place.range),
      ...place,
    }
  }

  /**
   * Composite states, aliases, and pseudostates: a statement that starts
   * with `state`, which belongs to the first statement that the state
   * context reads; `state` alone, also before empty strings that no name
   * and no string follows, is a composite statement without a name.
   */
  private parseStateKeywordStatement(): StateStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("state")])
    const next = this.nameAt(this.next)
    const statementFollows =
      next === "empty-string"
        ? this.emptyStringsBelongToStatement()
        : next !== null && STATE_CONTEXT_STARTS.includes(next)
    if (statementFollows) return this.parseStateContextStatement(start)
    return {
      type: "StateCompositeStatement",
      textBeforeId: null,
      id: null,
      textBeforeBody: null,
      body: null,
      ...this.placeFrom(start),
    }
  }

  /**
   * Composite states, aliases, and pseudostates: the statement that the
   * state context reads from the next unit, which starts at the unit
   * `start`, the `state` unit when it has one. Empty strings before a
   * name or the string of an alias belong to that statement; without
   * either after them, they are an `ignored-statement`.
   */
  private parseStateContextStatement(start: number): StateStatement {
    if (
      this.nameAt(this.next) === "empty-string" &&
      !this.emptyStringsBelongToStatement()
    ) {
      return this.parseIgnoredStatement()
    }
    const emptyStrings = this.parseEmptyStrings()
    switch (this.nameAt(this.next)) {
      case "state-name":
        return this.parseCompositeStatement(start, emptyStrings)
      case "string":
        return this.parseAliasStatement(start, emptyStrings)
      default:
        return this.parsePseudostateStatement(start)
    }
  }

  /**
   * Composite states, aliases, and pseudostates: whether the run of empty
   * strings that starts at the next unit belongs to a statement after it:
   * whether a name or the string of an alias follows it.
   */
  private emptyStringsBelongToStatement(): boolean {
    let end = this.next
    while (this.nameAt(end) === "empty-string") end += 1
    const after = this.nameAt(end)
    return after === "state-name" || after === "string"
  }

  /**
   * Composite states, aliases, and pseudostates: `ignored-statement =
   * empty-string+`, a run of empty strings that no name, no string, and no
   * body follows, each a `String` item.
   */
  private parseIgnoredStatement(): StateIgnoredStatement {
    const units = this.takeWhile(["empty-string"])
    for (const unit of units) this.addItem("String", [unit])
    const place = this.placeOf(units)
    return {
      type: "StateIgnoredStatement",
      value: this.textOf(place.range),
      ...place,
    }
  }

  /**
   * Composite states: `"state"? empty-string* state-name ( empty-string*
   * ignored-text? "{" line* "}" )?`, whose empty strings before the name
   * are `textBeforeId`.
   */
  private parseCompositeStatement(
    start: number,
    textBeforeId: StateIgnoredText | null,
  ): StateCompositeStatement {
    const id = this.stateIdOf(this.take("state-name"))
    return {
      type: "StateCompositeStatement",
      textBeforeId,
      id,
      textBeforeBody: this.parseTextBeforeBody(),
      body: this.parseBody(),
      ...this.placeFrom(start),
    }
  }

  /**
   * The state string context: `empty-string*`, a run of empty strings, one
   * StateIgnoredText, which mermaid.js does not read; null when there is
   * none.
   */
  private parseEmptyStrings(): StateIgnoredText | null {
    const units = this.takeWhile(["empty-string"])
    return units.length === 0 ? null : this.ignoredTextOfUnits(units)
  }

  /**
   * Composite states and aliases: `empty-string* empty-description-block*
   * ignored-text?` before the `{` of a body (an alias has no empty strings
   * there), which the grammar takes there only, one StateIgnoredText from
   * the first of them to the last; null when there are none, or when no `{`
   * follows them.
   */
  private parseTextBeforeBody(): StateIgnoredText | null {
    let end = this.next
    while (this.nameAt(end) === "empty-string") end += 1
    for (
      let block = this.emptyDescriptionBlockAt(end);
      block !== null;
      block = this.emptyDescriptionBlockAt(end)
    ) {
      end += block.units.length
    }
    if (this.nameAt(end) === "ignored-text") end += 1
    if (end === this.next || this.nameAt(end) !== "{") return null
    const units: Unit[] = []
    while (this.next < end) units.push(this.take(this.nameAt(this.next) ?? "{"))
    return this.ignoredTextOfUnits(units)
  }

  /** The empty description block that starts at the unit at `index`; null when none starts there. */
  private emptyDescriptionBlockAt(index: number): EmptyForm<Unit> | null {
    const unit = this.units.at(index)
    const form = unit === undefined ? null : this.emptyFormOf(unit)
    return form?.kind === "empty-description-block" && form.units[0] === unit
      ? form
      : null
  }

  /**
   * ast/state.md, StateIgnoredText: the text of the empty strings, the
   * empty description blocks, and the `%%` among `units`, from the first to
   * the last, each unit an item of its own, of the kind of its unit
   * (ast/state.md, Tokens): an empty string a `String` item, the `accDescr`
   * of a block a `Keyword` item and its braces `Punctuator` items, a `%%` a
   * `RawText` item.
   */
  private ignoredTextOfUnits(units: readonly Unit[]): StateIgnoredText {
    for (const unit of units) this.addItem(ignoredUnitKindOf(unit), [unit])
    const place = this.placeOf(units)
    return {
      type: "StateIgnoredText",
      value: this.textOf(place.range),
      ...place,
    }
  }

  /** Composite states: `( "{" line* "}" )?`, the body; null without one. */
  private parseBody(): StateStatement[] | null {
    const opening = this.takeIf("{")
    if (opening === null) return null
    this.addItem("Punctuator", [opening])
    const body = this.parseLines(true)
    this.addItem("Punctuator", [this.take("}")])
    return body
  }

  /**
   * Aliases: `"state"? empty-string* string empty-string* "as" alias-id?
   * ( ":" second-description? ignored-text? )? ( ignored-text? "{" line*
   * "}" )?`, whose empty strings before and after the string are
   * `textBeforeDescription` and `textAfterDescription`.
   */
  private parseAliasStatement(
    start: number,
    textBeforeDescription: StateIgnoredText | null,
  ): StateAliasDefinitionStatement {
    const description = this.stringLiteralOf(this.take("string"))
    const textAfterDescription = this.parseEmptyStrings()
    this.addItem("Keyword", [this.take("as")])
    const aliasId = this.takeIf("alias-id")
    const id = this.optionalLiteral(aliasId)
    if (id !== null && aliasId !== null) this.stateIds.set(id, aliasId.text)
    const colon = this.takeIf(":")
    if (colon !== null) this.addItem("Punctuator", [colon])
    const secondDescription = this.optionalLiteral(
      this.takeIf("second-description"),
    )
    const textAfter =
      colon === null
        ? null
        : this.optionalIgnoredText(this.takeIf("ignored-text"))
    return {
      type: "StateAliasDefinitionStatement",
      textBeforeDescription,
      description,
      textAfterDescription,
      id,
      secondDescription,
      textAfter,
      textBeforeBody: this.parseTextBeforeBody(),
      body: this.parseBody(),
      ...this.placeFrom(start),
    }
  }

  /** Notes: `'"'+`, the quotes of a floating note, each a `Punctuator` token. */
  private takeQuotes(): void {
    this.addItem("Punctuator", [this.take('"')])
    for (
      let quote = this.takeIf('"');
      quote !== null;
      quote = this.takeIf('"')
    ) {
      this.addItem("Punctuator", [quote])
    }
  }

  /**
   * ast.md, Shared leaf nodes > StringLiteral: the StringLiteral of the
   * `string` unit `unit`, one `String` item. Its value is the text of its
   * range without its quotes; a string of a state diagram is always closed.
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

  /** Pseudostates: `"state"? pseudostate-name? pseudostate-mark`. */
  private parsePseudostateStatement(
    start: number,
  ): StatePseudostateDefinitionStatement {
    const id = this.optionalLiteral(this.takeIf("pseudostate-name"))
    const unit = this.peek()
    const mark = PSEUDOSTATE_MARKS.find((candidate) => candidate === unit?.name)
    if (unit === null || mark === undefined) throw this.unexpected(unit)
    this.addItem("Keyword", [this.take(mark)])
    const kind = PSEUDOSTATE_KINDS[mark]
    return {
      type: "StatePseudostateDefinitionStatement",
      id,
      kind,
      ...this.placeFrom(start),
    }
  }

  /** Diagram and statements: `"--"`, a divider. */
  private parseDivider(): StateStatement {
    const start = this.next
    this.addItem("Punctuator", [this.take("--")])
    return { type: "StateDividerStatement", ...this.placeFrom(start) }
  }

  /**
   * Notes: `note-statement = "note" position ignored-text? note-id? ( ":"
   * note-text? | note-text? "end note" )` and `floating-note-statement =
   * "note" '"'+ floating-note-text '"'+ "as" floating-note-id?`.
   */
  private parseNoteStatement():
    StateNoteStatement | StateFloatingNoteStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("note")])
    if (this.nameAt(this.next) === '"') {
      this.takeQuotes()
      const text = this.optionalLiteral(this.take("floating-note-text"))
      this.takeQuotes()
      this.addItem("Keyword", [this.take("as")])
      return {
        type: "StateFloatingNoteStatement",
        text,
        id: this.optionalLiteral(this.takeIf("floating-note-id")),
        ...this.placeFrom(start),
      }
    }
    const position = this.take("position")
    this.addItem("Keyword", [position])
    const textBeforeState = this.optionalIgnoredText(
      this.takeIf("ignored-text"),
    )
    const noteId = this.takeIf("note-id")
    const state = noteId === null ? null : this.identifierOf([noteId])
    const colon = this.takeIf(":")
    let text: StateLiteral | null
    if (colon !== null) {
      this.addItem("Punctuator", [colon])
      text = this.optionalLiteral(this.take("note-text"))
    } else {
      text = this.optionalLiteral(this.takeIf("note-text"))
      this.addItem("Keyword", [this.take("end note")])
    }
    return {
      type: "StateNoteStatement",
      position: this.textOfUnit(position).toLowerCase().startsWith("left")
        ? "left"
        : "right",
      textBeforeState,
      state,
      text,
      ...this.placeFrom(start),
    }
  }

  /**
   * Click statements: `click-statement = "click" state-reference (
   * string-or-empty string-or-empty | "href" string-or-empty )`, which a
   * `statement-end` follows (Empty description blocks before a separator:
   * `statement-end = empty-description-block* ( newline | end-of-text )`).
   * The empty description blocks are statements of their own, and the
   * `newline` unit is left to the next line.
   */
  private parseClickStatement(): StateClickStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("click")])
    const reference = this.parseStateReference()
    let url: StringLiteral
    let tooltip: StringLiteral | null = null
    const href = this.takeIf("href")
    if (href !== null) {
      this.addItem("Keyword", [href])
      url = this.stringLiteralOf(this.take("string"))
    } else {
      url = this.stringLiteralOf(this.take("string"))
      tooltip = this.stringLiteralOf(this.take("string"))
    }
    this.statementEndAt(["newline"], true)
    return {
      type: "StateClickStatement",
      reference,
      url,
      tooltip,
      ...this.placeFrom(start),
    }
  }

  /** Other statements: `class-def-statement = "classDef" class-name styles`. */
  private parseClassDefStatement(): StateClassDefStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("classDef")])
    const cssClass = this.identifierOf([this.take("class-name")])
    return {
      type: "StateClassDefStatement",
      cssClass,
      styles: this.parseStyles(),
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `styles = style? ( "," style? )*`, with the
   * `style-text` units: the styles, an empty one making no node.
   */
  private parseStyles(): StateLiteral[] {
    const styles: StateLiteral[] = []
    for (;;) {
      const style = this.optionalLiteral(this.takeIf("style-text"))
      if (style !== null) styles.push(style)
      const comma = this.takeIf(",")
      if (comma === null) return styles
      this.addItem("Punctuator", [comma])
    }
  }

  /** Other statements: `class-statement = "class" id ( "," id )* css-class?`. */
  private parseClassStatement(): StateClassStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("class")])
    const states = [this.identifierOf([this.take("id")])]
    for (
      let comma = this.takeIf(",");
      comma !== null;
      comma = this.takeIf(",")
    ) {
      this.addItem("Punctuator", [comma])
      states.push(this.identifierOf([this.take("id")]))
    }
    return {
      type: "StateClassStatement",
      states,
      cssClass: this.optionalLiteral(this.takeIf("css-class")),
      ...this.placeFrom(start),
    }
  }

  /** Other statements: `style-statement = "style" id? ( "," id? )* styles`. */
  private parseStyleStatement(): StateStyleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("style")])
    const states: (Identifier | null)[] = []
    for (;;) {
      const id = this.takeIf("id")
      states.push(id === null ? null : this.identifierOf([id]))
      const comma = this.takeIf(",")
      if (comma === null) break
      this.addItem("Punctuator", [comma])
    }
    return {
      type: "StateStyleStatement",
      states,
      styles: this.parseStyles(),
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `direction-statement = "direction-text"?
   * "direction" "direction-value" "direction-text"?`. A `direction-text`
   * unit is a StateIgnoredText.
   */
  private parseDirectionStatement(): StateDirectionStatement {
    const start = this.next
    const textBefore = this.optionalIgnoredText(this.takeIf("direction-text"))
    this.addItem("Keyword", [this.take("direction")])
    const value = this.take("direction-value")
    this.addItem("Keyword", [value])
    const textAfter = this.optionalIgnoredText(this.takeIf("direction-text"))
    return {
      type: "StateDirectionStatement",
      textBefore,
      direction: directionOf(value.text),
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `accessibility-statement = "accTitle" ":" title-text?
   * | "accDescr" ":" description-text? | "accDescr" "{"
   * description-block-text? ( "}" | end-of-text )`.
   */
  private parseAccessibilityStatement(): StateStatement {
    const start = this.next
    if (this.nameAt(this.next) === "accTitle") {
      this.addItem("Keyword", [this.take("accTitle")])
      this.addItem("Punctuator", [this.take(":")])
      return {
        type: "StateAccTitleStatement",
        value: this.optionalLiteral(this.takeIf("title-text")),
        ...this.placeFrom(start),
      }
    }
    this.addItem("Keyword", [this.take("accDescr")])
    const colon = this.takeIf(":")
    if (colon !== null) {
      this.addItem("Punctuator", [colon])
      return {
        type: "StateAccDescrStatement",
        value: this.optionalLiteral(this.takeIf("description-text")),
        ...this.placeFrom(start),
      }
    }
    this.addItem("Punctuator", [this.take("{")])
    const value = this.optionalLiteral(this.takeIf("description-block-text"))
    const closing = this.takeIf("}")
    if (closing !== null) this.addItem("Punctuator", [closing])
    else if (this.peek() !== null) throw this.unexpected(this.peek())
    return {
      type: "StateAccDescrBlockStatement",
      value,
      closed: closing !== null,
      ...this.placeFrom(start),
    }
  }

  /** Other statements: `scale-statement = "scale" number "width"`. */
  private parseScaleStatement(): StateStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("scale")])
    const width = this.numericLiteralOf(this.take("number"))
    this.addItem("Keyword", [this.take("width")])
    return { type: "StateScaleStatement", width, ...this.placeFrom(start) }
  }

  /** Other statements: `"hide"`. */
  private parseHideStatement(): StateStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("hide")])
    return {
      type: "StateHideEmptyDescriptionStatement",
      ...this.placeFrom(start),
    }
  }

  /**
   * The error of a known divergence for the unit `unit`, which the grammar
   * cannot read where it stands: a unit of an empty description block that
   * does not start a statement, or the unit right after an empty
   * description block, which mermaid.js reads as if the block were not
   * there, as the `-->` in `A accDescr {} --> B`
   * (known-divergences/tokenless-empty-forms.md).
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    const own = this.emptyFormErrorAt(unit)
    if (own !== null) return own
    const previous = this.units[this.units.indexOf(unit) - 1]
    return previous === undefined ? null : this.emptyFormErrorAt(previous)
  }
}

/** ast/state.md, Tokens: the kind of the unit `unit` of a StateIgnoredText. */
function ignoredUnitKindOf(unit: Unit): DiagramTokenKind {
  switch (unit.name) {
    case "empty-string":
      return "String"
    case "accDescr":
      return "Keyword"
    case "{":
    case "}":
      return "Punctuator"
    case "ignored-text":
      return "RawText"
    default:
      throw new Error(
        `mmd-toolkit parser bug: the unit ${unit.name} in an ignored text`,
      )
  }
}

/** The direction line: the value of a `direction-value` unit, written in any case. */
function directionOf(text: string): StateDirection {
  const direction = DIRECTIONS.find(
    (candidate) => candidate === text.toUpperCase(),
  )
  if (direction === undefined) {
    throw new Error(`mmd-toolkit parser bug: the direction ${text}`)
  }
  return direction
}
