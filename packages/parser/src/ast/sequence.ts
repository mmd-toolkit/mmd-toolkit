/**
 * The nodes of the sequence tree, as defined in
 * `packages/spec/docs/ast/sequence.md`, for the diagram type `sequence`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source, which the Db normalization applies where it uses them.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. A node
 * that spans several lines has such a line under each of its lines. The
 * examples other than that of the diagram stand after the header line
 * `sequenceDiagram`.
 */
import type { Identifier, NodeBase, NumericLiteral } from "../ast.ts"

/**
 * ast/sequence.md, SequenceDiagram: the body of the diagram type
 * `sequence`. Its child field is `body`. The keyword `sequenceDiagram` is
 * not a field; its token is in `Root.tokens`. The range runs from the
 * keyword to the last token of the diagram.
 *
 * ```text
 * sequenceDiagram
 * ^^^^^^^^^^^^^^^
 * A->>B: hi
 * ^^^^^^^^^
 * ```
 */
export interface SequenceDiagram extends NodeBase {
  readonly type: "SequenceDiagram"
  /** The statements, in source order. */
  readonly body: readonly SequenceStatement[]
}

/** ast/sequence.md, SequenceDiagram: a statement of a sequence diagram. */
export type SequenceStatement =
  | SequenceParticipantStatement
  | SequenceDestroyStatement
  | SequenceBoxStatement
  | SequenceMessageStatement
  | SequenceAutonumberStatement
  | SequenceActivateStatement
  | SequenceDeactivateStatement
  | SequenceNoteStatement
  | SequenceLinksStatement
  | SequenceLinkStatement
  | SequencePropertiesStatement
  | SequenceDetailsStatement
  | SequenceTitleStatement
  | SequenceAccTitleStatement
  | SequenceAccDescrStatement
  | SequenceAccDescrBlockStatement
  | SequenceLoopStatement
  | SequenceRectStatement
  | SequenceOptStatement
  | SequenceBreakStatement
  | SequenceAltStatement
  | SequenceParStatement
  | SequenceParOverStatement
  | SequenceCriticalStatement
  | SequenceIgnoredStatement

/**
 * ast/sequence.md, SequenceParticipantStatement: the keyword of the
 * statement, in lower case, whatever its case in the source.
 *
 * - `"participant"`: `participant`, a participant.
 * - `"actor"`: `actor`, a participant that is an actor.
 */
export type SequenceParticipantKind =
  /** `participant`, a participant. */
  | "participant"
  /** `actor`, a participant that is an actor. */
  | "actor"

/**
 * ast/sequence.md, SequenceParticipantStatement: a `participant` or `actor`
 * statement. Its child fields are `id`, `data`, and `alias`. The range
 * starts at `create` when it is there.
 *
 * ```text
 * participant A as Alice
 * ^^^^^^^^^^^^^^^^^^^^^^
 *
 * create actor B
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceParticipantStatement extends NodeBase {
  readonly type: "SequenceParticipantStatement"
  /** The keyword of the statement; see {@link SequenceParticipantKind}. */
  readonly kind: SequenceParticipantKind
  /** Whether `create` comes before the keyword. */
  readonly created: boolean
  /** The id. */
  readonly id: Identifier
  /** The data block after the id; null when there is none. */
  readonly data: SequenceDataBlock | null
  /** The text after `as`, which mermaid.js reads as the description; null when there is none. */
  readonly alias: SequenceText | null
}

/**
 * ast/sequence.md, SequenceDestroyStatement: a `destroy` statement. Its
 * child field is `id`. The range starts at `create` when it is there; with
 * `created`, mermaid.js creates the participant instead of destroying it.
 *
 * ```text
 * destroy A
 * ^^^^^^^^^
 * ```
 */
export interface SequenceDestroyStatement extends NodeBase {
  readonly type: "SequenceDestroyStatement"
  /** Whether `create` comes before the keyword. */
  readonly created: boolean
  /** The id after `destroy`. */
  readonly id: Identifier
}

