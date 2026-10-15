import type { FlowchartAccTitleStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { titleText } from "../utils/acc-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/**
 * The rule `flowchart-no-duplicate-title`, described in
 * `docs/rules/flowchart-no-duplicate-title.md`: every `accTitle` statement
 * after the first, also in a subgraph and also one without text. ESLint visits
 * the statements in the order of the source, so each one is compared with the
 * one before it.
 *
 * A statement is reported only when the value it sets differs from that of the
 * one before it (`titleText`): setting what the diagram already has loses
 * nothing.
 */
export const flowchartNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accTitle` statement that sets the title again.",
      recommended: true,
      url: ruleDocsUrl("flowchart-no-duplicate-title"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the title set on line {{line}} with the one of this `accTitle`.",
      removeThis:
        "Remove this `accTitle` statement: mermaid.js uses the last title that remains.",
      removePrevious:
        "Remove the `accTitle` statement on line {{line}}: mermaid.js uses the last title that remains.",
    },
  },
  create(context) {
    const { sourceCode } = context
    let previous: FlowchartAccTitleStatement | null = null
    return {
      FlowchartAccTitleStatement(node) {
        if (previous !== null && titleText(previous) !== titleText(node)) {
          context.report({
            node,
            messageId: "duplicate",
            data: { line: String(previous.loc.start.line) },
            suggest: oneOfTwoRemovals(sourceCode, node, previous),
          })
        }
        previous = node
      },
    }
  },
}
