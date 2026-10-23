import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { hasLeadingWhitespace } from "../utils/block-class-ids.ts"

/**
 * Reports each class id whose lookup includes whitespace after a comma, and
 * the name of the class when it starts with a comma, which is what whitespace
 * before a comma leaves: whitespace ends the ids, and the rest of the line is
 * the name of the class.
 */
export const blockNoSpacedClassId: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "spaced" | "commaClass"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow whitespace around a comma in the ids of a `class` statement.",
      recommended: true,
      url: ruleDocsUrl("block-no-spaced-class-id"),
    },
    schema: [],
    messages: {
      spaced:
        "mermaid.js includes the whitespace after the comma in this id and gives the class to an unplaced block.",
      commaClass:
        "mermaid.js ends the ids at the whitespace before the comma and takes the rest of the line as the name of the class, which no `classDef` defines.",
    },
  },
  create(context) {
    return {
      BlockClassStatement(node) {
        for (const id of node.ids) {
          if (hasLeadingWhitespace(id)) {
            context.report({ node: id, messageId: "spaced" })
          }
        }
        if (node.cssClass?.value.startsWith(",")) {
          context.report({ node: node.cssClass, messageId: "commaClass" })
        }
      },
    }
  },
}
