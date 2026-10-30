import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { MermaidSourceCode } from "../source-code.ts"
import type { RuleFixer } from "@eslint/core"
import type { QuadrantLiteral } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** A comma coordinate is 0 followed by a comma and digits, so a point always puts it in range. */
function coordinateFix(
  sourceCode: MermaidSourceCode,
  node: QuadrantLiteral,
): RuleFixer | null {
  if (
    !canEditRange(sourceCode, node.range) ||
    !canCompactRange(sourceCode, node.range)
  )
    return null
  const text = node.value
  if (!text.includes(",")) return null
  const value = text.replace(",", ".")
  return (fixer) => fixer.replaceText(node, value)
}

/**
 * The rule `quadrant-no-invalid-coordinate`, described in
 * `docs/rules/quadrant-no-invalid-coordinate.md`: a coordinate that
 * mermaid.js does not read as a number from 0 to 1. The grammar admits only
 * `0`, `1`, or `0` followed by one character and digits; JavaScript reads the
 * text with `Number`, so what is reported is `NaN` (`0,3`) and a number
 * outside 0 to 1 (`0x5`, `003`), while `0e5` and `0b1` are 0 and 1. The tree
 * already leaves out directives in a coordinate.
 */
export const quadrantNoInvalidCoordinate: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "invalid"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a coordinate of a point that is not a number from 0 to 1.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-invalid-coordinate"),
    },
    fixable: "code",
    schema: [],
    messages: {
      invalid:
        "mermaid.js does not place this point inside the chart: `{{coordinate}}` is not read as a number from 0 to 1.",
    },
  },
  create(context) {
    return {
      QuadrantPointStatement(node) {
        for (const coordinate of [node.x, node.y]) {
          const number = Number(coordinate.value)
          if (Number.isNaN(number) || number < 0 || number > 1) {
            context.report({
              node: coordinate,
              messageId: "invalid",
              fix: coordinateFix(context.sourceCode, coordinate),
              data: { coordinate: coordinate.value },
            })
          }
        }
      },
    }
  },
}
