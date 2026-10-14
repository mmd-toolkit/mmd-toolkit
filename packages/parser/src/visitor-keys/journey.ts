import type { JourneyNode } from "../ast/journey.ts"

/**
 * ast/journey.md: the child fields of each journey node type, as each
 * node's section states them, in the order in which a walk visits them.
 */
export const journeyVisitorKeys: Readonly<
  Record<JourneyNode["type"], readonly string[]>
> = {
  JourneyDiagram: ["body"],
  JourneyTaskStatement: ["description", "score", "people", "textAfter"],
  JourneyTitleStatement: ["value"],
  JourneySectionStatement: ["name"],
  JourneyAccTitleStatement: ["value"],
  JourneyAccDescrStatement: ["value"],
  JourneyAccDescrBlockStatement: ["value"],
  JourneyLiteral: [],
  JourneyIgnoredText: [],
}
