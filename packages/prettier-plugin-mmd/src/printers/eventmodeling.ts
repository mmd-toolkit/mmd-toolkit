import type { EventmodelingDiagram } from "@mmd-toolkit/parser"
import type { FlatHiddenPrinter } from "./flat-hidden-diagram.ts"
import { createFlatHiddenDiagramPrinter } from "./flat-hidden-diagram.ts"
import {
  classifyEventmodelingStatement,
  layoutEventmodelingHeader,
  layoutEventmodelingStatement,
} from "./eventmodeling-layout.ts"
import type { EventmodelingStatement } from "./eventmodeling-layout.ts"

/** Common terminals retain their source boundary; GWT uses two open bodies. */
export const eventmodelingPrinter: FlatHiddenPrinter =
  createFlatHiddenDiagramPrinter<EventmodelingDiagram, EventmodelingStatement>({
    type: "EventmodelingDiagram",
    ignoredType: "EventmodelingIgnoredText",
    header: layoutEventmodelingHeader,
    statement: layoutEventmodelingStatement,
    writtenGapBefore: (source, item) =>
      classifyEventmodelingStatement(item).kind === "common" ||
      source.joiningRegions.some(
        (region) =>
          region.end <= item.range[0] &&
          source.text.slice(region.end, item.range[0]).trim() === "",
      ),
    retainsClosingBoundary: (item) =>
      classifyEventmodelingStatement(item).kind === "data",
    prefixes: (item) => ("textBefore" in item ? item.textBefore : []),
    inlineGapBefore: (item) =>
      item.type === "EventmodelingIgnoredText" ? undefined : "space",
  })
