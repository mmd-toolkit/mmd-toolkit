import type { BlockTreeNode } from "../ast/block.ts"

/**
 * ast/block.md: the child fields of each block diagram node type, as each
 * node's section states them, in the order in which a walk visits them.
 */
export const blockVisitorKeys: Readonly<
  Record<BlockTreeNode["type"], readonly string[]>
> = {
  BlockDiagram: ["body"],
  BlockNodeStatement: ["node", "width", "links"],
  BlockNode: ["id", "shape"],
  BlockShape: ["label"],
  BlockArrowShape: ["label", "directions"],
  BlockLink: ["opening", "label", "arrow", "target"],
  BlockArrow: [],
  BlockOpeningArrow: [],
  BlockSpaceStatement: ["width"],
  BlockColumnsStatement: ["count"],
  BlockCompositeStatement: ["head", "body"],
  BlockClassDefStatement: ["name", "styles"],
  BlockClassStatement: ["ids", "cssClass"],
  BlockStyleStatement: ["id", "styles"],
  BlockAccDescrBlockStatement: [],
  BlockLiteral: [],
}
