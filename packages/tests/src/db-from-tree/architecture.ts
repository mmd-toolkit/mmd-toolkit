import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import type { ArchitectureDiagram } from "./architecture-tree.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import { commonValue, decodedString } from "./statement-values.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeNode, TreeRoot } from "./tree.ts"
import { descriptionOf, trimmed } from "./values.ts"

/** docs/db-from-tree/architecture.md: publish categories in their stated order. */
export function architectureDbOf(
  source: string,
  root: TreeRoot,
  diagram: ArchitectureDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const text = new ConvertedText(readConvertedCharacters(source, root))
  const replace = textReplacementOf(embedded.config)
  const groups: JsonObject[] = []
  const services: JsonObject[] = []
  const junctions: JsonObject[] = []
  const edges: JsonObject[] = []
  const layoutHints: JsonObject[] = []
  let accTitle = ""
  let accDescr = ""

  /** The label converter acts on the whole bracket interior, regardless of its kind. */
  function labelValue(node: TreeNode): string {
    let value = trimmed(text.of([node.range[0] + 1, node.range[1] - 1]))
    const quote = value.charAt(0)
    if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
      value = value.slice(1, -1)
      value = value.replaceAll('\\"', '"').replaceAll("\\'", "'")
    }
    return trimmed(value)
  }

  for (const statement of diagram.body) {
    switch (statement.type) {
      case "ArchitectureIgnoredText":
      case "ArchitectureTitleStatement":
        break
      case "ArchitectureAccTitleStatement":
      case "ArchitectureAccDescrStatement":
      case "ArchitectureAccDescrBlockStatement": {
        const value = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          statement.type === "ArchitectureAccDescrBlockStatement",
        )
        if (statement.type === "ArchitectureAccTitleStatement") accTitle = value
        else accDescr = value
        break
      }
      case "ArchitectureGroupStatement":
      case "ArchitectureServiceStatement": {
        const value: Record<string, JsonValue> = {
          id: text.of(statement.id.range),
        }
        if (statement.type === "ArchitectureServiceStatement")
          value.type = "service"
        if (statement.in !== null) value.in = text.of(statement.in.range)
        if (statement.icon !== null) {
          if (statement.icon.type === "StringLiteral")
            value.iconText = decodedString(
              text.of([
                statement.icon.range[0] + 1,
                statement.icon.range[1] - 1,
              ]),
            )
          else value.icon = text.of(statement.icon.range)
        }
        if (statement.title !== null) value.title = labelValue(statement.title)
        if (statement.type === "ArchitectureGroupStatement") groups.push(value)
        else services.push(value)
        break
      }
      case "ArchitectureJunctionStatement": {
        const value: Record<string, JsonValue> = {
          id: text.of(statement.id.range),
          type: "junction",
        }
        if (statement.in !== null) value.in = text.of(statement.in.range)
        junctions.push(value)
        break
      }
      case "ArchitectureEdgeStatement": {
        const arrow = statement.arrow
        const value: Record<string, JsonValue> = {
          lhsId: text.of(statement.lhsId.range),
          lhsDir: arrow.startDirection,
          lhsInto: arrow.startMarker === "arrow",
          lhsGroup: statement.lhsGroup,
          rhsId: text.of(statement.rhsId.range),
          rhsDir: arrow.endDirection,
          rhsInto: arrow.endMarker === "arrow",
          rhsGroup: statement.rhsGroup,
        }
        if (arrow.title !== null) value.title = labelValue(arrow.title)
        edges.push(value)
        break
      }
      case "ArchitectureAlignmentStatement":
        layoutHints.push({
          direction: statement.direction,
          members: statement.members.map((member) => text.of(member.id.range)),
        })
        break
      default:
        throw new Error(
          `architecture Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  return {
    accTitle: replace(accTitle),
    accDescr: replace(descriptionOf(accDescr)),
    nodes: [...services, ...junctions],
    groups,
    edges,
    layoutHints,
  }
}
