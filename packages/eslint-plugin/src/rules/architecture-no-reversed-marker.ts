import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Marker fields record presence only, so their written direction comes from tokens. */
export const architectureNoReversedMarker: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "reversed"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an arrowhead of an edge written pointing the other way.",
      recommended: true,
      url: ruleDocsUrl("architecture-no-reversed-marker"),
    },
    schema: [],
    messages: {
      reversed:
        "mermaid.js draws `>` before the line as `<` and `<` after the line as `>`.",
    },
  },
  create(context) {
    return {
      ArchitectureEdgeStatement(node) {
        const { arrow } = node
        const { title } = arrow
        const tokens = context.sourceCode.getTokens(arrow, {
          filter: (token) =>
            token.type === "Punctuator" &&
            !(
              title !== null &&
              title.range[0] <= token.range[0] &&
              token.range[1] <= title.range[1]
            ),
        })
        const line = tokens.find(
          (token) => token.value === "--" || token.value === "-",
        )
        if (line === undefined) {
          throw new Error("An accepted architecture arrow has no line token")
        }
        if (
          tokens.some(
            (token) =>
              (token.value === ">" && token.range[1] <= line.range[0]) ||
              (token.value === "<" && token.range[0] >= line.range[1]),
          )
        ) {
          context.report({ node: arrow, messageId: "reversed" })
        }
      },
    }
  },
}
