import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { closedByBraceOfOtherStatement } from "../utils/description-block.ts"

/** Report the opening of an unclosed block or one closed by a later statement. */
export const agentflowNoUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed" | "closedByOtherBrace"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr {` block that is not closed by `}`.",
      recommended: false,
      url: ruleDocsUrl("agentflow-no-unclosed-description-block"),
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
      AgentflowAccDescrBlockStatement(node) {
        const [keyword, brace, ...rest] = sourceCode.getTokens(node)
        if (keyword === undefined || brace === undefined) return
        const loc = { start: keyword.loc.start, end: brace.loc.end }
        if (!node.closed) {
          context.report({ loc, messageId: "unclosed" })
          return
        }
        const closing = rest.at(-1)
        if (
          closing !== undefined &&
          closedByBraceOfOtherStatement(sourceCode, brace, rest, closing)
        ) {
          context.report({ loc, messageId: "closedByOtherBrace" })
        }
      },
    }
  },
}
