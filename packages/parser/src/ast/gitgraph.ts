/** The eighteen source nodes defined by ast/gitgraph.md. */
import type {
  Identifier,
  NodeBase,
  NumericLiteral,
  StringLiteral,
} from "../ast.ts"

/**
 * ast/gitgraph.md, GitgraphDiagram: written header direction and retained
 * forms in their named gaps, followed by source-ordered body items.
 *
 * ```text
 * gitGraph
 * ^^^^^^^^
 * ```
 */
export interface GitgraphDiagram extends NodeBase {
  readonly type: "GitgraphDiagram"
  readonly direction: "LR" | "TB" | "BT" | null
  readonly textBeforeHeader: readonly GitgraphIgnoredText[]
  readonly textBeforeDirection: readonly GitgraphIgnoredText[]
  readonly textBeforeColon: readonly GitgraphIgnoredText[]
  readonly body: readonly GitgraphBodyItem[]
}

/** ast/gitgraph.md, GitgraphDiagram: statements and whole hidden forms. */
export type GitgraphBodyItem =
  | GitgraphCommitStatement
  | GitgraphBranchStatement
  | GitgraphCheckoutStatement
  | GitgraphMergeStatement
  | GitgraphCherryPickStatement
  | GitgraphTitleStatement
  | GitgraphAccTitleStatement
  | GitgraphAccDescrStatement
  | GitgraphAccDescrBlockStatement
  | GitgraphIgnoredText

/**
 * ast/gitgraph.md, GitgraphCommitStatement: all options, including repeats,
 * and the hidden suffix before EOL.
 *
 * ```text
 * commit id:"A"
 * ^^^^^^^^^^^^^
 * ```
 */
export interface GitgraphCommitStatement extends NodeBase {
  readonly type: "GitgraphCommitStatement"
  readonly options: readonly GitgraphCommitOption[]
  readonly textAfter: readonly GitgraphIgnoredText[]
}

/** ast/gitgraph.md, GitgraphCommitStatement: the four commit option forms. */
export type GitgraphCommitOption =
  | GitgraphIdOption
  | GitgraphMessageOption
  | GitgraphTagOption
  | GitgraphTypeOption

/**
 * ast/gitgraph.md, GitgraphBranchStatement: a written name and optional order.
 *
 * ```text
 * branch b order:2
 * ^^^^^^^^^^^^^^^^
 * ```
 */
export interface GitgraphBranchStatement extends NodeBase {
  readonly type: "GitgraphBranchStatement"
  readonly textBeforeName: readonly GitgraphIgnoredText[]
  readonly name: Identifier | StringLiteral
  readonly order: GitgraphOrderOption | null
  readonly textAfter: readonly GitgraphIgnoredText[]
}

/**
 * ast/gitgraph.md, GitgraphCheckoutStatement: preserve the written alias.
 *
 * ```text
 * checkout main
 * ^^^^^^^^^^^^^
 * ```
 */
export interface GitgraphCheckoutStatement extends NodeBase {
  readonly type: "GitgraphCheckoutStatement"
  readonly keyword: "checkout" | "switch"
  readonly textBeforeBranch: readonly GitgraphIgnoredText[]
  readonly branch: Identifier | StringLiteral
  readonly textAfter: readonly GitgraphIgnoredText[]
}

/**
 * ast/gitgraph.md, GitgraphMergeStatement: source branch and every option.
 *
 * ```text
 * commit id:"A"
 * branch b
 * commit id:"B"
 * checkout main
 * merge b
 * ^^^^^^^
 * ```
 */
export interface GitgraphMergeStatement extends NodeBase {
  readonly type: "GitgraphMergeStatement"
  readonly textBeforeBranch: readonly GitgraphIgnoredText[]
  readonly branch: Identifier | StringLiteral
  readonly options: readonly GitgraphMergeOption[]
  readonly textAfter: readonly GitgraphIgnoredText[]
}

/** ast/gitgraph.md, GitgraphMergeStatement: no message option. */
export type GitgraphMergeOption =
  GitgraphIdOption | GitgraphTagOption | GitgraphTypeOption

/**
 * ast/gitgraph.md, GitgraphCherryPickStatement: source id, parent and tags.
 *
 * ```text
 * commit id:"A"
 * branch b
 * commit id:"B"
 * checkout main
 * cherry-pick id:"B"
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GitgraphCherryPickStatement extends NodeBase {
  readonly type: "GitgraphCherryPickStatement"
  readonly options: readonly GitgraphCherryPickOption[]
  readonly textAfter: readonly GitgraphIgnoredText[]
}

/** ast/gitgraph.md, GitgraphCherryPickStatement: all authored option occurrences. */
export type GitgraphCherryPickOption =
  GitgraphIdOption | GitgraphParentOption | GitgraphTagOption

/**
 * ast/gitgraph.md, GitgraphIdOption: retain the quoted id without conversion.
 *
 * ```text
 * commit id:"A"
 *        ^^^^^^
 * ```
 */
export interface GitgraphIdOption extends NodeBase {
  readonly type: "GitgraphIdOption"
  readonly textBefore: readonly GitgraphIgnoredText[]
  readonly textBeforeValue: readonly GitgraphIgnoredText[]
  readonly value: StringLiteral
}

