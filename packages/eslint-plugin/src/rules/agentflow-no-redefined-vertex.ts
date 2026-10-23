import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { agentflowElementDeclarations } from "../utils/agentflow-elements.ts"

/** Compare each shaped vertex with the fields already written for its id. */
export const agentflowNoRedefinedVertex: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a vertex that replaces the label or the shape written for its id before.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-redefined-vertex"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the {{field}} of `{{id}}` written on line {{line}} with that of this vertex.",
    },
  },
  create(context) {
    return agentflowElementDeclarations({
      vertex(node, id, replacement) {
        context.report({
          node,
          messageId: "redefined",
          data: {
            id,
            field: replacement.field,
            line: String(replacement.previous.line),
          },
        })
      },
    })
  },
}
