import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { convertedValuesOf } from "./converted-text.ts"
import type { IshikawaDiagram, IshikawaNode } from "./ishikawa-tree.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeRoot } from "./tree.ts"

/** docs/db-from-tree/ishikawa.md: project the nesting, reading only literal values and ranges. */
export function ishikawaDbOf(
  source: string,
  tree: TreeRoot,
  diagram: IshikawaDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const read = convertedValuesOf(source, tree, "ishikawa")
  const replace = textReplacementOf(embedded.config)

  /** Node text is converted, trimmed and sanitized; children already have their parents. */
  function nodeOf(node: IshikawaNode): JsonObject {
    return {
      text: replace(read(node.text.range, node.text.value).trim()),
      children: node.children.map(nodeOf),
    }
  }

  const root = diagram.root === null ? null : nodeOf(diagram.root)
  return {
    title: replace(root === null ? (embedded.title ?? "") : String(root.text)),
    accTitle: "",
    accDescr: "",
    root,
  }
}
