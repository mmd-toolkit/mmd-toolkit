import type {
  ArchitectureDiagram,
  ArchitectureBodyItem,
} from "@mmd-toolkit/parser"
import type { FlatHiddenPrinter } from "./flat-hidden-diagram.ts"
import { createFlatHiddenDiagramPrinter } from "./flat-hidden-diagram.ts"
import {
  layoutArchitectureHeader,
  layoutArchitectureStatement,
} from "./architecture-layout.ts"

/** The flat architecture body uses shared hidden-form and prefix preservation. */
export const architecturePrinter: FlatHiddenPrinter =
  createFlatHiddenDiagramPrinter<ArchitectureDiagram, ArchitectureBodyItem>({
    type: "ArchitectureDiagram",
    ignoredType: "ArchitectureIgnoredText",
    header: layoutArchitectureHeader,
    statement: layoutArchitectureStatement,
  })
