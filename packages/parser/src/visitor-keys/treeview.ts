import type { TreeviewTreeNode } from "../ast/treeview.ts"

/** ast/treeview.md: the exact child fields in visitor/source order. */
export const treeviewVisitorKeys: Readonly<
  Record<TreeviewTreeNode["type"], readonly string[]>
> = {
  TreeviewDiagram: ["body"],
  TreeviewNode: [
    "textBefore",
    "prefix",
    "textBeforeName",
    "name",
    "annotations",
    "children",
  ],
  TreeviewClassAnnotation: ["textBefore", "prefix", "name"],
  TreeviewIconAnnotation: ["textBefore", "prefix", "name"],
  TreeviewDescriptionAnnotation: ["textBefore", "prefix", "value"],
  TreeviewTitleStatement: ["prefix", "value"],
  TreeviewAccTitleStatement: ["prefix", "value"],
  TreeviewAccDescrStatement: ["prefix", "value"],
  TreeviewAccDescrBlockStatement: ["prefix", "textBeforeOpen", "value"],
  TreeviewIdentifier: [],
  TreeviewLiteral: [],
  TreeviewBranchPrefix: [],
  TreeviewIgnoredText: [],
}
