import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `class/no-unclosed-backquote`, described in
 * `docs/rules/class/no-unclosed-backquote.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noUnclosedBackquote: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a backquoted class name without its closing backquote.",
      recommended: false,
      url: ruleDocsUrl("class/no-unclosed-backquote"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
