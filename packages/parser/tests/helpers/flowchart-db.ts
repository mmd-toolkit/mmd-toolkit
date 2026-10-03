import type { JsonObject } from "@mmd-toolkit/tests"
import type {
  DataBlockEffect,
  DbSummary,
  EmbeddedValues,
} from "@mmd-toolkit/tests/mermaid"
import { isWhitespace } from "../../src/character-classes.ts"
import { flowchartDbTexts } from "../../src/index.ts"
import type {
  FlowchartClassDefStatement,
  FlowchartClickCallbackStatement,
  FlowchartClickUrlStatement,
  FlowchartDataBlock,
  FlowchartDbTexts,
  FlowchartDefaultLinkStyleStatement,
  FlowchartDiagram,
  FlowchartLabel,
  FlowchartLink,
  FlowchartLiteral,
  FlowchartShape,
  FlowchartShapeName,
  FlowchartStatement,
  FlowchartSubgraphStatement,
  FlowchartVertex,
  FlowchartVertexGroup,
  FlowchartLinkStyleStatement,
  FlowchartStyleStatement,
  FlowchartVertexStatement,
  FlowchartArrow,
  FlowchartArrowMarker,
  FlowchartOpeningArrow,
  FlowchartOpeningArrowLine,
  Identifier,
  Root,
  StringLiteral,
} from "../../src/index.ts"
import { FlowchartText } from "../../src/diagrams/flowchart/flowchart-text.ts"
import { subgraphIdOf } from "../../src/diagrams/flowchart/subgraph-ids.ts"
import { ConvertedText } from "./converted-text.ts"
import { descriptionOf, setOwnProperty, trimmed } from "./db-values.ts"
import { FlowchartSource } from "./flowchart-source.ts"

// diagrams/flowchart.md, Db normalization: the summary of the Db that a
// flowchart tree denotes, in the form of `normalizeFlowchart()` of
// `@mmd-toolkit/tests`. Every step below is a paragraph of "Building the
// summary from the tree", and its comment names it. Each step reads the
// values of the tree in converted form (see `converted-text.ts`).

/** The text `text` without the whitespace at its end. */
function withoutWhitespaceAtEnd(text: string): string {
  let end = text.length
  while (end > 0 && isWhitespace(text.charCodeAt(end - 1))) end -= 1
  return text.slice(0, end)
}

/** Whether `text` is empty or all whitespace. */
function isBlank(text: string): boolean {
  return trimmed(text) === ""
}

/**
 * The summary: the style values of vertices, classes, edges, and the edge
 * defaults without the whitespace at their end, which the summary drops.
 */
function styleValues(values: readonly string[]): string[] {
  return values.map(withoutWhitespaceAtEnd)
}

/** The parts of `text` between its `,` characters. */
function partsBetweenCommas(text: string): string[] {
  return text.split(",")
}

/** A vertex of the summary while it is built. */
interface Vertex {
  id: string
  labelType: string
  styles: string[]
  classes: string[]
  text?: string
  type?: string
  props?: Record<string, string>
  link?: string
  linkTarget?: string
  [field: string]: unknown
}

/** An edge of the summary while it is built. */
interface Edge {
  start: string
  end: string
  type: string
  stroke: string
  length?: number
  text: string
  labelType: string
  classes: string[]
  isUserDefinedId: boolean
  id: string
  interpolate?: string
  style?: string[]
  [field: string]: unknown
}

/** A subgraph of the summary while it is built. */
interface Subgraph {
  id: string
  nodes: string[]
  title: string
  classes: string[]
  labelType: string
  dir?: string
  [field: string]: unknown
}

/** A class of the summary while it is built. */
interface ClassDef {
  id: string
  styles: string[]
}

/** Arrows: what the arrows of a link give its edges. */
interface ArrowValues {
  readonly type: string
  readonly stroke: string
  /** Null when there is no length. */
  readonly length: number | null
}

