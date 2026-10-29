import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { classIdOf } from "../utils/class-names.ts"

/**
 * The rule `class-no-redefined-class`, described in
 * `docs/rules/class-no-redefined-class.md`: a class statement with a label for
 * a class that was declared before with a different label, also in a namespace.
 * A class statement without a label keeps the label, and the same label again
 * changes nothing. The classes are compared by their ids (`classIdOf`), and
 * ESLint visits the statements in the order of the source.
 */
export const classNoRedefinedClass: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow writing the label of a class again, differently.",
      recommended: true,
      url: ruleDocsUrl("class-no-redefined-class"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the label `{{previous}}` of the class `{{id}}`, set earlier, with this one.",
    },
  },
  create(context) {
    /** For each class id, the label that the class has. */
    const labels = new Map<string, string>()
    return {
      ClassDeclaration(node) {
        if (node.label === null) return
        const id = classIdOf(node.name)
        const { value } = node.label
        const earlier = labels.get(id)
        if (earlier !== undefined && earlier !== value) {
          context.report({
            node,
            messageId: "redefined",
            data: {
              previous: earlier,
              id,
            },
          })
        }
        labels.set(id, value)
      },
    }
  },
}
