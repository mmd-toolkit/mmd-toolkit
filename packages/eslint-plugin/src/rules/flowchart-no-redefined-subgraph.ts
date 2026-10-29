import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"
import { flowchartLabelText } from "../utils/flowchart-labels.ts"
import { subgraphIdsOf } from "../utils/subgraph-ids.ts"

/** The first completed declaration supplies the title when an id's members are merged. */
export const flowchartNoRedefinedSubgraph: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a subgraph declaration whose title differs from the title kept for its id.",
      recommended: true,
      url: ruleDocsUrl("flowchart-no-redefined-subgraph"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js keeps the title of the first `subgraph` with id `{{id}}` and ignores this one.",
    },
  },
  create(context) {
    const ids = subgraphIdsOf(context.sourceCode)
    const titles = new Map<string, string>()
    return {
      "FlowchartSubgraphStatement:exit"(node) {
        const writtenId = ids.get(node)
        if (writtenId === undefined) return
        const id = normalizeLineTerminators(writtenId)
        const first = titles.get(id)
        if (first === undefined) {
          titles.set(id, flowchartLabelText(node.title ?? node.name))
        } else if (
          node.title !== null &&
          first !== flowchartLabelText(node.title)
        ) {
          context.report({
            node: node.title,
            messageId: "redefined",
            data: { id },
          })
        }
      },
    }
  },
}
