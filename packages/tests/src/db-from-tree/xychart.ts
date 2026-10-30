import { minOf, maxOf } from "../collections.ts"
import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { NumericLiteral, TreeRoot } from "./tree.ts"
import { descriptionOf, trimmed } from "./values.ts"
import type {
  XychartBand,
  XychartDiagram,
  XychartLiteral,
  XychartPlotStatement,
  XychartRange,
  XychartStatement,
  XychartText,
  XychartXAxisStatement,
  XychartYAxisStatement,
} from "./xychart-tree.ts"

// docs/db-from-tree/xychart.md: the summary of the Db that an xychart tree
// denotes, in the form of `normalizeXyChart()` of `@mmd-toolkit/tests`. The
// statements are executed in source order, as mermaid.js executes them while it
// parses; each step names the paragraph of "Building the summary from the
// tree" that defines it. Every value is read in converted form (see
// `converted-text.ts`).

/** The orientation of a diagram that the configuration gives none. */
const VERTICAL = "vertical"

/** The only orientation word that the Db reads as `horizontal`. */
const HORIZONTAL = "horizontal"

/** The axis of categories. */
interface BandAxis {
  readonly kind: "band"
  title: string
  readonly categories: string[]
}

/** The axis of a range of numbers. */
interface LinearAxis {
  readonly kind: "linear"
  title: string
  min: number
  max: number
}

/** An axis of the Db. */
type Axis = BandAxis | LinearAxis

/** A plot of the Db: the pairs the Db made where the plot was added. */
interface Plot {
  readonly type: "line" | "bar"
  readonly title: string
  readonly data: readonly (readonly [string, number | undefined])[]
  readonly pointLabels: readonly string[] | undefined
}

/** The builder of the summary: the statements are executed in source order. */
class XychartDbBuilder {
  private orientation: string

  private title: string

  private accTitle = ""

  private accDescr = ""

  private xAxis: Axis = { kind: "band", title: "", categories: [] }

  private readonly yAxis: LinearAxis = {
    kind: "linear",
    title: "",
    min: Infinity,
    max: -Infinity,
  }

  /** Whether a range or categories were given for the x axis (a plot does so when it finds none). */
  private xAxisSet = false

  /** Whether a range was given for the y axis (the plots widen it until then). */
  private yAxisSet = false

  private readonly plots: Plot[] = []

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The replacement of characters that the configuration gives the texts that the Db keeps. */
  private readonly replace: TextReplacement

  private readonly tokens: TreeRoot["tokens"]

  public constructor(source: string, root: TreeRoot, embedded: EmbeddedValues) {
    this.text = new ConvertedText(readConvertedCharacters(source, root))
    this.tokens = root.tokens
    this.replace = textReplacementOf(embedded.config)
    this.title = this.replace(embedded.title ?? "")
    this.orientation = orientationOf(embedded.config.xyChart)
  }

  /** The summary of `diagram`. */
  public summaryOf(diagram: XychartDiagram): DbSummary {
    for (const header of diagram.headers) this.executeHeader(header.orientation)
    for (const statement of diagram.body) this.execute(statement)
    return {
      orientation: this.orientation,
      title: this.title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      xAxis: axisSummary(this.xAxis),
      yAxis: axisSummary(this.yAxis),
      plots: this.plots.map(plotSummary),
    }
  }

  /** Headers: an orientation sets the orientation, and a header without one leaves it. */
  private executeHeader(orientation: string | null): void {
    if (orientation === null) return
    this.orientation = orientation === HORIZONTAL ? HORIZONTAL : VERTICAL
  }

