/**
 * The nodes of the state tree, as defined in
 * `packages/spec/docs/ast/state.md`, for the diagram type `stateDiagram`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source, which the Db normalization applies where it uses them. A
 * **state** is a box of the diagram, named by its id; a transition goes
 * from one state to another, and `[*]` stands for the start or the end.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. A node
 * that spans several lines has such a line under each of its lines. The
 * examples other than that of the diagram stand after the header line
 * `stateDiagram-v2`.
 */
import type {
  Identifier,
  NodeBase,
  NumericLiteral,
  StringLiteral,
} from "../ast.ts"

/**
 * ast/state.md, StateDiagram: the body of the diagram type `stateDiagram`.
 * Its child field is `body`. The header keyword is not a field; its token
 * is in `Root.tokens`. The range runs from the header keyword to the last
 * token of the diagram.
 *
 * ```text
 * stateDiagram-v2
 * ^^^^^^^^^^^^^^^
 * A --> B
 * ^^^^^^^
 * ```
 */
export interface StateDiagram extends NodeBase {
  readonly type: "StateDiagram"
  /** The statements, in source order. */
  readonly body: readonly StateStatement[]
}

/** ast/state.md, StateDiagram: a statement of a state diagram. */
export type StateStatement =
  | StateDefinitionStatement
  | StateTransitionStatement
  | StateCompositeStatement
  | StateAliasDefinitionStatement
  | StatePseudostateDefinitionStatement
  | StateIgnoredStatement
  | StateDividerStatement
  | StateNoteStatement
  | StateFloatingNoteStatement
  | StateClickStatement
  | StateClassDefStatement
  | StateClassStatement
  | StateStyleStatement
  | StateDirectionStatement
  | StateAccTitleStatement
  | StateAccDescrStatement
  | StateAccDescrBlockStatement
  | StateScaleStatement
  | StateHideEmptyDescriptionStatement

/**
 * ast/state.md, StateDefinitionStatement: a state written by its id, alone
 * or with a description. Its child fields are `reference` and
 * `description`.
 *
 * ```text
 * A : text
 * ^^^^^^^^
 * ```
 */
export interface StateDefinitionStatement extends NodeBase {
  readonly type: "StateDefinitionStatement"
  /** The state. */
  readonly reference: StateReference
  /** The text after `:`; null when there is no `:`, or when the text after it is all whitespace. */
  readonly description: StateLiteral | null
}

/**
 * ast/state.md, StateTransitionStatement: a transition. Its child fields
 * are `from`, `to`, and `label`. The arrow `-->` is a `Punctuator` token
 * and no node.
 *
 * ```text
 * A --> B : go
 * ^^^^^^^^^^^^
 * ```
 */
export interface StateTransitionStatement extends NodeBase {
  readonly type: "StateTransitionStatement"
  /** The state before the arrow. */
  readonly from: StateReference
  /** The state after the arrow. */
  readonly to: StateReference
  /** The text after `:`; null when there is none, or when it is all whitespace. */
  readonly label: StateLiteral | null
}

/**
 * ast/state.md, StateReference: a state written by its id or as `[*]`,
 * with its CSS class. Its child fields are `state` and `cssClass`.
 *
 * ```text
 * A:::cls --> B
 * ^^^^^^^
 * ```
 */
export interface StateReference extends NodeBase {
  readonly type: "StateReference"
  /** The id of the state, or `[*]`. The name of the Identifier is the id in the Db. */
  readonly state: Identifier | StateTerminal
  /** The CSS class after `:::`; null when there is none. */
  readonly cssClass: Identifier | null
}

/**
 * ast/state.md, StateTerminal: `[*]`. Before the arrow of a transition, or
 * alone, it is a start, and after the arrow, an end. No child fields.
 *
 * ```text
 * [*] --> A
 * ^^^
 * ```
 */
export interface StateTerminal extends NodeBase {
  readonly type: "StateTerminal"
}

/**
 * ast/state.md, StateCompositeStatement: `state A { ... }`, and `state A`.
 * Its child fields are `textBeforeId`, `id`, `textBeforeBody`, and `body`.
 * Without a body, it adds nothing to the Db.
 *
 * ```text
 * state A {
 * ^^^^^^^^^
 *   B
 * ^^^
 * }
 * ^
 * ```
 */
