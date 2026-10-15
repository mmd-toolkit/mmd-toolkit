import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary } from "../types.ts"
import { classDbOf } from "./class.ts"
import type { ClassDiagram } from "./class-tree.ts"
import { erDbOf } from "./er.ts"
import type { ErDiagram } from "./er-tree.ts"
import { flowchartDbOf } from "./flowchart.ts"
import type { FlowchartDiagram } from "./flowchart-tree.ts"
import { ganttDbOf } from "./gantt.ts"
import type { GanttDiagram } from "./gantt-tree.ts"
import { journeyDbOf } from "./journey.ts"
import type { JourneyDiagram } from "./journey-tree.ts"
import { mindmapDbOf } from "./mindmap.ts"
import type { MindmapDiagram } from "./mindmap-tree.ts"
import { quadrantDbOf } from "./quadrant.ts"
import type { QuadrantDiagram } from "./quadrant-tree.ts"
import { requirementDbOf } from "./requirement.ts"
import type { RequirementDiagram } from "./requirement-tree.ts"
import { sankeyDbOf } from "./sankey.ts"
import type { SankeyDiagram } from "./sankey-tree.ts"
import type { ColorAnswer } from "./sequence.ts"
import { sequenceDbOf } from "./sequence.ts"
import type { SequenceDiagram } from "./sequence-tree.ts"
import { stateDbOf } from "./state.ts"
import type { StateDiagram } from "./state-tree.ts"
import { timelineDbOf } from "./timeline.ts"
import type { TimelineDiagram } from "./timeline-tree.ts"
import type { TreeNode, TreeRoot } from "./tree.ts"
import { xychartDbOf } from "./xychart.ts"
import type { XychartDiagram } from "./xychart-tree.ts"

export type { ColorAnswer } from "./sequence.ts"

/** The body of a diagram that has no diagram type to read: the `error` pseudo-diagram. */
export interface ErrorDiagram extends TreeNode {
  readonly type: "ErrorDiagram"
}

/** The body of a tree, by diagram type. */
export type DiagramBody =
  | ClassDiagram
  | ErDiagram
  | ErrorDiagram
  | FlowchartDiagram
  | GanttDiagram
  | JourneyDiagram
  | MindmapDiagram
  | QuadrantDiagram
  | RequirementDiagram
  | SankeyDiagram
  | SequenceDiagram
  | StateDiagram
  | TimelineDiagram
  | XychartDiagram

/** A tree that the Db is built from. */
export interface DbTreeRoot extends TreeRoot {
  readonly body: DiagramBody
}

/**
 * The Db summary that the tree `root` of the source `text` denotes, in the
 * normalized form of `@mmd-toolkit/tests`. The source is read for the
 * converted form of the values (common.md, Reading a source). The values that
 * come from embedded data, which a tree does not hold, are those that
 * mermaid.js derived for the same text: `embedded`, which a fixture gives
 * through `embeddedValuesOf()`. Whether the colour candidate of a sequence box
 * is a colour is the answer of the browser, which `isColor` gives.
 */
export function dbFromTree(
  text: string,
  root: DbTreeRoot,
  embedded: EmbeddedValues,
  isColor: ColorAnswer,
): DbSummary {
  const bodyType: string = root.body.type
  switch (root.body.type) {
    // The error pseudo-diagram has no Db.
    case "ErrorDiagram":
      return {}
    case "FlowchartDiagram":
      return flowchartDbOf(text, root, root.body, embedded)
    case "SequenceDiagram":
      return sequenceDbOf(text, root, root.body, embedded, isColor)
    case "ClassDiagram":
      return classDbOf(text, root, root.body, embedded)
    case "StateDiagram":
      return stateDbOf(text, root, root.body, embedded)
    case "ErDiagram":
      return erDbOf(text, root, root.body, embedded)
    case "GanttDiagram":
      return ganttDbOf(text, root, root.body, embedded)
    case "JourneyDiagram":
      return journeyDbOf(text, root, root.body, embedded)
    case "MindmapDiagram":
      return mindmapDbOf(text, root, root.body, embedded)
    case "RequirementDiagram":
      return requirementDbOf(text, root, root.body, embedded)
    case "TimelineDiagram":
      return timelineDbOf(text, root, root.body, embedded)
    case "SankeyDiagram":
      return sankeyDbOf(text, root, root.body, embedded)
    case "XychartDiagram":
      return xychartDbOf(text, root, root.body, embedded)
    case "QuadrantDiagram":
      return quadrantDbOf(text, root, root.body, embedded)
    default:
      throw new Error(`dbFromTree: unknown body type ${bodyType}`)
  }
}
