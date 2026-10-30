import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"
import {
  eventmodelingDeclarationsOf,
  eventmodelingNameText,
} from "../utils/eventmodeling-declarations.ts"

/** Referenced data keeps the first block's content, irrespective of later declarations or type tags. */
export const eventmodelingNoRedefinedData: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `data` block that no frame can show, because an earlier block has its name.",
      recommended: true,
      url: ruleDocsUrl("eventmodeling-no-redefined-data"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js shows the first `{{name}}` data block; the content of this later block is not used.",
    },
  },
  create(context) {
    return {
      EventmodelingDiagram(diagram) {
        const declarations = eventmodelingDeclarationsOf(diagram)
        const firstByName = new Map<string, string>()
        for (const node of declarations.dataDeclarations) {
          const name = eventmodelingNameText(node.name)
          const value = normalizeLineTerminators(node.data.value.value)
          const first = firstByName.get(name)
          if (first === undefined) {
            firstByName.set(name, value)
          } else if (declarations.referencedData.has(name) && first !== value) {
            context.report({
              node: node.name,
              messageId: "redefined",
              data: { name },
            })
          }
        }
      },
    }
  },
}
