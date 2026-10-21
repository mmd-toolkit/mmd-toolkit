import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `class-no-ignored-text`, described in
 * `docs/rules/class-no-ignored-text.md`: each `ClassIgnoredText`, the text on a
 * direction line before `direction` or after its value, and the parts of a
 * method line that mermaid.js does not read. The `textAfter` of a direction
 * statement that starts with `%%` is not reported: the author means it as a
 * comment, and mermaid.js drops it as meant.
 */
export const classNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "onDirectionLine" | "onMethodLine"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow text that mermaid.js drops.",
      recommended: true,
      url: ruleDocsUrl("class-no-ignored-text"),
    },
    schema: [],
    messages: {
      onDirectionLine:
        "mermaid.js reads this whole line as a direction statement and drops `{{text}}`.",
      onMethodLine:
        "mermaid.js reads only a part of this method line and drops `{{text}}`.",
    },
  },
  create(context) {
    return {
      ClassIgnoredText(node, parent) {
        if (parent?.type === "ClassMethod") {
          context.report({
            node,
            messageId: "onMethodLine",
            data: { text: node.value },
          })
          return
        }
        if (
          parent?.type === "ClassDirectionStatement" &&
          parent.textAfter === node &&
          node.value.startsWith("%%")
        ) {
          return
        }
        context.report({
          node,
          messageId: "onDirectionLine",
          data: { text: node.value },
        })
      },
    }
  },
}
