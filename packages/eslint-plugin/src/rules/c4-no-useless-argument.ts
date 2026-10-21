import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { c4Parameters } from "../utils/c4-arguments.ts"
import type { C4Call } from "../utils/c4-arguments.ts"

/** Every written entry counts, including empty entries and named attributes. */
export const c4NoUselessArgument: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "useless"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow nonempty arguments beyond the parameters that a C4 call reads.",
      recommended: true,
      url: ruleDocsUrl("c4-no-useless-argument"),
    },
    schema: [],
    messages: {
      useless:
        "mermaid.js ignores this argument: `{{keyword}}` reads at most {{limit}} written arguments.",
    },
  },
  create(context) {
    /** Report only nonempty entries past the last consumed written position. */
    function check(node: C4Call): void {
      const limit = c4Parameters(node).fields.length
      for (const argument of node.arguments.slice(limit)) {
        if (argument === null) continue
        const value =
          argument.type === "C4NamedAttribute"
            ? argument.value.value
            : argument.value
        if (value.trim() === "") continue
        context.report({
          node: argument,
          messageId: "useless",
          data: { keyword: node.keyword, limit: String(limit) },
        })
      }
    }

    return {
      C4ElementStatement: check,
      C4BoundaryStatement: check,
      C4RelationshipStatement: check,
      C4UpdateStatement: check,
    }
  },
}
