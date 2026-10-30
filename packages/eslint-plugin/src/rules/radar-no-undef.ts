import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { radarAxesOf } from "../utils/radar-axes.ts"

/** Resolve named entries against all axis declarations, including later ones. */
export const radarNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "undef"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an entry of a curve that names no axis.",
      recommended: true,
      url: ruleDocsUrl("radar-no-undef"),
    },
    schema: [],
    messages: {
      undef:
        "mermaid.js drops this entry: no axis of the diagram has the id `{{name}}`.",
    },
  },
  create(context) {
    let names: ReadonlySet<string> = new Set()
    return {
      RadarDiagram(node) {
        names = radarAxesOf(node).names
      },
      RadarNamedEntry(node) {
        if (!names.has(node.axis.name)) {
          context.report({
            node: node.axis,
            messageId: "undef",
            data: { name: node.axis.name },
          })
        }
      },
    }
  },
}
