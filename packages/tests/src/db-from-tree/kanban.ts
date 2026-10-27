import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { convertedValuesOf } from "./converted-text.ts"
import type { ConvertedValueReader } from "./converted-text.ts"
import type { KanbanDiagram, KanbanNode } from "./kanban-tree.ts"
import { textReplacementOf } from "./text-replacement.ts"
import { TreeError } from "./tree.ts"
import type { TreeRoot } from "./tree.ts"

/** docs/db-from-tree/kanban.md: the normalized renderer data, read from columns and their cards. */
export function kanbanDbOf(
  source: string,
  root: TreeRoot,
  diagram: KanbanDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const readValue = convertedValuesOf(source, root, "kanban")
  const replace = textReplacementOf(embedded.config)
  const sections: JsonObject[] = []
  const items: JsonObject[] = []
  let effectIndex = 0

  /** Read one occurrence and consume its own suffix effect once. */
  function publish(
    node: KanbanNode,
    isGroup: boolean,
    sectionId?: string,
  ): JsonObject {
    const { id, shape } = node
    if (id === null && shape === null)
      throw new TreeError(
        "kanban",
        node.type,
        "a node has neither a text nor a shape",
      )
    const description =
      shape === null
        ? null
        : readValue(
            shape.label.range,
            shape.label.value,
            shape.label.kind === "text"
              ? 0
              : shape.label.kind === "string"
                ? 1
                : 2,
          )
    const writtenId =
      id === null ? (description ?? "") : readValue(id.range, id.value)
    const nodeId = replace(writtenId)
    const summary: Record<string, JsonValue> = {
      id: nodeId,
      label: replace(description ?? writtenId),
      isGroup,
      ...(isGroup || sectionId === undefined ? {} : { parentId: sectionId }),
    }
    // Each nonempty data list is one adjacent suffix, regardless of how many
    // blocks it holds. YAML and its conversions belong to the embedded effect.
    if (node.data.length > 0) {
      const effect = embedded.dataBlockEffects[effectIndex++]
      if (effect === undefined)
        throw new TreeError(
          "kanban",
          node.type,
          "the tree has a data suffix with no recorded effect",
        )
      if (effect.id !== writtenId)
        throw new TreeError(
          "kanban",
          node.type,
          `the recorded data effect names ${JSON.stringify(effect.id)}, not ${JSON.stringify(writtenId)}`,
        )
      Object.assign(summary, effect.set)
    }
    applyDecorations(readValue, node, summary, isGroup, replace)
    return summary
  }

  for (const column of diagram.body) {
    const section = publish(column, true)
    sections.push(section)
    for (const card of column.children)
      items.push(publish(card, false, String(section.id)))
  }
  if (effectIndex !== embedded.dataBlockEffects.length)
    throw new TreeError(
      "kanban",
      diagram.type,
      "there are recorded data effects with no tree suffix",
    )
  return {
    nodes: sections.flatMap((section) => [
      section,
      ...items.filter((item) => item.parentId === section.id),
    ]),
  }
}

/** Decorations: only the last icon of an item is exposed; class lines and section icons add no summary field. */
function applyDecorations(
  readValue: ConvertedValueReader,
  node: KanbanNode,
  summary: Record<string, JsonValue>,
  isGroup: boolean,
  replace: (text: string) => string,
): void {
  for (const decoration of node.decorations) {
    if (!isGroup && decoration.type === "KanbanIconStatement")
      summary.icon = replace(
        readValue(decoration.icon.range, decoration.icon.value),
      )
  }
}
