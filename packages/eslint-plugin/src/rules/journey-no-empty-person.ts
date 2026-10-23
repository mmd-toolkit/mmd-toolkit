import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { separatorsOf } from "../utils/journey-tasks.ts"

/**
 * The rule `journey-no-empty-person`, described in
 * `docs/rules/journey-no-empty-person.md`: each person of a task that is empty
 * or whitespace only, which the tree shows as a null in `people`. A null has no
 * node, so the report marks the separator before it (`separatorsOf`).
 */
export const journeyNoEmptyPerson: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a person of a task that has no name.",
      recommended: true,
      url: ruleDocsUrl("journey-no-empty-person"),
    },
    schema: [],
    messages: {
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
            context.report({ loc: separator.loc, messageId: "empty" })
          }
        }
      },
    }
  },
}
