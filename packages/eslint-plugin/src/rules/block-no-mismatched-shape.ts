import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  declaredNodesOf,
  isCompositeHead,
} from "../utils/block-declarations.ts"
import { BLOCK_SHAPES } from "../utils/block-shapes.ts"

/** Reports known shape openings with unknown pairs, excluding composite heads. */
export const blockNoMismatchedShape: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "mismatched"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a shape whose closing does not match its opening.",
      recommended: true,
      url: ruleDocsUrl("block-no-mismatched-shape"),
    },
    schema: [],
    messages: {
      mismatched:
        "mermaid.js recognizes no shape for this pair: the closing `{{close}}` does not match the opening `{{open}}`.",
    },
  },
  create(context) {
    return {
      BlockNodeStatement(node, parent) {
        if (isCompositeHead(node, parent)) return
        for (const block of declaredNodesOf(node, parent)) {
          const shape = block.shape
          if (shape?.type !== "BlockShape") continue
          const closings = BLOCK_SHAPES[shape.open]
          if (closings !== undefined && closings[shape.close] === undefined) {
            context.report({
              node: shape,
              messageId: "mismatched",
              data: { open: shape.open, close: shape.close },
            })
          }
        }
      },
    }
  },
}
