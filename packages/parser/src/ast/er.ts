/**
 * The nodes of the ER tree, as defined in `packages/spec/docs/ast/er.md`,
 * for the diagram type `er`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. An **entity** is a box of the diagram, named by its name; a
 * relationship joins two entities, with a cardinality at each end and a
 * role.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. A node
 * that spans several lines has such a line under each of its lines. The
 * examples other than that of the diagram stand after the header line
 * `erDiagram`.
 */
import type { Identifier, NodeBase, StringLiteral } from "../ast.ts"

/**
 * ast/er.md, ErDiagram: the body of the diagram type `er`. Its child field
 * is `body`. The header keyword is not a field; its token is in
 * `Root.tokens`. The range runs from the header keyword to the last token
 * of the diagram.
 *
 * ```text
 * erDiagram
 * ^^^^^^^^^
 * A ||--o{ B : has
 * ^^^^^^^^^^^^^^^^
 * ```
 */
export interface ErDiagram extends NodeBase {
  readonly type: "ErDiagram"
  /** The statements, in source order. */
  readonly body: readonly ErStatement[]
}

/** ast/er.md, ErDiagram: a statement of an ER diagram. */
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

/**
 * ast/er.md, ErEntityStatement: an entity written by its name, with an
 * alias, classes, and attributes or without. Its child fields are `name`,
 * `alias`, `cssClasses`, and `attributes`.
 *
 * ```text
 * p[Person]:::c { string name }
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ErEntityStatement extends NodeBase {
  readonly type: "ErEntityStatement"
  /** The name of the entity: an ErIdentifier for a `name` or a `number` unit, a StringLiteral for a `quoted-name` unit. */
  readonly name: ErIdentifier | StringLiteral
  /** The alias between `[` and `]`; null when there is none. */
  readonly alias: ErIdentifier | StringLiteral | null
  /** The classes after `:::`, in source order; empty when there is no `:::`. */
  readonly cssClasses: readonly ErIdentifier[]
  /** The items of the attribute block between `{` and `}`, in source order; empty for a block without items, null when there is no block. */
  readonly attributes: readonly (ErAttribute | ErIgnoredText)[] | null
}

/**
 * ast/er.md, ErAttribute: one attribute of an entity. Its child fields are
 * `type`, `name`, `keys`, and `comment`. The `?` is a unit and no node.
 *
 * ```text
 * A { int id PK, FK "the key" }
 *     ^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ErAttribute extends NodeBase {
  readonly type: "ErAttribute"
  /** The type: an ErIdentifier for a `word` or a `tilde-word` unit, a StringLiteral for a `backquoted-word` unit. */
  readonly dataType: ErIdentifier | StringLiteral
  /** Whether a `?` follows the type. */
  readonly optional: boolean
  /** The name, as the type. */
  readonly name: ErIdentifier | StringLiteral
  /** The keys after the name, in source order; empty when none. */
  readonly keys: readonly Identifier[]
  /** The comment in quotes; null when there is none. */
  readonly comment: StringLiteral | null
}

/**
 * ast/er.md, ErRelationshipStatement: two entities joined by a
 * relationship, with its role. Its child fields are `left`,
 * `relationship`, `right`, and `role`.
 *
 * ```text
 * A ||--o{ B : has
 * ^^^^^^^^^^^^^^^^
 * ```
 */
export interface ErRelationshipStatement extends NodeBase {
  readonly type: "ErRelationshipStatement"
  /** The entity before the relationship. */
  readonly left: ErEntityReference
  /** The cardinalities and the line. */
  readonly relationship: ErRelationship
  /** The entity after the relationship. */
  readonly right: ErEntityReference
  /** The role after `:`: a StringLiteral for a `string` or a `quoted-name` unit, an ErIdentifier for a `name` unit. */
  readonly role: StringLiteral | ErIdentifier
}

/**
 * ast/er.md, ErEntityReference: an end of a relationship. Its child fields
 * are `name` and `cssClasses`.
 *
 * ```text
 * A:::c ||--o{ B : has
 * ^^^^^
 * ```
 */
export interface ErEntityReference extends NodeBase {
  readonly type: "ErEntityReference"
  /** The name of the entity, as in ErEntityStatement. */
  readonly name: ErIdentifier | StringLiteral
  /** The classes after `:::`, in source order; empty when there is no `:::`. */
  readonly cssClasses: readonly ErIdentifier[]
}

/** ast/er.md, ErRelationship: the cardinality words, the names of the cardinality units. */
export type ErCardinality =
  "zero-or-one" | "zero-or-more" | "one-or-more" | "only-one" | "md-parent"

/** ast/er.md, ErRelationship: the line words, the names of the line units. */
export type ErRelationshipLine = "identifying" | "non-identifying"

/**
 * ast/er.md, ErRelationship: the three units between the two entities of a
 * relationship. No child fields, and no `value`: the texts of the units
 * are in the tokens.
 *
 * ```text
 * A one or more to zero or one B : has
 *   ^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ErRelationship extends NodeBase {
  readonly type: "ErRelationship"
  /** The cardinality at the left entity. */
  readonly leftCardinality: ErCardinality
  /** The line. */
  readonly line: ErRelationshipLine
  /** The cardinality at the right entity. */
  readonly rightCardinality: ErCardinality
}

/**
 * ast/er.md, ErSubgraphStatement: a subgraph, the statements of its body,
 * and `end`. Its child fields are `id`, `title`, and `body`.
 *
 * ```text
 * subgraph S [Title]
 * ^^^^^^^^^^^^^^^^^^
 *   A
 * ^^^
 * end
 * ^^^
 * ```
 */
