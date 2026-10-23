import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isIgnoredDirectionText } from "../utils/direction-text.ts"

/** Only direction prefixes and suffixes are in this rule's scope. */
export const agentflowNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow text that mermaid.js drops from a direction line.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-ignored-text"),
    },
    schema: [],
    messages: {
      ignored:
        "mermaid.js reads this line as a `direction` statement and drops this text.",
    },
  },
  create(context) {
    return {
      AgentflowDirectionStatement(node) {
        if (
          node.textBefore !== null &&
          isIgnoredDirectionText(node.textBefore.value, "before")
        ) {
          context.report({ node: node.textBefore, messageId: "ignored" })
        }
        if (
          node.textAfter !== null &&
          isIgnoredDirectionText(node.textAfter.value, "after")
        ) {
          context.report({ node: node.textAfter, messageId: "ignored" })
        }
      },
    }
  },
}
