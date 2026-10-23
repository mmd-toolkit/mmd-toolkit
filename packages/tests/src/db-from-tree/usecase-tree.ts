import type { Identifier, StringLiteral, TreeNode } from "./tree.ts"

/** ast/usecase.md: written statements, with no resolved or synthesized children. */
export interface UsecaseDiagram extends TreeNode {
  readonly type: "UsecaseDiagram"
  readonly body: readonly UsecaseStatement[]
}

export type UsecaseStatement =
  | UsecaseActorStatement
  | UsecaseEntityStatement
  | UsecaseSystemBoundaryStatement
  | UsecaseRelationshipStatement
  | UsecaseMetadataAssignmentStatement
  | UsecaseNoteStatement
  | UsecaseJsonStatement
  | UsecaseDirectionStatement
  | UsecaseClassDefStatement
  | UsecaseClassStatement
  | UsecaseStyleStatement
  | UsecaseAccessibilityStatement

/** ast/usecase.md: the actor-list alternative, excluding an actor-keyword relationship. */
export interface UsecaseActorStatement extends TreeNode {
  readonly type: "UsecaseActorStatement"
  readonly actors: readonly UsecaseActor[]
}

/** ast/usecase.md: one written actor item; its keyword belongs to its statement. */
export interface UsecaseActor extends TreeNode {
  readonly type: "UsecaseActor"
  readonly id: Identifier | null
  readonly label: UsecaseLabel | null
  readonly metadata: UsecaseMetadata | null
  readonly stereotype: UsecaseLiteral | null
  readonly classes: readonly Identifier[]
}

/** ast/usecase.md: a standalone declaration, also within a boundary. */
export interface UsecaseEntityStatement extends TreeNode {
  readonly type: "UsecaseEntityStatement"
  readonly entity: UsecaseEntity
}

/** ast/usecase.md: an occurrence whose parent and fields decide declaration versus reference. */
export interface UsecaseEntity extends TreeNode {
  readonly type: "UsecaseEntity"
  readonly id: Identifier | null
  readonly shape: "ellipse" | "rectangle" | null
  readonly label: UsecaseLabel | null
  readonly metadata: UsecaseMetadata | null
  readonly stereotype: UsecaseLiteral | null
  readonly classes: readonly Identifier[]
}

/** ast/usecase.md: a one-level boundary, closed by its written end keyword. */
export interface UsecaseSystemBoundaryStatement extends TreeNode {
  readonly type: "UsecaseSystemBoundaryStatement"
  readonly id: Identifier | null
  readonly title: UsecaseLabel | null
  readonly metadata: UsecaseMetadata | null
  readonly classes: readonly Identifier[]
  readonly body: readonly (UsecaseActorStatement | UsecaseEntityStatement)[]
}

/** ast/usecase.md: endpoints stay in written order even with a backward marker. */
export interface UsecaseRelationshipStatement extends TreeNode {
  readonly type: "UsecaseRelationshipStatement"
  readonly source: UsecaseActor | UsecaseEntity
  readonly id: Identifier | null
  readonly kind: "association" | "include" | "extend" | "generalization"
  readonly opening: UsecaseOpeningArrow | null
  readonly label: UsecaseLabel | null
  readonly arrow: UsecaseArrow
  readonly target: UsecaseEntity
}

/** ast/usecase.md: one complete opening operator, with exactly two dashes. */
export interface UsecaseOpeningArrow extends TreeNode {
  readonly type: "UsecaseOpeningArrow"
  readonly value: string
  readonly startMarker: "none" | "arrow" | "circle" | "cross"
  readonly line: "solid"
  readonly length: number
}

/** ast/usecase.md: the sole or final operator, before any Db length normalization. */
export interface UsecaseArrow extends TreeNode {
  readonly type: "UsecaseArrow"
  readonly value: string
  readonly startMarker: "none" | "arrow" | "circle" | "cross"
  readonly endMarker: "none" | "arrow" | "circle" | "cross" | "triangle"
  readonly line: "solid" | "dotted"
  readonly length: number
}

