import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isIgnoredDirectionText } from "../utils/direction-text.ts"

/**
 * The rule `flowchart-no-ignored-text`, described in
 * `docs/rules/flowchart-no-ignored-text.md`: text on a direction line before
 * `direction` or after the direction value, which the tree shows as the
 * `textBefore` and the `textAfter` of a `FlowchartDirectionStatement`. Text
 * that is only `;` and whitespace, and text after the value that starts with
 * `%%`, are not reported (see `isIgnoredDirectionText`).
 */
export const flowchartNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow text on a direction line that mermaid.js drops.",
      recommended: true,
      url: ruleDocsUrl("flowchart-no-ignored-text"),
    },

    schema: [],
    messages: {
      ignored:
        "mermaid.js reads this line as a `direction` statement and drops this text.",
    },
  },
  create(context) {
    return {
      FlowchartDirectionStatement(node) {
        for (const [text, side] of [
          [node.textBefore, "before"],
          [node.textAfter, "after"],
        ] as const) {
          if (text !== null && isIgnoredDirectionText(text.value, side))
            context.report({ node: text, messageId: "ignored" })
        }
      },
    }
  },
}
