import type {
  FlowchartDirectionStatement,
  FlowchartSubgraphStatement,
} from "@mmd-toolkit/parser"
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
        "mermaid.js replaces the direction set on line {{line}} for this subgraph with `{{direction}}`.",
      ignored:
        "mermaid.js keeps the direction of subgraph `{{id}}` declared on line {{line}}: this `direction {{direction}}` is lost.",
    },
  },
  create(context) {
    const ids = subgraphIdsOf(context.sourceCode)
    const firsts = new Map<
      string,
      {
        node: FlowchartSubgraphStatement
        direction: FlowchartDirectionStatement | null
      }
    >()
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
            (first.direction === null ||
              comparableDirection(first.direction.direction) !==
                comparableDirection(statement.direction))
          ) {
            context.report({
              node: statement,
              messageId: "ignored",
              data: {
                id,
                line: String(first.node.loc.start.line),
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
                line: String(previous.loc.start.line),
                direction: statement.direction,
              },
            })
          }
          previous = statement
        }
        if (first === undefined) firsts.set(id, { node, direction: previous })
      },
    }
  },
}
