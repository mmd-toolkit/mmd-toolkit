import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators, titleText } from "../utils/acc-text.ts"

/** Compare each title with the last written title, including an empty one. */
export const usecaseNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` that replaces the title set before it.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier title with the one of this `accTitle`.",
    },
  },
  create(context) {
    let previous: string | null = null
    return {
      UsecaseAccTitleStatement(node) {
        const value = normalizeLineTerminators(titleText(node)).trim()
        if (previous !== null && previous !== "" && previous !== value) {
          context.report({
            node,
            messageId: "duplicate",
          })
        }
        previous = value
      },
    }
  },
}
