import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import {
  blockEffect,
  recordDataBlockEffect,
  recordDataBlockProblem,
} from "./data-blocks.ts"
import { clickCallsField, recordClickCall } from "./click-calls.ts"
import { omit, toJsonObject } from "./json.ts"

/**
 * The part of mermaid's `FlowDB` (`diagrams/flowchart/flowDb.ts`) that the
 * normalizer reads.
 */
interface FlowDbLike {
  getDirection(): string | undefined
  getVertices(): Map<string, object>
  getEdges(): object[] & {
    defaultInterpolate?: string
    defaultStyle?: string[]
  }
  getClasses(): Map<string, object>
  getSubGraphs(): object[]
  /** Private in TypeScript, readable at runtime. */
  tooltips: Map<string, string>
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
}

/**
 * Summarizes a flowchart Db (`flowchart-v2`, `flowchart-elk`, `swimlane`).
 *
 * Kept: everything the Db exposes through its getters, in declaration order.
 *
 * Added: `clickCalls`, the calls that bind a click callback, as the Db
 * received them (see `src/normalizers/click-calls.ts`): `FlowDB` keeps the
 * function name and arguments only inside closures, and only under
 * `securityLevel: loose`.
 *
 * Dropped:
 *
 * - `vertices[].domId`: a DOM id built from a counter of `addVertex` calls,
 *   used only for rendering.
 * - `classDefs[].textStyles`: the entries of `styles` that contain `color`,
 *   with `fill` replaced by `bgFill`. It is derived from `styles` for
 *   rendering and adds nothing the syntax determines.
 * - `vertices[].haveCallback`: set when a click binds a callback, but only
 *   under `securityLevel: loose`, a site setting. The click itself already
 *   shows as the class `clickable`.
 * - Internal bookkeeping (`vertexCounter`, `subCount`, `posCrossRef`, ...).
 * - Whitespace at the end of each style value (`vertices[].styles`,
 *   `classDefs[].styles`, `edges[].style`, `edgeDefaults.style`). The grammar
 *   keeps the whitespace written before a comma or the end of the line in the
 *   value, and `FlowDB` stores it, but nothing in mermaid reads it; the
 *   formatter removes whitespace at the end of these lines, which must not
 *   change the summary. Only the end is trimmed: whitespace at the start of a
 *   value can change the Db (`linkStyle` adds `fill:none` when no value starts
 *   with `fill`).
 *
 * `vertices[].link` is the URL as written (trimmed), not the value mermaid
 * stores after `@braintree/sanitize-url`; see {@link patchFlowDb}.
 *
 * Texts (labels, the subgraph and diagram titles, `accTitle`, `accDescr`,
 * tooltips) pass through mermaid's `common.sanitizeText()`. With DOMPurify
 * made the identity (see docs/expected-results.md) and `securityLevel` one of mermaid's
 * values, it leaves them unchanged, so they are recorded as the Db holds them
 * after the rest of its processing (trimming, quote stripping).
 *
 * Some fields are set only by `@{ ... }` data blocks: `icon`, `form`, `pos`,
 * `img`, `constraint`, `assetWidth` and `assetHeight` of vertices, `animate`
 * and `animation` of edges, and `metadata` of subgraphs. They are part of the
 * summary, but an implementation that does not read data blocks takes them
 * from `dataBlockEffects` (see docs/embedded-data.md), so only mermaid checks
 * them.
 */
export function normalizeFlowchart(dbValue: unknown): DbSummary {
  const db = dbValue as FlowDbLike
  const edges = db.getEdges()
  if (!(db.tooltips instanceof Map)) {
    throw new TypeError("normalizeFlowchart: FlowDB has no `tooltips` map")
  }
  // `setTooltip` accepts any id, including ones that are neither a vertex nor
  // a subgraph, so the map is read directly rather than per vertex.
  const tooltips: JsonValue[] = [...db.tooltips].map(([id, text]) => ({
    id,
    text,
  }))
  return {
    direction: db.getDirection() ?? null,
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    vertices: [...db.getVertices().values()].map(vertexSummary),
    edges: edges.map(edgeSummary),
    edgeDefaults: {
      interpolate: edges.defaultInterpolate ?? null,
      style: edges.defaultStyle ? styleValues(edges.defaultStyle) : null,
    },
    classDefs: [...db.getClasses().values()].map((classDef) => ({
      ...omit(toJsonObject(classDef), ["textStyles"]),
      styles: styleValues((classDef as { styles: string[] }).styles),
    })),
    subgraphs: db.getSubGraphs().map(subgraphSummary),
    tooltips,
    ...clickCallsField(db),
  }
}

/**
 * The summary of one vertex.
 */
function vertexSummary(vertex: object): JsonObject {
  return {
    ...omit(toJsonObject(vertex), ["domId", "haveCallback"]),
    styles: styleValues((vertex as { styles: string[] }).styles),
  }
}

/**
 * The summary of one edge.
 */
function edgeSummary(edge: object): JsonObject {
  const { style } = edge as { style?: string[] }
  return {
    ...toJsonObject(edge),
    ...(style ? { style: styleValues(style) } : {}),
  }
}

/**
 * Style values without the whitespace at their end, which is what
 * `String.prototype.trimEnd()` removes: exactly the characters the grammar
 * can leave there (its `SPACE` token matches JavaScript's `\s` except line
 * feed and carriage return).
 */
