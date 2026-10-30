import type { RadarNamedEntry } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { radarAxesOf } from "../utils/radar-axes.ts"

/** Each curve keeps the first numeric value of each declared axis. */
export const radarNoDuplicateEntry: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an entry of a curve that gives another value for an axis that an earlier entry of the curve has.",
      recommended: true,
      url: ruleDocsUrl("radar-no-duplicate-entry"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js uses the first value for axis `{{name}}` in this curve, and drops this value.",
    },
  },
  create(context) {
    let names: ReadonlySet<string> = new Set()
    return {
      RadarDiagram(node) {
        names = radarAxesOf(node).names
      },
      RadarCurve(node) {
        const first = new Map<string, RadarNamedEntry>()
        for (const entry of node.entries) {
          if (entry.type !== "RadarNamedEntry" || !names.has(entry.axis.name)) {
            continue
          }
          const previous = first.get(entry.axis.name)
          if (previous === undefined) {
            first.set(entry.axis.name, entry)
          } else if (previous.value.value !== entry.value.value) {
            context.report({
              node: entry,
              messageId: "duplicate",
              data: {
                name: entry.axis.name,
              },
            })
          }
        }
      },
    }
  },
}
