import type { Node } from "@mmd-toolkit/ast"
import { traverseNodes } from "@mmd-toolkit/parser"

// Arrays that grow with the input can exceed V8's argument limit when spread
// into a function call. Keep these collection operations in loops.

/**
 * Append the items in order to the existing array, as `target.push(...items)`
 * does.
 */
export function appendItems<T>(target: T[], items: readonly T[]): void {
  // The length is read once, so an array appended to itself is appended once.
  const count = items.length
  for (let index = 0; index < count; index++) target.push(items[index])
}

/** The smallest value, or Infinity when the collection is empty. */
export function minOf(values: readonly number[]): number {
  let minimum = Infinity
  for (const value of values) minimum = Math.min(minimum, value)
  return minimum
}

/** The largest value, or -Infinity when the collection is empty. */
export function maxOf(values: readonly number[]): number {
  let maximum = -Infinity
  for (const value of values) maximum = Math.max(maximum, value)
  return maximum
}

/** The nodes of the tree below `root`, `root` included, that `matches` selects, in source order. */
export function findNodes(
  root: Node,
  matches: (node: Node) => boolean,
): Node[] {
  const found: Node[] = []
  traverseNodes(root, {
    enterNode(node) {
      if (matches(node)) found.push(node)
    },
    leaveNode() {
      // The nodes are collected on the way down.
    },
  })
  return found
}
