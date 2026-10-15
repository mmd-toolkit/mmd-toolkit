import type {
  StateAccDescrBlockStatement,
  StateAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrText } from "../utils/acc-text.ts"

/** A statement that sets the description. */
type DescriptionStatement = StateAccDescrStatement | StateAccDescrBlockStatement

/**
 * The rule `state-no-duplicate-description`, described in
 * `docs/rules/state-no-duplicate-description.md`: every statement that sets the
 * description after the first. An `accDescr:` line sets it, also one without
 * text; a block sets it when it is closed and holds a description. Inside a
 * composite state, `accDescr: x` is a state, and the tree has no
 * `StateAccDescrStatement` there. ESLint visits the statements in the order of
 * the source, so each one is compared with the one before it.
 *
 * A statement is reported only when the value it sets differs from that of the
 * one before it (`accDescrText`): setting what the diagram already has loses nothing.
 */
export const stateNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` statement that sets the description again.",
      recommended: true,
      url: ruleDocsUrl("state-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the description set on line {{line}} with the one of this `accDescr`.",
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
          data: { line: String(previous.loc.start.line) },
        })
      }
      previous = node
    }

    return {
      StateAccDescrStatement: check,
      StateAccDescrBlockStatement(node) {
        if (node.closed && node.value !== null) check(node)
      },
    }
  },
}
