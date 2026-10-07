# Sequence nodes

Japanese version: [sequence.ja.md](./sequence.ja.md)

This document defines the nodes of the tree for the diagram type `sequence`. The
shared parts of the tree are defined in [ast.md](../ast.md); how the source is
read, and which grammar rule makes which node, is defined in
[diagrams/sequence.md](../diagrams/sequence.md).

The body of this diagram type is a [SequenceDiagram](#sequencediagram). The
values of the fields keep what the author wrote, as [ast.md](../ast.md#nodes)
defines the written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). A value starts or ends with
whitespace only where its units hold it as their own characters, as mermaid.js
reads it (see [Nodes](../ast.md#nodes)): in this diagram type, the whitespace of
a title, and a U+2028 or U+2029 in a box text (see
[SequenceTitleStatement](#sequencetitlestatement) and
[SequenceBoxText](#sequenceboxtext)). Elsewhere, the whitespace at the ends of a
value is outside it.

A **participant** is one of the lifelines of the diagram, named by an id.
mermaid.js calls it an actor; this document keeps the word actor for the
participants that the keyword `actor` declares.

## Nodes

### SequenceDiagram

| Field  | Type                      | Meaning                          |
| ------ | ------------------------- | -------------------------------- |
| `body` | list of SequenceStatement | The statements, in source order. |

Child fields: `body`. The keyword `sequenceDiagram` is not a field.

**SequenceStatement** is a SequenceParticipantStatement,
SequenceDestroyStatement, SequenceBoxStatement, SequenceMessageStatement,
SequenceAutonumberStatement, SequenceActivateStatement,
SequenceDeactivateStatement, SequenceNoteStatement, SequenceLinksStatement,
SequenceLinkStatement, SequencePropertiesStatement, SequenceDetailsStatement,
SequenceTitleStatement, SequenceAccTitleStatement, SequenceAccDescrStatement,
SequenceAccDescrBlockStatement, SequenceLoopStatement, SequenceRectStatement,
SequenceOptStatement, SequenceBreakStatement, SequenceAltStatement,
SequenceParStatement, SequenceParOverStatement, SequenceCriticalStatement, or
SequenceIgnoredStatement.

A line break or a `;` that ends a statement belongs to no statement, and an
empty line makes no node. The child fields of every node below are in source
order (see [Nodes](../ast.md#nodes)).

### SequenceParticipantStatement

A `participant` or `actor` statement.

| Field     | Type                      | Meaning                                                                                  |
| --------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| `kind`    | string                    | `participant` or `actor`: the keyword, in lower case.                                    |
| `created` | boolean                   | Whether `create` comes before the keyword.                                               |
| `id`      | SequenceIdentifier        | The id.                                                                                  |
| `data`    | SequenceDataBlock or null | The data block after the id; null when there is none.                                    |
| `alias`   | SequenceText or null      | The text after `as`, which mermaid.js reads as the description; null when there is none. |

Child fields: `id`, `data`, `alias`.

### SequenceDestroyStatement

A `destroy` statement.

| Field     | Type               | Meaning                                    |
| --------- | ------------------ | ------------------------------------------ |
| `created` | boolean            | Whether `create` comes before the keyword. |
| `id`      | SequenceIdentifier | The id after `destroy`.                    |

Child fields: `id`.

### SequenceBoxStatement

| Field  | Type                      | Meaning                                                                                                                                 |
| ------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `text` | SequenceBoxText or null   | The text after `box`; null when there is none.                                                                                          |
| `body` | list of SequenceStatement | The statements up to `end`, in source order: participant statements, destroy statements, and description block statements without text. |

Child fields: `text`, `body`.

### SequenceBoxText

The text written after `box`, a `box-text` of the grammar. mermaid.js reads a
colour and a name from it, and which part is the colour depends on a question
that it asks the browser. The node therefore holds the text as a whole and the
two parts into which the lexer divides it, as mermaid.js does before it asks; it
does not say whether the first part is a colour.

| Field            | Type                    | Meaning                                                                                   |
| ---------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| `value`          | string                  | Its written text: the whole text, the whitespace between its two parts included.          |
| `colorCandidate` | SequenceLiteral or null | The `color-candidate` unit, the part that mermaid.js asks about; null when there is none. |
| `remainder`      | SequenceLiteral or null | The `text` unit after the candidate; null when there is none.                             |

Child fields: `colorCandidate`, `remainder`. Each part is a unit of its own (see
[The line context](../diagrams/sequence.md#the-line-context)). mermaid.js reads
every U+2028 and U+2029 of the text, which change how it splits the text, and
trims the other whitespace at the ends of the parts. So in a box text, U+2028
and U+2029 count as characters that are not whitespace: the written text of each
SequenceLiteral is its unit without the other whitespace at its ends, and the
box text ends where its last part ends; the whitespace between the two parts is
in the value of the box text and in neither part. [fixture:
sequence/tokens-box-text-space-between-parts] [fixture:
sequence/tokens-box-text-directive-then-space-before-remainder] `box red-team`
followed by U+2028 has the remainder `-team` and U+2028, and with a space before
and after the U+2028, the remainder `-team`, a space, and U+2028, the space
after it outside; `box aqua`, two spaces, and U+2028 has the remainder U+2028
alone, a value of whitespace only; and `box red-team` followed by two spaces has
the remainder `-team`. [fixture: sequence/db-box-line-separator-at-end]
[fixture: sequence/db-box-spaces-around-line-separator-at-end] [fixture:
sequence/db-box-colour-then-spaces-and-line-separator] [fixture:
sequence/tokens-box-text-trailing-spaces] In `box Gr%%{init: {}}%%oup`, the
candidate is `Group`, and in `box red%%{init: {}}%%-team`, as in `box red-team`,
the candidate is `red` and the remainder `-team`. [fixture:
sequence/tokens-box-text-directive-between-parts-without-space] [fixture:
sequence/tokens-box-text-directive-in-candidate] [fixture:
sequence/tokens-box-text-directive-in-remainder] In `box Purple Alice & John`,
the candidate is `Purple` and the remainder `Alice & John`; in
`box rgb(34, 56, 0) Group1`, the candidate is `rgb(34, 56, 0)` and the remainder
`Group1`; in `box red-team`, the candidate is `red` and the remainder `-team`;
in `box RGB(0, 0, 255) Team`, the candidate is `RGB`; and in `box -x`, there is
no candidate, and the remainder is `-x`. [fixture:
sequence/docs-syntax-sequence-diagram-93d3c0ff] [fixture:
sequence/spec-sequence-diagram-97d37793] [fixture:
sequence/db-box-colour-candidate-word-prefix] [fixture:
sequence/db-box-colour-function-upper-case] [fixture:
sequence/db-box-no-colour-candidate]

### SequenceMessageStatement

| Field                   | Type                 | Meaning                                                               |
| ----------------------- | -------------------- | --------------------------------------------------------------------- |
| `from`                  | SequenceIdentifier   | The id before the arrow.                                              |
| `fromCentralConnection` | boolean              | Whether `()` comes between the source and the arrow.                  |
| `arrow`                 | SequenceArrow        | The arrow.                                                            |
| `activation`            | string or null       | `+` or `-` after the arrow; null when there is none.                  |
| `toCentralConnection`   | boolean              | Whether `()` comes between the arrow and the target.                  |
| `to`                    | SequenceIdentifier   | The id after the arrow.                                               |
| `text`                  | SequenceText or null | The text after `:`; null when nothing but whitespace follows the `:`. |

Child fields: `from`, `arrow`, `to`, `text`. `activation` is null when either
central connection is true. The `:` is a unit of the statement and belongs to no
field.

### SequenceArrow

The arrow of a message.

| Field         | Type   | Meaning                                                      |
| ------------- | ------ | ------------------------------------------------------------ |
| `value`       | string | Its written text.                                            |
| `startMarker` | string | The marker at the end of the source: one of the words below. |
| `line`        | string | `solid` for `-`, `dotted` for `--`.                          |
| `endMarker`   | string | The marker at the end of the target: one of the words below. |

No child fields. An arrow is written as an optional start marker, the line, `-`
or `--`, and then its end marker; with no end marker, a `>` follows the line
(`->`, `-->`), except after a half marker at the start, where nothing follows
(`/|-`). Each of the 26 arrows has its own combination of these fields. The
markers are:

- `none`: no marker;
- `arrow`: `>>` at the end, `<<` at the start;
- `cross`: `x` at the end;
- `open-arrow`: `)` at the end;
- `half-arrow-top` and `half-arrow-bottom`: `|\` and `|/` at the end, `/|` and
  `\|` at the start;
- `half-stick-top` and `half-stick-bottom`: `\\` and `//` at the end, `//` and
  `\\` at the start.

Top and bottom name the side of the line on which half of a head is drawn; at
the start, the characters are written mirrored, so `//` is `half-stick-bottom`
at the end and `half-stick-top` at the start. So `->` and `-->` have no marker,
`->>`, `-x`, and `-)` the end markers `arrow`, `cross`, and `open-arrow`,
`<<->>` the start and end marker `arrow`, `-|\` the end marker `half-arrow-top`,
and `/|-` the start marker `half-arrow-top`; the same with `--` in place of `-`
have the line `dotted`. [fixture: sequence/db-arrow-types]

### SequenceAutonumberStatement

| Field   | Type                   | Meaning                                     |
| ------- | ---------------------- | ------------------------------------------- |
| `start` | NumericLiteral or null | The first number; null when there is none.  |
| `step`  | NumericLiteral or null | The second number; null when there is none. |
| `off`   | boolean                | Whether the statement is `autonumber off`.  |

Child fields: `start`, `step`. A number may have a fraction, as `1.5`. When
`off` is true, both numbers are null.

### SequenceActivateStatement and SequenceDeactivateStatement

| Field | Type               | Meaning                                                |
| ----- | ------------------ | ------------------------------------------------------ |
| `id`  | SequenceIdentifier | The id of the participant it activates or deactivates. |

Child fields: `id`.

### SequenceNoteStatement

| Field       | Type                       | Meaning                                                               |
| ----------- | -------------------------- | --------------------------------------------------------------------- |
| `placement` | string                     | `left of`, `right of`, or `over`, in lower case with one space.       |
| `ids`       | list of SequenceIdentifier | The id, or the two ids of `over` with a `,`.                          |
| `text`      | SequenceText or null       | The text after `:`; null when nothing but whitespace follows the `:`. |

Child fields: `ids`, `text`.

### SequenceLinksStatement, SequenceLinkStatement, SequencePropertiesStatement, and SequenceDetailsStatement

| Field  | Type                 | Meaning                                                               |
| ------ | -------------------- | --------------------------------------------------------------------- |
| `id`   | SequenceIdentifier   | The id of the participant.                                            |
| `text` | SequenceText or null | The text after `:`; null when nothing but whitespace follows the `:`. |

Child fields: `id`, `text`. The text of `links` and `properties` is JSON, which
the tree does not read; the text of `link` is a label, `@`, and a URL; the text
of `details` is the id of an element of the page.

### SequenceTitleStatement

| Field   | Type            | Meaning                                                                                                      |
| ------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| `value` | SequenceLiteral | The `title-text` unit: the text after `title` or `title:` and one whitespace character, whitespace included. |

Child fields: `value`. mermaid.js keeps the title as it is written, whitespace
included, so the value is the written text of the whole `title-text` unit:
`title`, two spaces, `x`, and two spaces has the value of a space, `x`, and two
spaces; `title` followed by four spaces the value of three spaces; and `title`,
a line break, two spaces, and `A->>B: x` the value of the two spaces and
`A->>B: x`. [fixture: sequence/db-title-spaces] [fixture:
sequence/db-title-whitespace-only] [fixture:
sequence/db-title-next-line-indented]

### SequenceAccTitleStatement

An `accTitle:` statement with its text.

| Field   | Type                    | Meaning                                                                         |
| ------- | ----------------------- | ------------------------------------------------------------------------------- |
| `value` | SequenceLiteral or null | The text after `accTitle:`, up to the end of the line; null when there is none. |

Child fields: `value`. The whitespace after `:` is read with it, line breaks
included, so the value is null only at the end of the text. `#` and `;` are
characters of the text. [fixture: sequence/lex-acc-title-line-feed] [fixture:
sequence/lex-acc-title-at-end] [fixture: sequence/lex-acc-title-hash]

### SequenceAccDescrStatement

An `accDescr:` statement with its text.

| Field   | Type                    | Meaning                                                                         |
| ------- | ----------------------- | ------------------------------------------------------------------------------- |
| `value` | SequenceLiteral or null | The text after `accDescr:`, up to the end of the line; null when there is none. |

Child fields: `value`. The whitespace after `:` is read with it, line breaks
included, so the value is null only at the end of the text. [fixture:
sequence/db-acc-descr-empty-replaces]

### SequenceAccDescrBlockStatement

An `accDescr {` statement with its text and its `}`, which it lacks when the
text ends inside it.

| Field    | Type                    | Meaning                                                                                                                 |
| -------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `value`  | SequenceLiteral or null | The text between `accDescr {` and `}`, or to the end of the text when the block is not closed; null when there is none. |
| `closed` | boolean                 | Whether the block ends with `}`. It is false when the text ends inside the block.                                       |

Child fields: `value`. The value of `accDescr { x` at the end of the text is
`x`. [fixture: sequence/db-acc-descr-block-unclosed] `accDescr {` at the end of
the text has the value null and is not closed. [fixture:
sequence/lex-acc-descr-block-unclosed-empty] `accDescr {  }` is a closed block
without text, whose value is null: the whitespace after `{` is read with the
`{`. Such a block, an empty description block, is a statement where a statement
starts, also in the body of a box, and after the last unit of a statement,
before its `newline`, and right after the keyword `sequenceDiagram`, where a
statement starts, it is the first statement of the diagram's `body` (see
[sequence.md](../diagrams/sequence.md#empty-description-blocks-before-a-separator));
elsewhere the input is rejected (see
[sequence.md](../diagrams/sequence.md#known-divergences)). [fixture:
sequence/db-acc-descr-spaces-block-keeps] [fixture:
sequence/gram-acc-descr-block-empty-then-statement] [fixture:
sequence/gram-box-empty-description-block-line] [fixture:
sequence/header-empty-description-block]

### SequenceLoopStatement, SequenceOptStatement, and SequenceBreakStatement

| Field  | Type                      | Meaning                                              |
| ------ | ------------------------- | ---------------------------------------------------- |
| `text` | SequenceText or null      | The text after the keyword; null when there is none. |
| `body` | list of SequenceStatement | The statements up to `end`, in source order.         |

Child fields: `text`, `body`.

### SequenceRectStatement

| Field   | Type                      | Meaning                                                                                     |
| ------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| `color` | SequenceText or null      | The text after `rect`, which the renderer uses as the fill colour; null when there is none. |
| `body`  | list of SequenceStatement | The statements up to `end`, in source order.                                                |

Child fields: `color`, `body`.

### SequenceAltStatement, SequenceParStatement, SequenceParOverStatement, and SequenceCriticalStatement

A block of sections: `alt` with `else`, `par` and `par_over` with `and`, and
`critical` with `option`.

| Field      | Type                    | Meaning                                                          |
| ---------- | ----------------------- | ---------------------------------------------------------------- |
| `sections` | list of SequenceSection | The sections, in source order; the first one is the block's own. |

Child fields: `sections`. Every section has the same form, a text and the
statements after it, so the first one, after the block's keyword, is a section
like those after `else`, `and`, or `option`.

### SequenceSection

| Field  | Type                      | Meaning                                                                      |
| ------ | ------------------------- | ---------------------------------------------------------------------------- |
| `text` | SequenceText or null      | The text after the keyword that starts the section; null when there is none. |
| `body` | list of SequenceStatement | The statements up to the next section or to `end`, in source order.          |

Child fields: `text`, `body`.

### SequenceIgnoredStatement

A line that mermaid.js reads as one `invalid` unit and ignores, such as `)` or
`/` alone (see [Grammar](../diagrams/sequence.md#grammar)).

| Field   | Type   | Meaning                                                              |
| ------- | ------ | -------------------------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)): the one character. |

No child fields.

### SequenceIdentifier

The id of a participant: a name that may contain whitespace (see
[Id runs](../diagrams/sequence.md#id-runs) and
[The id context](../diagrams/sequence.md#the-id-context)).

| Field  | Type   | Meaning                                           |
| ------ | ------ | ------------------------------------------------- |
| `name` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields. An id is one unit. Its name has no whitespace at its ends, and
whitespace inside it is part of it, also next to a directive inside the unit.

`participant A B` has the participant `A B`, and
`participant A%%{init: {}}%% c%%B` the participant `A c%%B`. [fixture:
sequence/lex-id-context-space] [fixture:
sequence/lex-directive-in-id-before-space]

### SequenceText

A text part (see [Text parts](../diagrams/sequence.md#text-parts)): a text with
an optional wrap prefix.

| Field   | Type                    | Meaning                                                                                                                 |
| ------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `wrap`  | string or null          | `wrap` for the prefix `wrap:`, `nowrap` for `nowrap:`, with or without the `:` before it; null when there is no prefix. |
| `value` | SequenceLiteral or null | The text after the prefix; null when there is none.                                                                     |

Child fields: `value`. A text part with neither a prefix nor a text makes no
node: the field that would hold it is null.

### SequenceLiteral

A text without quotes that the author writes at a position where the grammar
allows whitespace in it and decides where it ends.

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields. Its value has whitespace at its ends only where mermaid.js
reads it: in a title, and in the parts of a box text, where a U+2028 or U+2029
counts as no whitespace (see [SequenceTitleStatement](#sequencetitlestatement)
and [SequenceBoxText](#sequenceboxtext)).

### SequenceDataBlock

| Field   | Type   | Meaning                                                         |
| ------- | ------ | --------------------------------------------------------------- |
| `value` | string | The text between `@{` and `}`, as written, whitespace included. |

No child fields. The tree does not read the content (see
[embedded-data-opaque](../known-divergences/embedded-data-opaque.md)).
