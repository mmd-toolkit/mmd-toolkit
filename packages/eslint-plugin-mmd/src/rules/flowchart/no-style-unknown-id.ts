import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `flowchart/no-style-unknown-id`, described in
 * `docs/rules/flowchart/no-style-unknown-id.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noStyleUnknownId: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `style` statement whose id names no vertex and no subgraph.",
      recommended: false,
      url: ruleDocsUrl("flowchart/no-style-unknown-id"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
