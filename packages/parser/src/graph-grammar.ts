import type { Identifier, NumericLiteral, Range, StringLiteral } from "./ast.ts"
import { DIGIT_ZERO } from "./code-points.ts"
import { significantRangeOf } from "./diagram-units.ts"
import { ParseError } from "./errors.ts"
import type { GraphUnit, GraphUnitName } from "./graph-unit-lexer.ts"
import type { NodePlace } from "./unit-grammar.ts"
import { UnitGrammar } from "./unit-grammar.ts"

/** Shape names of the shared shape production, independent of diagram node types. */
export type GraphShapeName =
  /** Written `[...]`, or `[|name:value|...]` with a property; the Db type `square`, or `rect` with a property. */
  | "rectangle"
  /** Written `(...)`; the Db type `round`. */
  | "rounded"
  /** Written `((...))`; the Db type `circle`. */
  | "circle"
  /** Written `(((...)))`; the Db type `doublecircle`. */
  | "double-circle"
  /** Written `{...}`; the Db type `diamond`. */
  | "diamond"
  /** Written `{{...}}`; the Db type `hexagon`. */
  | "hexagon"
  /** Written `([...])`; the Db type `stadium`. */
  | "stadium"
  /** Written `[[...]]`; the Db type `subroutine`. */
  | "framed-rectangle"
  /** Written `[(...)]`; the Db type `cylinder`. */
  | "cylinder"
  /** Written `>...]`; the Db type `odd`. */
  | "odd"
  /** Written `(-...-)`; the Db type `ellipse`. */
  | "ellipse"
  /** Written `[/...\]`; the Db type `trapezoid`. */
  | "trapezoid-bottom"
  /** Written `[/.../]`; the Db type `lean_right`. */
  | "lean-right"
  /** Written `[\.../]`; the Db type `inv_trapezoid`. */
  | "trapezoid-top"
  /** Written `[\...\]`; the Db type `lean_left`. */
  | "lean-left"

type GraphName<ExtraName extends string> = GraphUnitName | ExtraName

