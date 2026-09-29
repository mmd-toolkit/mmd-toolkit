import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `flowchart/no-empty-description-block`, described in
 * `docs/rules/flowchart/no-empty-description-block.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: false,
      url: ruleDocsUrl("flowchart/no-empty-description-block"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
