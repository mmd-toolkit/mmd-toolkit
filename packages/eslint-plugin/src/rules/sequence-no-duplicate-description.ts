import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `sequence-no-duplicate-description`, described in
 * `docs/rules/sequence-no-duplicate-description.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const sequenceNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` statement that sets the description again.",
      recommended: false,
      url: ruleDocsUrl("sequence-no-duplicate-description"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
