import type { BlockLiteral } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { hasLeadingWhitespace } from "../utils/block-class-ids.ts"
import { declaredNodesOf } from "../utils/block-declarations.ts"
import { appendItems } from "../utils/collections.ts"

/**
 * Collect declarations before checking class ids, including declarations after
 * their uses. Whitespace-prefixed ids belong to `block-no-spaced-class-id`.
 */
export const blockNoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "undefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a `class` statement for an id that no block has.",
      recommended: true,
      url: ruleDocsUrl("block-no-undef"),
    },
    schema: [],
    messages: {
      undefined:
        "mermaid.js gives this class to an unplaced block `{{name}}`: no statement of the diagram declares this id.",
    },
  },
  create(context) {
    const defined = new Set(["root"])
    const references: BlockLiteral[] = []
    return {
      BlockNodeStatement(node, parent) {
        for (const block of declaredNodesOf(node, parent)) {
          defined.add(block.id.name)
        }
      },
      BlockClassStatement(node) {
        appendItems(references, node.ids)
      },
      "BlockDiagram:exit"() {
        for (const id of references) {
          if (hasLeadingWhitespace(id) || defined.has(id.value)) continue
          context.report({
            node: id,
            messageId: "undefined",
            data: { name: id.value },
          })
        }
      },
    }
  },
}
