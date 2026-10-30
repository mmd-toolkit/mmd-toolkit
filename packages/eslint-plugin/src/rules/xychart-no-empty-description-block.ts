import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { blockHoldsComment } from "../utils/description-block.ts"

/**
 * The rule `xychart-no-empty-description-block`, described in
 * `docs/rules/xychart-no-empty-description-block.md`: a closed description
 * block without a value, also on the line of another statement. A block with
 * only comments is intentional and is not reported; a directive is no text.
 * Unclosed blocks are reported by `xychart-no-unclosed-description-block`.
 */
export const xychartNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a description block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("xychart-no-empty-description-block"),
    },

    schema: [],
    messages: {
      empty:
        "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      XychartAccDescrBlockStatement(node) {
        if (!node.closed || node.value !== null) return
        if (blockHoldsComment(sourceCode, node)) return
        context.report({
          node,
          messageId: "empty",
        })
      },
    }
  },
}
