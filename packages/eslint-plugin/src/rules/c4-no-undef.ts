import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { c4DeclarationVisitor } from "../utils/c4-declarations.ts"

/** Check each style update against the targets that exist at that point. */
export const c4NoUndef: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "undefinedElement" | "undefinedRelationship"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a style update whose target does not exist when the update is read.",
      recommended: true,
      url: ruleDocsUrl("c4-no-undef"),
    },
    schema: [],
    messages: {
      undefinedElement:
        "mermaid.js applies no style: no element or boundary has this alias when this `UpdateElementStyle` is read.",
      undefinedRelationship:
        "mermaid.js applies no style: no relationship has these ordered endpoints when this `UpdateRelStyle` is read.",
    },
  },
  create(context) {
    return c4DeclarationVisitor({
      update(node, applied) {
        if (applied) return
        context.report({
          node:
            node.keyword === "UpdateElementStyle"
              ? (node.arguments[0] ?? node)
              : node,
          messageId:
            node.keyword === "UpdateElementStyle"
              ? "undefinedElement"
              : "undefinedRelationship",
        })
      },
    })
  },
}
