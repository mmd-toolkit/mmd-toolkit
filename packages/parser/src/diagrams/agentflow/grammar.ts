import { GraphGrammar } from "../../graph-grammar.ts"
import type { NodePlace } from "../../unit-grammar.ts"
import type { ClosedArrowParts, OpeningArrowParts } from "./arrows.ts"
import type {
  DiagramTokenKind,
  Identifier,
  Range,
  StringLiteral,
} from "../../ast.ts"
import type {
  AgentflowAccDescrBlockStatement,
  AgentflowAccDescrStatement,
  AgentflowAccTitleStatement,
  AgentflowArrow,
  AgentflowClassDefStatement,
  AgentflowClassStatement,
  AgentflowClickCallbackStatement,
  AgentflowClickUrlStatement,
  AgentflowDataBlock,
  AgentflowDefaultLinkStyleStatement,
  AgentflowDirectionStatement,
  AgentflowEmptyStatement,
  AgentflowIgnoredText,
  AgentflowLabel,
  AgentflowLabelKind,
  AgentflowLink,
  AgentflowLinkStyleStatement,
  AgentflowLinkTarget,
  AgentflowLiteral,
  AgentflowOpeningArrow,
  AgentflowShape,
  AgentflowShapeName,
  AgentflowShapeProperty,
  AgentflowStatement,
  AgentflowStatementDirection,
  AgentflowStyleStatement,
  AgentflowFlowStatement,
  AgentflowGlobalStatement,
  AgentflowConnectorStatement,
  AgentflowName,
  AgentflowVertex,
  AgentflowVertexGroup,
  AgentflowVertexStatement,
} from "../../ast/agentflow.ts"

import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import type { EmptyForm } from "../../empty-forms.ts"

import type { AgentflowLexing, Unit, UnitName } from "./units.ts"
/**
 * What the grammar makes of the units of a agentflow: the header's
 * direction, the statements, and the tokens. The
 * grammar reads the diagram text, which has no directives (diagrams/
 * agentflow.md, Directives inside units), so a directive can lie inside
 * the range of a unit or of a token here.
 */
export interface AgentflowSyntax {
  /** The direction of the header, as written; null when there is none. */
  readonly direction: string | null
  /** The statements of the diagram, in source order. */
  readonly body: readonly AgentflowStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** Diagram and statements: the units of a `separator`, besides the end of the text. */
const SEPARATORS: readonly UnitName[] = ["newline", ";", "comment"]

/** Grammar, Names: the units of a `name-piece`. */
const NAME_PIECES: readonly UnitName[] = [
  "number",
  "id-run",
  "letter",
  "space",
  "-",
  "&",
  ":",
  "*",
  "#",
  "v",
  "^",
  "style",
  "linkStyle",
  "classDef",
  "class",
  "header-keyword",
  "flow",
  "connector",
  "global",
  "click-id",
  "click-comma",
  "end",
]

/**
 * Labels, Links, and Names: what a rule of the form `( string |
 * markdown-string | piece ) piece*` has read.
 */
interface LabelUnits {
  /** The kind of the label. */
  readonly kind: AgentflowLabelKind
  /** Its units. */
  readonly units: readonly Unit[]
  /**
   * What its value leaves out of its range: the delimiters of the string or
   * markdown string that it starts with; none for a text.
   */
  readonly delimiters: readonly Range[]
}

/**
 * diagrams/agentflow.md, Grammar: the recursive-descent parser over the
 * units of the agentflow lexer. Each method reads one rule of the grammar,
 * which its comment names, and makes the node that the specification gives
 * for the rule, with the tokens of `docs/tokens/agentflow.md`, Tokens.
 *
 * The parser reads units only; it moves no cursor in the source. A unit
 * that no rule takes makes the input rejected, such as the units of an
 * empty form (known-divergences/tokenless-empty-forms.md), for which
 * {@link AgentflowGrammar.unexpected} names the form.
 */
export class AgentflowGrammar extends GraphGrammar<
  "flow" | "connector" | "global" | "comment",
  ClosedArrowParts | OpeningArrowParts,
  AgentflowDataBlock,
  AgentflowShape,
  AgentflowShapeProperty,
  AgentflowLabel,
  AgentflowLiteral
> {
  /** The units of the lexer, with the empty description blocks that the grammar takes out of its units. */
  private readonly lexing: AgentflowLexing

  public constructor(lexing: AgentflowLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, EMPTY_FORM_KINDS.agentflow, lexing.comments)
    this.lexing = lexing
  }

  /** The data block node of ast/agentflow.md. */
  protected override dataBlockOf(
    value: string,
    place: NodePlace,
  ): AgentflowDataBlock {
    return { type: "AgentflowDataBlock", value, ...place }
  }

  /** The shape node of ast/agentflow.md. */
  protected override shapeOf(
    name: AgentflowShapeName,
    property: AgentflowShapeProperty | null,
    label: AgentflowLabel,
    place: NodePlace,
  ): AgentflowShape {
    return { type: "AgentflowShape", name, property, label, ...place }
  }

