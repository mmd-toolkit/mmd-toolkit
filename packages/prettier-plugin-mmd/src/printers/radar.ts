import type {
  RadarDiagram,
  RadarBodyItem,
  RadarIgnoredText,
} from "@mmd-toolkit/parser"
import type { FlatHiddenPrinter } from "./flat-hidden-diagram.ts"
import { createFlatHiddenDiagramPrinter } from "./flat-hidden-diagram.ts"
import { layoutRadarHeader, layoutRadarStatement } from "./radar-layout.ts"

/** The flat radar body shares hidden-form, prefix and kept-line decisions. */
export const radarPrinter: FlatHiddenPrinter = createFlatHiddenDiagramPrinter<
  RadarDiagram,
  RadarBodyItem
>({
  type: "RadarDiagram",
  ignoredType: "RadarIgnoredText",
  header: layoutRadarHeader,
  statement: layoutRadarStatement,
  suffixes: trailingHiddenForms,
})

/** Group suffixes belong to their last member (ast/radar.md, Gap ownership). */
function trailingHiddenForms(
  statement: RadarBodyItem,
): readonly RadarIgnoredText[] {
  switch (statement.type) {
    case "RadarAxisStatement":
      return statement.axes.at(-1)!.textAfter
    case "RadarCurveStatement":
      return statement.curves.at(-1)!.textAfter
    case "RadarOptionsStatement":
      return statement.options.at(-1)!.textAfter
    case "RadarIgnoredText":
      return []
    case "RadarTitleStatement":
    case "RadarAccTitleStatement":
    case "RadarAccDescrStatement":
    case "RadarAccDescrBlockStatement":
      return statement.textAfter
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown radar item ${JSON.stringify(statement satisfies never)}`,
      )
  }
}
