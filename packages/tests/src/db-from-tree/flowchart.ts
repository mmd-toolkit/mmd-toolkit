import {
  classDefStyleOf,
  dbTypeOf,
  diagramDirectionOf,
  styleValues,
} from "./graph-values.ts"
import type { DataBlockEffect, EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { isWhitespace } from "./characters.ts"
import type { ConvertedCharacter } from "./converted-text.ts"
import {
  ConvertedText,
  readConvertedCharacters,
  readWhitespaceAfterBraceAsLineFeed,
} from "./converted-text.ts"
import type {
  FlowchartAccDescrBlockStatement,
  FlowchartArrow,
  FlowchartArrowMarker,
  FlowchartClassDefStatement,
  FlowchartClickCallbackStatement,
  FlowchartClickUrlStatement,
  FlowchartDataBlock,
  FlowchartDefaultLinkStyleStatement,
  FlowchartDiagram,
  FlowchartLabel,
  FlowchartLink,
  FlowchartLinkStyleStatement,
  FlowchartLiteral,
  FlowchartOpeningArrow,
  FlowchartOpeningArrowLine,
  FlowchartShape,
  FlowchartStatement,
  FlowchartStyleStatement,
  FlowchartSubgraphStatement,
  FlowchartVertex,
  FlowchartVertexGroup,
  FlowchartVertexStatement,
} from "./flowchart-tree.ts"
import {
  applyGraphClass,
  applyGraphClick,
  applyGraphLinkStyle,
  lastGraphWithId,
  StringDelimiters,
} from "./graph.ts"
import type { Identifier, StringLiteral, TreeRange, TreeRoot } from "./tree.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import {
  descriptionOf,
  setOwnProperty,
  trimmed,
  withoutEnclosingQuotes,
} from "./values.ts"

// docs/db-from-tree/flowchart.md: the summary of the Db that a
// flowchart tree denotes, in the form of `normalizeFlowchart()` of
// `@mmd-toolkit/tests`. Every step below is a paragraph of "Building the
// summary from the tree", and its comment names it. Each step reads the
// values of the tree in converted form (see `converted-text.ts`), with
// the whitespace after `}` read as one line feed.

/** The characters of the converted form that end the name text of a subgraph. */
const LINE_FEED = 0x0a
const SEMICOLON = 0x3b
const OPENING_BRACKET = 0x5b

/** Whether `text` is empty or all whitespace. */
function isBlank(text: string): boolean {
  return trimmed(text) === ""
}

/** Whether `text` holds a whitespace character. */
function holdsWhitespace(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    if (isWhitespace(text.charCodeAt(index))) return true
  }
  return false
}

/** The parts of `text` between its `,` characters. */
function partsBetweenCommas(text: string): string[] {
  return text.split(",")
}

/**
 * Subgraphs: the Db id of a subgraph with the name text `nameText`: the name
 * text, trimmed, or, when the subgraph has no title and its name text
 * contains whitespace, `subGraph` followed by `number`, the number of
 * subgraphs added before it.
 */
