import type { GitgraphNode } from "../ast/gitgraph.ts"

/** ast/gitgraph.md: the child fields in visitor order. */
export const gitgraphVisitorKeys: Readonly<
  Record<GitgraphNode["type"], readonly string[]>
> = {
  GitgraphDiagram: [
    "textBeforeHeader",
    "textBeforeDirection",
    "textBeforeColon",
    "body",
  ],
  GitgraphCommitStatement: ["options", "textAfter"],
  GitgraphBranchStatement: ["textBeforeName", "name", "order", "textAfter"],
  GitgraphCheckoutStatement: ["textBeforeBranch", "branch", "textAfter"],
  GitgraphMergeStatement: [
    "textBeforeBranch",
    "branch",
    "options",
    "textAfter",
  ],
  GitgraphCherryPickStatement: ["options", "textAfter"],
  GitgraphIdOption: ["textBefore", "textBeforeValue", "value"],
  GitgraphMessageOption: ["textBefore", "textBeforeValue", "value"],
  GitgraphTagOption: ["textBefore", "textBeforeValue", "value"],
  GitgraphTypeOption: ["textBefore", "textBeforeValue"],
  GitgraphParentOption: ["textBefore", "textBeforeValue", "value"],
  GitgraphOrderOption: ["textBefore", "textBeforeValue", "value"],
  GitgraphTitleStatement: ["value", "textAfter"],
  GitgraphAccTitleStatement: ["value", "textAfter"],
  GitgraphAccDescrStatement: ["value", "textAfter"],
  GitgraphAccDescrBlockStatement: ["value", "textAfter"],
  GitgraphLiteral: [],
  GitgraphIgnoredText: [],
}
