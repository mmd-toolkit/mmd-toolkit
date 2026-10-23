import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `xychart-no-unclosed-description-block`, described in
 * `docs/rules/xychart-no-unclosed-description-block.md`: a block without its
 * closing `}`, including one without text. It takes the rest of the source
 * and sets the empty description. The report marks only `accDescr {`.
 */
export const xychartNoUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a description block that is not closed by `}`.",
      recommended: true,
      url: ruleDocsUrl("xychart-no-unclosed-description-block"),
    },
    schema: [],
    messages: {
      unclosed:
        "mermaid.js reads the rest of the diagram as the text of this unclosed `accDescr {` block, and sets an empty description.",
    },
  },
  create(context) {
    const { sourceCode } = context
    return {
      XychartAccDescrBlockStatement(node) {
        if (node.closed) return
        // The block opens with `accDescr {`, its first two tokens.
        const [, brace] = sourceCode.getTokens(node)
        context.report({
          loc: { start: node.loc.start, end: brace.loc.end },
          messageId: "unclosed",
        })
      },
    }
  },
}
