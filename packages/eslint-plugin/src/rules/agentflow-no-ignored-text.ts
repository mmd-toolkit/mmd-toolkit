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
        for (const [text, side] of [
          [node.textBefore, "before"],
          [node.textAfter, "after"],
        ] as const) {
          if (text !== null && isIgnoredDirectionText(text.value, side))
            context.report({ node: text, messageId: "ignored" })
        }
      },
    }
  },
}
