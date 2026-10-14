import type { ErAccTitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `er-no-duplicate-title`, described in
 * `docs/rules/er-no-duplicate-title.md`: every `accTitle` statement after the
 * first, also one without text on its line, which takes the next line that
 * holds text, and also one inside a subgraph. ESLint visits the statements in
 * the order of the source, so each one is compared with the one before it.
 */
export const erNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` statement that sets the title again.",
      recommended: true,
      url: ruleDocsUrl("er-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the title set on line {{line}} with the one of this `accTitle`.",
    },
  },
  create(context) {
    let previous: ErAccTitleStatement | null = null
    return {
      ErAccTitleStatement(node) {
        if (previous !== null) {
          context.report({
            node,
            messageId: "duplicate",
            data: { line: String(previous.loc.start.line) },
          })
        }
        previous = node
      },
    }
  },
}
