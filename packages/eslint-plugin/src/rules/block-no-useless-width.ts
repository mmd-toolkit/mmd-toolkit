import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  declaredNodesOf,
  isCompositeHead,
} from "../utils/block-declarations.ts"

/**
 * Keep each id's first declared width, or one for an edge endpoint. Only a
 * one-link statement outside a composite head can have a useless edge width.
 */
export const blockNoUselessWidth: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "useless"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a width on the first block of an edge.",
      recommended: true,
      url: ruleDocsUrl("block-no-useless-width"),
    },
    schema: [],
    messages: {
      useless:
        "mermaid.js drops this width with the link; the block `{{name}}` keeps its width of {{width}} column(s).",
    },
  },
  create(context) {
    const widths = new Map([["root", 1]])
    return {
      BlockNodeStatement(node, parent) {
        // The width that the block keeps: its first declared width, or one.
        const name = node.node.id.name
        const kept = widths.get(name) ?? 1
        if (
          !isCompositeHead(node, parent) &&
          node.links.length === 1 &&
          node.width !== null &&
          node.width.value !== kept
        ) {
          context.report({
            node: node.width,
            messageId: "useless",
            data: { name, width: String(kept) },
          })
        }
        for (const block of declaredNodesOf(node, parent)) {
          if (widths.has(block.id.name)) continue
          widths.set(
            block.id.name,
            node.links.length === 0 ? (node.width?.value ?? 1) : 1,
          )
        }
      },
    }
  },
}
