import type {
  Identifier,
  NumericLiteral,
  Range,
  StringLiteral,
} from "../../ast.ts"
import type {
  FlowchartAccDescrBlockStatement,
  FlowchartAccDescrStatement,
  FlowchartAccTitleStatement,
  FlowchartArrow,
  FlowchartClassDefStatement,
  FlowchartClassStatement,
  FlowchartClickCallbackStatement,
  FlowchartClickUrlStatement,
  FlowchartDataBlock,
  FlowchartDefaultLinkStyleStatement,
  FlowchartDirectionStatement,
  FlowchartEmptyStatement,
  FlowchartIgnoredText,
  FlowchartLabel,
  FlowchartLabelKind,
  FlowchartLink,
  FlowchartLinkStyleStatement,
  FlowchartLinkTarget,
  FlowchartLiteral,
  FlowchartOpeningArrow,
  FlowchartShape,
  FlowchartShapeName,
  FlowchartShapeProperty,
  FlowchartStatement,
  FlowchartStatementDirection,
  FlowchartStyleStatement,
  FlowchartSubgraphStatement,
  FlowchartVertex,
  FlowchartVertexGroup,
  FlowchartVertexStatement,
} from "../../ast/flowchart.ts"
import { DIGIT_ZERO } from "../../code-points.ts"
import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import { significantRangeOf } from "../../diagram-units.ts"
import type { FlowchartLexing, Unit, UnitName } from "./units.ts"
import type { SubgraphMember } from "./subgraph-members.ts"
import { isNumberedSubgraph, subgraphNameTextOf } from "./subgraph-ids.ts"
import {
  HAS_OWN_PROPERTY,
  isBlank,
  memberAfterHasOwnProperty,
  subgraphMembersOf,
  trimmed,
} from "./subgraph-members.ts"

/**
 * What the grammar makes of the units of a flowchart: the header's
 * direction, the statements, and the tokens. The
 * grammar reads the diagram text, which has no directives (diagrams/
 * flowchart.md, Directives inside units), so a directive can lie inside
 * the range of a unit or of a token here.
 */
export interface FlowchartSyntax {
  /** The direction of the header, as written; null when there is none. */
  readonly direction: string | null
  /** The statements of the diagram, in source order. */
  readonly body: readonly FlowchartStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** Diagram and statements: the units of a `separator`, besides the end of the text. */
const SEPARATORS: readonly UnitName[] = ["newline", ";"]

/** Grammar, Vertex statements: the units that an id is made of. */
const ID_PIECES: readonly UnitName[] = [
  "number",
  "id-run",
  "letter",
  "v",
  "-",
  "default",
  ",",
  ":",
  "&",
  "#",
  "*",
]

/**
 * Grammar, Style, class, and link style statements: the units that a part
 * of an `id-list` is made of: those of an id, other than `,`.
 */
const ID_LIST_PART_PIECES: readonly UnitName[] = [
  "number",
  "id-run",
  "letter",
  "v",
  "-",
  "default",
  ":",
  "&",
  "#",
  "*",
]

/** Grammar, Subgraphs: the units of a `name-piece`. */
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
  "subgraph",
  "end",
]

/** Grammar, Style, class, and link style statements: the units that a style is made of. */
const STYLE_PIECES: readonly UnitName[] = [
  "number",
  "id-run",
  ":",
  "#",
  "space",
  "style",
]

/** Grammar, Style, class, and link style statements: the units that a name is made of. */
const NAME_UNITS: readonly UnitName[] = [
  "number",
  "letter",
  "id-run",
  "v",
  "-",
  ",",
  ":",
  "&",
  "#",
  "*",
]

/** Grammar, Shapes: the units that start a shape. */
const SHAPE_STARTS: readonly UnitName[] = [
  "[",
  "(",
  "(((",
  "{",
  "([",
  "[[",
  "[(",
  ">",
  "(-",
  "[/",
  "[\\",
  "[|",
]

/**
 * Labels, Links, and Subgraphs: what a rule of the form `( string |
 * markdown-string | piece ) piece*` has read.
 */
interface LabelUnits {
  /** The kind of the label. */
  readonly kind: FlowchartLabelKind
  /** Its units. */
  readonly units: readonly Unit[]
  /**
   * What its value leaves out of its range: the delimiters of the string or
   * markdown string that it starts with; none for a text.
   */
  readonly delimiters: readonly Range[]
}

/**
 * diagrams/flowchart.md, Grammar: the recursive-descent parser over the
 * units of the flowchart lexer. Each method reads one rule of the grammar,
 * which its comment names, and makes the node that the specification gives
 * for the rule, with the tokens of `docs/tokens/flowchart.md`, Tokens.
 *
 * The parser reads units only; it moves no cursor in the source. A unit
 * that no rule takes makes the input rejected, such as the units of an
 * empty form (known-divergences/tokenless-empty-forms.md), for which
 * {@link FlowchartGrammar.unexpected} names the form.
 */
export class FlowchartGrammar extends UnitGrammar<UnitName, Unit> {
  /**
   * Rejections outside the grammar, Subgraph members: the member that each subgraph read so far
   * gives the subgraph around it, its Db id; null when that id is empty or
   * all whitespace.
   */
  private readonly subgraphMembers = new Map<
    FlowchartSubgraphStatement,
    SubgraphMember | null
  >()

  /**
   * Rejections outside the grammar, Link style numbers: how many edges the
   * statements read so far make; a `linkStyle` number must name one of
   * them.
   */
  private edgeCount = 0

  /** The units of the lexer, with the empty description blocks that the grammar takes out of its units. */
  private readonly lexedUnits: readonly Unit[]

  public constructor(lexing: FlowchartLexing, lexer: SourceLexer) {
    // The flowchart lexer reads no diagram comments.
    super(lexing.units, lexer, EMPTY_FORM_KINDS.flowchart, [])
    this.lexedUnits = lexing.units
  }

