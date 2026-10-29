import type {
  EventmodelingAccDescrBlockStatement,
  EventmodelingAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"
import { descriptionBlockText } from "../utils/common-value-text.ts"

/** Compare the words of both forms; eventmodeling also trims LS/PS line edges in the line form. */
export const eventmodelingNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` that replaces the description set before it.",
      recommended: true,
      url: ruleDocsUrl("eventmodeling-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier description with the one of this `accDescr`.",
    },
  },
  create(context) {
    let previous: string | null = null

    /** Empty blocks reset history, but their report belongs to the empty-block rule. */
    function check(
      node:
        EventmodelingAccDescrStatement | EventmodelingAccDescrBlockStatement,
      value: string,
      emptyBlock: boolean,
    ): void {
      if (
        !emptyBlock &&
        previous !== null &&
        previous !== "" &&
        previous !== value
      ) {
        context.report({
          node,
          messageId: "duplicate",
        })
      }
      previous = value
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
