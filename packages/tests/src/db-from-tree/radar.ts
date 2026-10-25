import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type { RadarAxis, RadarDiagram } from "./radar-tree.ts"
import { commonValue, decodedString } from "./statement-values.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf } from "./values.ts"

/** docs/db-from-tree/radar.md: publish axes, then curves, then final options. */
export function radarDbOf(
  source: string,
  root: TreeRoot,
  diagram: RadarDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const text = new ConvertedText(readConvertedCharacters(source, root))
  const replace = textReplacementOf(embedded.config)
  const axes = diagram.body.flatMap((statement) =>
    statement.type === "RadarAxisStatement" ? statement.axes : [],
  )
  const curves: JsonObject[] = []
  const options: Record<string, JsonValue> = {
    showLegend: true,
    ticks: 5,
    max: null,
    min: 0,
    graticule: "circle",
  }
  let title = ""
  let accTitle = ""
  let accDescr = ""

  /** Missing labels use the declaration name; quoted empty labels stay empty. */
  function labelOf(declaration: RadarAxis): string {
    return declaration.label === null
      ? text.of(declaration.name.range)
      : decodedString(
          text.of([
            declaration.label.range[0] + 1,
            declaration.label.range[1] - 1,
          ]),
        )
  }

  for (const statement of diagram.body) {
    switch (statement.type) {
      case "RadarAxisStatement":
      case "RadarIgnoredText":
        break
      case "RadarTitleStatement":
      case "RadarAccTitleStatement":
      case "RadarAccDescrStatement":
      case "RadarAccDescrBlockStatement": {
        const value = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          statement.type === "RadarAccDescrBlockStatement",
        )
        if (statement.type === "RadarTitleStatement") title = value
        else if (statement.type === "RadarAccTitleStatement") accTitle = value
        else accDescr = value
        break
      }
      case "RadarCurveStatement":
        for (const curve of statement.curves) {
          const entries =
            curve.entries[0]?.type === "RadarNamedEntry"
              ? axes.map((axis) => {
                  const match = curve.entries.find(
                    (entry) =>
                      entry.type === "RadarNamedEntry" &&
                      text.of(entry.axis.range) === text.of(axis.name.range),
                  )
                  // The parser has already checked that every axis has an entry.
                  if (match === undefined)
                    throw new Error(
                      "radar Db: missing named entry in an accepted tree",
                    )
                  return numberOrText(Number(text.of(match.value.range)))
                })
              : curve.entries.map((entry) =>
                  numberOrText(Number(text.of(entry.value.range))),
                )
          curves.push({ label: labelOf(curve), entries })
        }
        break
      case "RadarOptionsStatement":
        for (const option of statement.options) {
          switch (option.type) {
            case "RadarShowLegendOption":
              options.showLegend = option.value === "true"
              break
            case "RadarGraticuleOption":
              options.graticule = option.value
              break
            case "RadarTicksOption":
              options.ticks = numberOrText(
                Math.min(Number(text.of(option.value.range)), 32),
              )
              break
            case "RadarMaxOption":
              options.max = numberOrText(Number(text.of(option.value.range)))
              break
            case "RadarMinOption":
              options.min = numberOrText(Number(text.of(option.value.range)))
              break
            default:
              throw new Error(
                `radar Db: unknown option ${JSON.stringify(option satisfies never)}`,
              )
          }
        }
        break
      default:
        throw new Error(
          `radar Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  return {
    title: replace(title || embedded.title || ""),
    accTitle: replace(accTitle),
    accDescr: replace(descriptionOf(accDescr)),
    axes: axes.map((axis) => ({ label: labelOf(axis) })),
    curves,
    options,
  }
}
