import { canEditRange } from "../utils/edit-range.ts"
import type { MermaidSourceCode } from "../source-code.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { RuleFixer } from "@eslint/core"
import type { BlockLiteral } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { BLOCK_DIRECTIONS } from "../utils/block-shapes.ts"

/** Remove whitespace from the direction word the grammar already reads in lower case. */
function directionFix(
  sourceCode: MermaidSourceCode,
  node: BlockLiteral,
): RuleFixer | null {
  if (
    !canEditRange(sourceCode, node.range) ||
    !canCompactRange(sourceCode, node.range)
  )
    return null
  const value = [...node.value]
    .filter((character) => character.trim() !== "")
    .join("")

  return (fixer) => fixer.replaceText(node, value)
}

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
    fixable: "code",
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
            context.report({
              node: direction,
              messageId: "invalid",
              fix: directionFix(context.sourceCode, direction),
            })
          }
        }
      },
    }
  },
}
