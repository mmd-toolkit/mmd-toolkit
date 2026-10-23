import type { DbSummary, JsonObject } from "../types.ts"
import { numberOrText } from "../summary-number.ts"
import { toJsonObject } from "./json.ts"

/**
 * The part of mermaid's sankey Db (`diagrams/sankey/sankeyDB.ts`) that the
 * normalizer reads. The Db is one module that every sankey diagram shares;
 * `clear()` resets its state before each parse.
 */
interface SankeyDbLike {
  getDiagramTitle(): string
  getGraph(): {
    nodes: { id: string }[]
    links: { source: string; target: string; value: number }[]
  }
}

/**
 * Summarizes the sankey Db (`sankey`).
 *
 * Kept: the title, which only the frontmatter gives (the grammar has no
 * statement for it), the nodes, and the links. `nodes` is the list of the ids
 * of the nodes, in the order in which they were first named, each node once;
 * `links` is the list of the links, in source order, each
 * `{ source, target, value }` with the ids of its nodes and the number that
 * `parseFloat()` makes of its third field. A value that is no finite number
 * (`NaN` for a field that is no number, `Infinity` for a number too large for
 * a double) is recorded as the text of the number, since JSON has no such
 * number.
 *
 * Dropped:
 *
 * - `getAccTitle()` and `getAccDescription()`: the grammar has no statement
 *   for them, so they are always the empty text.
 * - `nodes[].ID` of `getNodes()` and the `SankeyNode` objects that the links
 *   hold: the id again.
 *
 * The Db reads no browser feature, no time and no random value, and its syntax
 * has no links to follow, so the summary needs no patch of the Db.
 */
export function normalizeSankey(dbValue: unknown): DbSummary {
  const db = dbValue as SankeyDbLike
  const graph = db.getGraph()
  return {
    title: db.getDiagramTitle(),
    nodes: graph.nodes.map((node) => node.id),
    links: graph.links.map(linkSummary),
  }
}

/** The summary of one link. */
function linkSummary(link: {
  source: string
  target: string
  value: number
}): JsonObject {
  return toJsonObject({
    source: link.source,
    target: link.target,
    value: numberOrText(link.value),
  })
}
