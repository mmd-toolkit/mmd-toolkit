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

/** The child nodes of `node`, in the order of `visitorKeys`. */
function childrenOf(node: Node): Node[] {
  return visitorKeys[node.type].flatMap((key) => childNodes(node, key))
}

/** A call the walk has still to make: `leaveNode` when `entered`, otherwise `enterNode`. */
interface Step {
  readonly node: Node
  readonly parent: Node | null
  readonly entered: boolean
}

/**
 * ast.md, Nodes: walks the tree from `node` down, following the child fields
 * of `visitorKeys` only. Every node is entered before its child nodes and
 * left after them. Tokens, comments, directives, and the frontmatter are not
 * nodes and are never visited; they are in the lists of the root.
 *
 * Trees nest without a limit, so `pending` holds the calls found so far and
 * not yet made, the next one last: a function call for each level would
 * exhaust the call stack. The step that leaves a node goes in before its child
 * nodes, which go in reversed, so that it comes after them and they come in
 * order.
 */
export function traverseNodes(node: Node, visitor: Visitor): void {
  const pending: Step[] = [{ node, parent: null, entered: false }]
  for (let step = pending.pop(); step !== undefined; step = pending.pop()) {
    if (step.entered) {
      visitor.leaveNode(step.node, step.parent)
      continue
    }
    visitor.enterNode(step.node, step.parent)
    pending.push({ node: step.node, parent: step.parent, entered: true })
    for (const child of childrenOf(step.node).reverse()) {
      pending.push({ node: child, parent: step.node, entered: false })
    }
  }
}
