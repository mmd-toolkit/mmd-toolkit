/**
 * The nodes of the Gantt tree, as defined in `packages/spec/docs/ast/gantt.md`,
 * for the diagram type `gantt`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. A **task** is a bar of the chart, with a description and data
 * that say when it starts and ends; a **section** groups the tasks after
 * it; a **click statement** binds a link or a callback to tasks by their
 * ids.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. A node
 * that spans several lines has such a line under each of its lines. The
 * examples other than that of the diagram stand after the header line
 * `gantt`.
 */
import type { Identifier, NodeBase, StringLiteral } from "../ast.ts"

/**
 * ast/gantt.md, GanttDiagram: the body of the diagram type `gantt`. Its
 * child field is `body`. The header keyword is not a field; its token is in
 * `Root.tokens`. The range runs from the header keyword to the last token
 * of the diagram.
 *
 * ```text
 * gantt
 * ^^^^^
 * a : 1d
 * ^^^^^^
 * ```
 */
export interface GanttDiagram extends NodeBase {
  readonly type: "GanttDiagram"
  /** The statements, in source order. */
  readonly body: readonly GanttStatement[]
}

/** ast/gantt.md, GanttDiagram: a statement of a Gantt chart. */
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

/**
 * ast/gantt.md, GanttTaskStatement: a task, a description, a colon, and
 * data of items separated by commas. Its child fields are `description`,
 * `tags`, and `items`.
 *
 * ```text
 * Design : done, des1, 2024-01-06, 2d
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttTaskStatement extends NodeBase {
  readonly type: "GanttTaskStatement"
  /** The text before the colon, as written, the whitespace before the colon included. */
  readonly description: GanttLiteral
  /** The tags at the front of the data, in source order: each one of `active`, `done`, `crit`, `milestone`, and `vert`; empty when none. */
  readonly tags: readonly Identifier[]
  /** The items after the tags, in source order, each without the whitespace at its ends; null for an item that is empty or whitespace only. */
  readonly items: readonly (GanttLiteral | null)[]
}

/**
 * ast/gantt.md, GanttClickStatement: a `click` statement, the ids of tasks
 * and a link, a callback, or both. Its child fields are `ids`, `call`, and
 * `href`, in this order whatever the source order.
 *
 * ```text
 * click des1 href "https://example.com"
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * click des1 call cb(1) href "u"
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttClickStatement extends NodeBase {
  readonly type: "GanttClickStatement"
  /** The ids after `click`, separated by `,` units, in source order; null for an id with no character, as in `id1,` and `,`. */
  readonly ids: readonly (Identifier | null)[]
  /** The call part; null when there is none. */
  readonly call: GanttCallback | null
  /** The URL of the link part, a string in double quotes; null when there is none. */
  readonly href: StringLiteral | null
}

/**
 * ast/gantt.md, GanttCallback: the call part of a click statement, a
 * callback name and its arguments. Its child fields are `name` and `args`.
 *
 * ```text
 * click des1 call cb(1)
 *            ^^^^^^^^^^
 * ```
 */
export interface GanttCallback extends NodeBase {
  readonly type: "GanttCallback"
  /** The text between the whitespace after `call` and the `(`, as written, whitespace and line feeds at its end included. */
  readonly name: GanttLiteral
  /** The text between the parentheses, as written, whitespace at its ends included; null when only whitespace lies between them. */
  readonly args: GanttLiteral | null
}

/**
 * ast/gantt.md, GanttDateFormatStatement: a `dateFormat` statement. Its
 * child field is `value`.
 *
 * ```text
 * dateFormat YYYY-MM-DD
 * ^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttDateFormatStatement extends NodeBase {
  readonly type: "GanttDateFormatStatement"
  /** The text after `dateFormat` and one whitespace character, to the end of the line. */
  readonly value: GanttLiteral
}

/**
 * ast/gantt.md, GanttAxisFormatStatement: an `axisFormat` statement. Its
 * child field is `value`.
 *
 * ```text
 * axisFormat %Y-%m-%d
 * ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttAxisFormatStatement extends NodeBase {
  readonly type: "GanttAxisFormatStatement"
  /** The text after `axisFormat` and one whitespace character, to the end of the line. */
  readonly value: GanttLiteral
}

/**
 * ast/gantt.md, GanttTickIntervalStatement: a `tickInterval` statement. Its
 * child field is `value`.
 *
 * ```text
 * tickInterval 1week
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttTickIntervalStatement extends NodeBase {
  readonly type: "GanttTickIntervalStatement"
  /** The text after `tickInterval` and one whitespace character, to the end of the line. */
  readonly value: GanttLiteral
}

/**
 * ast/gantt.md, GanttTodayMarkerStatement: a `todayMarker` statement. Its
 * child field is `value`.
 *
 * ```text
 * todayMarker off
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttTodayMarkerStatement extends NodeBase {
  readonly type: "GanttTodayMarkerStatement"
  /** The text after `todayMarker` and one whitespace character, to the end of the line. */
  readonly value: GanttLiteral
}

