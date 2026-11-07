/**
 * The nodes of the requirement tree, as defined in
 * `packages/spec/docs/ast/requirement.md`, for the diagram type
 * `requirement`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. A **requirement** is a box of the diagram with an id, a text, a
 * risk, and a verification method; an **element** is a box with a type and
 * a document reference. Both are named by their names, and a relationship
 * joins two names.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. A node
 * that spans several lines has such a line under each of its lines. The
 * examples other than that of the diagram stand after the header line
 * `requirementDiagram`.
 */
import type { NodeBase, StringLiteral } from "../ast.ts"

/**
 * ast/requirement.md, RequirementDiagram: the body of the diagram type
 * `requirement`. Its child field is `body`. The header keyword is not a
 * field; its token is in `Root.tokens`. The range runs from the header
 * keyword to the last token of the diagram.
 *
 * ```text
 * requirementDiagram
 * ^^^^^^^^^^^^^^^^^^
 * a - satisfies -> b
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RequirementDiagram extends NodeBase {
  readonly type: "RequirementDiagram"
  /** The statements, in source order. */
  readonly body: readonly RequirementStatement[]
}

/** ast/requirement.md, RequirementDiagram: a statement of a requirement diagram. */
export type RequirementStatement =
  | RequirementRequirementStatement
  | RequirementElementStatement
  | RequirementRelationshipStatement
  | RequirementDirectionStatement
  | RequirementStyleStatement
  | RequirementClassDefStatement
  | RequirementClassStatement
  | RequirementClassShorthandStatement
  | RequirementAccTitleStatement
  | RequirementAccDescrStatement
  | RequirementAccDescrBlockStatement

/** ast/requirement.md, RequirementRequirementStatement: the kinds of requirement, as the keywords are written in the specification. */
export type RequirementKind =
  | "requirement"
  | "functionalRequirement"
  | "interfaceRequirement"
  | "performanceRequirement"
  | "physicalRequirement"
  | "designConstraint"

/** ast/requirement.md, RequirementIdentifier and StringLiteral: a name, written without quotes or in quotes. */
export type RequirementName = RequirementIdentifier | StringLiteral

/**
 * ast/requirement.md, RequirementRequirementStatement: a requirement with
 * its body. Its child fields are `name`, `cssClasses`, and `body`.
 *
 * ```text
 * requirement r:::c {
 * ^^^^^^^^^^^^^^^^^^^
 *   id: 1
 * ^^^^^^^
 * }
 * ^
 * ```
 */
export interface RequirementRequirementStatement extends NodeBase {
  readonly type: "RequirementRequirementStatement"
  /** The kind of requirement: the keyword that starts the statement, whatever the case in which it is written. */
  readonly requirementType: RequirementKind
  /** The name: a RequirementIdentifier for an `unquoted-text` unit, a StringLiteral for a `string` unit. */
  readonly name: RequirementName
  /** The classes after `:::`, in source order, each as the name; empty when there is no `:::`. */
  readonly cssClasses: readonly RequirementName[]
  /** The items between `{` and `}`, in source order; empty for a body without items. */
  readonly body: readonly (
    | RequirementValueField
    | RequirementRiskField
    | RequirementVerifyMethodField
    | RequirementIgnoredText
  )[]
}

/**
 * ast/requirement.md, RequirementValueField: an `id` or a `text` field of a
 * requirement. Its child field is `value`.
 *
 * ```text
 * requirement r {
 *   text: "a: b"
 *   ^^^^^^^^^^^^
 * }
 * ```
 */
export interface RequirementValueField extends NodeBase {
  readonly type: "RequirementValueField"
  /** `id` or `text`, in lower case whatever the case in which it is written. */
  readonly field: "id" | "text"
  /** The value after the `:`: a RequirementLiteral for an `unquoted-text` unit, a StringLiteral for a `string` unit. */
  readonly value: RequirementLiteral | StringLiteral
}

/** ast/requirement.md, RequirementRiskField: the risks, in lower case. */
export type RequirementRisk = "low" | "medium" | "high"

/**
 * ast/requirement.md, RequirementRiskField: a `risk` field. No child
 * fields.
 *
 * ```text
 * requirement r {
 *   risk: High
 *   ^^^^^^^^^^
 * }
 * ```
 */
export interface RequirementRiskField extends NodeBase {
  readonly type: "RequirementRiskField"
  /** The risk, the keyword in lower case. */
  readonly risk: RequirementRisk
}

/** ast/requirement.md, RequirementVerifyMethodField: the methods, in lower case. */
export type RequirementVerifyMethod =
  "analysis" | "demonstration" | "inspection" | "test"

