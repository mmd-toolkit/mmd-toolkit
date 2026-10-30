import { emptyBlockRemovalSuggestions } from "../utils/description-block-suggestions.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { blockHoldsComment } from "../utils/description-block.ts"

/**
 * The rule `er-no-empty-description-block`, described in
 * `docs/rules/er-no-empty-description-block.md`: an `accDescr { }` block that
 * holds nothing or only whitespace, which the tree shows as an
 * `ErAccDescrBlockStatement` without a value (a block is always closed),
 * wherever it stands, also on the line of another statement and at the start
 * of a subgraph. A block that holds only comments is meant to do nothing, and
 * is not reported.
 */
export const erNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty" | "removeBlock"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("er-no-empty-description-block"),
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
      ErAccDescrBlockStatement(node) {
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
