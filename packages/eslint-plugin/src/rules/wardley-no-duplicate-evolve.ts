import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  wardleyDeclarationsOf,
  wardleyNameText,
  wardleyPercent,
} from "../utils/wardley-declarations.ts"

/** Missing targets belong to no-undef; existing IDs keep the latest evolution target. */
export const wardleyNoDuplicateEvolve: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `evolve` that replaces the target of an earlier `evolve` of the same node.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-duplicate-evolve"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the evolution target of `{{name}}`, set on line {{line}}, with this target.",
    },
  },
  create(context) {
    return {
      WardleyDiagram(diagram) {
        const declarations = wardleyDeclarationsOf(diagram)
        const targets = new Map<string, { value: number; line: number }>()
        for (const node of diagram.body) {
          if (node.type !== "WardleyEvolveStatement") continue
          const name = wardleyNameText(node.component)
          if (!declarations.nodes.has(name)) continue
          const value = wardleyPercent(node.target)
          const previous = targets.get(name)
          if (previous !== undefined && previous.value !== value) {
            context.report({
              node,
              messageId: "duplicate",
              data: { name, line: String(previous.line) },
            })
          }
          targets.set(name, { value, line: node.loc.start.line })
        }
      },
    }
  },
}
