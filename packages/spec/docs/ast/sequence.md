# Sequence nodes

Japanese version: [sequence.ja.md](./sequence.ja.md)

This document defines the nodes and tokens of the tree for the diagram type
`sequence`. The shared parts of the tree are defined in [ast.md](../ast.md); how
the source is read, and which grammar rule makes which node, is defined in
[diagrams/sequence.md](../diagrams/sequence.md).

The body of this diagram type is a [SequenceDiagram](#sequencediagram). The
values of the fields keep what the author wrote, as [ast.md](../ast.md#nodes)
defines the text of a range; they are not in the converted form of
[common.md](../common.md#reading-a-source), which the Db normalization of
[diagrams/sequence.md](../diagrams/sequence.md#building-the-summary-from-the-tree)
applies where it uses them. Whitespace outside the range of a node is not part
of its value; it matters to the Db in one place, the title, where the Db
normalization reads it from the source.

A **participant** is one of the lifelines of the diagram, named by an id. It is
called an actor in the Db of mermaid.js; this document keeps the word actor for
the participants that the keyword `actor` declares.

## Nodes

### SequenceDiagram

| Field  | Type                      | Meaning                          |
| ------ | ------------------------- | -------------------------------- |
| `body` | list of SequenceStatement | The statements, in source order. |

Child fields: `body`. The keyword `sequenceDiagram` is not a field. The range
runs from the keyword to the last token of the diagram.

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
| `id`      | Identifier                | The id.                                                                                  |
| `data`    | SequenceDataBlock or null | The data block after the id; null when there is none.                                    |
| `alias`   | SequenceText or null      | The text after `as`, which mermaid.js reads as the description; null when there is none. |

Child fields: `id`, `data`, `alias`. The range starts at `create` when it is
there.

### SequenceDestroyStatement

A `destroy` statement.

| Field     | Type       | Meaning                                    |
| --------- | ---------- | ------------------------------------------ |
| `created` | boolean    | Whether `create` comes before the keyword. |
| `id`      | Identifier | The id after `destroy`.                    |

Child fields: `id`. The range starts at `create` when it is there. With
`created`, mermaid.js creates the participant instead of destroying it (see
[Building the summary](../diagrams/sequence.md#building-the-summary-from-the-tree)).

### SequenceBoxStatement

| Field  | Type                      | Meaning                                                                                                                                 |
| ------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `text` | SequenceBoxText or null   | The text after `box`; null when there is none.                                                                                          |
| `body` | list of SequenceStatement | The statements up to `end`, in source order: participant statements, destroy statements, and description block statements without text. |

Child fields: `text`, `body`.

### SequenceBoxText

The text written after `box`, a `box-text` of the grammar. mermaid.js reads a
colour and a name from it, and which part is the colour depends on a question
that it asks the browser (see
[Box colours](../diagrams/sequence.md#box-colours)). The node therefore holds
the text as a whole and the two parts into which the lexer divides it, as
mermaid.js does before it asks; it does not say whether the first part is a
colour.

| Field            | Type                    | Meaning                                                                                   |
| ---------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| `value`          | string                  | The text of its range.                                                                    |
| `colorCandidate` | SequenceLiteral or null | The `color-candidate` unit, the part that mermaid.js asks about; null when there is none. |
| `remainder`      | SequenceLiteral or null | The `text` unit after the candidate; null when there is none.                             |

Child fields: `colorCandidate`, `remainder`. Each part is a unit and a token of
its own (see [The line context](../diagrams/sequence.md#the-line-context)), so
the range of each SequenceLiteral is the range of its token. In
`box Purple Alice & John`, the candidate is `Purple` and the remainder
`Alice & John`; in `box rgb(34, 56, 0) Group1`, the candidate is
`rgb(34, 56, 0)` and the remainder `Group1`; in `box red-team`, the candidate is
`red` and the remainder `-team`; in `box RGB(0, 0, 255) Team`, the candidate is
`RGB`; and in `box -x`, there is no candidate, and the remainder is `-x`.
[fixture: sequence/docs-syntax-sequence-diagram-93d3c0ff] [fixture:
sequence/spec-sequence-diagram-97d37793] [fixture:
sequence/db-box-colour-candidate-word-prefix] [fixture:
sequence/db-box-colour-function-upper-case] [fixture:
sequence/db-box-no-colour-candidate]

### SequenceMessageStatement

| Field                   | Type                 | Meaning                                                               |
| ----------------------- | -------------------- | --------------------------------------------------------------------- |
| `from`                  | Identifier           | The id before the arrow.                                              |
| `fromCentralConnection` | boolean              | Whether `()` comes between the source and the arrow.                  |
| `arrow`                 | SequenceArrow        | The arrow.                                                            |
| `activation`            | string or null       | `+` or `-` after the arrow; null when there is none.                  |
| `toCentralConnection`   | boolean              | Whether `()` comes between the arrow and the target.                  |
| `to`                    | Identifier           | The id after the arrow.                                               |
| `text`                  | SequenceText or null | The text after `:`; null when nothing but whitespace follows the `:`. |

Child fields: `from`, `arrow`, `to`, `text`. `activation` is null when either
central connection is true. The `:` is a token of the statement and belongs to
no field.

### SequenceArrow

The arrow of a message.

| Field         | Type   | Meaning                                                      |
| ------------- | ------ | ------------------------------------------------------------ |
| `value`       | string | The text of its range.                                       |
| `startMarker` | string | The marker at the end of the source: one of the words below. |
| `line`        | string | `solid` for `-`, `dotted` for `--`.                          |
| `endMarker`   | string | The marker at the end of the target: one of the words below. |

No child fields. Its range is its token. An arrow is written as an optional
start marker, the line, `-` or `--`, and then its end marker; with no end
marker, a `>` follows the line (`->`, `-->`), except after a half marker at the
start, where nothing follows (`/|-`). Each of the 26 arrows has its own
combination of these fields. The markers are:

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

| Field | Type       | Meaning                                                |
| ----- | ---------- | ------------------------------------------------------ |
| `id`  | Identifier | The id of the participant it activates or deactivates. |

Child fields: `id`.

### SequenceNoteStatement

| Field       | Type                 | Meaning                                                               |
| ----------- | -------------------- | --------------------------------------------------------------------- |
| `placement` | string               | `left of`, `right of`, or `over`, in lower case with one space.       |
| `ids`       | list of Identifier   | The id, or the two ids of `over` with a `,`.                          |
| `text`      | SequenceText or null | The text after `:`; null when nothing but whitespace follows the `:`. |

Child fields: `ids`, `text`.

### SequenceLinksStatement, SequenceLinkStatement, SequencePropertiesStatement, and SequenceDetailsStatement

| Field  | Type                 | Meaning                                                               |
| ------ | -------------------- | --------------------------------------------------------------------- |
| `id`   | Identifier           | The id of the participant.                                            |
| `text` | SequenceText or null | The text after `:`; null when nothing but whitespace follows the `:`. |

Child fields: `id`, `text`. The text of `links` and `properties` is JSON, which
the tree does not read; the text of `link` is a label, `@`, and a URL; the text
of `details` is the id of an element of the page.

### SequenceTitleStatement

| Field   | Type                    | Meaning                                                             |
| ------- | ----------------------- | ------------------------------------------------------------------- |
| `value` | SequenceLiteral or null | The text after `title` or `title:`; null when it is all whitespace. |

Child fields: `value`. The title of the Db keeps the whitespace written around
the value, which the Db normalization reads from the source.

### SequenceAccTitleStatement, SequenceAccDescrStatement, and SequenceAccDescrBlockStatement

As [FlowchartAccTitleStatement](./flowchart.md#flowchartacctitlestatement),
[FlowchartAccDescrStatement](./flowchart.md#flowchartaccdescrstatement), and
[FlowchartAccDescrBlockStatement](./flowchart.md#flowchartaccdescrblockstatement),
with SequenceLiteral in place of FlowchartLiteral. An empty description block
where a statement starts, also in the body of a box, is a
SequenceAccDescrBlockStatement whose `value` is null and whose `closed` is true.

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
like those after `else`, `and`, or `option`. mermaid.js gives the first section
an entry of another type in its Db; that is a matter of the Db normalization.

### SequenceSection

| Field  | Type                      | Meaning                                                                      |
| ------ | ------------------------- | ---------------------------------------------------------------------------- |
| `text` | SequenceText or null      | The text after the keyword that starts the section; null when there is none. |
| `body` | list of SequenceStatement | The statements up to the next section or to `end`, in source order.          |

Child fields: `text`, `body`. The range starts at the keyword that starts the
section, `else`, `and`, or `option`, or, for the first section, the keyword of
the block, and ends at its last token; `end` belongs to the block.

### SequenceIgnoredStatement

A line that mermaid.js reads as one `invalid` unit and ignores, such as `)` or
`/` alone (see [Grammar](../diagrams/sequence.md#grammar)).

| Field   | Type   | Meaning                                   |
| ------- | ------ | ----------------------------------------- |
| `value` | string | The text of its range: the one character. |

No child fields.

### SequenceText

A text part (see [Text parts](../diagrams/sequence.md#text-parts)): a text with
an optional wrap prefix.

| Field   | Type                    | Meaning                                                                                                                 |
| ------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `wrap`  | string or null          | `wrap` for the prefix `wrap:`, `nowrap` for `nowrap:`, with or without the `:` before it; null when there is no prefix. |
| `value` | SequenceLiteral or null | The text after the prefix; null when there is none.                                                                     |

Child fields: `value`. The range runs from the prefix, or from the text when
there is no prefix, to the end of the text. A text part with neither a prefix
nor a text makes no node: the field that would hold it is null.

### SequenceLiteral

A text without quotes that the author writes at a position where the grammar
allows whitespace in it and decides where it ends.

| Field   | Type   | Meaning                                                |
| ------- | ------ | ------------------------------------------------------ |
| `value` | string | The text of its range (see [ast.md](../ast.md#nodes)). |

No child fields. Its value has no whitespace at its ends.

### SequenceDataBlock

| Field   | Type   | Meaning                                                         |
| ------- | ------ | --------------------------------------------------------------- |
| `value` | string | The text between `@{` and `}`, as written, whitespace included. |

No child fields. The tree does not read the content (see
[embedded-data-opaque](../known-divergences/embedded-data-opaque.md)). Its range
runs from `@{` to `}`.

## Tokens

The tokens are made from the units of
[diagrams/sequence.md](../diagrams/sequence.md#lexical-structure). Every unit
that is not all whitespace is one token, of the kind that this table gives for
it:

| Kind         | Units                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | the keywords: `sequenceDiagram`, `participant`, `actor`, `create`, `destroy`, `as`, `box`, `loop`, `rect`, `opt`, `alt`, `else`, `par`, `par_over`, `and`, `critical`, `option`, `break`, `end`, `note`, `left of`, `right of`, `over`, `links`, `link`, `properties`, `details`, `activate`, `deactivate`, `autonumber`, and `off`; the `title`, `title:`, `accTitle`, and `accDescr` units; a `wrap-prefix` unit |
| `Identifier` | an `id` unit                                                                                                                                                                                                                                                                                                                                                                                                       |
| `Numeric`    | a `number` unit                                                                                                                                                                                                                                                                                                                                                                                                    |
| `RawText`    | a `text`, `color-candidate`, `title-text`, `description-text`, `description-block-text`, or `data-text` unit; an `invalid` unit                                                                                                                                                                                                                                                                                    |
| `Punctuator` | an `arrow` unit; `+`, `-`, `()`, `,`, `:`, `{`, `}`, and `@{`; a `newline` unit read from `;`                                                                                                                                                                                                                                                                                                                      |

A token holds its unit without the whitespace at its ends. A `newline` unit read
from line feeds is whitespace and no token. Where a directive lies between two
characters of a `RawText` or `Identifier` unit that are not whitespace, the unit
is cut there: each piece, without the whitespace at its ends, is a token, and
the directive between the pieces is a `Directive` token (see
[ast.md](../ast.md#directive)). A directive inside a unit of another kind makes
the input rejected (see
[Directives inside units](../diagrams/sequence.md#directives-inside-units)).

- The `:` before a text, and the `:` after `accTitle` and `accDescr`, are
  `Punctuator` tokens of the statement and belong to no field.
- The wrap prefix of a text, such as `wrap:` or `:nowrap:`, is one `Keyword`
  token, the first token of its [SequenceText](#sequencetext).
- A `;` that ends a statement is a `Punctuator` token that belongs to no
  statement, as a line break belongs to none.
- A `;` that the line rule ignores and that is a token of its own (see
  [Tokens](../ast.md#tokens)) has the kind of the unit that the context at its
  place reads for a `;`. It is a `Punctuator` in the statement context, where it
  is a `newline` unit, also right after a diagram comment read there (see
  [Comment](../ast.md#comment)): in `loop style:#x;` the text `style:` leaves
  the line context, `#x` is a comment of the statement context, and the `;`
  after it is a `Punctuator` token. It is a `RawText` in the title, description,
  description block, and data contexts, which read a `;` as text: with
  `accTitle: style:#x;`, the title is `style:#x` and the `;` after it is a
  `RawText` token, and in `participant A@{ style:#x; }` the `;` after `style:#x`
  is a `RawText` token, with the whitespace and the `}` after it outside it.
  After `participant A@{ "style": "x:#y" }`, a `;` is a `Punctuator` token. A
  `;` that lies between characters of a token, as in `"x:#y;"` inside a data
  block, is part of that token. [fixture:
  sequence/tokens-acc-title-ignored-semicolon] [fixture:
  sequence/tokens-acc-descr-ignored-semicolon] [fixture:
  sequence/tokens-acc-descr-block-ignored-semicolon] [fixture:
  sequence/tokens-data-block-ignored-semicolon-alone] [fixture:
  sequence/tokens-data-block-then-ignored-semicolon] [fixture:
  sequence/tokens-loop-comment-then-ignored-semicolon] [fixture:
  sequence/tokens-comment-then-ignored-semicolon]
