import { directionRemovals } from "../utils/direction-removals.ts"
import type { AgentflowDirectionStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { agentflowFlowDeclarations } from "../utils/agentflow-flows.ts"
import { comparableDirection } from "../utils/direction-text.ts"

/** Compare direct-body directions in the order in which flows close. */
export const agentflowNoDuplicateDirection: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `direction` statement that replaces the direction of its flow.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-duplicate-direction"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this direction statement.",
      removePrevious: "Remove the earlier direction statement.",
      duplicate:
        "mermaid.js replaces the earlier direction for this flow with `{{direction}}`.",
    },
  },
  create(context) {
    const beforeDirections = new Map<
      string,
      AgentflowDirectionStatement | undefined
    >()
    const directions = new Map<string, AgentflowDirectionStatement>()
    return agentflowFlowDeclarations((node, id) => {
      let previous = directions.get(id)
      for (const statement of node.body) {
        if (statement.type !== "AgentflowDirectionStatement") continue
        const before = beforeDirections.get(id)
        if (
          previous !== undefined &&
          comparableDirection(previous.direction) !==
            comparableDirection(statement.direction)
        ) {
          context.report({
            node: statement,
            messageId: "duplicate",
            suggest: directionRemovals(
              context.sourceCode,
              statement,
              previous,
              before === undefined ||
                comparableDirection(before.direction) ===
                  comparableDirection(statement.direction),
            ),
            data: {
              direction: statement.direction,
            },
          })
        }
        beforeDirections.set(id, previous)
        previous = statement
        directions.set(id, statement)
      }
    })
  },
}
