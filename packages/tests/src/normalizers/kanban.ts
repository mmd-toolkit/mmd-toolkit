import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { numberOrText } from "../summary-number.ts"
import {
  blockEffect,
  forgetDataBlockEffects,
  recordDataBlockEffect,
  recordDataBlockProblem,
} from "./data-blocks.ts"
import { ownProperties, toJson, toJsonObject } from "./json.ts"

/** The fields of a node in the kanban Db's drawing data that the text determines. */
interface KanbanNodeLike {
  id: string
  label: string
  isGroup: boolean
  parentId?: string
  ticket?: unknown
  priority?: unknown
  assigned?: unknown
  icon?: unknown
}

/** The part of mermaid's kanban Db that the normalizer reads. */
interface KanbanDbLike {
  getData(): { nodes: KanbanNodeLike[] }
}

/** The shared Db methods called by the grammar and reset before each parse. */
interface PatchableKanbanDb extends KanbanDbLike {
  addNode: (...args: unknown[]) => unknown
  decorateNode: (...args: unknown[]) => unknown
  clear: (...args: unknown[]) => unknown
}

/**
 * Summarizes the kanban Db (`kanban`) from `getData()`, the form the renderer
 * reads. Nodes stay in its order: each section followed by the items whose
 * `parentId` equals its id, including the repeated items of duplicate section
 * ids. The summary keeps ids, labels, section membership, and the metadata
 * that this form exposes. Undefined fields are omitted.
 *
 * Dropped: `level`, the absolute indentation, which the renderer does not read
 * (it tells a section from an item by `isGroup` and `parentId`); the constant
 * shapes, label types, corner radii and CSS styles, the empty edges and
 * `other`, and site configuration (`look`, widths, padding, theme and ticket
 * URLs). `getSections()` also exposes section decorations and
 * metadata that `getData()` does not use; these are outside this summary.
 * The data block patch records changes to these same fields; the getters read
 * no browser global, time or random id.
 */
export function normalizeKanban(dbValue: unknown): DbSummary {
  const db = dbValue as KanbanDbLike
  return {
    nodes: db.getData().nodes.map(nodeSummary),
  }
}

/** The summary of one node, also used when comparing a block's effects. */
function nodeSummary(node: KanbanNodeLike): JsonObject {
  return toJsonObject({
    id: node.id,
    label: node.label,
    isGroup: node.isGroup,
    parentId: node.parentId,
    ticket: node.ticket,
    priority:
      node.priority === undefined ? undefined : prioritySummary(node.priority),
    assigned: node.assigned,
    icon: node.icon,
  })
}

/**
 * Records data block effects on the shared kanban Db. `addNode()` receives
 * the block in the same call that creates its node. The patch runs the call
 * without the block, keeps the summaries, restores the prefix by replaying
 * the original node and decoration calls after `clear()`, and runs the real
 * call. The Db's module-local node list and counter have no setters.
 *
 * The comparison uses `blockEffect`, without reading the block or repeating
 * mermaid's metadata rules. The parser calls methods on a copy of the Db's
 * properties, so the wrappers close over the Db instead of using `this`.
 */
export function patchKanbanDb(dbValue: object): void {
  const db = dbValue as PatchableKanbanDb
  const { addNode, decorateNode, clear } = db
  const prefix: (() => unknown)[] = []
  db.clear = (...args: unknown[]): unknown => {
    prefix.length = 0
    forgetDataBlockEffects(db)
    return clear.apply(db, args)
  }
  db.decorateNode = (...args: unknown[]): unknown => {
    const result = decorateNode.apply(db, args)
    prefix.push(() => decorateNode.apply(db, args))
    return result
  }
  db.addNode = (...args: unknown[]): unknown => {
    let withoutBlock: Map<string, JsonObject> | undefined
    if (args[4] !== undefined) {
      try {
        addNode.apply(db, args.slice(0, 4))
        withoutBlock = elementSummaries(db)
      } catch {
        // The real call below decides whether mermaid rejects this input.
      }
      clear.call(db)
      for (const call of prefix) call()
    }
    const result = addNode.apply(db, args)
    prefix.push(() => addNode.apply(db, args))
    if (args[4] === undefined) return result
    const id = String(args[1])
    if (withoutBlock === undefined) {
      recordDataBlockProblem(
        db,
        `the block after ${id}: the node cannot be added without it`,
      )
      return result
    }
    const effect = blockEffect(withoutBlock, elementSummaries(db))
    if (typeof effect === "string") {
      recordDataBlockProblem(db, `the block after ${id}: ${effect}`)
    } else {
      recordDataBlockEffect(db, { id, set: effect })
    }
    return result
  }
}

/**
 * Each element once, keyed by its position rather than its possibly repeated
 * id. `getData()` repeats an entire item list for each repeated section id;
 * only its first occurrence belongs to the comparison.
 */
function elementSummaries(db: KanbanDbLike): Map<string, JsonObject> {
  const elements = new Map<string, JsonObject>()
  const sections = new Set<string>()
  let repeatedSection = false
  for (const node of db.getData().nodes) {
    if (node.isGroup) {
      repeatedSection = sections.has(node.id)
      sections.add(node.id)
    } else if (repeatedSection) {
      continue
    }
    elements.set(`node ${elements.size}`, nodeSummary(node))
  }
  return elements
}

/** Keeps YAML priority values, spelling non-finite numbers as text since JSON has none. */
function prioritySummary(
  value: unknown,
  ancestors: readonly object[] = [],
): JsonValue {
  if (typeof value === "number") return numberOrText(value)
  if (value === null || typeof value !== "object") return toJson(value)
  if (ancestors.includes(value)) {
    throw new TypeError("normalizeKanban: cyclic priority metadata")
  }
  const parents = [...ancestors, value]
  if (Array.isArray(value)) {
    return value.map((item: unknown) => prioritySummary(item, parents))
  }
  return ownProperties(
    Object.entries(value).map(([key, item]) => [
      key,
      prioritySummary(item, parents),
    ]),
  )
}
