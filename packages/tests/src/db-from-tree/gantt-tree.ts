/**
 * The nodes of a gantt tree that the Db reads: the fields of
 * `packages/spec/docs/ast/gantt.md` that `gantt.ts` uses, and no others.
 */
import type { Identifier, StringLiteral, TreeNode } from "./tree.ts"

/** ast/gantt.md: GanttDiagram. */
export interface GanttDiagram extends TreeNode {
  readonly type: "GanttDiagram"
  readonly body: readonly GanttStatement[]
}

/** ast/gantt.md: GanttStatement. */
export type GanttStatement =
  | GanttTaskStatement
  | GanttClickStatement
  | GanttDateFormatStatement
  | GanttAxisFormatStatement
  | GanttTickIntervalStatement
  | GanttTodayMarkerStatement
  | GanttIncludesStatement
  | GanttExcludesStatement
  | GanttInclusiveEndDatesStatement
  | GanttWeekdayStatement
  | GanttWeekendStatement
  | GanttTitleStatement
  | GanttSectionStatement
  | GanttAccTitleStatement
  | GanttAccDescrStatement
  | GanttAccDescrBlockStatement
  | GanttIgnoredStatement

/** ast/gantt.md: GanttLiteral. */
export interface GanttLiteral extends TreeNode {
  readonly type: "GanttLiteral"
}

/** ast/gantt.md: GanttTaskStatement. */
export interface GanttTaskStatement extends TreeNode {
  readonly type: "GanttTaskStatement"
  readonly description: GanttLiteral
  readonly tags: readonly Identifier[]
  readonly items: readonly (GanttLiteral | null)[]
}

/** ast/gantt.md: GanttClickStatement. */
export interface GanttClickStatement extends TreeNode {
  readonly type: "GanttClickStatement"
  readonly ids: readonly (Identifier | null)[]
  readonly call: GanttCallback | null
  readonly href: StringLiteral | null
}

/** ast/gantt.md: GanttCallback. */
export interface GanttCallback extends TreeNode {
  readonly type: "GanttCallback"
  readonly name: GanttLiteral
  readonly args: GanttLiteral | null
}

/** ast/gantt.md: GanttDateFormatStatement. */
export interface GanttDateFormatStatement extends TreeNode {
  readonly type: "GanttDateFormatStatement"
  readonly value: GanttLiteral
}

/** ast/gantt.md: GanttAxisFormatStatement. */
export interface GanttAxisFormatStatement extends TreeNode {
  readonly type: "GanttAxisFormatStatement"
  readonly value: GanttLiteral
}

/** ast/gantt.md: GanttTickIntervalStatement. */
export interface GanttTickIntervalStatement extends TreeNode {
  readonly type: "GanttTickIntervalStatement"
  readonly value: GanttLiteral
}

/** ast/gantt.md: GanttTodayMarkerStatement. */
export interface GanttTodayMarkerStatement extends TreeNode {
  readonly type: "GanttTodayMarkerStatement"
  readonly value: GanttLiteral
}

/** ast/gantt.md: GanttIncludesStatement. */
export interface GanttIncludesStatement extends TreeNode {
  readonly type: "GanttIncludesStatement"
  readonly items: readonly Identifier[]
}

/** ast/gantt.md: GanttExcludesStatement. */
export interface GanttExcludesStatement extends TreeNode {
  readonly type: "GanttExcludesStatement"
  readonly items: readonly Identifier[]
}

/** ast/gantt.md: GanttInclusiveEndDatesStatement. */
export interface GanttInclusiveEndDatesStatement extends TreeNode {
  readonly type: "GanttInclusiveEndDatesStatement"
}

/** ast/gantt.md: the days of a weekday statement. */
export type GanttWeekdayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

/** ast/gantt.md: GanttWeekdayStatement. */
export interface GanttWeekdayStatement extends TreeNode {
  readonly type: "GanttWeekdayStatement"
  readonly day: GanttWeekdayName
}

/** ast/gantt.md: the days of a weekend statement. */
export type GanttWeekendName = "friday" | "saturday"

/** ast/gantt.md: GanttWeekendStatement. */
export interface GanttWeekendStatement extends TreeNode {
  readonly type: "GanttWeekendStatement"
  readonly day: GanttWeekendName
}

/** ast/gantt.md: GanttTitleStatement. */
export interface GanttTitleStatement extends TreeNode {
  readonly type: "GanttTitleStatement"
  readonly value: GanttLiteral
}

/** ast/gantt.md: GanttSectionStatement. */
export interface GanttSectionStatement extends TreeNode {
  readonly type: "GanttSectionStatement"
  readonly name: GanttLiteral
}

/** ast/gantt.md: GanttAccTitleStatement. */
export interface GanttAccTitleStatement extends TreeNode {
  readonly type: "GanttAccTitleStatement"
  readonly value: GanttLiteral
}

/** ast/gantt.md: GanttAccDescrStatement. */
export interface GanttAccDescrStatement extends TreeNode {
  readonly type: "GanttAccDescrStatement"
  readonly value: GanttLiteral
}

/** ast/gantt.md: GanttAccDescrBlockStatement. */
export interface GanttAccDescrBlockStatement extends TreeNode {
  readonly type: "GanttAccDescrBlockStatement"
  readonly value: GanttLiteral | null
}

/** ast/gantt.md: GanttIgnoredStatement. */
export interface GanttIgnoredStatement extends TreeNode {
  readonly type: "GanttIgnoredStatement"
}
