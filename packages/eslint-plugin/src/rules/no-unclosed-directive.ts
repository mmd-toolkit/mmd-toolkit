import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { directiveTakesLaterLines } from "../utils/directive-arguments.ts"

/**
 * A directive can take later statements even when a later directive closes it.
 * Its name and opening JSON object or array do not count as lost diagram text.
 */
export const noUnclosedDirective: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a directive without its closing `}%%` that takes the lines after it.",
      recommended: true,
      url: ruleDocsUrl("no-unclosed-directive"),
    },
    schema: [],
    messages: {
      unclosed:
        "mermaid.js takes text from later lines into this directive, so that text disappears from the diagram.",
    },
  },
  create(context) {
    return {
      Root(root) {
        for (const directive of root.directives) {
          if (directiveTakesLaterLines(directive)) {
            context.report({ loc: directive.loc, messageId: "unclosed" })
          }
        }
      },
    }
  },
}
