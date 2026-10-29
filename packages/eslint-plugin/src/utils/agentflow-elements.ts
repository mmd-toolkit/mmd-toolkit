import type {
  AgentflowConnectorStatement,
  AgentflowLink,
  AgentflowShape,
} from "@mmd-toolkit/parser"
import type { MermaidRuleVisitor } from "../rule-types.ts"
import {
  agentflowConnectorId,
  agentflowLabelText,
  isAgentflowOrdinaryVertexId,
} from "./agentflow-names.ts"
import { normalizeLineTerminators } from "./acc-text.ts"
import { agentflowLinkIdsOf } from "./agentflow-links.ts"

/** Label, shape, and kind keep their current values when only one is replaced. */
interface ElementValues {
  label: string | null
  shape: string
  kind: string
  readonly connector: boolean
}

/** The first written field that this occurrence replaces. */
type ReplacedField = "label" | "drawn shape" | "kind"

/** Observers of the two declarations that can replace an element's fields. */
interface ElementObserver {
  vertex?(node: AgentflowShape, id: string, field: ReplacedField): void
  connector?(
    node: AgentflowConnectorStatement,
    id: string,
    field: ReplacedField,
  ): void
}

/** Agentflow draws only these three bracket shapes distinctly. */
function drawnShape(shape: AgentflowShape): string {
  switch (shape.name) {
    case "diamond":
    case "hexagon":
    case "framed-rectangle":
      return shape.name
    default:
      return "rounded"
  }
}

/** The authored bracket form also determines the element's theme colour. */
function vertexKind(shape: AgentflowShape): string {
  switch (shape.name) {
    case "framed-rectangle":
      return "tool"
    case "diamond":
      return "decision"
    case "hexagon":
      return "action"
    case "lean-right":
      return "input"
    default:
      return "task"
  }
}

/** Compare only fields written before; a null field keeps its earlier value. */
function replacedFieldOf(
  previous: ElementValues | undefined,
  label: string,
  shape: string | null,
  kind: string | null,
): ReplacedField | null {
  if (previous === undefined) return null
  if (previous.label !== null && previous.label !== label) {
    return "label"
  }
  if (shape !== null && previous.shape !== shape) {
    return "drawn shape"
  }
  if (kind !== null && previous.kind !== kind) {
    return "kind"
  }
  return null
}

/**
 * Vertices and connectors share an element. The first connector replaces a
 * vertex; later connectors write only a nonempty title. Metadata stays opaque.
 */
export function agentflowElementDeclarations(
  observer: ElementObserver,
): MermaidRuleVisitor {
  const elements = new Map<string, ElementValues>()
  const edgeIds = new Set<string>()
  let linkIds: ReadonlyMap<AgentflowLink, readonly string[]> = new Map()
  return {
    AgentflowDiagram(node) {
      linkIds = agentflowLinkIdsOf(node)
    },
    AgentflowVertex(node) {
      if (node.shape === null) return
      const id = normalizeLineTerminators(node.id.name)
      if (!isAgentflowOrdinaryVertexId(id) || edgeIds.has(id)) return
      const label = agentflowLabelText(node.shape.label)
      const shape = drawnShape(node.shape)
      const previous = elements.get(id)
      const kind =
        previous?.connector === true ? "connector" : vertexKind(node.shape)
      const field = replacedFieldOf(previous, label, shape, kind)
      if (field !== null) observer.vertex?.(node.shape, id, field)
      elements.set(id, {
        label,
        shape,
        kind: previous?.connector === true ? previous.kind : kind,
        connector: previous?.connector ?? false,
      })
    },
    AgentflowConnectorStatement(node) {
      const id = agentflowConnectorId(node.name)
      if (id === null) return
      const title = node.title === null ? "" : agentflowLabelText(node.title)
      const previous = elements.get(id)
      if (previous?.connector === true) {
        if (title === "") return
        const field = replacedFieldOf(previous, title, null, null)
        if (field !== null) observer.connector?.(node, id, field)
        previous.label = title
        return
      }
      const field = replacedFieldOf(
        previous,
        title || id,
        "rounded",
        "connector",
      )
      if (field !== null) observer.connector?.(node, id, field)
      elements.set(id, {
        label: title === "" ? null : title,
        shape: "rounded",
        kind: "connector",
        connector: true,
      })
    },
    // The target group is read before this link creates any edges.
    "AgentflowLink:exit"(node) {
      for (const id of linkIds.get(node) ?? []) edgeIds.add(id)
    },
  }
}
