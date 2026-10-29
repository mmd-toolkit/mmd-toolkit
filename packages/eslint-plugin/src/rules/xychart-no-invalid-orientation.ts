import { canEditRange } from "../utils/edit-range.ts"
import type { RuleFixer } from "@eslint/core"
import type { MermaidSourceCode } from "../source-code.ts"
import type { Token } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** The differently cased orientation has exactly one lower-case spelling. */
function orientationFix(
  sourceCode: MermaidSourceCode,
  token: Token,
): RuleFixer | null {
  if (!canEditRange(sourceCode, token.range)) return null
  return (fixer) => fixer.replaceText(token, "horizontal")
}

/**
 * The rule `xychart-no-invalid-orientation`, described in
 * `docs/rules/xychart-no-invalid-orientation.md`: `horizontal` in a different
 * case, in any header. Only the lower-case word turns the chart horizontal;
 * `vertical` in any case gives the orientation it names. The report covers
 * the orientation token, which is the last token of the header.
 */
export const xychartNoInvalidOrientation: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "invalid"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an orientation that mermaid.js does not read as `horizontal`.",
      recommended: true,
      url: ruleDocsUrl("xychart-no-invalid-orientation"),
    },
    fixable: "code",
    schema: [],
    messages: {
      invalid:
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
          messageId: "invalid",
          data: { word },
          fix: orientationFix(sourceCode, orientation),
        })
      },
    }
  },
}