  /** The property node of ast/agentflow.md. */
  protected override shapePropertyOf(
    name: Identifier,
    value: Identifier,
    place: NodePlace,
  ): AgentflowShapeProperty {
    return { type: "AgentflowShapeProperty", name, value, ...place }
  }

  /**
   * Grammar, Diagram and statements: `diagram = header line*`, with
   * `header = header-keyword ( no-direction | header-direction (
   * empty-description-block* ";" | space* empty-description-block* newline
   * ) )`. The header is read
   * without its empty description blocks, as a statement is (see
   * {@link AgentflowGrammar.takeOutStatementEnd}); they are the first
   * statements of the body.
   */
  public parseDiagram(): AgentflowSyntax {
    this.takeWhile(["space", "newline", "comment"])
    this.addItem("Keyword", [this.take("header-keyword")])
    let direction: string | null = null
    let headerBlocks: AgentflowAccDescrBlockStatement[] = []
    if (this.takeIf("no-direction") === null) {
      const blocks = this.takeOutStatementEnd()
      const headerDirection = this.take("header-direction")
      this.addItem("Keyword", [headerDirection])
      direction = this.textOfUnit(headerDirection)
      const semicolon = this.takeIf(";")
      if (semicolon !== null) {
        this.addItem("Punctuator", [semicolon])
      } else {
        this.takeAll("space")
        if (this.takeIf("comment") === null) this.take("newline")
      }
      headerBlocks = blocks.map((units) =>
        this.emptyDescriptionBlockStatementOf(units),
      )
    }
    const body = [...headerBlocks, ...this.parseLines(false)]
    return {
      direction,
      body,
      tokens: this.tokensInOrder(),
    }
  }

  /**
   * Diagram and statements: `line*`, where `line = statement |
   * empty-statement | newline | space`. Inside a flow or global the lines end
   * before its `end`; otherwise they end at the end of the text.
   */
  private parseLines(insideContainer: boolean): AgentflowStatement[] {
    const statements: AgentflowStatement[] = []
    for (;;) {
      const unit = this.peek()
      if (unit === null) {
        if (insideContainer) throw this.unexpected(null)
        return statements
      }
      if (unit.name === "end") {
        if (!insideContainer) throw this.unexpected(unit)
        return statements
      }
      if (
        unit.name === "newline" ||
        unit.name === "space" ||
        unit.name === "comment"
      ) {
        this.advance()
      } else if (unit.name === ";") {
        statements.push(this.parseEmptyStatement())
      } else {
        statements.push(...this.parseStatement(unit))
      }
    }
  }

  /** Diagram and statements: `empty-statement = ";"`. */
  private parseEmptyStatement(): AgentflowEmptyStatement {
    const start = this.next
    this.addItem("Punctuator", [this.take(";")])
    return { type: "AgentflowEmptyStatement", ...this.placeFrom(start) }
  }

  /**
   * Diagram and statements: `statement`, with the empty description
   * blocks after it. The vertex, style, class definition, class, link
   * style, and click statements end with a `statement-end`, whose
   * separator belongs to no statement; the others need no separator.
   */
  private parseStatement(first: Unit): AgentflowStatement[] {
    switch (first.name) {
      case "flow":
        return [this.parseFlowStatement()]
      case "global":
        return [this.parseGlobalStatement()]
      case "connector":
        return this.parseConnectorStatement()
      case "direction-text":
      case "direction":
        return [this.parseDirectionStatement()]
      case "accTitle":
        return [this.parseTitleStatement()]
      case "accDescr":
        return [this.parseDescriptionStatement()]
      default: {
        const blocks = this.takeOutStatementEnd()
        return [
          this.parseStatementWithSeparator(first),
          ...this.parseStatementEnd(blocks),
        ]
      }
    }
  }

  /** Diagram and statements: the statements that a separator follows. */
  private parseStatementWithSeparator(
    first: Unit,
  ):
    | AgentflowVertexStatement
    | AgentflowStyleStatement
    | AgentflowClassDefStatement
    | AgentflowClassStatement
    | AgentflowLinkStyleStatement
    | AgentflowDefaultLinkStyleStatement
    | AgentflowClickCallbackStatement
    | AgentflowClickUrlStatement {
    switch (first.name) {
      case "style":
        return this.parseStyleStatement()
      case "classDef":
        return this.parseClassDefStatement()
      case "class":
        return this.parseClassStatement()
      case "linkStyle":
        return this.parseLinkStyleStatement()
      case "click":
        return this.parseClickStatement()
      default:
        return this.parseVertexStatement()
    }
  }

