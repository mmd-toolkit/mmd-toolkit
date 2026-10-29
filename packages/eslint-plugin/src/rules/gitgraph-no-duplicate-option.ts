import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { Node } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { whitespacePartRange } from "../utils/part-removal.ts"
import type {
  GitgraphCherryPickStatement,
  GitgraphCommitStatement,
  GitgraphMergeStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { gitgraphScalarOption } from "../utils/gitgraph-options.ts"

/** Merge and cherry-pick identities decide semantic acceptance, so only their type is removable. */
function optionRemovals(
  sourceCode: MermaidSourceCode,
  statement:
    | GitgraphCommitStatement
    | GitgraphMergeStatement
    | GitgraphCherryPickStatement,
  node: Node,
  previous: Node,
  name: string,
  canRemovePrevious: boolean,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  if (statement.type !== "GitgraphCommitStatement" && name !== "type") return []
  const choices: { node: Node; messageId: "removeThis" | "removePrevious" }[] =
    [{ node, messageId: "removeThis" }]
  if (canRemovePrevious)
    choices.push({ node: previous, messageId: "removePrevious" })
  return choices
    .filter(
      (choice) =>
        canEditRange(
          sourceCode,
          whitespacePartRange(sourceCode, choice.node),
        ) &&
        canCompactRange(
          sourceCode,
          whitespacePartRange(sourceCode, choice.node),
        ),
    )
    .map((choice) => ({
      messageId: choice.messageId,
      fix: (fixer) =>
        fixer.removeRange(whitespacePartRange(sourceCode, choice.node)),
    }))
}

/** Each scalar option keeps only the last value written in its statement. */
export const gitgraphNoDuplicateOption: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an option that replaces the value of the same option before it in one statement.",
      recommended: true,
      url: ruleDocsUrl("gitgraph-no-duplicate-option"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this option.",
      removePrevious: "Remove the earlier option.",
      duplicate:
        "mermaid.js replaces the earlier `{{name}}:` value in this statement with this value.",
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
      const values = new Map<
        string,
        { node: Node; value: string; before: string | undefined }
      >()
      for (const option of node.options) {
        const scalar = gitgraphScalarOption(option)
        if (scalar === null) continue
        const previous = values.get(scalar.name)
        if (
          previous !== undefined &&
          previous.value !== "" &&
          previous.value !== scalar.value
        ) {
          context.report({
            node: option,
            messageId: "duplicate",
            data: { name: scalar.name },
            suggest: optionRemovals(
              context.sourceCode,
              node,
              option,
              previous.node,
              scalar.name,
              previous.before === undefined ||
                previous.before === "" ||
                previous.before === scalar.value,
            ),
          })
        }
        values.set(scalar.name, {
          node: option,
          value: scalar.value,
          before: previous?.value,
        })
      }
    }

    return {
      GitgraphCommitStatement: check,
      GitgraphMergeStatement: check,
      GitgraphCherryPickStatement: check,
    }
  },
}
