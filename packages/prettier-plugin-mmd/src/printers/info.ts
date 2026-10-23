import type { InfoDiagram, InfoBodyItem } from "@mmd-toolkit/parser"
import type { FlatHiddenPrinter } from "./flat-hidden-diagram.ts"
import { createFlatHiddenDiagramPrinter } from "./flat-hidden-diagram.ts"
import { layoutInfoHeader, layoutInfoStatement } from "./info-layout.ts"

/** The flat info body uses shared hidden-form and prefix preservation. */
export const infoPrinter: FlatHiddenPrinter = createFlatHiddenDiagramPrinter<
  InfoDiagram,
  InfoBodyItem
>({
  type: "InfoDiagram",
  ignoredType: "InfoIgnoredText",
  header: layoutInfoHeader,
  statement: layoutInfoStatement,
})