  /**
   * Grammar, Diagram and statements: `diagram = header line*`, with
   * `header = header-keyword ( no-direction | header-direction (
   * empty-description-block* ";" | space* empty-description-block* newline
   * ) )`. The header is read
   * without its empty description blocks, as a statement is (see
   * {@link FlowchartGrammar.takeOutStatementEnd}); they are the first
   * statements of the body.
   */
  public parseDiagram(): FlowchartSyntax {
    this.addItem("Keyword", [this.take("header-keyword")])
    let direction: string | null = null
    let headerBlocks: FlowchartAccDescrBlockStatement[] = []
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
        this.take("newline")
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
   * empty-statement | newline | space`. Inside a subgraph the lines end
   * before its `end`; otherwise they end at the end of the text.
   */
  private parseLines(insideSubgraph: boolean): FlowchartStatement[] {
    const statements: FlowchartStatement[] = []
    for (;;) {
      const unit = this.peek()
      if (unit === null) {
        if (insideSubgraph) throw this.unexpected(null)
        return statements
      }
      if (unit.name === "end") {
        if (!insideSubgraph) throw this.unexpected(unit)
        return statements
      }
      if (unit.name === "newline" || unit.name === "space") {
        this.next += 1
      } else if (unit.name === ";") {
        statements.push(this.parseEmptyStatement())
      } else {
        statements.push(...this.parseStatement(unit))
      }
    }
  }

  /** Diagram and statements: `empty-statement = ";"`. */
  private parseEmptyStatement(): FlowchartEmptyStatement {
    const start = this.next
    this.addItem("Punctuator", [this.take(";")])
    return { type: "FlowchartEmptyStatement", ...this.placeFrom(start) }
  }

  /**
   * Diagram and statements: `statement`, with the empty description
   * blocks after it. The vertex, style, class definition, class, link
   * style, and click statements end with a `statement-end`, whose
   * separator belongs to no statement; the others need no separator.
   */
  private parseStatement(first: Unit): FlowchartStatement[] {
    switch (first.name) {
      case "subgraph":
        return [this.parseSubgraphStatement()]
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
    | FlowchartVertexStatement
    | FlowchartStyleStatement
    | FlowchartClassDefStatement
    | FlowchartClassStatement
    | FlowchartLinkStyleStatement
    | FlowchartDefaultLinkStyleStatement
    | FlowchartClickCallbackStatement
    | FlowchartClickUrlStatement {
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
    while (
      separator < this.units.length &&
      !SEPARATORS.includes(this.units[separator].name)
    ) {
      separator += 1
    }
    const blocks: (readonly Unit[])[] = []
    let index = separator - 1
    while (index >= this.next) {
      const unit = this.units[index]
      const form = this.emptyFormOf(unit)
      if (unit.name === "space") {
        index -= 1
      } else if (
        form?.kind === "empty-description-block" &&
        form.units.at(-1) === unit
      ) {
        blocks.unshift(form.units)
        index -= form.units.length
      } else {
        this.takeOut(blocks.flat())
        return blocks
      }
    }
    return []
  }

  /**
   * Empty description blocks before a separator: `statement-end =
   * empty-description-block* separator`, with `separator = newline | ";" |
   * end-of-text`, whose blocks, the units `blocks`, were taken out of the
   * units ({@link FlowchartGrammar.takeOutStatementEnd}): the blocks, each a
   * description block statement without text; the separator is taken.
   */
  private parseStatementEnd(
    blocks: readonly (readonly Unit[])[],
  ): FlowchartAccDescrBlockStatement[] {
    const separator = this.peek()
    if (separator !== null) {
      if (!SEPARATORS.includes(separator.name)) {
        throw this.unexpected(separator)
      }
      this.next += 1
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
  ): FlowchartAccDescrBlockStatement {
    const [keyword, opening, closing] = units
    this.addItem("Keyword", [keyword])
    this.addItem("Punctuator", [opening])
    this.addItem("Punctuator", [closing])
    return {
      type: "FlowchartAccDescrBlockStatement",
      value: null,
      closed: true,
      ...this.placeOf(units),
    }
  }

  /**
   * Vertex statements: `vertex-statement = vertex-group ( data | space+ )?
   * ( link vertex-group ( data | space+ )? )*`. A data block is read with
   * the vertex right before it (see {@link FlowchartGrammar.parseVertex}),
   * so what is left here of `( data | space+ )?` is the `space+` after a
   * group whose last vertex has no data block.
   */
  private parseVertexStatement(): FlowchartVertexStatement {
    const start = this.next
    const first = this.parseVertexGroup()
    this.takeSpacesAfterGroup(first)
    const links: FlowchartLink[] = []
    let source = first
    while (this.startsLink()) {
      const link = this.parseLink()
      this.takeSpacesAfterGroup(link.target)
      // Rejections outside the grammar, Link style numbers: one edge for each
      // pair of vertices.
      this.edgeCount += source.vertices.length * link.target.vertices.length
      links.push(link)
      source = link.target
    }
    return {
      type: "FlowchartVertexStatement",
      first,
      links,
      ...this.placeFrom(start),
    }
  }

  /** Vertex statements: the `space+` of `( data | space+ )?` after `group`. */
  private takeSpacesAfterGroup(group: FlowchartVertexGroup): void {
    const last = group.vertices[group.vertices.length - 1]
    if (last.data.length === 0) this.takeAll("space")
  }

  /**
   * Vertex statements: `vertex-group = vertex ( data? space+ "&" space+
   * vertex )*`. The `data?` is read with the vertex before it. A repetition
   * that cannot be completed is not taken; one where an empty form stands
   * in place of the vertex is rejected at the form, which lies inside the
   * statement (known-divergences/tokenless-empty-forms.md), also right after
   * the `&`, as in `A &accDescr {} B`, which mermaid.js reads as `A & B`.
   */
  private parseVertexGroup(): FlowchartVertexGroup {
    const start = this.next
    const vertices = [this.parseVertex()]
    for (;;) {
      const ampersand = this.afterSpaces(this.next)
      if (ampersand === this.next || this.nameAt(ampersand) !== "&") break
      const vertex = this.afterSpaces(ampersand + 1)
      const unit = this.units.at(vertex)
      if (unit === undefined) break
      const emptyForm = this.emptyFormErrorAt(unit)
      if (emptyForm !== null) throw emptyForm
      if (vertex === ampersand + 1 || !this.isIdPieceAt(vertex)) break
      this.addItem("Punctuator", [this.units[ampersand]])
      this.next = vertex
      vertices.push(this.parseVertex())
    }
    return {
      type: "FlowchartVertexGroup",
      vertices,
      ...this.placeFrom(start),
    }
  }

  /**
   * Vertex statements: `vertex = id shape? ( ":::" id )?`, and the data
   * blocks that belong to the vertex right before them: the `data?` of
   * `vertex-group` and the `data` of `vertex-statement`.
   */
  private parseVertex(): FlowchartVertex {
    const start = this.next
    const id = this.parseId()
    const shape = this.startsShape() ? this.parseShape() : null
    let cssClass: Identifier | null = null
    const classMark = this.takeIf(":::")
    if (classMark !== null) {
      this.addItem("Punctuator", [classMark])
      cssClass = this.parseId()
    }
    const data = this.parseData()
    return {
      type: "FlowchartVertex",
      id,
      shape,
      cssClass,
      data,
      ...this.placeFrom(start),
    }
  }

  /** Vertex statements: `id = id-piece+`, one Identifier, commas included. */
  private parseId(): Identifier {
    const pieces = this.takeWhile(ID_PIECES)
    if (pieces.length === 0) throw this.unexpected(this.peek())
    return this.identifierOf(pieces)
  }

  /**
   * Style, class, and link style statements: `id-list = ( id-list-part |
   * "," )+`, read as a list: its elements are the parts between its `,`
   * units, each one Identifier, and null for a part that is empty.
   */
  private parseIdList(): (Identifier | null)[] {
    return this.parseCommaList(ID_LIST_PART_PIECES, ",")
  }

  /**
   * The lists of Style, class, and link style statements (`id-list`) and
   * of Click statements (`click-ids`): one or more units that are `comma`,
   * a `,` or a `click-comma` unit, or have one of `partPieces`. The
   * elements are the parts between the `comma` units, so there is one more
   * element than there are `comma` units; a part is one Identifier, or null
   * when it is empty. Each `comma` unit is a `Punctuator`.
   */
  private parseCommaList(
    partPieces: readonly UnitName[],
    comma: UnitName,
  ): (Identifier | null)[] {
    const parts: (Identifier | null)[] = []
    let pieces: Unit[] = []
    const first = this.peek()
    for (;;) {
      const unit = this.peek()
      if (unit === null) break
      if (unit.name === comma) {
        this.next += 1
        parts.push(pieces.length === 0 ? null : this.identifierOf(pieces))
        this.addItem("Punctuator", [unit])
        pieces = []
      } else if (partPieces.includes(unit.name)) {
        this.next += 1
        pieces.push(unit)
      } else {
        break
      }
    }
    if (this.peek() === first) throw this.unexpected(first)
    parts.push(pieces.length === 0 ? null : this.identifierOf(pieces))
    return parts
  }

  /**
   * Vertex statements: `data = ( data-start ( data-text | data-quote )*
   * "}" )+`, read as a list: each block, from its `@{` to its `}`, is a
   * FlowchartDataBlock, whose value is its written text between them.
   * No block is an empty list.
   */
  private parseData(): FlowchartDataBlock[] {
    const blocks: FlowchartDataBlock[] = []
    while (this.nameAt(this.next) === "data-start") {
      const start = this.next
      const opening = this.take("data-start")
      this.addItem("Punctuator", [opening])
      this.addItem("RawText", this.takeWhile(["data-text", "data-quote"]))
      const closing = this.take("}")
      this.addItem("Punctuator", [closing])
      blocks.push({
        type: "FlowchartDataBlock",
        value: this.textOf([
          significantRangeOf(opening)[1],
          significantRangeOf(closing)[0],
        ]),
        ...this.placeFrom(start),
      })
    }
    return blocks
  }

  /**
   * Shapes: `shape`. Each alternative gives the shape its name. The units
   * that open the shape are one `Punctuator` item, and so are those that
   * close it.
   */
  private parseShape(): FlowchartShape {
    const start = this.next
    const opener = this.peek()
    if (opener === null) throw this.unexpected(null)
    switch (opener.name) {
      case "[":
        return this.parseDelimitedShape(start, ["["], () => ["]", "rectangle"])
      case "(":
        return this.nameAt(this.next + 1) === "("
          ? this.parseDelimitedShape(start, ["(", "("], () => [
              [")", ")"],
              "circle",
            ])
          : this.parseDelimitedShape(start, ["("], () => [")", "rounded"])
      case "(((":
        return this.parseDelimitedShape(start, ["((("], () => [
          ")))",
          "double-circle",
        ])
      case "{":
        return this.nameAt(this.next + 1) === "{"
          ? this.parseDelimitedShape(start, ["{", "{"], () => [
              ["}", "}"],
              "hexagon",
            ])
          : this.parseDelimitedShape(start, ["{"], () => ["}", "diamond"])
      case "([":
        return this.parseDelimitedShape(start, ["(["], () => ["])", "stadium"])
      case "[[":
        return this.parseDelimitedShape(start, ["[["], () => [
          "]]",
          "framed-rectangle",
        ])
      case "[(":
        return this.parseDelimitedShape(start, ["[("], () => [")]", "cylinder"])
      case ">":
        return this.parseDelimitedShape(start, [">"], () => ["]", "odd"])
      case "(-":
        return this.parseDelimitedShape(start, ["(-"], () => [
          "ellipse-end",
          "ellipse",
        ])
      case "[/":
        return this.parseDelimitedShape(start, ["[/"], () =>
          this.nameAt(this.next) === "backslash-end"
            ? ["backslash-end", "trapezoid-bottom"]
            : ["slash-end", "lean-right"],
        )
      case "[\\":
        return this.parseDelimitedShape(start, ["[\\"], () =>
          this.nameAt(this.next) === "slash-end"
            ? ["slash-end", "trapezoid-top"]
            : ["backslash-end", "lean-left"],
        )
      case "[|":
        return this.parseRectShape(start)
      default:
        throw this.unexpected(opener)
    }
  }

  /**
   * Shapes: an alternative of the form opening units, `label`, closing
   * units. `closing` is asked after the label, because for the slanted
   * shapes the closing unit decides the name.
   */
  private parseDelimitedShape(
    start: number,
    opening: readonly UnitName[],
    closing: () => readonly [
      UnitName | readonly UnitName[],
      FlowchartShapeName,
    ],
  ): FlowchartShape {
    const openingUnits = opening.map((name) => this.take(name))
    this.addItem("Punctuator", openingUnits)
    const label = this.parseLabel()
    const [closingNames, name] = closing()
    const closingUnits = (
      typeof closingNames === "string" ? [closingNames] : closingNames
    ).map((closingName) => this.take(closingName))
    this.addItem("Punctuator", closingUnits)
    return {
      type: "FlowchartShape",
      name,
      property: null,
      label,
      ...this.placeFrom(start),
    }
  }

  /** Shapes: `"[|" id-run ":" id-run "|" label "]"`, a rectangle with its property. */
  private parseRectShape(start: number): FlowchartShape {
    this.addItem("Punctuator", [this.take("[|")])
    const propertyStart = this.next
    const propertyName = this.identifierOf([this.take("id-run")])
    this.addItem("Punctuator", [this.take(":")])
    const propertyValue = this.identifierOf([this.take("id-run")])
    const property: FlowchartShapeProperty = {
      type: "FlowchartShapeProperty",
      name: propertyName,
      value: propertyValue,
      ...this.placeFrom(propertyStart),
    }
    this.addItem("Punctuator", [this.take("|")])
    const label = this.parseLabel()
    this.addItem("Punctuator", [this.take("]")])
    return {
      type: "FlowchartShape",
      name: "rectangle",
      property,
      label,
      ...this.placeFrom(start),
    }
  }

  /** Labels: `label = ( string | markdown-string | text-run ) text-run*`. */
  private parseLabel(): FlowchartLabel {
    return this.labelOf(
      this.parseStartingWithString(() => this.takeWhile(["text-run"])),
    )
  }

  /**
   * Labels, Links, and Subgraphs: the rules of the form `( string |
   * markdown-string | piece ) piece*`, whose pieces `takePieces` reads. The
   * kind is `string` or `markdown` when a string or a markdown string comes
   * first, a `String` item, and `text` otherwise; the pieces are one
   * `RawText` item. Returns the kind and all the units.
   */
  private parseStartingWithString(takePieces: () => Unit[]): LabelUnits {
    const first = this.peek()
    if (first === null) throw this.unexpected(null)
    let kind: FlowchartLabelKind = "text"
    let delimiters: readonly Range[] = []
    const units: Unit[] = []
    if (first.name === "string" || first.name === "markdown-string") {
      kind = first.name === "string" ? "string" : "markdown"
      this.next += 1
      this.addItem("String", [first])
      units.push(first)
      // Labels and Strings: every delimiter of the string contexts, however
      // they nest, is left out; the content is the one run.
      delimiters = this.delimitersOf(first)
    }
    const pieces = takePieces()
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
   * ast/flowchart.md, FlowchartLabel: the label read by
   * {@link FlowchartGrammar.parseStartingWithString}. Its value is the text
   * of its range without the delimiters of the string that it starts with.
   */
  private labelOf({ kind, units, delimiters }: LabelUnits): FlowchartLabel {
    const place = this.placeOf(units)
    return {
      type: "FlowchartLabel",
      kind,
      value: this.textOf(place.range, delimiters),
      ...place,
    }
  }

  /** Whether a shape starts at the next unit. */
  private startsShape(): boolean {
    const name = this.nameAt(this.next)
    return name !== null && SHAPE_STARTS.includes(name)
  }

  /** Whether a link starts at the next unit: an edge id or an arrow. */
  private startsLink(): boolean {
    const name = this.nameAt(this.next)
    return name === "edge-id" || name === "arrow" || name === "opening-arrow"
  }

  /**
   * Links: `link = ( edge-id "@" )? arrow ( "|" label "|" space? )? |
   * ( edge-id "@" )? opening-arrow link-text arrow`, and the vertex group
   * after it, which is the link's target.
   */
  private parseLink(): FlowchartLink {
    const start = this.next
    let id: Identifier | null = null
    const edgeId = this.takeIf("edge-id")
    if (edgeId !== null) {
      id = this.identifierOf([edgeId])
      this.addItem("Punctuator", [this.take("@")])
    }
    let opening: FlowchartOpeningArrow | null = null
    let label: FlowchartLabel | null = null
    const openingArrow = this.takeIf("opening-arrow")
    if (openingArrow !== null) {
      opening = this.openingArrowOf(openingArrow)
      label = this.parseLinkText()
    }
    const arrow = this.arrowOf(this.take("arrow"))
    if (openingArrow === null) {
      const bar = this.takeIf("|")
      if (bar !== null) {
        this.addItem("Punctuator", [bar])
        label = this.parseLabel()
        this.addItem("Punctuator", [this.take("|")])
        this.takeIf("space")
      }
    }
    const target = this.parseVertexGroup()
    return {
      type: "FlowchartLink",
      id,
      opening,
      arrow,
      label,
      target,
      ...this.placeFrom(start),
    }
  }

  /**
   * ast/flowchart.md, FlowchartArrow: the closed arrow of the `arrow` unit
   * `unit`, one `Punctuator` item, with the parts that the lexer read.
   */
  private arrowOf(unit: Unit): FlowchartArrow {
    this.addItem("Punctuator", [unit])
    const parts = unit.arrow
    if (parts?.form !== "closed") {
      throw new Error(
        `mmd-toolkit parser bug: the arrow unit at ${unit.start} has no closed arrow`,
      )
    }
    const place = this.placeOf([unit])
    return {
      type: "FlowchartArrow",
      value: this.textOf(place.range),
      startMarker: parts.startMarker,
      line: parts.line,
      length: parts.length,
      endMarker: parts.endMarker,
      ...place,
    }
  }

  /**
   * ast/flowchart.md, FlowchartOpeningArrow: the opening arrow of the
   * `opening-arrow` unit `unit`, one `Punctuator` item, with the parts that
   * the lexer read.
   */
  private openingArrowOf(unit: Unit): FlowchartOpeningArrow {
    this.addItem("Punctuator", [unit])
    const parts = unit.arrow
    if (parts?.form !== "opening") {
      throw new Error(
        `mmd-toolkit parser bug: the opening-arrow unit at ${unit.start} has no opening arrow`,
      )
    }
    const place = this.placeOf([unit])
    return {
      type: "FlowchartOpeningArrow",
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
  private parseLinkText(): FlowchartLabel {
    return this.labelOf(
      this.parseStartingWithString(() => this.takeWhile(["link-text-char"])),
    )
  }

  /**
   * Subgraphs: `subgraph-statement = "subgraph" space subgraph-name
   * ( "[" label "]" )? statement-end line* "end"`. The empty description
   * blocks of the `statement-end` are the first statements of the body.
   */
  private parseSubgraphStatement(): FlowchartSubgraphStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("subgraph")])
    this.take("space")
    const blocks = this.takeOutStatementEnd()
    // Subgraphs: `subgraph-name = ( string | markdown-string | name-piece )
    // name-piece*`; the name is a label of its own.
    const nameUnits = this.parseStartingWithString(() =>
      this.withNameWhitespaceKept(this.takeWhile(NAME_PIECES)),
    )
    const name = this.labelOf(nameUnits)
    let title: FlowchartLabel | null = null
    const bracket = this.takeIf("[")
    if (bracket !== null) {
      this.addItem("Punctuator", [bracket])
      title = this.parseLabel()
      this.addItem("Punctuator", [this.take("]")])
    }
    const body = [...this.parseStatementEnd(blocks), ...this.parseLines(true)]
    this.checkSubgraphMembers(body)
    this.addItem("Keyword", [this.take("end")])
    const statement: FlowchartSubgraphStatement = {
      type: "FlowchartSubgraphStatement",
      name,
      title,
      body,
      ...this.placeFrom(start),
    }
    this.subgraphMembers.set(
      statement,
      this.subgraphMemberOf(name, nameUnits, title),
    )
    return statement
  }

