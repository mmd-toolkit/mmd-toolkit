import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `mindmap-no-duplicate-decoration`, described in
 * `docs/rules/mindmap-no-duplicate-decoration.md`: an icon line after the
 * first icon line of a node, and a class line after the first class line of a
 * node, when it sets a value other than the line of its kind before it, as
 * written. The two kinds are counted apart, and a line belongs to the node
 * written last before it, which is the `MindmapNode` that holds it in
 * `decorations`.
 */
export const mindmapNoDuplicateDecoration: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "icon" | "class"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a second icon or a second class line for one node.",
      recommended: true,
      url: ruleDocsUrl("mindmap-no-duplicate-decoration"),
    },
    schema: [],
    messages: {
      icon: "This node already has an icon line; mermaid.js keeps only the last icon and drops the earlier ones.",
      class:
        "This node already has a class line; mermaid.js keeps only the last class line and drops the earlier ones. Write the classes on one line.",
    },
  },
  create(context) {
    return {
      MindmapNode(node) {
        // The value of the decoration of each kind before the one at hand.
        let icon: string | null = null
        let cssClass: string | null = null
        for (const decoration of node.decorations) {
          if (decoration.type === "MindmapIconStatement") {
            const value = decoration.icon.value
            if (icon !== null && icon !== value) {
              context.report({ node: decoration, messageId: "icon" })
            }
            icon = value
          } else {
            const value = decoration.cssClass.value
            if (cssClass !== null && cssClass !== value) {
              context.report({ node: decoration, messageId: "class" })
            }
            cssClass = value
          }
        }
      },
    }
  },
}
