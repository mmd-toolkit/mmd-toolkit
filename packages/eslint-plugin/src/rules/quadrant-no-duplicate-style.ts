import type { SuggestedEdit } from "@eslint/core"
import type { QuadrantLiteral } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { commaRemovalRange } from "../utils/comma-parts.ts"
import type {
  QuadrantClassDefStatement,
  QuadrantPointStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { styleOf } from "../utils/quadrant-styles.ts"

/** Styles share a comma-delimited list, so remove a part with its separator. */
function styleRemovals(
  sourceCode: MermaidSourceCode,
  node: QuadrantPointStatement | QuadrantClassDefStatement,
  style: QuadrantLiteral,
  previous: QuadrantLiteral,
  canRemovePrevious: boolean,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const suggestions: SuggestedEdit<"removeThis" | "removePrevious">[] = []
  const choices: {
    part: QuadrantLiteral
    messageId: "removeThis" | "removePrevious"
  }[] = [{ part: style, messageId: "removeThis" }]
  if (canRemovePrevious)
    choices.push({ part: previous, messageId: "removePrevious" })
  for (const choice of choices) {
    const range = commaRemovalRange(sourceCode, choice.part, node.styles)
    if (range !== null)
      suggestions.push({
        messageId: choice.messageId,
        fix: (fixer) => fixer.removeRange(range),
      })
  }
  return suggestions
}

/**
 * The rule `quadrant-no-duplicate-style`, described in
 * `docs/rules/quadrant-no-duplicate-style.md`: a style that changes the last
 * value of its name in the same list. Radius values are integers; colours
 * and stroke widths keep their written values, without spaces around the
 * colon and without text after a second colon. Each list is independent.
 */
export const quadrantNoDuplicateStyle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a style that a point or a class gives again.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-duplicate-style"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this style.",
      removePrevious: "Remove the earlier style.",
      duplicate:
        "mermaid.js replaces the earlier `{{name}}` with the value of this style.",
    },
  },
  create(context) {
    /** Reports styles that replace an earlier value in this statement's list. */
    function check(
      node: QuadrantPointStatement | QuadrantClassDefStatement,
    ): void {
      const previous = new Map<
        string,
        {
          node: QuadrantLiteral
          value: string | number
          before: string | number | undefined
        }
      >()
      for (const style of node.styles) {
        const { name, value } = styleOf(style)
        const earlier = previous.get(name)
        if (earlier !== undefined && earlier.value !== value) {
          context.report({
            node: style,
            messageId: "duplicate",
            data: { name },
            suggest: styleRemovals(
              context.sourceCode,
              node,
              style,
              earlier.node,
              earlier.before === undefined || earlier.before === value,
            ),
          })
        }
        previous.set(name, { node: style, value, before: earlier?.value })
      }
    }

    return {
      QuadrantPointStatement: check,
      QuadrantClassDefStatement: check,
    }
  },
}
