import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Commas with no following digits group nothing, on either side of the point. */
function withoutTrailingCommas(text: string): string {
  let end = text.length
  while (end > 0 && text[end - 1] === ",") end--
  return text.slice(0, end)
}

/**
 * Check raw spelling because numeric conversion has already removed commas and
 * unread suffixes. A decimal comma is indistinguishable from thousands before
 * three digits; earlier groups may use Indian notation. Both sides of the point
 * ignore trailing commas, which group nothing; only the last remaining group
 * before the point must have three digits.
 */
function isInvalidValue(raw: string): boolean {
  const text = raw.replaceAll(",", "")
  let dots = 0
  let hasDigit = false
  for (const character of text) {
    if (character === ".") dots++
    else if (character >= "0" && character <= "9") hasDigit = true
  }
  if (text.includes("_") || dots > 1 || !hasDigit) return true

  const point = raw.indexOf(".")
  if (point !== -1 && withoutTrailingCommas(raw.slice(point)).includes(",")) {
    return true
  }
  const whole = withoutTrailingCommas(point === -1 ? raw : raw.slice(0, point))
  const lastComma = whole.lastIndexOf(",")
  return lastComma !== -1 && whole.length - lastComma - 1 !== 3
}

/** Report unread numeric text and commas outside the decided thousands forms. */
export const treemapNoInvalidValue: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "invalid"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a value of a leaf that mermaid.js reads as another number.",
      recommended: true,
      url: ruleDocsUrl("treemap-no-invalid-value"),
    },
    schema: [],
    messages: {
      invalid:
        "mermaid.js reads this value as `{{value}}` after removing its commas.",
    },
  },
  create(context) {
    return {
      TreemapLeaf(node) {
        if (isInvalidValue(node.value.raw)) {
          context.report({
            node: node.value,
            messageId: "invalid",
            data: { value: String(node.value.value) },
          })
        }
      },
    }
  },
}
