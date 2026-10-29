import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `quadrant-no-redefined-quadrant`, described in
 * `docs/rules/quadrant-no-redefined-quadrant.md`: a later statement that
 * replaces a nonempty text of its quadrant. The label value already leaves
 * out quotes and backquotes; mermaid.js also trims the text at its ends.
 * Statements of the other quadrants do not change the value being compared.
 */
export const quadrantNoRedefinedQuadrant: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a quadrant statement that replaces the text of its quadrant.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-redefined-quadrant"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the text of `quadrant-{{quadrant}}`, set earlier, with the one of this statement.",
    },
  },
  create(context) {
    const texts = new Map<number, string>()
    return {
      QuadrantQuadrantStatement(node) {
        const value = node.text.value.trim()
        const earlier = texts.get(node.quadrant)
        if (earlier !== undefined && earlier !== "" && earlier !== value) {
          context.report({
            node,
            messageId: "redefined",
            data: {
              quadrant: String(node.quadrant),
            },
          })
        }
        texts.set(node.quadrant, value)
      },
    }
  },
}
