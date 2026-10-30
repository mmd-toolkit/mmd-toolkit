import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { closedByBraceOfOtherStatement } from "../utils/description-block.ts"
import { blockClosingSuggestions } from "../utils/description-block-suggestions.ts"

/**
 * The rule `flowchart-no-unclosed-description-block`, described in
 * `docs/rules/flowchart-no-unclosed-description-block.md`: an `accDescr {`
 * block that no `}` closes, which the tree shows as a
 * `FlowchartAccDescrBlockStatement` whose `closed` is false.
 */
export const flowchartNoUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed" | "closedByOtherBrace" | "closeAtTextEnd"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr {` block without its closing `}`.",
      recommended: false,
      url: ruleDocsUrl("flowchart-no-unclosed-description-block"),
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
      FlowchartAccDescrBlockStatement(node) {
        // The report marks where the block opens, `accDescr {`, its first two
        // tokens.
        const [keyword, brace, ...rest] = sourceCode.getTokens(node)
        if (keyword === undefined || brace === undefined) return
        const loc = { start: keyword.loc.start, end: brace.loc.end }
        if (!node.closed) {
          // The block runs to the end of the text.
          context.report({
            loc,
            messageId: "unclosed",
            suggest: blockClosingSuggestions(sourceCode, brace, rest),
          })
          return
        }
        // The first `}` after the `{` closes the block, and is its last token.
        // When the text holds a `{` after the line of the block's `{`, and the
        // `}` does not stand alone on its line, it is the `}` of that `{`,
        // written for another statement.
        const closing = rest.at(-1)
        if (closing === undefined) return
        if (!closedByBraceOfOtherStatement(sourceCode, brace, rest, closing)) {
          return
        }
        context.report({
          loc,
          messageId: "closedByOtherBrace",
        })
      },
    }
  },
}