  /** Executing: what one statement changes. */
  private execute(statement: XychartStatement): void {
    switch (statement.type) {
      case "XychartTitleStatement":
        this.title = this.textOf(statement.value)
        break
      case "XychartXAxisStatement":
        this.executeXAxis(statement)
        break
      case "XychartYAxisStatement":
        this.executeYAxis(statement)
        break
      case "XychartPlotStatement":
        this.executePlot(statement)
        break
      case "XychartAccTitleStatement":
        // A statement without text, at the end of the text, sets the empty text.
        this.accTitle = this.replace(
          trimmed(this.accessibilityTextOf(statement.value)),
        )
        break
      case "XychartAccDescrStatement":
        this.accDescr = this.replace(
          descriptionOf(this.accessibilityTextOf(statement.value)),
        )
        break
      case "XychartAccDescrBlockStatement":
        if (!statement.closed) {
          // A block that is not closed runs to the end of the text, where the
          // lexer returns one more text, empty, which is the last description.
          this.accDescr = ""
          break
        }
        // A closed block without text changes nothing.
        if (statement.value === null) break
        this.accDescr = this.replace(
          descriptionOf(this.accessibilityTextOf(statement.value)),
        )
        break
      default:
        throw new Error(
          `xychart Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /** X axes: the categories or the range replace the axis and keep its title, which the statement then sets (the empty text when it has none). */
  private executeXAxis(statement: XychartXAxisStatement): void {
    const { data } = statement
    if (data !== null) {
      if (data.type === "XychartBand") this.setBand(data)
      else this.setXRange(...this.rangeOf(data))
    }
    this.xAxis.title =
      statement.title === null ? "" : this.textOf(statement.title)
  }

  /** Y axes: as for x axes, with a range only. */
  private executeYAxis(statement: XychartYAxisStatement): void {
    if (statement.data !== null) {
      const [min, max] = this.rangeOf(statement.data)
      this.yAxis.min = min
      this.yAxis.max = max
      this.yAxisSet = true
    }
    this.yAxis.title =
      statement.title === null ? "" : this.textOf(statement.title)
  }

  /** The axis of categories, with the title it had. */
  private setBand(band: XychartBand): void {
    this.xAxis = {
      kind: "band",
      title: this.xAxis.title,
      categories: band.categories.map((category) => this.textOf(category)),
    }
    this.xAxisSet = true
  }

  /** The axis of a range, with the title it had; the plots do not give the x axis a range after it. */
  private setXRange(min: number, max: number): void {
    this.xAxis = { kind: "linear", title: this.xAxis.title, min, max }
    this.xAxisSet = true
  }

  /** Plots: adds the plot, whose pairs are made from the axes as they are now. */
  private executePlot(statement: XychartPlotStatement): void {
    const values = statement.values.map((value) => this.numberOf(value.value))
    const labels = statement.values.map((value) =>
      value.label === null ? "" : this.textOf(value.label),
    )
    // Only a line keeps its labels, and only when one is not empty.
    const hasLabel = statement.kind === "line" && labels.some((l) => l !== "")
    this.plots.push({
      type: statement.kind === "line" ? "line" : "bar",
      title: statement.title === null ? "" : this.textOf(statement.title),
      data: this.pairsOf(values),
      pointLabels: hasLabel ? labels : undefined,
    })
  }

  /**
   * Pairs: the pairs of the values of a plot. A plot that finds the x axis
   * without categories or range gives it the range 1 to its number of values,
   * a band axis has the values beyond its categories cut off, and the range of
   * the y axis is widened to include the values that are left until a range was
   * given.
   */
  private pairsOf(
    values: readonly number[],
  ): (readonly [string, number | undefined])[] {
    // The x axis that has neither is the one it starts as, a band without
    // categories, so the range is 1 to the number of the values.
    if (!this.xAxisSet) this.setXRange(1, values.length)
    const axis = this.xAxis
    const kept =
      axis.kind === "band" && values.length > axis.categories.length
        ? values.slice(0, axis.categories.length)
        : values
    if (!this.yAxisSet) {
      this.yAxis.min = Math.min(this.yAxis.min, minOf(kept))
      this.yAxis.max = Math.max(this.yAxis.max, maxOf(kept))
    }
    if (axis.kind === "band") {
      return axis.categories.map((category, index) => [category, kept[index]])
    }
    if (kept.length === 1) return [[`${axis.min}`, kept[0]]]
    const step = (axis.max - axis.min) / (kept.length - 1)
    return kept.map((value, index) => [`${axis.min + index * step}`, value])
  }

  /** The numbers of a range, in the order they are written. */
  private rangeOf(range: XychartRange): [number, number] {
    return [this.numberOf(range.start), this.numberOf(range.end)]
  }

  /** The number that the converted form of a numeric literal writes. */
  private numberOf(literal: NumericLiteral): number {
    return Number(this.text.of(literal.range))
  }

  /**
   * Texts: the text that a title, a category, or a label gives: without the
   * whitespace at its ends, then with the replacement of characters. A text
   * without quotes is the converted forms of its tokens, joined; a string is
   * the converted form of what lies between its quotes.
   */
  private textOf(text: XychartText): string {
    return this.replace(trimmed(this.writtenTextOf(text)))
  }

  private writtenTextOf(text: XychartText): string {
    if (text.type === "XychartLiteral") {
      return this.text.ofTokensIn(text.range, this.tokens)
    }
    const [start, end] = text.range
    return this.text.of([start + 1, text.closed ? end - 1 : end])
  }

  /** The text of an accessibility statement: the converted form of its range, with the whitespace between its characters; the empty text when there is none. */
  private accessibilityTextOf(literal: XychartLiteral | null): string {
    return literal === null ? "" : this.text.of(literal.range)
  }
}

/** The orientation that the configuration `xyChart` gives (`vertical` unless it gives a text). */
function orientationOf(xyChart: unknown): string {
  const orientation =
    typeof xyChart === "object" && xyChart !== null
      ? (xyChart as Record<string, unknown>).chartOrientation
      : undefined
  return typeof orientation === "string" ? orientation : VERTICAL
}

/** The summary of an axis. */
function axisSummary(axis: Axis): JsonObject {
  if (axis.kind === "band") {
    return { type: "band", title: axis.title, categories: axis.categories }
  }
  return {
    type: "linear",
    title: axis.title,
    min: numberOrText(axis.min),
    max: numberOrText(axis.max),
  }
}

/** The summary of a plot. */
function plotSummary(plot: Plot): JsonObject {
  const data: JsonValue[] = plot.data.map(([x, y]) => [
    x,
    y === undefined ? null : numberOrText(y),
  ])
  return plot.pointLabels === undefined
    ? { type: plot.type, title: plot.title, data }
    : {
        type: plot.type,
        title: plot.title,
        data,
        pointLabels: [...plot.pointLabels],
      }
}

/**
 * docs/db-from-tree/xychart.md: the summary of the Db that the xychart tree
 * `diagram` of the source `source` denotes (see `dbFromTree()`).
 */
export function xychartDbOf(
  source: string,
  root: TreeRoot,
  diagram: XychartDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new XychartDbBuilder(source, root, embedded).summaryOf(diagram)
}
