import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `sequence-no-link-without-separator`, described in
 * `docs/rules/sequence-no-link-without-separator.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const sequenceNoLinkWithoutSeparator: MermaidRuleDefinition<{
  RuleOptions: []
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `link` statement without the `@` between its label and its URL.",
      recommended: false,
      url: ruleDocsUrl("sequence-no-link-without-separator"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
