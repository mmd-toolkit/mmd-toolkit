import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { BlockNodeStatement, Range } from "@mmd-toolkit/parser"
import { traverseNodes } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  declaredNodesOf,
  isCompositeHead,
} from "../utils/block-declarations.ts"

/** A width is removed with its colon; moving it must not expose another edge width. */
function widthSuggestions(
  sourceCode: MermaidSourceCode,
  node: BlockNodeStatement,
  declaration: BlockNodeStatement | undefined,
  edgeCount: number,
): SuggestedEdit<"removeWidth" | "moveWidthToDeclaration">[] {
  if (node.width === null) return []
  const colon = sourceCode.getTokenBefore(node.width)
  if (colon === null) return []
  const range: Range = [colon.range[0], node.width.range[1]]
  if (!canEditRange(sourceCode, range) || !canCompactRange(sourceCode, range))
    return []
  const width = sourceCode.getText(node.width)
  const suggestions: SuggestedEdit<"removeWidth" | "moveWidthToDeclaration">[] =
    [{ messageId: "removeWidth", fix: (fixer) => fixer.removeRange(range) }]
  if (
    declaration !== undefined &&
    edgeCount === 1 &&
    (declaration.width === null ||
      (canEditRange(sourceCode, declaration.width.range) &&
        canCompactRange(sourceCode, declaration.width.range)))
  )
    suggestions.push({
      messageId: "moveWidthToDeclaration",
      fix: (fixer) => [
        fixer.removeRange(range),
        declaration.width === null
          ? fixer.insertTextAfter(declaration.node, `:${width}`)
          : fixer.replaceText(declaration.width, width),
      ],
    })
  return suggestions
}

/**
 * Keep each id's first declared width, or one for an edge endpoint. Only a
 * one-link statement outside a composite head can have a useless edge width.
 */
export const blockNoUselessWidth: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "useless" | "removeWidth" | "moveWidthToDeclaration"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a width on the first block of an edge.",
      recommended: true,
      url: ruleDocsUrl("block-no-useless-width"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeWidth: "Remove this width.",
      moveWidthToDeclaration:
        "Move this width to the first standalone declaration.",
      useless:
        "mermaid.js drops this width with the link; the block `{{name}}` keeps its width of {{width}} column(s).",
    },
  },
  create(context) {
    const declarations = new Map<string, BlockNodeStatement>()
    const seen = new Set(["root"])
    const edges = new Map<string, number>()
    traverseNodes(context.sourceCode.ast, {
      enterNode(node, parent) {
        if (
          node.type === "BlockNodeStatement" &&
          !isCompositeHead(node, parent) &&
          node.links.length === 1 &&
          node.width !== null
        )
          edges.set(node.node.id.name, (edges.get(node.node.id.name) ?? 0) + 1)
      },
      leaveNode() {
        /* Only edge widths enter this inventory. */
      },
    })
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
            suggest: widthSuggestions(
              context.sourceCode,
              node,
              declarations.get(name),
              edges.get(name) ?? 0,
            ),
          })
        }
        for (const block of declaredNodesOf(node, parent)) {
          if (!seen.has(block.id.name)) {
            seen.add(block.id.name)
            if (node.links.length === 0) declarations.set(block.id.name, node)
          }
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
