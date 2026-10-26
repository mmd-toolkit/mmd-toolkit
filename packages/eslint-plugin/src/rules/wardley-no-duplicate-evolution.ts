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

/** Only a change to the drawn stage names or boundaries replaces the earlier row. */
export const wardleyNoDuplicateEvolution: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `evolution` that replaces the stages set before it.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-duplicate-evolution"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the evolution stages set on line {{line}} with these stages.",
    },
  },
  create(context) {
    let previous: { stages: readonly Stage[]; line: number } | null = null
    return {
      WardleyEvolutionStatement(node) {
        const stages = stagesOf(node)
        if (
          previous !== null &&
          (previous.stages.length !== stages.length ||
            previous.stages.some(
              (stage, at) =>
                stage.label !== stages[at]?.label ||
                stage.boundary !== stages[at]?.boundary,
            ))
        ) {
          context.report({
            node,
            messageId: "duplicate",
            data: { line: String(previous.line) },
          })
        }
        previous = { stages, line: node.loc.start.line }
      },
    }
  },
}
