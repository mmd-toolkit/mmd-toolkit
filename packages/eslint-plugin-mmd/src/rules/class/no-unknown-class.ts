import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `class/no-unknown-class`, described in
 * `docs/rules/class/no-unknown-class.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noUnknownClass: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a statement that refers to a class that the diagram does not have.",
      recommended: false,
      url: ruleDocsUrl("class/no-unknown-class"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
