import type {
  FlowchartAccDescrBlockStatement,
  FlowchartAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrText } from "../utils/acc-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/** A statement that sets the description. */
type DescriptionStatement =
  FlowchartAccDescrStatement | FlowchartAccDescrBlockStatement

/**
 * The rule `flowchart-no-duplicate-description`, described in
 * `docs/rules/flowchart-no-duplicate-description.md`: every statement that sets
 * the description after the first, also in a subgraph. An `accDescr:` line
 * sets it, also one without text; a block sets it when it is closed and holds
 * a description. ESLint visits the statements in the order of the source, so
 * each one is compared with the one before it.
 *
 * A statement is reported only when the value it sets differs from that of the
 * one before it (`accDescrText`): setting what the diagram already has loses
 * nothing.
 */
export const flowchartNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` statement that sets the description again.",
      recommended: true,
      url: ruleDocsUrl("flowchart-no-duplicate-description"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the description set on line {{line}} with the one of this `accDescr`.",
      removeThis:
        "Remove this statement: mermaid.js uses the last description that remains.",
      removePrevious:
        "Remove the statement on line {{line}} that sets the description: mermaid.js uses the last description that remains.",
    },
  },
  create(context) {
    const { sourceCode } = context
    let previous: DescriptionStatement | null = null

    /** Reports `node` when a statement before it set the description. */
    function check(node: DescriptionStatement): void {
      if (previous !== null && accDescrText(previous) !== accDescrText(node)) {
        context.report({
          node,
          messageId: "duplicate",
          data: { line: String(previous.loc.start.line) },
          suggest: oneOfTwoRemovals(sourceCode, node, previous),
        })
      }
      previous = node
    }

    return {
      FlowchartAccDescrStatement: check,
      FlowchartAccDescrBlockStatement(node) {
        if (node.closed && node.value !== null) check(node)
      },
    }
  },
}