/**
 * ast/gitgraph.md, GitgraphMessageOption: explicit msg or a bare string.
 *
 * ```text
 * commit msg:"M"
 *        ^^^^^^^
 * ```
 */
export interface GitgraphMessageOption extends NodeBase {
  readonly type: "GitgraphMessageOption"
  readonly textBefore: readonly GitgraphIgnoredText[]
  readonly keyword: "msg" | null
  readonly textBeforeValue: readonly GitgraphIgnoredText[]
  readonly value: StringLiteral
}

/**
 * ast/gitgraph.md, GitgraphTagOption: one tag occurrence, including an empty tag.
 *
 * ```text
 * commit tag:"T"
 *        ^^^^^^^
 * ```
 */
export interface GitgraphTagOption extends NodeBase {
  readonly type: "GitgraphTagOption"
  readonly textBefore: readonly GitgraphIgnoredText[]
  readonly textBeforeValue: readonly GitgraphIgnoredText[]
  readonly value: StringLiteral
}

/**
 * ast/gitgraph.md, GitgraphTypeOption: the written fixed word is not a child.
 *
 * ```text
 * commit type:NORMAL
 *        ^^^^^^^^^^^
 * ```
 */
export interface GitgraphTypeOption extends NodeBase {
  readonly type: "GitgraphTypeOption"
  readonly textBefore: readonly GitgraphIgnoredText[]
  readonly textBeforeValue: readonly GitgraphIgnoredText[]
  readonly value: "NORMAL" | "REVERSE" | "HIGHLIGHT"
}

/**
 * ast/gitgraph.md, GitgraphParentOption: the authored source-parent reference.
 *
 * ```text
 * commit id:"A"
 * branch b
 * commit id:"B"
 * checkout main
 * cherry-pick id:"B" parent:"A"
 *                    ^^^^^^^^^^
 * ```
 */
export interface GitgraphParentOption extends NodeBase {
  readonly type: "GitgraphParentOption"
  readonly textBefore: readonly GitgraphIgnoredText[]
  readonly textBeforeValue: readonly GitgraphIgnoredText[]
  readonly value: StringLiteral
}

/**
 * ast/gitgraph.md, GitgraphOrderOption: written digits and their shared double.
 *
 * ```text
 * branch b order:2
 *          ^^^^^^^
 * ```
 */
export interface GitgraphOrderOption extends NodeBase {
  readonly type: "GitgraphOrderOption"
  readonly textBefore: readonly GitgraphIgnoredText[]
  readonly textBeforeValue: readonly GitgraphIgnoredText[]
  readonly value: NumericLiteral
}

/**
 * ast/gitgraph.md, GitgraphTitleStatement: text after exactly one separator.
 *
 * ```text
 * title History
 * ^^^^^^^^^^^^^
 * ```
 */
export interface GitgraphTitleStatement extends NodeBase {
  readonly type: "GitgraphTitleStatement"
  readonly value: GitgraphLiteral | null
  readonly textAfter: readonly GitgraphIgnoredText[]
}

/**
 * ast/gitgraph.md, GitgraphAccTitleStatement: colon-line content with padding.
 *
 * ```text
 * accTitle: History
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GitgraphAccTitleStatement extends NodeBase {
  readonly type: "GitgraphAccTitleStatement"
  readonly value: GitgraphLiteral | null
  readonly textAfter: readonly GitgraphIgnoredText[]
}

/**
 * ast/gitgraph.md, GitgraphAccDescrStatement: empty content is null.
 *
 * ```text
 * accDescr: History
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GitgraphAccDescrStatement extends NodeBase {
  readonly type: "GitgraphAccDescrStatement"
  readonly value: GitgraphLiteral | null
  readonly textAfter: readonly GitgraphIgnoredText[]
}

/**
 * ast/gitgraph.md, GitgraphAccDescrBlockStatement: a required first closer.
 *
 * ```text
 * accDescr { History }
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface GitgraphAccDescrBlockStatement extends NodeBase {
  readonly type: "GitgraphAccDescrBlockStatement"
  readonly value: GitgraphLiteral | null
  readonly textAfter: readonly GitgraphIgnoredText[]
}

/**
 * ast/gitgraph.md, GitgraphLiteral: written text without common trivia.
 *
 * ```text
 * title History
 *       ^^^^^^^
 * ```
 */
export interface GitgraphLiteral extends NodeBase {
  readonly type: "GitgraphLiteral"
  readonly value: string
}

/**
 * ast/gitgraph.md, GitgraphIgnoredText: a whole hidden form, without its
 * optional leading padding or consumed following LF.
 *
 * ```text
 * commit %%{}%%
 *        ^^^^^^
 * ```
 */
export interface GitgraphIgnoredText extends NodeBase {
  readonly type: "GitgraphIgnoredText"
  readonly kind: "yaml-block" | "directive"
  readonly value: string
}

/** Every node type of the gitgraph tree. */
export type GitgraphNode =
  | GitgraphDiagram
  | GitgraphBodyItem
  | GitgraphCommitOption
  | GitgraphCherryPickOption
  | GitgraphOrderOption
  | GitgraphLiteral
