import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * Reports a directive without its closing `}%%`
 * (`docs/rules/no-unclosed-directive.md`). The directive records of the root
 * hold whether each directive is closed.
 */
export const noUnclosedDirective: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a directive without its closing `}%%`.",
      recommended: false,
      url: ruleDocsUrl("no-unclosed-directive"),
    },
    schema: [],
    messages: {
      unclosed:
        "This directive has no closing `}%%`: mermaid.js ends it where its argument ends and removes it, with what it covers, from the diagram.",
    },
  },
  create(context) {
    return {
      Root(root) {
        for (const directive of root.directives) {
          if (!directive.closed) {
            context.report({ loc: directive.loc, messageId: "unclosed" })
          }
        }
      },
    }
  },
}
