import type {
  BlockColumnsStatement,
  BlockCompositeStatement,
  BlockDiagram,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Compares consecutive explicit counts independently in each statement list. */
export const blockNoDuplicateColumns: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `columns` statement that changes the count of its block.",
      recommended: true,
      url: ruleDocsUrl("block-no-duplicate-columns"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier column count with this count for the whole block.",
    },
  },
  create(context) {
    /** Checks only the columns in this block's own statement list. */
    function check(block: BlockDiagram | BlockCompositeStatement): void {
      let previous: BlockColumnsStatement | undefined
      for (const node of block.body) {
        if (node.type !== "BlockColumnsStatement") continue
        if (
          previous !== undefined &&
          (previous.count?.value ?? -1) !== (node.count?.value ?? -1)
        ) {
          context.report({
            node,
            messageId: "duplicate",
          })
        }
        previous = node
      }
    }

    return {
      BlockDiagram: check,
      BlockCompositeStatement: check,
    }
  },
}
