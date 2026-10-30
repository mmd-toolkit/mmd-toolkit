import type { DbSummary, JsonObject, JsonValue } from "../types.ts"

/** A published node, before drawing resolves icons or measures its label. */
interface TreeviewNode {
  readonly name: string
  readonly nodeType: "file" | "directory"
  readonly cssClass?: string
  readonly icon?: string
  readonly description?: string
  readonly children: readonly TreeviewNode[]
}

/** The published tree and accessibility strings read by rendering. */
interface TreeviewDbLike {
  getRoot(): { readonly children: readonly TreeviewNode[] }
  getAccTitle(): string
  getAccDescription(): string
}

/** Keeps each authored node once, in the renderer's traversal order. */
function summarizeNode(node: TreeviewNode): JsonObject {
  const result: Record<string, JsonValue> = {
    name: node.name,
    nodeType: node.nodeType,
  }
  if (node.cssClass !== undefined) result.cssClass = node.cssClass
  if (node.icon !== undefined) result.icon = node.icon
  if (node.description !== undefined) result.description = node.description
  result.children = node.children.map(summarizeNode)
  return result
}

/** Omits the fixed root, generated ids, indentation and drawing-only state. */
export function normalizeTreeview(value: unknown): DbSummary {
  const db = value as TreeviewDbLike
  return {
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    nodes: db.getRoot().children.map(summarizeNode),
  }
}
