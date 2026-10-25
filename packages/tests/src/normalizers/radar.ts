import type { DbSummary } from "../types.ts"
import { toJsonObject } from "./json.ts"

/** Published values consumed by radar drawing, before deriving coordinates. */
interface RadarDbLike {
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  getAxes(): readonly { readonly label: string }[]
  getCurves(): readonly {
    readonly label: string
    readonly entries: readonly number[]
  }[]
  getOptions(): {
    readonly showLegend: boolean
    readonly ticks: number
    readonly max: number | null
    readonly min: number
    readonly graticule: string
  }
}

/** Keeps published labels, values and options without reference or drawing state. */
export function normalizeRadar(value: unknown): DbSummary {
  const db = value as RadarDbLike
  const options = db.getOptions()
  return toJsonObject({
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    axes: db.getAxes().map(({ label }) => ({ label })),
    curves: db.getCurves().map(({ label, entries }) => ({
      label,
      entries: [...entries],
    })),
    options: {
      showLegend: options.showLegend,
      ticks: options.ticks,
      max: options.max,
      min: options.min,
      graticule: options.graticule,
    },
  })
}