/**
 * ast/sequence.md, SequenceBoxStatement: a box of participants. Its child
 * fields are `text` and `body`.
 *
 * ```text
 * box aqua Team
 * ^^^^^^^^^^^^^
 * participant A
 * ^^^^^^^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface SequenceBoxStatement extends NodeBase {
  readonly type: "SequenceBoxStatement"
  /** The text after `box`; null when there is none. */
  readonly text: SequenceBoxText | null
  /** The statements up to `end`, in source order: participant statements and destroy statements. */
  readonly body: readonly SequenceStatement[]
}

/**
 * ast/sequence.md, SequenceBoxText: the text written after `box`, with the
 * two parts into which mermaid.js splits it before it asks the browser
 * whether the first part is a colour. Its child fields are
 * `colorCandidate` and `remainder`. It does not say whether the candidate
 * is a colour.
 *
 * ```text
 * box Purple Alice & John
 *     ^^^^^^^^^^^^^^^^^^^
 * end
 * ```
 */
export interface SequenceBoxText extends NodeBase {
  readonly type: "SequenceBoxText"
  /** The text of its range. */
  readonly value: string
  /** The part that mermaid.js asks about; null when the text starts with neither a word nor a colour function. */
  readonly colorCandidate: SequenceLiteral | null
  /** The rest of the text after the candidate; null when nothing but whitespace follows it. */
  readonly remainder: SequenceLiteral | null
}

/**
 * ast/sequence.md, SequenceMessageStatement: `+` or `-` written after the
 * arrow of a message (diagrams/sequence.md, Messages).
 *
 * - `"+"`: Activates the target.
 * - `"-"`: Deactivates the source.
 */
export type SequenceActivation =
  /** Activates the target. */
  | "+"
  /** Deactivates the source. */
  | "-"

/**
 * ast/sequence.md, SequenceMessageStatement: a message from one
 * participant to another. Its child fields are `from`, `arrow`, `to`, and
 * `text`.
 * The `:` is a token of the statement and belongs to no field.
 *
 * ```text
 * A->>+B: hi
 * ^^^^^^^^^^
 *
 * A()-->>B: x
 * ^^^^^^^^^^^
 * ```
 */
export interface SequenceMessageStatement extends NodeBase {
  readonly type: "SequenceMessageStatement"
  /** The id before the arrow. */
  readonly from: Identifier
  /** Whether `()` comes between the source and the arrow. */
  readonly fromCentralConnection: boolean
  /** The arrow. */
  readonly arrow: SequenceArrow
  /** The activation after the arrow; null when there is none, and when either central connection is true. See {@link SequenceActivation}. */
  readonly activation: SequenceActivation | null
  /** Whether `()` comes between the arrow and the target. */
  readonly toCentralConnection: boolean
  /** The id after the arrow. */
  readonly to: Identifier
  /** The text after `:`; null when nothing but whitespace follows the `:`. */
  readonly text: SequenceText | null
}

/**
 * ast/sequence.md, SequenceArrow: the marker at an end of the line of a
 * sequence arrow, at the source (`startMarker`) or at the target
 * (`endMarker`). Top and bottom name the side of the line on which half of
 * a head is drawn; at the start, the characters are written mirrored.
 *
 * - `"none"`: No marker; the line ends plain, as in `->` and `-->`, whose `>`
 *   is no marker.
 * - `"arrow"`: An arrowhead, `>>` at the target end and `<<` at the source
 *   end, as in `<<->>`.
 * - `"cross"`: A cross, `x` at the target end, as in `-x`.
 * - `"open-arrow"`: An open arrowhead, `)` at the target end, as in `-)`.
 * - `"half-arrow-top"`: Half of an arrowhead on the top side of the line,
 *   `|\` at the target end (`-|\`) and `/|` at the source end (`/|-`).
 * - `"half-arrow-bottom"`: Half of an arrowhead on the bottom side of the
 *   line, `|/` at the target end (`-|/`) and `\|` at the source end (`\|-`).
 * - `"half-stick-top"`: Half of a head drawn as a stick, on the top side of
 *   the line, `\\` at the target end (`-\\`) and `//` at the source end
 *   (`//-`).
 * - `"half-stick-bottom"`: Half of a head drawn as a stick, on the bottom side
 *   of the line, `//` at the target end (`-//`) and `\\` at the source end
 *   (`\\-`).
 */
