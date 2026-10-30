import { directionRemovals } from "../utils/direction-removals.ts"
import type { UsecaseDirectionStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { comparableDirection } from "../utils/direction-text.ts"

/** Only written directions take part; the default LR supplies no history. */
export const usecaseNoDuplicateDirection: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `direction` statement that replaces the direction set before it.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-duplicate-direction"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this direction statement.",
      removePrevious: "Remove the earlier direction statement.",
      duplicate:
        "mermaid.js replaces the earlier direction with `{{direction}}`.",
    },
  },
  create(context) {
    let before: UsecaseDirectionStatement | null = null
    let previous: UsecaseDirectionStatement | null = null
    return {
      UsecaseDirectionStatement(node) {
        if (
          previous !== null &&
          comparableDirection(previous.direction) !==
            comparableDirection(node.direction)
        ) {
          context.report({
            node,
            messageId: "duplicate",
            suggest: directionRemovals(
              context.sourceCode,
              node,
              previous,
              before === null ||
                comparableDirection(before.direction) ===
                  comparableDirection(node.direction),
            ),
            data: {
              direction: node.direction,
            },
          })
        }
        before = previous
        previous = node
      },
    }
  },
}