/** Shapes: the Db type of each shape name, for `rectangle` without a property. */
const SHAPE_DB_TYPES: Readonly<Record<FlowchartShapeName, string>> = {
  rectangle: "square",
  rounded: "round",
  circle: "circle",
  "double-circle": "doublecircle",
  diamond: "diamond",
  hexagon: "hexagon",
  stadium: "stadium",
  "framed-rectangle": "subroutine",
  cylinder: "cylinder",
  odd: "odd",
  ellipse: "ellipse",
  "trapezoid-bottom": "trapezoid",
  "lean-right": "lean_right",
  "trapezoid-top": "inv_trapezoid",
  "lean-left": "lean_left",
}

/**
 * Shapes: the Db type of the shape `shape`, from its name, and `rect` for
 * a rectangle written with a property, `[|name:value|...]`.
 */
function dbTypeOf(shape: FlowchartShape): string {
  return shape.name === "rectangle" && shape.property !== null
    ? "rect"
    : SHAPE_DB_TYPES[shape.name]
}

/** Arrows: the type that a marker gives. */
const TYPES_OF_MARKERS: Readonly<Record<FlowchartArrowMarker, string>> = {
  arrow: "arrow_point",
  cross: "arrow_cross",
  circle: "arrow_circle",
  none: "arrow_open",
}

/** Arrows: the stroke that the line of an opening arrow gives. */
const OPENING_STROKES: Readonly<Record<FlowchartOpeningArrowLine, string>> = {
  solid: "normal",
  thick: "thick",
  dotted: "dotted",
}

/**
 * Arrows: the type, the stroke, and the length that the closed arrow
 * `arrow` gives. The type comes from its end marker, prefixed with
 * `double_` when its start marker matches; the stroke from its line, a
 * thick line giving `normal` when its start marker neither is `none` nor
 * matches; the length from its length. The length above 10 counts as 10.
 */
function closingArrowValues(arrow: FlowchartArrow): ArrowValues {
  const { startMarker, line, endMarker } = arrow
  const matches = startMarker !== "none" && startMarker === endMarker
  const endType = TYPES_OF_MARKERS[endMarker]
  const type = matches ? `double_${endType}` : endType
  let stroke: string
  switch (line) {
    case "invisible":
      stroke = "invisible"
      break
    case "dotted":
      stroke = "dotted"
      break
    case "solid":
      stroke = "normal"
      break
    case "thick":
      stroke = startMarker === "none" || matches ? "thick" : "normal"
      break
    default:
      throw new Error(`unknown line ${JSON.stringify(line satisfies never)}`)
  }
  let length = arrow.length
  if (line !== "dotted") {
    length -= 1
    if (endMarker === "none") length -= 1
    if (startMarker !== "none" && !matches) length += 1
  }
  return { type, stroke, length: Math.min(length, 10) }
}

/**
 * Arrows: the values that a link with the opening arrow `opening` and the
 * closing arrow `arrow` gives. The opening arrow gives a type from its
 * start marker and a stroke from its line; a stroke other than that of the
 * closing arrow, or a type other than `arrow_open` that is not the closing
 * arrow's type, gives `INVALID`.
 */
function linkArrowValues(
  opening: FlowchartOpeningArrow,
  arrow: FlowchartArrow,
): ArrowValues {
  const closing = closingArrowValues(arrow)
  const headType = TYPES_OF_MARKERS[opening.startMarker]
  const invalid: ArrowValues = {
    type: "INVALID",
    stroke: "INVALID",
    length: null,
  }
  if (OPENING_STROKES[opening.line] !== closing.stroke) return invalid
  if (headType === "arrow_open") return closing
  if (headType === closing.type) {
    return { ...closing, type: `double_${closing.type}` }
  }
  return invalid
}

/** Direction: the direction of the diagram that the header's direction gives. */
function diagramDirectionOf(direction: string | null): string {
  switch (direction) {
    case null:
    case "v":
    case "TD":
      return "TB"
    case "<":
      return "RL"
    case "^":
      return "BT"
    case ">":
      return "LR"
    default:
      return direction
  }
}

