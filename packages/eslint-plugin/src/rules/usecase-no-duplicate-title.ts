import type { UsecaseAccTitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators, titleText } from "../utils/acc-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/** Compare each title with the last written title, including an empty one. */
export const usecaseNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` that replaces the title set before it.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-duplicate-title"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier title with the one of this `accTitle`.",
      removeThis: "Remove this `accTitle` statement.",
      removePrevious: "Remove the earlier `accTitle` statement.",
    },
  },
  create(context) {
    let previous: {
      node: UsecaseAccTitleStatement
      value: string
      beforeValue: string | null
    } | null = null
    return {
      UsecaseAccTitleStatement(node) {
        const value = normalizeLineTerminators(titleText(node)).trim()
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
