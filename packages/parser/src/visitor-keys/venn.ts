import type { VennNode } from "../ast/venn.ts"

/** ast/venn.md: child fields in their specified order. */
export const vennVisitorKeys: Readonly<
  Record<VennNode["type"], readonly string[]>
> = {
  VennDiagram: ["body"],
  VennSubsetStatement: ["sets", "label", "size"],
  VennTextStatement: ["targets", "id", "label"],
  VennStyleStatement: ["targets", "properties"],
  VennStyleProperty: ["key", "value"],
  VennTitleStatement: ["value"],
  VennLabel: [],
  VennLiteral: [],
  VennIgnoredText: [],
}
