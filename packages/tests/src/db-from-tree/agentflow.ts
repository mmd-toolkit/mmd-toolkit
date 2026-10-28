import { appendItems } from "../collections.ts"
import {
  classDefStyleOf,
  dbTypeOf,
  diagramDirectionOf,
  styleValues,
} from "./graph-values.ts"
import type { DataBlockEffect, EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import type { ConvertedCharacter } from "./converted-text.ts"
import { ConvertedText, readAgentflowCharacters } from "./converted-text.ts"
import type {
  AgentflowArrow,
  AgentflowClassDefStatement,
  AgentflowClickCallbackStatement,
  AgentflowClickUrlStatement,
  AgentflowDataBlock,
  AgentflowDefaultLinkStyleStatement,
  AgentflowDiagram,
  AgentflowLabel,
  AgentflowLink,
  AgentflowLinkStyleStatement,
  AgentflowLiteral,
  AgentflowShape,
  AgentflowStatement,
  AgentflowStyleStatement,
  AgentflowFlowStatement,
  AgentflowConnectorStatement,
  AgentflowName,
  AgentflowVertex,
  AgentflowVertexGroup,
  AgentflowVertexStatement,
} from "./agentflow-tree.ts"
import {
  applyGraphClass,
  applyGraphClick,
  applyGraphLinkStyle,
  lastGraphWithId,
  StringDelimiters,
} from "./graph.ts"
import type { Identifier, StringLiteral, TreeRoot } from "./tree.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import {
  descriptionOf,
  setOwnProperty,
  trimmed,
  withoutEnclosingQuotes,
} from "./values.ts"

// docs/db-from-tree/agentflow.md: the summary of the Db that an
// Agentflow tree denotes, in the form of `normalizeAgentflow()` of
// `@mmd-toolkit/tests`. Every step below is a paragraph of "Building the
// summary from the tree", and its comment names it. Each step reads the
// values of the tree in converted form (see `converted-text.ts`), with
// only the immediately following line whitespace and LF after `}` folded.

