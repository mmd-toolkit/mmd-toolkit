import type { IshikawaTreeNode } from "@mmd-toolkit/ast"

/** ast/ishikawa.md: child fields in their specified order. */
export const ishikawaVisitorKeys: Readonly<
  Record<IshikawaTreeNode["type"], readonly string[]>
> = {
  IshikawaDiagram: ["root"],
  IshikawaNode: ["text", "children"],
  IshikawaLiteral: [],
}
