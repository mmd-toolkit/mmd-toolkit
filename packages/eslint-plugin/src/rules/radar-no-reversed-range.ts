import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { MermaidSourceCode } from "../source-code.ts"
import type { RadarMaxOption, RadarMinOption } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { radarAxesOf, radarCurveIsDrawn } from "../utils/radar-axes.ts"

/** Exchange the authored values of the final bounds, keeping their option keywords. */
function rangeSuggestions(
  sourceCode: MermaidSourceCode,
  min: RadarMinOption,
  max: RadarMaxOption,
): SuggestedEdit<"swapRange">[] {
  if (
    !canEditRange(sourceCode, min.value.range) ||
    !canEditRange(sourceCode, max.value.range) ||
    !canCompactRange(sourceCode, min.value.range) ||
    !canCompactRange(sourceCode, max.value.range)
  )
    return []
  return [
    {
      messageId: "swapRange",
      fix: (fixer) => [
        fixer.replaceText(min.value, sourceCode.getText(max.value)),
        fixer.replaceText(max.value, sourceCode.getText(min.value)),
      ],
    },
  ]
}

/** Only the final written bounds determine the range; automatic max is outside the rule. */
export const radarNoReversedRange: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "reversed" | "swapRange"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a `min` above the `max` of a diagram.",
      recommended: true,
      url: ruleDocsUrl("radar-no-reversed-range"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      swapRange: "Swap the final `min` and `max` values.",
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
            suggest: rangeSuggestions(context.sourceCode, min, max),
          })
        }
      },
    }
  },
}