function styleValues(values: readonly string[]): string[] {
  return values.map((value) => value.trimEnd())
}

/**
 * The summary of one subgraph.
 */
function subgraphSummary(subgraph: object): JsonObject {
  return toJsonObject(subgraph)
}

type SetLink = (ids: string, linkStr: string, target: string) => void
type AddVertex = (...args: unknown[]) => void

/**
 * Prepares `FlowDB` for summarizing. Applied to the prototype: the
 * constructor binds `this.setLink` and `this.addVertex` from it, so every Db
 * created afterwards uses the patched methods.
 *
 * Each call that binds a click callback is recorded (see
 * `src/normalizers/click-calls.ts`): the Db keeps the function name and the
 * arguments only in a closure, and only under `securityLevel: loose`.
 *
 * Click link URLs are kept as written. `FlowDB.setLink` stores
 * `utils.formatUrl(linkStr, config)`, which trims the URL and, unless
 * `securityLevel` is `loose`, passes it through `@braintree/sanitize-url`
 * (`javascript:` URLs become `about:blank`, `https://example.com` gains a
 * trailing `/`). Summaries record values with the sanitizers disabled (see
 * docs/expected-results.md), so after the original method runs, the patch
 * stores the trimmed URL
 * instead, which is what `formatUrl` returns under `loose`.
 *
 * The effect of each `@{ ... }` data block is recorded (see
 * `src/normalizers/data-blocks.ts`). The grammar passes a data block to
 * `addVertex` as the eighth argument, in a call of its own that carries no
 * other syntax and comes after the call that creates the element. The patch
 * summarizes every element before and after that call and records the fields
 * that changed. It reads neither the block nor mermaid's rules for it: which
 * element the block applies to and what it sets come from the comparison.
 */
export function patchFlowDb(prototype: object): void {
  const target = prototype as {
    setLink?: unknown
    addVertex?: unknown
    setClickFun?: unknown
  }
  const originalSetLink = target.setLink
  if (typeof originalSetLink !== "function") {
    throw new TypeError("patchFlowDb: FlowDB has no setLink method")
  }
  const originalAddVertex = target.addVertex
  if (typeof originalAddVertex !== "function") {
    throw new TypeError("patchFlowDb: FlowDB has no addVertex method")
  }
  const originalSetClickFun = target.setClickFun
  if (typeof originalSetClickFun !== "function") {
    throw new TypeError("patchFlowDb: FlowDB has no setClickFun method")
  }
  target.setClickFun = function setClickFun(
    this: object,
    id: unknown,
    functionName: unknown,
    functionArgs: unknown,
  ): void {
    // The Db returns before it keeps the call unless `securityLevel` is
    // `loose`, and keeps it in a closure; record it as it comes.
    recordClickCall(this, id, functionName, functionArgs)
    ;(originalSetClickFun as (...args: unknown[]) => void).call(
      this,
      id,
      functionName,
      functionArgs,
    )
  }
  target.setLink = function setLink(
    this: { vertices: Map<string, { link?: string }> },
    ids: string,
    linkStr: string,
    linkTarget: string,
  ): void {
    ;(originalSetLink as SetLink).call(this, ids, linkStr, linkTarget)
    const url = linkStr.trim()
    for (const id of ids.split(",")) {
      const vertex = this.vertices.get(id)
      if (vertex) vertex.link = url || undefined
    }
  }
  target.addVertex = function addVertex(
    this: FlowDbLike,
    ...args: unknown[]
  ): void {
    if (args[7] === undefined) {
      ;(originalAddVertex as AddVertex).apply(this, args)
      return
    }
    const id = String(args[0])
    const before = blockElementSummaries(this, id)
    ;(originalAddVertex as AddVertex).apply(this, args)
    if (!before) return
    const after = blockElementSummaries(this, id)
    if (!after) return
    const effect = blockEffect(before, after)
    if (typeof effect === "string") {
      recordDataBlockProblem(this, `the block after ${id}: ${effect}`)
      return
    }
    recordDataBlockEffect(this, { id, set: effect })
  }
}

/**
 * Defers extraction failures until after parsing, without catching errors from
 * mermaid's own `addVertex` call or preventing that call from running.
 */
function blockElementSummaries(
  db: FlowDbLike,
  id: string,
): Map<string, JsonObject> | undefined {
  try {
    return elementSummaries(db)
  } catch (error) {
    recordDataBlockProblem(
      db,
      `the block after ${id}: ${error instanceof Error ? error.message : String(error)}`,
    )
    return undefined
  }
}

/**
 * The summary of every vertex, edge and subgraph of `db`, keyed by kind and
 * id (vertices) or position (edges and subgraphs).
 */
function elementSummaries(db: FlowDbLike): Map<string, JsonObject> {
  const elements = new Map<string, JsonObject>()
  for (const [id, vertex] of db.getVertices()) {
    elements.set(`vertex ${id}`, vertexSummary(vertex))
  }
  db.getEdges().forEach((edge, index) => {
    elements.set(`edge ${index}`, edgeSummary(edge))
  })
  db.getSubGraphs().forEach((subgraph, index) => {
    elements.set(`subgraph ${index}`, subgraphSummary(subgraph))
  })
  return elements
}
