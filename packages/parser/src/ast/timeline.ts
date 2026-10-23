/**
 * The nodes of the timeline tree, as defined in
 * `packages/spec/docs/ast/timeline.md`, for the diagram type `timeline`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. A **period** is a point of the timeline, such as a year, with
 * the **events** written for it; a **section** groups the periods after it.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. A node
 * that spans several lines has such a line under each of its lines. The
 * examples other than that of the diagram stand after the header line
 * `timeline`.
 */
import type { NodeBase } from "../ast.ts"

/**
 * ast/timeline.md, TimelineDiagram: the body of the diagram type
 * `timeline`. Its child field is `body`. The header keyword is not a field;
 * its token is in `Root.tokens`. The range runs from the header keyword to
 * the last token of the diagram.
 *
 * ```text
 * timeline TD
 * ^^^^^^^^^^^
 * 2004 : Facebook
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface TimelineDiagram extends NodeBase {
  readonly type: "TimelineDiagram"
  /** The direction of the header as written, `LR` or `TD` in any case; null when there is none. */
  readonly direction: string | null
  /** The statements, in source order. */
  readonly body: readonly TimelineStatement[]
}

/** ast/timeline.md, TimelineDiagram: a statement of a timeline. */
export type TimelineStatement =
  | TimelinePeriodStatement
  | TimelineEventStatement
  | TimelineTitleStatement
  | TimelineSectionStatement
  | TimelineAccTitleStatement
  | TimelineAccDescrStatement
  | TimelineAccDescrBlockStatement

/**
 * ast/timeline.md, TimelinePeriodStatement: a period with the events that
 * follow it. Its child fields are `period` and `events`.
 *
 * ```text
 * 2004 : Facebook
 * ^^^^^^^^^^^^^^^
 *      : Google
 * ^^^^^^^^^^^^^
 * ```
 */
export interface TimelinePeriodStatement extends NodeBase {
  readonly type: "TimelinePeriodStatement"
  /** The period, as written, the whitespace before its colon, `#`, or line feed included. */
  readonly period: TimelineLiteral
  /** The events right after the period, in source order; may be empty. */
  readonly events: readonly TimelineLiteral[]
}

/**
 * ast/timeline.md, TimelineEventStatement: events after a statement that is
 * not a period. Its child field is `events`.
 *
 * ```text
 * 2004
 * section S
 * : Google
 * ^^^^^^^^
 * ```
 */
export interface TimelineEventStatement extends NodeBase {
  readonly type: "TimelineEventStatement"
  /** The events, in source order; at least one. */
  readonly events: readonly TimelineLiteral[]
}

/**
 * ast/timeline.md, TimelineTitleStatement: a `title` statement. Its child
 * field is `value`.
 *
 * ```text
 * title History of social media
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface TimelineTitleStatement extends NodeBase {
  readonly type: "TimelineTitleStatement"
  /** The text after `title` and one whitespace character, up to a line feed, the whitespace at its ends included. */
  readonly value: TimelineLiteral
}

/**
 * ast/timeline.md, TimelineSectionStatement: a `section` statement. Its
 * child field is `name`.
 *
 * ```text
 * section 2000s
 * ^^^^^^^^^^^^^
 * ```
 */
export interface TimelineSectionStatement extends NodeBase {
  readonly type: "TimelineSectionStatement"
  /** The text after `section` and one whitespace character, up to a `:` or a line feed, the whitespace at its ends included. */
  readonly name: TimelineLiteral
}

/**
 * ast/timeline.md, TimelineAccTitleStatement: an `accTitle:` statement with
 * its text. Its child field is `value`.
 *
 * ```text
 * accTitle: My title
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface TimelineAccTitleStatement extends NodeBase {
  readonly type: "TimelineAccTitleStatement"
  /** The text after `accTitle:`, without the whitespace at its ends. */
  readonly value: TimelineLiteral
}

/**
 * ast/timeline.md, TimelineAccDescrStatement: an `accDescr:` statement with
 * its text. Its child field is `value`.
 *
 * ```text
 * accDescr: My description
 * ^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface TimelineAccDescrStatement extends NodeBase {
  readonly type: "TimelineAccDescrStatement"
  /** The text after `accDescr:`, without the whitespace at its ends. */
  readonly value: TimelineLiteral
}

/**
 * ast/timeline.md, TimelineAccDescrBlockStatement: an `accDescr { ... }`
 * statement with its text, or without text. Its child field is `value`.
 *
 * ```text
 * accDescr {
 * ^^^^^^^^^^
 *   My description
 * ^^^^^^^^^^^^^^^^
 * }
 * ^
 * ```
 */
export interface TimelineAccDescrBlockStatement extends NodeBase {
  readonly type: "TimelineAccDescrBlockStatement"
  /** The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace lies between them. */
  readonly value: TimelineLiteral | null
}

/**
 * ast/timeline.md, TimelineLiteral: a text without quotes that may contain
 * whitespace: a period, an event, a title, a section name, and an
 * accessibility text. No child fields.
 *
 * ```text
 * 2004 : Facebook
 *        ^^^^^^^^
 * ```
 */
export interface TimelineLiteral extends NodeBase {
  readonly type: "TimelineLiteral"
  /** Its written text. */
  readonly value: string
}

/** Every node type of the timeline tree. */
export type TimelineNode = TimelineDiagram | TimelineStatement | TimelineLiteral
