import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `class-no-inline-comment`, described in
 * `docs/rules/class-no-inline-comment.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const classNoInlineComment: MermaidRuleDefinition<{ RuleOptions: [] }> =
  {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow a comment after other text on its line.",
        recommended: false,
        url: ruleDocsUrl("class-no-inline-comment"),
      },
      schema: [],
      messages: {},
    },
    create() {
      return {}
    },
  }
