import type { TreeNode, TreeRoot } from "./db-from-tree/tree.ts"

/** The node types of the data blocks, whose delimiters lie in their range. */
export const DATA_BLOCK_NODE_TYPES: ReadonlySet<string> = new Set([
  "EventmodelingDataBlock",
  "AgentflowDataBlock",
  "KanbanDataBlock",
  "FlowchartDataBlock",
  "SequenceDataBlock",
  "UsecaseJsonDataBlock",
])

/** Whether a field holds a node: an object with a string type and two offsets. */
export function isNode(value: unknown): value is TreeNode {
  if (typeof value !== "object" || value === null) return false
  const { type, range } = value as { type?: unknown; range?: unknown }
  return (
    typeof type === "string" &&
    Array.isArray(range) &&
    range.length === 2 &&
    typeof range[0] === "number" &&
    typeof range[1] === "number"
  )
}

/** Root and its body nodes, before their children, following the recorded object's key order. */
export function nodesOf(root: TreeRoot): TreeNode[] {
  const nodes: TreeNode[] = [root]

  /** Visits node-valued fields and lists in their recorded order. */
  function walk(node: TreeNode): void {
    nodes.push(node)
    for (const value of Object.values(node)) {
      if (isNode(value)) walk(value)
      else if (Array.isArray(value)) {
        for (const child of value as unknown[]) {
          if (isNode(child)) walk(child)
        }
      }
    }
  }

  // Frontmatter, comments, directives and tokens are source records, not nodes.
  walk(root.body)
  return nodes
}
