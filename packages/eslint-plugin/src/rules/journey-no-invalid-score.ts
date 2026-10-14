import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { separatorsOf } from "../utils/journey-tasks.ts"

/** The lowest and the highest score that the scale of a journey has. */
const LOWEST_SCORE = 1
const HIGHEST_SCORE = 5

/** The scale, as the messages show it. */
const SCALE = { lowest: String(LOWEST_SCORE), highest: String(HIGHEST_SCORE) }

/**
 * The rule `journey-no-invalid-score`, described in
 * `docs/rules/journey-no-invalid-score.md`: the score of a task that is no
 * number, or a number below 1 or above 5. mermaid.js reads the score with the
 * `Number` of JavaScript; the tree keeps the score as written, without the
 * whitespace at its ends, and an empty score as null, which `Number` reads as 0.
 * A score that the tree lacks is reported at the first colon of the task.
 */
export const journeyNoInvalidScore: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "notNumber" | "outOfScale" | "empty"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a task score that is not a number from 1 to 5.",
      recommended: true,
      url: ruleDocsUrl("journey-no-invalid-score"),
    },
    schema: [],
    messages: {
      notNumber:
        "mermaid.js reads the score `{{score}}` of this task as no number.",
      outOfScale:
        "mermaid.js reads the score `{{score}}` of this task as the number {{number}}, which is outside the scale from {{lowest}} to {{highest}}.",
      empty:
        "mermaid.js reads the empty score of this task as the number 0, which is outside the scale from {{lowest}} to {{highest}}.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      JourneyTaskStatement(node) {
        if (node.score === null) {
          const { firstColon } = separatorsOf(sourceCode, node)
          if (firstColon === undefined) return
          context.report({
            loc: firstColon.loc,
            messageId: "empty",
            data: SCALE,
          })
          return
        }
        const score = node.score.value
        const number = Number(score)
        if (Number.isNaN(number)) {
          context.report({
            node: node.score,
            messageId: "notNumber",
            data: { score },
          })
        } else if (number < LOWEST_SCORE || number > HIGHEST_SCORE) {
          context.report({
            node: node.score,
            messageId: "outOfScale",
            data: { score, number: String(number), ...SCALE },
          })
        }
      },
    }
  },
}
