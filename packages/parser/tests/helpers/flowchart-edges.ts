import type { Root } from "../../src/index.ts"
import { traverseNodes } from "../../src/index.ts"

/**
 * diagrams/flowchart.md, Rejections outside the grammar, Too many edges:
 * the default of the site configuration's `maxEdges`.
 */
const DEFAULT_MAX_EDGES = 500

/**
 * diagrams/flowchart.md, Db normalization, Links: how many Db edges the
 * vertex statements of a flowchart tree make: for each link, one edge for
 * each pair of a vertex of the group before it and a vertex of its target.
 */
export function flowchartEdgeCount(root: Root): number {
  let edges = 0
  traverseNodes(root, {
    enterNode(node) {
      if (node.type !== "FlowchartVertexStatement") return
      let source = node.first
      for (const link of node.links) {
        edges += source.vertices.length * link.target.vertices.length
        source = link.target
      }
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })
  return edges
}

/**
 * Rejections outside the grammar, Too many edges: whether mermaid.js
 * rejects the input of `root` for having more Db edges than `maxEdges` of
 * the site configuration `config`. `parse()` does not make this check,
 * because the site configuration is not part of the text.
 */
export function exceedsMaxEdges(
  root: Root,
  config: { readonly maxEdges?: unknown } | undefined,
): boolean {
  const maxEdges =
    typeof config?.maxEdges === "number" ? config.maxEdges : DEFAULT_MAX_EDGES
  return flowchartEdgeCount(root) > maxEdges
}
