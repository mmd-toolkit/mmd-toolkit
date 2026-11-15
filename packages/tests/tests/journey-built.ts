import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { buildTree } from "./check-tree-built.ts"

/** A journey tree: the header `journey`, a line feed, and the statements. */
export function buildJourney(
  source: string,
  makeStatements: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    {
      header: "journey",
      diagramType: "journey",
      bodyType: "JourneyDiagram",
    },
    source,
    makeStatements,
  )
}
