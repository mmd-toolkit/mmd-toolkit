import { childFieldsOf } from "./node-fields.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"

/** Whether `value` is a node: an object with a string `type` and a range of two offsets. */
export function isNode(value: unknown): value is CheckedNode {
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

/**
 * The child nodes of `node`: the values of its child fields
 * ({@link childFieldsOf}), a node or null, or a list of nodes. The tree is of
 * the form that {@link checkShape} requires.
 */
export function childNodesOf(node: CheckedNode): CheckedNode[] {
  const children: CheckedNode[] = []
  for (const field of childFieldsOf(node.type)) {
    const value = node[field]
    if (isNode(value)) {
      children.push(value)
    } else if (Array.isArray(value)) {
      for (const entry of value as unknown[]) {
        if (isNode(entry)) children.push(entry)
      }
    }
  }
  return children
}

/**
 * ast.md, Root: the nodes of the tree, `Root` first, then those under its
 * `body`, each before its children; `parent` is null for `Root`.
 */
export function walkNodes(
  root: CheckedRoot,
  visit: (node: CheckedNode, parent: CheckedNode | null) => void,
): void {
  /** Visits `node` and what is under it. */
  function walk(node: CheckedNode, parent: CheckedNode | null): void {
    visit(node, parent)
    for (const child of childNodesOf(node)) walk(child, node)
  }

  walk(root, null)
}

/** Every node of the tree, in the order of {@link walkNodes}. */
export function nodesOf(root: CheckedRoot): CheckedNode[] {
  const nodes: CheckedNode[] = []
  walkNodes(root, (node) => nodes.push(node))
  return nodes
}
