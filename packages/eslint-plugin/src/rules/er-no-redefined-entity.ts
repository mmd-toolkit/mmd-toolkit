import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { erNameText } from "../utils/er-names.ts"

/**
 * The rule `er-no-redefined-entity`, described in
 * `docs/rules/er-no-redefined-entity.md`: an entity statement with an alias
 * when an earlier entity statement gave the same entity a different alias: the
 * first alias stays. An alias given to an entity that has none yet is set, and
 * the same alias again, in quotes or not, changes nothing. A relationship gives
 * no alias, and the statements inside a subgraph and outside it name the same
 * entities. ESLint visits the statements in the order of the source.
 */
export const erNoRedefinedEntity: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an entity statement that gives an entity a second alias.",
      recommended: true,
      url: ruleDocsUrl("er-no-redefined-entity"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js keeps the first alias `{{previous}}` of the entity `{{name}}` and ignores this alias.",
    },
  },
  create(context) {
    /** For each entity name, the first alias that an entity statement gave it. */
    const aliases = new Map<string, string>()
    return {
      ErEntityStatement(node) {
        if (node.alias === null) return
        const name = erNameText(node.name)
        const alias = erNameText(node.alias)
        const first = aliases.get(name)
        if (first === undefined) {
          aliases.set(name, alias)
        } else if (first !== alias) {
          context.report({
            node,
            messageId: "redefined",
            data: { previous: first, name },
          })
        }
      },
    }
  },
}
