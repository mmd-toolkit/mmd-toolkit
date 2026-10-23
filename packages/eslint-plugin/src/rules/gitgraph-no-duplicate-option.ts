import type {
  GitgraphCherryPickStatement,
  GitgraphCommitStatement,
  GitgraphMergeStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { gitgraphScalarOption } from "../utils/gitgraph-options.ts"

/** Each scalar option keeps only the last value written in its statement. */
export const gitgraphNoDuplicateOption: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an option that replaces the value of the same option before it in one statement.",
      recommended: true,
      url: ruleDocsUrl("gitgraph-no-duplicate-option"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js uses this `{{name}}:` value instead of the earlier one in this statement.",
    },
  },
  create(context) {
    /** An empty value resets the history without losing a value of its own. */
    function check(
      node:
        | GitgraphCommitStatement
        | GitgraphMergeStatement
        | GitgraphCherryPickStatement,
    ): void {
      const values = new Map<string, string>()
      for (const option of node.options) {
        const scalar = gitgraphScalarOption(option)
        if (scalar === null) continue
        const previous = values.get(scalar.name)
        if (
          previous !== undefined &&
          previous !== "" &&
          previous !== scalar.value
        ) {
          context.report({
            node: option,
            messageId: "duplicate",
            data: { name: scalar.name },
          })
        }
        values.set(scalar.name, scalar.value)
      }
    }

    return {
      GitgraphCommitStatement: check,
      GitgraphMergeStatement: check,
      GitgraphCherryPickStatement: check,
    }
  },
}