export type SequenceArrowMarker =
  /** No marker; the line ends plain, as in `->` and `-->`, whose `>` is no marker. */
  | "none"
  /** An arrowhead, `>>` at the target end and `<<` at the source end, as in `<<->>`. */
  | "arrow"
  /** A cross, `x` at the target end, as in `-x`. */
  | "cross"
  /** An open arrowhead, `)` at the target end, as in `-)`. */
  | "open-arrow"
  /** Half of an arrowhead on the top side of the line, `|\` at the target end (`-|\`) and `/|` at the source end (`/|-`). */
  | "half-arrow-top"
  /** Half of an arrowhead on the bottom side of the line, `|/` at the target end (`-|/`) and `\|` at the source end (`\|-`). */
  | "half-arrow-bottom"
  /** Half of a head drawn as a stick, on the top side of the line, `\\` at the target end (`-\\`) and `//` at the source end (`//-`). */
  | "half-stick-top"
  /** Half of a head drawn as a stick, on the bottom side of the line, `//` at the target end (`-//`) and `\\` at the source end (`\\-`). */
  | "half-stick-bottom"

/**
 * ast/sequence.md, SequenceArrow: the line of a sequence arrow.
 *
 * - `"solid"`: `-`, as in `->>`.
 * - `"dotted"`: `--`, as in `-->>`.
 */
export type SequenceArrowLine =
  /** `-`, as in `->>`. */
  | "solid"
  /** `--`, as in `-->>`. */
  | "dotted"

/**
 * ast/sequence.md, SequenceArrow: the arrow of a message. No child fields;
 * its range is its token.
 *
 * ```text
 * A-->>B: hi
 *  ^^^^
 * ```
 */
export interface SequenceArrow extends NodeBase {
  readonly type: "SequenceArrow"
  /** The text of its range. */
  readonly value: string
  /** The marker at the end of the line at the source; see {@link SequenceArrowMarker}. */
  readonly startMarker: SequenceArrowMarker
  /** The line between the markers; see {@link SequenceArrowLine}. */
  readonly line: SequenceArrowLine
  /** The marker at the end of the line at the target; see {@link SequenceArrowMarker}. */
  readonly endMarker: SequenceArrowMarker
}

/**
 * ast/sequence.md, SequenceAutonumberStatement. Its child fields are
 * `start` and `step`. When `off` is true, both numbers are null.
 *
 * ```text
 * autonumber 10 5
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceAutonumberStatement extends NodeBase {
  readonly type: "SequenceAutonumberStatement"
  /** The first number; null when there is none. */
  readonly start: NumericLiteral | null
  /** The second number; null when there is none. */
  readonly step: NumericLiteral | null
  /** Whether the statement is `autonumber off`. */
  readonly off: boolean
}

/**
 * ast/sequence.md, SequenceActivateStatement. Its child field is `id`.
 *
 * ```text
 * activate A
 * ^^^^^^^^^^
 * ```
 */
export interface SequenceActivateStatement extends NodeBase {
  readonly type: "SequenceActivateStatement"
  /** The id of the participant it activates. */
  readonly id: Identifier
}

/**
 * ast/sequence.md, SequenceDeactivateStatement. Its child field is `id`.
 *
 * ```text
 * activate A
 * deactivate A
 * ^^^^^^^^^^^^
 * ```
 */
export interface SequenceDeactivateStatement extends NodeBase {
  readonly type: "SequenceDeactivateStatement"
  /** The id of the participant it deactivates. */
  readonly id: Identifier
}

/**
 * ast/sequence.md, SequenceNoteStatement: where the note is, in lower case
 * with one space, whatever its case and spacing in the source.
 *
 * - `"left of"`: `left of`, to the left of one participant.
 * - `"right of"`: `right of`, to the right of one participant.
 * - `"over"`: `over`, over one participant, or over two written with `,`.
 */
export type SequenceNotePlacement =
  /** `left of`, to the left of one participant. */
  | "left of"
  /** `right of`, to the right of one participant. */
  | "right of"
  /** `over`, over one participant, or over two written with `,`. */
  | "over"

