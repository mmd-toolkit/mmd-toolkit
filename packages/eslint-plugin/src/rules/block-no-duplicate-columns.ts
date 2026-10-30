import { oneOfTwoRemovals } from "../utils/removal.ts"
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
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `columns` statement that changes the count of its block.",
      recommended: true,
      url: ruleDocsUrl("block-no-duplicate-columns"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement.",
      duplicate:
        "mermaid.js replaces the earlier column count with this count for the whole block.",
    },
  },
  create(context) {
    /** Checks only the columns in this block's own statement list. */
    function check(block: BlockDiagram | BlockCompositeStatement): void {
      let before: BlockColumnsStatement | undefined,
        previous: BlockColumnsStatement | undefined
      for (const node of block.body) {
        if (node.type !== "BlockColumnsStatement") continue
        if (
          previous !== undefined &&
          (previous.count?.value ?? -1) !== (node.count?.value ?? -1)
        ) {
          context.report({
            node,
            messageId: "duplicate",
            suggest: oneOfTwoRemovals(
              context.sourceCode,
              node,
              previous,
              before === undefined ||
                (before.count?.value ?? -1) === (node.count?.value ?? -1),
            ),
          })
        }
        before = previous
        previous = node
      }
    }

    return {
      BlockDiagram: check,
      BlockCompositeStatement: check,
    }
  },
}
