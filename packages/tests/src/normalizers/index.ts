import type { DbSummary } from "../types.ts"
import { normalizeClass, patchClassDb } from "./class.ts"
import { normalizeEr } from "./er.ts"
import { normalizeFlowchart, patchFlowDb } from "./flowchart.ts"
import { normalizeGantt, patchGanttDb } from "./gantt.ts"
import { normalizeJourney } from "./journey.ts"
import { normalizeMindmap } from "./mindmap.ts"
import { normalizeRequirement } from "./requirement.ts"
import { normalizeSequence, patchSequenceDb } from "./sequence.ts"
import { normalizeState } from "./state.ts"
import { normalizeTimeline } from "./timeline.ts"

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
  // `classDiagram` and `classDiagram-v2` are both detected as `classDiagram`.
  ["classDiagram", normalizeClass],
  // `stateDiagram` and `stateDiagram-v2` are both detected as `stateDiagram`.
  ["stateDiagram", normalizeState],
  ["er", normalizeEr],
  ["gantt", normalizeGantt],
  ["journey", normalizeJourney],
  ["mindmap", normalizeMindmap],
  ["requirement", normalizeRequirement],
  ["timeline", normalizeTimeline],
  // The pseudo diagram whose whole text is `error`: its Db holds nothing.
  ["error", () => ({})],
])

/**
 * Changes a Db class for summarizing. Receives the Db's prototype (or the Db,
 * see {@link DbPatchEntry.appliedTo}). A patch
 * does what its diagram type needs of the following:
 *
 * - make a sanitizer the Db calls (`@braintree/sanitize-url` through
 *   `utils.formatUrl()`) have no effect, since summaries record values with
 *   the sanitizers disabled. Needed for every Db that calls `formatUrl()`:
 *   flowchart, class and agentflow in mermaid@12.0.0;
 * - record a value that a site setting changes as the other settings give it
 *   (the link target of class under `securityLevel: sandbox`), since summaries
 *   are the same under every `securityLevel`;
 * - give a stand-in for a browser function the Db calls while mermaid parses
 *   (see `browser-stand-ins.ts`);
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
  /**
   * What the patch receives: the prototype of the Db class (the default), or
   * the Db itself, for a diagram type whose Db is one object that every
   * diagram shares and that has no class (gantt).
   */
  readonly appliedTo?: "prototype" | "object"
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
  [
    "classDiagram",
    { sampleText: "classDiagram\n  class A\n", patch: patchClassDb },
  ],
  [
    "gantt",
    { sampleText: "gantt\n", patch: patchGanttDb, appliedTo: "object" },
  ],
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
