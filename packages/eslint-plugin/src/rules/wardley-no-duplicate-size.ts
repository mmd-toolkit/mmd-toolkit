import type { WardleySizeStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Dimensions compare as numbers; configuration does not enter the statement history. */
export const wardleyNoDuplicateSize: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a `size` that replaces the size set before it.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-duplicate-size"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the map size set on line {{line}} with this size.",
    },
  },
  create(context) {
    let previous: WardleySizeStatement | null = null
    return {
      WardleySizeStatement(node) {
        if (
          previous !== null &&
          (previous.width.value !== node.width.value ||
            previous.height.value !== node.height.value)
        ) {
          context.report({
            node,
            messageId: "duplicate",
            data: { line: String(previous.loc.start.line) },
          })
        }
        previous = node
      },
    }
  },
}
