import type {
  QuadrantClassDefStatement,
  QuadrantPointStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { styleOf } from "../utils/quadrant-styles.ts"

/**
 * The rule `quadrant-no-duplicate-style`, described in
 * `docs/rules/quadrant-no-duplicate-style.md`: a style that changes the last
 * value of its name in the same list. Radius values are integers; colours
 * and stroke widths keep their written values, without spaces around the
 * colon and without text after a second colon. Each list is independent.
 */
export const quadrantNoDuplicateStyle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a style that a point or a class gives again.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-duplicate-style"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier `{{name}}` with the value of this style.",
    },
  },
  create(context) {
    /** Reports styles that replace an earlier value in this statement's list. */
    function check(
      node: QuadrantPointStatement | QuadrantClassDefStatement,
    ): void {
      const previous = new Map<string, string | number>()
      for (const style of node.styles) {
        const { name, value } = styleOf(style)
        const earlier = previous.get(name)
        if (earlier !== undefined && earlier !== value) {
          context.report({
            node: style,
            messageId: "duplicate",
            data: { name },
          })
        }
        previous.set(name, value)
      }
    }

    return {
      QuadrantPointStatement: check,
      QuadrantClassDefStatement: check,
    }
  },
}
