import type { WardleyEvolveStatement } from "@mmd-toolkit/parser"
import { oneOfTwoRemovals } from "../utils/removal.ts"
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
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `evolve` that replaces the target of an earlier `evolve` of the same node.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-duplicate-evolve"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement.",
      duplicate:
        "mermaid.js replaces the evolution target of `{{name}}`, set earlier, with this target.",
    },
  },
  create(context) {
    return {
      WardleyDiagram(diagram) {
        const declarations = wardleyDeclarationsOf(diagram)
        const targets = new Map<
          string,
          {
            node: WardleyEvolveStatement
            value: number
            before: number | undefined
          }
        >()
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
              data: { name },
              suggest: oneOfTwoRemovals(
                context.sourceCode,
                node,
                previous.node,
                previous.before === undefined || previous.before === value,
              ),
            })
          }
          targets.set(name, { node, value, before: previous?.value })
        }
      },
    }
  },
}
