import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import type { AgentflowFlowStatement } from "@mmd-toolkit/ast"
import { agentflowElementDeclarations } from "../utils/agentflow-elements.ts"
import { agentflowLostMembers } from "../utils/agentflow-flows.ts"

/**
 * Compare each shaped vertex with the fields already written for its id. Also
 * report a vertex written in a flow that does not get it, because a flow that
 * ended before has it (`agentflowLostMembers`), when the statement says nothing
 * new about it.
 */
export const agentflowNoRedefinedVertex: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined" | "dropped"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a vertex that replaces the label or the shape written for its id before, or that a later flow does not get.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-redefined-vertex"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the {{field}} of `{{id}}` written earlier with that of this vertex.",
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
      unchanged(node, id, parent) {
        if (
          parent?.type === "AgentflowFlowStatement" &&
          lostMembers.get(parent)?.has(id)
        ) {
          context.report({ node, messageId: "dropped", data: { id } })
        }
      },
      vertex(node, id, field) {
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
