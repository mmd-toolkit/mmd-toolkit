import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { numberOrText } from "../summary-number.ts"
import { toJsonObject } from "./json.ts"

/**
 * The part of mermaid's xychart Db (`diagrams/xychart/xychartDb.ts`) that the
 * normalizer reads. The Db is one module that every xychart diagram shares;
 * `clear()` resets its state before each parse.
 */
interface XyChartDbLike {
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  getChartConfig(): { chartOrientation: string }
  getXYChartData(): {
    xAxis: AxisLike
    yAxis: AxisLike
    plots: PlotLike[]
  }
}

/** An axis of the Db: a band axis has categories, a linear axis a range. */
interface AxisLike {
  type: string
  title: string
  categories?: string[]
  min?: number
  max?: number
}

/** A plot of the Db, with the fields that only the renderer reads. */
interface PlotLike {
  type: string
  title: string
  data: [string, number | undefined][]
  pointLabels?: string[]
}

/**
 * Summarizes the xychart Db (`xychart`).
 *
 * Kept: the orientation (`vertical` or `horizontal`, from the header or else
 * from the setting `xyChart.chartOrientation`), the title and the
 * accessibility texts, the two axes, and the plots. An axis is
 * `{ type, title, ... }`: a `band` axis has `categories`, a `linear` axis `min`
 * and `max`, which are the numbers of the range of the text, or else computed
 * from the data of the plots as the Db computes them (for the y axis the range
 * of the values of the plots, without the values beyond the categories of a
 * band x axis; for the x axis, without a range or categories before the first
 * plot, 1 to the number of the values of that plot, which a later plot with
 * more values does not widen). A plot is `{ type, title, data }` with its
 * `pointLabels` where a label is written: `data` is the list of the pairs
 * `[x, y]` that the Db makes where the plot is added, the x of a pair being a
 * category or the text of a number computed from the range of the x axis at
 * that point of the text, and `y` being the number or `null` where a category
 * has no value. The numbers that are no finite number are the texts
 * `"Infinity"` and `"-Infinity"` (the range of the y axis with no plot and no
 * range written).
 *
 * Dropped:
 *
 * - `plots[].strokeFill`, `plots[].strokeWidth`, `plots[].fill`: the colours
 *   and the width that the renderer uses, taken from the theme by the number
 *   of the plot.
 * - `getChartThemeConfig()`: the colours of the theme.
 * - `getChartConfig()` but for `chartOrientation`: the settings of the
 *   renderer, of the site.
 * - `getXYChartData().title`: set only when the chart is drawn, so it is the
 *   empty text when the text is parsed; the title is `getDiagramTitle()`.
 *
 * The Db reads no browser feature, no time and no random value while it
 * parses, so the summary needs no patch of the Db.
 */
export function normalizeXyChart(dbValue: unknown): DbSummary {
  const db = dbValue as XyChartDbLike
  const data = db.getXYChartData()
  return {
    orientation: db.getChartConfig().chartOrientation,
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    xAxis: axisSummary(data.xAxis),
    yAxis: axisSummary(data.yAxis),
    plots: data.plots.map(plotSummary),
  }
}

/** The summary of an axis. */
function axisSummary(axis: AxisLike): JsonObject {
  if (axis.type === "band") {
    return toJsonObject({
      type: axis.type,
      title: axis.title,
      categories: axis.categories,
    })
  }
  return toJsonObject({
    type: axis.type,
    title: axis.title,
    min: numberOrText(axis.min ?? Number.NaN),
    max: numberOrText(axis.max ?? Number.NaN),
  })
}

/** The summary of a plot. */
function plotSummary(plot: PlotLike): JsonObject {
  const pairs: JsonValue[] = plot.data.map(([x, y]) => [
    x,
    y === undefined ? null : numberOrText(y),
  ])
  return toJsonObject({
    type: plot.type,
    title: plot.title,
    data: pairs,
    pointLabels: plot.pointLabels,
  })
}
