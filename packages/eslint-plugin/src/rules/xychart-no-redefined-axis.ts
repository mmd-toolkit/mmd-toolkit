import type {
  XychartBand,
  XychartRange,
  XychartXAxisStatement,
  XychartYAxisStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The title and data currently set by statements of one axis.
 */
interface AxisState {
  title: string
  data: XychartBand | XychartRange | null
}

/** Whether two sets of axis data have the same values in mermaid.js. */
function sameData(
  earlier: XychartBand | XychartRange,
  later: XychartBand | XychartRange,
): boolean {
  if (earlier.type === "XychartRange" && later.type === "XychartRange") {
    return (
      earlier.start.value === later.start.value &&
      earlier.end.value === later.end.value
    )
  }
  if (earlier.type === "XychartBand" && later.type === "XychartBand") {
    return (
      earlier.categories.length === later.categories.length &&
      earlier.categories.every(
        (category, index) =>
          category.value.trim() === later.categories[index].value.trim(),
      )
    )
  }
  return false
}

/**
 * The rule `xychart-no-redefined-axis`, described in
 * `docs/rules/xychart-no-redefined-axis.md`: a statement that changes a
 * nonempty title or replaces existing data with different data of the same
 * axis. Every statement sets the title, empty when absent, while a statement
 * without data keeps the current data. Adding a title or data loses nothing.
 */
export const xychartNoRedefinedAxis: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an axis statement that replaces the title or the data of the axis.",
      recommended: true,
      url: ruleDocsUrl("xychart-no-redefined-axis"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces {{replaced}} of the `{{axis}}` with the values of this statement.",
    },
  },
  create(context) {
    const xAxis: AxisState = {
      title: "",
      data: null,
    }
    const yAxis: AxisState = {
      title: "",
      data: null,
    }

    /** Reports a statement that replaces a value, then records what it sets. */
    function check(
      node: XychartXAxisStatement | XychartYAxisStatement,
      axis: "x-axis" | "y-axis",
      current: AxisState,
    ): void {
      const title = node.title?.value.trim() ?? ""
      const replaced: string[] = []
      if (current.title !== "" && current.title !== title) {
        replaced.push("the earlier title")
      }
      if (
        current.data !== null &&
        node.data !== null &&
        !sameData(current.data, node.data)
      ) {
        replaced.push("the earlier data")
      }
      if (replaced.length > 0) {
        context.report({
          node,
          messageId: "redefined",
          data: { axis, replaced: replaced.join(" and ") },
        })
      }
      current.title = title
      if (node.data !== null) {
        current.data = node.data
      }
    }

    return {
      XychartXAxisStatement: (node) => check(node, "x-axis", xAxis),
      XychartYAxisStatement: (node) => check(node, "y-axis", yAxis),
    }
  },
}
