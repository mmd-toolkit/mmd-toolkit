import { checkClassTree } from "./class.ts"
import { checkErTree } from "./er.ts"
import { checkErrorDiagramTokens } from "./error-diagram.ts"
import { checkFlowchartTree, stringDelimitersOf } from "./flowchart.ts"
import { checkGanttTree } from "./gantt.ts"
import { checkInvariants } from "./invariants.ts"
import { checkJourneyTree } from "./journey.ts"
import { checkMindmapTree, mindmapLabelDelimitersFor } from "./mindmap.ts"
import { checkNullFields } from "./null-fields.ts"
import { checkRequirementTree } from "./requirement.ts"
import { checkSharedLeaves } from "./leaves.ts"
import { Problems } from "./problems.ts"
import { checkShape } from "./shape.ts"
import { checkSequenceTree } from "./sequence.ts"
import { checkStateTree } from "./state.ts"
import { checkPunctuatorsAreWhole } from "./punctuators.ts"
import { checkStringsAreWhole, checkTokensAreNotCut } from "./tokens.ts"
import { checkValues, quoteDelimitersOf } from "./values.ts"
import type { StringDelimitersOf } from "./values.ts"
import type { CheckedRoot, TreeProblem } from "./types.ts"

export type { CheckedRoot, TreeProblem } from "./types.ts"

/** The delimiters of the strings of the diagram of `root`. */
function stringDelimitersFor(
  text: string,
  root: CheckedRoot,
): StringDelimitersOf {
  switch (root.body.type) {
    case "FlowchartDiagram":
      return stringDelimitersOf(text, root)
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
  checkInvariants(text, root, problems)
  checkSharedLeaves(root, problems)
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
    case "FlowchartDiagram":
      checkFlowchartTree(text, root, delimitersOf, problems)
      break
    case "SequenceDiagram":
      checkSequenceTree(root, problems)
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
    case "MindmapDiagram":
      checkMindmapTree(text, root, problems)
      break
    default:
      problems.report(
        "Root.body",
        `the body type ${root.body.type} is no diagram of the specification`,
      )
  }
  return problems.list
}
