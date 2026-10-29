import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { agentflowElementDeclarations } from "../utils/agentflow-elements.ts"

/** Compare connector declarations with the shared vertex/connector history. */
export const agentflowNoRedefinedConnector: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a connector declaration that replaces the title or the vertex written for its id before.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-redefined-connector"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the {{field}} of `{{id}}` written earlier with that of this connector.",
    },
  },
  create(context) {
    return agentflowElementDeclarations({
      connector(node, id, field) {
        context.report({
          node,
          messageId: "redefined",
          data: {
            id,
            field,
          },
        })
      },
    })
  },
}
