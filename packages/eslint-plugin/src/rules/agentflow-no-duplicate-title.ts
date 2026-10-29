import type { AgentflowAccTitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators, titleText } from "../utils/acc-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/** Compare accessible titles in source order, across every container. */
export const agentflowNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` that replaces the title set before it.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-duplicate-title"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier title with the one of this `accTitle`.",
      removeThis: "Remove this `accTitle` statement.",
      removePrevious: "Remove the earlier `accTitle` statement.",
    },
  },
  create(context) {
    let previous: AgentflowAccTitleStatement | null = null
    let beforePreviousValue: string | null = null

    let value = ""
    return {
      AgentflowAccTitleStatement(node) {
        const next = normalizeLineTerminators(titleText(node)).trim()
        if (previous !== null && value !== next) {
          context.report({
            node,
            messageId: "duplicate",
            suggest: oneOfTwoRemovals(
              context.sourceCode,
              node,
              previous,
              beforePreviousValue === null || beforePreviousValue === next,
            ),
          })
        }
        beforePreviousValue = previous === null ? null : value
        previous = node
        value = next
      },
    }
  },
}
