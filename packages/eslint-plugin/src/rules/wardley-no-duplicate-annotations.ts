import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  wardleyNameText,
  wardleyPosition,
} from "../utils/wardley-declarations.ts"

/** Later boxes are ignored; their positions are compared with the first box only. */
export const wardleyNoDuplicateAnnotations: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `annotations` after the first that gives the box of the annotations another position.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-duplicate-annotations"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js keeps the annotation box at the first position and ignores this position.",
    },
  },
  create(context) {
    return {
      WardleyDiagram(diagram) {
        const hasText = diagram.body.some(
          (node) =>
            node.type === "WardleyAnnotationStatement" &&
            wardleyNameText(node.text) !== "",
        )
        if (!hasText) return
        let first: { x: number; y: number } | null = null
        for (const node of diagram.body) {
          if (node.type !== "WardleyAnnotationsStatement") continue
          const position = wardleyPosition(node.coordinates)
          if (first === null) {
            first = position
          } else if (first.x !== position.x || first.y !== position.y) {
            context.report({
              node,
              messageId: "duplicate",
            })
          }
        }
      },
    }
  },
}
