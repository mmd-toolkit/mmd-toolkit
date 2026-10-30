import type {
  MindmapClassStatement,
  MindmapIconStatement,
} from "@mmd-toolkit/parser"
import { oneOfTwoRemovals } from "../utils/removal.ts"

import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Each kind keeps its setter and the value that removing that setter would reveal. */
interface DecorationHistory {
  node: MindmapClassStatement | MindmapIconStatement
  value: string
  before: string | undefined
}

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
  MessageIds: "icon" | "class" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a second icon or a second class line for one node.",
      recommended: true,
      url: ruleDocsUrl("mindmap-no-duplicate-decoration"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement.",
      icon: "mermaid.js keeps only the last icon and drops the earlier ones for this node.",
      class:
        "mermaid.js keeps only the last class line and drops the earlier ones for this node.",
    },
  },
  create(context) {
    return {
      MindmapNode(node) {
        // The value of the decoration of each kind before the one at hand.
        const histories = new Map<"icon" | "class", DecorationHistory>()
        for (const decoration of node.decorations) {
          if (decoration.type === "MindmapIconStatement") {
            const icon = histories.get("icon")
            const value = decoration.icon.value
            if (icon !== undefined && icon.value !== value) {
              context.report({
                node: decoration,
                messageId: "icon",
                suggest: oneOfTwoRemovals(
                  context.sourceCode,
                  decoration,
                  icon.node,
                  icon.before === undefined || icon.before === value,
                ),
              })
            }
            histories.set("icon", {
              node: decoration,
              value,
              before: icon?.value,
            })
          } else {
            const cssClass = histories.get("class")
            const value = decoration.cssClass.value
            if (cssClass !== undefined && cssClass.value !== value) {
              context.report({
                node: decoration,
                messageId: "class",
                suggest: oneOfTwoRemovals(
                  context.sourceCode,
                  decoration,
                  cssClass.node,
                  cssClass.before === undefined || cssClass.before === value,
                ),
              })
            }
            histories.set("class", {
              node: decoration,
              value,
              before: cssClass?.value,
            })
          }
        }
      },
    }
  },
}