/**
 * ast/requirement.md, RequirementVerifyMethodField: a `verifyMethod`
 * field. No child fields.
 *
 * ```text
 * requirement r {
 *   verifyMethod: test
 *   ^^^^^^^^^^^^^^^^^^
 * }
 * ```
 */
export interface RequirementVerifyMethodField extends NodeBase {
  readonly type: "RequirementVerifyMethodField"
  /** The method, the keyword in lower case. */
  readonly verifyMethod: RequirementVerifyMethod
}

/**
 * ast/requirement.md, RequirementElementStatement: an element with its
 * body. Its child fields are `name`, `cssClasses`, and `body`.
 *
 * ```text
 * element e {
 * ^^^^^^^^^^^
 *   type: simulation
 * ^^^^^^^^^^^^^^^^^^
 * }
 * ^
 * ```
 */
export interface RequirementElementStatement extends NodeBase {
  readonly type: "RequirementElementStatement"
  /** The name, as in RequirementRequirementStatement. */
  readonly name: RequirementName
  /** The classes after `:::`, in source order; empty when there is no `:::`. */
  readonly cssClasses: readonly RequirementName[]
  /** The items between `{` and `}`, in source order; empty for a body without items. */
  readonly body: readonly (RequirementElementField | RequirementIgnoredText)[]
}

/**
 * ast/requirement.md, RequirementElementField: a `type` or a `docref`
 * field of an element. Its child field is `value`.
 *
 * ```text
 * element e {
 *   docRef: "http://x"
 *   ^^^^^^^^^^^^^^^^^^
 * }
 * ```
 */
export interface RequirementElementField extends NodeBase {
  readonly type: "RequirementElementField"
  /** `type` or `docref`, in lower case whatever the case in which it is written. */
  readonly field: "type" | "docref"
  /** The value after the `:`, as in RequirementValueField. */
  readonly value: RequirementLiteral | StringLiteral
}

/** ast/requirement.md, RequirementRelationshipStatement: the kinds of relationship, in lower case. */
export type RequirementRelationship =
  | "contains"
  | "copies"
  | "derives"
  | "satisfies"
  | "verifies"
  | "refines"
  | "traces"

/**
 * ast/requirement.md, RequirementRelationshipStatement: two names joined by
 * a relationship. Its child fields are `left` and `right`.
 *
 * ```text
 * b <- copies - a
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface RequirementRelationshipStatement extends NodeBase {
  readonly type: "RequirementRelationshipStatement"
  /** The name before the relationship. */
  readonly left: RequirementName
  /** The kind of relationship, in lower case. */
  readonly relationship: RequirementRelationship
  /** `forward` for `- ... ->`, `backward` for `<- ... -`. */
  readonly arrow: "forward" | "backward"
  /** The name after the relationship. */
  readonly right: RequirementName
}

/** ast/requirement.md, RequirementDirectionStatement: the directions, in upper case. */
export type RequirementDirection = "TB" | "BT" | "RL" | "LR"

/**
 * ast/requirement.md, RequirementDirectionStatement: a direction line. Its
 * child fields are `textBefore` and `textAfter`.
 *
 * ```text
 * direction LR
 * ^^^^^^^^^^^^
 * ```
 */
export interface RequirementDirectionStatement extends NodeBase {
  readonly type: "RequirementDirectionStatement"
  /** The text of the direction line before `direction`, or null when there is none. */
  readonly textBefore: RequirementIgnoredText | null
  /** The value, in upper case. */
  readonly direction: RequirementDirection
  /** The text of the direction line after the value, or null when there is none. */
  readonly textAfter: RequirementIgnoredText | null
}

/**
 * ast/requirement.md, RequirementStyleStatement. Its child fields are
 * `names` and `styles`.
 *
 * ```text
 * style r,e fill:#f9f,stroke:#333
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RequirementStyleStatement extends NodeBase {
  readonly type: "RequirementStyleStatement"
  /** The names after `style`, in source order: a RequirementIdentifier for a `style-word` unit, a StringLiteral for a `string` unit. */
  readonly names: readonly RequirementName[]
  /** The styles, in source order; never empty. */
  readonly styles: readonly RequirementLiteral[]
}

/**
 * ast/requirement.md, RequirementClassDefStatement. Its child fields are
 * `cssClasses` and `styles`.
 *
 * ```text
 * classDef a,b fill:#f9f
 * ^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RequirementClassDefStatement extends NodeBase {
  readonly type: "RequirementClassDefStatement"
  /** The class names after `classDef`, in source order, each as a name of RequirementStyleStatement. */
  readonly cssClasses: readonly RequirementName[]
  /** The styles, as in RequirementStyleStatement. */
  readonly styles: readonly RequirementLiteral[]
}

