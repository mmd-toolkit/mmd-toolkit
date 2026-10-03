/**
 * The nodes of a class tree that the Db reads: the fields of
 * `packages/spec/docs/ast/class.md` that `class.ts` uses, and no others.
 */
import type { Identifier, StringLiteral, TreeNode } from "./tree.ts"

/** ast/class.md: ClassDiagram. */
export interface ClassDiagram extends TreeNode {
  readonly type: "ClassDiagram"
  readonly body: readonly ClassStatement[]
}

/** ast/class.md: ClassStatement. */
export type ClassStatement =
  | ClassDeclaration
  | ClassMemberStatement
  | ClassNameStatement
  | ClassAnnotationStatement
  | ClassRelationStatement
  | ClassNamespaceStatement
  | ClassNoteStatement
  | ClassCallbackStatement
  | ClassLinkStatement
  | ClassStyleStatement
  | ClassCssClassStatement
  | ClassClassDefStatement
  | ClassDirectionStatement
  | ClassAccTitleStatement
  | ClassAccDescrStatement
  | ClassAccDescrBlockStatement

/** ast/class.md: ClassMember. */
export type ClassMember = ClassMethod | ClassAttribute | ClassAnnotation

/** ast/class.md: ClassDeclaration. */
export interface ClassDeclaration extends TreeNode {
  readonly type: "ClassDeclaration"
  readonly name: ClassName
  readonly label: StringLiteral | null
  readonly cssClass: Identifier | null
  readonly annotation: ClassAnnotation | null
  readonly members: readonly ClassMember[] | null
}

/** ast/class.md: ClassMemberStatement. */
export interface ClassMemberStatement extends TreeNode {
  readonly type: "ClassMemberStatement"
  readonly class: ClassName
  readonly member: ClassMember | null
}

/** ast/class.md: ClassNameStatement. */
export interface ClassNameStatement extends TreeNode {
  readonly type: "ClassNameStatement"
  readonly name: ClassName
}

/** ast/class.md: ClassAnnotationStatement. */
export interface ClassAnnotationStatement extends TreeNode {
  readonly type: "ClassAnnotationStatement"
  readonly annotation: ClassAnnotation
  readonly class: ClassName
}

/** ast/class.md: ClassRelationStatement. */
export interface ClassRelationStatement extends TreeNode {
  readonly type: "ClassRelationStatement"
  readonly from: ClassName
  readonly fromCardinality: StringLiteral | null
  readonly arrow: ClassArrow
  readonly toCardinality: StringLiteral | null
  readonly to: ClassName
  readonly label: ClassLiteral | null
}

/** ast/class.md: ClassArrowMarker. */
export type ClassArrowMarker =
  | "none"
  | "triangle"
  | "filled-diamond"
  | "hollow-diamond"
  | "arrow"
  | "lollipop"

/** ast/class.md: ClassArrowLine. */
export type ClassArrowLine = "solid" | "dotted"

/** ast/class.md: ClassArrow. */
export interface ClassArrow extends TreeNode {
  readonly type: "ClassArrow"
  readonly value: string
  readonly startMarker: ClassArrowMarker
  readonly line: ClassArrowLine
  readonly endMarker: ClassArrowMarker
}

/** ast/class.md: ClassIdentifier. */
export interface ClassIdentifier extends TreeNode {
  readonly type: "ClassIdentifier"
  /** The written texts of its units, joined in order. */
  readonly name: string
}

/** ast/class.md: ClassNamespaceStatement. */
export interface ClassNamespaceStatement extends TreeNode {
  readonly type: "ClassNamespaceStatement"
  readonly prefix: ClassIdentifier | null
  readonly name: ClassIdentifier | StringLiteral
  readonly label: StringLiteral | null
  readonly body: readonly (
    ClassDeclaration | ClassNoteStatement | ClassNamespaceStatement
  )[]
}

/** ast/class.md: ClassNoteStatement. */
export interface ClassNoteStatement extends TreeNode {
  readonly type: "ClassNoteStatement"
  readonly class: ClassName | null
  readonly text: StringLiteral
}

