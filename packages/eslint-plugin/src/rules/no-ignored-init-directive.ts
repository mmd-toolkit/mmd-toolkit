import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `no-ignored-init-directive`, described in
 * `docs/rules/no-ignored-init-directive.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noIgnoredInitDirective: MermaidRuleDefinition<{
  RuleOptions: []
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a directive meant to configure the diagram that mermaid.js ignores.",
      recommended: false,
      url: ruleDocsUrl("no-ignored-init-directive"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
