import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { BLOCK_DIRECTIONS } from "../utils/block-shapes.ts"

/** Reports each direction that the drawing does not recognize exactly. */
export const blockNoInvalidDirection: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "invalid"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a direction of a block arrow that is not one of the direction words.",
      recommended: true,
      url: ruleDocsUrl("block-no-invalid-direction"),
    },
    schema: [],
    messages: {
      invalid:
        "mermaid.js keeps the whitespace in this direction, and the block arrow does not point that way.",
    },
  },
  create(context) {
    return {
      BlockArrowShape(node) {
        for (const direction of node.directions) {
          if (BLOCK_DIRECTIONS[direction.value] === undefined) {
            context.report({ node: direction, messageId: "invalid" })
          }
        }
      },
    }
  },
}
