import type {
  EventmodelingAccDescrBlockStatement,
  EventmodelingAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"
import { descriptionBlockText } from "../utils/common-value-text.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { MermaidSourceCode } from "../source-code.ts"
import { eventmodelingRemovalRange } from "../utils/eventmodeling-removals.ts"

/** A statement that sets the diagram's description. */
type DescriptionStatement =
  EventmodelingAccDescrStatement | EventmodelingAccDescrBlockStatement

/** Remove either eligible setter, retaining other statements on an inline setter's line. */
function statementRemovals(
  sourceCode: MermaidSourceCode,
  node: DescriptionStatement,
  previous: DescriptionStatement,
  canRemovePrevious: boolean,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const choices: {
    node: DescriptionStatement
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

/** Compare the words of both forms; eventmodeling also trims LS/PS line edges in the line form. */
export const eventmodelingNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` that replaces the description set before it.",
      recommended: true,
      url: ruleDocsUrl("eventmodeling-no-duplicate-description"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier description with the one of this `accDescr`.",
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement that sets the description.",
    },
  },
  create(context) {
    let previous: {
      node: DescriptionStatement
      value: string
      beforeValue: string | null
    } | null = null

    /** Empty blocks reset history, but their report belongs to the empty-block rule. */
    function check(
      node: DescriptionStatement,
      value: string,
      emptyBlock: boolean,
    ): void {
      if (
        !emptyBlock &&
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
    }

    return {
      EventmodelingAccDescrStatement(node) {
        check(node, descriptionBlockText(node.value?.value ?? ""), false)
      },
      EventmodelingAccDescrBlockStatement(node) {
        check(
          node,
          descriptionBlockText(node.value?.value ?? ""),
          isEmptyDescriptionBlock(context.sourceCode, node),
        )
      },
    }
  },
}
