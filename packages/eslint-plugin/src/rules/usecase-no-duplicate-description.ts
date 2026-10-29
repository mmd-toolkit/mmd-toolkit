import type {
  UsecaseAccDescrBlockStatement,
  UsecaseAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrText } from "../utils/acc-text.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"

/** Both statement forms set a description, including an empty one. */
type DescriptionStatement =
  UsecaseAccDescrStatement | UsecaseAccDescrBlockStatement

/** Compare descriptions, leaving empty blocks to the empty-block rule. */
export const usecaseNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` that replaces the description set before it.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier description with the one of this `accDescr`.",
    },
  },
  create(context) {
    let previous: string | null = null

    /** Empty blocks still reset the history, although another rule reports them. */
    function check(node: DescriptionStatement): void {
      const value = accDescrText(node).trim()
      const emptyBlock =
        node.type === "UsecaseAccDescrBlockStatement" &&
        isEmptyDescriptionBlock(context.sourceCode, node)
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
      UsecaseAccDescrStatement: check,
      UsecaseAccDescrBlockStatement: check,
    }
  },
}