/** ast/usecase.md: the written content, excluding any enclosing quote delimiters. */
export interface UsecaseLabel extends TreeNode {
  readonly type: "UsecaseLabel"
  readonly kind: "text" | "string" | "markdown"
  readonly value: string
}

/** ast/usecase.md: stereotype, CSS value, or complete accessibility interior. */
export interface UsecaseLiteral extends TreeNode {
  readonly type: "UsecaseLiteral"
  readonly value: string
}

/** ast/usecase.md: native syntax, never an opaque block. */
export interface UsecaseMetadata extends TreeNode {
  readonly type: "UsecaseMetadata"
  readonly properties: readonly UsecaseMetadataProperty[]
}

/** ast/usecase.md: bare boolean words remain Identifier children. */
export interface UsecaseMetadataProperty extends TreeNode {
  readonly type: "UsecaseMetadataProperty"
  readonly key: Identifier | StringLiteral
  readonly value: Identifier | StringLiteral
}

/** ast/usecase.md: a native update that cannot create its target. */
export interface UsecaseMetadataAssignmentStatement extends TreeNode {
  readonly type: "UsecaseMetadataAssignmentStatement"
  readonly target: Identifier | UsecaseLabel
  readonly metadata: UsecaseMetadata
}

/** ast/usecase.md: no generated note id or connector child. */
export interface UsecaseNoteStatement extends TreeNode {
  readonly type: "UsecaseNoteStatement"
  readonly target: Identifier
  readonly label: UsecaseLabel
}

/** ast/usecase.md: the id is a raw ASCII word, including keyword-shaped words. */
export interface UsecaseJsonStatement extends TreeNode {
  readonly type: "UsecaseJsonStatement"
  readonly id: Identifier
  readonly data: UsecaseJsonDataBlock
  readonly classes: readonly Identifier[]
}

/** ast/usecase.md: the complete balanced object interior, without JSON interpretation. */
export interface UsecaseJsonDataBlock extends TreeNode {
  readonly type: "UsecaseJsonDataBlock"
  readonly value: string
}

/** ast/usecase.md: TD is retained here and normalized only in the Db. */
export interface UsecaseDirectionStatement extends TreeNode {
  readonly type: "UsecaseDirectionStatement"
  readonly direction: "TD" | "TB" | "BT" | "LR" | "RL"
}

/** ast/usecase.md: repeated definitions remain distinct written statements. */
export interface UsecaseClassDefStatement extends TreeNode {
  readonly type: "UsecaseClassDefStatement"
  readonly classes: readonly Identifier[]
  readonly styles: readonly UsecaseStyleDeclaration[]
}

/** ast/usecase.md: the two nonempty lists meet at a whitespace grammar boundary. */
export interface UsecaseClassStatement extends TreeNode {
  readonly type: "UsecaseClassStatement"
  readonly targets: readonly Identifier[]
  readonly classes: readonly Identifier[]
}

/** ast/usecase.md: direct styles stay separate from class definitions. */
export interface UsecaseStyleStatement extends TreeNode {
  readonly type: "UsecaseStyleStatement"
  readonly target: Identifier
  readonly styles: readonly UsecaseStyleDeclaration[]
}

/** ast/usecase.md: preserve padding after the colon and quoted CSS components. */
export interface UsecaseStyleDeclaration extends TreeNode {
  readonly type: "UsecaseStyleDeclaration"
  readonly name: UsecaseIdentifier
  readonly value: UsecaseLiteral
}

/** ast/usecase.md: a CSS property name may include HWS after its dash prefix. */
export interface UsecaseIdentifier extends TreeNode {
  readonly type: "UsecaseIdentifier"
  readonly name: string
}

/** ast/usecase.md: null is exactly empty content; whitespace is a Literal. */
export interface UsecaseAccessibilityStatement extends TreeNode {
  readonly type:
    | "UsecaseAccTitleStatement"
    | "UsecaseAccDescrStatement"
    | "UsecaseAccDescrBlockStatement"
  readonly value: UsecaseLiteral | null
}
