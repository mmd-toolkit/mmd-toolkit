import type {
  AgentflowDiagram,
  AgentflowFlowStatement,
  AgentflowGlobalStatement,
  AgentflowLink,
  AgentflowStatement,
  AgentflowVertexStatement,
} from "@mmd-toolkit/parser"
import { linkIdsOf } from "./link-ids.ts"

/** Reuse the table when several rules read the same immutable diagram. */
const linkIdTables = new WeakMap<
  AgentflowDiagram,
  ReadonlyMap<AgentflowLink, readonly string[]>
>()

/** All link ids, including generated ids and grouped endpoint pairs. */
export function agentflowLinkIdsOf(
  diagram: AgentflowDiagram,
): ReadonlyMap<AgentflowLink, readonly string[]> {
  const cached = linkIdTables.get(diagram)
  if (cached !== undefined) return cached
  const ids = linkIdsOf<AgentflowStatement, AgentflowLink>(diagram.body, {
    isContainer: (
      statement,
    ): statement is AgentflowFlowStatement | AgentflowGlobalStatement =>
      statement.type === "AgentflowFlowStatement" ||
      statement.type === "AgentflowGlobalStatement",
    isVertexStatement: (statement): statement is AgentflowVertexStatement =>
      statement.type === "AgentflowVertexStatement",
  })
  linkIdTables.set(diagram, ids)
  return ids
}
