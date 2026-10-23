import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isEmptyUsecaseDescriptionBlock } from "../utils/usecase-description.ts"

/** Empty blocks set the empty description; comment-only blocks are placeholders. */
export const usecaseNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-empty-description-block"),
    },
    schema: [],
    messages: {
      empty:
        "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
    },
  },
  create(context) {
    return {
      UsecaseAccDescrBlockStatement(node) {
        if (isEmptyUsecaseDescriptionBlock(context.sourceCode, node)) {
          context.report({ node, messageId: "empty" })
        }
      },
    }
  },
}
