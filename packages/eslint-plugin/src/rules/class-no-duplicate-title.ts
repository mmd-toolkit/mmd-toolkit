import type { ClassAccTitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { titleText } from "../utils/acc-text.ts"

/**
 * The rule `class-no-duplicate-title`, described in
 * `docs/rules/class-no-duplicate-title.md`: every `accTitle` statement after
 * the first, also one without text, which takes the next line that holds text.
 * ESLint visits the statements in the order of the source, so each one is
 * compared with the one before it.
 *
 * A statement is reported only when the value it sets differs from that of the
 * one before it (`titleText`): setting what the diagram already has loses
 * nothing.
 */
export const classNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` statement that sets the title again.",
      recommended: true,
      url: ruleDocsUrl("class-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the title set on line {{line}} with the one of this `accTitle`.",
    },
  },
  create(context) {
    let previous: ClassAccTitleStatement | null = null
    return {
      ClassAccTitleStatement(node) {
        if (previous !== null && titleText(previous) !== titleText(node)) {
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
