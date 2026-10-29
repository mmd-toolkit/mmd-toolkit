import type { FlowchartDirectionStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { comparableDirection } from "../utils/direction-text.ts"
import { subgraphIdsOf } from "../utils/subgraph-ids.ts"

/** The first completed subgraph of an id supplies its drawn direction. */
export const flowchartNoDuplicateDirection: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "ignored"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `direction` statement that replaces the direction of its subgraph.",
      recommended: true,
      url: ruleDocsUrl("flowchart-no-duplicate-direction"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier direction for this subgraph with `{{direction}}`.",
      ignored:
        "mermaid.js keeps the direction of the first subgraph `{{id}}` and ignores this `direction {{direction}}`.",
    },
  },
  create(context) {
    const ids = subgraphIdsOf(context.sourceCode)
    const firsts = new Map<string, FlowchartDirectionStatement | null>()
    return {
      "FlowchartSubgraphStatement:exit"(node) {
        const id = ids.get(node)
        if (id === undefined) return
        const first = firsts.get(id)
        let previous: FlowchartDirectionStatement | null = null
        for (const statement of node.body) {
          if (statement.type !== "FlowchartDirectionStatement") continue
          if (
            first !== undefined &&
            (first === null ||
              comparableDirection(first.direction) !==
                comparableDirection(statement.direction))
          ) {
            context.report({
              node: statement,
              messageId: "ignored",
              data: {
                id,
                direction: statement.direction,
              },
            })
          } else if (
            previous !== null &&
            comparableDirection(previous.direction) !==
              comparableDirection(statement.direction)
          ) {
            context.report({
              node: statement,
              messageId: "duplicate",
              data: {
                direction: statement.direction,
              },
            })
          }
          previous = statement
        }
        if (first === undefined) firsts.set(id, previous)
      },
    }
  },
}
