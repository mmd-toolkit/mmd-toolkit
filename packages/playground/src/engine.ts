import * as parser from "@mmd-toolkit/parser"
import type { Node, Root, Visitor, VisitorKeys } from "@mmd-toolkit/parser"

let api = parser
const listeners = new Set<() => void>()

/** Parses with the current workspace implementation, including hot updates. */
export function parseSource(source: string): Root {
  return api.parse(source)
}

/** Reads the public child-field definition of the current parser. */
export function getVisitorKeys(): VisitorKeys {
  return api.visitorKeys
}

/** Traverses actual AST nodes only, excluding tokens and root records. */
export function visitNodes(node: Node, visitor: Visitor): void {
  api.traverseNodes(node, visitor)
}

/** Subscribes an active playground to parser implementation changes. */
export function onParserUpdate(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

if (import.meta.hot) {
  import.meta.hot.accept("@mmd-toolkit/parser", (updated) => {
    if (!updated) return
    api = updated as unknown as typeof parser
    for (const listener of listeners) listener()
  })
}
