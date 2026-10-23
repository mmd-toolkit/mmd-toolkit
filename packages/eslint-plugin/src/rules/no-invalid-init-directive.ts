import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `no-invalid-init-directive`, described in
 * `docs/rules/no-invalid-init-directive.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noInvalidInitDirective: MermaidRuleDefinition<{
  RuleOptions: []
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a directive meant to configure the diagram that is not written validly, so that mermaid.js ignores it.",
      recommended: false,
      url: ruleDocsUrl("no-invalid-init-directive"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
