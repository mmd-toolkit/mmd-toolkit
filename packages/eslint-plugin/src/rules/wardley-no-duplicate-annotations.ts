import type { SuggestedEdit } from "@eslint/core"
import type { WardleyAnnotationsStatement } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  wardleyNameText,
  wardleyPosition,
} from "../utils/wardley-declarations.ts"

/** Only the first coordinates are validated; exposing the next position must keep it in the map. */
function annotationsRemovals(
  sourceCode: MermaidSourceCode,
  node: WardleyAnnotationsStatement,
  first: WardleyAnnotationsStatement,
  next: WardleyAnnotationsStatement,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const currentPosition = wardleyPosition(node.coordinates)
  const nextPosition = wardleyPosition(next.coordinates)
  return oneOfTwoRemovals(
    sourceCode,
    node,
    first,
    currentPosition.x === nextPosition.x &&
      currentPosition.y === nextPosition.y &&
      nextPosition.x >= 0 &&
      nextPosition.x <= 100 &&
      nextPosition.y >= 0 &&
      nextPosition.y <= 100,
  )
}

/** Later boxes are ignored; their positions are compared with the first box only. */
export const wardleyNoDuplicateAnnotations: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `annotations` after the first that gives the box of the annotations another position.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-duplicate-annotations"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement.",
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
        let first: WardleyAnnotationsStatement | null = null
        let next: WardleyAnnotationsStatement | null = null
        for (const node of diagram.body) {
          if (node.type !== "WardleyAnnotationsStatement") continue
          const position = wardleyPosition(node.coordinates)
          if (first === null) {
            first = node
          } else {
            next ??= node
            const original = wardleyPosition(first.coordinates)
            if (original.x === position.x && original.y === position.y) continue
            context.report({
              node,
              messageId: "duplicate",
              suggest: annotationsRemovals(
                context.sourceCode,
                node,
                first,
                next,
              ),
            })
          }
        }
      },
    }
  },
}
