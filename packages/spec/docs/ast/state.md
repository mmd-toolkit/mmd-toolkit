# State nodes

Japanese version: [state.ja.md](./state.ja.md)

This document defines the nodes and tokens of the tree for the diagram type
`stateDiagram`. The shared parts of the tree are defined in [ast.md](../ast.md);
how the source is read, and which grammar rule makes which node, is defined in
[diagrams/state.md](../diagrams/state.md).

The body of this diagram type is a [StateDiagram](#statediagram). The values of
the fields keep what the author wrote, as [ast.md](../ast.md#nodes) defines the
text of a range; they are not in the converted form of
[common.md](../common.md#reading-a-source).

A **state** is a box of the diagram, named by its id. A transition goes from one
state to another; `[*]` stands for the start or the end.

## Nodes

### StateDiagram

| Field  | Type                   | Meaning                          |
| ------ | ---------------------- | -------------------------------- |
| `body` | list of StateStatement | The statements, in source order. |

Child fields: `body`. The header keyword is not a field: `stateDiagram` and
`stateDiagram-v2` are read in the same way (see
[Detection](../diagrams/state.md#detection)). The range runs from the header
keyword to the last token of the diagram.

**StateStatement** is a StateDefinitionStatement, StateTransitionStatement,
StateCompositeStatement, StateAliasDefinitionStatement,
StatePseudostateDefinitionStatement, StateDividerStatement, StateNoteStatement,
StateFloatingNoteStatement, StateIgnoredStatement, StateClickStatement,
StateClassDefStatement, StateClassStatement, StateStyleStatement,
StateDirectionStatement, StateAccTitleStatement, StateAccDescrStatement,
StateAccDescrBlockStatement, StateScaleStatement, or
StateHideEmptyDescriptionStatement.

A line break belongs to no statement, and an empty line makes no node. The child
fields of every node below are in source order (see [Nodes](../ast.md#nodes)).

### StateDefinitionStatement

A state written by its id, alone or with a description: `A`, `A : text`, `[*]`,
`A:::cls`. It adds the state when the Db has none with its id, and adds its
description.

| Field         | Type                 | Meaning                                                                                     |
| ------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| `reference`   | StateReference       | The state.                                                                                  |
| `description` | StateLiteral or null | The text after `:`; null when there is no `:`, or when the text after it is all whitespace. |

Child fields: `reference`, `description`. `A : ` has no description, as in the
Db. [fixture: state/gram-description-blank]

### StateTransitionStatement

| Field   | Type                 | Meaning                                                                    |
| ------- | -------------------- | -------------------------------------------------------------------------- |
| `from`  | StateReference       | The state before the arrow.                                                |
| `to`    | StateReference       | The state after the arrow.                                                 |
| `label` | StateLiteral or null | The text after `:`; null when there is none, or when it is all whitespace. |

Child fields: `from`, `to`, `label`. The arrow `-->` is a `Punctuator` token and
no node: a state diagram has this one arrow, with no marks at its ends and one
kind of line, so a node of the arrow would have no field. [fixture:
state/lex-percent-in-label]

### StateReference

| Field      | Type                        | Meaning                                                                        |
| ---------- | --------------------------- | ------------------------------------------------------------------------------ |
| `state`    | Identifier or StateTerminal | The id of the state, or `[*]`. The name of the Identifier is the id in the Db. |
| `cssClass` | Identifier or null          | The CSS class after `:::`; null when there is none.                            |

Child fields: `state`, `cssClass`. [fixture:
state/gram-style-separator-transition] [fixture:
state/gram-terminal-style-separator]

### StateTerminal

`[*]`. No fields. Whether it is the start or the end follows from where it is:
before the arrow of a transition, or alone, it is a start, and after the arrow,
an end; its id in the Db is made from the composite state it lies in (see
[diagrams/state.md](../diagrams/state.md)). [fixture: state/gram-terminal-alone]

### StateCompositeStatement

`state A { … }`, and `state A`.

| Field            | Type                            | Meaning                                                                                                     |
| ---------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `textBeforeId`   | StateIgnoredText or null        | The empty strings before the name; null when there are none.                                                |
| `id`             | Identifier or null              | The name after `state`; null for `state` alone.                                                             |
| `textBeforeBody` | StateIgnoredText or null        | The empty strings, empty description blocks, and `%%` before the `{` of the body; null when there are none. |
| `body`           | list of StateStatement, or null | The statements between `{` and `}`; null without a body.                                                    |

Child fields: `textBeforeId`, `id`, `textBeforeBody`, `body`. `textBeforeId` and
`textBeforeBody` hold text that mermaid.js does not read. `textBeforeId` is the
empty strings of the state context before the name, such as the `""` of
`state "" x`. `textBeforeBody` is the empty strings after the name and a `%%` on
the line after the name, before a `{` that starts no directive: `state x "" {`
has the empty string, `state X` followed by a line `%%{}` has the `%%`, and
`state X ""` followed by a line `%%{}` has one StateIgnoredText from the empty
string to the `%%`. It also holds the empty description blocks before a `{` on
the line after the name: `state X ""` followed by a line `accDescr {} {` has one
StateIgnoredText from the empty string to the block. [fixture:
state/gram-state-empty-string-before-name] [fixture:
state/gram-state-empty-string-between-name-and-body] [fixture:
state/gram-ignored-percent-before-body-next-line] [fixture:
state/gram-state-empty-string-then-percent-before-body] [fixture:
state/gram-empty-description-block-after-empty-string-before-body] Empty strings
after `state` or after a statement, with no name, no string, and no `{` of a
body after them, are a [StateIgnoredStatement](#stateignoredstatement):
`state x ""` is a composite statement and an ignored statement, while
`state x ""` followed by a line `{` is one composite statement, with the empty
string as its `textBeforeBody`. [fixture:
state/gram-state-empty-string-after-name] [fixture:
state/gram-state-empty-string-after-name-body-next-line] With a body, the
statement defines the composite state with the id. Without a body, it adds
nothing to the Db: `state A`, `state a b`, which is two such statements, and
`state` alone. [fixture: state/lex-keyword-upper-case] [fixture:
state/lex-state-without-body] [fixture: state/lex-state-two-names] [fixture:
state/lex-state-keyword-alone]

### StateAliasDefinitionStatement

`state "description" as A`, `state "description" as A : more`, and
`state "description" as A { … }`.

| Field                   | Type                            | Meaning                                                                                                  |
| ----------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `textBeforeDescription` | StateIgnoredText or null        | The empty strings before the description; null when there are none.                                      |
| `description`           | StringLiteral                   | The description in quotes.                                                                               |
| `textAfterDescription`  | StateIgnoredText or null        | The empty strings after the description, before `as`; null when there are none.                          |
| `id`                    | StateLiteral or null            | The id after `as`; null when it is empty.                                                                |
| `secondDescription`     | StateLiteral or null            | Without a body, the text between the first `:` and the second `:` or the end; null when there is none.   |
| `textAfter`             | StateIgnoredText or null        | Without a body, the text from the second `:`; null when there is none.                                   |
| `textBeforeBody`        | StateIgnoredText or null        | The empty description blocks and the text from `%%` before the `{` of the body; null when there is none. |
| `body`                  | list of StateStatement, or null | The statements between `{` and `}`; null without a body.                                                 |

Child fields: `textBeforeDescription`, `description`, `textAfterDescription`,
`id`, `secondDescription`, `textAfter`, `textBeforeBody`, `body`.
`textBeforeDescription` and `textAfterDescription` are the empty strings of the
state context around the description, which mermaid.js does not read:
`state "" "y" "" as A` has both. [fixture:
state/gram-state-empty-strings-around-alias-string] `textBeforeBody` is text
that mermaid.js does not read: after `as`, the text from `%%` to a `{` on its
line, without the whitespace at its end, and the alias then has no id, as in
`state "d" as %% c {`; or the empty description blocks and a `%%` on the line
after the alias, before a `{` that starts no directive, as in `state "d" as A`
followed by a line `accDescr {} {`. [fixture:
state/lex-alias-id-ignored-percent-before-body] [fixture:
state/lex-alias-id-ignored-percent-brace] [fixture:
state/gram-ignored-percent-before-alias-body-next-line] [fixture:
state/gram-empty-description-block-before-alias-body-next-line] The id may hold
whitespace, and before a body also `:`: `state "d" as my id` defines `my id`,
and `state "d" as A : x {` the composite state `A : x`. [fixture:
state/lex-alias-id-spaces] [fixture: state/lex-alias-second-description]
[fixture: state/lex-alias-third-part] [fixture:
state/lex-alias-colon-before-body] [fixture: state/lex-alias-without-id]
`secondDescription` is null when there is no `:`, and also when the text after
the `:` is empty or all whitespace, while mermaid.js gives the state a second
description in both of the latter cases. The Db steps read it from the source
when the statement has a `:` token (see
[state.md](../diagrams/state.md#building-the-summary-from-the-tree)). [fixture:
state/db-alias-colon-empty-second] [fixture: state/db-alias-colon-spaces-second]

### StatePseudostateDefinitionStatement

`state f1 <<fork>>`, `state c1 [[choice]]`.

| Field  | Type                 | Meaning                                          |
| ------ | -------------------- | ------------------------------------------------ |
| `id`   | StateLiteral or null | The text before the mark; null when it is empty. |
| `kind` | string               | `fork`, `join`, or `choice`.                     |

Child fields: `id`. The id may hold whitespace: `state f 1 <<fork>>` is the fork
`f 1`. `state <<join>>` has no id, and the Db has the empty id. [fixture:
state/lex-fork-spaced-id] [fixture: state/lex-join-empty-id] [fixture:
state/lex-choice-square-brackets]

### StateDividerStatement

`--` in the body of a composite state, which divides it into regions. No fields.
[fixture: state/lex-composite-divider]

### StateNoteStatement

`note left of A : text`, and `note right of A`, the text on the lines after it,
and `end note`.

| Field             | Type                     | Meaning                                                               |
| ----------------- | ------------------------ | --------------------------------------------------------------------- |
| `position`        | string                   | `left` or `right`.                                                    |
| `textBeforeState` | StateIgnoredText or null | The text from `%%` right after the position; null when there is none. |
| `state`           | Identifier or null       | The id of the state after `of`; null when it is empty.                |
| `text`            | StateLiteral or null     | The text of the note; null when it is empty or all whitespace.        |

Child fields: `textBeforeState`, `state`, `text`. `textBeforeState` is text that
mermaid.js does not read: `%%` right after the position, with no whitespace
between, and the characters after it other than `:`, line feed, whitespace, and
`-`; the note id follows it, as in `note left of%%x A : t`. [fixture:
state/lex-note-id-ignored-percent-after-position] The note id ends before a
`%%`, also at its first character, and is then empty: in `note right of %% c S`,
a line `x`, and `end note`, `state` is null and the text starts with `%%`.
[fixture: state/lex-note-mixed-case] [fixture: state/lex-note-block] [fixture:
state/lex-note-block-empty] [fixture: state/lex-note-id-percent-block]

### StateFloatingNoteStatement

`note "text" as N1`. It adds nothing to the Db. [fixture:
state/lex-floating-note]

| Field  | Type                 | Meaning                                                                                         |
| ------ | -------------------- | ----------------------------------------------------------------------------------------------- |
| `text` | StateLiteral or null | The text between the quotes; null when it is all whitespace.                                    |
| `id`   | StateLiteral or null | The text after `as`, up to the end of the line; null when it is empty. The Db does not read it. |

Child fields: `text`, `id`. [fixture: state/lex-floating-note-id-spaces] The
quotes are `Punctuator` tokens of the statement and belong to no field; there
may be more than one before and after the text (see
[The note contexts](../diagrams/state.md#the-note-contexts)). [fixture:
state/lex-floating-note-extra-quote-before-text] [fixture:
state/lex-floating-note-whitespace-text]

### StateClickStatement

`click A "url" "tooltip"`, `click A href "url"`.

| Field       | Type                  | Meaning                                        |
| ----------- | --------------------- | ---------------------------------------------- |
| `reference` | StateReference        | The state.                                     |
| `url`       | StringLiteral         | The URL.                                       |
| `tooltip`   | StringLiteral or null | The tooltip; null for a statement with `href`. |

Child fields: `reference`, `url`, `tooltip`. [fixture: state/gram-click-tooltip]
[fixture: state/gram-click-href] Empty description blocks between a click
statement and its line break are StateAccDescrBlockStatement nodes after it, not
part of it: `click A "u" "t" accDescr {}` is two statements (see
[Click statements](../diagrams/state.md#click-statements)). [fixture:
state/gram-click-empty-description-block-after]

### StateClassDefStatement

| Field      | Type                 | Meaning                                              |
| ---------- | -------------------- | ---------------------------------------------------- |
| `cssClass` | Identifier           | The CSS class after `classDef`.                      |
| `styles`   | list of StateLiteral | The styles, separated by `,` units, in source order. |

Child fields: `cssClass`, `styles`. An empty style between two `,` makes no
node; the Db steps read the styles from the source, empty ones included (see
[state.md](../diagrams/state.md#building-the-summary-from-the-tree)). [fixture:
state/db-classdef-empty-items] [fixture: state/lex-classdef-percent] [fixture:
state/lex-classdef-without-styles]

### StateClassStatement

`class A,B cls`.

| Field      | Type                 | Meaning                                                     |
| ---------- | -------------------- | ----------------------------------------------------------- |
| `states`   | list of Identifier   | The ids of the states, in source order.                     |
| `cssClass` | StateLiteral or null | The rest of the line, the CSS class; null when it is empty. |

Child fields: `states`, `cssClass`. [fixture: state/lex-class-ids-space]
[fixture: state/lex-class-name-spaces] [fixture: state/lex-class-without-name]

### StateStyleStatement

`style A,B fill:#f00`.

| Field    | Type                         | Meaning                                                                     |
| -------- | ---------------------------- | --------------------------------------------------------------------------- |
| `states` | list of (Identifier or null) | The ids of the states, in source order; null for an empty item between `,`. |
| `styles` | list of StateLiteral         | The styles, as in StateClassDefStatement.                                   |

Child fields: `states`, `styles`. An empty style between two `,` makes no node,
and the Db steps read the styles from the source, as for StateClassDefStatement.
[fixture: state/lex-style-empty-id] [fixture: state/lex-style-without-styles]
[fixture: state/db-style-empty-items]

### StateDirectionStatement

| Field        | Type                     | Meaning                                                                        |
| ------------ | ------------------------ | ------------------------------------------------------------------------------ |
| `textBefore` | StateIgnoredText or null | The text of the direction line before `direction`, or null when there is none. |
| `direction`  | string                   | `TB`, `BT`, `RL`, or `LR`.                                                     |
| `textAfter`  | StateIgnoredText or null | The text of the direction line after the value, or null when there is none.    |

Child fields: `textBefore`, `textAfter`. The range covers the whole direction
line. [fixture: state/lex-direction-line-in-description] [fixture:
state/lex-direction-lower-case]

### StateAccTitleStatement

An `accTitle:` statement with its text.

| Field   | Type                 | Meaning                                                                         |
| ------- | -------------------- | ------------------------------------------------------------------------------- |
| `value` | StateLiteral or null | The text after `accTitle:`, up to the end of the line; null when there is none. |

Child fields: `value`. The whitespace after `:` is read with it, line breaks
included, so the value is null only at the end of the text. `#`, `;`, and `%%`
are characters of the text. [fixture: state/lex-acc-title-next-line] [fixture:
state/lex-acc-title-at-end] [fixture: state/lex-acc-title-semicolon]

### StateAccDescrStatement

An `accDescr:` statement with its text.

| Field   | Type                 | Meaning                                                                         |
| ------- | -------------------- | ------------------------------------------------------------------------------- |
| `value` | StateLiteral or null | The text after `accDescr:`, up to the end of the line; null when there is none. |

Child fields: `value`. The whitespace after `:` is read with it, line breaks
included, so the value is null only at the end of the text. [fixture:
state/db-acc-descr-empty-replaces]

### StateAccDescrBlockStatement

An `accDescr {` statement with its text and its `}`, which it lacks when the
text ends inside it. It is a node type of its own because it has a different
effect on the Db than an `accDescr:` statement: a block that is not closed sets
the empty description, whatever its text, and a closed block without text
changes nothing (see
[state.md](../diagrams/state.md#building-the-summary-from-the-tree)).

| Field    | Type                 | Meaning                                                                                                                 |
| -------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `value`  | StateLiteral or null | The text between `accDescr {` and `}`, or to the end of the text when the block is not closed; null when there is none. |
| `closed` | boolean              | Whether the block ends with `}`. It is false when the text ends inside the block.                                       |

Child fields: `value`. When `accDescr {` is followed by a line `x` and the text
ends, the value is `x`. [fixture: state/db-acc-descr-unclosed-replaces]
`accDescr {` at the end of the text has the value null and is not closed.
[fixture: state/lex-acc-descr-block-unclosed] `accDescr {  }` is a closed block
without text, whose value is null: the whitespace after `{` is read with the
`{`. Such a block, an empty description block, is a statement only where a
statement starts, which is also right after another statement on the same line:
`A --> B accDescr {}` is a transition statement and a
StateAccDescrBlockStatement, and so is a block between a click statement and its
line break; right after the header, where a statement starts, it is the first
statement of the diagram's `body` (see
[state.md](../diagrams/state.md#empty-description-blocks-before-a-separator)). A
block, or a run of blocks with only whitespace between them, after which a unit
continues the statement before it lies inside that statement, as in
`A accDescr {} --> B` and `A --> B accDescr {} : x`, and so does a block between
the units of a statement, as in `A --> accDescr {} B`; the input is then
rejected (see [state.md](../diagrams/state.md#other-statements)). [fixture:
state/db-acc-descr-empty-block-keeps] [fixture:
state/gram-empty-description-block-statement] [fixture:
state/gram-empty-description-block-after-transition] [fixture:
state/div-empty-description-block-in-transition] [fixture:
state/div-empty-description-block-before-label] [fixture:
state/div-empty-description-block-after-arrow] [fixture:
state/header-empty-description-block]

### StateScaleStatement

`scale 350 width`. It adds nothing to the Db.

| Field   | Type           | Meaning     |
| ------- | -------------- | ----------- |
| `width` | NumericLiteral | The number. |

Child fields: `width`. [fixture: state/gram-scale]

### StateHideEmptyDescriptionStatement

`hide empty description`. No fields. It adds nothing to the Db. [fixture:
state/gram-hide-empty-description]

### StateIgnoredStatement

Empty strings of the state context that no name, no string, and no body follows,
after `state` or after another statement on the line, such as the `""` of
`state ""` and of `state x ""` (see
[Composite states, aliases, and pseudostates](../diagrams/state.md#composite-states-aliases-and-pseudostates)).
mermaid.js does not read them, and the statement adds nothing to the Db.
[fixture: state/gram-state-empty-string-alone] [fixture:
state/gram-state-empty-string-after-name] [fixture:
state/gram-state-empty-string-after-name-before-comment]

| Field   | Type   | Meaning                                                                            |
| ------- | ------ | ---------------------------------------------------------------------------------- |
| `value` | string | The text of its range: the run of empty strings, with the whitespace between them. |

No child fields. Its range runs from the first `"` of the run to the last.

### StateLiteral

A text without quotes that may contain whitespace: a description, a label, an id
after `as` or before a pseudostate mark, a note text, the text of a floating
note, a style, a CSS class of a `class` statement, and an accessibility text.

| Field   | Type   | Meaning                                               |
| ------- | ------ | ----------------------------------------------------- |
| `value` | string | The text of its range (see [Nodes](../ast.md#nodes)). |

No child fields. The whitespace around the text is outside the range, so the
value neither starts nor ends with whitespace; where the text is all whitespace,
the field holds null instead.

### StateIgnoredText

Text that the author wrote and mermaid.js does not read: the text before
`direction` and after its value on a direction line, the text from the second
`:` after the id of an alias definition, a text from `%%` before the `{` of a
body or right after the position of a note, the empty description blocks before
the `{` of a body on the line after the name, and the empty strings of the state
context in a field of a composite or alias statement, where a run of empty
strings, with only whitespace between them, is one node, and so are the empty
strings after a name and a `%%` before the same body. Empty strings that are a
statement of their own are a [StateIgnoredStatement](#stateignoredstatement)
instead.

| Field   | Type   | Meaning                |
| ------- | ------ | ---------------------- |
| `value` | string | The text of its range. |

No child fields. Its range covers the tokens of the units it holds, each of the
kind that [Tokens](#tokens) gives for its unit, whatever the kind: the `String`
token of an empty string, the `RawText` token of a `%%`, and the `Keyword` token
`accDescr` and the `Punctuator` tokens `{` and `}` of an empty description
block. The kind of a token is decided by its unit, not by the node that holds
it. [fixture: state/gram-empty-description-block-before-alias-body-next-line]

## Tokens

The tokens are made from the units of
[diagrams/state.md](../diagrams/state.md#lexical-structure). Every unit that is
not all whitespace belongs to one **item** of
[the grammar](../diagrams/state.md#grammar) and has the kind that this table
gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | a `header` unit; the `state`, `as`, `note`, `position`, `end note`, `click`, `href`, `classDef`, `class`, `style`, `scale`, `width`, `hide`, `accTitle`, and `accDescr` units; a pseudostate mark; the `direction` and `direction-value` units                                                                     |
| `Identifier` | an `id`, `state-name`, `class-name`, or `note-id` unit                                                                                                                                                                                                                                                             |
| `Numeric`    | a `number` unit                                                                                                                                                                                                                                                                                                    |
| `String`     | a `string` or `empty-string` unit                                                                                                                                                                                                                                                                                  |
| `RawText`    | the text of a `description` unit after its `:`; an `alias-id`, `second-description`, `pseudostate-name`, `note-text`, `floating-note-text`, `floating-note-id`, `style-text`, or `css-class` unit; a `title-text`, `description-text`, or `description-block-text` unit; a `direction-text` or `ignored-text` unit |
| `Punctuator` | the `:` of a `description` unit, the `:` unit of an alias statement, the `:` unit of a note on one line, and the `:` after `accTitle` and `accDescr`; `-->`, `--`, `:::`, `[*]`, `{`, `}`, and `,`; a `"` unit of a floating note                                                                                  |

A `String` token that a comment region cuts becomes `StringFragment` tokens (see
[Comment](../ast.md#comment)).

A **token** is a maximal run of units of one item and one kind that follow one
another with nothing between them, and, for the `RawText` items, also with
whitespace between them; a token holds no whitespace at its ends. Where a
directive lies between two characters of such a run that are not whitespace, the
run is cut at the directive, as in [ast.md](../ast.md#directive).

- A `position` unit is one `Keyword` token, the space between its words
  included: `left of`. So are `end note` and `hide empty description`.
- A description is one unit, from its `:`, and two tokens: the `:` and the text
  without the whitespace around it.
- Each `"` unit of a floating note is a `Punctuator` token of its own, also
  where two follow one another: `note ""x" as N` has three `"` tokens, two
  before the `RawText` token `x` and one after it. [fixture:
  state/lex-floating-note-extra-quote-before-text]
- The units of an empty description block keep their kinds in the
  `textBeforeBody` of a statement too: a `Keyword` token `accDescr` and the
  `Punctuator` tokens `{` and `}`, inside the range of the StateIgnoredText (see
  [StateIgnoredText](#stateignoredtext)).
- A `;` that the line rule ignores follows the rule of
  [ast.md](../ast.md#tokens): it is inside a token when characters of that token
  lie on both sides of it, and otherwise a token of its own. Such a token has
  the kind of the unit that the context at its place reads for a `;`. It is a
  `RawText` token in the alias id, title, description, description block,
  styles, and class name contexts and in a note over lines, which read a `;` as
  text, and an `Identifier` token in the statement context and in a composite
  body, where a `;` is a character of an id. In `classDef c fill:#f00;`, the
  style is `fill:#f00` and the `;` after it is a `RawText` token, and so in
  `accTitle: style:#x;` and after `style:#x` in a note over lines. In
  `A : style:#x;`, the description is `style:#x` and the `;` after it is an
  `Identifier` token, which adds no state, while in `A : x;`, which the line
  rule does not change, the `;` is the id of a state. In `A : style:#x; B`, the
  `;` lies between characters of the description, which is `style:#x B`, and is
  part of its token. [fixture: state/tokens-classdef-ignored-semicolon]
  [fixture: state/tokens-acc-title-ignored-semicolon] [fixture:
  state/tokens-note-block-ignored-semicolon] [fixture:
  state/tokens-alias-ignored-semicolon] [fixture:
  state/tokens-description-ignored-semicolon] [fixture:
  state/tokens-composite-description-ignored-semicolon] [fixture:
  state/lex-description-then-semicolon] [fixture:
  state/tokens-description-ignored-semicolon-inside] [fixture:
  state/tokens-class-ignored-semicolon]
