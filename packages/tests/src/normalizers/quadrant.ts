import { MermaidEnvironmentError } from "../mermaid-environment-error.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { numberOrText } from "../summary-number.ts"
import { toJsonObject } from "./json.ts"

/** The styles of a point or a class as `parseStyles()` makes them. */
type StylesObject = Readonly<Record<string, unknown>>

/**
 * The part of mermaid's quadrant chart Db (`diagrams/quadrant-chart/
 * quadrantDb.ts`) that the normalizer reads, and the methods the patch wraps.
 * The Db is one object that every quadrant chart shares; its state is in a
 * `QuadrantBuilder` that only its own methods reach, so the only getter of
 * what the text gave is `getQuadrantData()`, which lays the chart out.
 */
interface QuadrantDbLike {
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  getQuadrantData(): {
    quadrants: { text: { text: string } }[]
    axisLabels: { text: string; rotation: number; verticalPos: string }[]
    points: { text: { text: string } }[]
  }
  parseStyles(styles: string[]): StylesObject
  // The methods that the patch wraps are properties, so that the patch can
  // take them out of the Db and put its own in their place.
  addPoint: (
    text: { text: string },
    className: string,
    x: string,
    y: string,
    styles: string[],
  ) => unknown
  addClass: (className: string, styles: string[]) => unknown
  setXAxisLeftText: (text: { text: string }) => unknown
  setXAxisRightText: (text: { text: string }) => unknown
  setYAxisBottomText: (text: { text: string }) => unknown
  setYAxisTopText: (text: { text: string }) => unknown
  clear: (...args: unknown[]) => unknown
}

/** What a text gave to a point, as `addPoint()` received it. */
interface RecordedPoint {
  readonly className: string
  readonly x: string
  readonly y: string
  readonly styles: StylesObject
}

/** What the patch records while the text is parsed. */
interface Recording {
  /** The points, in the order of the text. */
  points: RecordedPoint[]
  /** The classes, in the order of their first definition, each with the styles of its last. */
  classes: Map<string, StylesObject>
  /** Whether the text last set for each text of an axis is not empty. */
  axisTexts: {
    xLeft: boolean
    xRight: boolean
    yBottom: boolean
    yTop: boolean
  }
}

/** The recording of the Db, which {@link patchQuadrantDb} starts over at each `clear()`. */
const recordings: WeakMap<object, Recording> = new WeakMap()

/** A recording of nothing. */
function emptyRecording(): Recording {
  return {
    points: [],
    classes: new Map(),
    axisTexts: { xLeft: false, xRight: false, yBottom: false, yTop: false },
  }
}

/**
 * Summarizes the quadrant chart Db (`quadrant`).
 *
 * Kept: the title and the accessibility texts; `quadrants`, the texts of
 * `quadrant-1` to `quadrant-4`; the texts of the axes, `xAxis` (`left`,
 * `right`) and `yAxis` (`bottom`, `top`), where `x-axis L -->` has the left
 * text `L ⟶`; the points, and the classes. All the texts are as the Db holds
 * them. A point is `{ text, className, x, y }` with the styles it has of
 * `radius` (a number), `color`, `strokeColor`, and `strokeWidth`; `className`
 * is the empty text where the point has no class, and `x` and `y` are the
 * texts of the numbers as the lexer reads them. The points are in the order
 * the Db holds them, which is the reverse of the order of the text, since
 * `addPoints()` puts the new points first. A class is `{ name, ...styles }`,
 * in the order of its first definition, with the styles of its last.
 *
 * Dropped:
 *
 * - The layout that `getQuadrantData()` makes (the coordinates and sizes in
 *   the units of the chart, the colours of the theme, the borders, the default
 *   radius and stroke width, the position of a text): they depend on the site
 *   settings (`quadrantChart`, the theme) and on nothing the text says. The
 *   styles of a point and of its class are kept as they were written, and not
 *   merged as the renderer merges them (`{ ...classStyles, ...point }`).
 *
 * The state of the Db is out of reach, so the patch ({@link patchQuadrantDb})
 * records what `addPoint()` and `addClass()` receive, and the summary takes the
 * texts as the Db holds them from `getQuadrantData()`. The labels of the axes
 * in it are only those that are not empty, and {@link textsOf} tells from the
 * layout which of the two a single label is. A setting of the site that hides
 * the labels of an axis (`quadrantChart.showXAxis` and `showYAxis`, which the
 * schema does not list) would drop a text that the Db holds, so the patch also
 * records which texts of the axes the text set, and the summary throws a
 * `MermaidEnvironmentError` where the layout lists others.
 */
