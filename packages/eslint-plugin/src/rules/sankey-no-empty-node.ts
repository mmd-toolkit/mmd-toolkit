import type { SankeyLinkStatement } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** The name of a source or a target of a link: the text of the identifier or of the string. */
function nameOf(field: SankeyLinkStatement["source"]): string {
  return field.type === "SankeyIdentifier" ? field.name : field.value
}

/**
 * The rule `sankey-no-empty-node`, described in
 * `docs/rules/sankey-no-empty-node.md`: the source and the target of a link
 * whose name is empty once the whitespace at its ends is removed, as mermaid.js
 * reads it, also in quotes. Each field is reported, so a link from an empty
 * source to an empty target gets two reports. A field with nothing in it is
 * rejected by mermaid.js, and the parser rejects it as well.
 */
export const sankeyNoEmptyNode: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a source or a target of whitespace only, which makes a node without a name.",
      recommended: true,
      url: ruleDocsUrl("sankey-no-empty-node"),
    },
    schema: [],
    messages: {
      empty:
        "mermaid.js reads this field as the empty name and adds a node without a name.",
    },
  },
  create(context) {
    return {
      SankeyLinkStatement(node) {
        for (const field of [node.source, node.target]) {
          if (nameOf(field).trim() === "") {
            context.report({ node: field, messageId: "empty" })
          }
        }
      },
    }
  },
}
