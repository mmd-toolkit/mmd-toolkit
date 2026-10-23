import type { StateAccTitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { titleText } from "../utils/acc-text.ts"

/**
 * The rule `state-no-duplicate-title`, described in
 * `docs/rules/state-no-duplicate-title.md`: every `accTitle` statement after the
 * first, also one without text. Inside a composite state, `accTitle: x` is a
 * state, and the tree has no `StateAccTitleStatement` there. ESLint visits the
 * statements in the order of the source, so each one is compared with the one
 * before it.
 *
 * A statement is reported only when the value it sets differs from that of the
 * one before it (`titleText`): setting what the diagram already has loses
 * nothing.
 */
export const stateNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` statement that sets the title again.",
      recommended: true,
      url: ruleDocsUrl("state-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the title set on line {{line}} with the one of this `accTitle`.",
    },
  },
  create(context) {
    let previous: StateAccTitleStatement | null = null
    return {
      StateAccTitleStatement(node) {
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
