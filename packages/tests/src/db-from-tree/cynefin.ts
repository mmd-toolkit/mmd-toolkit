import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type { CynefinDiagram } from "./cynefin-tree.ts"
import { commonValue, decodedString } from "./statement-values.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { StringLiteral, TreeRoot } from "./tree.ts"
import { descriptionOf } from "./values.ts"

/** docs/db-from-tree/cynefin.md: publish accepted occurrences in renderer order. */
export function cynefinDbOf(
  source: string,
  root: TreeRoot,
  diagram: CynefinDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const text = new ConvertedText(readConvertedCharacters(source, root))
  const replace = textReplacementOf(embedded.config)
  const domains = new Map<string, JsonObject[]>()
  const transitions: JsonObject[] = []
  let title = ""
  let accTitle = ""
  let accDescr = ""

  /** Shared STRING conversion follows common source conversion, without sanitization. */
  function stringValue(node: StringLiteral): string {
    return decodedString(text.of(node.range).slice(1, -1))
  }

  for (const statement of diagram.body) {
    switch (statement.type) {
      case "CynefinTitleStatement":
      case "CynefinAccTitleStatement":
      case "CynefinAccDescrStatement":
      case "CynefinAccDescrBlockStatement": {
        const value = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          statement.type === "CynefinAccDescrBlockStatement",
        )
        if (statement.type === "CynefinTitleStatement") title = value
        else if (statement.type === "CynefinAccTitleStatement") accTitle = value
        else accDescr = value
        break
      }
      case "CynefinDomainStatement":
        domains.set(
          statement.name,
          statement.items.map((item) => ({ label: stringValue(item.label) })),
        )
        break
      case "CynefinTransitionStatement": {
        if (statement.from === statement.to) break
        const label =
          statement.label === null ? "" : stringValue(statement.label)
        transitions.push({
          from: statement.from,
          to: statement.to,
          ...(label ? { label } : {}),
        })
        break
      }
      case "CynefinIgnoredText":
        break
      default:
        throw new Error(
          `cynefin Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  return {
    title: replace(title || embedded.title || ""),
    accTitle: replace(accTitle),
    accDescr: replace(descriptionOf(accDescr)),
    domains: [
      "complex",
      "complicated",
      "chaotic",
      "clear",
      "confusion",
    ].flatMap((name) => {
      const items = domains.get(name)
      return items === undefined || items.length === 0 ? [] : [{ name, items }]
    }),
    transitions,
  }
}
