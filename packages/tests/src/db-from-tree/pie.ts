import { decodedString, commonValue } from "./statement-values.ts"
import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type { PieDiagram } from "./pie-tree.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf } from "./values.ts"

/** docs/db-from-tree/pie.md: convert, collect sections, then publish final common assignments. */
export function pieDbOf(
  source: string,
  root: TreeRoot,
  diagram: PieDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const text = new ConvertedText(readConvertedCharacters(source, root))
  const replace = textReplacementOf(embedded.config)
  const sections = new Map<string, number | string>()
  let title = ""
  let accTitle = ""
  let accDescr = ""
  for (const statement of diagram.body) {
    if (statement.type === "PieIgnoredText") continue
    if (statement.type === "PieSectionStatement") {
      const label = decodedString(
        text.of([statement.label.range[0] + 1, statement.label.range[1] - 1]),
      )
      const value = Number(text.of(statement.value.range))
      if (value < 0) throw new Error("pie Db: a negative section value")
      if (!sections.has(label)) sections.set(label, numberOrText(value))
      continue
    }
    const value = commonValue(
      statement.value === null ? "" : text.of(statement.value.range),
      statement.type === "PieAccDescrBlockStatement",
    )
    switch (statement.type) {
      case "PieTitleStatement":
        title = value
        break
      case "PieAccTitleStatement":
        accTitle = value
        break
      case "PieAccDescrStatement":
      case "PieAccDescrBlockStatement":
        accDescr = value
        break
      default:
        throw new Error(
          `pie Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  return {
    title: replace(title || embedded.title || ""),
    accTitle: replace(accTitle),
    accDescr: replace(descriptionOf(accDescr)),
    showData: diagram.showData,
    sections: [...sections].map(([label, value]) => ({ label, value })),
  }
}
