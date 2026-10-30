import { emptyBlockRemovalSuggestions } from "../utils/description-block-suggestions.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Empty blocks are statements or erased parts of names and click prefixes. */
export const agentflowNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty" | "removeBlock"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-empty-description-block"),
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
    return {
      AgentflowAccDescrBlockStatement(node) {
        if (node.closed && node.value === null) {
          context.report({
            node,
            messageId: "empty",
            suggest: emptyBlockRemovalSuggestions(context.sourceCode, node),
          })
        }
      },
      AgentflowIgnoredText(node) {
        if (node.kind === "empty-description-block") {
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
