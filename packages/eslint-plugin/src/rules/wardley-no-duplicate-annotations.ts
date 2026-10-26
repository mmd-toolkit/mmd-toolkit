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
        "mermaid.js keeps the annotation box at the position given on line {{line}}; this position has no effect.",
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
        let first: { x: number; y: number; line: number } | null = null
        for (const node of diagram.body) {
          if (node.type !== "WardleyAnnotationsStatement") continue
          const position = wardleyPosition(node.coordinates)
          if (first === null) {
            first = { ...position, line: node.loc.start.line }
          } else if (first.x !== position.x || first.y !== position.y) {
            context.report({
              node,
              messageId: "duplicate",
              data: { line: String(first.line) },
            })
          }
        }
      },
    }
  },
}