/** Style statements: `classDef` reads each `\,` in the Db text of a style as `,`. */
function classDefStyleOf(dbText: string): string {
  return dbText.split("\\,").join(",")
}

/** The statements whose `styles` hold styles. */
type StatementWithStyles =
  | FlowchartStyleStatement
  | FlowchartClassDefStatement
  | FlowchartLinkStyleStatement
  | FlowchartDefaultLinkStyleStatement

/** The summary of a flowchart while it is built. */
class FlowchartDbBuilder {
  private readonly vertices = new Map<string, Vertex>()

  private readonly edges: Edge[] = []

  private readonly classDefs = new Map<string, ClassDef>()

  private readonly subgraphs: Subgraph[] = []

  private readonly tooltips = new Map<string, string>()

  private defaultInterpolate: string | null = null

  private defaultStyle: string[] | null = null

  private accTitle = ""

  private accDescr = ""

  /** The effects of the data blocks that are not applied yet, in source order. */
  private readonly dataBlockEffects: DataBlockEffect[]

  private readonly direction: string

  private readonly inheritDir: boolean

  /** The source as the parser reads it, with its units. */
  private readonly source: FlowchartSource

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The texts that the Db reads past the range of a value node (`flowchartDbTexts`). */
  private readonly dbTexts: FlowchartDbTexts

  public constructor(
    source: string,
    root: Root,
    diagram: FlowchartDiagram,
    embedded: EmbeddedValues,
  ) {
    this.source = new FlowchartSource(source, root)
    this.text = new ConvertedText(new FlowchartText(this.source.diagramText))
    this.dbTexts = flowchartDbTexts(root, source)
    this.direction = diagramDirectionOf(diagram.direction)
    // Db normalization, Subgraphs: a subgraph inherits the direction of the
    // diagram when `flowchart.inheritDir` of the effective configuration is
    // anything but `false`, zero, NaN, the empty string, and null; a
    // configuration without it has the default `false`.
    const flowchartConfig: unknown = embedded.config.flowchart
    const inheritDir: unknown =
      typeof flowchartConfig === "object" &&
      flowchartConfig !== null &&
      "inheritDir" in flowchartConfig
        ? flowchartConfig.inheritDir
        : false
    this.inheritDir = !(
      inheritDir === false ||
      inheritDir === 0 ||
      Number.isNaN(inheritDir) ||
      inheritDir === "" ||
      inheritDir === null ||
      inheritDir === undefined
    )
    this.dataBlockEffects = [...embedded.dataBlockEffects]
  }

  /** The summary of `diagram`, with the title from the frontmatter. */
  public summaryOf(diagram: FlowchartDiagram, title: string): DbSummary {
    for (const statement of diagram.body) this.applyStatement(statement)
    if (this.dataBlockEffects.length > 0) {
      throw new Error(
        `flowchart Db: mermaid.js applied ${this.dataBlockEffects.length} more data blocks than the tree has`,
      )
    }
    return {
      direction: this.direction,
      title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      vertices: [...this.vertices.values()].map((vertex): JsonObject => ({
        ...(vertex as JsonObject),
        styles: styleValues(vertex.styles),
      })),
      edges: this.edges.map((edge): JsonObject => ({
        ...(edge as JsonObject),
        ...(edge.style === undefined ? {} : { style: styleValues(edge.style) }),
      })),
      edgeDefaults: {
        interpolate: this.defaultInterpolate,
        style:
          this.defaultStyle === null ? null : styleValues(this.defaultStyle),
      },
      classDefs: [...this.classDefs.values()].map((classDef) => ({
        id: classDef.id,
        styles: styleValues(classDef.styles),
      })),
      subgraphs: this.subgraphs.map((subgraph) => subgraph as JsonObject),
      tooltips: [...this.tooltips].map(([id, text]) => ({ id, text })),
    }
  }

