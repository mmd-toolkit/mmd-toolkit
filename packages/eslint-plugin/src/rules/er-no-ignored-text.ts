import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `er-no-ignored-text`, described in `docs/rules/er-no-ignored-text.md`:
 * every `ErIgnoredText`: the text on a direction line before `direction` or
 * after its value, and the empty backquotes between the attributes of an entity.
 * The `textAfter` of a direction statement that starts with `%%` is not
 * reported: the author means it as a comment, and mermaid.js drops it as meant.
 */
export const erNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "onDirectionLine" | "emptyBackquotes"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow text that mermaid.js drops.",
      recommended: false,
      url: ruleDocsUrl("er-no-ignored-text"),
    },
    schema: [],
    messages: {
      onDirectionLine:
        "mermaid.js reads this whole line as a direction statement and drops `{{text}}`.",
      emptyBackquotes:
        "mermaid.js skips the empty backquotes in this attribute block.",
    },
  },
  create(context) {
    return {
      ErIgnoredText(node, parent) {
        if (parent?.type === "ErDirectionStatement") {
          if (parent.textAfter === node && node.value.startsWith("%%")) return
          context.report({
            node,
            messageId: "onDirectionLine",
            data: { text: node.value },
          })
          return
        }
        context.report({ node, messageId: "emptyBackquotes" })
      },
    }
  },
}