  /**
   * ast/flowchart.md, FlowchartSubgraphStatement: the name pieces `pieces`,
   * just read, with the whitespace that mermaid.js reads into the name of a
   * subgraph without a title kept in its tokens: the `space` units at the
   * end of the name, up to the separator or the first empty description
   * block, which was taken out of the units, and the whitespace that an
   * `end` unit at the end of the name holds, line feeds included
   * (diagrams/flowchart.md, Statement context, rule 12). With a title,
   * mermaid.js reads no whitespace before its `[`.
   */
  private withNameWhitespaceKept(pieces: readonly Unit[]): Unit[] {
    if (this.nameAt(this.next) === "[") return [...pieces]
    const kept = [...pieces]
    let end = kept.length
    while (end > 0 && kept[end - 1].name === "space") end -= 1
    if (end > 0 && kept[end - 1].name === "end") {
      kept[end - 1] = withWhitespaceKept(kept[end - 1])
    }
    // The unit before the first space at the end: the last piece that is
    // not a space, or the unit before the pieces, a string or the `space`
    // after `subgraph`.
    let previous =
      end > 0 ? kept[end - 1] : this.units[this.next - kept.length - 1]
    for (let index = end; index < kept.length; index += 1) {
      const space = kept[index]
      // An empty description block lies between them.
      if (space.index !== previous.index + 1) break
      kept[index] = withWhitespaceKept(space)
      previous = space
    }
    return kept
  }