  /** The statement `statement`, in source order; the members it gives a subgraph around it. */
  private applyStatement(statement: FlowchartStatement): string[] {
    switch (statement.type) {
      case "FlowchartVertexStatement":
        return this.applyVertexStatement(statement)
      case "FlowchartSubgraphStatement":
        return [this.applySubgraphStatement(statement)]
      case "FlowchartStyleStatement":
        this.vertexStep(
          this.nameOf(statement.id),
          null,
          null,
          this.dbTextsOf(statement),
          null,
        )
        return []
      case "FlowchartClassDefStatement": {
        const styles = this.dbTextsOf(statement).map(classDefStyleOf)
        for (const cssClass of statement.cssClasses) {
          const name = this.nameOf(cssClass)
          const classDef = this.classDefs.get(name) ?? { id: name, styles: [] }
          this.classDefs.set(name, classDef)
          classDef.styles.push(...styles)
        }
        return []
      }
      case "FlowchartClassStatement":
        this.classStep(
          statement.ids.map((id) => this.nameOf(id)),
          this.nameOf(statement.cssClass),
        )
        return []
      case "FlowchartClickCallbackStatement":
      case "FlowchartClickUrlStatement":
        this.applyClickStatement(statement)
        return []
      case "FlowchartLinkStyleStatement": {
        const interpolate =
          statement.interpolate === null
            ? null
            : this.nameOf(statement.interpolate)
        const styles = this.dbTextsOf(statement)
        if (
          styles.length > 0 &&
          !styles.some((style) => style.startsWith("fill"))
        ) {
          styles.push("fill:none")
        }
        for (const index of statement.indices) {
          const edge = this.edges[index.value]
          if (interpolate !== null) edge.interpolate = interpolate
          if (styles.length > 0) edge.style = styles
        }
        return []
      }
      case "FlowchartDefaultLinkStyleStatement":
        if (statement.interpolate !== null) {
          this.defaultInterpolate = this.nameOf(statement.interpolate)
        }
        if (statement.styles.length > 0) {
          this.defaultStyle = this.dbTextsOf(statement)
        }
        return []
      case "FlowchartAccTitleStatement": {
        const value = this.literalTextOf(statement.value)
        this.accTitle = value ?? ""
        return value === null ? [] : [value]
      }
      case "FlowchartAccDescrStatement": {
        const value = this.literalTextOf(statement.value)
        this.accDescr = value === null ? "" : descriptionOf(value)
        return value === null ? [] : [value]
      }
      case "FlowchartAccDescrBlockStatement": {
        // A block that is not closed sets the empty description, whatever
        // its text; a closed block without text changes nothing.
        const value = this.literalTextOf(statement.value)
        if (!statement.closed) this.accDescr = ""
        else if (value !== null) this.accDescr = descriptionOf(value)
        return value === null ? [] : [value]
      }
      case "FlowchartEmptyStatement":
        return [";"]
      case "FlowchartDirectionStatement":
        return []
      default:
        throw new Error(
          `flowchart Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /**
   * The vertex step, with an id, and optionally a label, the Db type of a
   * shape, styles, and a property.
   */
  private vertexStep(
    id: string,
    label: FlowchartLabel | null,
    shapeType: string | null,
    styles: readonly string[] | null,
    property: { readonly name: string; readonly value: string } | null,
  ): void {
    if (this.edges.some((edge) => edge.id === id)) return
    let vertex = this.vertices.get(id)
    if (vertex === undefined) {
      vertex = { id, labelType: "text", styles: [], classes: [] }
      this.vertices.set(id, vertex)
    }
    if (label !== null) {
      vertex.text = trimmed(this.labelTextOf(label))
      vertex.labelType = label.kind
    } else {
      vertex.text ??= id
    }
    if (shapeType !== null) vertex.type = shapeType
    if (styles !== null) vertex.styles.push(...styles)
    // Vertex step 5: a vertex without `props` gets them, with the property
    // or empty. A vertex with `props` gets the property added or its value
    // replaced, except that a later `__proto__` only replaces a `__proto__`
    // that the step that made the `props` gave them.
    if (vertex.props === undefined) {
      vertex.props = {}
      if (property !== null) {
        setOwnProperty(vertex.props, property.name, property.value)
      }
    } else if (
      property !== null &&
      (property.name !== "__proto__" ||
        Object.hasOwn(vertex.props, "__proto__"))
    ) {
      setOwnProperty(vertex.props, property.name, property.value)
    }
  }

  /** The converted form of the name of `identifier`; a null element of a list of ids or class names stands for the empty text. */
  private nameOf(identifier: Identifier | null): string {
    return identifier === null ? "" : this.text.of(identifier.range)
  }

  /** The converted form of the value of `literal`, or null. */
  private literalTextOf(literal: FlowchartLiteral | null): string | null {
    return literal === null ? null : this.text.of(literal.range)
  }

  /** The converted form of the value of `string`: its content. */
  private stringTextOf(string: StringLiteral): string {
    return this.text.of(
      string.range,
      this.source.stringDelimitersIn(string.range),
    )
  }

  /**
   * The converted form of the value of `label`: the text of its range
   * without the delimiters of the string or markdown string that it starts
   * with, its first unit.
   */
  private labelTextOf(label: FlowchartLabel): string {
    return this.text.of(
      label.range,
      this.source.stringDelimitersIn(label.range),
    )
  }

  /**
   * Style statements: the Db texts of the styles of `statement`, in
   * converted form; where each starts and ends is that of
   * `flowchartDbTexts`.
   */
  private dbTextsOf(statement: StatementWithStyles): string[] {
    const dbTexts = this.dbTexts.styles.get(statement)
    if (dbTexts === undefined) {
      throw new Error(`flowchart Db: no Db texts for ${statement.type}`)
    }
    return dbTexts.map(({ range, leftOut }) => this.text.of(range, leftOut))
  }

  /**
   * Subgraphs: the name text of the subgraph statement `statement`, in
   * converted form; its range is that of `flowchartDbTexts`.
   */
  private nameTextOf(statement: FlowchartSubgraphStatement): string {
    const nameText = this.dbTexts.subgraphNameTexts.get(statement)
    if (nameText === undefined) {
      throw new Error("flowchart Db: a subgraph has no name text")
    }
    return this.text.of(nameText.range, nameText.leftOut)
  }

  /** The subgraph added last with the id `id`, if there is one. */
  private lastSubgraphWithId(id: string): Subgraph | undefined {
    for (let index = this.subgraphs.length - 1; index >= 0; index -= 1) {
      if (this.subgraphs[index].id === id) return this.subgraphs[index]
    }
    return undefined
  }

  /**
   * The class step, with ids and a class name: appended to the classes of
   * the vertex with each id, of the first edge with that id, and of the
   * last subgraph added with that id.
   */
  private classStep(ids: readonly string[], cssClass: string): void {
    for (const id of ids) {
      this.vertices.get(id)?.classes.push(cssClass)
      this.edges.find((edge) => edge.id === id)?.classes.push(cssClass)
      this.lastSubgraphWithId(id)?.classes.push(cssClass)
    }
  }

  /**
   * Data blocks in the Db: the next entry of `dataBlockEffects`, for the
   * data blocks `blocks` of the vertex with the id `id`, written one after
   * another, which count as one entry. Its fields are set on the subgraph
   * added last with that id, if there is one; otherwise on the first edge
   * with that id, if there is one; otherwise on the vertex.
   */
  private applyDataBlocks(
    id: string,
    blocks: readonly FlowchartDataBlock[],
  ): void {
    if (blocks.length === 0) return
    const effect = this.dataBlockEffects.shift()
    if (effect === undefined) {
      throw new Error(
        `flowchart Db: mermaid.js applied no data block for the one at ${blocks[0].range[0]}`,
      )
    }
    if (effect.id !== id) {
      throw new Error(
        `flowchart Db: mermaid.js applied a data block of ${JSON.stringify(effect.id)} for the one of ${JSON.stringify(id)}`,
      )
    }
    const element =
      this.lastSubgraphWithId(id) ??
      this.edges.find((edge) => edge.id === id) ??
      this.vertices.get(id)
    if (element === undefined) {
      throw new Error(
        `flowchart Db: no element with the id ${JSON.stringify(id)}`,
      )
    }
    for (const [key, value] of Object.entries(effect.set)) {
      setOwnProperty(element, key, value)
    }
  }

  /**
   * Vertex statements: for each vertex group, its vertices and data blocks,
   * and after each link's target group the link's edges. Returns the
   * members: the ids of the last group, then those of the group before it,
   * back to the first group.
   */
  private applyVertexStatement(statement: FlowchartVertexStatement): string[] {
    this.applyVertexGroup(statement.first)
    let source = statement.first
    for (const link of statement.links) {
      this.applyVertexGroup(link.target)
      this.addEdges(source, link)
      source = link.target
    }
    const groups = [
      statement.first,
      ...statement.links.map((link) => link.target),
    ]
    return groups
      .reverse()
      .flatMap((group) =>
        group.vertices.map((vertex) => this.nameOf(vertex.id)),
      )
  }

  /**
   * Vertex statements: for each vertex of the group, the vertex step, the
   * class step with the parts of its id between its `,` characters, and the
   * data block of the vertex before it; after the last vertex, its data
   * block.
   */
  private applyVertexGroup(group: FlowchartVertexGroup): void {
    let previous: FlowchartVertex | null = null
    for (const vertex of group.vertices) {
      this.applyVertex(vertex)
      if (previous !== null) {
        this.applyDataBlocks(this.nameOf(previous.id), previous.data)
      }
      previous = vertex
    }
    if (previous !== null) {
      this.applyDataBlocks(this.nameOf(previous.id), previous.data)
    }
  }

  /** Vertex statements: the vertex step and the class step of one vertex. */
  private applyVertex(vertex: FlowchartVertex): void {
    const shape: FlowchartShape | null = vertex.shape
    const id = this.nameOf(vertex.id)
    this.vertexStep(
      id,
      shape?.label ?? null,
      shape === null ? null : dbTypeOf(shape),
      null,
      shape?.property
        ? {
            name: this.nameOf(shape.property.name),
            value: this.nameOf(shape.property.value),
          }
        : null,
    )
    if (vertex.cssClass !== null) {
      this.classStep(partsBetweenCommas(id), this.nameOf(vertex.cssClass))
    }
  }

  /**
   * Links: the edges from each vertex of `source` to each vertex of the
   * link's target, in order.
   */
  private addEdges(source: FlowchartVertexGroup, link: FlowchartLink): void {
    const arrow =
      link.opening === null
        ? closingArrowValues(link.arrow)
        : linkArrowValues(link.opening, link.arrow)
    const lastOfSource = this.nameOf(source.vertices.at(-1)?.id ?? null)
    const firstOfTarget = this.nameOf(link.target.vertices[0].id)
    for (const startVertex of source.vertices) {
      for (const endVertex of link.target.vertices) {
        const start = this.nameOf(startVertex.id)
        const end = this.nameOf(endVertex.id)
        const edge: Edge = {
          start,
          end,
          type: arrow.type,
          stroke: arrow.stroke,
          text:
            link.label === null ? "" : trimmed(this.labelTextOf(link.label)),
          labelType: link.label === null ? "text" : link.label.kind,
          classes: [],
          ...this.edgeId(link, start, end, lastOfSource, firstOfTarget),
        }
        if (arrow.length !== null) edge.length = arrow.length
        if (this.defaultInterpolate !== null) {
          edge.interpolate = this.defaultInterpolate
        }
        this.edges.push(edge)
      }
    }
  }

  /** Links: the id of the edge from `start` to `end`, and whether the author wrote it. */
  private edgeId(
    link: FlowchartLink,
    start: string,
    end: string,
    lastOfSource: string,
    firstOfTarget: string,
  ): { id: string; isUserDefinedId: boolean } {
    if (link.id !== null && start === lastOfSource && end === firstOfTarget) {
      const written = this.nameOf(link.id)
      const at = written.indexOf("@")
      const id =
        at === -1 ? written : `${written.slice(0, at)}${written.slice(at + 1)}@`
      if (!this.edges.some((edge) => edge.id === id)) {
        return { id, isUserDefinedId: true }
      }
    }
    const earlier = this.edges.filter(
      (edge) => edge.start === start && edge.end === end,
    ).length
    return {
      id: `L_${start}_${end}_${earlier === 0 ? 0 : earlier + 1}`,
      isUserDefinedId: false,
    }
  }

  /**
   * Subgraphs: the statements of the body, then the subgraph. Returns its
   * Db id, its member in a subgraph around it.
   */
  private applySubgraphStatement(
    statement: FlowchartSubgraphStatement,
  ): string {
    const members: string[] = []
    for (const inner of statement.body)
      members.push(...this.applyStatement(inner))
    const nodes: string[] = []
    for (const member of members) {
      if (isBlank(member)) continue
      // Only the first of equal members is kept, except that every
      // `__proto__` is kept; a member that an earlier subgraph has is left
      // out, `__proto__` included.
      if (member !== "__proto__" && nodes.includes(member)) continue
      if (this.subgraphs.some((subgraph) => subgraph.nodes.includes(member))) {
        continue
      }
      nodes.push(member)
    }
    const { name, title } = statement
    const nameText = this.nameTextOf(statement)
    const id = subgraphIdOf(nameText, title !== null, this.subgraphs.length)
    const subgraph: Subgraph = {
      id,
      nodes,
      title: trimmed(title === null ? nameText : this.labelTextOf(title)),
      classes: [],
      labelType:
        title !== null
          ? title.kind
          : name.kind === "markdown"
            ? "markdown"
            : "text",
    }
    const directions = statement.body.filter(
      (inner) => inner.type === "FlowchartDirectionStatement",
    )
    const lastDirection = directions[directions.length - 1]
    if (lastDirection !== undefined) {
      subgraph.dir = lastDirection.direction
    } else if (this.inheritDir) {
      subgraph.dir = this.direction
    }
    this.subgraphs.push(subgraph)
    return id
  }

  /**
   * Click statements: a callback applies the class step with `clickable`; a
   * URL gives each vertex with one of the ids the URL, trimmed, as `link`,
   * none when it is empty, and the target as `linkTarget`, and then applies
   * the class step. A tooltip is recorded for each id.
   */
  private applyClickStatement(
    statement: FlowchartClickCallbackStatement | FlowchartClickUrlStatement,
  ): void {
    const ids = statement.ids.map((id) => this.nameOf(id))
    if (statement.type === "FlowchartClickUrlStatement") {
      const url = trimmed(this.stringTextOf(statement.url))
      for (const id of ids) {
        const vertex = this.vertices.get(id)
        if (vertex === undefined) continue
        if (url === "") delete vertex.link
        else vertex.link = url
        if (statement.target === null) delete vertex.linkTarget
        else vertex.linkTarget = statement.target
      }
    }
    this.classStep(ids, "clickable")
    if (statement.tooltip !== null) {
      const tooltip = this.stringTextOf(statement.tooltip)
      for (const id of ids) this.tooltips.set(id, tooltip)
    }
  }
}

/**
 * diagrams/flowchart.md, Db normalization: the summary of the Db that the
 * flowchart `diagram` denotes. The title, the configuration, and the effects
 * of the data blocks come from mermaid.js through `embedded`: the tree does
 * not read embedded data.
 */
export function flowchartDbOf(
  source: string,
  root: Root,
  diagram: FlowchartDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new FlowchartDbBuilder(source, root, diagram, embedded).summaryOf(
    diagram,
    embedded.title ?? "",
  )
}
