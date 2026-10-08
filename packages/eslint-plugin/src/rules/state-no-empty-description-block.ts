import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `state-no-empty-description-block`, described in
 * `docs/rules/state-no-empty-description-block.md`: a closed `accDescr { }`
 * block that holds nothing or only whitespace, which the tree shows as a closed
 * `StateAccDescrBlockStatement` without a value, wherever it stands, also on the
 * line of another statement. A block that holds only comments is meant to do
 * nothing, and is not reported. An empty block before the `{` of a body on a
 * later line is part of a `StateIgnoredText`, not a statement.
 */
export const stateNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("state-no-empty-description-block"),
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
      StateAccDescrBlockStatement(node) {
        if (!node.closed || node.value !== null) return
        // The comments that count are those between the `{` and the `}`.
        const opening = sourceCode.getFirstToken(node, {
          filter: (token) => token.type === "Punctuator" && token.value === "{",
        })
        const closing = sourceCode.getLastToken(node)
        if (closing === null || opening === null) return
        if (sourceCode.commentsExistBetween(opening, closing)) return
        context.report({ node, messageId: "empty" })
      },
    }
  },
}
