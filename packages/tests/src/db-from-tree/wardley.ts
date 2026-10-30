import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import { commonValue, decodedString } from "./statement-values.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeNode, TreeRoot } from "./tree.ts"
import { descriptionOf } from "./values.ts"
import type { WardleyDiagram, WardleyLabelOffset } from "./wardley-tree.ts"

/** Published nodes keep numeric coordinates until inherited visibility has been read. */
interface NodeData {
  readonly id: string
  readonly label: string
  readonly x: number
  readonly y: number
  readonly className: string
  readonly labelOffsetX?: number | undefined
  readonly labelOffsetY?: number | undefined
  readonly inertia?: boolean | undefined
  readonly sourceStrategy?: string | undefined
}

/** docs/db-from-tree/wardley.md: publish accepted authored occurrences in registration order. */
export function wardleyDbOf(
  source: string,
  root: TreeRoot,
  diagram: WardleyDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const text = new ConvertedText(readConvertedCharacters(source, root))
  const replace = textReplacementOf(embedded.config)
  const nodes = new Map<string, NodeData>()
  const pipelines = new Map<string, JsonObject>()
  const trends = new Map<string, JsonObject>()
  const links: JsonObject[] = []
  const notes: JsonObject[] = []
  const annotations: JsonObject[] = []
  const accelerators: JsonObject[] = []
  const deaccelerators: JsonObject[] = []
  let title = ""
  let accTitle = ""
  let accDescr = ""
  let axes: JsonObject = {}
  let size: JsonObject | undefined, annotationsBox: JsonObject | undefined

  /** Names and string texts use comparison conversion without common sanitization. */
  function nameOf(node: TreeNode): string {
    const value = text.of(node.range)
    return node.type === "StringLiteral"
      ? decodedString(value.slice(1, -1))
      : value
  }

  /** Compare the double, then scale; acceptance was already checked by the parser. */
  function percent(node: TreeNode): number {
    const value = Number(text.of(node.range))
    return value <= 1 ? value * 100 : value
  }

  /** All coordinate pairs use the authored first value as visibility. */
  function coordinates(node: {
    readonly visibility: TreeNode
    readonly evolution: TreeNode
  }) {
    return { x: percent(node.evolution), y: percent(node.visibility) }
  }

  /** Serialize each published coordinate with the shared numeric convention. */
  function publishedCoordinates(node: {
    readonly visibility: TreeNode
    readonly evolution: TreeNode
  }): JsonObject {
    const pair = coordinates(node)
    return { x: numberOrText(pair.x), y: numberOrText(pair.y) }
  }

  /** Apply the written sign before the shared number serialization. */
  function offsets(node: WardleyLabelOffset | null) {
    return {
      labelOffsetX:
        node === null
          ? undefined
          : (node.negativeX ? -1 : 1) * Number(text.of(node.offsetX.range)),
      labelOffsetY:
        node === null
          ? undefined
          : (node.negativeY ? -1 : 1) * Number(text.of(node.offsetY.range)),
    }
  }

  /** Replacement keeps the first slot and only inherits omitted label offsets. */
  function register(node: NodeData): void {
    const previous = nodes.get(node.id)
    nodes.set(node.id, {
      ...node,
      labelOffsetX: node.labelOffsetX ?? previous?.labelOffsetX,
      labelOffsetY: node.labelOffsetY ?? previous?.labelOffsetY,
    })
  }

  for (const kind of ["WardleyAnchorStatement", "WardleyComponentStatement"]) {
    for (const statement of diagram.body) {
      if (statement.type !== kind) continue
      if (
        statement.type !== "WardleyAnchorStatement" &&
        statement.type !== "WardleyComponentStatement"
      )
        continue
      const name = nameOf(statement.name)
      let offset: WardleyLabelOffset | null = null
      let sourceStrategy: string | undefined, inertia: boolean | undefined
      if (statement.type === "WardleyComponentStatement") {
        inertia = false
        for (const decoration of statement.decorations) {
          if (decoration.type === "WardleyLabelOffsetDecoration")
            offset = decoration
          else if (decoration.type === "WardleySourceStrategyDecoration")
            sourceStrategy = decoration.value
          else inertia = true
        }
      }
      register({
        id: name,
        label: name,
        ...coordinates(statement.coordinates),
        className:
          statement.type === "WardleyAnchorStatement" ? "anchor" : "component",
        ...offsets(offset),
        inertia,
        sourceStrategy,
      })
    }
  }
  for (const statement of diagram.body) {
    if (statement.type !== "WardleyPipelineStatement") continue
    const parent = nameOf(statement.parent)
    const parentY = nodes.get(parent)!.y
    const componentIds: string[] = []
    pipelines.set(parent, { nodeId: parent, componentIds })
    for (const child of statement.body) {
      if (child.type === "WardleyIgnoredText") continue
      const name = nameOf(child.name)
      const id = `${parent}_${name}`
      register({
        id,
        label: name,
        x: percent(child.evolution),
        y: parentY,
        className: "pipeline-component",
        ...offsets(child.labelOffset),
      })
      componentIds.push(id)
    }
  }

  /** Links alone have a label fallback; missing names remain unresolved text. */
  function resolve(name: string): string {
    if (nodes.has(name)) return name
    for (const node of nodes.values()) if (node.label === name) return node.id
    return name
  }

  for (const statement of diagram.body) {
    switch (statement.type) {
      case "WardleyTitleStatement":
      case "WardleyAccTitleStatement":
      case "WardleyAccDescrStatement":
      case "WardleyAccDescrBlockStatement": {
        const value = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          statement.type === "WardleyAccDescrBlockStatement",
        )
        if (statement.type === "WardleyTitleStatement") title = value
        else if (statement.type === "WardleyAccTitleStatement") accTitle = value
        else accDescr = value
        break
      }
      case "WardleyLinkStatement": {
        const arrow =
          statement.arrow === null ? "" : text.of(statement.arrow.range)
        let arrowFlow: string | undefined, flowLabel: string | undefined
        if (arrow.startsWith("+")) {
          if (arrow.startsWith("+'"))
            flowLabel = arrow.slice(2, arrow.indexOf("'", 2))
          arrowFlow = arrow.includes("<>")
            ? "bidirectional"
            : arrow.includes("<")
              ? "backward"
              : arrow.includes(">")
                ? "forward"
                : undefined
        }
        const value: Record<string, JsonValue> = {
          source: resolve(nameOf(statement.from)),
          target: resolve(nameOf(statement.to)),
          dashed: arrow.includes("-.->") || arrow.includes(".-."),
        }
        const flow = statement.fromPort ?? statement.toPort ?? arrowFlow
        const label =
          flowLabel ??
          (statement.label === null
            ? undefined
            : text.of(statement.label.range).trim())
        if (flow !== undefined) value.flow = flow
        if (label !== undefined) value.label = label
        links.push(value)
        break
      }
      case "WardleyEvolveStatement": {
        const id = nameOf(statement.component)
        if (nodes.has(id))
          trends.set(id, {
            nodeId: id,
            targetX: numberOrText(percent(statement.target)),
          })
        break
      }
      case "WardleyNoteStatement":
        notes.push({
          text: nameOf(statement.text),
          ...publishedCoordinates(statement.coordinates),
        })
        break
      case "WardleyAnnotationStatement":
        annotations.push({
          number: numberOrText(Number(text.of(statement.number.range))),
          coordinates: [publishedCoordinates(statement.coordinates)],
          text: nameOf(statement.text),
        })
        break
      case "WardleyAnnotationsStatement":
        annotationsBox ??= publishedCoordinates(statement.coordinates)
        break
      case "WardleyAcceleratorStatement":
      case "WardleyDeacceleratorStatement":
        ;(statement.type === "WardleyAcceleratorStatement"
          ? accelerators
          : deaccelerators
        ).push({
          name: nameOf(statement.name),
          ...publishedCoordinates(statement.coordinates),
        })
        break
      case "WardleyEvolutionStatement":
        axes = {
          stages: statement.stages.map((stage) => {
            const first = nameOf(stage.name).trim()
            const second =
              stage.secondName === null ? "" : nameOf(stage.secondName)
            return second ? `${first} / ${second.trim()}` : first
          }),
          stageBoundaries: statement.stages.flatMap((stage) =>
            stage.boundary === null
              ? []
              : [numberOrText(Number(text.of(stage.boundary.range)))],
          ),
        }
        break
      case "WardleySizeStatement":
        size = {
          width: numberOrText(Number(text.of(statement.width.range))),
          height: numberOrText(Number(text.of(statement.height.range))),
        }
        break
      case "WardleyIgnoredText":
      case "WardleyAnchorStatement":
      case "WardleyComponentStatement":
      case "WardleyPipelineStatement":
        break
      default:
        throw new Error(
          `wardley Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  return {
    title: replace(title || embedded.title || ""),
    accTitle: replace(accTitle),
    accDescr: replace(descriptionOf(accDescr)),
    nodes: [...nodes.values()].map((node) => {
      const value: Record<string, JsonValue> = {
        id: node.id,
        label: node.label,
        x: numberOrText(node.x),
        y: numberOrText(node.y),
        className: node.className,
      }
      if (node.labelOffsetX !== undefined)
        value.labelOffsetX = numberOrText(node.labelOffsetX)
      if (node.labelOffsetY !== undefined)
        value.labelOffsetY = numberOrText(node.labelOffsetY)
      if (node.inertia !== undefined) value.inertia = node.inertia
      if (node.sourceStrategy !== undefined)
        value.sourceStrategy = node.sourceStrategy
      return value
    }),
    links,
    trends: [...trends.values()],
    pipelines: [...pipelines.values()],
    annotations,
    notes,
    accelerators,
    deaccelerators,
    ...(annotationsBox === undefined ? {} : { annotationsBox }),
    axes,
    ...(size === undefined ? {} : { size }),
  }
}
