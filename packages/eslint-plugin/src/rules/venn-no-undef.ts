import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { vennName, vennRegionKey } from "../utils/venn-names.ts"

/** Inventory the whole diagram before checking explicit text and style targets. */
export const vennNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "undef"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a text node or a style for an area that no set or union declares.",
      recommended: true,
      url: ruleDocsUrl("venn-no-undef"),
    },
    schema: [],
    messages: {
      undef: "mermaid.js {{effect}} for these names.",
    },
  },
  create(context) {
    return {
      VennDiagram(node) {
        const regions = new Set<string>()
        const textIds = new Set<string>()
        for (const statement of node.body) {
          if (statement.type === "VennSubsetStatement") {
            regions.add(vennRegionKey(statement.sets))
            if (statement.sets.length < 3) continue
            for (let first = 0; first < statement.sets.length; first++) {
              for (
                let second = first + 1;
                second < statement.sets.length;
                second++
              ) {
                regions.add(
                  vennRegionKey([
                    statement.sets[first],
                    statement.sets[second],
                  ]),
                )
              }
            }
          } else if (statement.type === "VennTextStatement") {
            textIds.add(
              statement.id.type === "NumericLiteral"
                ? statement.id.raw
                : vennName(statement.id),
            )
          }
        }
        for (const statement of node.body) {
          if (
            statement.type !== "VennTextStatement" &&
            statement.type !== "VennStyleStatement"
          )
            continue
          const targets = statement.targets
          if (targets === null || regions.has(vennRegionKey(targets))) continue
          const style = statement.type === "VennStyleStatement"
          if (
            style &&
            targets.length === 1 &&
            textIds.has(vennName(targets[0]))
          )
            continue
          context.report({
            loc: {
              start: targets[0].loc.start,
              end: targets[targets.length - 1].loc.end,
            },
            messageId: "undef",
            data: { effect: style ? "applies no style" : "shows no text node" },
          })
        }
      },
    }
  },
}
