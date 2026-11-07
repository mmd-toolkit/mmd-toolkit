import type { RailroadDiagram, RailroadBodyItem } from "@mmd-toolkit/ast"
import type { FlatHiddenPrinter } from "./flat-hidden-diagram.ts"
import { createFlatHiddenDiagramPrinter } from "./flat-hidden-diagram.ts"
import {
  layoutRailroadHeader,
  layoutRailroadStatement,
} from "./railroad-layout.ts"

/** The four dialects share one flat body and its hidden-form boundaries. */
export const railroadPrinter: FlatHiddenPrinter =
  createFlatHiddenDiagramPrinter<RailroadDiagram, RailroadBodyItem>({
    type: "RailroadDiagram",
    ignoredType: "RailroadIgnoredText",
    header: layoutRailroadHeader,
    statement: layoutRailroadStatement,
  })
