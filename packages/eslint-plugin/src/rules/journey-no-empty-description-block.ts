import { emptyBlockRemovalSuggestions } from "../utils/description-block-suggestions.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { blockHoldsComment } from "../utils/description-block.ts"

/**
 * The rule `journey-no-empty-description-block`, described in
 * `docs/rules/journey-no-empty-description-block.md`: an `accDescr { }` block
 * that holds nothing or only whitespace, which the tree shows as a
 * `JourneyAccDescrBlockStatement` without a value, wherever it stands as a
 * statement, also on the line of another statement. A block that holds only
 * comments is meant to do nothing, and is not reported. A block inside the text
 * of a title, a section, or a task is part of that text, and the tree has no
 * statement there.
 */
export const journeyNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty" | "removeBlock"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("journey-no-empty-description-block"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      empty:
        "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
      removeBlock: "Remove the empty block.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      JourneyAccDescrBlockStatement(node) {
        if (node.value !== null) return
        if (blockHoldsComment(sourceCode, node)) return
        context.report({
          node,
          messageId: "empty",
          suggest: emptyBlockRemovalSuggestions(context.sourceCode, node),
        })
      },
    }
  },
}
