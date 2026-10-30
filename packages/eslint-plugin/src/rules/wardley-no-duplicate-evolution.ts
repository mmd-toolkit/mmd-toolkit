import { oneOfTwoRemovals } from "../utils/removal.ts"
import type { WardleyEvolutionStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { wardleyNameText } from "../utils/wardley-declarations.ts"

/** A stage's joined display name and the boundary used by the drawing. */
interface Stage {
  readonly label: string
  readonly boundary: number
}

/** Incomplete boundary lists draw equally spaced stages, irrespective of their written boundaries. */
function stagesOf(node: WardleyEvolutionStatement): Stage[] {
  const complete = node.stages.every((stage) => stage.boundary !== null)
  return node.stages.map((stage, at) => {
    const first = wardleyNameText(stage.name).trim()
    const second =
      stage.secondName === null ? "" : wardleyNameText(stage.secondName)
    return {
      label: second === "" ? first : `${first} / ${second.trim()}`,
      boundary:
        complete && stage.boundary !== null
          ? stage.boundary.value
          : (at + 1) / node.stages.length,
    }
  })
}

/** Stage order, displayed names and effective boundaries all participate. */
function sameStages(left: readonly Stage[], right: readonly Stage[]): boolean {
  return (
    left.length === right.length &&
    left.every(
      (stage, at) =>
        stage.label === right[at]?.label &&
        stage.boundary === right[at]?.boundary,
    )
  )
}

/** Only a change to the drawn stage names or boundaries replaces the earlier row. */
export const wardleyNoDuplicateEvolution: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `evolution` that replaces the stages set before it.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-duplicate-evolution"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement.",
      duplicate:
        "mermaid.js replaces the earlier evolution stages with these stages.",
    },
  },
  create(context) {
    let previous: {
      node: WardleyEvolutionStatement
      stages: readonly Stage[]
      before: readonly Stage[] | undefined
    } | null = null
    return {
      WardleyEvolutionStatement(node) {
        const stages = stagesOf(node)
        if (previous !== null && !sameStages(previous.stages, stages)) {
          context.report({
            node,
            messageId: "duplicate",
            suggest: oneOfTwoRemovals(
              context.sourceCode,
              node,
              previous.node,
              previous.before === undefined ||
                sameStages(previous.before, stages),
            ),
          })
        }
        previous = { node, stages, before: previous?.stages }
      },
    }
  },
}
