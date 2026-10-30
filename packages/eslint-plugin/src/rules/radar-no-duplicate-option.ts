import type { SuggestedEdit } from "@eslint/core"
import type { MermaidSourceCode } from "../source-code.ts"
import { commaRemovalRange } from "../utils/comma-parts.ts"
import { removalRange } from "../utils/removal.ts"
import type { RadarOption } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** A sole option goes with its isolated statement; grouped options go with a comma. */
function optionRemovals(
  sourceCode: MermaidSourceCode,
  node: RadarOption,
  previous: RadarOption,
  canRemovePrevious: boolean,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const choices: {
    node: RadarOption
    messageId: "removeThis" | "removePrevious"
  }[] = [{ node, messageId: "removeThis" }]
  if (canRemovePrevious)
    choices.push({ node: previous, messageId: "removePrevious" })
  const suggestions: SuggestedEdit<"removeThis" | "removePrevious">[] = []
  for (const choice of choices) {
    const statement = sourceCode.getParent(choice.node)
    if (statement?.type !== "RadarOptionsStatement") continue
    const range =
      statement.options.length === 1
        ? removalRange(sourceCode, statement)
        : commaRemovalRange(sourceCode, choice.node, statement.options)
    if (range !== null)
      suggestions.push({
        messageId: choice.messageId,
        fix: (fixer) => fixer.removeRange(range),
      })
  }
  return suggestions
}

/** Each option replaces its previous value, across groups and statements. */
export const radarNoDuplicateOption: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an option that replaces the value of the same option before it.",
      recommended: true,
      url: ruleDocsUrl("radar-no-duplicate-option"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this option.",
      removePrevious: "Remove the earlier option.",
      duplicate:
        "mermaid.js replaces the earlier `{{name}}` value with this value.",
    },
  },
  create(context) {
    const previous = new Map<
      string,
      {
        node: RadarOption
        value: string | number
        before: string | number | undefined
      }
    >()

    /** Compare the effective value; ticks alone has a ceiling of 32. */
    function check(
      node: RadarOption,
      name: string,
      value: string | number,
    ): void {
      const before = previous.get(name)
      if (before !== undefined && before.value !== value) {
        context.report({
          node,
          messageId: "duplicate",
          data: { name },
          suggest: optionRemovals(
            context.sourceCode,
            node,
            before.node,
            before.before === undefined || before.before === value,
          ),
        })
      }
      previous.set(name, { node, value, before: before?.value })
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
