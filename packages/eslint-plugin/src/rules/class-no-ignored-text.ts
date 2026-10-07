import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `class-no-ignored-text`, described in
 * `docs/rules/class-no-ignored-text.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const classNoIgnoredText: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow text that mermaid.js does not read.",
      recommended: false,
      url: ruleDocsUrl("class-no-ignored-text"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
