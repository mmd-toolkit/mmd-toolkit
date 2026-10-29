import type {
  UsecaseAccDescrBlockStatement,
  UsecaseAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrText } from "../utils/acc-text.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/** Both statement forms set a description, including an empty one. */
type DescriptionStatement =
  UsecaseAccDescrStatement | UsecaseAccDescrBlockStatement

/** Compare descriptions, leaving empty blocks to the empty-block rule. */
export const usecaseNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` that replaces the description set before it.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-duplicate-description"),
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

    /** Empty blocks still reset the history, although another rule reports them. */
    function check(node: DescriptionStatement): void {
      const value = accDescrText(node).trim()
      const emptyBlock =
        node.type === "UsecaseAccDescrBlockStatement" &&
        isEmptyDescriptionBlock(context.sourceCode, node)
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
      UsecaseAccDescrStatement: check,
      UsecaseAccDescrBlockStatement: check,
    }
  },
}
