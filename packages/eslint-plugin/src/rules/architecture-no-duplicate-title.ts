import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { commonTitleText } from "../utils/common-value-text.ts"

/** Only `accTitle` participates; diagram-level titles are not drawn. */
export const architectureNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` that replaces the title set before it.",
      recommended: true,
      url: ruleDocsUrl("architecture-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
    },
  },
  create(context) {
    let previous: string | null = null
    return {
      ArchitectureAccTitleStatement(node) {
        const value = commonTitleText(node.value?.value ?? "")
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
