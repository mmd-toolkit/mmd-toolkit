import { blockClosingSuggestions } from "../utils/description-block-suggestions.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { holdsBraceAfterBraceLine } from "../utils/description-block.ts"

/**
 * The rule `state-no-unclosed-description-block`, described in
 * `docs/rules/state-no-unclosed-description-block.md`: an `accDescr {` block
 * that no `}` closes, which the tree shows as a `StateAccDescrBlockStatement`
 * whose `closed` is false, and a closed block whose text holds a `{` after the
 * line of the block's `{`: it ends at a `}` written for another statement.
 * Unlike in `flowchart-no-unclosed-description-block`, a `}` alone on its line
 * is no exception: the body of a composite state ends with such a `}`.
 */
export const stateNoUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed" | "closedByOtherBrace" | "closeAtTextEnd"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr {` block without its closing `}`.",
      recommended: false,
      url: ruleDocsUrl("state-no-unclosed-description-block"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      unclosed:
        "mermaid.js reads the rest of the diagram as the text of this unclosed `accDescr {` block, and sets an empty description.",
      closedByOtherBrace:
        "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",

      closeAtTextEnd: "Close the block at the end of the text.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      StateAccDescrBlockStatement(node) {
        // The report marks where the block opens, `accDescr {`, its first two
        // tokens.
        const [keyword, brace, ...rest] = sourceCode.getTokens(node)
        if (keyword === undefined || brace === undefined) return
        const loc = { start: keyword.loc.start, end: brace.loc.end }
        if (!node.closed) {
          context.report({
            loc,
            messageId: "unclosed",
            suggest: blockClosingSuggestions(sourceCode, brace, rest),
          })
          return
        }
        if (holdsBraceAfterBraceLine(sourceCode, brace, rest)) {
          context.report({
            loc,
            messageId: "closedByOtherBrace",
          })
        }
      },
    }
  },
}
