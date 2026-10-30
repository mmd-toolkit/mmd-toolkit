import type { TreeNode, TreeRoot } from "./tree.ts"

/** The group/chain fields the graph-family edge-count rule reads. */
interface GraphGroup {
  readonly vertices: readonly TreeNode[]
}
interface GraphVertexStatement extends TreeNode {
  readonly first: GraphGroup
  readonly links: readonly { readonly target: GraphGroup }[]
}

/**
 * diagrams/flowchart.md, Rejections outside the grammar, Too many edges:
 * the default of the site configuration's `maxEdges`.
 */
const DEFAULT_MAX_EDGES = 500

/** Whether `value`, a part of the tree, is a node: an object that has a `type`. */
function isTreeNode(value: object): value is TreeNode {
  return "type" in value && typeof value.type === "string"
}

/**
 * Calls `visit` for each node in `value`, a part of the tree that is JSON:
 * a node, a list, or a value of a field, the node itself first.
 */
function visitNodes(value: unknown, visit: (node: TreeNode) => void): void {
  if (typeof value !== "object" || value === null) return
  if (isTreeNode(value)) visit(value)
  // The tree is JSON: an object holds values by name, a list by position.
  for (const child of Object.values(value as Record<string, unknown>)) {
    visitNodes(child, visit)
  }
}

/** Whether the node `node` is a vertex statement. */
function isVertexStatement(node: TreeNode): node is GraphVertexStatement {
  return (
    node.type === "FlowchartVertexStatement" ||
    node.type === "AgentflowVertexStatement"
  )
}

/**
 * docs/db-from-tree/flowchart.md, Links: how many Db edges the
 * vertex statements of a flowchart tree make: for each link, one edge for
 * each pair of a vertex of the group before it and a vertex of its target.
 */
function graphEdgeCount(root: TreeRoot, type: string): number {
  let edges = 0
  visitNodes(root.body, (node) => {
    if (!isVertexStatement(node) || node.type !== type) return
    let source = node.first
    for (const link of node.links) {
      edges += source.vertices.length * link.target.vertices.length
      source = link.target
    }
  })
  return edges
}

/**
 * Rejections outside the grammar, Too many edges: whether mermaid.js
 * rejects the input of `root` for having more Db edges than `maxEdges` of
 * the site configuration `config`. A tree does not say it, because the site
 * configuration is not part of the text.
 */
export function exceedsMaxEdges(
  root: TreeRoot,
  config: { readonly maxEdges?: unknown } | undefined,
): boolean {
  const maxEdges =
    typeof config?.maxEdges === "number" ? config.maxEdges : DEFAULT_MAX_EDGES
  return (
    graphEdgeCount(
      root,
      root.body.type === "AgentflowDiagram"
        ? "AgentflowVertexStatement"
        : "FlowchartVertexStatement",
    ) > maxEdges
  )
}

/** The flowchart-only count retained by the existing public export. */
export function flowchartEdgeCount(root: TreeRoot): number {
  return graphEdgeCount(root, "FlowchartVertexStatement")
}

/** Agentflow counts sequence, reference and failure edges, including nested bodies. */
export function agentflowEdgeCount(root: TreeRoot): number {
  return graphEdgeCount(root, "AgentflowVertexStatement")
}
