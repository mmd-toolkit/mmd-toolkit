import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { commonValue } from "./statement-values.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeviewDiagram } from "./treeview-tree.ts"
import { TreeviewText } from "./treeview-text.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf } from "./values.ts"

/** docs/db-from-tree/treeview.md: publish the accepted flat tree's forest. */
export function treeviewDbOf(
  source: string,
  root: TreeRoot,
  diagram: TreeviewDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const text = new TreeviewText(source, root)
  const replace = textReplacementOf(embedded.config)
  const nodes: JsonObject[] = []
  const ancestors: { indent: number; children: JsonObject[] }[] = []
  let accTitle = ""
  let accDescr = ""
  for (const statement of diagram.body) {
    switch (statement.type) {
      case "TreeviewNode": {
        while (
          ancestors.length > 0 &&
          ancestors.at(-1)!.indent >= statement.indent
        )
          ancestors.pop()
        let name = text.of(statement.name.range)
        if (statement.name.type === "StringLiteral") name = name.slice(1, -1)
        else
          while (name.endsWith(" ") || name.endsWith("\t"))
            name = name.slice(0, -1)
        const directory = name.endsWith("/")
        const children: JsonObject[] = []
        const node: Record<string, JsonValue> = {
          name: directory ? name.slice(0, -1) : name,
          nodeType: directory ? "directory" : "file",
          children,
        }
        for (const annotation of statement.annotations) {
          if (annotation.type === "TreeviewClassAnnotation")
            node.cssClass = text.of(annotation.name.range)
          else if (annotation.type === "TreeviewIconAnnotation")
            node.icon =
              annotation.name === null ? "none" : text.of(annotation.name.range)
          else {
            const value = replace(
              annotation.value === null
                ? ""
                : text.of(annotation.value.range).trim(),
            )
            if (value === "") delete node.description
            else node.description = value
          }
        }
        ;(ancestors.at(-1)?.children ?? nodes).push(node)
        ancestors.push({ indent: statement.indent, children })
        break
      }
      case "TreeviewAccTitleStatement":
        accTitle = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          false,
        )
        break
      case "TreeviewAccDescrStatement":
      case "TreeviewAccDescrBlockStatement":
        accDescr = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          statement.type === "TreeviewAccDescrBlockStatement",
        )
        break
      case "TreeviewTitleStatement":
      case "TreeviewIgnoredText":
        break
      default:
        throw new Error(
          `treeview Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  return {
    accTitle: replace(accTitle),
    accDescr: replace(descriptionOf(accDescr)),
    nodes,
  }
}