/**
 * ast/sequence.md, SequenceNoteStatement. Its child fields are `ids` and
 * `text`.
 *
 * ```text
 * note over A,B: hi
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceNoteStatement extends NodeBase {
  readonly type: "SequenceNoteStatement"
  /** Where the note is; see {@link SequenceNotePlacement}. */
  readonly placement: SequenceNotePlacement
  /** The id, or the two ids of `over` with a `,`. */
  readonly ids: readonly Identifier[]
  /** The text after `:`; null when nothing but whitespace follows the `:`. */
  readonly text: SequenceText | null
}

/**
 * ast/sequence.md, SequenceLinksStatement: a `links` statement, whose text
 * is JSON, which the tree does not read. Its child fields are `id` and
 * `text`.
 *
 * ```text
 * links A: {"x": "https://x"}
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceLinksStatement extends NodeBase {
  readonly type: "SequenceLinksStatement"
  /** The id of the participant. */
  readonly id: Identifier
  /** The text after `:`; null when nothing but whitespace follows the `:`. */
  readonly text: SequenceText | null
}

/**
 * ast/sequence.md, SequenceLinkStatement: a `link` statement, whose text is
 * a label, `@`, and a URL. Its child fields are `id` and `text`.
 *
 * ```text
 * link A: Docs @ https://x
 * ^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceLinkStatement extends NodeBase {
  readonly type: "SequenceLinkStatement"
  /** The id of the participant. */
  readonly id: Identifier
  /** The text after `:`; null when nothing but whitespace follows the `:`. */
  readonly text: SequenceText | null
}

/**
 * ast/sequence.md, SequencePropertiesStatement: a `properties` statement,
 * whose text is JSON, which the tree does not read. Its child fields are
 * `id` and `text`.
 *
 * ```text
 * properties A: {"x": "y"}
 * ^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface SequencePropertiesStatement extends NodeBase {
  readonly type: "SequencePropertiesStatement"
  /** The id of the participant. */
  readonly id: Identifier
  /** The text after `:`; null when nothing but whitespace follows the `:`. */
  readonly text: SequenceText | null
}

/**
 * ast/sequence.md, SequenceDetailsStatement: a `details` statement, whose
 * text is the id of an element of the page. Its child fields are `id` and
 * `text`.
 *
 * ```text
 * details A: info
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceDetailsStatement extends NodeBase {
  readonly type: "SequenceDetailsStatement"
  /** The id of the participant. */
  readonly id: Identifier
  /** The text after `:`; null when nothing but whitespace follows the `:`. */
  readonly text: SequenceText | null
}

/**
 * ast/sequence.md, SequenceTitleStatement. Its child field is `value`. The
 * title of the Db keeps the whitespace written around the value, which the
 * Db normalization reads from the source.
 *
 * ```text
 * title Greetings
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceTitleStatement extends NodeBase {
  readonly type: "SequenceTitleStatement"
  /** The text after `title` or `title:`; null when it is all whitespace. */
  readonly value: SequenceLiteral | null
}

/**
 * ast/sequence.md, SequenceAccTitleStatement: as
 * FlowchartAccTitleStatement. Its child field is `value`.
 *
 * ```text
 * accTitle: Greetings
 * ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceAccTitleStatement extends NodeBase {
  readonly type: "SequenceAccTitleStatement"
  /** The text after `accTitle:`, whose value is a string; null when there is none. */
  readonly value: SequenceLiteral | null
}

/**
 * ast/sequence.md, SequenceAccDescrStatement: as
 * FlowchartAccDescrStatement. Its child field is `value`.
 *
 * ```text
 * accDescr: Two people greet
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceAccDescrStatement extends NodeBase {
  readonly type: "SequenceAccDescrStatement"
  /** The text after `accDescr:`, whose value is a string; null when there is none. */
  readonly value: SequenceLiteral | null
}