export interface ErSubgraphStatement extends NodeBase {
  readonly type: "ErSubgraphStatement"
  /** The name after `subgraph`, as in ErEntityStatement. */
  readonly id: ErIdentifier | StringLiteral
  /** The entity names between `[` and `]`, in source order; null when there is no title. */
  readonly title: readonly (ErIdentifier | StringLiteral)[] | null
  /** The statements up to `end`, in source order, the empty description blocks of the header line first. */
  readonly body: readonly ErStatement[]
}

/** ast/er.md, ErDirectionStatement: the directions, in upper case. */
export type ErDirection = "TB" | "BT" | "RL" | "LR"

/**
 * ast/er.md, ErDirectionStatement: a direction line. Its child fields are
 * `textBefore` and `textAfter`.
 *
 * ```text
 * direction LR
 * ^^^^^^^^^^^^
 * ```
 */
export interface ErDirectionStatement extends NodeBase {
  readonly type: "ErDirectionStatement"
  /** The text of the direction line before `direction`, or null when there is none. */
  readonly textBefore: ErIgnoredText | null
  /** The value, in upper case. */
  readonly direction: ErDirection
  /** The text of the direction line after the value, or null when there is none. */
  readonly textAfter: ErIgnoredText | null
}

/**
 * ast/er.md, ErClassDefStatement. Its child fields are `cssClasses` and
 * `styles`.
 *
 * ```text
 * classDef a,b fill:#f9f,stroke:#333
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ErClassDefStatement extends NodeBase {
  readonly type: "ErClassDefStatement"
  /** The class names after `classDef`, in source order. */
  readonly cssClasses: readonly ErIdentifier[]
  /** The styles, in source order; never empty. */
  readonly styles: readonly ErLiteral[]
}

/**
 * ast/er.md, ErClassStatement. Its child fields are `entities` and
 * `cssClasses`.
 *
 * ```text
 * class A,B c1,c2
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface ErClassStatement extends NodeBase {
  readonly type: "ErClassStatement"
  /** The names of entities or subgraphs after `class`, in source order. */
  readonly entities: readonly ErIdentifier[]
  /** The classes, in source order. */
  readonly cssClasses: readonly ErIdentifier[]
}

/**
 * ast/er.md, ErStyleStatement. Its child fields are `entities` and
 * `styles`.
 *
 * ```text
 * style A,B fill:red,stroke:blue
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ErStyleStatement extends NodeBase {
  readonly type: "ErStyleStatement"
  /** The names of entities or subgraphs after `style`, in source order. */
  readonly entities: readonly ErIdentifier[]
  /** The styles, as in ErClassDefStatement. */
  readonly styles: readonly ErLiteral[]
}

/**
 * ast/er.md, ErAccTitleStatement: an `accTitle:` statement with its text.
 * Its child field is `value`.
 *
 * ```text
 * accTitle: My title
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ErAccTitleStatement extends NodeBase {
  readonly type: "ErAccTitleStatement"
  /** The text after `accTitle:`, up to the end of its line. */
  readonly value: ErLiteral
}

/**
 * ast/er.md, ErAccDescrStatement: an `accDescr:` statement with its text.
 * Its child field is `value`.
 *
 * ```text
 * accDescr: My description
 * ^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ErAccDescrStatement extends NodeBase {
  readonly type: "ErAccDescrStatement"
  /** The text after `accDescr:`, up to the end of its line. */
  readonly value: ErLiteral
}

/**
 * ast/er.md, ErAccDescrBlockStatement: an `accDescr { ... }` statement with
 * its text, or without text, an empty description block. Its child field
 * is `value`.
 *
 * ```text
 * accDescr { My description }
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ErAccDescrBlockStatement extends NodeBase {
  readonly type: "ErAccDescrBlockStatement"
  /** The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace lies between them. */
  readonly value: ErLiteral | null
}

/**
 * ast/er.md, ErIdentifier: a name written without quotes: the name or the
 * alias of an entity, a role, a class name, a name after `style` or
 * `classDef`, and the type or the name of an attribute; a `name`,
 * `number`, `style-text`, `word`, or `tilde-word` unit, which may contain
 * whitespace. No child fields.
 *
 * ```text
 * A { List~a b~ c }
 *     ^^^^^^^^^
 * ```
 */
export interface ErIdentifier extends NodeBase {
  readonly type: "ErIdentifier"
  /** Its written text, whitespace included. */
  readonly name: string
}

/**
 * ast/er.md, ErLiteral: a text without quotes that may contain whitespace,
 * a style or an accessibility text. No child fields.
 *
 * ```text
 * classDef a fill : #f9f
 *            ^^^^^^^^^^^
 * ```
 */
export interface ErLiteral extends NodeBase {
  readonly type: "ErLiteral"
  /** Its written text; for a style, the written texts of its units joined in order. */
  readonly value: string
}

/**
 * ast/er.md, ErIgnoredText: text that the author wrote and mermaid.js does
 * not read: the text before `direction` and after its value on a direction
 * line, and a run of `empty-backquotes` units in an attribute block. No
 * child fields.
 *
 * ```text
 * A ||--o{ B : x direction LR
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface ErIgnoredText extends NodeBase {
  readonly type: "ErIgnoredText"
  /** Its written text. */
  readonly value: string
}

/** Every node type of the ER tree. */
export type ErNode =
  | ErDiagram
  | ErStatement
  | ErAttribute
  | ErEntityReference
  | ErRelationship
  | ErIdentifier
  | ErLiteral
  | ErIgnoredText