  /**
   * Empty description blocks before a separator: the grammar reads a
   * statement and its `statement-end = empty-description-block* separator`
   * without their empty description blocks, so the `space` units before,
   * between, and after them are the whitespace at the end of the statement.
   * Before a statement that needs a separator, this takes the blocks of its
   * `statement-end` out of the units, and gives their units: the blocks in
   * the run of `space` units and empty description blocks right before the
   * first `newline` or `;` unit from the next unit, or before the end of the
   * text, after the last unit of the statement; none when the run starts at
   * the next unit, where the statement has no unit of its own. No `newline`
   * or `;` unit lies inside a statement that needs a separator. The header
   * is read the same way.
   */
  private takeOutStatementEnd(): (readonly Unit[])[] {
    let separator = this.next
    for (
      let name = this.nameAt(separator);
      name !== null && !SEPARATORS.includes(name);
      name = this.nameAt(separator)
    ) {
      separator = this.positionAfter(separator)
    }
    const blocks: (readonly Unit[])[] = []
    let unit = this.unreadUnitBefore(separator)
    while (unit !== null) {
      const form = this.emptyFormOf(unit)
      if (unit.name === "space") {
        unit = this.unreadUnitBefore(unit.index)
      } else if (
        form?.kind === "empty-description-block" &&
        form.units.at(-1) === unit
      ) {
        blocks.unshift(form.units)
        unit = this.unreadUnitBefore(form.units[0].index)
      } else {
        this.takeOut(blocks.flat())
        return blocks
      }
    }
    return []
  }

  /** The unit before the position `position` that is not read yet; null when the next unit is at `position` or after it. */
  private unreadUnitBefore(position: number): Unit | null {
    const before = this.positionBefore(position)
    return before < this.next ? null : this.unitAt(before)
  }

  /**
   * Empty description blocks before a separator: `statement-end =
   * empty-description-block* separator`, with `separator = newline | ";" |
   * end-of-text`, whose blocks, the units `blocks`, were taken out of the
   * units ({@link AgentflowGrammar.takeOutStatementEnd}): the blocks, each a
   * description block statement without text; the separator is taken.
   */
  private parseStatementEnd(
    blocks: readonly (readonly Unit[])[],
  ): AgentflowAccDescrBlockStatement[] {
    const separator = this.peek()
    if (separator !== null) {
      if (!SEPARATORS.includes(separator.name)) {
        throw this.unexpected(separator)
      }
      this.advance()
      if (separator.name === ";") this.addItem("Punctuator", [separator])
    }
    return blocks.map((units) => this.emptyDescriptionBlockStatementOf(units))
  }

  /**
   * Empty description blocks before a separator: the description block
   * statement without text of the `empty-description-block` whose units,
   * taken out of the units, are `units`.
   */
  private emptyDescriptionBlockStatementOf(
    units: readonly Unit[],
  ): AgentflowAccDescrBlockStatement {
    const [keyword, opening, closing] = units
    this.addItem("Keyword", [keyword])
    this.addItem("Punctuator", [opening])
    this.addItem("Punctuator", [closing])
    return {
      type: "AgentflowAccDescrBlockStatement",
      value: null,
      closed: true,
      ...this.placeOf(units),
    }
  }

  /** AgentflowVertexStatement: the diagram's node for the shared production. */
  private parseVertexStatement(): AgentflowVertexStatement {
    return {
      type: "AgentflowVertexStatement",
      ...this.readVertexStatement(
        () => this.parseVertexGroup(),
        () => this.parseLink(),
      ),
    }
  }

  /** AgentflowVertexGroup: the diagram's node for the shared production. */
  private parseVertexGroup(): AgentflowVertexGroup {
    return {
      type: "AgentflowVertexGroup",
      ...this.readVertexGroup(() => this.parseVertex()),
    }
  }

  /** AgentflowVertex: the diagram's node for the shared production. */
  private parseVertex(): AgentflowVertex {
    return { type: "AgentflowVertex", ...this.readVertex() }
  }

  /** Labels: `label = ( string | markdown-string | text-run ) text-run*`. */
  protected override parseLabel(): AgentflowLabel {
    return this.labelOf(
      this.parseStartingWithString(() => this.takeWhile(["text-run"])),
    )
  }

