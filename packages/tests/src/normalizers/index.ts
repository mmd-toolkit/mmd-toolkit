import type { DbSummary } from "../types.ts"
import { normalizeFlowchart, patchFlowDb } from "./flowchart.ts"
import { normalizeSequence, patchSequenceDb } from "./sequence.ts"

/**
 * Turns a mermaid Db into its summary. Receives the Db right after parsing.
 */
export type Normalizer = (db: unknown) => DbSummary

/**
 * Normalizers keyed by the diagram id mermaid reports (`Diagram.type`).
 *
 * To support a new diagram type, add a module next to this one and register
 * every id that shares its Db here.
 */
const normalizers: ReadonlyMap<string, Normalizer> = new Map<
  string,
  Normalizer
>([
  // `graph` and `flowchart` are both detected as `flowchart-v2`.
  ["flowchart-v2", normalizeFlowchart],
  ["flowchart-elk", normalizeFlowchart],
  ["swimlane", normalizeFlowchart],
  ["sequence", normalizeSequence],
  // The pseudo diagram whose whole text is `error`: its Db holds nothing.
  ["error", () => ({})],
])

/**
 * Changes a Db class for summarizing. Receives the Db's prototype. A patch
 * does what its diagram type needs of the following:
 *
 * - make a sanitizer the Db calls (`@braintree/sanitize-url` through
 *   `utils.formatUrl()`) have no effect, since summaries record values with
 *   the sanitizers disabled. Needed for every Db that calls `formatUrl()`:
 *   flowchart, class and agentflow in mermaid@12.0.0;
 * - record the effect of each `@{ ... }` data block (see `data-blocks.ts`),
 *   for every diagram type whose syntax has data blocks.
 */
export type DbPatch = (prototype: object) => void

/**
 * A Db patch, with a text mermaid detects as its diagram id. `runMermaid()`
 * parses the text once before any input, to reach the Db class, and patches
 * its prototype, so that no input is ever parsed by an unpatched Db.
 */
export interface DbPatchEntry {
  readonly sampleText: string
  readonly patch: DbPatch
}

/**
 * Db patches keyed by diagram id. Ids that share a Db class share its patch,
 * which is applied once.
 */
const dbPatches: ReadonlyMap<string, DbPatchEntry> = new Map<
  string,
  DbPatchEntry
>([
  ["flowchart-v2", { sampleText: "flowchart LR\n", patch: patchFlowDb }],
  ["flowchart-elk", { sampleText: "flowchart-elk LR\n", patch: patchFlowDb }],
  ["swimlane", { sampleText: "swimlane-beta LR\n", patch: patchFlowDb }],
  ["sequence", { sampleText: "sequenceDiagram\n", patch: patchSequenceDb }],
])

/**
 * Returns every Db patch, keyed by diagram id.
 */
export function getDbPatches(): ReadonlyMap<string, DbPatchEntry> {
  return dbPatches
}

/**
 * Returns the normalizer for a mermaid diagram id, if one is registered.
 */
export function getNormalizer(diagramType: string): Normalizer | undefined {
  return normalizers.get(diagramType)
}

/**
 * Summarizes `db`, or returns `null` when `diagramType` has no normalizer yet.
 */
export function normalizeDb(
  diagramType: string,
  db: unknown,
): DbSummary | null {
  const normalizer = normalizers.get(diagramType)
  return normalizer ? normalizer(db) : null
}
