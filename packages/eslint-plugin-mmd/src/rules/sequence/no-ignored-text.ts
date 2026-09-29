import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `sequence/no-ignored-text`, described in
 * `docs/rules/sequence/no-ignored-text.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noIgnoredText: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a line that mermaid.js reads as nothing.",
      recommended: false,
      url: ruleDocsUrl("sequence/no-ignored-text"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
