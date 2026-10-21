import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { convertedValueOf } from "./converted-text.ts"
import type { KanbanDiagram, KanbanNode } from "./kanban-tree.ts"
import { textReplacementOf } from "./text-replacement.ts"
import { TreeError } from "./tree.ts"

/** docs/db-from-tree/kanban.md: the normalized renderer data, read from the flat written rows. */
export function kanbanDbOf(
  source: string,
  diagram: KanbanDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const replace = textReplacementOf(embedded.config)
  const sections: JsonObject[] = []
  const items: JsonObject[] = []
  const sectionLevel = diagram.body[0]?.indent
  let sectionId: string | undefined
  let effectIndex = 0
  for (const [index, node] of diagram.body.entries()) {
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
        : convertedValueOf(
            source,
            shape.label.range,
            shape.label.value,
            shape.label.kind === "text"
              ? 0
              : shape.label.kind === "string"
                ? 1
                : 2,
          )
    const writtenId =
      id === null
        ? (description ?? "")
        : convertedValueOf(source, id.range, id.value)
    const nodeId = replace(writtenId)
    const isGroup = node.indent === sectionLevel
    if (
      sectionLevel !== undefined &&
      node.indent < sectionLevel &&
      index < diagram.body.length - 1
    ) {
      throw new TreeError(
        "kanban",
        node.type,
        "a shallower item is followed by another node",
      )
    }
    if (isGroup) sectionId = nodeId
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
    applyDecorations(source, node, summary, isGroup, replace)
    if (isGroup) sections.push(summary)
    else items.push(summary)
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
  source: string,
  node: KanbanNode,
  summary: Record<string, JsonValue>,
  isGroup: boolean,
  replace: (text: string) => string,
): void {
  for (const decoration of node.decorations) {
    if (!isGroup && decoration.type === "KanbanIconStatement")
      summary.icon = replace(
        convertedValueOf(source, decoration.icon.range, decoration.icon.value),
      )
  }
}
