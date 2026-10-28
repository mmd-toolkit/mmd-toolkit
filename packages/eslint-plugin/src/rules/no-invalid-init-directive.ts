import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { invalidInitReason } from "../utils/directive-arguments.ts"

/**
 * Check the root's written directives, including ones on closing-marker lines.
 */
export const noInvalidInitDirective: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "nameCase" | "invalid"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a directive meant to configure the diagram that is not written validly, so that mermaid.js ignores it.",
      recommended: true,
      url: ruleDocsUrl("no-invalid-init-directive"),
    },
    schema: [],
    messages: {
      nameCase:
        "mermaid.js reads no settings from `{{name}}`; init directive names are case-sensitive.",
      invalid:
        "mermaid.js reads no settings from this init directive because its JSON argument is invalid.",
    },
  },
  create(context) {
    return {
      Root(root) {
        for (const directive of root.directives) {
          const reason = invalidInitReason(directive)
          if (reason !== null) {
            context.report({
              loc: directive.loc,
              messageId: reason,
              data: { name: directive.name },
            })
          }
        }
      },
    }
  },
}
