/**
 * The nodes of a journey tree that the Db reads: the fields of
 * `packages/spec/docs/ast/journey.md` that `journey.ts` uses, and no others
 * (the field `textAfter` of a task is not read: the Db has nothing of the text
 * from the third colon of the data).
 */
import type { TreeNode } from "./tree.ts"

/** ast/journey.md: JourneyDiagram. */
export interface JourneyDiagram extends TreeNode {
  readonly type: "JourneyDiagram"
  readonly body: readonly JourneyStatement[]
}

/** ast/journey.md: JourneyStatement. */
export type JourneyStatement =
  | JourneyTaskStatement
  | JourneyTitleStatement
  | JourneySectionStatement
  | JourneyAccTitleStatement
  | JourneyAccDescrStatement
  | JourneyAccDescrBlockStatement

/** ast/journey.md: JourneyLiteral. */
export interface JourneyLiteral extends TreeNode {
  readonly type: "JourneyLiteral"
}

/** ast/journey.md: JourneyTaskStatement. */
export interface JourneyTaskStatement extends TreeNode {
  readonly type: "JourneyTaskStatement"
  readonly description: JourneyLiteral
  readonly score: JourneyLiteral | null
  readonly people: readonly (JourneyLiteral | null)[]
}

/** ast/journey.md: JourneyTitleStatement. */
export interface JourneyTitleStatement extends TreeNode {
  readonly type: "JourneyTitleStatement"
  readonly value: JourneyLiteral
}

/** ast/journey.md: JourneySectionStatement. */
export interface JourneySectionStatement extends TreeNode {
  readonly type: "JourneySectionStatement"
  readonly name: JourneyLiteral
}

/** ast/journey.md: JourneyAccTitleStatement. */
export interface JourneyAccTitleStatement extends TreeNode {
  readonly type: "JourneyAccTitleStatement"
  readonly value: JourneyLiteral
}

/** ast/journey.md: JourneyAccDescrStatement. */
export interface JourneyAccDescrStatement extends TreeNode {
  readonly type: "JourneyAccDescrStatement"
  readonly value: JourneyLiteral
}

/** ast/journey.md: JourneyAccDescrBlockStatement. */
export interface JourneyAccDescrBlockStatement extends TreeNode {
  readonly type: "JourneyAccDescrBlockStatement"
  readonly value: JourneyLiteral | null
}