export function normalizeQuadrant(dbValue: unknown): DbSummary {
  const db = dbValue as QuadrantDbLike
  const recording = recordings.get(db)
  if (recording === undefined) {
    throw new TypeError(
      "normalizeQuadrant: the Db was not patched by patchQuadrantDb",
    )
  }
  const built = db.getQuadrantData()
  const xLabels = built.axisLabels.filter((label) => label.rotation === 0)
  const yLabels = built.axisLabels.filter((label) => label.rotation !== 0)
  const [xLeftText, xRightText] = textsOf(xLabels)
  const [yBottomText, yTopText] = textsOf(yLabels)
  const { xLeft, xRight, yBottom, yTop } = recording.axisTexts
  const listed = [xLeftText, xRightText, yBottomText, yTopText].map(
    (text) => text !== "",
  )
  if (
    listed.some((is, index) => is !== [xLeft, xRight, yBottom, yTop][index])
  ) {
    throw new MermaidEnvironmentError(
      "the layout of the quadrant chart lists fewer labels of the axes than the text set: a setting such as quadrantChart.showXAxis or showYAxis that is false hides them, and the summary reads the texts of the axes from the labels",
    )
  }
  // `addPoints()` puts the new points first.
  const recorded = [...recording.points].reverse()
  if (recorded.length !== built.points.length) {
    throw new TypeError(
      `normalizeQuadrant: ${String(recorded.length)} points were recorded and the Db holds ${String(built.points.length)}`,
    )
  }
  return {
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    quadrants: built.quadrants.map((quadrant) => quadrant.text.text),
    xAxis: { left: xLeftText, right: xRightText },
    yAxis: { bottom: yBottomText, top: yTopText },
    points: recorded.map((point, index) =>
      pointSummary(point, built.points[index]?.text.text ?? ""),
    ),
    classes: [...recording.classes].map(([name, styles]) =>
      toJsonObject({ name, ...stylesSummary(styles) }),
    ),
  }
}

/**
 * The texts of the two labels of an axis, in the order left or bottom, then
 * right or top. `getQuadrantData()` lists only the labels of the texts that are
 * not empty, so a single label is the first text when the layout puts it at
 * `left`, which it does when the second text is empty, and the second text when
 * it puts it at `center`, which it does when the second text is not empty.
 */
function textsOf(
  labels: readonly { text: string; verticalPos: string }[],
): [string, string] {
  const [first, second] = labels
  if (first === undefined) return ["", ""]
  if (second !== undefined) return [first.text, second.text]
  return first.verticalPos === "left" ? [first.text, ""] : ["", first.text]
}

/** The summary of a point. */
function pointSummary(point: RecordedPoint, text: string): JsonObject {
  return toJsonObject({
    text,
    className: point.className,
    x: point.x,
    y: point.y,
    ...stylesSummary(point.styles),
  })
}

/** The styles as written in a summary: a radius that is no finite number (the digits of one are too many for a double) is the text of the number, since JSON has no such number. */
function stylesSummary(styles: StylesObject): StylesObject {
  return Object.fromEntries(
    Object.entries(styles).map(([key, value]) => [
      key,
      typeof value === "number" ? numberOrText(value) : value,
    ]),
  )
}

/**
 * Patches the quadrant chart Db for summarizing. Applied to the Db itself: it
 * is one object that every quadrant chart shares, with its state in module
 * variables. The generated parser calls the methods on a copy of the Db's
 * properties (`yy`), so `this` in a method is not the Db; the patch uses `db`.
 *
 * - `clear()` starts the recording over.
 * - `addPoint()` and `addClass()` record what they received, after the Db has
 *   accepted it (a style that is invalid makes them throw, and the text is
 *   rejected), with the styles that `parseStyles()` makes of the written ones.
 * - the setters of the four texts of the axes record whether the text they
 *   set is empty: the last one is the text the Db holds.
 */
export function patchQuadrantDb(dbValue: object): void {
  const db = dbValue as QuadrantDbLike
  const {
    addPoint,
    addClass,
    clear,
    setXAxisLeftText,
    setXAxisRightText,
    setYAxisBottomText,
    setYAxisTopText,
  } = db
  const parseStyles = db.parseStyles.bind(db)

  /** The recording of the text being parsed. */
  function current(): Recording {
    const found = recordings.get(db)
    if (found !== undefined) return found
    const created = emptyRecording()
    recordings.set(db, created)
    return created
  }

  /** The setter `setter` of a text of an axis, which also records whether the text it sets is empty. */
  function recordingAxisText(
    setter: (text: { text: string }) => unknown,
    slot: keyof Recording["axisTexts"],
  ): (text: { text: string }) => unknown {
    return (text) => {
      const result = setter.call(db, text)
      current().axisTexts[slot] = text.text.trim() !== ""
      return result
    }
  }

  db.clear = (...args: unknown[]): unknown => {
    recordings.set(db, emptyRecording())
    return clear.apply(db, args)
  }
  db.addPoint = (
    text: { text: string },
    className: string,
    x: string,
    y: string,
    styles: string[],
  ): unknown => {
    const result = addPoint.call(db, text, className, x, y, styles)
    current().points.push({ className, x, y, styles: parseStyles(styles) })
    return result
  }
  db.addClass = (className: string, styles: string[]): unknown => {
    const result = addClass.call(db, className, styles)
    current().classes.set(className, parseStyles(styles))
    return result
  }
  db.setXAxisLeftText = recordingAxisText(setXAxisLeftText, "xLeft")
  db.setXAxisRightText = recordingAxisText(setXAxisRightText, "xRight")
  db.setYAxisBottomText = recordingAxisText(setYAxisBottomText, "yBottom")
  db.setYAxisTopText = recordingAxisText(setYAxisTopText, "yTop")
}