  /**
   * Labels, Links, and Names: the rules of the form `( string |
   * markdown-string | piece ) piece*`, whose pieces `takePieces` reads. The
   * kind is `string` or `markdown` when a string or a markdown string comes
   * first, a `String` item, and `text` otherwise; the pieces are one
   * `RawText` item. Returns the kind and all the units.
   */
  private parseStartingWithString(takePieces: () => Unit[]): LabelUnits {
    const first = this.peek()
    if (first === null) throw this.unexpected(null)
    let kind: AgentflowLabelKind = "text"
    let delimiters: readonly Range[] = []
    const units: Unit[] = []
    if (first.name === "string" || first.name === "markdown-string") {
      kind = first.name === "string" ? "string" : "markdown"
      this.advance()
      this.addItem("String", [first])
      units.push(first)
      // Labels and Strings: every delimiter of the string contexts, however
      // they nest, is left out; the content is the one run.
      delimiters = this.delimitersOf(first)
    }
    const pieces = takePieces()
    const significant = pieces.filter(
      (piece) => piece.significantRange !== null,
    )
    const contentStart =
      units.length > 0
        ? pieces.at(0)?.start
        : significant.at(0)?.significantRange?.[0]
    const contentEnd = significant.at(-1)?.significantRange?.[1]
    if (contentStart !== undefined && contentEnd !== undefined) {
      for (let index = 0; index < pieces.length; index += 1) {
        const piece = pieces[index]
        const start = Math.max(contentStart, piece.start)
        const end = Math.min(contentEnd, piece.end)
        if (start < end)
          pieces[index] = { ...piece, significantRange: [start, end] }
      }
    }
    if (units.length === 0 && pieces.length === 0) throw this.unexpected(first)
    // The text after a string goes on with the value that the string
    // starts.
    if (units.length > 0) this.addItemContinuingValue("RawText", pieces)
    else this.addItem("RawText", pieces)
    const firstPiece = pieces.at(0)
    const lastPiece = pieces.at(-1)
    if (
      units.length === 0 &&
      firstPiece !== undefined &&
      lastPiece !== undefined &&
      pieces.every((piece) => piece.significantRange === null)
    ) {
      // A label that is all whitespace has one token of that whitespace,
      // which is its value (docs/tokens.md, Tokens).
      this.addWhitespaceToken("RawText", [firstPiece.start, lastPiece.end])
    }
    units.push(...pieces)
    return { kind, units, delimiters }
  }

  /**
   * ast/agentflow.md, AgentflowLabel: the label read by
   * {@link AgentflowGrammar.parseStartingWithString}. Its value is the text
   * of its range without the delimiters of the string that it starts with.
   */
  private labelOf({ kind, units, delimiters }: LabelUnits): AgentflowLabel {
    const place = this.placeOf(units)
    return {
      type: "AgentflowLabel",
      kind,
      value: this.textOf(place.range, [
        ...delimiters,
        ...this.lexing.comments
          .filter(
            (comment) =>
              comment.range[0] >= place.range[0] &&
              comment.range[1] <= place.range[1],
          )
          .map((comment) => comment.range),
      ]),
      ...place,
    }
  }

  /** AgentflowLink: the diagram's node for the shared production. */
  private parseLink(): AgentflowLink {
    return {
      type: "AgentflowLink",
      ...this.readLink(
        () => this.parseVertexGroup(),
        (unit) => this.arrowOf(unit),
        (unit) => this.openingArrowOf(unit),
        () => this.parseLinkText(),
      ),
    }
  }

  /**
   * ast/agentflow.md, AgentflowArrow: the closed arrow of the `arrow` unit
   * `unit`, one `Punctuator` item, with the parts that the lexer read.
   */
  private arrowOf(unit: Unit): AgentflowArrow {
    this.addItem("Punctuator", [unit])
    const parts = unit.arrow
    if (parts?.form !== "closed") {
      throw new Error(
        `mmd-toolkit parser bug: the arrow unit at ${unit.start} has no closed arrow`,
      )
    }
    const place = this.placeOf([unit])
    return {
      type: "AgentflowArrow",
      value: this.textOf(place.range),
      startMarker: parts.startMarker,
      line: parts.line,
      length: parts.length,
      endMarker: parts.endMarker,
      ...place,
    }
  }

  /**
   * ast/agentflow.md, AgentflowOpeningArrow: the opening arrow of the
   * `opening-arrow` unit `unit`, one `Punctuator` item, with the parts that
   * the lexer read.
   */
  private openingArrowOf(unit: Unit): AgentflowOpeningArrow {
    this.addItem("Punctuator", [unit])
    const parts = unit.arrow
    if (parts?.form !== "opening") {
      throw new Error(
        `mmd-toolkit parser bug: the opening-arrow unit at ${unit.start} has no opening arrow`,
      )
    }
    const place = this.placeOf([unit])
    return {
      type: "AgentflowOpeningArrow",
      value: this.textOf(place.range),
      startMarker: parts.startMarker,
      line: parts.line,
      ...place,
    }
  }

  /**
   * Links: `link-text = ( string | markdown-string | link-text-char )
   * link-text-char*`. The label of a link text is built like a label.
   */
  private parseLinkText(): AgentflowLabel {
    return this.labelOf(
      this.parseStartingWithString(() => this.takeWhile(["link-text-char"])),
    )
  }