  /**
   * Rejections outside the grammar, Subgraph members: a subgraph whose body
   * is `body` is rejected when a member `hasOwnProperty` is followed by
   * another member, among its own members, before those that an earlier subgraph has are left out. The error is
   * reported at the first member after `hasOwnProperty`.
   */
  private checkSubgraphMembers(body: readonly FlowchartStatement[]): void {
    const members = subgraphMembersOf(
      body,
      (nested) => this.subgraphMembers.get(nested) ?? null,
    )
    const member = memberAfterHasOwnProperty(members)
    if (member === null) return
    throw new ParseError(
      `A subgraph member follows the member ${HAS_OWN_PROPERTY}`,
      member.range,
      this.lines.location(member.range),
    )
  }

  /**
   * Rejections outside the grammar, Subgraph members: the member that the subgraph with the
   * name `name`, read from `nameUnits`, and the title `title` gives the subgraph around it, its Db
   * id (see `subgraphIdOf`); null when that id is empty or all
   * whitespace. A numbered id is neither `hasOwnProperty` nor empty, so its
   * number is not needed here.
   */
  private subgraphMemberOf(
    name: FlowchartLabel,
    nameUnits: LabelUnits,
    title: FlowchartLabel | null,
  ): SubgraphMember | null {
    const { range, leftOut } = subgraphNameTextOf(
      this.lexedUnits,
      name,
      nameUnits.units[0],
      nameUnits.delimiters,
    )
    const nameText = this.textOf(range, leftOut)
    const numbered = isNumberedSubgraph(nameText, title !== null)
    if (!numbered && isBlank(nameText)) return null
    return {
      isHasOwnProperty: !numbered && trimmed(nameText) === HAS_OWN_PROPERTY,
      range: name.range,
    }
  }

