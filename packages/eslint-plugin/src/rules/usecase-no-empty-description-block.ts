import { emptyBlockRemovalSuggestions } from "../utils/description-block-suggestions.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"

/** Empty blocks set the empty description; comment-only blocks are placeholders. */
export const usecaseNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty" | "removeBlock"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-empty-description-block"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      empty:
        "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
      removeBlock: "Remove the empty block.",
    },
  },
  create(context) {
    return {
      UsecaseAccDescrBlockStatement(node) {
        if (isEmptyDescriptionBlock(context.sourceCode, node)) {
          context.report({
            node,
            messageId: "empty",
            suggest: emptyBlockRemovalSuggestions(context.sourceCode, node),
          })
        }
      },
    }
  },
}
