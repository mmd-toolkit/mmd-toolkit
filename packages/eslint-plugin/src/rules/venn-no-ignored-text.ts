import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** The tree gives each swallowed non-whitespace character a node of its own. */
export const vennNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a character that the comment after it removes.",
      recommended: true,
      url: ruleDocsUrl("venn-no-ignored-text"),
    },
    schema: [],
    messages: {
      ignored: "mermaid.js removes this character with the comment after it.",
    },
  },
  create(context) {
    return {
      VennIgnoredText(node) {
        context.report({ node, messageId: "ignored" })
      },
    }
  },
}
