import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { blockHoldsComment } from "../utils/description-block.ts"

/**
 * The rule `sequence-no-empty-description-block`, described in
 * `docs/rules/sequence-no-empty-description-block.md`: a closed
 * `accDescr { }` block that holds nothing or only whitespace, which the tree
 * shows as a closed `SequenceAccDescrBlockStatement` without a value, wherever
 * it stands, also on the line of another statement and in the body of a box. A
 * block that holds only comments is meant to do nothing, and is not reported.
 */
export const sequenceNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("sequence-no-empty-description-block"),
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
      SequenceAccDescrBlockStatement(node) {
        if (!node.closed || node.value !== null) return
        if (blockHoldsComment(sourceCode, node)) return
        context.report({ node, messageId: "empty" })
      },
    }
  },
}
