import type { Node, Range, Root } from "@mmd-toolkit/parser"
import { getVisitorKeys, visitNodes } from "./engine.ts"

/** A source selection, distinct from metadata on the immutable parsed tree. */
export interface TreeSelection {
  /** Dotted field path, including array indices, used to reveal tree ancestors. */
  path: string
  value: unknown
  /** UTF-16 offsets in the current source; containers and scalars may lack a range. */
  range: Range | null
}

/** Reads a range from an AST node or a root record. */
export function valueRange(value: unknown): Range | null {
  if (typeof value !== "object" || value === null || !("range" in value))
    return null
  const range: unknown = value.range
  if (
    Array.isArray(range) &&
    range.length === 2 &&
    range.every(Number.isInteger)
  ) {
    return [range[0], range[1]]
  }
  return null
}

/** Returns declared child keys only; a token named Identifier is never inferred as a node. */
export function childKeys(value: unknown, isNode: boolean): readonly string[] {
  if (
    !isNode ||
    typeof value !== "object" ||
    value === null ||
    !("type" in value)
  )
    return []
  const type: unknown = value.type
  const keys = getVisitorKeys()
  return typeof type === "string" && Object.hasOwn(keys, type)
    ? Reflect.get(keys, type)
    : []
}

/** Finds a node's field path by following the parser's public child fields. */
function childPath(parent: Node, child: Node, parentPath: string): string {
  for (const key of getVisitorKeys()[parent.type]) {
    const value: unknown = Reflect.get(parent, key)
    if (value === child) return `${parentPath}.${key}`
    if (Array.isArray(value)) {
      const index = value.indexOf(child)
      if (index >= 0) return `${parentPath}.${key}.${index}`
    }
  }
  throw new Error("AST child has no declared field.")
}

/**
 * Chooses the deepest node containing a UTF-16 source offset. Nonempty ranges
 * exclude their end; an empty node can be selected at its single offset.
 * Equally deep matches keep the first node encountered by the public traversal.
 */
export function nodeAtOffset(root: Root, offset: number): TreeSelection | null {
  let selected: TreeSelection | null = null
  let selectedDepth = -1
  const paths = new Map<Node, string>()
  let depth = 0
  visitNodes(root, {
    enterNode(node, parent) {
      const path = parent
        ? childPath(parent, node, paths.get(parent) ?? "root")
        : "root"
      paths.set(node, path)
      const [start, end] = node.range
      if (
        (start === end ? offset === start : start <= offset && offset < end) &&
        depth > selectedDepth
      ) {
        selected = { path, value: node, range: node.range }
        selectedDepth = depth
      }
      depth++
    },
    leaveNode() {
      depth--
    },
  })
  return selected
}

/**
 * Selects only a node or record represented in the current view. Offsets outside
 * the current records return null, rather than falling back to an AST node that
 * their tree cannot reveal.
 */
export function selectionAtOffset(
  root: Root,
  offset: number,
  view: string,
): TreeSelection | null {
  if (view === "tree" || view === "json") return nodeAtOffset(root, offset)
  if (view === "frontmatter") {
    const value = root.frontmatter
    if (value && value.range[0] <= offset && offset < value.range[1])
      return { path: "root.frontmatter", value, range: value.range }
    return null
  }
  if (view !== "tokens" && view !== "comments" && view !== "directives")
    return null
  for (const [index, value] of root[view].entries()) {
    if (value.range[0] <= offset && offset < value.range[1])
      return { path: `root.${view}.${index}`, value, range: value.range }
  }
  return null
}
