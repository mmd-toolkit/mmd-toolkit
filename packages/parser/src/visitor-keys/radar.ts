import type { RadarNode } from "../ast/radar.ts"

/** ast/radar.md: child fields in specified visitor order. */
export const radarVisitorKeys: Readonly<
  Record<RadarNode["type"], readonly string[]>
> = {
  RadarDiagram: ["textBeforeHeader", "textBeforeColon", "body"],
  RadarAxisStatement: ["axes"],
  RadarCurveStatement: ["curves"],
  RadarOptionsStatement: ["options"],
  RadarAxis: [
    "textBefore",
    "name",
    "textBeforeLabel",
    "textBeforeLabelValue",
    "label",
    "textBeforeLabelClose",
    "textAfter",
  ],
  RadarCurve: [
    "textBefore",
    "name",
    "textBeforeLabel",
    "textBeforeLabelValue",
    "label",
    "textBeforeLabelClose",
    "textBeforeEntries",
    "entries",
    "textAfter",
  ],
  RadarNumberEntry: ["textBefore", "value", "textAfter"],
  RadarNamedEntry: [
    "textBefore",
    "axis",
    "textBeforeColon",
    "textBeforeValue",
    "value",
    "textAfter",
  ],
  RadarShowLegendOption: ["textBefore", "textBeforeValue", "textAfter"],
  RadarTicksOption: ["textBefore", "textBeforeValue", "value", "textAfter"],
  RadarMaxOption: ["textBefore", "textBeforeValue", "value", "textAfter"],
  RadarMinOption: ["textBefore", "textBeforeValue", "value", "textAfter"],
  RadarGraticuleOption: ["textBefore", "textBeforeValue", "textAfter"],
  RadarTitleStatement: ["value", "textAfter"],
  RadarAccTitleStatement: ["value", "textAfter"],
  RadarAccDescrStatement: ["value", "textAfter"],
  RadarAccDescrBlockStatement: ["value", "textAfter"],
  RadarLiteral: [],
  RadarIgnoredText: [],
}
