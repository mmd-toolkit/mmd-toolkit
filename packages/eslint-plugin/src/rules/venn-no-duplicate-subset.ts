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
        "mermaid.js draws this area again; a declaration on line {{line}} already has these names.",
    },
  },
  create(context) {
    const declarations = new Map<string, number>()
    return {
      VennSubsetStatement(node) {
        const key = vennRegionKey(node.sets)
        const line = declarations.get(key)
        if (line === undefined) {
          declarations.set(key, node.loc.start.line)
        } else {
          context.report({
            node,
            messageId: "duplicate",
            data: { line: String(line) },
          })
        }
      },
    }
  },
}
