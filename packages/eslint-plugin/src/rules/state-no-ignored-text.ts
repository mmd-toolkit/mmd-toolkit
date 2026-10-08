import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `state-no-ignored-text`, described in
 * `docs/rules/state-no-ignored-text.md`: every `StateIgnoredText` and every
 * `StateIgnoredStatement`, at any depth of the tree, except the `textAfter` of
 * a direction statement that starts with `%%`: the author means it as a
 * comment, and mermaid.js drops it as meant.
 */
export const stateNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "onDirectionLine" | "ignoredText" | "ignoredStatement"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow text that mermaid.js does not read.",
      recommended: true,
      url: ruleDocsUrl("state-no-ignored-text"),
    },
    schema: [],
    messages: {
      onDirectionLine:
        "mermaid.js reads this whole line as a direction statement and drops `{{text}}`.",
      ignoredText: "mermaid.js does not read `{{text}}` and drops it.",
      ignoredStatement:
        "mermaid.js does not read the empty strings `{{text}}` and drops them.",
    },
  },
  create(context) {
    return {
      StateIgnoredText(node, parent) {
        if (parent?.type === "StateDirectionStatement") {
          if (parent.textAfter === node && node.value.startsWith("%%")) return
          context.report({
            node,
            messageId: "onDirectionLine",
            data: { text: node.value },
          })
          return
        }
        context.report({
          node,
          messageId: "ignoredText",
          data: { text: node.value },
        })
      },
      StateIgnoredStatement(node) {
        context.report({
          node,
          messageId: "ignoredStatement",
          data: { text: node.value },
        })
      },
    }
  },
}
