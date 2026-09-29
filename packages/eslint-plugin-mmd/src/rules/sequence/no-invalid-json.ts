import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `sequence/no-invalid-json`, described in
 * `docs/rules/sequence/no-invalid-json.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noInvalidJson: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `links` or `properties` statement whose text is not a JSON object.",
      recommended: false,
      url: ruleDocsUrl("sequence/no-invalid-json"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
