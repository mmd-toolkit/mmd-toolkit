/**
 * The C4 nodes defined by `packages/spec/docs/ast/c4.md`.
 * Values keep the written text, without common trivia or conversions.
 * The examples of statements stand after `C4Context` and a line feed;
 * carets mark each node's range.
 */
import type { NodeBase, StringLiteral } from "../ast.ts"

/** ast/c4.md, C4Diagram: the five header kinds. */
export type C4Kind =
  "context" | "container" | "component" | "dynamic" | "deployment"

/** ast/c4.md, C4ElementStatement: the written element keywords. */
export type C4ElementKeyword =
  | "Person"
  | "Person_Ext"
  | "System"
  | "SystemDb"
  | "SystemQueue"
  | "System_Ext"
  | "SystemDb_Ext"
  | "SystemQueue_Ext"
  | "Container"
  | "ContainerDb"
  | "ContainerQueue"
  | "Container_Ext"
  | "ContainerDb_Ext"
  | "ContainerQueue_Ext"
  | "Component"
  | "ComponentDb"
  | "ComponentQueue"
  | "Component_Ext"
  | "ComponentDb_Ext"
  | "ComponentQueue_Ext"

/** ast/c4.md, C4BoundaryStatement: the written boundary keywords. */
export type C4BoundaryKeyword =
  | "Boundary"
  | "Enterprise_Boundary"
  | "System_Boundary"
  | "Container_Boundary"
  | "Deployment_Node"
  | "Node"
  | "Node_L"
  | "Node_R"

/** ast/c4.md, C4RelationshipStatement: the distinct written relationship keywords. */
export type C4RelationshipKeyword =
  | "Rel"
  | "BiRel"
  | "Rel_U"
  | "Rel_Up"
  | "Rel_D"
  | "Rel_Down"
  | "Rel_L"
  | "Rel_Left"
  | "Rel_R"
  | "Rel_Right"
  | "Rel_Back"
  | "RelIndex"

/** ast/c4.md, C4UpdateStatement: the written update keywords. */
export type C4UpdateKeyword =
  "UpdateElementStyle" | "UpdateRelStyle" | "UpdateLayoutConfig"

/**
 * ast/c4.md, C4Diagram: child fields `beforeBody`, `body`.
 *
 * ```text
 * C4Context
 * ^^^^^^^^^
 * Person(a,"A")
 * ^^^^^^^^^^^^^
 * ```
 */
export interface C4Diagram extends NodeBase {
  readonly type: "C4Diagram"
  /** The kind selected by the header. */
  readonly kind: C4Kind
  /** Empty description blocks between the header and its newline. */
  readonly beforeBody: readonly C4AccDescrBlockStatement[]
  /** Written statements, including empty description blocks, in source order. */
  readonly body: readonly C4Statement[]
}

/** All statement types defined by ast/c4.md, C4Diagram. */
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

/**
 * ast/c4.md, C4ElementStatement: child field `arguments`.
 *
 * ```text
 * Person(a,"A")
 * ^^^^^^^^^^^^^
 * ```
 */
export interface C4ElementStatement extends NodeBase {
  readonly type: "C4ElementStatement"
  /** The written element keyword. */
  readonly keyword: C4ElementKeyword
  /** Every argument entry, in written order; at least one. */
  readonly arguments: readonly C4Argument[]
}

/**
 * ast/c4.md, C4BoundaryStatement: child fields `arguments`, `beforeBody`, `body`.
 *
 * ```text
 * Boundary(b,"B") {
 * ^^^^^^^^^^^^^^^^^
 * Person(a,"A")
 * ^^^^^^^^^^^^^
 * }
 * ^
 * ```
 */
export interface C4BoundaryStatement extends NodeBase {
  readonly type: "C4BoundaryStatement"
  /** The written boundary keyword. */
  readonly keyword: C4BoundaryKeyword
  /** Every argument entry, in written order; at least one. */
  readonly arguments: readonly C4Argument[]
  /** Empty description blocks between the call and its opening brace. */
  readonly beforeBody: readonly C4AccDescrBlockStatement[]
  /** The nested statements, in written order. */
  readonly body: readonly C4Statement[]
}

