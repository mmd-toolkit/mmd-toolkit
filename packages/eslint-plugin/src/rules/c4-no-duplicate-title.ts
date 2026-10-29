import type { C4TitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** An accTitle setter interrupts comparison between ordinary title setters. */
export const c4NoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a title statement that replaces a different title set by another title statement.",
      recommended: true,
      url: ruleDocsUrl("c4-no-duplicate-title"),
    },

    schema: [],
    messages: {
      duplicate: "mermaid.js replaces the earlier title with this `title`.",
    },
  },
  create(context) {
    let previous: C4TitleStatement | null = null

    return {
      C4TitleStatement(node) {
        if (previous !== null && previous.value.value !== node.value.value) {
          context.report({
            node,
            messageId: "duplicate",
          })
        }

        previous = node
      },
      C4AccTitleStatement() {
        previous = null
      },
    }
  },
}
