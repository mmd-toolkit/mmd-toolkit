import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `sequence-no-create-destroy`, described in
 * `docs/rules/sequence-no-create-destroy.md`: a `destroy` statement that
 * `create` comes before, which the tree shows as a `SequenceDestroyStatement`
 * whose `created` is true. mermaid.js creates the participant there, as
 * `create participant` does, and destroys nothing.
 */
export const sequenceNoCreateDestroy: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "createdNotDestroyed"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow `create` before `destroy`.",
      recommended: true,
      url: ruleDocsUrl("sequence-no-create-destroy"),
    },
    schema: [],
    messages: {
      createdNotDestroyed:
        "mermaid.js reads `create destroy {{name}}` as `create participant {{name}}`: it creates the participant and destroys nothing.",
    },
  },
  create(context) {
    return {
      SequenceDestroyStatement(node) {
        if (!node.created) return
        context.report({
          node,
          messageId: "createdNotDestroyed",
          data: { name: node.id.name },
        })
      },
    }
  },
}
