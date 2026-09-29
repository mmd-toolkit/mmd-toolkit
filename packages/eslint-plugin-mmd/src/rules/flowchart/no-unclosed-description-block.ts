import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `flowchart/no-unclosed-description-block`, described in
 * `docs/rules/flowchart/no-unclosed-description-block.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr {` block without its closing `}`.",
      recommended: false,
      url: ruleDocsUrl("flowchart/no-unclosed-description-block"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
