import type { AgentflowFlowStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { agentflowElementDeclarations } from "../utils/agentflow-elements.ts"
import { agentflowLostMembers } from "../utils/agentflow-flows.ts"

/**
 * Compare connector declarations with the shared vertex/connector history. Also
 * report a declaration in a flow that does not get the connector, because a
 * flow that ended before has it (`agentflowLostMembers`), when the declaration
 * says nothing new about it.
 */
export const agentflowNoRedefinedConnector: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined" | "dropped"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a connector declaration that replaces the title or the vertex written for its id before, or that a later flow does not get.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-redefined-connector"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the {{field}} of `{{id}}` written earlier with that of this connector.",
      dropped:
        "mermaid.js keeps `{{id}}` in an earlier flow, so this flow does not get it.",
    },
  },
  create(context) {
    let lostMembers: ReadonlyMap<
      AgentflowFlowStatement,
      ReadonlySet<string>
    > = new Map()
    return agentflowElementDeclarations({
      diagram(node) {
        lostMembers = agentflowLostMembers(node)
      },
      unchangedConnector(node, id, parent) {
        if (
          parent?.type === "AgentflowFlowStatement" &&
          lostMembers.get(parent)?.has(id)
        ) {
          context.report({ node, messageId: "dropped", data: { id } })
        }
      },
      connector(node, id, field) {
        context.report({
          node,
          messageId: "redefined",
          data: {
            id,
            field,
          },
        })
      },
    })
  },
}
