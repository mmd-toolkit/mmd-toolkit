import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `flowchart/no-redefined-vertex`, described in
 * `docs/rules/flowchart/no-redefined-vertex.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noRedefinedVertex: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow writing the shape or the label of a vertex again, differently.",
      recommended: false,
      url: ruleDocsUrl("flowchart/no-redefined-vertex"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
