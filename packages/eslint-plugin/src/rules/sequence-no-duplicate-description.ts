import type {
  SequenceAccDescrBlockStatement,
  SequenceAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrText } from "../utils/acc-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/** A statement that sets the description. */
type DescriptionStatement =
  SequenceAccDescrStatement | SequenceAccDescrBlockStatement

/**
 * The rule `sequence-no-duplicate-description`, described in
 * `docs/rules/sequence-no-duplicate-description.md`: every statement that sets
 * the description after the first, also in a block. An `accDescr:` line sets
 * it, also one without text; a block sets it when it is closed and holds a
 * description. ESLint visits the statements in the order of the source, so each
 * one is compared with the one before it.
 *
 * A statement is reported only when the value it sets differs from that of the
 * one before it (`accDescrText`): setting what the diagram already has loses
 * nothing.
 */
export const sequenceNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` statement that sets the description again.",
      recommended: true,
      url: ruleDocsUrl("sequence-no-duplicate-description"),
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
      SequenceAccDescrStatement: check,
      SequenceAccDescrBlockStatement(node) {
        if (node.closed && node.value !== null) check(node)
      },
    }
  },
}
