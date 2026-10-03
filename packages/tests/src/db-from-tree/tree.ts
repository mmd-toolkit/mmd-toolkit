/**
 * The tree as `ast.json` records it, as far as the Db is built from it.
 *
 * The tree is defined by the specification (`packages/spec/docs/ast.md` and
 * `ast/*.md`); a tree is JSON, so any parser can write it. The types in this
 * directory describe only the fields that the Db reads, not the whole tree:
 * they are the list of fields an implementation in another language has to
 * give for the Db to be built. A field that is read and not there is a
 * mistake of the tree, and is reported with the type of the node and the
 * place (see {@link TreeError}).
 */

/** A range of the source: the offset of its start and of its end, in UTF-16 code units. */
export type TreeRange = readonly [start: number, end: number]

/** A node: it has a type and a range. */
export interface TreeNode {
  readonly type: string
  readonly range: TreeRange
}

/** A token of the tree. */
export interface TreeToken extends TreeNode {
  /** The written text of the token. */
  readonly value: string
}

/** ast.md, Shared leaf nodes: a name that the author chooses. */
export interface Identifier extends TreeNode {
  readonly type: "Identifier"
  /** The texts of its tokens, joined in order. */
  readonly name: string
}

/** ast.md, Shared leaf nodes: a quoted string. */
export interface StringLiteral extends TreeNode {
  readonly type: "StringLiteral"
  /** Its content: its written text without the delimiters of the string, however they nest. */
  readonly value: string
  /** Whether the string ends with its closing quote. */
  readonly closed: boolean
}

/** ast.md, Shared leaf nodes: a number that the author writes. */
export interface NumericLiteral extends TreeNode {
  readonly type: "NumericLiteral"
  /** The number that the characters of its token write. */
  readonly value: number
}

/** A comment of the tree. */
export interface TreeComment extends TreeNode {
  /** The characters of its mark; `null` for a fragment without a mark. */
  readonly mark: string | null
}

/** A directive of the tree. */
export interface TreeDirective extends TreeNode {
  /** Whether the directive ends with `}%%`. */
  readonly closed: boolean
}

/** The frontmatter of the tree. */
export type TreeFrontmatter = TreeNode

/** The root of the tree. */
export interface TreeRoot extends TreeNode {
  readonly type: "Root"
  /** The type of the diagram, such as `flowchart`. */
  readonly diagramType: string
  /** The body of the diagram: a node of the diagram type. */
  readonly body: TreeNode
  readonly frontmatter: TreeFrontmatter | null
  readonly comments: readonly TreeComment[]
  readonly directives: readonly TreeDirective[]
  /** Every token of the source, in order. */
  readonly tokens: readonly TreeToken[]
}

/**
 * The error of a tree that cannot give a field the Db reads: the message
 * names the diagram, the node type, and what is missing.
 */
export class TreeError extends Error {
  public constructor(diagram: string, nodeType: string, message: string) {
    super(`${diagram} Db: ${nodeType}: ${message}`)
    this.name = "TreeError"
  }
}
