import type { DbSummary } from "../types.ts"
import { toJsonObject } from "./json.ts"

/** Syntax-derived coordinates, before projection to the drawing. */
interface Coordinates {
  readonly x: number
  readonly y: number
}

/** The values published by the Wardley adapter and builder. */
interface WardleyDbLike {
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  getWardleyData(): {
    readonly nodes: readonly {
      readonly id: string
      readonly label: string
      readonly x?: number
      readonly y?: number
      readonly className?: string
      readonly labelOffsetX?: number
      readonly labelOffsetY?: number
      readonly inertia?: boolean
      readonly sourceStrategy?: string
    }[]
    readonly links: readonly {
      readonly source: string
      readonly target: string
      readonly dashed?: boolean
      readonly label?: string
      readonly flow?: string
    }[]
    readonly trends: readonly {
      readonly nodeId: string
      readonly targetX: number
    }[]
    readonly pipelines: readonly {
      readonly nodeId: string
      readonly componentIds: readonly string[]
    }[]
    readonly annotations: readonly {
      readonly number: number
      readonly coordinates: readonly Coordinates[]
      readonly text?: string
    }[]
    readonly notes: readonly (Coordinates & { readonly text: string })[]
    readonly accelerators: readonly (Coordinates & { readonly name: string })[]
    readonly deaccelerators: readonly (Coordinates & {
      readonly name: string
    })[]
    readonly annotationsBox?: Coordinates
    readonly axes: {
      readonly stages?: readonly string[]
      readonly stageBoundaries?: readonly number[]
    }
    readonly size?: { readonly width: number; readonly height: number }
  }
}

/** Keeps published values once, omitting drawing and redundant pipeline state. */
export function normalizeWardley(value: unknown): DbSummary {
  const db = value as WardleyDbLike
  const data = db.getWardleyData()
  return toJsonObject({
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    nodes: data.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      x: node.x,
      y: node.y,
      className: node.className,
      labelOffsetX: node.labelOffsetX,
      labelOffsetY: node.labelOffsetY,
      inertia: node.inertia,
      sourceStrategy: node.sourceStrategy,
    })),
    links: data.links.map(({ source, target, dashed, label, flow }) => ({
      source,
      target,
      dashed,
      label,
      flow,
    })),
    trends: data.trends.map(({ nodeId, targetX }) => ({ nodeId, targetX })),
    pipelines: data.pipelines.map(({ nodeId, componentIds }) => ({
      nodeId,
      componentIds: [...componentIds],
    })),
    annotations: data.annotations.map(({ number, coordinates, text }) => ({
      number,
      coordinates: coordinates.map(({ x, y }) => ({ x, y })),
      text,
    })),
    notes: data.notes.map(({ text, x, y }) => ({ text, x, y })),
    accelerators: data.accelerators.map(({ name, x, y }) => ({ name, x, y })),
    deaccelerators: data.deaccelerators.map(({ name, x, y }) => ({
      name,
      x,
      y,
    })),
    annotationsBox:
      data.annotationsBox === undefined
        ? undefined
        : { x: data.annotationsBox.x, y: data.annotationsBox.y },
    axes: {
      stages: data.axes.stages,
      stageBoundaries: data.axes.stageBoundaries,
    },
    size:
      data.size === undefined
        ? undefined
        : { width: data.size.width, height: data.size.height },
  })
}
