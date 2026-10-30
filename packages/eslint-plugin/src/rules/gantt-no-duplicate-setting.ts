import { oneOfTwoRemovals } from "../utils/removal.ts"
import type { Node } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** The settings that a later statement replaces, by the node type of their statements. */
const SETTING_NAMES = {
  GanttDateFormatStatement: "dateFormat",
  GanttAxisFormatStatement: "axisFormat",
  GanttTickIntervalStatement: "tickInterval",
  GanttTodayMarkerStatement: "todayMarker",
  GanttWeekdayStatement: "weekday",
  GanttWeekendStatement: "weekend",
} as const

/**
 * The rule `gantt-no-duplicate-setting`, described in
 * `docs/rules/gantt-no-duplicate-setting.md`: every statement of `dateFormat`,
 * `axisFormat`, `tickInterval`, `todayMarker`, `weekday`, or `weekend` after the
 * first one of the same setting, when it sets a value other than the one before
 * it: the text after the keyword and its space, and the day in lower case for
 * `weekday` and `weekend`. `excludes` and `includes` add up, and a second
 * `inclusiveEndDates` changes nothing, so they are not here. ESLint visits the
 * statements in the order of the source.
 */
export const ganttNoDuplicateSetting: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a setting statement that sets its setting again.",
      recommended: true,
      url: ruleDocsUrl("gantt-no-duplicate-setting"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement.",
      duplicate:
        "mermaid.js replaces the earlier `{{setting}}` with the one of this statement.",
    },
  },
  create(context) {
    /** For each setting, the value that the statement before it set. */
    const previous = new Map<
      string,
      { node: Node; value: string; before: string | undefined }
    >()

    /**
     * Reports `node`, a statement of the setting `setting` that sets `value`,
     * when a statement set the setting before to another value.
     */
    function check(node: Node, setting: string, value: string): void {
      const earlier = previous.get(setting)
      if (earlier !== undefined && earlier.value !== value) {
        context.report({
          node,
          messageId: "duplicate",
          data: { setting },
          suggest: oneOfTwoRemovals(
            context.sourceCode,
            node,
            earlier.node,
            earlier.before === undefined || earlier.before === value,
          ),
        })
      }
      previous.set(setting, { node, value, before: earlier?.value })
    }

    return {
      GanttDateFormatStatement: (node) =>
        check(node, SETTING_NAMES.GanttDateFormatStatement, node.value.value),
      GanttAxisFormatStatement: (node) =>
        check(node, SETTING_NAMES.GanttAxisFormatStatement, node.value.value),
      GanttTickIntervalStatement: (node) =>
        check(node, SETTING_NAMES.GanttTickIntervalStatement, node.value.value),
      GanttTodayMarkerStatement: (node) =>
        check(node, SETTING_NAMES.GanttTodayMarkerStatement, node.value.value),
      GanttWeekdayStatement: (node) =>
        check(node, SETTING_NAMES.GanttWeekdayStatement, node.day),
      GanttWeekendStatement: (node) =>
        check(node, SETTING_NAMES.GanttWeekendStatement, node.day),
    }
  },
}