  /** Flows, globals, connectors, and names: optional flow heading, then a body through end. */
  private parseFlowStatement(): AgentflowFlowStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("flow")])
    let name: AgentflowName | null = null
    let title: AgentflowLabel | null = null
    let data: AgentflowDataBlock[] = []
    if (this.takeIf("space") !== null) {
      name = this.parseFlowName("flow")
      title = this.parseHeadingTitle()
      data = this.parseData()
    }
    const body = [...this.parseHeadingEnd(), ...this.parseLines(true)]
    this.checkFlowMembers(body)
    this.addItem("Keyword", [this.take("end")])
    return {
      type: "AgentflowFlowStatement",
      name,
      title,
      data,
      body,
      ...this.placeFrom(start),
    }
  }

  /** A global heading has no name, title, or data. */
  private parseGlobalStatement(): AgentflowGlobalStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("global")])
    const body = [...this.parseHeadingEnd(), ...this.parseLines(true)]
    this.addItem("Keyword", [this.take("end")])
    return { type: "AgentflowGlobalStatement", body, ...this.placeFrom(start) }
  }

  /** A connector has a required name and no body or end keyword. */
  private parseConnectorStatement(): AgentflowStatement[] {
    const start = this.next
    this.addItem("Keyword", [this.take("connector")])
    this.take("space")
    const name = this.parseFlowName("connector")
    const title = this.parseHeadingTitle()
    const data = this.parseData()
    const range: Range = [
      this.unitAt(start)!.start,
      Math.max(this.placeFrom(start).range[1], name.range[1]),
    ]
    const statement: AgentflowConnectorStatement = {
      type: "AgentflowConnectorStatement",
      name,
      title,
      data,
      range,
      loc: this.lines.location(range),
    }
    return [statement, ...this.parseHeadingEnd()]
  }

  /** Empty blocks immediately after a completed heading begin its following statements. */
  private parseHeadingEnd(): AgentflowAccDescrBlockStatement[] {
    const statements: AgentflowAccDescrBlockStatement[] = []
    while (
      this.peek() !== null &&
      this.emptyFormOf(this.peek()!)?.kind === "empty-description-block"
    )
      statements.push(this.parseDescriptionBlock())
    const blocks = this.takeOutStatementEnd()
    return [...statements, ...this.parseStatementEnd(blocks)]
  }

  /** The optional explicit bracket title after a flow/connector name. */
  private parseHeadingTitle(): AgentflowLabel | null {
    const bracket = this.takeIf("[")
    if (bracket === null) return null
    this.addItem("Punctuator", [bracket])
    const title = this.parseLabel()
    this.addItem("Punctuator", [this.take("]")])
    return title
  }

  /** AgentflowName: retain maximal fragments, erased forms, and click-context boundaries. */
  private parseFlowName(heading: "flow" | "connector"): AgentflowName {
    const parts: (AgentflowLabel | AgentflowIgnoredText)[] = []
    let initial = true
    let clickNeedsFragment = false
    // Recognized empty strings count as a click read; flow text still needs its context exit.
    let emptyClickStringEnd: number | null = null
    while (this.peek() !== null) {
      const first = this.peek()!
      if (
        emptyClickStringEnd !== null &&
        this.clickExitBetween(emptyClickStringEnd, first.start)
      ) {
        clickNeedsFragment = false
        emptyClickStringEnd = null
      }
      const form = this.emptyFormOf(first)
      if (first.name === "click" || form !== null) {
        if (clickNeedsFragment && first.name !== "empty-string")
          throw this.unexpected(first)
        const units = first.name === "click" ? [first] : form!.units
        this.moveTo(this.positionAfter(units[units.length - 1].index))
        parts.push(
          this.retainedTextOf(
            units,
            first.name === "click" ? "click" : this.retainedFormKind(form!),
          ),
        )
        if (first.name === "click") clickNeedsFragment = true
        else if (clickNeedsFragment) emptyClickStringEnd = units.at(-1)!.end
        continue
      }
      if (
        heading === "flow" &&
        clickNeedsFragment &&
        emptyClickStringEnd !== null &&
        first.name !== "string" &&
        first.name !== "markdown-string"
      )
        throw this.unexpected(first)
      const quoted =
        initial && (first.name === "string" || first.name === "markdown-string")
      if (!quoted && !NAME_PIECES.includes(first.name)) break
      const units: Unit[] = []
      let kind: AgentflowLabelKind = "text"
      let delimiters: readonly Range[] = []
      if (quoted) {
        this.advance()
        units.push(first)
        kind = first.name === "string" ? "string" : "markdown"
        delimiters = this.delimitersOf(first)
        this.addItem("String", [first])
      }
      const pieces: Unit[] = []
      while (this.peek() !== null && NAME_PIECES.includes(this.peek()!.name)) {
        const unit = this.peek()!
        if (
          units.length + pieces.length > 0 &&
          this.clickExitBetween(
            (pieces.at(-1) ?? units.at(-1))!.end,
            unit.start,
          )
        )
          break
        pieces.push(withWhitespaceKept(unit))
        this.advance()
      }
      this.addItem("RawText", pieces)
      units.push(...pieces)
      if (units.length === 0) break
      parts.push(this.labelOf({ kind, units, delimiters }))
      initial = false
      clickNeedsFragment = false
      emptyClickStringEnd = null
    }
    if (
      (clickNeedsFragment && emptyClickStringEnd === null) ||
      !parts.some((part) => part.type === "AgentflowLabel")
    )
      throw this.unexpected(this.peek())
    const range: Range = [parts[0].range[0], parts[parts.length - 1].range[1]]
    return {
      type: "AgentflowName",
      parts,
      range,
      loc: this.lines.location(range),
    }
  }

  /** One whitespace character that leaves the click context splits Name fragments. */
  private clickExitBetween(start: number, end: number): boolean {
    return this.lexing.clickContextExits.some(
      (range) => range[0] >= start && range[1] <= end,
    )
  }

  /** Retained erased forms are RawText, including their delimiters and internal spaces. */
  private retainedTextOf(
    units: readonly Unit[],
    kind: AgentflowIgnoredText["kind"],
  ): AgentflowIgnoredText {
    this.addItem("RawText", units)
    const place = this.placeOf(units)
    return {
      type: "AgentflowIgnoredText",
      kind,
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }

  /** The recognized empty production supplies its kind, including the lexer's string context. */
  private retainedFormKind(
    form: EmptyForm<Unit>,
  ): AgentflowIgnoredText["kind"] {
    switch (form.kind) {
      case "empty-string": {
        const kind = form.units[0].emptyStringKind
        if (kind === null)
          throw new Error("mmd-toolkit parser bug: empty string has no kind")
        return kind
      }
      case "empty-call":
      case "empty-description-block":
        return form.kind
      default:
        throw this.unexpected(form.units[0])
    }
  }

  /** Rejections outside the grammar: check candidate members in their specified order. */
  private checkFlowMembers(body: readonly AgentflowStatement[]): void {
    let hasOwnProperty = false
    const member = (value: string, range: Range): void => {
      const text = value.trim()
      if (text.length === 0) return
      if (hasOwnProperty)
        throw new ParseError(
          "A flow member follows the member hasOwnProperty",
          range,
          this.lines.location(range),
        )
      hasOwnProperty = text === "hasOwnProperty"
    }
    for (const statement of body) {
      switch (statement.type) {
        case "AgentflowVertexStatement":
          for (const group of [
            statement.first,
            ...statement.links.map((link) => link.target),
          ].reverse())
            for (const vertex of group.vertices)
              member(vertex.id.name, vertex.id.range)
          break
        case "AgentflowFlowStatement":
        case "AgentflowConnectorStatement":
          if (statement.name === null) member("unnamed flow", statement.range)
          else
            member(
              statement.name.parts
                .filter((part) => part.type === "AgentflowLabel")
                .map((part) => part.value)
                .join(""),
              statement.name.range,
            )
          break
        case "AgentflowAccTitleStatement":
        case "AgentflowAccDescrStatement":
        case "AgentflowAccDescrBlockStatement":
          if (statement.value !== null)
            member(statement.value.value, statement.value.range)
          break
        case "AgentflowEmptyStatement":
          member(";", statement.range)
          break
        default:
          break
      }
    }
  }

  /** AgentflowStyleStatement: the diagram's node for the shared production. */
  private parseStyleStatement(): AgentflowStyleStatement {
    return { type: "AgentflowStyleStatement", ...this.readStyleStatement() }
  }

  /** AgentflowClassDefStatement: the diagram's node for the shared production. */
  private parseClassDefStatement(): AgentflowClassDefStatement {
    return {
      type: "AgentflowClassDefStatement",
      ...this.readClassDefStatement(),
    }
  }

  /** AgentflowClassStatement: the diagram's node for the shared production. */
  private parseClassStatement(): AgentflowClassStatement {
    return { type: "AgentflowClassStatement", ...this.readClassStatement() }
  }

  /**
   * Style, class, and link style statements: `styles = style ( "," style )*`
   * and `style = ( number | id-run | ":" | "#" | space | "style" )+`. Each
   * style of the tree is one literal, from its start after a `,`, whitespace
   * included, or from its first character that is not whitespace, to its
   * last such character, or null when it is all whitespace. In
   * a `classDef` statement (`inClassDef`), a `,` right after a `\` in the
   * diagram text does not separate two styles of the tree: the styles on
   * its two sides, with the `,`, are one style. The grammar still needs a
   * style after that `,`.
   */
  protected override parseStyles(
    inClassDef: boolean,
  ): (AgentflowLiteral | null)[] {
    const styles: (AgentflowLiteral | null)[] = []
    for (;;) {
      const pieces = this.takeStylePieces()
      if (inClassDef) {
        while (this.escapedCommaFollows(pieces)) {
          pieces.push(this.take(","), ...this.takeStylePieces())
        }
      }
      const allWhitespace = pieces.every(
        (piece) => piece.nonWhitespaceRange === null,
      )
      if (allWhitespace) {
        styles.push(null)
      } else {
        // ast/agentflow.md, AgentflowStyleStatement: mermaid.js reads the
        // whitespace at the start of a style after a `,`.
        styles.push(this.textLiteralOf(withLeadingWhitespaceKept(pieces)))
      }
      const comma = this.takeIf(",")
      if (comma === null) return styles
      this.addItem("Punctuator", [comma])
    }
  }

  /**
   * Style, class, and link style statements: `link-style-statement =
   * "linkStyle" space ( "default" | number ( "," number )* ) space
   * ( "interpolate" space name ( space styles )? | styles )`.
   */
  private parseLinkStyleStatement():
    AgentflowLinkStyleStatement | AgentflowDefaultLinkStyleStatement {
    const parsed = this.readLinkStyleStatement()
    const { interpolate, styles, range, loc } = parsed
    return parsed.indices === null
      ? {
          type: "AgentflowDefaultLinkStyleStatement",
          interpolate,
          styles,
          range,
          loc,
        }
      : {
          type: "AgentflowLinkStyleStatement",
          indices: parsed.indices,
          interpolate,
          styles,
          range,
          loc,
        }
  }

  /** Click statements: the original click id group, then URL or callback and optional prefixes. */
  private parseClickStatement():
    AgentflowClickCallbackStatement | AgentflowClickUrlStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("click")])
    const ids = this.parseCommaList(["click-id"], "click-comma")
    const prefixEnd = this.nameAt(this.afterRetainedPrefixes(this.next))
    const textBeforeUrl =
      prefixEnd === "href" || prefixEnd === "string"
        ? this.parseRetainedPrefixes()
        : []
    const href = this.takeIf("href")
    if (href !== null) {
      this.addItem("Keyword", [href])
      textBeforeUrl.push(...this.parseRetainedPrefixes())
    }
    if (
      this.peek()?.name === "string" ||
      href !== null ||
      textBeforeUrl.length > 0
    ) {
      const url = this.stringLiteralOf(this.take("string"))
      const { textBeforeTooltip, tooltip } = this.parseTooltip()
      let target: AgentflowLinkTarget | null = null
      if (
        this.nameAt(this.next) === "space" &&
        this.nameAt(this.positionAfter(this.next)) === "link-target"
      ) {
        this.advance()
        const unit = this.take("link-target")
        this.addItem("Keyword", [unit])
        target = linkTargetOf(unit.text)
      }
      return {
        type: "AgentflowClickUrlStatement",
        ids,
        textBeforeUrl,
        url,
        textBeforeTooltip,
        tooltip,
        target,
        ...this.placeFrom(start),
      }
    }
    let callback: Identifier | AgentflowLiteral
    let callbackArguments: AgentflowLiteral | null = null
    if (this.peek()?.name === "call") {
      const call = this.parseCallback()
      callback = call.callback
      callbackArguments = call.callbackArguments
    } else callback = this.parseName()
    const { textBeforeTooltip, tooltip } = this.parseTooltip()
    return {
      type: "AgentflowClickCallbackStatement",
      ids,
      callback,
      arguments: callbackArguments,
      textBeforeTooltip,
      tooltip,
      ...this.placeFrom(start),
    }
  }

  /** Only recognized erased forms can fill the existing click-prefix fields. */
  private parseRetainedPrefixes(): AgentflowIgnoredText[] {
    const parts: AgentflowIgnoredText[] = []
    while (this.peek() !== null) {
      const unit = this.peek()!
      const form = this.emptyFormOf(unit)
      if (unit.name !== "click" && form === null) break
      const units = form?.units ?? [unit]
      this.moveTo(this.positionAfter(units[units.length - 1].index))
      parts.push(
        this.retainedTextOf(
          units,
          unit.name === "click" ? "click" : this.retainedFormKind(form!),
        ),
      )
    }
    return parts
  }

  /** Prefix fields require the following URL or tooltip; inspect without consuming the forms. */
  private afterRetainedPrefixes(start: number): number {
    let next = start
    for (;;) {
      const unit = this.unitAt(next)
      if (unit === null) return next
      const form = this.emptyFormOf(unit)
      if (form !== null)
        next = this.positionAfter(form.units[form.units.length - 1].index)
      else if (unit.name === "click") next = this.positionAfter(next)
      else return next
    }
  }

  /** A tooltip needs exactly one space before its optional retained prefix and string. */
  private parseTooltip(): {
    readonly textBeforeTooltip: AgentflowIgnoredText[]
    readonly tooltip: StringLiteral | null
  } {
    if (this.peek()?.name !== "space")
      return { textBeforeTooltip: [], tooltip: null }
    const after = this.positionAfter(this.next)
    if (this.nameAt(this.afterRetainedPrefixes(after)) !== "string")
      return { textBeforeTooltip: [], tooltip: null }
    this.advance()
    const textBeforeTooltip = this.parseRetainedPrefixes()
    const tooltip = this.stringLiteralOf(this.take("string"))
    return { textBeforeTooltip, tooltip }
  }

  /**
   * Diagram and statements: `direction-statement = direction-text?
   * "direction" direction-value direction-text?`.
   */
  private parseDirectionStatement(): AgentflowDirectionStatement {
    const { before, direction, after, range, loc } =
      this.readDirectionStatement()
    return {
      type: "AgentflowDirectionStatement",
      textBefore: this.ignoredTextOf(before),
      direction: statementDirectionOf(direction),
      textAfter: this.ignoredTextOf(after),
      range,
      loc,
    }
  }

  /**
   * ast/agentflow.md, AgentflowIgnoredText: the text that the
   * `direction-text` unit `unit` reads; null when there is no unit or it is
   * all whitespace.
   */
  private ignoredTextOf(unit: Unit | null): AgentflowIgnoredText | null {
    if (unit?.significantRange == null) return null
    const place = this.placeOf([unit])
    return {
      type: "AgentflowIgnoredText",
      kind: "direction-text",
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }

  /** Diagram and statements: `title-statement = "accTitle" ":" title-text?`. */
  private parseTitleStatement(): AgentflowAccTitleStatement {
    return {
      type: "AgentflowAccTitleStatement",
      ...this.readAccessibilityLine("accTitle"),
    }
  }

  /**
   * Diagram and statements: `description-statement = "accDescr" ":"
   * description-text?` and `description-block-statement = "accDescr" "{"
   * description-block-text? ( "}" | end-of-text )`.
   */
  private parseDescriptionStatement():
    AgentflowAccDescrStatement | AgentflowAccDescrBlockStatement {
    if (this.nameAt(this.positionAfter(this.next)) !== ":")
      return this.parseDescriptionBlock()
    return {
      type: "AgentflowAccDescrStatement",
      ...this.readAccessibilityLine("accDescr"),
    }
  }

  /**
   * Diagram and statements: `description-block-statement = "accDescr" "{"
   * description-block-text? ( "}" | end-of-text )`, and the
   * `empty-description-block` of a `statement-end`.
   */
  private parseDescriptionBlock(): AgentflowAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("description-block-text")
    const value = text === null ? null : this.textLiteralOf([text])
    const closing = this.peek() === null ? null : this.take("}")
    if (closing !== null) this.addItem("Punctuator", [closing])
    const range: Range = [
      this.placeFrom(start).range[0],
      closing === null
        ? this.lexer.text.length
        : this.placeFrom(start).range[1],
    ]
    return {
      type: "AgentflowAccDescrBlockStatement",
      value,
      closed: closing !== null,
      range,
      loc: this.lines.location(range),
    }
  }

  /**
   * AgentflowLiteral: the literal whose units are `units`, one `RawText`
   * item. Its value is its written text.
   */
  protected override textLiteralOf(units: readonly Unit[]): AgentflowLiteral {
    return { type: "AgentflowLiteral", ...this.readTextLiteral(units) }
  }

  /** Diagram comments separate label text items even where their units are adjacent. */
  protected override breaksRun(
    kind: DiagramTokenKind,
    previous: Unit,
    unit: Unit,
  ): boolean {
    return (
      super.breaksRun(kind, previous, unit) ||
      this.lexing.comments.some(
        (comment) =>
          comment.range[0] >= previous.end && comment.range[1] <= unit.start,
      )
    )
  }

  /** Empty-form errors are found at the stopped unit or the next non-space unit. */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    const next = this.unitAt(this.afterSpaces(this.positionAfter(unit.index)))
    for (const cause of next === null ? [unit] : [unit, next]) {
      const emptyForm = this.emptyFormErrorAt(cause)
      if (emptyForm !== null) return emptyForm
    }
    return null
  }
}

