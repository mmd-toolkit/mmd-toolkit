import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** The current texts of one axis and the lines of the statements that set them. */
interface AxisState {
  start: string
  startLine: number
  end: string
  endLine: number
}

/**
 * The rule `quadrant-no-redefined-axis`, described in
 * `docs/rules/quadrant-no-redefined-axis.md`: a statement that changes a
 * nonempty text of its axis. Every statement sets the first text; only one
 * with an end sets the second. An arrow without an end adds ` ⟶` to the
 * first text. Adding a text where none was set loses nothing.
 */
export const quadrantNoRedefinedAxis: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an axis statement that replaces a text of the axis.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-redefined-axis"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces {{replaced}} of the `{{axis}}` with the values of this statement.",
    },
  },
  create(context) {
    const axes: Record<"x" | "y", AxisState> = {
      x: { start: "", startLine: 0, end: "", endLine: 0 },
      y: { start: "", startLine: 0, end: "", endLine: 0 },
    }
    return {
      QuadrantAxisStatement(node) {
        const current = axes[node.axis]
        const start = (
          node.start.value + (node.arrow && node.end === null ? " ⟶" : "")
        ).trim()
        const end = node.end?.value.trim() ?? null
        const replaced: string[] = []
        if (current.start !== "" && current.start !== start) {
          replaced.push(`the first text set on line ${current.startLine}`)
        }
        if (end !== null && current.end !== "" && current.end !== end) {
          replaced.push(`the second text set on line ${current.endLine}`)
        }
        if (replaced.length > 0) {
          context.report({
            node,
            messageId: "redefined",
            data: {
              axis: `${node.axis}-axis`,
              replaced: replaced.join(" and "),
            },
          })
        }
        current.start = start
        current.startLine = node.loc.start.line
        if (end !== null) {
          current.end = end
          current.endLine = node.loc.start.line
        }
      },
    }
  },
}
