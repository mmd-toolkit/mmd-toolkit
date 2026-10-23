import type { TreeNode } from "./tree.ts"

/** ast/info.md: no authored field contributes to the empty summary. */
export interface InfoDiagram extends TreeNode {
  readonly type: "InfoDiagram"
}
