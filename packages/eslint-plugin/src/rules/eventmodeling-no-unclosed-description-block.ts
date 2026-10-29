import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { closedByBraceOfOtherStatement } from "../utils/description-block.ts"

/** Report the block opener when a later statement's inline brace closes it. */
export const eventmodelingNoUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "closedByOtherBrace"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr {` block that a `}` written for a later statement closes.",
      recommended: false,
      url: ruleDocsUrl("eventmodeling-no-unclosed-description-block"),
    },

    schema: [],
    messages: {
      closedByOtherBrace:
        "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      EventmodelingAccDescrBlockStatement(node) {
        const keyword = sourceCode.getFirstToken(node)
        const brace = sourceCode.getFirstToken(node, {
          filter: (token) => token.type === "Punctuator" && token.value === "{",
        })
        const closing = sourceCode.getLastToken(node, {
          filter: (token) => token.type === "Punctuator" && token.value === "}",
        })
        if (keyword === null || brace === null || closing === null) return
        const body = sourceCode.getTokensBetween(brace, closing)
        if (closedByBraceOfOtherStatement(sourceCode, brace, body, closing)) {
          context.report({
            loc: { start: keyword.loc.start, end: brace.loc.end },
            messageId: "closedByOtherBrace",
          })
        }
      },
    }
  },
}
