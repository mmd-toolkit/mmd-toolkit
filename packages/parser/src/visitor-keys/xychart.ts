import type { XychartNode } from "../ast/xychart.ts"

/**
 * ast/xychart.md: the child fields of each XY chart node type, as each
 * node's section states them, in the order in which a walk visits them.
 */
export const xychartVisitorKeys: Readonly<
  Record<XychartNode["type"], readonly string[]>
> = {
  XychartDiagram: ["headers", "body"],
  XychartHeader: [],
  XychartTitleStatement: ["value"],
  XychartXAxisStatement: ["title", "data"],
  XychartYAxisStatement: ["title", "data"],
  XychartBand: ["categories"],
  XychartRange: ["start", "end"],
  XychartPlotStatement: ["title", "values"],
  XychartValue: ["value", "label"],
  XychartAccTitleStatement: ["value"],
  XychartAccDescrStatement: ["value"],
  XychartAccDescrBlockStatement: ["value"],
  XychartLiteral: [],
}
