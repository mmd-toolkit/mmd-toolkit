import type { BlockNode, BlockNodeStatement, Node } from "@mmd-toolkit/parser"

/** Whether this statement is the head itself, rather than part of its body. */
export function isCompositeHead(
  statement: BlockNodeStatement,
  parent: Node | null,
): boolean {
  return parent?.type === "BlockCompositeStatement" && parent.head === statement
}

/**
 * The nodes that a statement declares: both ends of one link, only the last
 * target of a chain, or the node without links. A composite head with links
 * declares none of its nodes.
 */
export function declaredNodesOf(
  statement: BlockNodeStatement,
  parent: Node | null,
): readonly BlockNode[] {
  if (statement.links.length === 0) return [statement.node]
  if (isCompositeHead(statement, parent)) return []
  const target = statement.links[statement.links.length - 1].target
  return statement.links.length === 1 ? [statement.node, target] : [target]
}