export interface StateCompositeStatement extends NodeBase {
  readonly type: "StateCompositeStatement"
  /** The empty strings before the name, which mermaid.js does not read; null when there are none. */
  readonly textBeforeId: StateIgnoredText | null
  /** The name after `state`; null for `state` alone. */
  readonly id: Identifier | null
  /**
   * The empty strings and the `%%` before the `{` of the body, which
   * mermaid.js does not read, from the first to the last; null when there
   * are none.
   */
  readonly textBeforeBody: StateIgnoredText | null
  /** The statements between `{` and `}`; null without a body. */
  readonly body: readonly StateStatement[] | null
}

/**
 * ast/state.md, StateAliasDefinitionStatement: `state "description" as A`,
 * with a second description or a body. Its child fields are
 * `textBeforeDescription`, `description`, `textAfterDescription`, `id`,
 * `secondDescription`, `textAfter`, `textBeforeBody`, and `body`.
 *
 * ```text
 * state "Long name" as A : more
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StateAliasDefinitionStatement extends NodeBase {
  readonly type: "StateAliasDefinitionStatement"
  /** The empty strings before the description, which mermaid.js does not read; null when there are none. */
  readonly textBeforeDescription: StateIgnoredText | null
  /** The description in quotes. */
  readonly description: StringLiteral
  /** The empty strings after the description, before `as`; null when there are none. */
  readonly textAfterDescription: StateIgnoredText | null
  /** The id after `as`; null when it is empty. */
  readonly id: StateLiteral | null
  /** Without a body, the text between the first `:` and the second `:` or the end; null when there is none. */
  readonly secondDescription: StateLiteral | null
  /** Without a body, the text from the second `:`; null when there is none. */
  readonly textAfter: StateIgnoredText | null
  /**
   * The text from `%%` before the `{` of the body, which mermaid.js does
   * not read: after `as`, up to the `{` on its line, without the
   * whitespace at its end, or a `%%` on the line after the alias; null
   * when there is none.
   */
  readonly textBeforeBody: StateIgnoredText | null
  /** The statements between `{` and `}`; null without a body. */
  readonly body: readonly StateStatement[] | null
}

/**
 * ast/state.md, StatePseudostateDefinitionStatement: the kind of a
 * pseudostate, from its mark.
 *
 * - `"fork"`: Written `<<fork>>` or `[[fork]]`.
 * - `"join"`: Written `<<join>>` or `[[join]]`.
 * - `"choice"`: Written `<<choice>>` or `[[choice]]`.
 */
export type StatePseudostateKind =
  /** Written `<<fork>>` or `[[fork]]`. */
  | "fork"
  /** Written `<<join>>` or `[[join]]`. */
  | "join"
  /** Written `<<choice>>` or `[[choice]]`. */
  | "choice"

/**
 * ast/state.md, StatePseudostateDefinitionStatement: `state f1 <<fork>>`.
 * Its child field is `id`.
 *
 * ```text
 * state f1 <<fork>>
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StatePseudostateDefinitionStatement extends NodeBase {
  readonly type: "StatePseudostateDefinitionStatement"
  /** The text before the mark; null when it is empty. */
  readonly id: StateLiteral | null
  /** The kind; see {@link StatePseudostateKind}. */
  readonly kind: StatePseudostateKind
}

/**
 * ast/state.md, StateDividerStatement: `--` in the body of a composite
 * state, which divides it into regions. No fields.
 *
 * ```text
 * state A {
 *   B
 *   --
 *   ^^
 *   C
 * }
 * ```
 */
export interface StateDividerStatement extends NodeBase {
  readonly type: "StateDividerStatement"
}

/**
 * ast/state.md, StateNoteStatement: the side of the state that a note is
 * on.
 *
 * - `"left"`: Written `left of`.
 * - `"right"`: Written `right of`.
 */
export type StateNotePosition =
  /** Written `left of`. */
  | "left"
  /** Written `right of`. */
  | "right"

/**
 * ast/state.md, StateNoteStatement: `note left of A : text`, or a note
 * whose text is on the lines up to `end note`. Its child fields are
 * `textBeforeState`, `state`, and `text`.
 *
 * ```text
 * note left of A : text
 * ^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StateNoteStatement extends NodeBase {
  readonly type: "StateNoteStatement"
  /** The side; see {@link StateNotePosition}. */
  readonly position: StateNotePosition
  /**
   * The text from a `%%` right after the position, without whitespace
   * between, up to `:`, a line feed, whitespace, or `-`, which mermaid.js
   * does not read; null when there is none. The note id follows it.
   */
  readonly textBeforeState: StateIgnoredText | null
  /**
   * The id of the state after `of`; null when it is empty, as before a
   * `%%`, which the note text then starts with.
   */
  readonly state: Identifier | null
  /** The text of the note; null when it is empty or all whitespace. */
  readonly text: StateLiteral | null
}

