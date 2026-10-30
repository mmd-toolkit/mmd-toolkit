import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { RuleFixer } from "@eslint/core"
import type { BlockNodeStatement } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { indentationOf, lineTerminatorOf } from "../utils/line-text.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isCompositeHead } from "../utils/block-declarations.ts"

/** Each later link starts with only the preceding target's id, not its shape. */
function chainFix(
  sourceCode: MermaidSourceCode,
  node: BlockNodeStatement,
): RuleFixer | null {
  if (
    node.links
      .slice(1)
      .some(
        (link, index) =>
          !canEditRange(sourceCode, [
            node.links[index].target.range[1],
            link.range[0],
          ]) ||
          !canCompactRange(sourceCode, [
            node.links[index].target.range[1],
            link.range[0],
          ]),
      )
  )
    return null
  const newline =
    lineTerminatorOf(sourceCode, node.loc.start.line) +
    indentationOf(sourceCode, node.loc.start.line)
  return (fixer) =>
    node.links.slice(1).map((link, index) => {
      const previous = node.links[index].target
      return fixer.replaceTextRange(
        [previous.range[1], link.range[0]],
        `${newline}${previous.id.name} `,
      )
    })
}

/**
 * The rule `block-no-edge-chain`: report a statement with two or more links.
 * Composite heads belong to `block-no-edge-in-composite-head` instead.
 */
export const blockNoEdgeChain: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "chain"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an edge statement with more than one link.",
      recommended: true,
      url: ruleDocsUrl("block-no-edge-chain"),
    },
    fixable: "code",
    schema: [],
    messages: {
      chain:
        "mermaid.js keeps only the last link of this chain, with no start; earlier links are lost and their blocks are not declared by this statement.",
    },
  },
  create(context) {
    return {
      BlockNodeStatement(node, parent) {
        if (node.links.length > 1 && !isCompositeHead(node, parent)) {
          context.report({
            node,
            messageId: "chain",
            fix: chainFix(context.sourceCode, node),
          })
        }
      },
    }
  },
}
