import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type { PieDiagram } from "./pie-tree.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf, trimmed } from "./values.ts"

/** Labels: Langium's STRING escape reading, after common source conversion. */
function decodedLabel(text: string): string {
  const escapes: Readonly<Record<string, string>> = {
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
    v: "\v",
    "0": "\0",
  }
  let decoded = ""
  for (let at = 0; at < text.length; at++) {
    const character = text.charAt(at)
    if (character !== "\\") decoded += character
    else {
      const escaped = text.charAt(++at)
      decoded += escapes[escaped] ?? escaped
    }
  }
  return decoded
}

/** Final common assignments: the line and block branches of the common converter. */
function commonValue(text: string, block: boolean): string {
  if (!block) return trimmed(text).replace(/[\t ]{2,}/gu, " ")
  return text
    .replace(/^\s*/gmu, "")
    .replace(/\s+$/gmu, "")
    .replace(/[\t ]{2,}/gu, " ")
    .replace(/[\n\r]{2,}/gu, "\n")
}

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
      const label = decodedLabel(
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