/**
 * ast/state.md, StateFloatingNoteStatement: `note "text" as N1`. It adds
 * nothing to the Db. Its child fields are `text` and `id`. The quotes are
 * `Punctuator` tokens in no field, one or more before and after the text.
 *
 * ```text
 * note "text" as N1
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StateFloatingNoteStatement extends NodeBase {
  readonly type: "StateFloatingNoteStatement"
  /** The text between the quotes; null when it is all whitespace. */
  readonly text: StateLiteral | null
  /** The text after `as`, up to the end of the line; null when it is empty. */
  readonly id: StateLiteral | null
}

/**
 * ast/state.md, StateClickStatement: `click A "url" "tooltip"`, and
 * `click A href "url"`. Its child fields are `reference`, `url`, and
 * `tooltip`.
 *
 * ```text
 * click A href "https://example.com"
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StateClickStatement extends NodeBase {
  readonly type: "StateClickStatement"
  /** The state. */
  readonly reference: StateReference
  /** The URL. */
  readonly url: StringLiteral
  /** The tooltip; null for a statement with `href`. */
  readonly tooltip: StringLiteral | null
}

/**
 * ast/state.md, StateClassDefStatement: a class definition. Its child
 * fields are `cssClass` and `styles`. An empty style between two `,` makes
 * no node.
 *
 * ```text
 * classDef bad fill:#f00,color:white
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StateClassDefStatement extends NodeBase {
  readonly type: "StateClassDefStatement"
  /** The CSS class after `classDef`. */
  readonly cssClass: Identifier
  /** The styles, separated by `,` units, in source order. */
  readonly styles: readonly StateLiteral[]
}

/**
 * ast/state.md, StateClassStatement: `class A,B cls`. Its child fields are
 * `states` and `cssClass`.
 *
 * ```text
 * class A,B bad
 * ^^^^^^^^^^^^^
 * ```
 */
export interface StateClassStatement extends NodeBase {
  readonly type: "StateClassStatement"
  /** The ids of the states, in source order. */
  readonly states: readonly Identifier[]
  /** The rest of the line, the CSS class; null when it is empty. */
  readonly cssClass: StateLiteral | null
}

/**
 * ast/state.md, StateStyleStatement: `style A,B fill:#f00`. Its child
 * fields are `states` and `styles`.
 *
 * ```text
 * style A,B fill:#f00
 * ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StateStyleStatement extends NodeBase {
  readonly type: "StateStyleStatement"
  /** The ids of the states, in source order; null for an empty item between `,`. */
  readonly states: readonly (Identifier | null)[]
  /** The styles, as in StateClassDefStatement. */
  readonly styles: readonly StateLiteral[]
}

/**
 * ast/state.md, StateDirectionStatement: the value of a direction line,
 * written in any case.
 *
 * - `"TB"`: Top to bottom.
 * - `"BT"`: Bottom to top.
 * - `"RL"`: Right to left.
 * - `"LR"`: Left to right.
 */
export type StateDirection =
  /** Top to bottom. */
  | "TB"
  /** Bottom to top. */
  | "BT"
  /** Right to left. */
  | "RL"
  /** Left to right. */
  | "LR"

/**
 * ast/state.md, StateDirectionStatement: a direction line. Its child fields
 * are `textBefore` and `textAfter`. The range covers the whole direction
 * line.
 *
 * ```text
 * direction LR
 * ^^^^^^^^^^^^
 * ```
 */
export interface StateDirectionStatement extends NodeBase {
  readonly type: "StateDirectionStatement"
  /** The text of the direction line before `direction`, or null when there is none. */
  readonly textBefore: StateIgnoredText | null
  /** The direction; see {@link StateDirection}. */
  readonly direction: StateDirection
  /** The text of the direction line after the value, or null when there is none. */
  readonly textAfter: StateIgnoredText | null
}

