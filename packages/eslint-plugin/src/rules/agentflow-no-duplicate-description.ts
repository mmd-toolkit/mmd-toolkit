import type {
  AgentflowAccDescrBlockStatement,
  AgentflowAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrText } from "../utils/acc-text.ts"

/** A line or a closed, nonempty block that sets the description. */
type DescriptionStatement =
  AgentflowAccDescrStatement | AgentflowAccDescrBlockStatement

/** Compare accessible descriptions in source order, retaining comment text. */
export const agentflowNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` that replaces the description set before it.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier description with the one of this `accDescr`.",
    },
  },
  create(context) {
    let previous: DescriptionStatement | null = null

    /** Count only statements that set a description. */
    function check(node: DescriptionStatement): void {
      if (previous !== null && accDescrText(previous) !== accDescrText(node)) {
        context.report({
          node,
          messageId: "duplicate",
        })
      }
      previous = node
    }

    return {
      AgentflowAccDescrStatement: check,
      AgentflowAccDescrBlockStatement(node) {
        if (node.closed && node.value !== null) check(node)
      },
    }
  },
}