/** Grammar, Vertex statements: the units that an id is made of. */
const ID_PIECES: readonly GraphUnitName[] = [
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
const ID_LIST_PART_PIECES: readonly GraphUnitName[] = [
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

/** Grammar, Style, class, and link style statements: the units that a style is made of. */
const STYLE_PIECES: readonly GraphUnitName[] = [
  "number",
  "id-run",
  ":",
  "#",
  "space",
  "style",
]

/** Grammar, Style, class, and link style statements: the units that a name is made of. */
const NAME_UNITS: readonly GraphUnitName[] = [
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
const SHAPE_STARTS: readonly GraphUnitName[] = [
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
 * Identical productions of diagrams/flowchart.md and diagrams/agentflow.md.
 * Each diagram constructs its own nodes; the shared rules read their units.
 */
export abstract class GraphGrammar<
  ExtraName extends string,
  Arrow,
  DataBlock,
  Shape,
  ShapeProperty,
  Label,
  Literal,
> extends UnitGrammar<
  GraphName<ExtraName>,
  GraphUnit<GraphName<ExtraName>, Arrow>
> {
  /** The number of edges defined before the next statement. */
  protected edgeCount = 0

  /** Builds the diagram's data node at the production's source position. */
  protected abstract dataBlockOf(value: string, place: NodePlace): DataBlock

  /** Builds the diagram's shape node after its delimiters and label are read. */
  protected abstract shapeOf(
    name: GraphShapeName,
    property: ShapeProperty | null,
    label: Label,
    place: NodePlace,
  ): Shape

  /** Builds the diagram's property node, excluding its surrounding bars. */
  protected abstract shapePropertyOf(
    name: Identifier,
    value: Identifier,
    place: NodePlace,
  ): ShapeProperty

  /** The label production, with each diagram's text and comment rules. */
  protected abstract parseLabel(): Label

  /** Builds the diagram's literal from its one RawText item. */
  protected abstract textLiteralOf(
    units: readonly GraphUnit<GraphName<ExtraName>, Arrow>[],
  ): Literal

  /** Vertex statements: `id = id-piece+`, one Identifier, commas included. */
  protected parseId(): Identifier {
    const pieces = this.takeWhile(ID_PIECES)
    if (pieces.length === 0) throw this.unexpected(this.peek())
    return this.identifierOf(pieces)
  }

  /**
   * Style, class, and link style statements: `id-list = ( id-list-part |
   * "," )+`, read as a list: its elements are the parts between its `,`
   * units, each one Identifier, and null for a part that is empty.
   */
  protected parseIdList(): (Identifier | null)[] {
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
  protected parseCommaList(
    partPieces: readonly GraphName<ExtraName>[],
    comma: GraphName<ExtraName>,
  ): (Identifier | null)[] {
    const parts: (Identifier | null)[] = []
    let pieces: GraphUnit<GraphName<ExtraName>, Arrow>[] = []
    const first = this.peek()
    for (;;) {
      const unit = this.peek()
      if (unit === null) break
      if (unit.name === comma) {
        this.advance()
        parts.push(pieces.length === 0 ? null : this.identifierOf(pieces))
        this.addItem("Punctuator", [unit])
        pieces = []
      } else if (partPieces.includes(unit.name)) {
        this.advance()
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
   * DataBlock, whose value is its written text between them.
   * No block is an empty list.
   */
  protected parseData(): DataBlock[] {
    const blocks: DataBlock[] = []
    while (this.nameAt(this.next) === "data-start") {
      const start = this.next
      const opening = this.take("data-start")
      this.addItem("Punctuator", [opening])
      this.addItem("RawText", this.takeWhile(["data-text", "data-quote"]))
      const closing = this.take("}")
      this.addItem("Punctuator", [closing])
      blocks.push(
        this.dataBlockOf(
          this.unreadTextOf([
            significantRangeOf(opening)[1],
            significantRangeOf(closing)[0],
          ]),
          this.placeFrom(start),
        ),
      )
    }
    return blocks
  }

  /**
   * Shapes: `shape`. Each alternative gives the shape its name. The units
   * that open the shape are one `Punctuator` item, and so are those that
   * close it.
   */
  protected parseShape(): Shape {
    const start = this.next
    const opener = this.peek()
    if (opener === null) throw this.unexpected(null)
    switch (opener.name) {
      case "[":
        return this.parseDelimitedShape(start, ["["], () => ["]", "rectangle"])
      case "(":
        return this.nameAt(this.positionAfter(this.next)) === "("
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
        return this.nameAt(this.positionAfter(this.next)) === "{"
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
  protected parseDelimitedShape(
    start: number,
    opening: readonly GraphName<ExtraName>[],
    closing: () => readonly [
      GraphName<ExtraName> | readonly GraphName<ExtraName>[],
      GraphShapeName,
    ],
  ): Shape {
    const openingUnits = opening.map((name) => this.take(name))
    this.addItem("Punctuator", openingUnits)
    const label = this.parseLabel()
    const [closingNames, name] = closing()
    const closingUnits = (
      typeof closingNames === "string" ? [closingNames] : closingNames
    ).map((closingName) => this.take(closingName))
    this.addItem("Punctuator", closingUnits)
    return this.shapeOf(name, null, label, this.placeFrom(start))
  }

  /** Shapes: `"[|" id-run ":" id-run "|" label "]"`, a rectangle with its property. */
  protected parseRectShape(start: number): Shape {
    this.addItem("Punctuator", [this.take("[|")])
    const propertyStart = this.next
    const propertyName = this.identifierOf([this.take("id-run")])
    this.addItem("Punctuator", [this.take(":")])
    const propertyValue = this.identifierOf([this.take("id-run")])
    const property = this.shapePropertyOf(
      propertyName,
      propertyValue,
      this.placeFrom(propertyStart),
    )
    this.addItem("Punctuator", [this.take("|")])
    const label = this.parseLabel()
    this.addItem("Punctuator", [this.take("]")])
    return this.shapeOf("rectangle", property, label, this.placeFrom(start))
  }

  /** Whether a shape starts at the next unit. */
  protected startsShape(): boolean {
    const name = this.nameAt(this.next)
    return name !== null && SHAPE_STARTS.some((candidate) => candidate === name)
  }

  /** Whether a link starts at the next unit: an edge id or an arrow. */
  protected startsLink(): boolean {
    const name = this.nameAt(this.next)
    return name === "edge-id" || name === "arrow" || name === "opening-arrow"
  }

  /**
   * Style, class, and link style statements: whether the next unit is a
   * `,` right after a `\` of the diagram text, which ends `pieces`.
   */
  protected escapedCommaFollows(
    pieces: readonly GraphUnit<GraphName<ExtraName>, Arrow>[],
  ): boolean {
    const last = pieces.at(-1)
    return (
      last !== undefined &&
      last.text.endsWith("\\") &&
      this.nameAt(this.next) === ","
    )
  }

  /** Style, class, and link style statements: `style`, the units of one style of the grammar. */
  protected takeStylePieces(): GraphUnit<GraphName<ExtraName>, Arrow>[] {
    const pieces = this.takeWhile(STYLE_PIECES)
    if (pieces.length === 0) throw this.unexpected(this.peek())
    return pieces
  }

  /**
   * Style, class, and link style statements: `name = ( number | letter |
   * id-run | "v" | "-" | "," | ":" | "&" | "#" | "*" )+`, one Identifier.
   */
  protected parseName(): Identifier {
    const units = this.takeWhile(NAME_UNITS)
    if (units.length === 0) throw this.unexpected(this.peek())
    return this.identifierOf(units)
  }

  /** Reads a `,` when it is the next unit, as a `Punctuator`; says whether it did. */
  protected takeComma(): boolean {
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
  protected parseLinkStyleNumber(): NumericLiteral {
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
   * Click statements: `callback = "call" callback-name "(" (
   * callback-arguments ")" | ")" ( "call" "(" callback-arguments ")" )? )`.
   * The `call` units are `Keyword` tokens and the parentheses `Punctuator`
   * tokens of the statement, in no field. When the parentheses after the
   * name are empty, the arguments may follow a second `call`.
   */
  protected parseCallback(): {
    readonly callback: Literal
    readonly callbackArguments: Literal | null
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

  /** Whether the unit at the position `position` is one that an id can start with. */
  protected isIdPieceAt(position: number): boolean {
    const name = this.nameAt(position)
    return name !== null && ID_PIECES.some((candidate) => candidate === name)
  }

  /** The position after the `space` units from the position `position`. */
  protected afterSpaces(position: number): number {
    return this.afterUnitsNamed(position, ["space"])
  }

  /**
   * diagrams/flowchart.md, Strings: the delimiters of the `string` or
   * `markdown-string` unit `unit`: what lies in it before and after its
   * content.
   */
  protected delimitersOf(
    unit: GraphUnit<GraphName<ExtraName>, Arrow>,
  ): Range[] {
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
   * ast.md, Shared leaf nodes > StringLiteral: the StringLiteral of the
   * `string` unit `unit`, one `String` item. Its value is its content: its
   * written text without the delimiters of the string contexts.
   */
  protected stringLiteralOf(
    unit: GraphUnit<GraphName<ExtraName>, Arrow>,
  ): StringLiteral {
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

  /** The styles production, including each diagram's leading-whitespace rules. */
  protected abstract parseStyles(classDefinition: boolean): (Literal | null)[]

  /**
   * Vertex statements: `vertex-statement = vertex-group ( data | space+ )?
   * ( link vertex-group ( data | space+ )? )*`. A data block is read with
   * the vertex right before it (see {@link GraphGrammar.readVertex}),
   * so what is left here of `( data | space+ )?` is the `space+` after a
   * group whose last vertex has no data block.
   */
  protected readVertexStatement<
    Group extends {
      readonly vertices: readonly { readonly data: readonly DataBlock[] }[]
    },
    Link extends { readonly target: Group },
  >(
    parseGroup: () => Group,
    parseLink: () => Link,
  ): NodePlace & { readonly first: Group; readonly links: Link[] } {
    const start = this.next
    const first = parseGroup()
    this.takeSpacesAfterGroup(first)
    const links: Link[] = []
    let source = first
    while (this.startsLink()) {
      const link = parseLink()
      this.takeSpacesAfterGroup(link.target)
      // Rejections outside the grammar, Link style numbers: one edge for each
      // pair of vertices.
      this.edgeCount += source.vertices.length * link.target.vertices.length
      links.push(link)
      source = link.target
    }
    return {
      first,
      links,
      ...this.placeFrom(start),
    }
  }

  /** Vertex statements: the `space+` of `( data | space+ )?` after `group`. */
  protected takeSpacesAfterGroup(group: {
    readonly vertices: readonly { readonly data: readonly DataBlock[] }[]
  }): void {
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
  protected readVertexGroup<Vertex>(
    parseVertex: () => Vertex,
  ): NodePlace & { readonly vertices: Vertex[] } {
    const start = this.next
    const vertices = [parseVertex()]
    for (;;) {
      const ampersand = this.afterSpaces(this.next)
      const ampersandUnit = this.unitAt(ampersand)
      if (ampersand === this.next || ampersandUnit?.name !== "&") break
      const afterAmpersand = this.positionAfter(ampersand)
      const vertex = this.afterSpaces(afterAmpersand)
      const unit = this.unitAt(vertex)
      if (unit === null) break
      const emptyForm = this.emptyFormErrorAt(unit)
      if (emptyForm !== null) throw emptyForm
      if (vertex === afterAmpersand || !this.isIdPieceAt(vertex)) break
      this.addItem("Punctuator", [ampersandUnit])
      this.moveTo(vertex)
      vertices.push(parseVertex())
    }
    return {
      vertices,
      ...this.placeFrom(start),
    }
  }

  /**
   * Vertex statements: `vertex = id shape? ( ":::" id )?`, and the data
   * blocks that belong to the vertex right before them: the `data?` of
   * `vertex-group` and the `data` of `vertex-statement`.
   */
  protected readVertex(): NodePlace & {
    readonly id: Identifier
    readonly shape: Shape | null
    readonly cssClass: Identifier | null
    readonly data: DataBlock[]
  } {
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
      id,
      shape,
      cssClass,
      data,
      ...this.placeFrom(start),
    }
  }

  /**
   * Links: `link = ( edge-id "@" )? arrow ( "|" label "|" space? )? |
   * ( edge-id "@" )? opening-arrow link-text arrow`, and the vertex group
   * after it, which is the link's target.
   */
  protected readLink<Group, Closed, Opening>(
    parseGroup: () => Group,
    arrowOf: (unit: GraphUnit<GraphName<ExtraName>, Arrow>) => Closed,
    openingArrowOf: (unit: GraphUnit<GraphName<ExtraName>, Arrow>) => Opening,
    parseLinkText: () => Label,
  ): NodePlace & {
    readonly id: Identifier | null
    readonly opening: Opening | null
    readonly arrow: Closed
    readonly label: Label | null
    readonly target: Group
  } {
    const start = this.next
    let id: Identifier | null = null
    const edgeId = this.takeIf("edge-id")
    if (edgeId !== null) {
      id = this.identifierOf([edgeId])
      this.addItem("Punctuator", [this.take("@")])
    }
    let opening: Opening | null = null
    let label: Label | null = null
    const openingArrow = this.takeIf("opening-arrow")
    if (openingArrow !== null) {
      opening = openingArrowOf(openingArrow)
      label = parseLinkText()
    }
    const arrow = arrowOf(this.take("arrow"))
    if (openingArrow === null) {
      const bar = this.takeIf("|")
      if (bar !== null) {
        this.addItem("Punctuator", [bar])
        label = this.parseLabel()
        this.addItem("Punctuator", [this.take("|")])
        this.takeIf("space")
      }
    }
    const target = parseGroup()
    return {
      id,
      opening,
      arrow,
      label,
      target,
      ...this.placeFrom(start),
    }
  }

  /** Style, class, and link style statements: `style-statement = "style" space id space styles`. */
  protected readStyleStatement(): NodePlace & {
    readonly id: Identifier
    readonly styles: (Literal | null)[]
  } {
    const start = this.next
    this.addItem("Keyword", [this.take("style")])
    this.take("space")
    const id = this.parseId()
    this.take("space")
    const styles = this.parseStyles(false)
    return {
      id,
      styles,
      ...this.placeFrom(start),
    }
  }

  /** Style, class, and link style statements: `class-def-statement = "classDef" space id-list space styles`. */
  protected readClassDefStatement(): NodePlace & {
    readonly cssClasses: (Identifier | null)[]
    readonly styles: (Literal | null)[]
  } {
    const start = this.next
    this.addItem("Keyword", [this.take("classDef")])
    this.take("space")
    const cssClasses = this.parseIdList()
    this.take("space")
    const styles = this.parseStyles(true)
    return {
      cssClasses,
      styles,
      ...this.placeFrom(start),
    }
  }

  /** Style, class, and link style statements: `class-statement = "class" space id-list space id`. */
  protected readClassStatement(): NodePlace & {
    readonly ids: (Identifier | null)[]
    readonly cssClass: Identifier
  } {
    const start = this.next
    this.addItem("Keyword", [this.take("class")])
    this.take("space")
    const ids = this.parseIdList()
    this.take("space")
    const cssClass = this.parseId()
    return {
      ids,
      cssClass,
      ...this.placeFrom(start),
    }
  }

  /**
   * Style, class, and link style statements: `link-style-statement =
   * "linkStyle" space ( "default" | number ( "," number )* ) space
   * ( "interpolate" space name ( space styles )? | styles )`.
   */
  protected readLinkStyleStatement(): NodePlace & {
    readonly indices: NumericLiteral[] | null
    readonly interpolate: Identifier | null
    readonly styles: (Literal | null)[]
  } {
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
    let styles: (Literal | null)[] = []
    const interpolateKeyword = this.takeIf("interpolate")
    if (interpolateKeyword !== null) {
      this.addItem("Keyword", [interpolateKeyword])
      this.take("space")
      interpolate = this.parseName()
      if (this.takeIf("space") !== null) styles = this.parseStyles(false)
    } else {
      styles = this.parseStyles(false)
    }
    return {
      indices: defaultKeyword === null ? indices : null,
      interpolate,
      styles,
      ...this.placeFrom(start),
    }
  }

  /** Direction statements: the keyword, required value, and optional surrounding text units. */
  protected readDirectionStatement(): NodePlace & {
    readonly before: GraphUnit<GraphName<ExtraName>, Arrow> | null
    readonly direction: string
    readonly after: GraphUnit<GraphName<ExtraName>, Arrow> | null
  } {
    const start = this.next
    const before = this.takeIf("direction-text")
    if (before !== null) this.addItem("RawText", [before])
    this.addItem("Keyword", [this.take("direction")])
    const value = this.take("direction-value")
    this.addItem("Keyword", [value])
    const after = this.takeIf("direction-text")
    if (after !== null) this.addItem("RawText", [after])
    return { before, direction: value.text, after, ...this.placeFrom(start) }
  }

  /** Accessibility line statements: keyword, colon, and optional title/description text. */
  protected readAccessibilityLine(
    keyword: "accTitle" | "accDescr",
  ): NodePlace & { readonly value: Literal | null } {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    this.addItem("Punctuator", [this.take(":")])
    const text = this.takeIf(
      keyword === "accTitle" ? "title-text" : "description-text",
    )
    return {
      value: text === null ? null : this.textLiteralOf([text]),
      ...this.placeFrom(start),
    }
  }

  /** An ordinary literal: its one RawText item and written source text. */
  protected readTextLiteral(
    units: readonly GraphUnit<GraphName<ExtraName>, Arrow>[],
  ): NodePlace & { readonly value: string } {
    this.addItem("RawText", units)
    const place = this.placeOf(units)
    return { value: this.textOf(place.range), ...place }
  }
}