/**
 * ast/state.md, StateAccTitleStatement: an `accTitle:` statement. Its child
 * field is `value`.
 *
 * ```text
 * accTitle: The title
 * ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StateAccTitleStatement extends NodeBase {
  readonly type: "StateAccTitleStatement"
  /**
   * The text after `accTitle:`, up to the end of the line; null when there
   * is none. The whitespace after `:` is read with it, line breaks
   * included, so it is null only at the end of the text.
   */
  readonly value: StateLiteral | null
}

/**
 * ast/state.md, StateAccDescrStatement: an `accDescr:` statement. Its child
 * field is `value`.
 *
 * ```text
 * accDescr: The description
 * ^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StateAccDescrStatement extends NodeBase {
  readonly type: "StateAccDescrStatement"
  /**
   * The text after `accDescr:`, up to the end of the line; null when there
   * is none. The whitespace after `:` is read with it, line breaks
   * included, so it is null only at the end of the text.
   */
  readonly value: StateLiteral | null
}

/**
 * ast/state.md, StateAccDescrBlockStatement: an `accDescr {` statement with
 * its text and `}`, or with its text up to the end of the text when the
 * block is not closed. Its child field is `value`. A block that is not
 * closed sets the empty description, and a closed block without text, such
 * as an empty description block where a statement starts, changes nothing.
 *
 * ```text
 * accDescr {
 * ^^^^^^^^^^
 *   Two
 * ^^^^^
 * }
 * ^
 * ```
 */
export interface StateAccDescrBlockStatement extends NodeBase {
  readonly type: "StateAccDescrBlockStatement"
  /**
   * The text between `accDescr {` and `}`, or to the end of the text when
   * the block is not closed; null when there is none.
   */
  readonly value: StateLiteral | null
  /** Whether the block ends with `}`. It is false when the text ends inside the block. */
  readonly closed: boolean
}

/**
 * ast/state.md, StateScaleStatement: `scale 350 width`. It adds nothing to
 * the Db. Its child field is `width`.
 *
 * ```text
 * scale 350 width
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface StateScaleStatement extends NodeBase {
  readonly type: "StateScaleStatement"
  /** The number. */
  readonly width: NumericLiteral
}

/**
 * ast/state.md, StateHideEmptyDescriptionStatement: `hide empty
 * description`. No fields. It adds nothing to the Db.
 *
 * ```text
 * hide empty description
 * ^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StateHideEmptyDescriptionStatement extends NodeBase {
  readonly type: "StateHideEmptyDescriptionStatement"
}

/**
 * ast/state.md, StateIgnoredStatement: empty strings of the state context
 * that no name, no string, and no body follows, after `state` or after
 * another statement on the line. mermaid.js does not read them, and the
 * statement adds nothing to the Db. No child fields.
 *
 * ```text
 * state x ""
 *         ^^
 * ```
 */
export interface StateIgnoredStatement extends NodeBase {
  readonly type: "StateIgnoredStatement"
  /** The text of its range: the run of empty strings, with the whitespace between them. */
  readonly value: string
}

/**
 * ast/state.md, StateLiteral: a text without quotes that may contain
 * whitespace: a description, a label, an id after `as` or before a
 * pseudostate mark, a note text, a style, a CSS class of a `class`
 * statement, and an accessibility text. No child fields. The whitespace
 * around the text is outside the range, so the value neither starts nor
 * ends with whitespace.
 *
 * ```text
 * A : text
 *     ^^^^
 * ```
 */
export interface StateLiteral extends NodeBase {
  readonly type: "StateLiteral"
  /** The text of its range (ast.md, Nodes). */
  readonly value: string
}

/**
 * ast/state.md, StateIgnoredText: text that the author wrote and mermaid.js
 * does not read: the text before `direction` and after its value on a
 * direction line, the text from the second `:` after the id of an alias
 * definition, the `%%` text before the `{` of a body or before the id of
 * a note, and the empty strings of the state context in a field of a
 * composite or alias statement. No child fields.
 *
 * ```text
 * A : x direction LR
 * ^^^^^
 * ```
 */
export interface StateIgnoredText extends NodeBase {
  readonly type: "StateIgnoredText"
  /** The text of its range. */
  readonly value: string
}

/** Every node of ast/state.md. */
export type StateNode =
  | StateDiagram
  | StateStatement
  | StateReference
  | StateTerminal
  | StateLiteral
  | StateIgnoredText
