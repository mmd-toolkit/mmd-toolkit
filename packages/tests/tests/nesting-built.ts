import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Kit } from "./check-tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** Attach explicitly supplied children; no indentation or source is interpreted. */
export function withChildren(
  kit: Kit,
  node: CheckedNode,
  children: CheckedNode[],
): CheckedNode {
  return {
    ...node,
    ...kit.node(node.type, hull([node, ...children]), {}),
    children,
  }
}

/** Attach an explicitly supplied leading gap and extend the owned range. */
export function withBefore(
  kit: Kit,
  node: CheckedNode,
  field: "textBefore" | "statementsBefore",
  before: CheckedNode[],
): CheckedNode {
  return {
    ...node,
    ...kit.node(node.type, hull([...before, node]), {}),
    [field]: before,
  }
}
