import type { RadarMaxOption, RadarMinOption } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { radarAxesOf, radarCurveIsDrawn } from "../utils/radar-axes.ts"

/** Only the final written bounds determine the range; automatic max is outside the rule. */
export const radarNoReversedRange: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "reversed"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a `min` above the `max` of a diagram.",
      recommended: true,
      url: ruleDocsUrl("radar-no-reversed-range"),
    },
    schema: [],
    messages: {
      reversed:
        "mermaid.js draws every point of every curve on the outer ring: the final `min` is above the final `max`.",
    },
  },
  create(context) {
    return {
      RadarDiagram(node) {
        const axes = radarAxesOf(node)
        let min: RadarMinOption | null = null
        let max: RadarMaxOption | null = null
        let hasDrawnCurve = false
        for (const statement of node.body) {
          if (statement.type === "RadarOptionsStatement") {
            for (const option of statement.options) {
              if (option.type === "RadarMinOption") min = option
              else if (option.type === "RadarMaxOption") max = option
            }
          } else if (statement.type === "RadarCurveStatement") {
            hasDrawnCurve ||= statement.curves.some((curve) =>
              radarCurveIsDrawn(curve, axes),
            )
          }
        }
        if (
          min !== null &&
          max !== null &&
          hasDrawnCurve &&
          min.value.value > max.value.value
        ) {
          context.report({
            node: min.range[0] > max.range[0] ? min : max,
            messageId: "reversed",
          })
        }
      },
    }
  },
}
