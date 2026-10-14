import type { GanttNode } from "../ast/gantt.ts"

/**
 * ast/gantt.md: the child fields of each Gantt node type, as each node's
 * section states them, in the order in which a walk visits them. Those of
 * GanttClickStatement keep one order whatever the source order.
 */
export const ganttVisitorKeys: Readonly<
  Record<GanttNode["type"], readonly string[]>
> = {
  GanttDiagram: ["body"],
  GanttTaskStatement: ["description", "tags", "items"],
  GanttClickStatement: ["ids", "call", "href"],
  GanttCallback: ["name", "args"],
  GanttDateFormatStatement: ["value"],
  GanttAxisFormatStatement: ["value"],
  GanttTickIntervalStatement: ["value"],
  GanttTodayMarkerStatement: ["value"],
  GanttIncludesStatement: ["items"],
  GanttExcludesStatement: ["items"],
  GanttInclusiveEndDatesStatement: [],
  GanttWeekdayStatement: [],
  GanttWeekendStatement: [],
  GanttTitleStatement: ["value"],
  GanttSectionStatement: ["name"],
  GanttAccTitleStatement: ["value"],
  GanttAccDescrStatement: ["value"],
  GanttAccDescrBlockStatement: ["value"],
  GanttLiteral: [],
}
