import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** A failed block becomes an unquoted node name; quoted names are intentional. */
export const treeviewNoUnclosedDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "unclosed"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr {` block that no `}` closes.",
      recommended: true,
      url: ruleDocsUrl("treeview-no-unclosed-description-block"),
    },
    schema: [],
    messages: {
      unclosed:
        "mermaid.js reads this unclosed `accDescr {` as a node name and sets no description from it.",
    },
  },
  create(context) {
    return {
      TreeviewNode(node) {
        const { name } = node
        if (
          name.type !== "TreeviewIdentifier" ||
          !name.name.startsWith("accDescr")
        ) {
          return
        }
        let at = "accDescr".length
        while (name.name[at] === " " || name.name[at] === "\t") at++
        if (name.name[at] === "{") {
          context.report({ node: name, messageId: "unclosed" })
        }
      },
    }
  },
}
