import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { BlockCompositeStatement } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { indentationOf, lineTerminatorOf } from "../utils/line-text.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** More than one link would still be a chain after moving it. */
function edgeSuggestions(
  sourceCode: MermaidSourceCode,
  node: BlockCompositeStatement,
): SuggestedEdit<"moveEdgeAfterEnd">[] {
  const head = node.head
  if (head === null || head.links.length !== 1) return []
  if (
    !canEditRange(sourceCode, [
      head.width?.range[1] ?? head.node.range[1],
      head.range[1],
    ]) ||
    !canCompactRange(sourceCode, [
      head.width?.range[1] ?? head.node.range[1],
      head.range[1],
    ])
  )
    return []
  const end = sourceCode.getLastToken(node)
  if (end === null) return []
  const newline = lineTerminatorOf(sourceCode, node.loc.start.line)
  const sharesLine =
    (sourceCode.lines[end.loc.end.line - 1] ?? "")
      .slice(end.loc.end.column)
      .trim() !== ""
  const edge = `${head.node.id.name} ${sourceCode.getText(head.links[0])}`
  return [
    {
      messageId: "moveEdgeAfterEnd",
      fix: (fixer) => [
        fixer.removeRange([
          head.width?.range[1] ?? head.node.range[1],
          head.range[1],
        ]),
        fixer.insertTextAfter(
          end,
          `${newline}${indentationOf(sourceCode, node.loc.start.line)}${edge}${sharesLine ? newline : ""}`,
        ),
      ],
    },
  ]
}

/** Reports a composite head with links once, regardless of its link count. */
export const blockNoEdgeInCompositeHead: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "edge" | "moveEdgeAfterEnd"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a link in the head of a composite block.",
      recommended: true,
      url: ruleDocsUrl("block-no-edge-in-composite-head"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      moveEdgeAfterEnd: "Move this edge after the composite’s `end`.",
      edge: "mermaid.js gives this composite no id and loses the links and blocks written in its head.",
    },
  },
  create(context) {
    return {
      BlockCompositeStatement(node) {
        if (node.head !== null && node.head.links.length > 0) {
          context.report({
            node: node.head,
            messageId: "edge",
            suggest: edgeSuggestions(context.sourceCode, node),
          })
        }
      },
    }
  },
}
