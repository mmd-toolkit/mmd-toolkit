import type {
  ClassAccDescrBlockStatement,
  ClassAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrText } from "../utils/acc-text.ts"

/** A statement that sets the description. */
type DescriptionStatement = ClassAccDescrStatement | ClassAccDescrBlockStatement

/**
 * The rule `class-no-duplicate-description`, described in
 * `docs/rules/class-no-duplicate-description.md`: every statement that sets the
 * description after the first. An `accDescr:` line sets it; a block sets it when
 * it holds a description (mermaid.js rejects a block that is not closed, and an
 * empty block does not set it). ESLint visits the statements in the order of the
 * source, so each one is compared with the one before it.
 *
 * A statement is reported only when the value it sets differs from that of the
 * one before it (`accDescrText`): setting what the diagram already has loses
 * nothing.
 */
export const classNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` statement that sets the description again.",
      recommended: true,
      url: ruleDocsUrl("class-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier description with the one of this `accDescr`.",
    },
  },
  create(context) {
    let previous: DescriptionStatement | null = null

    /** Reports `node` when a statement before it set the description. */
    function check(node: DescriptionStatement): void {
      if (previous !== null && accDescrText(previous) !== accDescrText(node)) {
        context.report({
          node,
          messageId: "duplicate",
        })
      }
      previous = node
    }

    return {
      ClassAccDescrStatement: check,
      ClassAccDescrBlockStatement(node) {
        if (node.value !== null) check(node)
      },
    }
  },
}
