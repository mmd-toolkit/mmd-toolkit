import { checkTreeviewTree } from "./treeview.ts"
import { checkEventmodelingTree } from "./eventmodeling.ts"
import { checkWardleyTree } from "./wardley.ts"
import { checkCynefinTree } from "./cynefin.ts"
import { checkRailroadTree } from "./railroad.ts"
import { checkTreemapTree } from "./treemap.ts"
import { checkRadarTree } from "./radar.ts"
import { checkArchitectureTree } from "./architecture.ts"
import { checkGitgraphTree } from "./gitgraph.ts"
import { checkInfoTree } from "./info.ts"
import { checkPacketTree } from "./packet.ts"
import { checkPieTree } from "./pie.ts"
import { checkUsecaseTree, usecaseStringDelimitersOf } from "./usecase.ts"
import { checkAgentflowTree, agentflowStringDelimitersOf } from "./agentflow.ts"
import { checkBlockTree } from "./block.ts"
import { checkVennTree } from "./venn.ts"
import { checkC4Tree } from "./c4.ts"
import { checkClassTree } from "./class.ts"
import { checkErTree } from "./er.ts"
import { checkErrorDiagramTokens } from "./error-diagram.ts"
import { checkFlowchartTree, stringDelimitersOf } from "./flowchart.ts"
import { checkGanttTree } from "./gantt.ts"
import { checkInvariants } from "./invariants.ts"
import { checkIshikawaTree } from "./ishikawa.ts"
import { checkKanbanTree } from "./kanban.ts"
import { checkJourneyTree } from "./journey.ts"
import { checkMindmapTree, mindmapLabelDelimitersFor } from "./mindmap.ts"
import { checkNullFields } from "./null-fields.ts"
import { checkRequirementTree } from "./requirement.ts"
import { checkSankeyTree } from "./sankey.ts"
import { checkSharedLeaves } from "./leaves.ts"
import { Problems } from "./problems.ts"
import { checkShape } from "./shape.ts"
import { checkSequenceTree } from "./sequence.ts"
import { checkStateTree } from "./state.ts"
import { checkTimelineTree } from "./timeline.ts"
import { checkPunctuatorsAreWhole } from "./punctuators.ts"
import { checkStringsAreWhole, checkTokensAreNotCut } from "./tokens.ts"
import { checkValues, quoteDelimitersOf } from "./values.ts"
import { checkQuadrantTree } from "./quadrant.ts"
import { checkXychartTree } from "./xychart.ts"
import type { StringDelimitersOf } from "./values.ts"
import type { CheckedRoot, TreeProblem } from "./types.ts"
import { withTokenIndex } from "./token-index.ts"

export type { CheckedRoot, TreeProblem } from "./types.ts"

/** The delimiters of the strings of the diagram of `root`. */
function stringDelimitersFor(
  text: string,
  root: CheckedRoot,
): StringDelimitersOf {
  switch (root.body.type) {
    case "UsecaseDiagram":
      return usecaseStringDelimitersOf(text, root)
    case "AgentflowDiagram":
      return agentflowStringDelimitersOf(text, root)
    case "FlowchartDiagram":
      return stringDelimitersOf(text, root)
    case "KanbanDiagram":
    case "MindmapDiagram":
      return mindmapLabelDelimitersFor(text, root)
    default:
      return quoteDelimitersOf
  }
}

/**
 * Checks everything that the specification states about the tree `root` of the
 * source `text`: the conditions of every tree (packages/parser/docs/positions.md,
 * Invariants) and those of its diagram. Returns the conditions that do not
 * hold; none for a tree that satisfies them all.
 */
export function checkTree(text: string, root: CheckedRoot): TreeProblem[] {
  const problems = new Problems()
  // The other checks read a tree of the form of the specification.
  if (!checkShape(root, problems)) return problems.list
  return withTokenIndex(root, () => checkShapedTree(text, root, problems))
}

/** Check a well-shaped tree while its token index is available. */
function checkShapedTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): TreeProblem[] {
  checkInvariants(text, root, problems)
  checkSharedLeaves(text, root, problems)
  checkNullFields(text, root, problems)
  checkTokensAreNotCut(root, problems)
  checkStringsAreWhole(root, problems)
  checkPunctuatorsAreWhole(root, problems)
  // The strings of a flowchart nest delimiters; the strings of a mindmap are
  // the labels of its shapes, with `"` or with `"``; those of the other
  // diagrams have one pair of quotes.
  const delimitersOf = stringDelimitersFor(text, root)
  checkValues(text, root, delimitersOf, problems)
  switch (root.body.type) {
    case "ErrorDiagram":
      checkErrorDiagramTokens(root, problems)
      break
    case "TreeviewDiagram":
      checkTreeviewTree(text, root, problems)
      break
    case "EventmodelingDiagram":
      checkEventmodelingTree(text, root, problems)
      break
    case "WardleyDiagram":
      checkWardleyTree(text, root, problems)
      break
    case "CynefinDiagram":
      checkCynefinTree(text, root, problems)
      break
    case "RailroadDiagram":
      checkRailroadTree(text, root, problems)
      break
    case "TreemapDiagram":
      checkTreemapTree(text, root, problems)
      break
    case "RadarDiagram":
      checkRadarTree(text, root, problems)
      break
    case "ArchitectureDiagram":
      checkArchitectureTree(text, root, problems)
      break
    case "GitgraphDiagram":
      checkGitgraphTree(text, root, problems)
      break
    case "InfoDiagram":
      checkInfoTree(text, root, problems)
      break
    case "PacketDiagram":
      checkPacketTree(text, root, problems)
      break
    case "PieDiagram":
      checkPieTree(text, root, problems)
      break
    case "UsecaseDiagram":
      checkUsecaseTree(text, root, problems)
      break
    case "AgentflowDiagram":
      checkAgentflowTree(text, root, delimitersOf, problems)
      break
    case "FlowchartDiagram":
      checkFlowchartTree(text, root, delimitersOf, problems)
      break
    case "SequenceDiagram":
      checkSequenceTree(root, problems)
      break
    case "VennDiagram":
      checkVennTree(text, root, problems)
      break
    case "C4Diagram":
      checkC4Tree(text, root, problems)
      break
    case "ClassDiagram":
      checkClassTree(root, problems)
      break
    case "StateDiagram":
      checkStateTree(root, problems)
      break
    case "ErDiagram":
      checkErTree(root, problems)
      break
    case "GanttDiagram":
      checkGanttTree(text, root, problems)
      break
    case "JourneyDiagram":
      checkJourneyTree(text, root, problems)
      break
    case "RequirementDiagram":
      checkRequirementTree(text, root, problems)
      break
    case "KanbanDiagram":
      checkKanbanTree(text, root, problems)
      break
    case "MindmapDiagram":
      checkMindmapTree(text, root, problems)
      break
    case "IshikawaDiagram":
      checkIshikawaTree(text, root, problems)
      break
    case "TimelineDiagram":
      checkTimelineTree(text, root, problems)
      break
    case "SankeyDiagram":
      checkSankeyTree(text, root, problems)
      break
    case "XychartDiagram":
      checkXychartTree(text, root, problems)
      break
    case "BlockDiagram":
      checkBlockTree(text, root, problems)
      break
    case "QuadrantDiagram":
      checkQuadrantTree(text, root, problems)
      break
    default:
      problems.report(
        "Root.body",
        `the body type ${root.body.type} is no diagram of the specification`,
      )
  }
  return problems.list
}
