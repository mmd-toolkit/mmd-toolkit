/** The fields of ast/block.md that the block Db reads. */
import type {
  Identifier,
  NumericLiteral,
  StringLiteral,
  TreeNode,
} from "./tree.ts"

/** ast/block.md: BlockDiagram. */
export interface BlockDiagram extends TreeNode {
  readonly type: "BlockDiagram"
  readonly body: readonly BlockStatement[]
}

/** ast/block.md: BlockStatement. */
export type BlockStatement =
  | BlockNodeStatement
  | BlockSpaceStatement
  | BlockColumnsStatement
  | BlockCompositeStatement
  | BlockClassDefStatement
  | BlockClassStatement
  | BlockStyleStatement
  | BlockAccDescrBlockStatement

/** ast/block.md: BlockNodeStatement. */
export interface BlockNodeStatement extends TreeNode {
  readonly type: "BlockNodeStatement"
  readonly node: BlockNode
  readonly width: NumericLiteral | null
  readonly links: readonly BlockLink[]
}

/** ast/block.md: BlockNode. */
export interface BlockNode extends TreeNode {
  readonly type: "BlockNode"
  readonly id: Identifier
  readonly shape: BlockShape | BlockArrowShape | null
}

/** ast/block.md: BlockShape. */
export interface BlockShape extends TreeNode {
  readonly type: "BlockShape"
  readonly open: string
  readonly close: string
  readonly label: StringLiteral
}

/** ast/block.md: BlockArrowShape; each direction holds the whitespace that mermaid.js reads with its word. */
export interface BlockArrowShape extends TreeNode {
  readonly type: "BlockArrowShape"
  readonly label: StringLiteral
  readonly directions: readonly BlockLiteral[]
}

/** ast/block.md: BlockLink; only the closing arrow determines the edge. */
export interface BlockLink extends TreeNode {
  readonly type: "BlockLink"
  readonly arrow: BlockArrow
  readonly label: StringLiteral | null
  readonly target: BlockNode
}

/** ast/block.md: BlockArrow. */
export interface BlockArrow extends TreeNode {
  readonly type: "BlockArrow"
  readonly startMarker: string
  readonly line: string
  readonly endMarker: string
}

/** ast/block.md: BlockSpaceStatement. */
export interface BlockSpaceStatement extends TreeNode {
  readonly type: "BlockSpaceStatement"
  readonly width: NumericLiteral | null
}

/** ast/block.md: BlockColumnsStatement. */
export interface BlockColumnsStatement extends TreeNode {
  readonly type: "BlockColumnsStatement"
  readonly count: NumericLiteral | null
}

/** ast/block.md: BlockCompositeStatement. */
export interface BlockCompositeStatement extends TreeNode {
  readonly type: "BlockCompositeStatement"
  readonly head: BlockNodeStatement | null
  readonly body: readonly BlockStatement[]
}

/** ast/block.md: BlockClassDefStatement; a style is null where its part holds nothing. */
export interface BlockClassDefStatement extends TreeNode {
  readonly type: "BlockClassDefStatement"
  readonly name: Identifier
  readonly styles: readonly (BlockLiteral | null)[]
}

/** ast/block.md: BlockClassStatement. */
export interface BlockClassStatement extends TreeNode {
  readonly type: "BlockClassStatement"
  readonly ids: readonly BlockLiteral[]
  readonly cssClass: BlockLiteral | null
}

/** ast/block.md: BlockStyleStatement; a style is null where its part holds nothing. */
export interface BlockStyleStatement extends TreeNode {
  readonly type: "BlockStyleStatement"
  readonly id: Identifier
  readonly styles: readonly (BlockLiteral | null)[]
}

/** ast/block.md: BlockAccDescrBlockStatement. */
export interface BlockAccDescrBlockStatement extends TreeNode {
  readonly type: "BlockAccDescrBlockStatement"
}

/** ast/block.md: BlockLiteral. */
export interface BlockLiteral extends TreeNode {
  readonly type: "BlockLiteral"
}
