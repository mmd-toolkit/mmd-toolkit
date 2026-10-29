import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { JourneyTaskStatement } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { separatorsOf } from "../utils/journey-tasks.ts"

/** The lowest and the highest score that the scale of a journey has. */
const LOWEST_SCORE = 1
const HIGHEST_SCORE = 5

/** The scale, as the messages show it. */
const SCALE = { lowest: String(LOWEST_SCORE), highest: String(HIGHEST_SCORE) }

/** Journey's ordinary keywords need whitespace; accessibility keywords introduce `:` or `{`. */
function startsStatement(text: string): boolean {
  return (
    ["title", "section"].some(
      (word) => text.startsWith(word) && text[word.length]?.trim() === "",
    ) ||
    ["acctitle", "accdescr"].some((word) => {
      if (!text.startsWith(word)) return false
      const after = text.slice(word.length).trimStart()
      return (
        after.startsWith(":") || (word === "accdescr" && after.startsWith("{"))
      )
    })
  )
}

/** A written in-scale score can be separated from people, never from a statement keyword. */
function colonSuggestions(
  sourceCode: MermaidSourceCode,
  node: JourneyTaskStatement,
): SuggestedEdit<"insertColon">[] {
  if (node.score === null || node.people.length > 0) return []
  const text = sourceCode.getText(node.score)
  let scoreEnd = 0
  while (
    scoreEnd < text.length &&
    text[scoreEnd].trim() !== "" &&
    text[scoreEnd] !== ","
  )
    scoreEnd++
  const score = Number(text.slice(0, scoreEnd))
  if (!Number.isFinite(score) || score < LOWEST_SCORE || score > HIGHEST_SCORE)
    return []
  let after = scoreEnd
  while (after < text.length && text[after].trim() === "") after++
  if (text[after] === ",") {
    after++
    while (after < text.length && text[after].trim() === "") after++
  }
  if (after === scoreEnd || after === text.length) return []
  const rest = text.slice(after).toLowerCase()
  if (rest.startsWith("%%") || startsStatement(rest)) return []
  const start = node.score.range[0] + scoreEnd
  const end = node.score.range[0] + after
  if (
    !canEditRange(sourceCode, [start, end]) ||
    !canCompactRange(sourceCode, [start, end])
  )
    return []
  return [
    {
      messageId: "insertColon",
      fix: (fixer) => fixer.replaceTextRange([start, end], ": "),
    },
  ]
}

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
  MessageIds: "notNumber" | "outOfScale" | "empty" | "insertColon"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a task score that is not a number from 1 to 5.",
      recommended: true,
      url: ruleDocsUrl("journey-no-invalid-score"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      insertColon: "Insert `: ` after the score.",
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
            suggest: colonSuggestions(sourceCode, node),
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
