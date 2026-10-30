import type { QuadrantQuadrantStatement } from "@mmd-toolkit/parser"
import { oneOfTwoRemovals } from "../utils/removal.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `quadrant-no-redefined-quadrant`, described in
 * `docs/rules/quadrant-no-redefined-quadrant.md`: a later statement that
 * replaces a nonempty text of its quadrant. The label value already leaves
 * out quotes and backquotes; mermaid.js also trims the text at its ends.
 * Statements of the other quadrants do not change the value being compared.
 */
export const quadrantNoRedefinedQuadrant: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a quadrant statement that replaces the text of its quadrant.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-redefined-quadrant"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement.",
      redefined:
        "mermaid.js replaces the text of `quadrant-{{quadrant}}`, set earlier, with the one of this statement.",
    },
  },
  create(context) {
    const texts = new Map<
      number,
      {
        node: QuadrantQuadrantStatement
        value: string
        before: string | undefined
      }
    >()
    return {
      QuadrantQuadrantStatement(node) {
        const value = node.text.value.trim()
        const earlier = texts.get(node.quadrant)
        if (
          earlier !== undefined &&
          earlier.value !== "" &&
          earlier.value !== value
        ) {
          context.report({
            node,
            messageId: "redefined",
            suggest: oneOfTwoRemovals(
              context.sourceCode,
              node,
              earlier.node,
              earlier.before === undefined ||
                earlier.before === "" ||
                earlier.before === value,
            ),
            data: {
              quadrant: String(node.quadrant),
            },
          })
        }
        texts.set(node.quadrant, { node, value, before: earlier?.value })
      },
    }
  },
}
