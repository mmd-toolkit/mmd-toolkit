import { oneOfTwoRemovals } from "../utils/removal.ts"
import type { WardleySizeStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Both dimensions must remain equal. */
function sameSize(
  left: WardleySizeStatement,
  right: WardleySizeStatement,
): boolean {
  return (
    left.width.value === right.width.value &&
    left.height.value === right.height.value
  )
}

/** Dimensions compare as numbers; configuration does not enter the statement history. */
export const wardleyNoDuplicateSize: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a `size` that replaces the size set before it.",
      recommended: true,
      url: ruleDocsUrl("wardley-no-duplicate-size"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this statement.",
      removePrevious: "Remove the earlier statement.",
      duplicate: "mermaid.js replaces the earlier map size with this size.",
    },
  },
  create(context) {
    let previous: {
      node: WardleySizeStatement
      before: WardleySizeStatement | undefined
    } | null = null
    return {
      WardleySizeStatement(node) {
        if (previous !== null && !sameSize(previous.node, node)) {
          context.report({
            node,
            messageId: "duplicate",
            suggest: oneOfTwoRemovals(
              context.sourceCode,
              node,
              previous.node,
              previous.before === undefined || sameSize(previous.before, node),
            ),
          })
        }
        previous = { node, before: previous?.node }
      },
    }
  },
}
