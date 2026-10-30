import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { c4Assignments } from "../utils/c4-arguments.ts"
import { c4DeclarationVisitor } from "../utils/c4-declarations.ts"

/** Only applied updates can lose a style to a key with incorrect casing. */
export const c4NoInvalidAttributeKey: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "invalidKey"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow incorrect casing of the color and offset keys in C4 style updates.",
      recommended: true,
      url: ruleDocsUrl("c4-no-invalid-attribute-key"),
    },

    schema: [],
    messages: {
      invalidKey:
        "mermaid.js stores `{{name}}` as a separate attribute; use `{{expected}}` to set this style.",
    },
  },
  create(context) {
    return c4DeclarationVisitor({
      update(node, target) {
        if (target === undefined) return
        const keys =
          node.keyword === "UpdateElementStyle"
            ? ["bgColor", "fontColor", "borderColor"]
            : ["textColor", "lineColor", "offsetX", "offsetY"]
        for (const { argument, key } of c4Assignments(node)) {
          if (argument?.type !== "C4NamedAttribute" || argument.key === null)
            continue
          const expected = keys.find(
            (name) => name.toLowerCase() === key.toLowerCase(),
          )
          if (expected === undefined || expected === key) continue
          context.report({
            node: argument.key,
            messageId: "invalidKey",

            data: { name: key, expected },
          })
        }
      },
    })
  },
}
