import type { Node } from "./ast.ts"
import { visitorKeys } from "./visitor-keys.ts"

/** What {@link traverseNodes} calls for each node of a tree. */
export interface Visitor {
  /** Called for a node before its child nodes; `parent` is null for the node the walk starts at. */
  enterNode(node: Node, parent: Node | null): void
  /** Called for a node after its child nodes, with the same `parent` as `enterNode`. */
  leaveNode(node: Node, parent: Node | null): void
}

/**
 * ast.md, Nodes: whether `value`, the value of a child field or an element
 * of one, is a node, that is, a value whose `type` is one of the node types.
 * A child field holds nodes and nulls only: tokens, comments, directives,
 * and the frontmatter are in the lists of the root, which are not child
 * fields. (`Identifier` is the name of a token kind too.)
 */
function isNode(value: unknown): value is Node {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string" &&
    Object.hasOwn(visitorKeys, value.type)
  )
}

/**
 * ast.md, Nodes: the child nodes that the child field `key` of `node` holds,
 * in order: the node itself when the field holds one node, the nodes of the
 * list when it holds a list, skipping its null elements, and none when it
 * holds the null of a child that is not there.
 */
function childNodes(node: Node, key: string): Node[] {
  const value: unknown = Reflect.get(node, key)
  if (Array.isArray(value)) {
    const elements: readonly unknown[] = value
    return elements.filter(isNode)
  }
  return isNode(value) ? [value] : []
}

/**
 * The child nodes of `node`, in the order of `visitorKeys`. Each child field
 * is read when the walk reaches it, after the nodes of the fields before it
 * have been left.
 */
function* childrenOf(node: Node): Generator<Node, void, undefined> {
  for (const key of visitorKeys[node.type]) yield* childNodes(node, key)
}

/** A node that the walk has entered and not left yet. */
interface OpenNode {
  readonly node: Node
  readonly parent: Node | null
  /** The child nodes that are still to come. */
  readonly children: Iterator<Node, void, undefined>
}

/** Enters `node`, whose child nodes are read only after that. */
function enter(node: Node, parent: Node | null, visitor: Visitor): OpenNode {
  visitor.enterNode(node, parent)
  return { node, parent, children: childrenOf(node) }
}

/**
 * ast.md, Nodes: walks the tree from `node` down, following the child fields
 * of `visitorKeys` only. Every node is entered before its child nodes and
 * left after them. Tokens, comments, directives, and the frontmatter are not
 * nodes and are never visited; they are in the lists of the root.
 *
 * Trees nest without a limit, so `open` holds the nodes entered and not left,
 * the innermost last: a call for each of them would exhaust the call stack.
 */
export function traverseNodes(node: Node, visitor: Visitor): void {
  const open = [enter(node, null, visitor)]
  for (
    let current = open.at(-1);
    current !== undefined;
    current = open.at(-1)
  ) {
    const child = current.children.next()
    if (child.done === true) {
      open.pop()
      visitor.leaveNode(current.node, current.parent)
    } else {
      open.push(enter(child.value, current.node, visitor))
    }
  }
}
