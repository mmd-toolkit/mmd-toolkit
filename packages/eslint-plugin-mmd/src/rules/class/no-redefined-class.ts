import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `class/no-redefined-class`, described in
 * `docs/rules/class/no-redefined-class.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noRedefinedClass: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow writing the label of a class again, differently.",
      recommended: false,
      url: ruleDocsUrl("class/no-redefined-class"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
