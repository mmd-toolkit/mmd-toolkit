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

/** A value explicitly supplied by a shape or connector declaration. */
interface WrittenValue {
  readonly value: string
  readonly line: number
}

/** Label, shape, and kind keep their own origins when only one is replaced. */
interface ElementValues {
  label: WrittenValue | null
  shape: WrittenValue
  kind: WrittenValue
  readonly connector: boolean
}

/** The first written field that this occurrence replaces. */
export interface ElementReplacement {
  readonly field: "label" | "drawn shape" | "kind"
  readonly previous: WrittenValue
}

/** Observers of the two declarations that can replace an element's fields. */
interface ElementObserver {
  vertex?(
    node: AgentflowShape,
    id: string,
    replacement: ElementReplacement,
  ): void
  connector?(
    node: AgentflowConnectorStatement,
    id: string,
    replacement: ElementReplacement,
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
function replacementOf(
  previous: ElementValues | undefined,
  label: string,
  shape: string | null,
  kind: string | null,
): ElementReplacement | null {
  if (previous === undefined) return null
  if (previous.label !== null && previous.label.value !== label) {
    return { field: "label", previous: previous.label }
  }
  if (shape !== null && previous.shape.value !== shape) {
    return { field: "drawn shape", previous: previous.shape }
  }
  if (kind !== null && previous.kind.value !== kind) {
    return { field: "kind", previous: previous.kind }
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
      const replacement = replacementOf(previous, label, shape, kind)
      if (replacement !== null) observer.vertex?.(node.shape, id, replacement)
      const line = node.shape.loc.start.line
      elements.set(id, {
        label: { value: label, line },
        shape: { value: shape, line },
        kind:
          previous?.connector === true ? previous.kind : { value: kind, line },
        connector: previous?.connector ?? false,
      })
    },
    AgentflowConnectorStatement(node) {
      const id = agentflowConnectorId(node.name)
      if (id === null) return
      const title = node.title === null ? "" : agentflowLabelText(node.title)
      const previous = elements.get(id)
      const line = node.loc.start.line
      if (previous?.connector === true) {
        if (title === "") return
        const replacement = replacementOf(previous, title, null, null)
        if (replacement !== null) observer.connector?.(node, id, replacement)
        previous.label = { value: title, line }
        return
      }
      const replacement = replacementOf(
        previous,
        title || id,
        "rounded",
        "connector",
      )
      if (replacement !== null) observer.connector?.(node, id, replacement)
      elements.set(id, {
        label: title === "" ? null : { value: title, line },
        shape: { value: "rounded", line },
        kind: { value: "connector", line },
        connector: true,
      })
    },
    // The target group is read before this link creates any edges.
    "AgentflowLink:exit"(node) {
      for (const id of linkIds.get(node) ?? []) edgeIds.add(id)
    },
  }
}
