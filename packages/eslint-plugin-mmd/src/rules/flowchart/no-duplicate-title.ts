import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `flowchart/no-duplicate-title`, described in
 * `docs/rules/flowchart/no-duplicate-title.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noDuplicateTitle: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` statement that sets the title again.",
      recommended: false,
      url: ruleDocsUrl("flowchart/no-duplicate-title"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
