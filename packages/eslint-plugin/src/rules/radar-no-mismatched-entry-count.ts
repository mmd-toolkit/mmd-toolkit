import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { radarAxesOf, radarCurveIsDrawn } from "../utils/radar-axes.ts"
import type { RadarAxes } from "../utils/radar-axes.ts"

/** Every written axis counts, including repeated ids and forward declarations. */
export const radarNoMismatchedEntryCount: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "mismatched"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a curve of values without axes whose count differs from the count of the axes.",
      recommended: true,
      url: ruleDocsUrl("radar-no-mismatched-entry-count"),
    },
    schema: [],
    messages: {
      mismatched:
        "mermaid.js does not draw curve `{{name}}`: it has {{entries}} {{valueWord}}, but the diagram has {{axes}} {{axisWord}}.",
    },
  },
  create(context) {
    let axes: RadarAxes = { count: 0, names: new Set() }
    return {
      RadarDiagram(node) {
        axes = radarAxesOf(node)
      },
      RadarCurve(node) {
        if (
          node.entries[0].type === "RadarNumberEntry" &&
          !radarCurveIsDrawn(node, axes)
        ) {
          context.report({
            node,
            messageId: "mismatched",
            data: {
              name: node.name.name,
              entries: String(node.entries.length),
              valueWord: node.entries.length === 1 ? "value" : "values",
              axes: String(axes.count),
              axisWord: axes.count === 1 ? "axis" : "axes",
            },
          })
        }
      },
    }
  },
}