/** ast/class.md: ClassCallbackStatement. */
export interface ClassCallbackStatement extends TreeNode {
  readonly type: "ClassCallbackStatement"
  readonly class: ClassName
  readonly tooltip: StringLiteral | null
}

/** ast/class.md: ClassLinkTarget. */
export type ClassLinkTarget = "_self" | "_blank" | "_parent" | "_top"

/** ast/class.md: ClassLinkStatement. */
export interface ClassLinkStatement extends TreeNode {
  readonly type: "ClassLinkStatement"
  readonly class: ClassName
  readonly url: StringLiteral
  readonly tooltip: StringLiteral | null
  readonly target: ClassLinkTarget | null
}

/** ast/class.md: ClassStyleStatement. */
export interface ClassStyleStatement extends TreeNode {
  readonly type: "ClassStyleStatement"
  readonly id: Identifier
  readonly styles: readonly ClassLiteral[]
}

/** ast/class.md: ClassCssClassStatement. */
export interface ClassCssClassStatement extends TreeNode {
  readonly type: "ClassCssClassStatement"
  readonly idList: StringLiteral
  readonly cssClass: Identifier
}

/** ast/class.md: ClassClassDefStatement. */
export interface ClassClassDefStatement extends TreeNode {
  readonly type: "ClassClassDefStatement"
  readonly cssClasses: readonly Identifier[]
  readonly styles: readonly ClassLiteral[]
}

/** ast/class.md: ClassDirection. */
export type ClassDirection = "TB" | "BT" | "RL" | "LR"

/** ast/class.md: ClassDirectionStatement. */
export interface ClassDirectionStatement extends TreeNode {
  readonly type: "ClassDirectionStatement"
  readonly direction: ClassDirection
}

/** ast/class.md: ClassAccTitleStatement. */
export interface ClassAccTitleStatement extends TreeNode {
  readonly type: "ClassAccTitleStatement"
  readonly value: ClassLiteral
}

/** ast/class.md: ClassAccDescrStatement. */
export interface ClassAccDescrStatement extends TreeNode {
  readonly type: "ClassAccDescrStatement"
  readonly value: ClassLiteral
}

/** ast/class.md: ClassAccDescrBlockStatement. */
export interface ClassAccDescrBlockStatement extends TreeNode {
  readonly type: "ClassAccDescrBlockStatement"
  readonly value: ClassLiteral | null
}

/** ast/class.md: ClassName. */
export interface ClassName extends TreeNode {
  readonly type: "ClassName"
  readonly prefix: ClassIdentifier | null
  readonly name: ClassIdentifier | StringLiteral
  readonly generic: ClassLiteral | null
}

/** ast/class.md: ClassVisibility. */
export type ClassVisibility =
  "none" | "public" | "private" | "protected" | "package"

/** ast/class.md: ClassClassifier. */
export type ClassClassifier = "none" | "static" | "abstract"

/** ast/class.md: ClassMethod. */
export interface ClassMethod extends TreeNode {
  readonly type: "ClassMethod"
  readonly visibility: ClassVisibility
  readonly name: ClassLiteral | null
  readonly parameters: ClassLiteral | null
  readonly returnType: ClassLiteral | null
  readonly classifier: ClassClassifier
}

/** ast/class.md: ClassAttribute. */
export interface ClassAttribute extends TreeNode {
  readonly type: "ClassAttribute"
  readonly visibility: ClassVisibility
  readonly name: ClassLiteral | null
  readonly classifier: ClassClassifier
}

/** ast/class.md: ClassAnnotation. */
export interface ClassAnnotation extends TreeNode {
  readonly type: "ClassAnnotation"
  readonly name: Identifier | ClassLiteral | null
}

/** ast/class.md: ClassLiteral. */
export interface ClassLiteral extends TreeNode {
  readonly type: "ClassLiteral"
  readonly value: string
}

/** ast/class.md: ClassIgnoredText. */
export interface ClassIgnoredText extends TreeNode {
  readonly type: "ClassIgnoredText"
  readonly value: string
}
