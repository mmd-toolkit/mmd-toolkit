import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `class-no-duplicate-title`, described in
 * `docs/rules/class-no-duplicate-title.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const classNoDuplicateTitle: MermaidRuleDefinition<{ RuleOptions: [] }> =
  {
    meta: {
      type: "problem",
      docs: {
        description:
          "Disallow an `accTitle` statement that sets the title again.",
        recommended: false,
        url: ruleDocsUrl("class-no-duplicate-title"),
      },
      schema: [],
      messages: {},
    },
    create() {
      return {}
    },
  }
