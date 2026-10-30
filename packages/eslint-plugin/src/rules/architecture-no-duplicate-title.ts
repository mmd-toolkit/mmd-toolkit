import type { ArchitectureAccTitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { commonTitleText } from "../utils/common-value-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/** Only `accTitle` participates; diagram-level titles are not drawn. */
export const architectureNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` that replaces the title set before it.",
      recommended: true,
      url: ruleDocsUrl("architecture-no-duplicate-title"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier accessible title with the one of this `accTitle`.",
      removeThis: "Remove this `accTitle` statement.",
      removePrevious: "Remove the earlier `accTitle` statement.",
    },
  },
  create(context) {
    let previous: {
      node: ArchitectureAccTitleStatement
      value: string
      beforeValue: string | null
    } | null = null
    return {
      ArchitectureAccTitleStatement(node) {
        const value = commonTitleText(node.value?.value ?? "")
        if (
          previous !== null &&
          previous.value !== "" &&
          previous.value !== value
        ) {
          context.report({
            node,
            messageId: "duplicate",
            suggest: oneOfTwoRemovals(
              context.sourceCode,
              node,
              previous.node,
              previous.beforeValue === null ||
                previous.beforeValue === "" ||
                previous.beforeValue === value,
            ),
          })
        }
        previous = { node, value, beforeValue: previous?.value ?? null }
      },
    }
  },
}
