import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isCompositeHead } from "../utils/block-declarations.ts"

/**
 * The rule `block-no-edge-chain`: report a statement with two or more links.
 * Composite heads belong to `block-no-edge-in-composite-head` instead.
 */
export const blockNoEdgeChain: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "chain"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an edge statement with more than one link.",
      recommended: true,
      url: ruleDocsUrl("block-no-edge-chain"),
    },
    schema: [],
    messages: {
      chain:
        "mermaid.js keeps only the last link of this chain, with no start; earlier links are lost and their blocks are not declared by this statement.",
    },
  },
  create(context) {
    return {
      BlockNodeStatement(node, parent) {
        if (node.links.length > 1 && !isCompositeHead(node, parent)) {
          context.report({ node, messageId: "chain" })
        }
      },
    }
  },
}
