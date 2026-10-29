import { canEditRange } from "../utils/edit-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { ArchitectureArrow, Token } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Read marker characters outside the label, skipping directives between them. */
function reversedMarkersOf(
  sourceCode: MermaidSourceCode,
  arrow: ArchitectureArrow,
): Token[] {
  const { title } = arrow
  const tokens = sourceCode.getTokens(arrow, {
    filter: (token) =>
      token.type === "Punctuator" &&
      !(
        title !== null &&
        title.range[0] <= token.range[0] &&
        token.range[1] <= title.range[1]
      ),
  })
  const line = tokens.find(
    (token) => token.value === "--" || token.value === "-",
  )
  if (line === undefined) {
    throw new Error("An accepted architecture arrow has no line token")
  }
  return tokens.filter(
    (token) =>
      (token.value === ">" && token.range[1] <= line.range[0]) ||
      (token.value === "<" && token.range[0] >= line.range[1]),
  )
}

/** Write the direction in which Mermaid draws each reversed marker. */
function markerSuggestions(
  sourceCode: MermaidSourceCode,
  markers: readonly Token[],
): SuggestedEdit<"writeMarkersAsDrawn">[] {
  if (markers.some((marker) => !canEditRange(sourceCode, marker.range)))
    return []
  return [
    {
      messageId: "writeMarkersAsDrawn",
      fix: (fixer) =>
        markers.map((marker) =>
          fixer.replaceText(marker, marker.value === ">" ? "<" : ">"),
        ),
    },
  ]
}

/** Marker fields record presence only, so their written direction comes from tokens. */
export const architectureNoReversedMarker: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "reversed" | "writeMarkersAsDrawn"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an arrowhead of an edge written pointing the other way.",
      recommended: true,
      url: ruleDocsUrl("architecture-no-reversed-marker"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      writeMarkersAsDrawn: "Write the markers as drawn.",
      reversed:
        "mermaid.js draws `>` before the line as `<` and `<` after the line as `>`.",
    },
  },
  create(context) {
    return {
      ArchitectureEdgeStatement(node) {
        const markers = reversedMarkersOf(context.sourceCode, node.arrow)
        if (markers.length > 0) {
          context.report({
            node: node.arrow,
            messageId: "reversed",
            suggest: markerSuggestions(context.sourceCode, markers),
          })
        }
      },
    }
  },
}