/** Whether `text` is empty or all whitespace. */
function isBlank(text: string): boolean {
  return trimmed(text) === ""
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
  type: string
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

/** The three Agentflow arrow kinds, preserving the raw endpoints and length cap. */
function closingArrowValues(arrow: AgentflowArrow): ArrowValues {
  return {
    type:
      arrow.endMarker === "arrow"
        ? "arrow_point"
        : arrow.endMarker === "cross"
          ? "arrow_cross"
          : "arrow_open",
    stroke: arrow.line === "dotted" ? "dotted" : "normal",
    length: Math.min(
      10,
      arrow.line === "dotted" ? arrow.length : arrow.length - 1,
    ),
  }
}

/** The statements whose `styles` hold styles. */
type StatementWithStyles =
  | AgentflowStyleStatement
  | AgentflowClassDefStatement
  | AgentflowLinkStyleStatement
  | AgentflowDefaultLinkStyleStatement

/** The summary of an Agentflow while it is built. */
class AgentflowDbBuilder {
  private readonly vertices = new Map<string, Vertex>()

  private readonly edges: Edge[] = []

  private readonly classDefs = new Map<string, ClassDef>()

  private readonly subgraphs: Subgraph[] = []

  private readonly globalIds = new Set<string>()

  private readonly connectorIds = new Set<string>()

  private flowCount = 0

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
    diagram: AgentflowDiagram,
    embedded: EmbeddedValues,
  ) {
    this.characters = readAgentflowCharacters(source, root)
    this.text = new ConvertedText(this.characters)
    this.strings = new StringDelimiters(root, this.characters)
    this.replace = textReplacementOf(embedded.config)
    this.direction = diagramDirectionOf(diagram.direction)
    // docs/db-from-tree/agentflow.md, Names and flows: a flow inherits the direction of the
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
  public summaryOf(diagram: AgentflowDiagram, title: string): DbSummary {
    for (const statement of diagram.body) this.applyStatement(statement)
    if (this.dataBlockEffects.length > 0) {
      throw new Error(
        `agentflow Db: mermaid.js applied ${this.dataBlockEffects.length} more data blocks than the tree has`,
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
  private applyStatement(statement: AgentflowStatement): string[] {
    switch (statement.type) {
      case "AgentflowVertexStatement":
        return this.applyVertexStatement(statement)
      case "AgentflowFlowStatement":
        return [this.applyFlow(statement)]
      case "AgentflowConnectorStatement":
        return [this.applyConnector(statement)]
      case "AgentflowGlobalStatement": {
        const members = statement.body.flatMap((inner) =>
          this.applyStatement(inner),
        )
        for (const member of members)
          if (!isBlank(member)) this.globalIds.add(member)
        for (const flow of this.subgraphs)
          flow.nodes = flow.nodes.filter((id) => !this.globalIds.has(id))
        return []
      }
      case "AgentflowStyleStatement":
        this.vertexStep(
          this.nameOf(statement.id),
          null,
          null,
          this.stylesOf(statement),
          null,
        )
        return []
      case "AgentflowClassDefStatement": {
        const styles = this.stylesOf(statement).map(classDefStyleOf)
        for (const cssClass of statement.cssClasses) {
          const name = this.nameOf(cssClass)
          const classDef = this.classDefs.get(name) ?? { id: name, styles: [] }
          this.classDefs.set(name, classDef)
          appendItems(classDef.styles, styles)
        }
        return []
      }
      case "AgentflowClassStatement":
        this.classStep(
          statement.ids.map((id) => this.nameOf(id)),
          this.nameOf(statement.cssClass),
        )
        return []
      case "AgentflowClickCallbackStatement":
      case "AgentflowClickUrlStatement":
        this.applyClickStatement(statement)
        return []
      case "AgentflowLinkStyleStatement":
        this.applyLinkStyleStatement(statement)
        return []
      case "AgentflowDefaultLinkStyleStatement":
        if (statement.interpolate !== null) {
          this.defaultInterpolate = this.nameOf(statement.interpolate)
        }
        if (statement.styles.length > 0) {
          this.defaultStyle = this.stylesOf(statement)
        }
        return []
      case "AgentflowAccTitleStatement": {
        const value = this.literalTextOf(statement.value)
        this.accTitle = this.replace(value ?? "")
        return value === null ? [] : [value]
      }
      case "AgentflowAccDescrStatement": {
        const value = this.literalTextOf(statement.value)
        this.accDescr = value === null ? "" : this.replace(descriptionOf(value))
        return value === null ? [] : [value]
      }
      case "AgentflowAccDescrBlockStatement": {
        // A block that is not closed sets the empty description, whatever
        // its text; a closed block without text changes nothing.
        const value = this.literalTextOf(statement.value)
        if (!statement.closed) this.accDescr = ""
        else if (value !== null)
          this.accDescr = this.replace(descriptionOf(value))
        return value === null ? [] : [value]
      }
      case "AgentflowEmptyStatement":
        return [";"]
      case "AgentflowDirectionStatement":
        return []
      default:
        throw new Error(
          `agentflow Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /**
   * Style statements: a link style statement sets the interpolate and the
   * styles of the edges it numbers. Styles that none starts with `fill` get
   * `fill:none` after them.
   */
  private applyLinkStyleStatement(
    statement: AgentflowLinkStyleStatement,
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
    label: AgentflowLabel | null,
    shapeType: string | null,
    styles: readonly string[] | null,
    property: { readonly name: string; readonly value: string } | null,
  ): void {
    if (id === "connectors" || this.edges.some((edge) => edge.id === id)) return
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
    if (styles !== null) appendItems(vertex.styles, styles)
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
  private literalTextOf(literal: AgentflowLiteral | null): string | null {
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
  private labelTextOf(label: AgentflowLabel): string {
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

  /** Names concatenate contributing fragments only, without restoring click-context exit whitespace. */
  private flowNameOf(name: AgentflowName): string {
    return name.parts
      .map((part) =>
        part.type === "AgentflowLabel" ? this.labelTextOf(part) : "",
      )
      .join("")
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
    blocks: readonly AgentflowDataBlock[],
  ): void {
    if (blocks.length === 0) return
    const effect = this.dataBlockEffects.shift()
    if (effect === undefined) {
      throw new Error(
        `agentflow Db: mermaid.js applied no data block for the one at ${blocks[0].range[0]}`,
      )
    }
    if (effect.id !== id) {
      throw new Error(
        `agentflow Db: mermaid.js applied a data block of ${JSON.stringify(effect.id)} for the one of ${JSON.stringify(id)}`,
      )
    }
    const element =
      this.lastSubgraphWithId(id) ??
      (this.connectorIds.has(id) ? this.vertices.get(id) : undefined) ??
      this.edges.find((edge) => edge.id === id) ??
      this.vertices.get(id)
    if (element === undefined) {
      if (
        (id === "connectors" || id === "") &&
        Object.keys(effect.set).length === 0
      )
        return
      throw new Error(
        `agentflow Db: no element with the id ${JSON.stringify(id)}`,
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
  private applyVertexStatement(statement: AgentflowVertexStatement): string[] {
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
  private applyVertexGroup(group: AgentflowVertexGroup): void {
    let previous: AgentflowVertex | null = null
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
  private applyVertex(vertex: AgentflowVertex): void {
    const shape: AgentflowShape | null = vertex.shape
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
  private addEdges(source: AgentflowVertexGroup, link: AgentflowLink): void {
    const arrow = closingArrowValues(link.arrow)
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
    link: AgentflowLink,
    start: string,
    end: string,
    lastOfSource: string,
    firstOfTarget: string,
  ): { id: string } {
    if (link.id !== null && start === lastOfSource && end === firstOfTarget) {
      const written = this.nameOf(link.id)
      const at = written.indexOf("@")
      const id =
        at === -1 ? written : `${written.slice(0, at)}${written.slice(at + 1)}@`
      if (!this.edges.some((edge) => edge.id === id)) {
        return { id }
      }
    }
    const earlier = this.edges.filter(
      (edge) => edge.start === start && edge.end === end,
    ).length
    return {
      id: `L_${start}_${end}_${earlier === 0 ? 0 : earlier + 1}`,
    }
  }

  /** Flows complete after their bodies; repeated ids merge in their original map position. */
  private applyFlow(statement: AgentflowFlowStatement): string {
    const members = statement.body.flatMap((inner) =>
      this.applyStatement(inner),
    )
    const id =
      statement.name === null
        ? `subGraph${this.flowCount}`
        : trimmed(this.flowNameOf(statement.name))
    this.flowCount++
    const nodes: string[] = []
    for (const member of members) {
      if (isBlank(member) || member === id || this.globalIds.has(member))
        continue
      if (member !== "__proto__" && nodes.includes(member)) continue
      if (this.subgraphs.some((flow) => flow.nodes.includes(member))) continue
      nodes.push(member)
    }
    const title =
      statement.title === null
        ? ""
        : trimmed(this.replace(this.labelTextOf(statement.title)))
    let flow = this.lastSubgraphWithId(id)
    if (flow === undefined) {
      flow = {
        id,
        nodes,
        title,
        classes: [],
        labelType:
          statement.title?.kind ??
          (statement.name === null ? "markdown" : "text"),
        type: "flow",
      }
      this.subgraphs.push(flow)
    } else {
      appendItems(flow.nodes, nodes)
      if (title !== "") flow.title = title
    }
    const lastDirection = statement.body
      .filter((inner) => inner.type === "AgentflowDirectionStatement")
      .at(-1)
    if (lastDirection !== undefined) flow.dir = lastDirection.direction
    else if (this.inheritDir) flow.dir = this.direction
    this.applyDataBlocks(id, statement.data)
    return id
  }

  /** Connector declarations replace an ordinary vertex, and update an existing connector in place. */
  private applyConnector(statement: AgentflowConnectorStatement): string {
    const id = trimmed(this.flowNameOf(statement.name))
    if (id === "") {
      this.applyDataBlocks(id, statement.data)
      return ""
    }
    const previous = this.connectorIds.has(id)
      ? this.vertices.get(id)
      : undefined
    const title =
      statement.title === null
        ? ""
        : trimmed(this.replace(this.labelTextOf(statement.title)))
    this.vertices.set(id, {
      ...(previous ?? {
        id,
        labelType: "text",
        styles: [],
        classes: [],
        text: id,
      }),
      isConnector: true,
      ...(title === "" ? {} : { text: title }),
    })
    this.connectorIds.add(id)
    this.applyDataBlocks(id, statement.data)
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
    statement: AgentflowClickCallbackStatement | AgentflowClickUrlStatement,
  ): void {
    applyGraphClick(
      statement.ids.map((id) => this.nameOf(id)),
      statement.type === "AgentflowClickCallbackStatement"
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
 * docs/db-from-tree/agentflow.md: the summary of the Db that the
 * agentflow `diagram` denotes. The title, the configuration, and the effects
 * of the data blocks come from mermaid.js through `embedded`: the tree does
 * not read embedded data.
 */
export function agentflowDbOf(
  text: string,
  root: TreeRoot,
  diagram: AgentflowDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new AgentflowDbBuilder(text, root, diagram, embedded).summaryOf(
    diagram,
    embedded.title ?? "",
  )
}
