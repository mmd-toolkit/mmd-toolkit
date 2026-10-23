import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `sequence-no-ignored-text`, described in
 * `docs/rules/sequence-no-ignored-text.md`: each `SequenceIgnoredStatement`,
 * a character that stands where a statement starts, starts none, and is
 * dropped by mermaid.js.
 */
export const sequenceNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a line that mermaid.js reads as nothing.",
      recommended: true,
      url: ruleDocsUrl("sequence-no-ignored-text"),
    },
    schema: [],
    messages: {
      ignored: "mermaid.js reads `{{text}}` as no statement and drops it.",
    },
  },
  create(context) {
    return {
      SequenceIgnoredStatement(node) {
        context.report({
          node,
          messageId: "ignored",
          data: { text: node.value },
        })
      },
    }
  },
}
