import type { XychartXAxisStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `xychart-no-extra-value`, described in
 * `docs/rules/xychart-no-extra-value.md`: each value beyond the categories of
 * the last x-axis statement with data, only in plots after that statement.
 * A title-only axis keeps the data; a range has no categories to check.
 * Values include their labels, so a report covers the number and its label.
 */
export const xychartNoExtraValue: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "extra"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a value of a plot beyond the categories of the x axis.",
      recommended: true,
      url: ruleDocsUrl("xychart-no-extra-value"),
    },
    schema: [],
    messages: {
      extra:
        "mermaid.js drops this value because it has no category on the x axis.",
    },
  },
  create(context) {
    return {
      XychartDiagram(node) {
        let lastAxis: XychartXAxisStatement | null = null
        for (const statement of node.body) {
          if (
            statement.type === "XychartXAxisStatement" &&
            statement.data !== null
          ) {
            lastAxis = statement
          }
        }
        if (lastAxis === null || lastAxis.data?.type !== "XychartBand") return
        const count = lastAxis.data.categories.length
        for (const statement of node.body) {
          if (
            statement.type !== "XychartPlotStatement" ||
            statement.range[0] < lastAxis.range[1]
          ) {
            continue
          }
          for (const value of statement.values.slice(count)) {
            context.report({ node: value, messageId: "extra" })
          }
        }
      },
    }
  },
}
