import type { TimelineNode } from "../ast/timeline.ts"

/**
 * ast/timeline.md: the child fields of each timeline node type, as each
 * node's section states them, in the order in which a walk visits them.
 */
export const timelineVisitorKeys: Readonly<
  Record<TimelineNode["type"], readonly string[]>
> = {
  TimelineDiagram: ["body"],
  TimelinePeriodStatement: ["period", "events"],
  TimelineEventStatement: ["events"],
  TimelineTitleStatement: ["value"],
  TimelineSectionStatement: ["name"],
  TimelineAccTitleStatement: ["value"],
  TimelineAccDescrStatement: ["value"],
  TimelineAccDescrBlockStatement: ["value"],
  TimelineLiteral: [],
}
