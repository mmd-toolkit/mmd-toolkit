/** The source occurrences defined in ast/usecase.md; values retain written text. */
import type { Identifier, NodeBase, StringLiteral } from "../ast.ts"

/**
 * ast/usecase.md, UsecaseDiagram: child fields `body`.
 *
 * ```text
 * usecase-beta
 * ^^^^^^^^^^^^
 * ```
 */
export interface UsecaseDiagram extends NodeBase {
  readonly type: "UsecaseDiagram"
  /** Written top-level statements. */
  readonly body: readonly UsecaseStatement[]
}

/**
 * ast/usecase.md, UsecaseActorStatement: child fields `actors`.
 *
 * ```text
 * actor A
 * ^^^^^^^
 * ```
 */
export interface UsecaseActorStatement extends NodeBase {
  readonly type: "UsecaseActorStatement"
  /** Nonempty actor list after the actor keyword. */
  readonly actors: readonly UsecaseActor[]
}

/**
 * ast/usecase.md, UsecaseActor: child fields `id`, `label`, `metadata`, `stereotype`, `classes`.
 *
 * ```text
 * actor A
 *       ^
 * ```
 */
export interface UsecaseActor extends NodeBase {
  readonly type: "UsecaseActor"
  /** Explicit id, absent for a quoted-only name. */
  readonly id: Identifier | null
  /** Quoted name or explicit parenthesis label. */
  readonly label: UsecaseLabel | null
  /** Written native metadata. */
  readonly metadata: UsecaseMetadata | null
  /** Complete written stereotype interior. */
  readonly stereotype: UsecaseLiteral | null
  /** Written class suffix names. */
  readonly classes: readonly Identifier[]
}

/**
 * ast/usecase.md, UsecaseEntityStatement: child fields `entity`.
 *
 * ```text
 * A(Alpha)
 * ^^^^^^^^
 * ```
 */
export interface UsecaseEntityStatement extends NodeBase {
  readonly type: "UsecaseEntityStatement"
  /** The written standalone declaration. */
  readonly entity: UsecaseEntity
}

/**
 * ast/usecase.md, UsecaseEntity: child fields `id`, `label`, `metadata`, `stereotype`, `classes`.
 *
 * ```text
 * A(Alpha)
 * ^^^^^^^^
 * ```
 */
export interface UsecaseEntity extends NodeBase {
  readonly type: "UsecaseEntity"
  /** Explicit id, absent for a quoted-only name. */
  readonly id: Identifier | null
  /** Written shape, absent for bare and quoted-only names. */
  readonly shape: "ellipse" | "rectangle" | null
  /** Explicit shape label or quoted-only name. */
  readonly label: UsecaseLabel | null
  /** Written native metadata. */
  readonly metadata: UsecaseMetadata | null
  /** Written stereotype interior. */
  readonly stereotype: UsecaseLiteral | null
  /** Written class suffix names. */
  readonly classes: readonly Identifier[]
}

/**
 * ast/usecase.md, UsecaseSystemBoundaryStatement: child fields `id`, `title`, `metadata`, `classes`, `body`.
 *
 * ```text
 * systemBoundary S
 * ^^^^^^^^^^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface UsecaseSystemBoundaryStatement extends NodeBase {
  readonly type: "UsecaseSystemBoundaryStatement"
  /** Explicit boundary id. */
  readonly id: Identifier | null
  /** Quoted-only name or explicit display title. */
  readonly title: UsecaseLabel | null
  /** Written native boundary metadata. */
  readonly metadata: UsecaseMetadata | null
  /** Written class suffix names. */
  readonly classes: readonly Identifier[]
  /** Written boundary declarations. */
  readonly body: readonly (UsecaseActorStatement | UsecaseEntityStatement)[]
}

/**
 * ast/usecase.md, UsecaseRelationshipStatement: child fields `source`, `id`, `opening`, `label`, `arrow`, `target`.
 *
 * ```text
 * A --> B
 * ^^^^^^^
 * ```
 */
export interface UsecaseRelationshipStatement extends NodeBase {
  readonly type: "UsecaseRelationshipStatement"
  /** Written left occurrence; never swapped with the target. */
  readonly source: UsecaseActor | UsecaseEntity
  /** Explicit edge id before @. */
  readonly id: Identifier | null
  /** Written relationship kind. */
  readonly kind: "association" | "include" | "extend" | "generalization"
  /** Opening half of a labeled association. */
  readonly opening: UsecaseOpeningArrow | null
  /** Authored association label. */
  readonly label: UsecaseLabel | null
  /** Sole arrow or final half after the label. */
  readonly arrow: UsecaseArrow
  /** Written right occurrence. */
  readonly target: UsecaseEntity
}

/**
 * ast/usecase.md, UsecaseOpeningArrow: no child fields.
 *
 * ```text
 * A -- label --> B
 *   ^^
 * ```
 */
