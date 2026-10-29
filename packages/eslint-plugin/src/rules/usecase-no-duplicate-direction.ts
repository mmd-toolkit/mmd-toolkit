import type { UsecaseDirectionStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { comparableDirection } from "../utils/direction-text.ts"

/** Only written directions take part; the default LR supplies no history. */
export const usecaseNoDuplicateDirection: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `direction` statement that replaces the direction set before it.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-duplicate-direction"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier direction with `{{direction}}`.",
    },
  },
  create(context) {
    let previous: UsecaseDirectionStatement | null = null
    return {
      UsecaseDirectionStatement(node) {
        if (
          previous !== null &&
          comparableDirection(previous.direction) !==
            comparableDirection(node.direction)
        ) {
          context.report({
            node,
            messageId: "duplicate",
            data: {
              direction: node.direction,
            },
          })
        }
        previous = node
      },
    }
  },
}
