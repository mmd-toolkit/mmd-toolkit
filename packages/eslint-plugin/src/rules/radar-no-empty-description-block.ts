import { emptyBlockRemovalSuggestions } from "../utils/description-block-suggestions.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"

/** A comment inside the braces keeps an otherwise empty block as a placeholder. */
export const radarNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty" | "removeBlock"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("radar-no-empty-description-block"),
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
      RadarAccDescrBlockStatement(node) {
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
