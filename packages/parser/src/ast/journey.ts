/**
 * The nodes of the journey tree, as defined in
 * `packages/spec/docs/ast/journey.md`, for the diagram type `journey`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source. A **task** is a step of the journey, with a description, a
 * score, and the people who take part in it; a **section** groups the tasks
 * after it.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. The
 * examples other than that of the diagram stand after the header line
 * `journey`.
 */
import type { NodeBase } from "../ast.ts"

/**
 * ast/journey.md, JourneyDiagram: the body of the diagram type `journey`.
 * Its child field is `body`. The header keyword is not a field; its token
 * is in `Root.tokens`. The range runs from the header keyword to the last
 * token of the diagram.
 *
 * ```text
 * journey
 * ^^^^^^^
 * Make tea: 5: Me
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface JourneyDiagram extends NodeBase {
  readonly type: "JourneyDiagram"
  /** The statements, in source order. */
  readonly body: readonly JourneyStatement[]
}

/** ast/journey.md, JourneyDiagram: a statement of a journey diagram. */
export type JourneyStatement =
  | JourneyTaskStatement
  | JourneyTitleStatement
  | JourneySectionStatement
  | JourneyAccTitleStatement
  | JourneyAccDescrStatement
  | JourneyAccDescrBlockStatement

/**
 * ast/journey.md, JourneyTaskStatement: a task, a description, a colon,
 * and data, whose colons divide it into a score part, a people part, and
 * the text that is not read. Its child fields are `description`, `score`,
 * `people`, and `textAfter`.
 *
 * ```text
 * Make tea: 5: Me, Cat
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface JourneyTaskStatement extends NodeBase {
  readonly type: "JourneyTaskStatement"
  /** The text before the colon, as written, the whitespace before the colon included. */
  readonly description: JourneyLiteral
  /** The score part of the data, without the whitespace at its ends; null when it is empty or whitespace only. */
  readonly score: JourneyLiteral | null
  /** The people of the data, in source order, each without the whitespace at its ends, and null for one that is empty or whitespace only; empty when the data has no second colon. */
  readonly people: readonly (JourneyLiteral | null)[]
  /** The text of the data from its third colon; null when the data has no third colon. */
  readonly textAfter: JourneyIgnoredText | null
}

/**
 * ast/journey.md, JourneyTitleStatement: a `title` statement. Its child
 * field is `value`.
 *
 * ```text
 * title My working day
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface JourneyTitleStatement extends NodeBase {
  readonly type: "JourneyTitleStatement"
  /** The text after `title` and one whitespace character, up to a `#`, a `;`, or a line feed. */
  readonly value: JourneyLiteral
}

/**
 * ast/journey.md, JourneySectionStatement: a `section` statement. Its child
 * field is `name`.
 *
 * ```text
 * section Go to work
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface JourneySectionStatement extends NodeBase {
  readonly type: "JourneySectionStatement"
  /** The text after `section` and one whitespace character, up to a `#`, a `:`, a `;`, or a line feed. */
  readonly name: JourneyLiteral
}

/**
 * ast/journey.md, JourneyAccTitleStatement: an `accTitle:` statement with
 * its text. Its child field is `value`.
 *
 * ```text
 * accTitle: A working day
 * ^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface JourneyAccTitleStatement extends NodeBase {
  readonly type: "JourneyAccTitleStatement"
  /** The text after `accTitle:`, up to the end of its line, without the whitespace at its ends. */
  readonly value: JourneyLiteral
}

/**
 * ast/journey.md, JourneyAccDescrStatement: an `accDescr:` statement with
 * its text. Its child field is `value`.
 *
 * ```text
 * accDescr: The steps of a working day
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface JourneyAccDescrStatement extends NodeBase {
  readonly type: "JourneyAccDescrStatement"
  /** The text after `accDescr:`, up to the end of its line, without the whitespace at its ends. */
  readonly value: JourneyLiteral
}

/**
 * ast/journey.md, JourneyAccDescrBlockStatement: an `accDescr { ... }`
 * statement with its text, or without text: an empty description block,
 * which changes nothing. Its child field is `value`.
 *
 * ```text
 * accDescr { The steps }
 * ^^^^^^^^^^^^^^^^^^^^^^
 *
 * accDescr {}
 * ^^^^^^^^^^^
 * ```
 */
export interface JourneyAccDescrBlockStatement extends NodeBase {
  readonly type: "JourneyAccDescrBlockStatement"
  /** The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace lies between them. */
  readonly value: JourneyLiteral | null
}

/**
 * ast/journey.md, JourneyLiteral: a text without quotes that may contain
 * whitespace: a task description, a score, a person, a title, a section
 * name, and an accessibility text. It has no child fields.
 *
 * ```text
 * title A journey
 *       ^^^^^^^^^
 * ```
 */
export interface JourneyLiteral extends NodeBase {
  readonly type: "JourneyLiteral"
  /** Its written text (ast.md, Nodes). */
  readonly value: string
}

/**
 * ast/journey.md, JourneyIgnoredText: text that the author writes but that
 * mermaid.js does not read, the text of task data from its third colon. It
 * has no child fields.
 *
 * ```text
 * A: 3: a,b: c, d
 *          ^^^^^^
 * ```
 */
export interface JourneyIgnoredText extends NodeBase {
  readonly type: "JourneyIgnoredText"
  /** Its written text (ast.md, Nodes). */
  readonly value: string
}

/** ast/journey.md: a node of the journey tree. */
export type JourneyNode =
  JourneyDiagram | JourneyStatement | JourneyLiteral | JourneyIgnoredText
