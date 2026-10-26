import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { commonTitleText } from "../utils/common-value-text.ts"

/** Only `accTitle` participates; diagram-level titles are not drawn. */
export const eventmodelingNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` that replaces the accessible title set before it.",
      recommended: true,
      url: ruleDocsUrl("eventmodeling-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the accessible title set on line {{line}} with the one of this `accTitle`.",
    },
  },
  create(context) {
    let previous: { value: string; line: number } | null = null
    return {
      EventmodelingAccTitleStatement(node) {
        const value = commonTitleText(node.value?.value ?? "")
        if (
          previous !== null &&
          previous.value !== "" &&
          previous.value !== value
        ) {
          context.report({
            node,
            messageId: "duplicate",
            data: { line: String(previous.line) },
          })
        }
        previous = { value, line: node.loc.start.line }
      },
    }
  },
}
