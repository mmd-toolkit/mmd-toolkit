import { directionRemovals } from "../utils/direction-removals.ts"
import type { FlowchartDirectionStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { comparableDirection } from "../utils/direction-text.ts"
import { subgraphIdsOf } from "../utils/subgraph-ids.ts"

/** The first completed subgraph of an id supplies its drawn direction. */
export const flowchartNoDuplicateDirection: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "ignored" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `direction` statement that replaces the direction of its subgraph.",
      recommended: true,
      url: ruleDocsUrl("flowchart-no-duplicate-direction"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this direction statement.",
      removePrevious: "Remove the earlier direction statement.",
      duplicate:
        "mermaid.js replaces the earlier direction for this subgraph with `{{direction}}`.",
      ignored:
        "mermaid.js keeps the direction of the first subgraph `{{id}}` and ignores this `direction {{direction}}`.",
    },
  },
  create(context) {
    const ids = subgraphIdsOf(context.sourceCode)
    const firsts = new Map<
      string,
      {
        node: FlowchartDirectionStatement | null
        before: FlowchartDirectionStatement | null
      }
    >()
    return {
      "FlowchartSubgraphStatement:exit"(node) {
        const id = ids.get(node)
        if (id === undefined) return
        const first = firsts.get(id)
        let before: FlowchartDirectionStatement | null = null
        let previous: FlowchartDirectionStatement | null = null
        for (const statement of node.body) {
          if (statement.type !== "FlowchartDirectionStatement") continue
          if (
            first !== undefined &&
            (first.node === null ||
              comparableDirection(first.node.direction) !==
                comparableDirection(statement.direction))
          ) {
            context.report({
              node: statement,
              messageId: "ignored",
              suggest: directionRemovals(
                context.sourceCode,
                statement,
                first.node,
                first.node !== null &&
                  first.before !== null &&
                  comparableDirection(first.before.direction) ===
                    comparableDirection(statement.direction) &&
                  (previous === null ||
                    comparableDirection(previous.direction) ===
                      comparableDirection(statement.direction)),
              ),
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
              suggest: directionRemovals(
                context.sourceCode,
                statement,
                previous,
                before === null ||
                  comparableDirection(before.direction) ===
                    comparableDirection(statement.direction),
              ),
              data: {
                direction: statement.direction,
              },
            })
          }
          before = previous
          previous = statement
        }
        if (first === undefined) firsts.set(id, { node: previous, before })
      },
    }
  },
}
