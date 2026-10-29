import type { QuadrantClassDefStatement } from "@mmd-toolkit/parser"
import { oneOfTwoRemovals } from "../utils/removal.ts"
import type { QuadrantLiteral } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { styleOf } from "../utils/quadrant-styles.ts"
import { dropsOrChangesStyles } from "../utils/class-styles.ts"

/** The styles that a definition sets: the last value of each name. */
function stylesOf(
  styles: readonly QuadrantLiteral[],
): Map<string, string | number> {
  const values = new Map<string, string | number>()
  for (const style of styles) {
    const { name, value } = styleOf(style)
    values.set(name, value)
  }
  return values
}

/**
 * The rule `quadrant-no-redefined-class`, described in
 * `docs/rules/quadrant-no-redefined-class.md`: a later definition of the
 * same class that drops or changes an earlier style. A definition replaces the whole
 * set, so omitted styles are lost and style order does not count. Names
 * are case sensitive and point positions do not affect definitions.
 */
export const quadrantNoRedefinedClass: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `classDef` statement that replaces the styles of its class.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-redefined-class"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement.",
      redefined:
        "mermaid.js replaces the styles of the class `{{name}}`, set earlier, with those of this `classDef`.",
    },
  },
  create(context) {
    const classes = new Map<
      string,
      {
        node: QuadrantClassDefStatement
        styles: Map<string, string | number>
        before: Map<string, string | number> | undefined
      }
    >()
    return {
      QuadrantClassDefStatement(node) {
        const name = node.name.name
        const styles = stylesOf(node.styles)
        const earlier = classes.get(name)
        if (
          earlier !== undefined &&
          dropsOrChangesStyles(earlier.styles, styles)
        ) {
          context.report({
            node,
            messageId: "redefined",
            data: { name },
            suggest: oneOfTwoRemovals(
              context.sourceCode,
              node,
              earlier.node,
              earlier.before === undefined ||
                !dropsOrChangesStyles(earlier.before, styles),
            ),
          })
        }
        classes.set(name, { node, styles, before: earlier?.styles })
      },
    }
  },
}
