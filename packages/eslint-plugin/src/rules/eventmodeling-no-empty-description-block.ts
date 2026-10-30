import type { SuggestedEdit } from "@eslint/core"
import type { EventmodelingAccDescrBlockStatement } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { eventmodelingRemovalRange } from "../utils/eventmodeling-removals.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"

/** Removing a directive would also remove its settings. */
function blockRemoval(
  sourceCode: MermaidSourceCode,
  node: EventmodelingAccDescrBlockStatement,
): SuggestedEdit<"removeBlock">[] {
  const range = eventmodelingRemovalRange(sourceCode, node)
  return range === null
    ? []
    : [{ messageId: "removeBlock", fix: (fixer) => fixer.removeRange(range) }]
}

/** A comment inside the braces keeps an otherwise empty block as a placeholder. */
export const eventmodelingNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty" | "removeBlock"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("eventmodeling-no-empty-description-block"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      empty:
        "mermaid.js uses the text of this empty `accDescr` block as the description, replacing any earlier description.",
      removeBlock: "Remove the empty block.",
    },
  },
  create(context) {
    return {
      EventmodelingAccDescrBlockStatement(node) {
        if (isEmptyDescriptionBlock(context.sourceCode, node)) {
          context.report({
            node,
            messageId: "empty",
            suggest: blockRemoval(context.sourceCode, node),
          })
        }
      },
    }
  },
}
