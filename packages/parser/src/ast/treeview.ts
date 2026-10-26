import type { Identifier, NodeBase, StringLiteral } from "../ast.ts"

/**
 * ast/treeview.md, TreeviewDiagram: the header and flat authored body.
 * Fixture: treeview/header-only.
 *
 * ```text
 * treeView-beta
 * ^^^^^^^^^^^^^
 * ```
 */
export interface TreeviewDiagram extends NodeBase {
  readonly type: "TreeviewDiagram"
  readonly body: readonly TreeviewBodyItem[]
}

/** ast/treeview.md, TreeviewDiagram: common statements, nodes and outer decorations. */
export type TreeviewBodyItem =
  | TreeviewNode
  | TreeviewIgnoredText
  | TreeviewTitleStatement
  | TreeviewAccTitleStatement
  | TreeviewAccDescrStatement
  | TreeviewAccDescrBlockStatement

/**
 * ast/treeview.md, TreeviewNode: one assigned indentation and an authored name.
 * Fixture: treeview/annotation-class-digit.
 *
 * ```text
 * node :::a1
 * ^^^^^^^^^^
 * ```
 */
export interface TreeviewNode extends NodeBase {
  readonly type: "TreeviewNode"
  readonly indent: number
  readonly prefix: TreeviewBranchPrefix | null
  readonly textBeforeName: readonly TreeviewIgnoredText[]
  readonly name: TreeviewIdentifier | StringLiteral
  readonly annotations: readonly TreeviewAnnotation[]
}

/** ast/treeview.md, TreeviewNode: all annotation occurrences in written order. */
export type TreeviewAnnotation =
  | TreeviewClassAnnotation
  | TreeviewIconAnnotation
  | TreeviewDescriptionAnnotation

/**
 * ast/treeview.md, TreeviewClassAnnotation: the marker and complete class name.
 * Fixture: treeview/annotation-class-digit.
 *
 * ```text
 * node :::a1
 *      ^^^^^
 * ```
 */
export interface TreeviewClassAnnotation extends NodeBase {
  readonly type: "TreeviewClassAnnotation"
  readonly textBefore: readonly TreeviewIgnoredText[]
  readonly prefix: TreeviewBranchPrefix | null
  readonly name: Identifier
}

/**
 * ast/treeview.md, TreeviewIconAnnotation: an optional whole icon reference.
 * Fixture: treeview/annotation-icon-leading-colon.
 *
 * ```text
 * node icon(:file)
 *      ^^^^^^^^^^^
 * ```
 */
export interface TreeviewIconAnnotation extends NodeBase {
  readonly type: "TreeviewIconAnnotation"
  readonly textBefore: readonly TreeviewIgnoredText[]
  readonly prefix: TreeviewBranchPrefix | null
  readonly name: Identifier | null
}

/**
 * ast/treeview.md, TreeviewDescriptionAnnotation: possibly empty line text.
 * Fixture: treeview/spec-parser-ab2c8458.
 *
 * ```text
 * file.txt ##
 *          ^^
 * ```
 */
export interface TreeviewDescriptionAnnotation extends NodeBase {
  readonly type: "TreeviewDescriptionAnnotation"
  readonly textBefore: readonly TreeviewIgnoredText[]
  readonly prefix: TreeviewBranchPrefix | null
  readonly value: TreeviewLiteral | null
}

/**
 * ast/treeview.md, TreeviewTitleStatement: payload after exactly one separator.
 * Fixture: treeview/gram-written-tree.
 *
 * ```text
 * title  Tree
 * ^^^^^^^^^^^
 * ```
 */
export interface TreeviewTitleStatement extends NodeBase {
  readonly type: "TreeviewTitleStatement"
  readonly prefix: TreeviewBranchPrefix | null
  readonly value: TreeviewLiteral | null
}

/**
 * ast/treeview.md, TreeviewAccTitleStatement: complete authored colon payload.
 * Fixture: treeview/gram-written-tree.
 *
 * ```text
 * accTitle:  Access
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface TreeviewAccTitleStatement extends NodeBase {
  readonly type: "TreeviewAccTitleStatement"
  readonly prefix: TreeviewBranchPrefix | null
  readonly value: TreeviewLiteral | null
}

/**
 * ast/treeview.md, TreeviewAccDescrStatement: complete authored colon payload.
 * Fixture: treeview/gram-written-tree.
 *
 * ```text
 * accDescr: Line
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface TreeviewAccDescrStatement extends NodeBase {
  readonly type: "TreeviewAccDescrStatement"
  readonly prefix: TreeviewBranchPrefix | null
  readonly value: TreeviewLiteral | null
}

/**
 * ast/treeview.md, TreeviewAccDescrBlockStatement: first effective closing brace.
 * Fixture: treeview/gram-written-tree.
 *
 * ```text
 * accDescr {  Block
 * ^^^^^^^^^^^^^^^^^
 *   text  }
 * ^^^^^^^^^
 * ```
 */
export interface TreeviewAccDescrBlockStatement extends NodeBase {
  readonly type: "TreeviewAccDescrBlockStatement"
  readonly prefix: TreeviewBranchPrefix | null
  readonly textBeforeOpen: readonly (
    TreeviewBranchPrefix | TreeviewIgnoredText
  )[]
  readonly value: TreeviewLiteral | null
}

/**
 * ast/treeview.md, TreeviewIdentifier: a bare name, including owned whitespace.
 * Fixture: treeview/ast-numeric-name.
 *
 * ```text
 * 123
 * ^^^
 * ```
 */
export interface TreeviewIdentifier extends NodeBase {
  readonly type: "TreeviewIdentifier"
  readonly name: string
}

/**
 * ast/treeview.md, TreeviewLiteral: authored common/description text, untrimmed.
 * Fixture: treeview/gram-written-tree.
 *
 * ```text
 * accDescr: Line
 *          ^^^^^
 * ```
 */
export interface TreeviewLiteral extends NodeBase {
  readonly type: "TreeviewLiteral"
  readonly value: string
}

/**
 * ast/treeview.md, TreeviewBranchPrefix: written prefix without separator spaces.
 * Fixture: treeview/box-written-tree. Escapes display the authored box characters.
 *
 * ```text
 * treeView-beta
 * root/
 * \u251c\u2500\u2500 src/ :::high icon(folder) ## entry
 * ^^^^^^^^^^^^^^^^^^
 * \u2502
 * \u2502   \u2514\u2500\u2500 "my file"
 * \u2514\u2500\u2500 other
 * ```
 */
export interface TreeviewBranchPrefix extends NodeBase {
  readonly type: "TreeviewBranchPrefix"
  readonly value: string
  readonly marker: string
}

/**
 * ast/treeview.md, TreeviewIgnoredText: an outer box decoration in its named gap.
 * Fixture: treeview/box-written-tree. Escapes display the authored box characters.
 *
 * ```text
 * treeView-beta
 * root/
 * \u251c\u2500\u2500 src/ :::high icon(folder) ## entry
 * \u2502
 * ^^^^^^
 * \u2502   \u2514\u2500\u2500 "my file"
 * \u2514\u2500\u2500 other
 * ```
 */
export interface TreeviewIgnoredText extends NodeBase {
  readonly type: "TreeviewIgnoredText"
  readonly kind: "box-decoration"
  readonly value: string
}

/** All thirteen source node types defined by ast/treeview.md. */
export type TreeviewTreeNode =
  | TreeviewDiagram
  | TreeviewBodyItem
  | TreeviewAnnotation
  | TreeviewIdentifier
  | TreeviewLiteral
  | TreeviewBranchPrefix
