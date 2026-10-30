import type {
  WardleyAccDescrBlockStatement,
  WardleyAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"
import {
  descriptionBlockText,
  descriptionLineText,
} from "../utils/common-value-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/** A statement that sets the diagram's description. */
type DescriptionStatement =
  WardleyAccDescrStatement | WardleyAccDescrBlockStatement

/** Line and block statements share one replacement history. */
export const wardleyNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` that replaces the description set before it.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-duplicate-description"),
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
    }

    return {
      WardleyAccDescrStatement(node) {
        check(node, descriptionLineText(node.value?.value ?? ""), false)
      },
      WardleyAccDescrBlockStatement(node) {
        check(
          node,
          descriptionBlockText(node.value?.value ?? ""),
          isEmptyDescriptionBlock(context.sourceCode, node),
        )
      },
    }
  },
}
