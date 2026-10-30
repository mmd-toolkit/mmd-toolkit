import type {
  Identifier,
  NodeBase,
  NumericLiteral,
  StringLiteral,
} from "../ast.ts"

/**
 * ast/treemap.md, TreemapDiagram: roots and independent outer statements.
 *
 * ```text
 * treemap
 * ^^^^^^^
 * "Root"
 * ^^^^^^
 * ```
 */
export interface TreemapDiagram extends NodeBase {
  readonly type: "TreemapDiagram"
  readonly body: readonly TreemapBodyItem[]
}

/** ast/treemap.md, TreemapDiagram: roots and independent outer statements. */
export type TreemapBodyItem =
  | TreemapSection
  | TreemapLeaf
  | TreemapClassDefStatement
  | TreemapTitleStatement
  | TreemapAccTitleStatement
  | TreemapAccDescrStatement
  | TreemapAccDescrBlockStatement

/**
 * ast/treemap.md, TreemapSection: a quoted name and optional class selector.
 * Its range starts at statementsBefore when present and ends at its last descendant.
 * Indentation retains its assigned source space/tab count.
 *
 * ```text
 * "A"
 * ^^^
 *     "B"
 * ^^^^^^^
 *       "C":1
 * ^^^^^^^^^^^
 *   "D":2
 * ^^^^^^^
 * "E":3
 * ```
 */
export interface TreemapSection extends NodeBase {
  readonly type: "TreemapSection"
  readonly indent: number
  readonly statementsBefore: readonly (
    | TreemapClassDefStatement
    | TreemapTitleStatement
    | TreemapAccTitleStatement
    | TreemapAccDescrStatement
    | TreemapAccDescrBlockStatement
  )[]
  readonly name: StringLiteral
  readonly classSelector: Identifier | null
  readonly children: readonly (TreemapSection | TreemapLeaf)[]
}

/**
 * ast/treemap.md, TreemapLeaf: a quoted name, number and optional selector.
 * Its range starts at statementsBefore when present; a leaf cannot have children.
 *
 * ```text
 * "A"
 * accTitle: Map
 * ^^^^^^^^^^^^^
 *   "B":1
 * ^^^^^^^
 * ```
 */
export interface TreemapLeaf extends NodeBase {
  readonly type: "TreemapLeaf"
  readonly indent: number
  readonly statementsBefore: readonly (
    | TreemapClassDefStatement
    | TreemapTitleStatement
    | TreemapAccTitleStatement
    | TreemapAccDescrStatement
    | TreemapAccDescrBlockStatement
  )[]
  readonly name: StringLiteral
  readonly value: NumericLiteral
  readonly classSelector: Identifier | null
}

/**
 * ast/treemap.md, TreemapClassDefStatement: a name and whole authored style.
 * The range includes a written terminating semicolon but excludes indentation.
 *
 * ```text
 *   classDef aa fill:red,color:blue;
 *   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface TreemapClassDefStatement extends NodeBase {
  readonly type: "TreemapClassDefStatement"
  readonly indent: number
  readonly name: Identifier
  readonly style: TreemapLiteral | null
}

/**
 * ast/treemap.md, TreemapTitleStatement: text after exactly one ASCII separator.
 *
 * ```text
 * title Map
 * ^^^^^^^^^
 * ```
 */
export interface TreemapTitleStatement extends NodeBase {
  readonly type: "TreemapTitleStatement"
  readonly value: TreemapLiteral | null
}

/**
 * ast/treemap.md, TreemapAccTitleStatement: line text after the colon.
 *
 * ```text
 * accTitle: Map
 * ^^^^^^^^^^^^^
 * ```
 */
export interface TreemapAccTitleStatement extends NodeBase {
  readonly type: "TreemapAccTitleStatement"
  readonly value: TreemapLiteral | null
}

/**
 * ast/treemap.md, TreemapAccDescrStatement: line text after the colon.
 *
 * ```text
 * accDescr: Short
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface TreemapAccDescrStatement extends NodeBase {
  readonly type: "TreemapAccDescrStatement"
  readonly value: TreemapLiteral | null
}

/**
 * ast/treemap.md, TreemapAccDescrBlockStatement: a required first closing brace.
 * Empty blocks remain statements, with a null value.
 *
 * ```text
 * accDescr { Details }
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface TreemapAccDescrBlockStatement extends NodeBase {
  readonly type: "TreemapAccDescrBlockStatement"
  readonly value: TreemapLiteral | null
}

/**
 * ast/treemap.md, TreemapLiteral: authored common value or complete class style.
 * Line/style padding stays; block interiors trim only outer common whitespace.
 *
 * ```text
 * title Map
 *       ^^^
 * ```
 */
export interface TreemapLiteral extends NodeBase {
  readonly type: "TreemapLiteral"
  readonly value: string
}

/** All nine source node types of ast/treemap.md. */
export type TreemapNode = TreemapDiagram | TreemapBodyItem | TreemapLiteral
