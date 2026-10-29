import type { VennTitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/** Compare each title with the last title statement, retaining written padding. */
export const vennNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a title that replaces a different title.",
      recommended: true,
      url: ruleDocsUrl("venn-no-duplicate-title"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      duplicate: "mermaid.js replaces the earlier title with this title.",
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement that sets the title.",
    },
  },
  create(context) {
    let previous: {
      node: VennTitleStatement
      value: string
      beforeValue: string | null
    } | null = null
    return {
      VennTitleStatement(node) {
        const text = normalizeLineTerminators(node.value.value)
        if (previous !== null && previous.value !== text) {
          context.report({
            node,
            messageId: "duplicate",
            suggest: oneOfTwoRemovals(
              context.sourceCode,
              node,
              previous.node,
              previous.beforeValue === null || previous.beforeValue === text,
            ),
          })
        }
        previous = { node, value: text, beforeValue: previous?.value ?? null }
      },
    }
  },
}