/**
 * ast/sequence.md, SequenceAccDescrBlockStatement: as
 * FlowchartAccDescrBlockStatement. Its child field is `value`. An empty
 * description block where a statement starts has the `value` null and
 * `closed` true.
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
export interface SequenceAccDescrBlockStatement extends NodeBase {
  readonly type: "SequenceAccDescrBlockStatement"
  /**
   * The text between `accDescr {` and `}`, or to the end of the text when
   * the block is not closed, whose value is a string; null when there is
   * none.
   */
  readonly value: SequenceLiteral | null
  /** Whether the block ends with `}`. It is false when the text ends inside the block. */
  readonly closed: boolean
}

/**
 * ast/sequence.md, SequenceLoopStatement. Its child fields are `text` and
 * `body`.
 *
 * ```text
 * loop Every minute
 * ^^^^^^^^^^^^^^^^^
 * A->>B: ping
 * ^^^^^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface SequenceLoopStatement extends NodeBase {
  readonly type: "SequenceLoopStatement"
  /** The text after the keyword; null when there is none. */
  readonly text: SequenceText | null
  /** The statements up to `end`, in source order. */
  readonly body: readonly SequenceStatement[]
}

/**
 * ast/sequence.md, SequenceOptStatement. Its child fields are `text` and
 * `body`.
 *
 * ```text
 * opt Extra
 * ^^^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface SequenceOptStatement extends NodeBase {
  readonly type: "SequenceOptStatement"
  /** The text after the keyword; null when there is none. */
  readonly text: SequenceText | null
  /** The statements up to `end`, in source order. */
  readonly body: readonly SequenceStatement[]
}

/**
 * ast/sequence.md, SequenceBreakStatement. Its child fields are `text` and
 * `body`.
 *
 * ```text
 * break On error
 * ^^^^^^^^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface SequenceBreakStatement extends NodeBase {
  readonly type: "SequenceBreakStatement"
  /** The text after the keyword; null when there is none. */
  readonly text: SequenceText | null
  /** The statements up to `end`, in source order. */
  readonly body: readonly SequenceStatement[]
}

/**
 * ast/sequence.md, SequenceRectStatement. Its child fields are `color` and
 * `body`.
 *
 * ```text
 * rect rgb(0, 0, 255)
 * ^^^^^^^^^^^^^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface SequenceRectStatement extends NodeBase {
  readonly type: "SequenceRectStatement"
  /** The text after `rect`, which the renderer uses as the fill colour; null when there is none. */
  readonly color: SequenceText | null
  /** The statements up to `end`, in source order. */
  readonly body: readonly SequenceStatement[]
}

/**
 * ast/sequence.md, SequenceAltStatement: `alt` with its `else` sections.
 * Its child field is `sections`; the first one is the block's own.
 *
 * ```text
 * alt Yes
 * ^^^^^^^
 * else No
 * ^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface SequenceAltStatement extends NodeBase {
  readonly type: "SequenceAltStatement"
  /** The sections, in source order; the first one is the block's own. */
  readonly sections: readonly SequenceSection[]
}

/**
 * ast/sequence.md, SequenceParStatement: `par` with its `and` sections. Its
 * child field is `sections`.
 *
 * ```text
 * par One
 * ^^^^^^^
 * and Two
 * ^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface SequenceParStatement extends NodeBase {
  readonly type: "SequenceParStatement"
  /** The sections, in source order; the first one is the block's own. */
  readonly sections: readonly SequenceSection[]
}

/**
 * ast/sequence.md, SequenceParOverStatement: `par_over` with its `and`
 * sections. Its child field is `sections`.
 *
 * ```text
 * par_over One
 * ^^^^^^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface SequenceParOverStatement extends NodeBase {
  readonly type: "SequenceParOverStatement"
  /** The sections, in source order; the first one is the block's own. */
  readonly sections: readonly SequenceSection[]
}

/**
 * ast/sequence.md, SequenceCriticalStatement: `critical` with its `option`
 * sections. Its child field is `sections`.
 *
 * ```text
 * critical Connect
 * ^^^^^^^^^^^^^^^^
 * option Timeout
 * ^^^^^^^^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface SequenceCriticalStatement extends NodeBase {
  readonly type: "SequenceCriticalStatement"
  /** The sections, in source order; the first one is the block's own. */
  readonly sections: readonly SequenceSection[]
}

