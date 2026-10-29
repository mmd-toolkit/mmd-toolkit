import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { duplicateInitKeys } from "../utils/directive-arguments.ts"

/** Each object keeps its own key history; separate directives never replace it. */
export const noDuplicateInitKey: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a key written twice in one object of the JSON of an init directive.",
      recommended: true,
      url: ruleDocsUrl("no-duplicate-init-key"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier value of key {{key}} in this init directive with this value.",
    },
  },
  create(context) {
    return {
      Root(root) {
        for (const directive of root.directives) {
          for (const key of duplicateInitKeys(directive)) {
            context.report({
              loc: directive.loc,
              messageId: "duplicate",
              data: { key },
            })
          }
        }
      },
    }
  },
}
