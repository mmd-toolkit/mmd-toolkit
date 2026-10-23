import type { GitgraphDiagram, GitgraphBodyItem } from "@mmd-toolkit/parser"
import type { FlatHiddenPrinter } from "./flat-hidden-diagram.ts"
import { createFlatHiddenDiagramPrinter } from "./flat-hidden-diagram.ts"
import {
  layoutGitgraphHeader,
  layoutGitgraphStatement,
} from "./gitgraph-layout.ts"

/** The flat gitgraph body uses shared hidden-form and prefix preservation. */
export const gitgraphPrinter: FlatHiddenPrinter =
  createFlatHiddenDiagramPrinter<GitgraphDiagram, GitgraphBodyItem>({
    type: "GitgraphDiagram",
    ignoredType: "GitgraphIgnoredText",
    header: layoutGitgraphHeader,
    statement: layoutGitgraphStatement,
  })
