import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"
import { vennRegionKey } from "../utils/venn-names.ts"
import { VENN_STYLE_KEYS } from "../utils/venn-styles.ts"

/** Keep the most recent value of each read property for each target list. */
export const vennNoDuplicateStyle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a style that replaces an earlier value of the same target.",
      recommended: true,
      url: ruleDocsUrl("venn-no-duplicate-style"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the `{{name}}` value given on line {{line}} for this target with this value.",
    },
  },
  create(context) {
    const targets = new Map<
      string,
      Map<string, { value: string; line: number }>
    >()
    return {
      VennStyleStatement(node) {
        const target = vennRegionKey(node.targets)
        let properties = targets.get(target)
        if (properties === undefined) {
          properties = new Map()
          targets.set(target, properties)
        }
        for (const property of node.properties) {
          const name = property.key.name
          if (!VENN_STYLE_KEYS.has(name)) continue
          const value = normalizeLineTerminators(property.value.value)
          const previous = properties.get(name)
          if (previous !== undefined && previous.value !== value) {
            context.report({
              node: property,
              messageId: "duplicate",
              data: { name, line: String(previous.line) },
            })
          }
          properties.set(name, { value, line: property.loc.start.line })
        }
      },
    }
  },
}
