import type { Identifier } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `quadrant-no-undef`, described in
 * `docs/rules/quadrant-no-undef.md`: a point's class name that no definition
 * anywhere in the chart defines. Collect names before checking references,
 * so definitions before and after a point are treated alike. Names compare
 * with their case, also when the point has styles of its own.
 */
export const quadrantNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "undefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a class of a point that no `classDef` defines.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-undef"),
    },
    schema: [],
    messages: {
      undefined:
        "mermaid.js gives this point no styles from `{{name}}`: no `classDef` of the chart defines this class.",
    },
  },
  create(context) {
    const defined = new Set<string>()
    const references: Identifier[] = []
    return {
      QuadrantClassDefStatement(node) {
        defined.add(node.name.name)
      },
      QuadrantPointStatement(node) {
        if (node.className !== null) references.push(node.className)
      },
      "QuadrantDiagram:exit"() {
        for (const node of references) {
          if (defined.has(node.name)) continue
          context.report({
            node,
            messageId: "undefined",
            data: { name: node.name },
          })
        }
      },
    }
  },
}
