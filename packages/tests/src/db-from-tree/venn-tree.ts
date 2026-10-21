import type { Identifier, StringLiteral, TreeNode } from "./tree.ts"

/** ast/venn.md: a flat written statement list, including swallowed fragments. */
export interface VennDiagram extends TreeNode {
  readonly type: "VennDiagram"
  readonly body: readonly VennStatement[]
}

/** ast/venn.md: bare and quoted names retain order and repetitions. */
export type VennName = Identifier | StringLiteral

/** ast/venn.md: numeric spelling is needed for parseFloat and text ids. */
export interface VennNumber extends TreeNode {
  readonly type: "NumericLiteral"
  readonly raw: string
}

/** ast/venn.md: the five statement alternatives. */
export type VennStatement =
  | VennSubsetStatement
  | VennTextStatement
  | VennStyleStatement
  | VennTitleStatement
  | VennIgnoredText

/** ast/venn.md: one set or a written union, with optional label and size. */
export interface VennSubsetStatement extends TreeNode {
  readonly type: "VennSubsetStatement"
  readonly kind: "set" | "union"
  readonly sets: readonly VennName[]
  readonly label: VennLabel | null
  readonly size: VennNumber | null
}

/** ast/venn.md: null targets denote an enabled implicit-text marker. */
export interface VennTextStatement extends TreeNode {
  readonly type: "VennTextStatement"
  readonly targets: readonly VennName[] | null
  readonly id: VennName | VennNumber
  readonly label: VennLabel | null
}

/** ast/venn.md: repeated properties remain separate written nodes. */
export interface VennStyleStatement extends TreeNode {
  readonly type: "VennStyleStatement"
  readonly targets: readonly VennName[]
  readonly properties: readonly VennStyleProperty[]
}

/** ast/venn.md: arbitrary bare keys and quoted or bare values. */
export interface VennStyleProperty extends TreeNode {
  readonly type: "VennStyleProperty"
  readonly key: Identifier
  readonly value: StringLiteral | VennLiteral
}

/** ast/venn.md: all text after the first title separator. */
export interface VennTitleStatement extends TreeNode {
  readonly type: "VennTitleStatement"
  readonly value: VennLiteral
}

/** ast/venn.md: bracket interior, with written padding and without quotes. */
export interface VennLabel extends TreeNode {
  readonly type: "VennLabel"
  readonly kind: "text" | "string"
  readonly value: string
}

/** ast/venn.md: title text or the complete bare style value. */
export interface VennLiteral extends TreeNode {
  readonly type: "VennLiteral"
  readonly value: string
}

/** ast/venn.md: the non-whitespace code unit swallowed before a comment. */
export interface VennIgnoredText extends TreeNode {
  readonly type: "VennIgnoredText"
  readonly value: string
}
