import type { C4Node } from "../ast/c4.ts"

/** ast/c4.md: child fields, in source order. */
export const c4VisitorKeys: Readonly<
  Record<C4Node["type"], readonly string[]>
> = {
  C4Diagram: ["beforeBody", "body"],
  C4ElementStatement: ["arguments"],
  C4BoundaryStatement: ["arguments", "beforeBody", "body"],
  C4RelationshipStatement: ["arguments"],
  C4UpdateStatement: ["arguments"],
  C4NamedAttribute: ["key", "value"],
  C4TitleStatement: ["value"],
  C4AccDescriptionStatement: ["value"],
  C4AccTitleStatement: ["value"],
  C4AccDescrStatement: ["value"],
  C4AccDescrBlockStatement: ["value"],
  C4Literal: [],
}
