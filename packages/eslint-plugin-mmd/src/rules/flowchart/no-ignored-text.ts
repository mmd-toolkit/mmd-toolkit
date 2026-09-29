import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `flowchart/no-ignored-text`, described in
 * `docs/rules/flowchart/no-ignored-text.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noIgnoredText: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow text on a direction line that mermaid.js does not read.",
      recommended: false,
      url: ruleDocsUrl("flowchart/no-ignored-text"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
