import type {
  AgentflowDiagram,
  AgentflowFlowStatement,
  AgentflowStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleVisitor } from "../rule-types.ts"
import { normalizeLineTerminators } from "./acc-text.ts"
import { agentflowConnectorId, agentflowNameText } from "./agentflow-names.ts"
import type { Container } from "./subgraph-ids.ts"
import { lostMembers, vertexIdsOf } from "./subgraph-ids.ts"

/** Flow ids are shared by all rules of the same immutable diagram. */
const flowIdTables = new WeakMap<
  AgentflowDiagram,
  ReadonlyMap<AgentflowFlowStatement, string>
>()

/** Count every completed declaration, including repeated named flows. */
export function agentflowFlowIdsOf(
  diagram: AgentflowDiagram,
): ReadonlyMap<AgentflowFlowStatement, string> {
  const cached = flowIdTables.get(diagram)
  if (cached !== undefined) return cached
  const ids = new Map<AgentflowFlowStatement, string>()

  /** An enclosing flow completes after all flows in its body. */
  function addFlows(statements: readonly AgentflowStatement[]): void {
    for (const statement of statements) {
      if (statement.type === "AgentflowGlobalStatement") {
        addFlows(statement.body)
      } else if (statement.type === "AgentflowFlowStatement") {
        addFlows(statement.body)
        ids.set(
          statement,
          statement.name === null
            ? `subGraph${ids.size}`
            : agentflowNameText(statement.name),
        )
      }
    }
  }

  addFlows(diagram.body)
  flowIdTables.set(diagram, ids)
  return ids
}

/** Complete flows in Db order, counting every declaration for unnamed ids. */
export function agentflowFlowDeclarations(
  observe: (node: AgentflowFlowStatement, id: string) => void,
): MermaidRuleVisitor {
  let ids: ReadonlyMap<AgentflowFlowStatement, string> = new Map()
  return {
    AgentflowDiagram(node) {
      ids = agentflowFlowIdsOf(node)
    },
    "AgentflowFlowStatement:exit"(node) {
      const id = ids.get(node)
      if (id !== undefined) observe(node, id)
    },
  }
}

/**
 * The members that each flow of an agentflow loses to a flow that ended before
 * it. A flow lists the vertices and connectors of its statements and the ids
 * of the flows directly in it. The vertices and connectors written directly in
 * a `global` block, wherever it stands, belong to no flow.
 */
export function agentflowLostMembers(
  diagram: AgentflowDiagram,
): ReadonlyMap<AgentflowFlowStatement, ReadonlySet<string>> {
  const flowIds = agentflowFlowIdsOf(diagram)
  const containers: Container<AgentflowFlowStatement>[] = []
  const globalIds = new Set<string>()

  /** The ids that `statements` list, in source order. */
  function listedIn(statements: readonly AgentflowStatement[]): string[] {
    return statements.flatMap((statement) => {
      switch (statement.type) {
        case "AgentflowVertexStatement":
          return vertexIdsOf(statement, normalizeLineTerminators)
        case "AgentflowConnectorStatement": {
          const id = agentflowConnectorId(statement.name)
          return id === null ? [] : [id]
        }
        case "AgentflowFlowStatement":
          return [flowIds.get(statement) ?? ""]
        default:
          return []
      }
    })
  }

  /** Adds the flows among `statements` after the flows in their bodies. */
  function addFlows(statements: readonly AgentflowStatement[]): void {
    for (const statement of statements) {
      if (statement.type === "AgentflowGlobalStatement") {
        for (const id of listedIn(statement.body)) globalIds.add(id)
        addFlows(statement.body)
      } else if (statement.type === "AgentflowFlowStatement") {
        addFlows(statement.body)
        containers.push({
          statement,
          id: flowIds.get(statement) ?? "",
          listed: listedIn(statement.body),
        })
      }
    }
  }

  addFlows(diagram.body)
  return lostMembers(
    containers.map((container) => ({
      ...container,
      listed: container.listed.filter((id) => !globalIds.has(id)),
    })),
  )
}
