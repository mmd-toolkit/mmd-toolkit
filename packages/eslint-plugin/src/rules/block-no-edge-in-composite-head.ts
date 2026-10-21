import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Reports a composite head with links once, regardless of its link count. */
export const blockNoEdgeInCompositeHead: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "edge"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a link in the head of a composite block.",
      recommended: true,
      url: ruleDocsUrl("block-no-edge-in-composite-head"),
    },
    schema: [],
    messages: {
      edge: "mermaid.js gives this composite no id and loses the links and blocks written in its head.",
    },
  },
  create(context) {
    return {
      BlockCompositeStatement(node) {
        if (node.head !== null && node.head.links.length > 0) {
          context.report({ node: node.head, messageId: "edge" })
        }
      },
    }
  },
}
