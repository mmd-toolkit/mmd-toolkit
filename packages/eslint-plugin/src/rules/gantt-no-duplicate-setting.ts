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
 * first one of the same setting, also when it repeats the value. `excludes`
 * and `includes` add up, and a second `inclusiveEndDates` changes nothing, so
 * they are not here. ESLint visits the statements in the order of the source.
 */
export const ganttNoDuplicateSetting: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a setting statement that sets its setting again.",
      recommended: true,
      url: ruleDocsUrl("gantt-no-duplicate-setting"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the `{{setting}}` set on line {{line}} with the one of this statement.",
    },
  },
  create(context) {
    /** For each setting, the statement that set it before. */
    const previous = new Map<string, Node>()

    /** Reports `node`, a statement of the setting `setting`, when a statement set it before. */
    function check(node: Node, setting: string): void {
      const earlier = previous.get(setting)
      if (earlier !== undefined) {
        context.report({
          node,
          messageId: "duplicate",
          data: { setting, line: String(earlier.loc.start.line) },
        })
      }
      previous.set(setting, node)
    }

    return {
      GanttDateFormatStatement: (node) =>
        check(node, SETTING_NAMES.GanttDateFormatStatement),
      GanttAxisFormatStatement: (node) =>
        check(node, SETTING_NAMES.GanttAxisFormatStatement),
      GanttTickIntervalStatement: (node) =>
        check(node, SETTING_NAMES.GanttTickIntervalStatement),
      GanttTodayMarkerStatement: (node) =>
        check(node, SETTING_NAMES.GanttTodayMarkerStatement),
      GanttWeekdayStatement: (node) =>
        check(node, SETTING_NAMES.GanttWeekdayStatement),
      GanttWeekendStatement: (node) =>
        check(node, SETTING_NAMES.GanttWeekendStatement),
    }
  },
}