/** diagrams/agentflow.md, The direction line: the value of a `direction-value` unit. */
function statementDirectionOf(text: string): AgentflowStatementDirection {
  switch (text) {
    case "TB":
    case "BT":
    case "RL":
    case "LR":
    case "TD":
      return text
    default:
      throw new Error(
        `mmd-toolkit parser bug: unknown direction ${JSON.stringify(text)}`,
      )
  }
}

/** diagrams/agentflow.md, The statement context, rule 13: the value of a `link-target` unit. */
function linkTargetOf(text: string): AgentflowLinkTarget {
  switch (text) {
    case "_self":
    case "_blank":
    case "_parent":
    case "_top":
      return text
    default:
      throw new Error(
        `mmd-toolkit parser bug: unknown link target ${JSON.stringify(text)}`,
      )
  }
}

/**
 * `docs/tokens.md`, Tokens: the `space` unit `unit`, whose whitespace mermaid.js reads
 * as part of a value, with a token of all of it, as a unit whose whitespace
 * at its ends is kept (see `UnitEnds`).
 */
function withWhitespaceKept(unit: Unit): Unit {
  return { ...unit, significantRange: [unit.start, unit.end] }
}

/** ast/agentflow.md, AgentflowStyleStatement: the units `pieces` of a style, with the `space` units at their start kept in its tokens. */
function withLeadingWhitespaceKept(pieces: readonly Unit[]): Unit[] {
  const kept = [...pieces]
  for (
    let index = 0;
    index < kept.length && kept[index].name === "space";
    index += 1
  ) {
    kept[index] = withWhitespaceKept(kept[index])
  }
  return kept
}
