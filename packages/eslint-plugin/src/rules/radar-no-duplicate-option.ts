import type { RadarOption } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Each option replaces its previous value, across groups and statements. */
export const radarNoDuplicateOption: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an option that replaces the value of the same option before it.",
      recommended: true,
      url: ruleDocsUrl("radar-no-duplicate-option"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier `{{name}}` value with this value.",
    },
  },
  create(context) {
    const previous = new Map<string, string | number>()

    /** Compare the effective value; ticks alone has a ceiling of 32. */
    function check(
      node: RadarOption,
      name: string,
      value: string | number,
    ): void {
      const before = previous.get(name)
      if (before !== undefined && before !== value) {
        context.report({
          node,
          messageId: "duplicate",
          data: { name },
        })
      }
      previous.set(name, value)
    }

    return {
      RadarShowLegendOption(node) {
        check(node, "showLegend", node.value)
      },
      RadarTicksOption(node) {
        check(node, "ticks", Math.min(node.value.value, 32))
      },
      RadarMaxOption(node) {
        check(node, "max", node.value.value)
      },
      RadarMinOption(node) {
        check(node, "min", node.value.value)
      },
      RadarGraticuleOption(node) {
        check(node, "graticule", node.value)
      },
    }
  },
}
