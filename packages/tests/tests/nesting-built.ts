import type { Kit, RecordedNode } from "./tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** Attach explicitly supplied children; no indentation or source is interpreted. */
export function withChildren(
  kit: Kit,
  node: RecordedNode,
  children: RecordedNode[],
): RecordedNode {
  return {
    ...node,
    ...kit.node(node.type, hull([node, ...children]), {}),
    children,
  }
}

/** Attach an explicitly supplied leading gap and extend the owned range. */
export function withBefore(
  kit: Kit,
  node: RecordedNode,
  field: "textBefore" | "statementsBefore",
  before: RecordedNode[],
): RecordedNode {
  return {
    ...node,
    ...kit.node(node.type, hull([...before, node]), {}),
    [field]: before,
  }
}
