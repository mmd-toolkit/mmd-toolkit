import type { DbSummary, JsonObject } from "../types.ts"
import { normalizeFlowchart, patchFlowDb } from "./flowchart.ts"
import { omit } from "./json.ts"

/**
 * Agentflow keeps the same raw vertex, edge, class, subgraph and tooltip
 * records as flowchart, with additional `metadata` and `isConnector` fields.
 * Raw records retain collapsed descendants and their metadata; layout data
 * and the semantic projection each discard authored information.
 *
 * Omit `edgeSemantic`, derived from `type` and `stroke`, and
 * `isUserDefinedId`, which drawing does not read. Do not construct layout data
 * or record diagnostics: those are outputs of checks, not drawing inputs.
 */
export function normalizeAgentflow(dbValue: unknown): DbSummary {
  const summary = normalizeFlowchart(dbValue)
  return {
    ...summary,
    edges: (summary.edges as JsonObject[]).map((edge) =>
      omit(edge, ["edgeSemantic", "isUserDefinedId"]),
    ),
  }
}

/**
 * Agentflow binds the same `setLink`, `setClickFun` and `addVertex` methods
 * in its constructor, with metadata in the eighth argument. Reuse the patch to keep
 * URLs and callback calls before sanitization and record metadata effects
 * from before/after element summaries, including connectors and containers.
 */
export function patchAgentflowDb(prototype: object): void {
  patchFlowDb(prototype)
}
