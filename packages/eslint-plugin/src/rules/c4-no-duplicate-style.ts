import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { c4Assignments } from "../utils/c4-arguments.ts"
import { c4DeclarationVisitor } from "../utils/c4-declarations.ts"
import type { C4Declaration } from "../utils/c4-declarations.ts"

/** Compare only fields given by updates, keeping the resolved target's identity. */
export const c4NoDuplicateStyle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a style update that replaces a value that an earlier update gave.",
      recommended: true,
      url: ruleDocsUrl("c4-no-duplicate-style"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the `{{name}}` given by an earlier update with this value.",
    },
  },
  create(context) {
    const targets = new Map<C4Declaration, Map<string, string>>()
    return c4DeclarationVisitor({
      declared(target, fields) {
        const previous = targets.get(target)
        if (previous === undefined) return
        for (const field of fields) previous.delete(field)
      },
      update(node, target) {
        if (target === undefined) return
        let fields = targets.get(target)
        if (fields === undefined) {
          fields = new Map()
          targets.set(target, fields)
        }
        for (const { argument, key, value } of c4Assignments(node)) {
          if (key === "alias" || key === "from" || key === "to") continue
          const previous = fields.get(key)
          if (previous !== undefined && previous !== value) {
            context.report({
              node: argument ?? node,
              messageId: "duplicate",
              data: { name: key },
            })
          }
          fields.set(key, value)
        }
      },
    })
  },
}
