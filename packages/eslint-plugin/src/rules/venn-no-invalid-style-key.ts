import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { VENN_STYLE_KEYS } from "../utils/venn-styles.ts"

/** Check every written key, including repeats and keys on undeclared targets. */
export const vennNoInvalidStyleKey: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "invalid"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a style property that the drawing does not read.",
      recommended: true,
      url: ruleDocsUrl("venn-no-invalid-style-key"),
    },
    schema: [],
    messages: {
      invalid:
        "mermaid.js does not read the style property `{{name}}` in the drawing.",
    },
  },
  create(context) {
    return {
      VennStyleProperty(node) {
        if (VENN_STYLE_KEYS.has(node.key.name)) return
        context.report({
          node: node.key,
          messageId: "invalid",
          data: { name: node.key.name },
        })
      },
    }
  },
}
