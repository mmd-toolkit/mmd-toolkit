import type { StringLiteral, TreeNode } from "./tree.ts"

/** ast/c4.md: the header kind and the two written statement lists. */
export interface C4Diagram extends TreeNode {
  readonly type: "C4Diagram"
  readonly kind:
    "context" | "container" | "component" | "dynamic" | "deployment"
  readonly beforeBody: readonly C4AccDescrBlockStatement[]
  readonly body: readonly C4Statement[]
}

/** ast/c4.md: every statement remains in written order. */
export type C4Statement =
  | C4ElementStatement
  | C4BoundaryStatement
  | C4RelationshipStatement
  | C4UpdateStatement
  | C4TitleStatement
  | C4AccDescriptionStatement
  | C4AccTitleStatement
  | C4AccDescrStatement
  | C4AccDescrBlockStatement

/** ast/c4.md: one flat argument list, including empty entries. */
export type C4Argument = C4Literal | StringLiteral | C4NamedAttribute | null

/** ast/c4.md: a shape call. */
export interface C4ElementStatement extends TreeNode {
  readonly type: "C4ElementStatement"
  readonly keyword: string
  readonly arguments: readonly C4Argument[]
}

/** ast/c4.md: a boundary call and its written brace nesting. */
export interface C4BoundaryStatement extends TreeNode {
  readonly type: "C4BoundaryStatement"
  readonly keyword: string
  readonly arguments: readonly C4Argument[]
  readonly beforeBody: readonly C4AccDescrBlockStatement[]
  readonly body: readonly C4Statement[]
}

/** ast/c4.md: a relationship call, including RelIndex's written index. */
export interface C4RelationshipStatement extends TreeNode {
  readonly type: "C4RelationshipStatement"
  readonly keyword: string
  readonly arguments: readonly C4Argument[]
}

/** ast/c4.md: a style or layout update call. */
export interface C4UpdateStatement extends TreeNode {
  readonly type: "C4UpdateStatement"
  readonly keyword: string
  readonly arguments: readonly C4Argument[]
}

/** ast/c4.md: the key excludes $ and =; the quoted value is nonempty. */
export interface C4NamedAttribute extends TreeNode {
  readonly type: "C4NamedAttribute"
  readonly key: C4Literal | null
  readonly value: StringLiteral
}

/** ast/c4.md: text after the first separator, including remaining whitespace. */
export interface C4TitleStatement extends TreeNode {
  readonly type: "C4TitleStatement"
  readonly value: C4Literal
}

/** ast/c4.md: the long description spelling preserves remaining whitespace. */
export interface C4AccDescriptionStatement extends TreeNode {
  readonly type: "C4AccDescriptionStatement"
  readonly value: C4Literal
}

/** ast/c4.md: the trimmed colon title, null when empty. */
export interface C4AccTitleStatement extends TreeNode {
  readonly type: "C4AccTitleStatement"
  readonly value: C4Literal | null
}

/** ast/c4.md: the trimmed colon description, null when empty. */
export interface C4AccDescrStatement extends TreeNode {
  readonly type: "C4AccDescrStatement"
  readonly value: C4Literal | null
}

/** ast/c4.md: a closed description block, null when empty. */
export interface C4AccDescrBlockStatement extends TreeNode {
  readonly type: "C4AccDescrBlockStatement"
  readonly value: C4Literal | null
}

/** ast/c4.md: written bare text, named keys, titles and accessibility text. */
export interface C4Literal extends TreeNode {
  readonly type: "C4Literal"
  readonly value: string
}
