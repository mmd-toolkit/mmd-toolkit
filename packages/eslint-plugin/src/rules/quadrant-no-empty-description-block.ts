import { emptyBlockRemovalSuggestions } from "../utils/description-block-suggestions.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { blockHoldsComment } from "../utils/description-block.ts"

/**
 * The rule `quadrant-no-empty-description-block`, described in
 * `docs/rules/quadrant-no-empty-description-block.md`: a description block
 * without a value, also before or after a point on its line. Comments mark
 * an intentional empty block; directives do not provide description text.
 */
export const quadrantNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty" | "removeBlock"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a description block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-empty-description-block"),
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
      QuadrantAccDescrBlockStatement(node) {
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
