import type { RadarCurve, RadarDiagram } from "@mmd-toolkit/parser"

/** All written axes: repeated declarations count, while references use their ids. */
export interface RadarAxes {
  readonly count: number
  readonly names: ReadonlySet<string>
}

/** Collect the whole diagram, including axes written after a curve. */
export function radarAxesOf(diagram: RadarDiagram): RadarAxes {
  const names = new Set<string>()
  let count = 0
  for (const statement of diagram.body) {
    if (statement.type !== "RadarAxisStatement") continue
    for (const axis of statement.axes) {
      count++
      names.add(axis.name.name)
    }
  }
  return { count, names }
}

/** Accepted named curves supply every axis; positional curves must match their count. */
export function radarCurveIsDrawn(curve: RadarCurve, axes: RadarAxes): boolean {
  return (
    axes.count > 0 &&
    (curve.entries[0].type === "RadarNamedEntry" ||
      curve.entries.length === axes.count)
  )
}
