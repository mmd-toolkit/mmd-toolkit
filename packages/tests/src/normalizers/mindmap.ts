import type { DbSummary, JsonObject } from "../types.ts"
import { omit, toJsonObject } from "./json.ts"

/**
 * The part of mermaid's `MindmapDB` (`diagrams/mindmap/mindmapDb.ts`) that the
 * normalizer reads.
 */
interface MindmapDbLike {
  getMindmap(): object | null
}

/** A node of the tree that `getMindmap()` returns: the fields the summary reads. */
interface MindmapNodeLike {
  children: object[]
}

/**
 * Summarizes a mindmap Db (`mindmap`).
 *
 * Kept: the tree that `getMindmap()` returns, which holds every node once with
 * its children in source order, and not the layout data of `getData()`, which
 * adds values made from the others and sets fields on the stored nodes. The
 * summary is `{ root }`: the root node, or `null` for a diagram without a node.
 * A node is `{ nodeId, level, descr, type, children }`, with `icon` and `class`
 * where a statement gave them. `level` is the indentation of the node relative
 * to the root, in characters, which the parent of a node is chosen by; `type`
 * is the number of the shape (0 no border, 1 rounded rectangle, 2 rectangle,
 * 3 circle, 4 cloud, 5 bang, 6 hexagon); `nodeId`, `descr`, `icon` and `class`
 * are the texts after `sanitizeText`.
 *
 * Dropped:
 *
 * - `id`: the number of the node in the order it was added, which is the order
 *   of the tree walked from the root, children after their parent.
 * - `isRoot`: true for the root and for no other node.
 * - `width` and `padding`: values of the site configuration (`mindmap.
 *   maxNodeWidth` and `mindmap.padding`, the padding doubled for some shapes).
 *
 * The layout and `getData()` put more fields on a node (`section`, `height`,
 * `x`, `y`); the Db that is read has none of them.
 */
export function normalizeMindmap(dbValue: unknown): DbSummary {
  const db = dbValue as MindmapDbLike
  const root = db.getMindmap()
  return { root: root === null ? null : nodeSummary(root) }
}

/** The summary of one node and, below it, of its children. */
function nodeSummary(node: object): JsonObject {
  const { children } = node as MindmapNodeLike
  return {
    ...omit(toJsonObject({ ...node, children: [] }), [
      "id",
      "isRoot",
      "width",
      "padding",
      "children",
    ]),
    children: children.map(nodeSummary),
  }
}
