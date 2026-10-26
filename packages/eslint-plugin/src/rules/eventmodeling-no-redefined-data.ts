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
        "mermaid.js shows the `{{name}}` data block declared on line {{line}}; the content of this later block is not used.",
    },
  },
  create(context) {
    return {
      EventmodelingDiagram(diagram) {
        const declarations = eventmodelingDeclarationsOf(diagram)
        const firstByName = new Map<string, { value: string; line: number }>()
        for (const node of declarations.dataDeclarations) {
          const name = eventmodelingNameText(node.name)
          const value = normalizeLineTerminators(node.data.value.value)
          const first = firstByName.get(name)
          if (first === undefined) {
            firstByName.set(name, { value, line: node.loc.start.line })
          } else if (
            declarations.referencedData.has(name) &&
            first.value !== value
          ) {
            context.report({
              node: node.name,
              messageId: "redefined",
              data: { name, line: String(first.line) },
            })
          }
        }
      },
    }
  },
}
