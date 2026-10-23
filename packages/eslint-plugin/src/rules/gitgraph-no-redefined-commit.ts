import type {
  GitgraphCommitStatement,
  GitgraphMergeStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { finalGitgraphId } from "../utils/gitgraph-options.ts"

/** Commits replace earlier commits or merges with the same final authored id. */
export const gitgraphNoRedefinedCommit: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `commit` with the id of a commit or a merge written before it.",
      recommended: true,
      url: ruleDocsUrl("gitgraph-no-redefined-commit"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the commit with this id, written on line {{line}}, with this commit.",
    },
  },
  create(context) {
    const commits = new Map<string, number>()

    /** Cherry-picks name an existing commit and never declare its id. */
    function check(
      node: GitgraphCommitStatement | GitgraphMergeStatement,
    ): void {
      const id = finalGitgraphId(node)
      if (id === "") return
      const previous = commits.get(id)
      if (node.type === "GitgraphCommitStatement" && previous !== undefined) {
        context.report({
          node,
          messageId: "redefined",
          data: { line: String(previous) },
        })
      }
      commits.set(id, node.loc.start.line)
    }

    return {
      GitgraphCommitStatement: check,
      GitgraphMergeStatement: check,
    }
  },
}
