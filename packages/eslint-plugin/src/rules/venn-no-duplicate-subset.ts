import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { vennRegionKey } from "../utils/venn-names.ts"

/** Only written declarations count; implied pairs are not earlier statements. */
export const vennNoDuplicateSubset: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a set or a union that is declared again.",
      recommended: true,
      url: ruleDocsUrl("venn-no-duplicate-subset"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js draws this area again; an earlier declaration already has these names.",
    },
  },
  create(context) {
    const declarations = new Set<string>()
    return {
      VennSubsetStatement(node) {
        const key = vennRegionKey(node.sets)
        if (!declarations.has(key)) {
          declarations.add(key)
        } else {
          context.report({
            node,
            messageId: "duplicate",
          })
        }
      },
    }
  },
}
