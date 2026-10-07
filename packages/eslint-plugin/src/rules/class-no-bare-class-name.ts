import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `class-no-bare-class-name`, described in
 * `docs/rules/class-no-bare-class-name.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const classNoBareClassName: MermaidRuleDefinition<{ RuleOptions: [] }> =
  {
    meta: {
      type: "problem",
      docs: {
        description:
          "Disallow a class name alone on its line, which changes nothing.",
        recommended: false,
        url: ruleDocsUrl("class-no-bare-class-name"),
      },
      schema: [],
      messages: {},
    },
    create() {
      return {}
    },
  }
