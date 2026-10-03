import type { TreeRange } from "../db-from-tree/tree.ts"

/**
 * The tree as `ast.json` records it, as far as the check of a tree reads it:
 * the records of `packages/parser/docs/positions.md` and of
 * `packages/spec/docs/ast.md`. A tree is JSON, so any parser can write it.
 */

/** ast.md, Positions: a position record. */
export interface Position {
  readonly line: number
  readonly column: number
}

/** ast.md, Positions: a location record. */
export interface Location {
  readonly start: Position
  readonly end: Position
}

/** Something of the tree that has a place in the source: a node, a token, a comment, a directive, or the frontmatter. */
export interface Placed {
  readonly type: string
  readonly range: TreeRange
  readonly loc: Location
}

/** A node: its other fields are those of its type. */
export interface CheckedNode extends Placed {
  readonly [field: string]: unknown
}

/** ast.md, Tokens: a token. */
export interface CheckedToken extends Placed {
  readonly value: string
}

/** ast.md, Comment. */
export interface CheckedComment extends Placed {
  readonly mark: string | null
  readonly value: string
}

/** ast.md, Directive. */
export interface CheckedDirective extends Placed {
  readonly name: string
  readonly value: string
  readonly closed: boolean
}

/** ast.md, Frontmatter. */
export interface CheckedFrontmatter extends Placed {
  readonly value: string
  readonly valueRange: TreeRange
}

/** ast.md, Root. */
export interface CheckedRoot extends CheckedNode {
  readonly type: "Root"
  readonly diagramType: string
  readonly body: CheckedNode
  readonly frontmatter: CheckedFrontmatter | null
  readonly comments: readonly CheckedComment[]
  readonly directives: readonly CheckedDirective[]
  readonly tokens: readonly CheckedToken[]
}

/** A condition of the tree that does not hold. */
export interface TreeProblem {
  /** The node, token, or record, or the part of the tree, that breaks it. */
  readonly where: string
  readonly message: string
}
