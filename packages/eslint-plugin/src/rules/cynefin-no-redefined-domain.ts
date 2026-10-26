import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"

/** Whether the later list lacks an earlier item, counting repeated items separately. */
function losesItems(
  previous: readonly string[],
  next: readonly string[],
): boolean {
  const remaining = new Map<string, number>()
  for (const item of next) remaining.set(item, (remaining.get(item) ?? 0) + 1)
  for (const item of previous) {
    const count = remaining.get(item) ?? 0
    if (count === 0) return true
    remaining.set(item, count - 1)
  }
  return false
}

/** Each domain statement replaces the preceding list of that domain, including an empty list. */
export const cynefinNoRedefinedDomain: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a domain written again without an item that it had before.",
      recommended: true,
      url: ruleDocsUrl("cynefin-no-redefined-domain"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the items of the domain `{{name}}`, set on line {{line}}, with those of this statement.",
    },
  },
  create(context) {
    const domains = new Map<
      string,
      { items: readonly string[]; line: number }
    >()
    return {
      CynefinDomainStatement(node) {
        const items = node.items.map((item) =>
          normalizeLineTerminators(item.label.value),
        )
        const previous = domains.get(node.name)
        if (previous !== undefined && losesItems(previous.items, items)) {
          context.report({
            node,
            messageId: "redefined",
            data: { name: node.name, line: String(previous.line) },
          })
        }
        domains.set(node.name, { items, line: node.loc.start.line })
      },
    }
  },
}
