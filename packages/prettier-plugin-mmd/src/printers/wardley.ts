import type {
  WardleyDiagram,
  WardleyBodyItem,
  WardleyPipelineBodyItem,
} from "@mmd-toolkit/parser"
import type { FlatHiddenPrinter } from "./flat-hidden-diagram.ts"
import { createFlatHiddenDiagramPrinter } from "./flat-hidden-diagram.ts"
import {
  layoutWardleyHeader,
  layoutWardleyStatement,
} from "./wardley-layout.ts"

/** Top-level statements and pipeline members share one hidden-body printer. */
export const wardleyPrinter: FlatHiddenPrinter = createFlatHiddenDiagramPrinter<
  WardleyDiagram,
  WardleyBodyItem | WardleyPipelineBodyItem
>({
  type: "WardleyDiagram",
  ignoredType: "WardleyIgnoredText",
  header: layoutWardleyHeader,
  statement: layoutWardleyStatement,
  suffixes: (item) =>
    item.type === "WardleyEvolutionStatement"
      ? item.stages.at(-1)!.textAfter
      : "textAfter" in item
        ? item.textAfter
        : [],
})
