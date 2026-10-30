import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { convertedValuesOf } from "./converted-text.ts"
import { textReplacementOf } from "./text-replacement.ts"
import { TreeError } from "./tree.ts"
import type { StringLiteral, TreeRoot } from "./tree.ts"
import type {
  VennDiagram,
  VennLabel,
  VennLiteral,
  VennName,
  VennNumber,
} from "./venn-tree.ts"

/** diagrams/venn.md, Units: the complete atoms of a converted bare style value. */
export function vennStyleAtomsOf(text: string): string[] | null {
  const atom =
    /[Rr][Gg][Bb][Aa]\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)|[Rr][Gg][Bb]\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)|#[0-9A-Fa-f]{3,8}|[+-]?(?:\d+(?:\.\d+)?|\.\d+)|[A-Z_a-z][\w-]*/guy
  const atoms: string[] = []
  let offset = 0
  while (offset < text.length) {
    if (text[offset] === " " || text[offset] === "\t") {
      offset++
      continue
    }
    atom.lastIndex = offset
    const match = atom.exec(text)
    if (match === null) return null
    atoms.push(match[0])
    offset = atom.lastIndex
  }
  return atoms.length === 0 ? null : atoms
}

/** db-summaries.md, venn: trim outside quotes, then remove one outer pair. */
function normalized(text: string): string {
  const value = text.trim()
  return value.startsWith('"') && value.endsWith('"')
    ? value.slice(1, -1)
    : value
}

/** docs/db-from-tree/venn.md: ordered declarations read only from value nodes. */
export function vennDbOf(
  source: string,
  root: TreeRoot,
  diagram: VennDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const readValue = convertedValuesOf(source, root, "venn")
  const replace = textReplacementOf(embedded.config)
  let title = replace(embedded.title ?? "")
  const subsets: JsonObject[] = []
  const texts: JsonObject[] = []
  const styles: JsonObject[] = []
  let current: string[] | undefined

  /** Convert a leaf range, using its value to retain the tree's semicolon choice. */
  function textOf(node: VennName | VennNumber | VennLiteral): string {
    const written =
      node.type === "Identifier"
        ? node.name
        : node.type === "NumericLiteral"
          ? node.raw
          : node.value
    return readValue(node.range, written, node.type === "StringLiteral" ? 1 : 0)
  }

  /** String padding is inside the quotes and survives normalization. */
  function nameOf(node: VennName | VennNumber): string {
    const value = textOf(node)
    return node.type === "StringLiteral" ? value : normalized(value)
  }

  /** Empty lexer labels are omitted before the Db's second trim. */
  function labelOf(node: VennLabel | null): JsonObject {
    if (node === null) return {}
    const converted = readValue(
      node.range,
      node.value,
      node.kind === "string" ? 2 : 1,
    )
    const lexerValue = node.kind === "text" ? converted.trim() : converted
    return lexerValue === "" ? {} : { label: normalized(lexerValue) }
  }

  /** The Db joins atoms with one space, retaining whole colors and quoted padding. */
  function styleValueOf(node: StringLiteral | VennLiteral): string {
    const value = textOf(node)
    if (node.type === "StringLiteral") return value
    const atoms = vennStyleAtomsOf(value)
    if (atoms === null)
      throw new TreeError("venn", node.type, "invalid bare style value")
    return normalized(atoms.join(" "))
  }

  for (const statement of diagram.body) {
    switch (statement.type) {
      case "VennSubsetStatement": {
        current = statement.sets.map(nameOf).sort()
        subsets.push({
          sets: [...current],
          size: numberOrText(
            statement.size === null
              ? 10 / current.length ** 2
              : Number.parseFloat(textOf(statement.size)),
          ),
          ...labelOf(statement.label),
        })
        break
      }
      case "VennTextStatement": {
        // checkTree validates the marker's mode and indentation. A valid null
        // target list always refers to the latest subset, never explicit text.
        const targets = statement.targets?.map(nameOf).sort() ?? current
        if (targets === undefined)
          throw new TreeError("venn", statement.type, "no current subset")
        texts.push({
          sets: [...targets],
          id: nameOf(statement.id),
          ...labelOf(statement.label),
        })
        break
      }
      case "VennStyleStatement": {
        const properties: Record<string, string> = {}
        for (const property of statement.properties) {
          // db-summaries.md: assigning a string to __proto__ makes no own key.
          const key = textOf(property.key)
          if (key !== "__proto__")
            properties[key] = styleValueOf(property.value)
        }
        styles.push({
          targets: statement.targets.map(nameOf).sort(),
          styles: properties,
        })
        break
      }
      case "VennTitleStatement":
        title = replace(textOf(statement.value))
        break
      case "VennIgnoredText":
        break
      default:
        throw new Error(
          `venn Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  return { title, accTitle: "", accDescr: "", subsets, texts, styles }
}