function subgraphIdOf(
  nameText: string,
  hasTitle: boolean,
  number: number,
): string {
  return !hasTitle && holdsWhitespace(nameText)
    ? `subGraph${number}`
    : trimmed(nameText)
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
      throw new Error(
        `flowchart Db: unknown line ${JSON.stringify(line satisfies never)}`,
      )
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

/** The statements whose `styles` hold styles. */
type StatementWithStyles =
  | FlowchartStyleStatement
  | FlowchartClassDefStatement
  | FlowchartLinkStyleStatement
  | FlowchartDefaultLinkStyleStatement

/**
 * Subgraphs: the ranges of the empty description blocks right after the name
 * of a subgraph with the body `body`. They are its first statements, and a
 * block that the separator follows is the only one that the name text reads
 * through.
 */
function emptyBlocksAtStartOf(
  body: readonly FlowchartStatement[],
): TreeRange[] {
  const blocks: TreeRange[] = []
  for (const statement of body) {
    if (
      statement.type !== "FlowchartAccDescrBlockStatement" ||
      !isEmptyBlock(statement)
    ) {
      break
    }
    blocks.push(statement.range)
  }
  return blocks
}

/** Whether the description block `block` is closed and has no text. */
function isEmptyBlock(block: FlowchartAccDescrBlockStatement): boolean {
  return block.closed && block.value === null
}

/** The summary of a flowchart while it is built. */
class FlowchartDbBuilder {
  private readonly vertices = new Map<string, Vertex>()

  private readonly edges: Edge[] = []

  private readonly classDefs = new Map<string, ClassDef>()

  private readonly subgraphs: Subgraph[] = []

  private readonly tooltips = new Map<string, string>()

  private readonly clickCalls: {
    id: string
    name: string
    args: string | null
  }[] = []

  private defaultInterpolate: string | null = null

  private defaultStyle: string[] | null = null

  private accTitle = ""

  private accDescr = ""

  /** The effects of the data blocks that are not applied yet, in source order. */
  private readonly dataBlockEffects: DataBlockEffect[]

  private readonly direction: string

  private readonly inheritDir: boolean

  /** The diagram text in converted form, with the offset of each character. */
  private readonly characters: readonly ConvertedCharacter[]

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The delimiters of the strings of the tree. */
  private readonly strings: StringDelimiters

  /** The replacement of characters that the configuration gives the texts that the Db keeps. */
  private readonly replace: TextReplacement

  public constructor(
    source: string,
    root: TreeRoot,
    diagram: FlowchartDiagram,
    embedded: EmbeddedValues,
  ) {
    this.characters = readWhitespaceAfterBraceAsLineFeed(
      readConvertedCharacters(source, root),
    )
    this.text = new ConvertedText(this.characters)
    this.strings = new StringDelimiters(root, this.characters)
    this.replace = textReplacementOf(embedded.config)
    this.direction = diagramDirectionOf(diagram.direction)
    // docs/db-from-tree/flowchart.md, Subgraphs: a subgraph inherits the direction of the
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
    // The elements of the summary hold JSON values only: texts, numbers,
    // lists of texts, and the fields that the data blocks set.
    return {
      direction: this.direction,
      title: this.replace(title),
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
      ...(this.clickCalls.length === 0 ? {} : { clickCalls: this.clickCalls }),
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
          this.stylesOf(statement),
          null,
        )
        return []
      case "FlowchartClassDefStatement": {
        const styles = this.stylesOf(statement).map(classDefStyleOf)
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
      case "FlowchartLinkStyleStatement":
        this.applyLinkStyleStatement(statement)
        return []
      case "FlowchartDefaultLinkStyleStatement":
        if (statement.interpolate !== null) {
          this.defaultInterpolate = this.nameOf(statement.interpolate)
        }
        if (statement.styles.length > 0) {
          this.defaultStyle = this.stylesOf(statement)
        }
        return []
      case "FlowchartAccTitleStatement": {
        const value = this.literalTextOf(statement.value)
        this.accTitle = this.replace(value ?? "")
        return value === null ? [] : [value]
      }
      case "FlowchartAccDescrStatement": {
        const value = this.literalTextOf(statement.value)
        this.accDescr = value === null ? "" : this.replace(descriptionOf(value))
        return value === null ? [] : [value]
      }
      case "FlowchartAccDescrBlockStatement": {
        // A block that is not closed sets the empty description, whatever
        // its text; a closed block without text changes nothing.
        const value = this.literalTextOf(statement.value)
        if (!statement.closed) this.accDescr = ""
        else if (value !== null)
          this.accDescr = this.replace(descriptionOf(value))
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
   * Style statements: a link style statement sets the interpolate and the
   * styles of the edges it numbers. Styles that none starts with `fill` get
   * `fill:none` after them.
   */
  private applyLinkStyleStatement(
    statement: FlowchartLinkStyleStatement,
  ): void {
    applyGraphLinkStyle(
      statement.indices.map((index) => index.value),
      statement.interpolate === null
        ? null
        : this.nameOf(statement.interpolate),
      this.stylesOf(statement),
      this.edges,
    )
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
      vertex.text = withoutEnclosingQuotes(
        this.replace(trimmed(this.labelTextOf(label))),
      )
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
    return this.text.of(string.range, this.strings.around(string.range))
  }

  /**
   * The converted form of the value of `label`: its written text
   * without the delimiters of the string or markdown string that it starts
   * with, its first unit.
   */
  private labelTextOf(label: FlowchartLabel): string {
    return this.text.of(label.range, this.strings.around(label.range))
  }

  /**
   * Style statements: the styles of `statement`, in converted form: the
   * value of each, or the empty text for a null style.
   */
  private stylesOf(statement: StatementWithStyles): string[] {
    return statement.styles.map((style) =>
      style === null ? "" : this.text.of(style.range),
    )
  }

  /**
   * Subgraphs: the name text of the subgraph statement `statement`, in
   * converted form: the value of its name, which holds the whitespace that
   * mermaid.js reads after it up to its separator (ast/flowchart.md,
   * FlowchartSubgraphStatement), and, where empty description blocks follow
   * the name right after it, the text from the end of the name to the
   * separator without the blocks. No node holds the whitespace between and
   * after those blocks, so there the name text is read from the source: it
   * ends where the separator starts (`nameTextEndOf`), and the blocks follow
   * the name when the first statement of the body, such a block, starts
   * before that end.
   */
  private nameTextOf(statement: FlowchartSubgraphStatement): string {
    const { name, body } = statement
    const value = this.labelTextOf(name)
    const blocks = emptyBlocksAtStartOf(body)
    const end = this.nameTextEndOf(name, blocks)
    const [first] = blocks
    if (first === undefined || first[0] >= end) return value
    return value + this.text.of([name.range[1], end], blocks)
  }

  /**
   * Subgraphs: the offset where the name text of a subgraph with the name
   * `name` ends, the offset of what follows the name: the first `[`, or the
   * first `;` that the line rule does not ignore, or the first line feed,
   * of the converted form after the name. The comment regions, the
   * directives, and the `;` that the line rule ignores are not in it, and
   * the whitespace after the `}` of an empty description block that a line
   * feed ends is one line feed that starts right after the `}`. The
   * characters of the empty description blocks `blocks` are skipped: a block
   * may hold a line feed after its `accDescr` or its `{`.
   */
  private nameTextEndOf(
    name: FlowchartLabel,
    blocks: readonly TreeRange[],
  ): number {
    for (const { start, codePoint } of this.characters) {
      if (start < name.range[1]) continue
      if (blocks.some(([from, to]) => from <= start && start < to)) continue
      if (
        codePoint === OPENING_BRACKET ||
        codePoint === SEMICOLON ||
        codePoint === LINE_FEED
      ) {
        return start
      }
    }
    throw new Error(
      `flowchart Db: nothing follows the subgraph name at ${name.range[0]}`,
    )
  }

  /** The subgraph added last with the id `id`, if there is one. */
  private lastSubgraphWithId(id: string): Subgraph | undefined {
    return lastGraphWithId(this.subgraphs, id)
  }

  /**
   * The class step, with ids and a class name: appended to the classes of
   * the vertex with each id, of the first edge with that id, and of the
   * last subgraph added with that id.
   */
  private classStep(ids: readonly string[], cssClass: string): void {
    applyGraphClass(ids, cssClass, this.vertices, this.edges, this.subgraphs)
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
            link.label === null
              ? ""
              : withoutEnclosingQuotes(
                  this.replace(trimmed(this.labelTextOf(link.label))),
                ),
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
      title: trimmed(
        this.replace(title === null ? nameText : this.labelTextOf(title)),
      ),
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
    const lastDirection = directions.at(-1)
    if (lastDirection !== undefined) {
      subgraph.dir = lastDirection.direction
    } else if (this.inheritDir) {
      subgraph.dir = this.direction
    }
    this.subgraphs.push(subgraph)
    return id
  }

  /**
   * Click statements: a callback records a click call for each id (the name
   * of the function and the arguments as written, the text between the
   * parentheses, whitespace at its ends too) and applies the class step with
   * `clickable`; a
   * URL gives each vertex with one of the ids the URL, trimmed, as `link`,
   * none when it is empty, and the target as `linkTarget`, and then applies
   * the class step. A tooltip is recorded for each id.
   */
  private applyClickStatement(
    statement: FlowchartClickCallbackStatement | FlowchartClickUrlStatement,
  ): void {
    applyGraphClick(
      statement.ids.map((id) => this.nameOf(id)),
      statement.type === "FlowchartClickCallbackStatement"
        ? {
            kind: "callback",
            name: this.text.of(statement.callback.range),
            args: this.literalTextOf(statement.arguments),
          }
        : {
            kind: "url",
            url: trimmed(this.stringTextOf(statement.url)),
            target: statement.target,
          },
      statement.tooltip === null
        ? null
        : this.replace(this.stringTextOf(statement.tooltip)),
      this.vertices,
      this.edges,
      this.subgraphs,
      this.clickCalls,
      this.tooltips,
    )
  }
}

/**
 * docs/db-from-tree/flowchart.md: the summary of the Db that the
 * flowchart `diagram` denotes. The title, the configuration, and the effects
 * of the data blocks come from mermaid.js through `embedded`: the tree does
 * not read embedded data.
 */
export function flowchartDbOf(
  text: string,
  root: TreeRoot,
  diagram: FlowchartDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new FlowchartDbBuilder(text, root, diagram, embedded).summaryOf(
    diagram,
    embedded.title ?? "",
  )
}

export { exceedsMaxEdges, flowchartEdgeCount } from "./graph-edges.ts"
