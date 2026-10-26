import type { WardleyLabelOffsetDecoration } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import type { WardleyDeclaration } from "../utils/wardley-declarations.ts"
import {
  wardleyDeclarationsOf,
  wardleyPercent,
  wardleyPosition,
} from "../utils/wardley-declarations.ts"

/** Values kept for one registration, including inherited label offsets. */
interface NodeValues {
  readonly label: string
  readonly x: number
  readonly y: number | undefined
  readonly kind: "anchor" | "component" | "pipeline-component"
  readonly strategy: string | undefined
  readonly inertia: boolean | undefined
  readonly offsetX: number | undefined
  readonly offsetY: number | undefined
}

/** An omitted label offset keeps the earlier offset; strategy and inertia do not. */
function valuesOf(
  declaration: WardleyDeclaration,
  values: ReadonlyMap<WardleyDeclaration, NodeValues>,
): NodeValues {
  const { node } = declaration
  const previous =
    declaration.previous === undefined
      ? undefined
      : values.get(declaration.previous)
  let offset: WardleyLabelOffsetDecoration | null = null
  let position: { x: number; y: number | undefined },
    kind: NodeValues["kind"],
    strategy: string | undefined,
    inertia: boolean | undefined
  if (node.type === "WardleyPipelineComponent") {
    // A parent resolved only after mermaid's name conversion has no written
    // visibility to inherit here; do not invent one or decode its name.
    const parent =
      declaration.parent === undefined
        ? undefined
        : values.get(declaration.parent)
    position = { x: wardleyPercent(node.evolution), y: parent?.y }
    kind = "pipeline-component"
    offset = node.labelOffset
  } else {
    position = wardleyPosition(node.coordinates)
    kind = node.type === "WardleyAnchorStatement" ? "anchor" : "component"
    if (node.type === "WardleyComponentStatement") {
      offset =
        node.decorations.find(
          (item) => item.type === "WardleyLabelOffsetDecoration",
        ) ?? null
      strategy = node.decorations.find(
        (item) => item.type === "WardleySourceStrategyDecoration",
      )?.value
      inertia = node.decorations.some(
        (item) =>
          item.type === "WardleyInertiaDecoration" ||
          item.type === "WardleyParenthesizedInertiaDecoration",
      )
    }
  }
  return {
    label: declaration.label,
    ...position,
    kind,
    strategy,
    inertia,
    offsetX:
      offset === null
        ? previous?.offsetX
        : (offset.negativeX ? -1 : 1) * offset.offsetX.value,
    offsetY:
      offset === null
        ? previous?.offsetY
        : (offset.negativeY ? -1 : 1) * offset.offsetY.value,
  }
}

/** Pipeline parents are drawn above their children, so their authored evolution position is not compared. */
function differs(
  previous: NodeValues,
  next: NodeValues,
  pipelineParent: boolean,
): boolean {
  return (
    previous.label !== next.label ||
    (!pipelineParent && previous.x !== next.x) ||
    previous.y !== next.y ||
    previous.kind !== next.kind ||
    previous.strategy !== next.strategy ||
    previous.inertia !== next.inertia ||
    previous.offsetX !== next.offsetX ||
    previous.offsetY !== next.offsetY
  )
}

/** Compare node values in registration order, which may differ from written order. */
export const wardleyNoRedefinedNode: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a node declared again with other values.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-redefined-node"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the node `{{name}}` registered from line {{line}} with this declaration.",
    },
  },
  create(context) {
    return {
      WardleyDiagram(diagram) {
        const declarations = wardleyDeclarationsOf(diagram)
        const values = new Map<WardleyDeclaration, NodeValues>()
        for (const declaration of declarations.registrations) {
          const current = valuesOf(declaration, values)
          const previous =
            declaration.previous === undefined
              ? undefined
              : values.get(declaration.previous)
          if (
            previous !== undefined &&
            differs(
              previous,
              current,
              declarations.pipelineMembers.has(declaration.id),
            )
          ) {
            context.report({
              node: declaration.node,
              messageId: "redefined",
              data: {
                name: declaration.id,
                line: String(declaration.previous?.node.loc.start.line),
              },
            })
          }
          values.set(declaration, current)
        }
      },
    }
  },
}
