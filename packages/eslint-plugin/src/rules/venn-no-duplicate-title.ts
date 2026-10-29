import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"

/** Compare each title with the last title statement, retaining written padding. */
export const vennNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a title that replaces a different title.",
      recommended: true,
      url: ruleDocsUrl("venn-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicate: "mermaid.js replaces the earlier title with this title.",
    },
  },
  create(context) {
    let previous: string | null = null
    return {
      VennTitleStatement(node) {
        const text = normalizeLineTerminators(node.value.value)
        if (previous !== null && previous !== text) {
          context.report({
            node,
            messageId: "duplicate",
          })
        }
        previous = text
      },
    }
  },
}
