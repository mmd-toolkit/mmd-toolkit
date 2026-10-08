/**
 * The nodes of an ER tree that the Db reads: the fields of
 * `packages/spec/docs/ast/er.md` that `er.ts` uses, and no others.
 */
import type { Identifier, StringLiteral, TreeNode } from "./tree.ts"

/** ast/er.md: ErDiagram. */
export interface ErDiagram extends TreeNode {
  readonly type: "ErDiagram"
  readonly body: readonly ErStatement[]
}

/** ast/er.md: ErStatement. */
export type ErStatement =
  | ErEntityStatement
  | ErRelationshipStatement
  | ErSubgraphStatement
  | ErDirectionStatement
  | ErClassDefStatement
  | ErClassStatement
  | ErStyleStatement
  | ErAccTitleStatement
  | ErAccDescrStatement
  | ErAccDescrBlockStatement

/** ast/er.md: the name of an entity or of a subgraph. */
export type ErName = ErIdentifier | StringLiteral

/** ast/er.md: ErEntityStatement. */
export interface ErEntityStatement extends TreeNode {
  readonly type: "ErEntityStatement"
  readonly name: ErName
  readonly alias: ErName | null
  readonly cssClasses: readonly ErIdentifier[]
  readonly attributes: readonly (ErAttribute | ErIgnoredText)[] | null
}

/** ast/er.md: ErAttribute. */
export interface ErAttribute extends TreeNode {
  readonly type: "ErAttribute"
  readonly dataType: ErName
  readonly optional: boolean
  readonly name: ErName
  readonly keys: readonly Identifier[]
  readonly comment: StringLiteral | null
}

/** ast/er.md: ErRelationshipStatement. */
export interface ErRelationshipStatement extends TreeNode {
  readonly type: "ErRelationshipStatement"
  readonly left: ErEntityReference
  readonly relationship: ErRelationship
  readonly right: ErEntityReference
  readonly role: ErName
}

/** ast/er.md: ErEntityReference. */
export interface ErEntityReference extends TreeNode {
  readonly type: "ErEntityReference"
  readonly name: ErName
  readonly cssClasses: readonly ErIdentifier[]
}

/** ast/er.md: the words of a cardinality. */
export type ErCardinality =
  "zero-or-one" | "zero-or-more" | "one-or-more" | "only-one" | "md-parent"

/** ast/er.md: the words of a line. */
export type ErLine = "identifying" | "non-identifying"

/** ast/er.md: ErRelationship. */
export interface ErRelationship extends TreeNode {
  readonly type: "ErRelationship"
  readonly leftCardinality: ErCardinality
  readonly line: ErLine
  readonly rightCardinality: ErCardinality
}

/** ast/er.md: ErSubgraphStatement. */
export interface ErSubgraphStatement extends TreeNode {
  readonly type: "ErSubgraphStatement"
  readonly id: ErName
  readonly title: readonly ErName[] | null
  readonly body: readonly ErStatement[]
}

/** ast/er.md: the values of a direction. */
export type ErDirection = "TB" | "BT" | "RL" | "LR"

/** ast/er.md: ErDirectionStatement. */
export interface ErDirectionStatement extends TreeNode {
  readonly type: "ErDirectionStatement"
  readonly direction: ErDirection
}

/** ast/er.md: ErClassDefStatement. */
export interface ErClassDefStatement extends TreeNode {
  readonly type: "ErClassDefStatement"
  readonly cssClasses: readonly ErIdentifier[]
  readonly styles: readonly ErLiteral[]
}

/** ast/er.md: ErClassStatement. */
export interface ErClassStatement extends TreeNode {
  readonly type: "ErClassStatement"
  readonly entities: readonly ErIdentifier[]
  readonly cssClasses: readonly ErIdentifier[]
}

/** ast/er.md: ErStyleStatement. */
export interface ErStyleStatement extends TreeNode {
  readonly type: "ErStyleStatement"
  readonly entities: readonly ErIdentifier[]
  readonly styles: readonly ErLiteral[]
}

/** ast/er.md: ErAccTitleStatement. */
export interface ErAccTitleStatement extends TreeNode {
  readonly type: "ErAccTitleStatement"
  readonly value: ErLiteral
}

/** ast/er.md: ErAccDescrStatement. */
export interface ErAccDescrStatement extends TreeNode {
  readonly type: "ErAccDescrStatement"
  readonly value: ErLiteral
}

/** ast/er.md: ErAccDescrBlockStatement. */
export interface ErAccDescrBlockStatement extends TreeNode {
  readonly type: "ErAccDescrBlockStatement"
  readonly value: ErLiteral | null
}

/** ast/er.md: ErIdentifier. */
export interface ErIdentifier extends TreeNode {
  readonly type: "ErIdentifier"
}

/** ast/er.md: ErLiteral. */
export interface ErLiteral extends TreeNode {
  readonly type: "ErLiteral"
}

/** ast/er.md: ErIgnoredText. */
export interface ErIgnoredText extends TreeNode {
  readonly type: "ErIgnoredText"
}
