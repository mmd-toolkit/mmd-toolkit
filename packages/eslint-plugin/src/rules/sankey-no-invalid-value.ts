import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The start of a text that `parseFloat` of JavaScript reads, which mermaid.js
 * uses for the value of a link: an optional sign, then `Infinity` or digits
 * with an optional decimal point and exponent.
 */
const NUMBER_AT_START =
  /^[+-]?(?:Infinity|(?:\d+\.?\d*|\.\d+)(?:[Ee][+-]?\d+)?)/u

/**
 * The rule `sankey-no-invalid-value`, described in
 * `docs/rules/sankey-no-invalid-value.md`: the value of a link when
 * mermaid.js does not read its whole text as a number. The text is read
 * without the whitespace at its ends, for a value in quotes too. A text that
 * does not start with a number is reported as no number; text after the number
 * is reported as dropped, unless it starts with `%%` (after whitespace, if
 * any), which the author marks as a comment. The tree holds the value as
 * mermaid.js reads it: without directives, without the `;` that the line
 * rule ignores, and without the comment lines inside a string.
 */
export const sankeyNoInvalidValue: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "notNumber" | "dropped"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a link value that mermaid.js does not read as written.",
      recommended: true,
      url: ruleDocsUrl("sankey-no-invalid-value"),
    },
    schema: [],
    messages: {
      notNumber:
        "mermaid.js reads this value as NaN, because it does not start with a number: the link has no size.",
      dropped:
        "mermaid.js reads only the number at the start of this value and drops the rest of it.",
    },
  },
  create(context) {
    return {
      SankeyLinkStatement(node) {
        const text = node.value.value.trim()
        const number = NUMBER_AT_START.exec(text)
        if (number === null) {
          context.report({
            node: node.value,
            messageId: "notNumber",
          })
          return
        }
        const rest = text.slice(number[0].length)
        if (rest !== "" && !rest.trimStart().startsWith("%%")) {
          context.report({
            node: node.value,
            messageId: "dropped",
          })
        }
      },
    }
  },
}
