import { canEditRange } from "../utils/edit-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { BlockLink, BlockArrow, BlockArrowLine } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Keep the later markers and write a valid line of the chosen kind. */
function arrowText(
  arrow: BlockArrow,
  line: BlockArrowLine,
  start: boolean,
): string {
  const end = { none: "", arrow: ">", cross: "x", circle: "o" }[arrow.endMarker]
  const length =
    line === arrow.line
      ? arrow.length
      : line === "dotted"
        ? Math.max(1, arrow.length - 1)
        : arrow.line === "dotted"
          ? arrow.length + 1
          : arrow.length
  const stroke =
    line === "dotted"
      ? `-${".".repeat(length)}-`
      : (line === "thick" ? "=" : "-").repeat(
          Math.max(arrow.endMarker === "none" ? 3 : 2, length),
        )
  return `${start ? "<" : ""}${stroke}${end}`
}

/** The two line choices also carry a lost starting marker into the final arrow. */
function arrowSuggestions(
  sourceCode: MermaidSourceCode,
  node: BlockLink,
): SuggestedEdit<"useLineOfArrow" | "useLineOfOpening" | "moveArrowhead">[] {
  const opening = node.opening
  if (
    opening === null ||
    !canEditRange(sourceCode, opening.range) ||
    !canEditRange(sourceCode, node.arrow.range)
  )
    return []
  const start =
    opening.startMarker === "arrow" || node.arrow.startMarker === "arrow"
  if (opening.line === node.arrow.line)
    return [
      {
        messageId: "moveArrowhead",
        fix: (fixer) => [
          fixer.replaceText(opening, opening.value.replace("<", "")),
          fixer.replaceText(
            node.arrow,
            arrowText(node.arrow, node.arrow.line, true),
          ),
        ],
      },
    ]
  const line =
    node.arrow.line === "dotted"
      ? "-."
      : node.arrow.line === "thick"
        ? "=="
        : "--"
  return [
    {
      messageId: "useLineOfArrow",
      fix: (fixer) => [
        fixer.replaceText(opening, line),
        fixer.replaceText(
          node.arrow,
          arrowText(node.arrow, node.arrow.line, start),
        ),
      ],
    },
    {
      messageId: "useLineOfOpening",
      fix: (fixer) => [
        fixer.replaceText(opening, opening.value.replace("<", "")),
        fixer.replaceText(
          node.arrow,
          arrowText(node.arrow, opening.line, start),
        ),
      ],
    },
  ]
}

/** Compares the line and any leading arrowhead of a labelled link's arrows. */
export const blockNoMismatchedEdge: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds:
    "mismatched" | "useLineOfArrow" | "useLineOfOpening" | "moveArrowhead"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an edge with a label whose two arrows do not match.",
      recommended: true,
      url: ruleDocsUrl("block-no-mismatched-edge"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      useLineOfArrow: "Use the later arrow’s line in the opening arrow.",
      useLineOfOpening: "Use the opening arrow’s line in the later arrow.",
      moveArrowhead: "Move the opening arrowhead to the arrow after the label.",
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
          context.report({
            node,
            messageId: "mismatched",
            suggest: arrowSuggestions(context.sourceCode, node),
          })
        }
      },
    }
  },
}