/**
 * ast/sequence.md, SequenceSection: a text and the statements after it.
 * Its child fields are `text` and `body`. The range starts at the keyword
 * that starts the section, or, for the first section, the keyword of the
 * block, and ends at its last token; `end` belongs to the block.
 *
 * ```text
 * alt Yes
 * ^^^^^^^
 * A->>B: ok
 * ^^^^^^^^^
 * else No
 * end
 * ```
 */
export interface SequenceSection extends NodeBase {
  readonly type: "SequenceSection"
  /** The text after the keyword that starts the section; null when there is none. */
  readonly text: SequenceText | null
  /** The statements up to the next section or to `end`, in source order. */
  readonly body: readonly SequenceStatement[]
}

/**
 * ast/sequence.md, SequenceIgnoredStatement: a line that mermaid.js reads
 * as one `invalid` unit and ignores, such as `)` alone. No child fields.
 *
 * ```text
 * )
 * ^
 * ```
 */
export interface SequenceIgnoredStatement extends NodeBase {
  readonly type: "SequenceIgnoredStatement"
  /** The text of its range: the one character. */
  readonly value: string
}

/**
 * ast/sequence.md, SequenceText: the wrap prefix of a text, with or without
 * the `:` before it.
 *
 * - `"wrap"`: `wrap:`, the text is wrapped.
 * - `"nowrap"`: `nowrap:`, the text is not wrapped.
 */
export type SequenceWrap =
  /** `wrap:`, the text is wrapped. */
  | "wrap"
  /** `nowrap:`, the text is not wrapped. */
  | "nowrap"

/**
 * ast/sequence.md, SequenceText: a text part, a text with an optional wrap
 * prefix. Its child field is `value`. The range runs from the prefix, or
 * from the text when there is no prefix, to the end of the text.
 *
 * ```text
 * A->>B: wrap:long text
 *        ^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceText extends NodeBase {
  readonly type: "SequenceText"
  /** The wrap prefix; null when there is none. See {@link SequenceWrap}. */
  readonly wrap: SequenceWrap | null
  /** The text after the prefix; null when there is none. */
  readonly value: SequenceLiteral | null
}

/**
 * ast/sequence.md, SequenceLiteral: a text without quotes at a position
 * where the grammar allows whitespace in it and decides where it ends. No
 * child fields. Its value has no whitespace at its ends.
 *
 * ```text
 * A->>B: hello there
 *        ^^^^^^^^^^^
 * ```
 */
export interface SequenceLiteral extends NodeBase {
  readonly type: "SequenceLiteral"
  /** The text of its range. */
  readonly value: string
}

/**
 * ast/sequence.md, SequenceDataBlock: the data block after the id of a
 * participant, whose content the tree does not read. No child fields. Its
 * range runs from `@{` to `}`.
 *
 * ```text
 * participant A@{ "type": "queue" }
 *              ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface SequenceDataBlock extends NodeBase {
  readonly type: "SequenceDataBlock"
  /** The text between `@{` and `}`, as written, whitespace included. */
  readonly value: string
}

/** ast/sequence.md, Nodes: every node type of the sequence diagram. */
export type SequenceNode =
  | SequenceDiagram
  | SequenceParticipantStatement
  | SequenceDestroyStatement
  | SequenceBoxStatement
  | SequenceBoxText
  | SequenceMessageStatement
  | SequenceArrow
  | SequenceAutonumberStatement
  | SequenceActivateStatement
  | SequenceDeactivateStatement
  | SequenceNoteStatement
  | SequenceLinksStatement
  | SequenceLinkStatement
  | SequencePropertiesStatement
  | SequenceDetailsStatement
  | SequenceTitleStatement
  | SequenceAccTitleStatement
  | SequenceAccDescrStatement
  | SequenceAccDescrBlockStatement
  | SequenceLoopStatement
  | SequenceRectStatement
  | SequenceOptStatement
  | SequenceBreakStatement
  | SequenceAltStatement
  | SequenceParStatement
  | SequenceParOverStatement
  | SequenceCriticalStatement
  | SequenceSection
  | SequenceIgnoredStatement
  | SequenceText
  | SequenceLiteral
  | SequenceDataBlock
