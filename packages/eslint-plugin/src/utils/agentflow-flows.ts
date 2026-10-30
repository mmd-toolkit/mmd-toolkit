import type {
  AgentflowDiagram,
  AgentflowFlowStatement,
  AgentflowStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleVisitor } from "../rule-types.ts"
import { agentflowNameText } from "./agentflow-names.ts"

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
