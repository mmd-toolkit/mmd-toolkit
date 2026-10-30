import { canEditRange } from "../utils/edit-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { BlockShape } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  declaredNodesOf,
  isCompositeHead,
} from "../utils/block-declarations.ts"
import { BLOCK_SHAPES } from "../utils/block-shapes.ts"

/** Each documented closing of this opening is a possible intended shape. */
function closingSuggestions(
  sourceCode: MermaidSourceCode,
  shape: BlockShape,
): SuggestedEdit<"writeClosing">[] {
  const token = sourceCode.getLastToken(shape)
  if (token === null || !canEditRange(sourceCode, token.range)) return []
  return Object.keys(BLOCK_SHAPES[shape.open] ?? {}).map((closing) => ({
    messageId: "writeClosing",
    data: { closing },
    fix: (fixer) => fixer.replaceText(token, closing),
  }))
}

/** Reports known shape openings with unknown pairs, excluding composite heads. */
export const blockNoMismatchedShape: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "mismatched" | "writeClosing"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a shape whose closing does not match its opening.",
      recommended: true,
      url: ruleDocsUrl("block-no-mismatched-shape"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      writeClosing: "Close with `{{closing}}`.",
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
              suggest: closingSuggestions(context.sourceCode, shape),
            })
          }
        }
      },
    }
  },
}
