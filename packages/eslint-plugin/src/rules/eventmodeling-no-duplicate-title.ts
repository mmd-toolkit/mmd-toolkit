import type { EventmodelingAccTitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { commonTitleText } from "../utils/common-value-text.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { MermaidSourceCode } from "../source-code.ts"
import { eventmodelingRemovalRange } from "../utils/eventmodeling-removals.ts"

/** Remove either eligible setter, retaining other statements on an inline setter's line. */
function statementRemovals(
  sourceCode: MermaidSourceCode,
  node: EventmodelingAccTitleStatement,
  previous: EventmodelingAccTitleStatement,
  canRemovePrevious: boolean,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const choices: {
    node: EventmodelingAccTitleStatement
    messageId: "removeThis" | "removePrevious"
  }[] = [{ node, messageId: "removeThis" }]
  if (canRemovePrevious)
    choices.push({ node: previous, messageId: "removePrevious" })
  const suggestions: SuggestedEdit<"removeThis" | "removePrevious">[] = []
  for (const choice of choices) {
    const range = eventmodelingRemovalRange(sourceCode, choice.node)
    if (range !== null)
      suggestions.push({
        messageId: choice.messageId,
        fix: (fixer) => fixer.removeRange(range),
      })
  }
  return suggestions
}

/** Only `accTitle` participates; diagram-level titles are not drawn. */
export const eventmodelingNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` that replaces the accessible title set before it.",
      recommended: true,
      url: ruleDocsUrl("eventmodeling-no-duplicate-title"),
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
      node: EventmodelingAccTitleStatement
      value: string
      beforeValue: string | null
    } | null = null
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
            suggest: statementRemovals(
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
