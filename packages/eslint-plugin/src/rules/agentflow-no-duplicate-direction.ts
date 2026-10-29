import type { AgentflowDirectionStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { agentflowFlowDeclarations } from "../utils/agentflow-flows.ts"
import { comparableDirection } from "../utils/direction-text.ts"

/** Compare direct-body directions in the order in which flows close. */
export const agentflowNoDuplicateDirection: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `direction` statement that replaces the direction of its flow.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-duplicate-direction"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier direction for this flow with `{{direction}}`.",
    },
  },
  create(context) {
    const directions = new Map<string, AgentflowDirectionStatement>()
    return agentflowFlowDeclarations((node, id) => {
      let previous = directions.get(id)
      for (const statement of node.body) {
        if (statement.type !== "AgentflowDirectionStatement") continue
        if (
          previous !== undefined &&
          comparableDirection(previous.direction) !==
            comparableDirection(statement.direction)
        ) {
          context.report({
            node: statement,
            messageId: "duplicate",
            data: {
              direction: statement.direction,
            },
          })
        }
        previous = statement
        directions.set(id, statement)
      }
    })
  },
}
