import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"

/** A comment inside the braces keeps an otherwise empty block as a placeholder. */
export const packetNoEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("packet-no-empty-description-block"),
    },
    schema: [],
    messages: {
      empty:
        "mermaid.js sets an empty description from this empty `accDescr` block, replacing any earlier description.",
    },
  },
  create(context) {
    return {
      PacketAccDescrBlockStatement(node) {
        if (isEmptyDescriptionBlock(context.sourceCode, node)) {
          context.report({ node, messageId: "empty" })
        }
      },
    }
  },
}
