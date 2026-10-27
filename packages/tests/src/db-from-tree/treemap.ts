import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import { commonValue } from "./statement-values.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreemapDiagram, TreemapRow } from "./treemap-tree.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf } from "./values.ts"

/** Apply the ordered class-style substitutions, then split and trim entries. */
function stylesOf(value: string): string[] {
  // Mermaid protects `\,` with `§§§`, changes remaining commas to `;`, then
  // restores each `§§§` before splitting. Authored signs share that marker,
  // so written `§§§` also becomes a comma, including runs joined by `\,`.
  return value
    .replaceAll("\\,", "§§§")
    .replaceAll(",", ";")
    .replaceAll("§§§", ",")
    .split(";")
    .map((style) => style.trimEnd())
}

/** docs/db-from-tree/treemap.md: project the nested forest and publish classes and common values. */
export function treemapDbOf(
  source: string,
  root: TreeRoot,
  diagram: TreemapDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const text = new ConvertedText(readConvertedCharacters(source, root))
  const replace = textReplacementOf(embedded.config)
  const nodes: JsonObject[] = []
  const classes = new Map<string, string[]>()
  let title = ""
  let accTitle = ""
  let accDescr = ""

  /** Project a hierarchy occurrence, applying its leading statements globally. */
  function nodeOf(statement: TreemapRow): JsonObject {
    for (const before of statement.statementsBefore) visit(before)
    const node: Record<string, JsonValue> = {
      name: text.of(statement.name.range).slice(1, -1),
    }
    if (statement.type === "TreemapLeaf")
      node.value = numberOrText(
        Number.parseFloat(text.of(statement.value.range).replaceAll(",", "")),
      )
    if (statement.classSelector !== null)
      node.classSelector = text.of(statement.classSelector.range)
    if (statement.type === "TreemapSection")
      node.children = statement.children.map(nodeOf)
    return node
  }

  /** Apply gap statements before projecting each hierarchy node, in written order. */
  function visit(statement: TreemapDiagram["body"][number]): JsonObject | null {
    switch (statement.type) {
      case "TreemapSection":
      case "TreemapLeaf":
        return nodeOf(statement)
      case "TreemapClassDefStatement": {
        const id = text.of(statement.name.range)
        const styles = classes.get(id) ?? []
        styles.push(
          ...stylesOf(
            statement.style === null ? "" : text.of(statement.style.range),
          ),
        )
        classes.set(id, styles)
        break
      }
      case "TreemapTitleStatement":
      case "TreemapAccTitleStatement":
      case "TreemapAccDescrStatement":
      case "TreemapAccDescrBlockStatement": {
        const value = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          statement.type === "TreemapAccDescrBlockStatement",
        )
        if (statement.type === "TreemapTitleStatement") title = value
        else if (statement.type === "TreemapAccTitleStatement") accTitle = value
        else accDescr = value
        break
      }
      default:
        throw new Error(
          `treemap Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
    return null
  }

  for (const statement of diagram.body) {
    const node = visit(statement)
    if (node !== null) nodes.push(node)
  }
  return {
    title: replace(title || embedded.title || ""),
    accTitle: replace(accTitle),
    accDescr: replace(descriptionOf(accDescr)),
    nodes,
    classDefs: [...classes].map(([id, styles]) => ({ id, styles })),
  }
}
