import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { closedByBraceOfOtherStatement } from "../utils/description-block.ts"

/**
 * The rule `sequence-no-unclosed-description-block`, described in
 * `docs/rules/sequence-no-unclosed-description-block.md`: an `accDescr {`
 * block that no `}` closes, which the tree shows as a
 * `SequenceAccDescrBlockStatement` whose `closed` is false, and a closed block
 * that ends at a `}` written for another statement (the condition of
 * `flowchart-no-unclosed-description-block`, whose block ends in the same way).
 */
export const sequenceNoUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed" | "closedByOtherBrace"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr {` block without its closing `}`.",
      recommended: false,
      url: ruleDocsUrl("sequence-no-unclosed-description-block"),
    },
    schema: [],
    messages: {
      unclosed:
        "mermaid.js reads the rest of the diagram as the text of this unclosed `accDescr {` block, and sets an empty description.",
      closedByOtherBrace:
        "mermaid.js closes this `accDescr {` block at the `}` of a later `{`, and reads the lines up to it as the description.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      SequenceAccDescrBlockStatement(node) {
        // The report marks where the block opens, `accDescr {`, its first two
        // tokens.
        const [keyword, brace, ...rest] = sourceCode.getTokens(node)
        if (keyword === undefined || brace === undefined) return
        const loc = { start: keyword.loc.start, end: brace.loc.end }
        if (!node.closed) {
          context.report({ loc, messageId: "unclosed" })
          return
        }
        // The first `}` after the `{` closes the block, and is its last token.
        const closing = rest.at(-1)
        if (closing === undefined) return
        if (!closedByBraceOfOtherStatement(sourceCode, brace, rest, closing)) {
          return
        }
        context.report({ loc, messageId: "closedByOtherBrace" })
      },
    }
  },
}
