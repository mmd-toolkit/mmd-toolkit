import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { holdsBraceAfterBraceLine } from "../utils/description-block.ts"

/**
 * The rule `er-no-unclosed-description-block`, described in
 * `docs/rules/er-no-unclosed-description-block.md`: an `accDescr {` block whose
 * text holds a `{` after the line of the block's `{`: it ends at a `}` written
 * for another statement, such as the `}` of an attribute block, wherever that
 * `}` stands. A block that no `}` closes is rejected by mermaid.js and has no
 * tree.
 */
export const erNoUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "closedByOtherBrace"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr {` block that a `}` written for something else closes.",
      recommended: false,
      url: ruleDocsUrl("er-no-unclosed-description-block"),
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
      ErAccDescrBlockStatement(node) {
        // The report marks where the block opens, `accDescr {`, its first two
        // tokens.
        const [keyword, brace, ...rest] = sourceCode.getTokens(node)
        if (keyword === undefined || brace === undefined) return
        if (!holdsBraceAfterBraceLine(sourceCode, brace, rest)) return
        context.report({
          loc: { start: keyword.loc.start, end: brace.loc.end },
          messageId: "closedByOtherBrace",
        })
      },
    }
  },
}
