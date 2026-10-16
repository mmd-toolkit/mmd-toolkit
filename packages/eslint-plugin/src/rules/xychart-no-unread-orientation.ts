import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `xychart-no-unread-orientation`, described in
 * `docs/rules/xychart-no-unread-orientation.md`: `horizontal` in a different
 * case, in any header. Only the lower-case word turns the chart horizontal;
 * `vertical` in any case gives the orientation it names. The report covers
 * the orientation token, which is the last token of the header.
 */
export const xychartNoUnreadOrientation: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unread"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an orientation that mermaid.js does not read as `horizontal`.",
      recommended: true,
      url: ruleDocsUrl("xychart-no-unread-orientation"),
    },
    schema: [],
    messages: {
      unread:
        "mermaid.js does not read `{{word}}` as `horizontal`: the chart is vertical.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      XychartHeader(node) {
        const word = node.orientation
        if (word === null || word === "horizontal") return
        if (word.toLowerCase() !== "horizontal") return
        // The orientation is the last token of the header.
        const tokens = sourceCode.getTokens(node)
        const orientation = tokens[tokens.length - 1]
        context.report({
          loc: orientation.loc,
          messageId: "unread",
          data: { word },
        })
      },
    }
  },
}
