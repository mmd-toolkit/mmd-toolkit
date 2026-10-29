import type { AgentflowLabel } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { agentflowLabelText } from "../utils/agentflow-names.ts"
import { agentflowFlowDeclarations } from "../utils/agentflow-flows.ts"

/** A flow sets a nonempty written title when its closing end is reached. */
export const agentflowNoRedefinedFlow: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a flow declaration that replaces the title written for its id before.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-redefined-flow"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the title of flow `{{id}}` written earlier with this title.",
    },
  },
  create(context) {
    const titles = new Map<string, AgentflowLabel>()
    return agentflowFlowDeclarations((node, id) => {
      if (node.title === null) return
      const title = agentflowLabelText(node.title)
      if (title === "") return
      const previous = titles.get(id)
      if (previous !== undefined && agentflowLabelText(previous) !== title) {
        context.report({
          node: node.title,
          messageId: "redefined",
          data: { id },
        })
      }
      titles.set(id, node.title)
    })
  },
}
