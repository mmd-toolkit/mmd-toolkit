import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"

/** Keep the first numeric value of each written label throughout the diagram. */
export const pieNoDuplicateLabel: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a section whose label an earlier section has, with another value.",
      recommended: true,
      url: ruleDocsUrl("pie-no-duplicate-label"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js keeps the value of the first section with this label and ignores this value.",
    },
  },
  create(context) {
    const sections = new Map<string, number>()
    return {
      PieSectionStatement(node) {
        const label = normalizeLineTerminators(node.label.value)
        const previous = sections.get(label)
        if (previous === undefined) {
          sections.set(label, node.value.value)
        } else if (previous !== node.value.value) {
          context.report({
            node,
            messageId: "duplicate",
          })
        }
      },
    }
  },
}
