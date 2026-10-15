import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Whether `text` starts with a comment mark of a requirement diagram: `%%`, `%`, or `#`. */
function startsComment(text: string): boolean {
  return text.startsWith("%") || text.startsWith("#")
}

/**
 * The rule `requirement-no-ignored-text`, described in
 * `docs/rules/requirement-no-ignored-text.md`: the text on a direction line
 * before `direction` or after its value, a `RequirementIgnoredText` of a
 * `RequirementDirectionStatement`. The `textAfter` that starts with a comment
 * mark (`%%`, `%`, or `#`) is not reported: the author means it as a comment,
 * and mermaid.js drops it as meant. The text before `direction` is reported,
 * because a line commented out with `#` or `%` still sets the direction. The
 * `RequirementIgnoredText` in the body of a requirement or an
 * element is an empty description block, which
 * `requirement-no-empty-description-block` reports.
 */
export const requirementNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "onDirectionLine"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow text that mermaid.js does not read.",
      recommended: true,
      url: ruleDocsUrl("requirement-no-ignored-text"),
    },
    schema: [],
    messages: {
      onDirectionLine:
        "mermaid.js reads this whole line as a direction statement and drops `{{text}}`.",
    },
  },
  create(context) {
    return {
      RequirementIgnoredText(node, parent) {
        if (parent?.type !== "RequirementDirectionStatement") return
        if (parent.textAfter === node && startsComment(node.value)) return
        context.report({
          node,
          messageId: "onDirectionLine",
          data: { text: node.value },
        })
      },
    }
  },
}