export interface UsecaseOpeningArrow extends NodeBase {
  readonly type: "UsecaseOpeningArrow"
  /** Written opening operator. */
  readonly value: string
  /** Written start marker. */
  readonly startMarker: "none" | "arrow" | "circle" | "cross"
  /** Opening line kind. */
  readonly line: "solid"
  /** Written dash count, always two. */
  readonly length: number
}

/**
 * ast/usecase.md, UsecaseArrow: no child fields.
 *
 * ```text
 * A --> B
 *   ^^^
 * ```
 */
export interface UsecaseArrow extends NodeBase {
  readonly type: "UsecaseArrow"
  /** Written sole or final operator. */
  readonly value: string
  /** Written start marker. */
  readonly startMarker: "none" | "arrow" | "circle" | "cross"
  /** Written end marker. */
  readonly endMarker: "none" | "arrow" | "circle" | "cross" | "triangle"
  /** Written line kind. */
  readonly line: "solid" | "dotted"
  /** Written dash or dot count. */
  readonly length: number
}

/**
 * ast/usecase.md, UsecaseLabel: no child fields.
 *
 * ```text
 * A(Alpha)
 *   ^^^^^
 * ```
 */
export interface UsecaseLabel extends NodeBase {
  readonly type: "UsecaseLabel"
  /** Written label form. */
  readonly kind: "text" | "string" | "markdown"
  /** Complete written content without string delimiters. */
  readonly value: string
}

/**
 * ast/usecase.md, UsecaseLiteral: no child fields.
 *
 * ```text
 * accTitle: Title
 *          ^^^^^^
 * ```
 */
export interface UsecaseLiteral extends NodeBase {
  readonly type: "UsecaseLiteral"
  /** Written stereotype, CSS value, or accessibility text. */
  readonly value: string
}

/**
 * ast/usecase.md, UsecaseMetadata: child fields `properties`.
 *
 * ```text
 * actor A@{type:hollow}
 *        ^^^^^^^^^^^^^^
 * ```
 */
export interface UsecaseMetadata extends NodeBase {
  readonly type: "UsecaseMetadata"
  /** Native properties in written order. */
  readonly properties: readonly UsecaseMetadataProperty[]
}

/**
 * ast/usecase.md, UsecaseMetadataProperty: child fields `key`, `value`.
 *
 * ```text
 * actor A@{type:hollow}
 *          ^^^^^^^^^^^
 * ```
 */
export interface UsecaseMetadataProperty extends NodeBase {
  readonly type: "UsecaseMetadataProperty"
  /** Written key. */
  readonly key: Identifier | StringLiteral
  /** Written scalar; bare true/false remain identifiers. */
  readonly value: Identifier | StringLiteral
}

/**
 * ast/usecase.md, UsecaseMetadataAssignmentStatement: child fields `target`, `metadata`.
 *
 * ```text
 * actor A
 * A@{type:hollow}
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface UsecaseMetadataAssignmentStatement extends NodeBase {
  readonly type: "UsecaseMetadataAssignmentStatement"
  /** Bare id or quoted/markdown target. */
  readonly target: Identifier | UsecaseLabel
  /** Written native update. */
  readonly metadata: UsecaseMetadata
}

/**
 * ast/usecase.md, UsecaseNoteStatement: child fields `target`, `label`.
 *
 * ```text
 * A
 * note for A "Remember"
 * ^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface UsecaseNoteStatement extends NodeBase {
  readonly type: "UsecaseNoteStatement"
  /** Written target id. */
  readonly target: Identifier
  /** Written note label. */
  readonly label: UsecaseLabel
}

/**
 * ast/usecase.md, UsecaseJsonStatement: child fields `id`, `data`, `classes`.
 *
 * ```text
 * json J@{}
 * ^^^^^^^^^
 * ```
 */
export interface UsecaseJsonStatement extends NodeBase {
  readonly type: "UsecaseJsonStatement"
  /** Raw ASCII word id in the JSON prefix. */
  readonly id: Identifier
  /** Written opaque table object. */
  readonly data: UsecaseJsonDataBlock
  /** Written class suffix names. */
  readonly classes: readonly Identifier[]
}

/**
 * ast/usecase.md, UsecaseJsonDataBlock: no child fields.
 *
 * ```text
 * json J@{}
 *       ^^^
 * ```
 */
export interface UsecaseJsonDataBlock extends NodeBase {
  readonly type: "UsecaseJsonDataBlock"
  /** Complete written interior of the outer object braces. */
  readonly value: string
}

/**
 * ast/usecase.md, UsecaseDirectionStatement: no child fields.
 *
 * ```text
 * direction LR
 * ^^^^^^^^^^^^
 * ```
 */