/**
 * ast/c4.md, C4RelationshipStatement: child field `arguments`.
 *
 * ```text
 * Rel(a,b,"R")
 * ^^^^^^^^^^^^
 * ```
 */
export interface C4RelationshipStatement extends NodeBase {
  readonly type: "C4RelationshipStatement"
  /** The written relationship keyword. */
  readonly keyword: C4RelationshipKeyword
  /** Every argument entry, in written order; at least one. */
  readonly arguments: readonly C4Argument[]
}

/**
 * ast/c4.md, C4UpdateStatement: child field `arguments`.
 *
 * ```text
 * UpdateLayoutConfig("")
 * ^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface C4UpdateStatement extends NodeBase {
  readonly type: "C4UpdateStatement"
  /** The written update keyword. */
  readonly keyword: C4UpdateKeyword
  /** Every argument entry, in written order; at least one. */
  readonly arguments: readonly C4Argument[]
}

/** ast/c4.md, C4Argument: one flat list; null is a written empty entry. */
export type C4Argument = C4Literal | StringLiteral | C4NamedAttribute | null

/**
 * ast/c4.md, C4NamedAttribute: child fields `key`, `value`.
 *
 * ```text
 * Person(a,"A",$descr="V")
 *              ^^^^^^^^^^
 * ```
 */
export interface C4NamedAttribute extends NodeBase {
  readonly type: "C4NamedAttribute"
  /** The key without `$`, `=`, or exterior whitespace; null when empty. */
  readonly key: C4Literal | null
  /** The nonempty quoted value. */
  readonly value: StringLiteral
}

/**
 * ast/c4.md, C4TitleStatement: child field `value`.
 *
 * ```text
 * title T
 * ^^^^^^^
 * ```
 */
export interface C4TitleStatement extends NodeBase {
  readonly type: "C4TitleStatement"
  /** Text after the first separator, preserving additional whitespace. */
  readonly value: C4Literal
}

/**
 * ast/c4.md, C4AccDescriptionStatement: child field `value`.
 *
 * ```text
 * accDescription D
 * ^^^^^^^^^^^^^^^^
 * ```
 */
export interface C4AccDescriptionStatement extends NodeBase {
  readonly type: "C4AccDescriptionStatement"
  /** Text after the first separator, preserving additional whitespace. */
  readonly value: C4Literal
}

/**
 * ast/c4.md, C4AccTitleStatement: child field `value`.
 *
 * ```text
 * accTitle: T
 * ^^^^^^^^^^^
 * ```
 */
export interface C4AccTitleStatement extends NodeBase {
  readonly type: "C4AccTitleStatement"
  /** The line value without exterior whitespace; null when empty. */
  readonly value: C4Literal | null
}

/**
 * ast/c4.md, C4AccDescrStatement: child field `value`.
 *
 * ```text
 * accDescr: D
 * ^^^^^^^^^^^
 * ```
 */
export interface C4AccDescrStatement extends NodeBase {
  readonly type: "C4AccDescrStatement"
  /** The line value without exterior whitespace; null when empty. */
  readonly value: C4Literal | null
}

/**
 * ast/c4.md, C4AccDescrBlockStatement: child field `value`.
 *
 * ```text
 * accDescr { D }
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface C4AccDescrBlockStatement extends NodeBase {
  readonly type: "C4AccDescrBlockStatement"
  /** The block interior without exterior whitespace; null when empty. */
  readonly value: C4Literal | null
}

/**
 * ast/c4.md, C4Literal: bare arguments, named keys, title and accessibility text.
 * No child fields.
 *
 * ```text
 * Person(a,"A")
 *        ^
 * ```
 */
export interface C4Literal extends NodeBase {
  readonly type: "C4Literal"
  /** Its written text. */
  readonly value: string
}

/** Every node type defined by ast/c4.md. */
export type C4Node = C4Diagram | C4Statement | C4NamedAttribute | C4Literal