/**
 * ast/requirement.md, RequirementClassStatement. Its child fields are
 * `names` and `cssClasses`.
 *
 * ```text
 * class r,e a,b
 * ^^^^^^^^^^^^^
 * ```
 */
export interface RequirementClassStatement extends NodeBase {
  readonly type: "RequirementClassStatement"
  /** The names after `class`, in source order: a RequirementIdentifier for a `style-word` or an `unquoted-text` unit, a StringLiteral for a `string` unit. */
  readonly names: readonly RequirementName[]
  /** The classes, in source order, each as a name. */
  readonly cssClasses: readonly RequirementName[]
}

/**
 * ast/requirement.md, RequirementClassShorthandStatement: a name followed
 * by `:::` and classes. Its child fields are `name` and `cssClasses`.
 *
 * ```text
 * r:::a,b
 * ^^^^^^^
 * ```
 */
export interface RequirementClassShorthandStatement extends NodeBase {
  readonly type: "RequirementClassShorthandStatement"
  /** The name before `:::`. */
  readonly name: RequirementName
  /** The classes after `:::`, in source order. */
  readonly cssClasses: readonly RequirementName[]
}

/**
 * ast/requirement.md, RequirementAccTitleStatement: an `accTitle:`
 * statement with its text. Its child field is `value`.
 *
 * ```text
 * accTitle: My title
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RequirementAccTitleStatement extends NodeBase {
  readonly type: "RequirementAccTitleStatement"
  /** The text after `accTitle:`, without the whitespace at its ends. */
  readonly value: RequirementLiteral
}

/**
 * ast/requirement.md, RequirementAccDescrStatement: an `accDescr:`
 * statement with its text. Its child field is `value`.
 *
 * ```text
 * accDescr: My description
 * ^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RequirementAccDescrStatement extends NodeBase {
  readonly type: "RequirementAccDescrStatement"
  /** The text after `accDescr:`, without the whitespace at its ends. */
  readonly value: RequirementLiteral
}

/**
 * ast/requirement.md, RequirementAccDescrBlockStatement: an `accDescr { ... }`
 * statement with its text, or without text. Its child field is `value`.
 *
 * ```text
 * accDescr {
 * ^^^^^^^^^^
 *   My description
 * ^^^^^^^^^^^^^^^^
 * }
 * ^
 * ```
 */
export interface RequirementAccDescrBlockStatement extends NodeBase {
  readonly type: "RequirementAccDescrBlockStatement"
  /** The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace lies between them. */
  readonly value: RequirementLiteral | null
}

/**
 * ast/requirement.md, RequirementIdentifier: a name written without
 * quotes, an `unquoted-text` or a `style-word` unit. No child fields.
 *
 * ```text
 * requirement spaced name {
 *             ^^^^^^^^^^^
 * }
 * ```
 */
export interface RequirementIdentifier extends NodeBase {
  readonly type: "RequirementIdentifier"
  /** Its written text, whitespace included. */
  readonly name: string
}

/**
 * ast/requirement.md, RequirementLiteral: a text without quotes that may
 * contain whitespace: the value of a field, a style, and an accessibility
 * text. No child fields.
 *
 * ```text
 * style r fill: red
 *         ^^^^^^^^^
 * ```
 */
export interface RequirementLiteral extends NodeBase {
  readonly type: "RequirementLiteral"
  /** Its written text; for a style, the written texts of its units joined in order. */
  readonly value: string
}

/**
 * ast/requirement.md, RequirementIgnoredText: text that the author wrote
 * and mermaid.js does not read: the text before `direction` and after its
 * value on a direction line, and an empty description block on a line of
 * the body of a requirement or an element. No child fields.
 *
 * ```text
 * requirement r {
 *   accDescr {}
 *   ^^^^^^^^^^^
 * }
 * ```
 */
export interface RequirementIgnoredText extends NodeBase {
  readonly type: "RequirementIgnoredText"
  /** Its written text. */
  readonly value: string
}

/** Every node type of the requirement tree. */
export type RequirementNode =
  | RequirementDiagram
  | RequirementStatement
  | RequirementValueField
  | RequirementRiskField
  | RequirementVerifyMethodField
  | RequirementElementField
  | RequirementIdentifier
  | RequirementLiteral
  | RequirementIgnoredText
