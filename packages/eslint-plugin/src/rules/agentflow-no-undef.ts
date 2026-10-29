import type {
  AgentflowClassStatement,
  AgentflowClickCallbackStatement,
  AgentflowClickUrlStatement,
  AgentflowStyleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"
import { agentflowLinkIdsOf } from "../utils/agentflow-links.ts"
import { agentflowFlowIdsOf } from "../utils/agentflow-flows.ts"
import {
  agentflowConnectorId,
  isAgentflowOrdinaryVertexId,
} from "../utils/agentflow-names.ts"

/** A class or click statement names every nonempty id in its list. */
type IdsStatement =
  | AgentflowClassStatement
  | AgentflowClickCallbackStatement
  | AgentflowClickUrlStatement

/** Collect written declarations diagram-wide, then account for style-created vertices. */
export const agentflowNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "undef"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `style`, `class`, or `click` statement for an id that nothing declares.",
      recommended: true,
      url: ruleDocsUrl("agentflow-no-undef"),
    },
    schema: [],
    messages: {
      undef: "mermaid.js {{effect}} for the undefined id `{{id}}`.",
    },
  },
  create(context) {
    const ids = new Set<string>()
    const styles: AgentflowStyleStatement[] = []
    const statements: IdsStatement[] = []

    /** Save class and click operands until all declarations have been seen. */
    function collect(node: IdsStatement): void {
      statements.push(node)
    }

    return {
      AgentflowDiagram(node) {
        for (const linkIds of agentflowLinkIdsOf(node).values()) {
          for (const id of linkIds) ids.add(id)
        }
        for (const id of agentflowFlowIdsOf(node).values()) ids.add(id)
      },
      AgentflowVertex(node) {
        const id = normalizeLineTerminators(node.id.name)
        if (isAgentflowOrdinaryVertexId(id)) ids.add(id)
      },
      AgentflowConnectorStatement(node) {
        const id = agentflowConnectorId(node.name)
        if (id !== null) ids.add(id)
      },
      AgentflowStyleStatement(node) {
        styles.push(node)
      },
      AgentflowClassStatement: collect,
      AgentflowClickCallbackStatement: collect,
      AgentflowClickUrlStatement: collect,
      "AgentflowDiagram:exit"() {
        for (const style of styles) {
          const id = normalizeLineTerminators(style.id.name)
          if (ids.has(id)) continue
          if (isAgentflowOrdinaryVertexId(id)) ids.add(id)
          context.report({
            node: style.id,
            messageId: "undef",
            data: {
              id,
              effect: isAgentflowOrdinaryVertexId(id)
                ? "adds a new vertex with these styles"
                : "styles no element",
            },
          })
        }
        for (const statement of statements) {
          for (const operand of statement.ids) {
            if (operand === null) continue
            const id = normalizeLineTerminators(operand.name)
            if (!ids.has(id)) {
              context.report({
                node: operand,
                messageId: "undef",
                data: {
                  id,
                  effect:
                    statement.type === "AgentflowClassStatement"
                      ? "gives no element these classes"
                      : "makes no element clickable",
                },
              })
            }
          }
        }
      },
    }
  },
}
