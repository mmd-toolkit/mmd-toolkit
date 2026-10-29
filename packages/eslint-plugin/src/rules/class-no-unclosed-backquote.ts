import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `class-no-unclosed-backquote`, described in
 * `docs/rules/class-no-unclosed-backquote.md`: a class name whose backquoted
 * name is a `StringLiteral` that is not closed. It runs to the end of the text,
 * so the statements after it are part of the name. The report marks the
 * backquote that opens it.
 */
export const classNoUnclosedBackquote: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a backquoted class name without its closing backquote.",
      recommended: true,
      url: ruleDocsUrl("class-no-unclosed-backquote"),
    },

    schema: [],
    messages: {
      unclosed:
        "mermaid.js reads the rest of the text after this backquote as part of the class name.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      ClassName(node) {
        const { name } = node
        if (name.type !== "StringLiteral" || name.closed) return
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(name.range[0]),
            end: sourceCode.getLocFromIndex(name.range[0] + 1),
          },
          messageId: "unclosed",
        })
      },
    }
  },
}
