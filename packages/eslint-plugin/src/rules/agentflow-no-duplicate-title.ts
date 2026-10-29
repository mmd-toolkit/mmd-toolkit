import type { AgentflowAccTitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators, titleText } from "../utils/acc-text.ts"

/** Compare accessible titles in source order, across every container. */
export const agentflowNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` that replaces the title set before it.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier title with the one of this `accTitle`.",
    },
  },
  create(context) {
    let previous: AgentflowAccTitleStatement | null = null
    let value = ""
    return {
      AgentflowAccTitleStatement(node) {
        const next = normalizeLineTerminators(titleText(node)).trim()
        if (previous !== null && value !== next) {
          context.report({
            node,
            messageId: "duplicate",
          })
        }
        previous = node
        value = next
      },
    }
  },
}
