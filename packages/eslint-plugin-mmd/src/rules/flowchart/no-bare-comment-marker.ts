import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"

/**
 * The rule `flowchart/no-bare-comment-marker`, described in
 * `docs/rules/flowchart/no-bare-comment-marker.md`.
 * It is a skeleton: it has the meta of the rule and reports nothing yet.
 */
export const noBareCommentMarker: MermaidRuleDefinition<{ RuleOptions: [] }> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a line that holds only `%%`.",
      recommended: false,
      url: ruleDocsUrl("flowchart/no-bare-comment-marker"),
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}
