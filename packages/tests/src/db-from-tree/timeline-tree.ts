/**
 * The nodes of a timeline tree that the Db reads: the fields of
 * `packages/spec/docs/ast/timeline.md` that `timeline.ts` uses, and no others.
 */
import type { TreeNode } from "./tree.ts"

/** ast/timeline.md: TimelineDiagram. */
export interface TimelineDiagram extends TreeNode {
  readonly type: "TimelineDiagram"
  readonly direction: string | null
  readonly body: readonly TimelineStatement[]
}

/** ast/timeline.md: TimelineStatement. */
export type TimelineStatement =
  | TimelinePeriodStatement
  | TimelineEventStatement
  | TimelineTitleStatement
  | TimelineSectionStatement
  | TimelineAccTitleStatement
  | TimelineAccDescrStatement
  | TimelineAccDescrBlockStatement

/** ast/timeline.md: TimelineLiteral. */
export interface TimelineLiteral extends TreeNode {
  readonly type: "TimelineLiteral"
}

/** ast/timeline.md: TimelinePeriodStatement. */
export interface TimelinePeriodStatement extends TreeNode {
  readonly type: "TimelinePeriodStatement"
  readonly period: TimelineLiteral
  readonly events: readonly TimelineLiteral[]
}

/** ast/timeline.md: TimelineEventStatement. */
export interface TimelineEventStatement extends TreeNode {
  readonly type: "TimelineEventStatement"
  readonly events: readonly TimelineLiteral[]
}

/** ast/timeline.md: TimelineTitleStatement. */
export interface TimelineTitleStatement extends TreeNode {
  readonly type: "TimelineTitleStatement"
  readonly value: TimelineLiteral
}

/** ast/timeline.md: TimelineSectionStatement. */
export interface TimelineSectionStatement extends TreeNode {
  readonly type: "TimelineSectionStatement"
  readonly name: TimelineLiteral
}

/** ast/timeline.md: TimelineAccTitleStatement. */
export interface TimelineAccTitleStatement extends TreeNode {
  readonly type: "TimelineAccTitleStatement"
  readonly value: TimelineLiteral
}

/** ast/timeline.md: TimelineAccDescrStatement. */
export interface TimelineAccDescrStatement extends TreeNode {
  readonly type: "TimelineAccDescrStatement"
  readonly value: TimelineLiteral
}

/** ast/timeline.md: TimelineAccDescrBlockStatement. */
export interface TimelineAccDescrBlockStatement extends TreeNode {
  readonly type: "TimelineAccDescrBlockStatement"
  readonly value: TimelineLiteral | null
}
