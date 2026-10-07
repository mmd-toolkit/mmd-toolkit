import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `sequence-no-create-destroy`, described in
 * `docs/rules/sequence-no-create-destroy.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const sequenceNoCreateDestroy: MermaidRuleDefinition<{
  RuleOptions: []
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow `create` before `destroy`.",
      recommended: false,
      url: ruleDocsUrl("sequence-no-create-destroy"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
