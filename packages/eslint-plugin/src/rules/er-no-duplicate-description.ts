import type {
  ErAccDescrBlockStatement,
  ErAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrText } from "../utils/acc-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/** A statement that sets the description. */
type DescriptionStatement = ErAccDescrStatement | ErAccDescrBlockStatement

/**
 * The rule `er-no-duplicate-description`, described in
 * `docs/rules/er-no-duplicate-description.md`: every statement that sets the
 * description after the first, also one inside a subgraph. An `accDescr:` line
 * sets it; a block sets it when it holds a description, and an empty block
 * sets nothing. A block is always closed in the tree. ESLint visits the
 * statements in the order of the source, so each one is compared with the one
 * before it.
 *
 * A statement is reported only when the value it sets differs from that of the
 * one before it (`accDescrText`): setting what the diagram already has loses
 * nothing.
 */
export const erNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` statement that sets the description again.",
      recommended: true,
      url: ruleDocsUrl("er-no-duplicate-description"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier description with the one of this `accDescr`.",
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement that sets the description.",
    },
  },
  create(context) {
    let previous: DescriptionStatement | null = null
    let beforePrevious: DescriptionStatement | null = null

    /** Reports `node` when a statement before it set the description. */
    function check(node: DescriptionStatement): void {
      if (previous !== null && accDescrText(previous) !== accDescrText(node)) {
        context.report({
          node,
          messageId: "duplicate",
          suggest: oneOfTwoRemovals(
            context.sourceCode,
            node,
            previous,
            beforePrevious === null ||
              accDescrText(beforePrevious) === accDescrText(node),
          ),
        })
      }
      beforePrevious = previous
      previous = node
    }

    return {
      ErAccDescrStatement: check,
      ErAccDescrBlockStatement(node) {
        if (node.value !== null) check(node)
      },
    }
  },
}
