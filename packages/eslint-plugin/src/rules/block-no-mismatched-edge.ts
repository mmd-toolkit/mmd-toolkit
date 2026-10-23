import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Compares the line and any leading arrowhead of a labelled link's arrows. */
export const blockNoMismatchedEdge: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "mismatched"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an edge with a label whose two arrows do not match.",
      recommended: true,
      url: ruleDocsUrl("block-no-mismatched-edge"),
    },
    schema: [],
    messages: {
      mismatched:
        "mermaid.js takes this edge's line and markers only from the arrow after the label, losing part of the opening arrow.",
    },
  },
  create(context) {
    return {
      BlockLink(node) {
        if (
          node.opening !== null &&
          (node.opening.line !== node.arrow.line ||
            (node.opening.startMarker === "arrow" &&
              node.arrow.startMarker !== "arrow"))
        ) {
          context.report({ node, messageId: "mismatched" })
        }
      },
    }
  },
}
