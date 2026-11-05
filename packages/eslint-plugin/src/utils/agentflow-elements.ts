import type {
  AgentflowConnectorStatement,
  AgentflowDiagram,
  AgentflowLabel,
  AgentflowLink,
  AgentflowShape,
  AgentflowVertex,
  Node,
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
  /** The kind of the written label and the property of the written shape, which mermaid.js records apart from the drawing. */
  form: string
  readonly connector: boolean
}

/** The first written field that this occurrence replaces. */
type ReplacedField = "label" | "drawn shape" | "kind"

/** Observers of the two declarations that can replace an element's fields. */
interface ElementObserver {
  /** The diagram, before any of its statements. */
  diagram?(node: AgentflowDiagram): void
  vertex?(node: AgentflowShape, id: string, field: ReplacedField): void
  /**
   * A vertex of a statement without a link that has no class or data block and
   * writes only the id, or the label, shape, and kind that the element has;
   * `parent` is the node that holds the statement.
   */
  unchanged?(node: AgentflowVertex, id: string, parent: Node | null): void
  /**
   * A connector declaration of an existing connector with no data block that
   * has no title or the title that the connector has; `parent` is the node
   * that holds the declaration.
   */
  unchangedConnector?(
    node: AgentflowConnectorStatement,
    id: string,
    parent: Node | null,
  ): void
  connector?(
    node: AgentflowConnectorStatement,
    id: string,
    field: ReplacedField,
  ): void
}

/** How mermaid.js records a written label and shape, besides what is drawn. */
function formOf(
  label: AgentflowLabel | null,
  shape: AgentflowShape | null,
): string {
  const property = shape?.property
  return `${label?.kind ?? ""}|${
    property ? `${property.name.name}:${property.value.name}` : ""
  }`
}

/** Agentflow draws only these four bracket shapes distinctly. */
function drawnShape(shape: AgentflowShape): string {
  switch (shape.name) {
    case "diamond":
    case "hexagon":
    case "framed-rectangle":
    case "lean-right":
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
  /** The ids of the vertices and connectors written so far. */
  const written = new Set<string>()
  let linkIds: ReadonlyMap<AgentflowLink, readonly string[]> = new Map()
  /** Whether the statement being visited has a link, and the node that holds it. */
  let linked = false
  let container: Node | null = null
  return {
    AgentflowDiagram(node) {
      linkIds = agentflowLinkIdsOf(node)
      observer.diagram?.(node)
    },
    AgentflowVertexStatement(node, parent) {
      linked = node.links.length > 0
      container = parent
    },
    AgentflowVertex(node) {
      const id = normalizeLineTerminators(node.id.name)
      if (!isAgentflowOrdinaryVertexId(id) || edgeIds.has(id)) return
      const bare = !linked && node.cssClass === null && node.data.length === 0
      const seen = written.has(id)
      written.add(id)
      if (node.shape === null) {
        if (bare && seen) observer.unchanged?.(node, id, container)
        return
      }
      const label = agentflowLabelText(node.shape.label)
      const form = formOf(node.shape.label, node.shape)
      const shape = drawnShape(node.shape)
      const previous = elements.get(id)
      const kind =
        previous?.connector === true ? "connector" : vertexKind(node.shape)
      const field = replacedFieldOf(previous, label, shape, kind)
      if (field !== null) observer.vertex?.(node.shape, id, field)
      else if (bare && seen && previous?.form === form) {
        observer.unchanged?.(node, id, container)
      }
      elements.set(id, {
        label,
        shape,
        kind: previous?.connector === true ? previous.kind : kind,
        form,
        connector: previous?.connector ?? false,
      })
    },
    AgentflowConnectorStatement(node, parent) {
      const id = agentflowConnectorId(node.name)
      if (id === null) return
      const title = node.title === null ? "" : agentflowLabelText(node.title)
      const previous = elements.get(id)
      written.add(id)
      if (previous?.connector === true) {
        const bare = node.data.length === 0
        if (title === "") {
          if (bare) observer.unchangedConnector?.(node, id, parent)
          return
        }
        const field = replacedFieldOf(previous, title, null, null)
        if (field !== null) observer.connector?.(node, id, field)
        else if (bare && previous.label !== null) {
          observer.unchangedConnector?.(node, id, parent)
        }
        previous.label = title
        previous.form = formOf(node.title, null)
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
        form: formOf(node.title, null),
        connector: true,
      })
    },
    // The target group is read before this link creates any edges.
    "AgentflowLink:exit"(node) {
      for (const id of linkIds.get(node) ?? []) edgeIds.add(id)
    },
  }
}