/**
 * ast/gantt.md, GanttIncludesStatement: an `includes` statement, the dates
 * and days that the chart counts as working time. Its child field is
 * `items`.
 *
 * ```text
 * includes 2024-01-06, saturday
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttIncludesStatement extends NodeBase {
  readonly type: "GanttIncludesStatement"
  /** The items of the list text, separated by whitespace or `,` units, in source order; empty when none. */
  readonly items: readonly Identifier[]
}

/**
 * ast/gantt.md, GanttExcludesStatement: an `excludes` statement, the dates
 * and days that the chart leaves out. Its child field is `items`.
 *
 * ```text
 * excludes weekends
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttExcludesStatement extends NodeBase {
  readonly type: "GanttExcludesStatement"
  /** The items of the list text, as for GanttIncludesStatement. */
  readonly items: readonly Identifier[]
}

/**
 * ast/gantt.md, GanttInclusiveEndDatesStatement: an `inclusiveEndDates`
 * statement. It has no child fields.
 *
 * ```text
 * inclusiveEndDates
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttInclusiveEndDatesStatement extends NodeBase {
  readonly type: "GanttInclusiveEndDatesStatement"
}

/** ast/gantt.md, GanttWeekdayStatement: the days, in lower case. */
export type GanttDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

/** ast/gantt.md, GanttWeekendStatement: the days that may start the weekend, in lower case. */
export type GanttWeekendDay = "friday" | "saturday"

/**
 * ast/gantt.md, GanttWeekdayStatement: a `weekday` statement, the first day
 * of the week. It has no child fields.
 *
 * ```text
 * weekday monday
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface GanttWeekdayStatement extends NodeBase {
  readonly type: "GanttWeekdayStatement"
  /** The day, in lower case whatever its case in the text. */
  readonly day: GanttDay
}

/**
 * ast/gantt.md, GanttWeekendStatement: a `weekend` statement, the first day
 * of the weekend. It has no child fields.
 *
 * ```text
 * weekend friday
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface GanttWeekendStatement extends NodeBase {
  readonly type: "GanttWeekendStatement"
  /** `friday` or `saturday`, in lower case. */
  readonly day: GanttWeekendDay
}

/**
 * ast/gantt.md, GanttTitleStatement: a `title` statement. Its child field
 * is `value`.
 *
 * ```text
 * title A plan
 * ^^^^^^^^^^^^
 * ```
 */
export interface GanttTitleStatement extends NodeBase {
  readonly type: "GanttTitleStatement"
  /** The text after `title` and one whitespace character, to the end of the line. */
  readonly value: GanttLiteral
}

/**
 * ast/gantt.md, GanttSectionStatement: a `section` statement. Its child
 * field is `name`.
 *
 * ```text
 * section Design
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface GanttSectionStatement extends NodeBase {
  readonly type: "GanttSectionStatement"
  /** The text after `section` and one whitespace character, to the end of the line. */
  readonly name: GanttLiteral
}

/**
 * ast/gantt.md, GanttAccTitleStatement: an `accTitle:` statement with its
 * text. Its child field is `value`.
 *
 * ```text
 * accTitle: The plan
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttAccTitleStatement extends NodeBase {
  readonly type: "GanttAccTitleStatement"
  /** The text after `accTitle:`, up to the end of its line, without the whitespace at its ends. */
  readonly value: GanttLiteral
}

/**
 * ast/gantt.md, GanttAccDescrStatement: an `accDescr:` statement with its
 * text. Its child field is `value`.
 *
 * ```text
 * accDescr: The plan of the work
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GanttAccDescrStatement extends NodeBase {
  readonly type: "GanttAccDescrStatement"
  /** The text after `accDescr:`, up to the end of its line, without the whitespace at its ends. */
  readonly value: GanttLiteral
}

/**
 * ast/gantt.md, GanttAccDescrBlockStatement: an `accDescr { ... }`
 * statement with its text, or without text: an empty description block,
 * which changes nothing. Its child field is `value`.
 *
 * ```text
 * accDescr { The plan }
 * ^^^^^^^^^^^^^^^^^^^^^
 *
 * accDescr {}
 * ^^^^^^^^^^^
 * ```
 */
export interface GanttAccDescrBlockStatement extends NodeBase {
  readonly type: "GanttAccDescrBlockStatement"
  /** The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace lies between them. */
  readonly value: GanttLiteral | null
}

/**
 * ast/gantt.md, GanttLiteral: a text without quotes that may contain
 * whitespace: a task description, an item of task data, a title, a section
 * name, the value of a setting, a callback name, callback arguments, and an
 * accessibility text. It has no child fields.
 *
 * ```text
 * title A plan
 *       ^^^^^^
 * ```
 */
export interface GanttLiteral extends NodeBase {
  readonly type: "GanttLiteral"
  /** Its written text (ast.md, Nodes). */
  readonly value: string
}

/** ast/gantt.md: a node of the Gantt tree. */
export type GanttNode =
  GanttDiagram | GanttStatement | GanttCallback | GanttLiteral
