/**
 * The nodes of a mindmap tree that the Db reads: the fields of
 * `packages/spec/docs/ast/mindmap.md` that `mindmap.ts` uses, and no others.
 */
import type { TreeNode } from "./tree.ts"

/** ast/mindmap.md: MindmapDiagram. */
export interface MindmapDiagram extends TreeNode {
  readonly type: "MindmapDiagram"
  readonly root: MindmapNode | null
}

/** ast/mindmap.md: MindmapNode. */
export interface MindmapNode extends TreeNode {
  readonly type: "MindmapNode"
  readonly indent: number
  readonly id: MindmapLiteral | null
  readonly shape: MindmapShape | null
  readonly decorations: readonly (
    MindmapIconStatement | MindmapClassStatement
  )[]
  readonly children: readonly MindmapNode[]
}

/** ast/mindmap.md: the openers of a shape. */
export type MindmapOpener = "(" | "((" | "[" | "{{" | ")" | "))" | "(-" | "-)"

/** ast/mindmap.md: the closers of a shape. */
export type MindmapCloser = ")" | "))" | "]" | "}}" | "(" | "((" | "(-" | "-)"

/** ast/mindmap.md: MindmapShape. */
export interface MindmapShape extends TreeNode {
  readonly type: "MindmapShape"
  readonly opener: MindmapOpener
  readonly closer: MindmapCloser
  readonly label: MindmapLabel
}

/** ast/mindmap.md: the kinds of a label. */
export type MindmapLabelKind = "text" | "string" | "markdown"

/** ast/mindmap.md: MindmapLabel. */
export interface MindmapLabel extends TreeNode {
  readonly type: "MindmapLabel"
  readonly kind: MindmapLabelKind
}

/** ast/mindmap.md: MindmapIconStatement. */
export interface MindmapIconStatement extends TreeNode {
  readonly type: "MindmapIconStatement"
  readonly icon: MindmapLiteral
}

/** ast/mindmap.md: MindmapClassStatement. */
export interface MindmapClassStatement extends TreeNode {
  readonly type: "MindmapClassStatement"
  readonly cssClass: MindmapLiteral
}

/** ast/mindmap.md: MindmapLiteral. */
export interface MindmapLiteral extends TreeNode {
  readonly type: "MindmapLiteral"
}
