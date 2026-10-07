import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `class-no-undef`, described in `docs/rules/class-no-undef.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const classNoUndef: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a statement that refers to a class that the diagram does not define.",
      recommended: false,
      url: ruleDocsUrl("class-no-undef"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