export interface UsecaseDirectionStatement extends NodeBase {
  readonly type: "UsecaseDirectionStatement"
  /** Written direction word. */
  readonly direction: "TD" | "TB" | "BT" | "LR" | "RL"
}

/**
 * ast/usecase.md, UsecaseClassDefStatement: child fields `classes`, `styles`.
 *
 * ```text
 * classDef c fill:red
 * ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface UsecaseClassDefStatement extends NodeBase {
  readonly type: "UsecaseClassDefStatement"
  /** Nonempty list of written defined class names. */
  readonly classes: readonly Identifier[]
  /** Nonempty list of written declarations. */
  readonly styles: readonly UsecaseStyleDeclaration[]
}

/**
 * ast/usecase.md, UsecaseClassStatement: child fields `targets`, `classes`.
 *
 * ```text
 * A
 * class A c
 * ^^^^^^^^^
 * ```
 */
export interface UsecaseClassStatement extends NodeBase {
  readonly type: "UsecaseClassStatement"
  /** Nonempty list of written target ids. */
  readonly targets: readonly Identifier[]
  /** Nonempty list of written class names. */
  readonly classes: readonly Identifier[]
}

/**
 * ast/usecase.md, UsecaseStyleStatement: child fields `target`, `styles`.
 *
 * ```text
 * A
 * style A fill:red
 * ^^^^^^^^^^^^^^^^
 * ```
 */
export interface UsecaseStyleStatement extends NodeBase {
  readonly type: "UsecaseStyleStatement"
  /** Written target id. */
  readonly target: Identifier
  /** Nonempty list of written declarations. */
  readonly styles: readonly UsecaseStyleDeclaration[]
}

/**
 * ast/usecase.md, UsecaseStyleDeclaration: child fields `name`, `value`.
 *
 * ```text
 * A
 * style A fill:red
 *         ^^^^^^^^
 * ```
 */
export interface UsecaseStyleDeclaration extends NodeBase {
  readonly type: "UsecaseStyleDeclaration"
  /** Written property name before the colon. */
  readonly name: UsecaseIdentifier
  /** Opaque written value after the colon. */
  readonly value: UsecaseLiteral
}

/**
 * ast/usecase.md, UsecaseIdentifier: no child fields.
 *
 * ```text
 * A
 * style A fill:red
 *         ^^^^
 * ```
 */
export interface UsecaseIdentifier extends NodeBase {
  readonly type: "UsecaseIdentifier"
  /** Written CSS property name, including internal HWS. */
  readonly name: string
}

/**
 * ast/usecase.md, UsecaseAccTitleStatement: child fields `value`.
 *
 * ```text
 * accTitle: Title
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface UsecaseAccTitleStatement extends NodeBase {
  readonly type: "UsecaseAccTitleStatement"
  /** Complete written line value; null only when empty. */
  readonly value: UsecaseLiteral | null
}

/**
 * ast/usecase.md, UsecaseAccDescrStatement: child fields `value`.
 *
 * ```text
 * accDescr: Text
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface UsecaseAccDescrStatement extends NodeBase {
  readonly type: "UsecaseAccDescrStatement"
  /** Complete written line value; null only when empty. */
  readonly value: UsecaseLiteral | null
}

/**
 * ast/usecase.md, UsecaseAccDescrBlockStatement: child fields `value`.
 *
 * ```text
 * accDescr {Text}
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface UsecaseAccDescrBlockStatement extends NodeBase {
  readonly type: "UsecaseAccDescrBlockStatement"
  /** Complete written brace interior; null only when empty. */
  readonly value: UsecaseLiteral | null
}

/** ast/usecase.md, UsecaseDiagram: every top-level statement. */
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
  | UsecaseAccTitleStatement
  | UsecaseAccDescrStatement
  | UsecaseAccDescrBlockStatement

/** Every node defined in ast/usecase.md. */
export type UsecaseNode =
  | UsecaseDiagram
  | UsecaseActorStatement
  | UsecaseActor
  | UsecaseEntityStatement
  | UsecaseEntity
  | UsecaseSystemBoundaryStatement
  | UsecaseRelationshipStatement
  | UsecaseOpeningArrow
  | UsecaseArrow
  | UsecaseLabel
  | UsecaseLiteral
  | UsecaseMetadata
  | UsecaseMetadataProperty
  | UsecaseMetadataAssignmentStatement
  | UsecaseNoteStatement
  | UsecaseJsonStatement
  | UsecaseJsonDataBlock
  | UsecaseDirectionStatement
  | UsecaseClassDefStatement
  | UsecaseClassStatement
  | UsecaseStyleStatement
  | UsecaseStyleDeclaration
  | UsecaseIdentifier
  | UsecaseAccTitleStatement
  | UsecaseAccDescrStatement
  | UsecaseAccDescrBlockStatement
