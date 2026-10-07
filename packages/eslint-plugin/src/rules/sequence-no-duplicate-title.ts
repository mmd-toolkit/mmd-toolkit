import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `sequence-no-duplicate-title`, described in
 * `docs/rules/sequence-no-duplicate-title.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const sequenceNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `title` or `accTitle` statement that sets its title again.",
      recommended: false,
      url: ruleDocsUrl("sequence-no-duplicate-title"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