  /** Style, class, and link style statements: `style-statement = "style" space id space styles`. */
  private parseStyleStatement(): FlowchartStyleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("style")])
    this.take("space")
    const id = this.parseId()
    this.take("space")
    const styles = this.parseStyles(false)
    return {
      type: "FlowchartStyleStatement",
      id,
      styles,
      ...this.placeFrom(start),
    }
  }

  /** Style, class, and link style statements: `class-def-statement = "classDef" space id-list space styles`. */
  private parseClassDefStatement(): FlowchartClassDefStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("classDef")])
    this.take("space")
    const cssClasses = this.parseIdList()
    this.take("space")
    const styles = this.parseStyles(true)
    return {
      type: "FlowchartClassDefStatement",
      cssClasses,
      styles,
      ...this.placeFrom(start),
    }
  }

  /** Style, class, and link style statements: `class-statement = "class" space id-list space id`. */
  private parseClassStatement(): FlowchartClassStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("class")])
    this.take("space")
    const ids = this.parseIdList()
    this.take("space")
    const cssClass = this.parseId()
    return {
      type: "FlowchartClassStatement",
      ids,
      cssClass,
      ...this.placeFrom(start),
    }
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
  private parseStyles(inClassDef: boolean): (FlowchartLiteral | null)[] {
    const styles: (FlowchartLiteral | null)[] = []
    let afterComma = false
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
        // ast/flowchart.md, FlowchartStyleStatement: mermaid.js reads the
        // whitespace at the start of a style after a `,`.
        styles.push(
          this.textLiteralOf(
            afterComma ? withLeadingWhitespaceKept(pieces) : pieces,
          ),
        )
      }
      const comma = this.takeIf(",")
      if (comma === null) return styles
      this.addItem("Punctuator", [comma])
      afterComma = true
    }
  }

  /**
   * Style, class, and link style statements: whether the next unit is a
   * `,` right after a `\` of the diagram text, which ends `pieces`.
   */
  private escapedCommaFollows(pieces: readonly Unit[]): boolean {
    const last = pieces.at(-1)
    return (
      last !== undefined &&
      last.text.endsWith("\\") &&
      this.nameAt(this.next) === ","
    )
  }

  /** Style, class, and link style statements: `style`, the units of one style of the grammar. */
  private takeStylePieces(): Unit[] {
    const pieces = this.takeWhile(STYLE_PIECES)
    if (pieces.length === 0) throw this.unexpected(this.peek())
    return pieces
  }

  /**
   * Style, class, and link style statements: `link-style-statement =
   * "linkStyle" space ( "default" | number ( "," number )* ) space
   * ( "interpolate" space name ( space styles )? | styles )`.
   */
  private parseLinkStyleStatement():
    FlowchartLinkStyleStatement | FlowchartDefaultLinkStyleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("linkStyle")])
    this.take("space")
    const defaultKeyword = this.takeIf("default")
    const indices: NumericLiteral[] = []
    if (defaultKeyword !== null) {
      this.addItem("Keyword", [defaultKeyword])
    } else {
      do {
        indices.push(this.parseLinkStyleNumber())
      } while (this.takeComma())
    }
    this.take("space")
    let interpolate: Identifier | null = null
    let styles: (FlowchartLiteral | null)[] = []
    const interpolateKeyword = this.takeIf("interpolate")
    if (interpolateKeyword !== null) {
      this.addItem("Keyword", [interpolateKeyword])
      this.take("space")
      interpolate = this.parseName()
      if (this.takeIf("space") !== null) styles = this.parseStyles(false)
    } else {
      styles = this.parseStyles(false)
    }
    return defaultKeyword === null
      ? {
          type: "FlowchartLinkStyleStatement",
          indices,
          interpolate,
          styles,
          ...this.placeFrom(start),
        }
      : {
          type: "FlowchartDefaultLinkStyleStatement",
          interpolate,
          styles,
          ...this.placeFrom(start),
        }
  }

  /**
   * Style, class, and link style statements: `name = ( number | letter |
   * id-run | "v" | "-" | "," | ":" | "&" | "#" | "*" )+`, one Identifier.
   */
  private parseName(): Identifier {
    const units = this.takeWhile(NAME_UNITS)
    if (units.length === 0) throw this.unexpected(this.peek())
    return this.identifierOf(units)
  }

  /** Reads a `,` when it is the next unit, as a `Punctuator`; says whether it did. */
  private takeComma(): boolean {
    const comma = this.takeIf(",")
    if (comma === null) return false
    this.addItem("Punctuator", [comma])
    return true
  }

  /**
   * A number of a `linkStyle` statement, and Rejections outside the
   * grammar, Link style numbers: its text must be an integer written
   * without leading zeros, and less than the number of Db edges that the
   * statements before it have made.
   */
  private parseLinkStyleNumber(): NumericLiteral {
    const number = this.take("number")
    const literal = this.numericLiteralOf(number)
    const hasLeadingZero =
      number.text.length > 1 && number.text.codePointAt(0) === DIGIT_ZERO
    if (hasLeadingZero || literal.value >= this.edgeCount) {
      const range = significantRangeOf(number)
      throw new ParseError(
        `linkStyle ${number.text} does not name a link that exists`,
        range,
        this.lines.location(range),
      )
    }
    return literal
  }

  /**
   * Click statements: `click-statement = "click" click-ids ( callback (
   * space string )? | "href"? string ( space string )? ( space link-target
   * )? | name ( space string )? )` and `click-ids = ( click-id | click-comma
   * )+`, with the `callback` of {@link FlowchartGrammar.parseCallback}. The
   * first and the third alternative call a
   * function; the second links to a URL. The click ids are a list as an
   * `id-list` is, parted at the `click-comma` units. The `click` is a `Keyword`
   * token in no field. `click` is a reserved word
   * (known-divergences/click-reserved-word.md): this is the only rule that
   * reads a `click` unit, at the start of a statement, so a `click` unit
   * anywhere else makes the input rejected.
   */
  private parseClickStatement():
    FlowchartClickCallbackStatement | FlowchartClickUrlStatement {
    const start = this.next
    const click = this.take("click")
    this.checkClickIdsFollow(click)
    this.addItem("Keyword", [click])
    const ids = this.parseCommaList(["click-id"], "click-comma")
    const first = this.peek()
    if (first === null) throw this.unexpected(null)
    if (first.name === "call") {
      const { callback, callbackArguments } = this.parseCallback()
      return {
        type: "FlowchartClickCallbackStatement",
        ids,
        callback,
        arguments: callbackArguments,
        tooltip: this.takeSpaceAndString(),
        ...this.placeFrom(start),
      }
    }
    if (first.name === "href" || first.name === "string") {
      const href = this.takeIf("href")
      if (href !== null) this.addItem("Keyword", [href])
      const url = this.stringLiteralOf(this.take("string"))
      const tooltip = this.takeSpaceAndString()
      let target: FlowchartLinkTarget | null = null
      const targetUnit = this.units[this.next + 1]
      if (
        this.nameAt(this.next) === "space" &&
        this.nameAt(this.next + 1) === "link-target"
      ) {
        this.next += 2
        this.addItem("Keyword", [targetUnit])
        target = linkTargetOf(targetUnit.text)
      }
      return {
        type: "FlowchartClickUrlStatement",
        ids,
        url,
        tooltip,
        target,
        ...this.placeFrom(start),
      }
    }
    const callback = this.parseName()
    return {
      type: "FlowchartClickCallbackStatement",
      ids,
      callback,
      arguments: null,
      tooltip: this.takeSpaceAndString(),
      ...this.placeFrom(start),
    }
  }

  /**
   * Click and callbacks: a `click` that no click id follows starts no click
   * statement (known-divergences/click-reserved-word.md), also when empty
   * strings come between, which mermaid.js reads nothing for. Where click ids
   * follow the empty strings, the first empty string is the cause instead
   * (known-divergences/tokenless-empty-forms.md).
   */
  private checkClickIdsFollow(click: Unit): void {
    let after = this.next
    while (this.nameAt(after) === "empty-string") after += 1
    const idsFollow =
      this.nameAt(after) === "click-id" || this.nameAt(after) === "click-comma"
    if (!idsFollow) throw this.reservedClick(click)
    if (after !== this.next) throw this.unexpected(this.peek())
  }

  /**
   * Click statements: `callback = "call" callback-name "(" (
   * callback-arguments ")" | ")" ( "call" "(" callback-arguments ")" )? )`.
   * The `call` units are `Keyword` tokens and the parentheses `Punctuator`
   * tokens of the statement, in no field. When the parentheses after the
   * name are empty, the arguments may follow a second `call`.
   */
  private parseCallback(): {
    readonly callback: FlowchartLiteral
    readonly callbackArguments: FlowchartLiteral | null
  } {
    this.addItem("Keyword", [this.take("call")])
    const callback = this.textLiteralOf([this.take("callback-name")])
    this.addItem("Punctuator", [this.take("(")])
    let argumentsUnit = this.takeIf("callback-arguments")
    this.addItem("Punctuator", [this.take(")")])
    if (argumentsUnit === null && this.nameAt(this.next) === "call") {
      this.addItem("Keyword", [this.take("call")])
      this.addItem("Punctuator", [this.take("(")])
      argumentsUnit = this.take("callback-arguments")
      this.addItem("Punctuator", [this.take(")")])
    }
    return {
      callback,
      callbackArguments:
        argumentsUnit === null ? null : this.textLiteralOf([argumentsUnit]),
    }
  }

  /** Click statements: `( space string )?`. Returns the string, or null when the two units do not follow. */
  private takeSpaceAndString(): StringLiteral | null {
    if (
      this.nameAt(this.next) !== "space" ||
      this.nameAt(this.next + 1) !== "string"
    ) {
      return null
    }
    const string = this.units[this.next + 1]
    this.next += 2
    return this.stringLiteralOf(string)
  }

  /**
   * Diagram and statements: `direction-statement = direction-text?
   * "direction" direction-value direction-text?`.
   */
  private parseDirectionStatement(): FlowchartDirectionStatement {
    const start = this.next
    const before = this.takeIf("direction-text")
    if (before !== null) this.addItem("RawText", [before])
    this.addItem("Keyword", [this.take("direction")])
    const value = this.take("direction-value")
    this.addItem("Keyword", [value])
    const after = this.takeIf("direction-text")
    if (after !== null) this.addItem("RawText", [after])
    return {
      type: "FlowchartDirectionStatement",
      textBefore: this.ignoredTextOf(before),
      direction: statementDirectionOf(value.text),
      textAfter: this.ignoredTextOf(after),
      ...this.placeFrom(start),
    }
  }

  /**
   * ast/flowchart.md, FlowchartIgnoredText: the text that the
   * `direction-text` unit `unit` reads; null when there is no unit or it is
   * all whitespace.
   */
  private ignoredTextOf(unit: Unit | null): FlowchartIgnoredText | null {
    if (unit?.significantRange == null) return null
    const place = this.placeOf([unit])
    return {
      type: "FlowchartIgnoredText",
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }

  /** Diagram and statements: `title-statement = "accTitle" ":" title-text?`. */
  private parseTitleStatement(): FlowchartAccTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accTitle")])
    this.addItem("Punctuator", [this.take(":")])
    const text = this.takeIf("title-text")
    return {
      type: "FlowchartAccTitleStatement",
      value: text === null ? null : this.textLiteralOf([text]),
      ...this.placeFrom(start),
    }
  }

  /**
   * Diagram and statements: `description-statement = "accDescr" ":"
   * description-text?` and `description-block-statement = "accDescr" "{"
   * description-block-text? ( "}" | end-of-text )`.
   */
  private parseDescriptionStatement():
    FlowchartAccDescrStatement | FlowchartAccDescrBlockStatement {
    if (this.nameAt(this.next + 1) !== ":") return this.parseDescriptionBlock()
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take(":")])
    const text = this.takeIf("description-text")
    return {
      type: "FlowchartAccDescrStatement",
      value: text === null ? null : this.textLiteralOf([text]),
      ...this.placeFrom(start),
    }
  }

  /**
   * Diagram and statements: `description-block-statement = "accDescr" "{"
   * description-block-text? ( "}" | end-of-text )`, and the
   * `empty-description-block` of a `statement-end`.
   */
  private parseDescriptionBlock(): FlowchartAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("description-block-text")
    const value = text === null ? null : this.textLiteralOf([text])
    const closing = this.peek() === null ? null : this.take("}")
    if (closing !== null) this.addItem("Punctuator", [closing])
    return {
      type: "FlowchartAccDescrBlockStatement",
      value,
      closed: closing !== null,
      ...this.placeFrom(start),
    }
  }

  /** Whether the unit at `index` is one that an id can start with. */
  private isIdPieceAt(index: number): boolean {
    const name = this.nameAt(index)
    return name !== null && ID_PIECES.includes(name)
  }

  /** The index after the `space` units from `index`. */
  private afterSpaces(index: number): number {
    let after = index
    while (this.nameAt(after) === "space") after += 1
    return after
  }

  /**
   * diagrams/flowchart.md, Strings: the delimiters of the `string` or
   * `markdown-string` unit `unit`: what lies in it before and after its
   * content.
   */
  private delimitersOf(unit: Unit): Range[] {
    if (unit.content === null) {
      throw new Error(
        `mmd-toolkit parser bug: the unit ${unit.name} at ${unit.start} has no content`,
      )
    }
    const [start, end] = significantRangeOf(unit)
    return [
      [start, unit.content[0]],
      [unit.content[1], end],
    ]
  }

  /**
   * FlowchartLiteral: the literal whose units are `units`, one `RawText`
   * item. Its value is its written text.
   */
  private textLiteralOf(units: readonly Unit[]): FlowchartLiteral {
    this.addItem("RawText", units)
    const place = this.placeOf(units)
    return {
      type: "FlowchartLiteral",
      value: this.textOf(place.range),
      ...place,
    }
  }

  /**
   * ast.md, Shared leaf nodes > StringLiteral: the StringLiteral of the
   * `string` unit `unit`, one `String` item. Its value is its content: its
   * written text without the delimiters of the string contexts.
   */
  private stringLiteralOf(unit: Unit): StringLiteral {
    this.addItem("String", [unit])
    const place = this.placeOf([unit])
    return {
      type: "StringLiteral",
      value: this.textOf(place.range, this.delimitersOf(unit)),
      raw: this.lexer.text.slice(...place.range),
      // Strings: the lexer rejects a string that the text ends in.
      closed: true,
      ...place,
    }
  }

  /**
   * The error of a known divergence for the unit `unit`, which the grammar
   * cannot read where it stands. The unit, and then the first unit after it
   * that is not a `space` unit, can be the cause that a known divergence
   * names (docs/error-positions.md): a `click` unit, which no rule but the
   * start of a click statement reads ({@link FlowchartGrammar.reservedClick}),
   * and a unit of an empty form, which no rule takes. So in `A &accDescr {} B`
   * the grammar stops at the `&`, which needs a `space` after it, and the
   * empty description block after it is the cause.
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    const next = this.units
      .slice(this.units.indexOf(unit) + 1)
      .find((candidate) => candidate.name !== "space")
    for (const cause of next === undefined ? [unit] : [unit, next]) {
      if (cause.name === "click") return this.reservedClick(cause)
      const emptyForm = this.emptyFormErrorAt(cause)
      if (emptyForm !== null) return emptyForm
    }
    return null
  }

  /**
   * known-divergences/click-reserved-word.md: the error for the `click` unit
   * `click`, which does not start a click statement, at the word `click`.
   */
  private reservedClick(click: Unit): ParseError {
    const range: Range = click.significantRange ?? [click.start, click.end]
    return new ParseError(
      "click is a reserved word: it may only start a click statement",
      range,
      this.lines.location(range),
    )
  }
}

/** diagrams/flowchart.md, The direction line: the value of a `direction-value` unit. */
function statementDirectionOf(text: string): FlowchartStatementDirection {
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

/** diagrams/flowchart.md, The statement context, rule 13: the value of a `link-target` unit. */
function linkTargetOf(text: string): FlowchartLinkTarget {
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

/** ast/flowchart.md, FlowchartStyleStatement: the units `pieces` of a style, with the `space` units at their start kept in its tokens. */
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
