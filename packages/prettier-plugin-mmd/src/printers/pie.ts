import type { PieDiagram, PieBodyItem } from "@mmd-toolkit/parser"
import type { FlatHiddenPrinter } from "./flat-hidden-diagram.ts"
import { createFlatHiddenDiagramPrinter } from "./flat-hidden-diagram.ts"
import { layoutPieHeader, layoutPieStatement } from "./pie-layout.ts"

/** The flat pie body uses shared hidden-form and prefix preservation. */
export const piePrinter: FlatHiddenPrinter = createFlatHiddenDiagramPrinter<
  PieDiagram,
  PieBodyItem
>({
  type: "PieDiagram",
  ignoredType: "PieIgnoredText",
  header: layoutPieHeader,
  statement: layoutPieStatement,
})
