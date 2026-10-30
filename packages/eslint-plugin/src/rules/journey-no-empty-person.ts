import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { JourneyTaskStatement, Range } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { separatorsOf } from "../utils/journey-tasks.ts"

/** Keep the people list's colon, except when no person would remain. */
function personSuggestions(
  sourceCode: MermaidSourceCode,
  node: JourneyTaskStatement,
  index: number,
): SuggestedEdit<"removeEmptyPerson">[] {
  if (node.textAfter !== null) return []
  const { beforePerson } = separatorsOf(sourceCode, node)
  const separator = beforePerson[index]
  if (separator === undefined) return []
  let range: Range
  if (node.people.every((person) => person === null))
    range = [beforePerson[0].range[0], node.range[1]]
  else if (index === 0) {
    const next = beforePerson[1]
    if (next === undefined) return []
    range = [separator.range[1], next.range[1]]
  } else
    range = [
      separator.range[0],
      beforePerson[index + 1]?.range[0] ?? node.range[1],
    ]
  if (!canEditRange(sourceCode, range) || !canCompactRange(sourceCode, range))
    return []
  return [
    {
      messageId: "removeEmptyPerson",
      fix: (fixer) => fixer.removeRange(range),
    },
  ]
}

/**
 * The rule `journey-no-empty-person`, described in
 * `docs/rules/journey-no-empty-person.md`: each person of a task that is empty
 * or whitespace only, which the tree shows as a null in `people`. A null has no
 * node, so the report marks the separator before it (`separatorsOf`).
 */
export const journeyNoEmptyPerson: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty" | "removeEmptyPerson"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a person of a task that has no name.",
      recommended: true,
      url: ruleDocsUrl("journey-no-empty-person"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeEmptyPerson: "Remove this empty person and its separator.",
      empty:
        "mermaid.js takes the empty name after this separator as a person of the task.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      JourneyTaskStatement(node) {
        const { beforePerson } = separatorsOf(sourceCode, node)
        for (const [index, person] of node.people.entries()) {
          const separator = beforePerson[index]
          if (person === null && separator !== undefined) {
            context.report({
              loc: separator.loc,
              messageId: "empty",
              suggest: personSuggestions(sourceCode, node, index),
            })
          }
        }
      },
    }
  },
}
