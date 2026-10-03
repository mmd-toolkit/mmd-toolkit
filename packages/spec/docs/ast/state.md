# State nodes

Japanese version: [state.ja.md](./state.ja.md)

This document defines the nodes of the tree for the diagram type `stateDiagram`.
The shared parts of the tree are defined in [ast.md](../ast.md); how the source
is read, and which grammar rule makes which node, is defined in
[diagrams/state.md](../diagrams/state.md).

The body of this diagram type is a [StateDiagram](#statediagram). The values of
the fields keep what the author wrote, as [ast.md](../ast.md#nodes) defines the
written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). The whitespace that mermaid.js reads
as part of a value is part of its written text (see [Nodes](../ast.md#nodes)):
in this diagram type, the whitespace of the second description of an alias (see
[StateAliasDefinitionStatement](#statealiasdefinitionstatement)). Other
whitespace is not part of any value.

A **state** is a box of the diagram, named by its id. A transition goes from one
state to another; `[*]` stands for the start or the end.

## Nodes

### StateDiagram

| Field  | Type                   | Meaning                          |
| ------ | ---------------------- | -------------------------------- |
| `body` | list of StateStatement | The statements, in source order. |

Child fields: `body`. The header keyword is not a field: `stateDiagram` and
`stateDiagram-v2` are read in the same way (see
[Detection](../diagrams/state.md#detection)).

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
Db, and so has `A :` followed by four spaces: mermaid.js reads a description of
only whitespace, whatever its amount, as none, so that whitespace is no value.
[fixture: state/gram-description-blank] [fixture:
state/gram-description-blank-spaces]

### StateTransitionStatement

| Field   | Type                 | Meaning                                                                    |
| ------- | -------------------- | -------------------------------------------------------------------------- |
| `from`  | StateReference       | The state before the arrow.                                                |
| `to`    | StateReference       | The state after the arrow.                                                 |
| `label` | StateLiteral or null | The text after `:`; null when there is none, or when it is all whitespace. |

Child fields: `from`, `to`, `label`. The arrow `-->` is a token and no node: a
state diagram has this one arrow, with no marks at its ends and one kind of
line, so a node of the arrow would have no field. [fixture:
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

| Field            | Type                            | Meaning                                                                                                                            |
| ---------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `textBeforeId`   | StateIgnoredText or null        | The empty strings before the name; null when there are none.                                                                       |
| `id`             | Identifier or null              | The name after `state`; null for `state` alone.                                                                                    |
| `textBeforeBody` | StateIgnoredText or null        | The empty strings, empty description blocks, `ignored-state` units, and `%%` before the `{` of the body; null when there are none. |
| `body`           | list of StateStatement, or null | The statements between `{` and `}`; null without a body.                                                                           |

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
state/gram-empty-description-block-after-empty-string-before-body] It also holds
the `ignored-state` units, each a `state` on a later line that mermaid.js reads
as no token, and the empty strings after them: `state X ""` followed by a line
`state {` has one StateIgnoredText from the empty string to `state`, and the
body is that of X. [fixture: state/gram-ignored-state-before-body-next-line]
Empty strings after `state` or after a statement, with no name, no string, and
no `{` of a body after them, are a
[StateIgnoredStatement](#stateignoredstatement): `state x ""` is a composite
statement and an ignored statement, while `state x ""` followed by a line `{` is
one composite statement, with the empty string as its `textBeforeBody`.
[fixture: state/gram-state-empty-string-after-name] [fixture:
state/gram-state-empty-string-after-name-body-next-line] With a body, the
statement defines the composite state with the id. Without a body, it adds
nothing to the Db: `state A`, `state a b`, which is two such statements, and
`state` alone. [fixture: state/lex-keyword-upper-case] [fixture:
state/lex-state-without-body] [fixture: state/lex-state-two-names] [fixture:
state/lex-state-keyword-alone]

### StateAliasDefinitionStatement

`state "description" as A`, `state "description" as A : more`, and
`state "description" as A { … }`.

| Field                   | Type                            | Meaning                                                                                                                                          |
| ----------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `textBeforeDescription` | StateIgnoredText or null        | The empty strings before the description; null when there are none.                                                                              |
| `description`           | StringLiteral                   | The description in quotes.                                                                                                                       |
| `textAfterDescription`  | StateIgnoredText or null        | The empty strings after the description, before `as`; null when there are none.                                                                  |
| `id`                    | StateLiteral or null            | The id after `as`; null when it is empty.                                                                                                        |
| `secondDescription`     | StateLiteral or null            | Without a body, the `second-description` unit between the first `:` and the second `:` or the end, whitespace included; null when there is none. |
| `textAfter`             | StateIgnoredText or null        | Without a body, the text from the second `:`; null when there is none.                                                                           |
| `textBeforeBody`        | StateIgnoredText or null        | The empty description blocks, `ignored-state` units, empty strings, and text from `%%` before the `{` of the body; null when there are none.     |
| `body`                  | list of StateStatement, or null | The statements between `{` and `}`; null without a body.                                                                                         |

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
followed by a line `accDescr {} {`, or the `ignored-state` units with the empty
strings after them, as in `state "d" as A` followed by a line `state {`.
[fixture: state/gram-ignored-state-before-alias-body-next-line] [fixture:
state/lex-alias-id-ignored-percent-before-body] [fixture:
state/lex-alias-id-ignored-percent-brace] [fixture:
state/gram-ignored-percent-before-alias-body-next-line] [fixture:
state/gram-empty-description-block-before-alias-body-next-line] The id may hold
whitespace, and before a body also `:`: `state "d" as my id` defines `my id`,
and `state "d" as A : x {` the composite state `A : x`. [fixture:
state/lex-alias-id-spaces] [fixture: state/lex-alias-second-description]
[fixture: state/lex-alias-third-part] [fixture:
state/lex-alias-colon-before-body] [fixture: state/lex-alias-without-id]
mermaid.js reads the second description as written, whitespace included, so
`secondDescription` is the whole unit, also when it is all whitespace:
`state "d" as A : x  : y` has the value of a space, `x`, and two spaces, and
`state "d" as A :` followed by two spaces the value of two spaces. It is null
when there is no `:`, and when nothing follows the `:`, where mermaid.js gives
the state the empty second description, which no field of the tree shows. The
whitespace after a `;` that the line rule ignores stays in it:
`state "d" as A style:#x;` followed by two spaces has the alias id `A style` and
the second description `#x` and two spaces. [fixture:
state/lex-alias-third-part] [fixture: state/db-alias-colon-spaces-second]
[fixture: state/db-alias-colon-empty-second] [fixture:
state/tokens-alias-ignored-semicolon-then-spaces]

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

| Field             | Type                     | Meaning                                                                                  |
| ----------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `position`        | string                   | `left` or `right`.                                                                       |
| `textBeforeState` | StateIgnoredText or null | The text from `%%` right after the position; null when there is none.                    |
| `state`           | Identifier or null       | The id of the state after `of`; null when it is empty.                                   |
| `textBeforeText`  | StateIgnoredText or null | On one line, the character after the `:` that mermaid.js drops; null when there is none. |
| `text`            | StateLiteral or null     | The text of the note that mermaid.js reads; null when it is empty or all whitespace.     |

Child fields: `textBeforeState`, `state`, `textBeforeText`, `text`.
`textBeforeState` is text that mermaid.js does not read: `%%` right after the
position, with no whitespace between, and the characters after it other than
`:`, line feed, whitespace, and `-`; the note id follows it, as in
`note left of%%x A : t`. [fixture:
state/lex-note-id-ignored-percent-after-position] The note id ends before a
`%%`, also at its first character, and is then empty: in `note right of %% c S`,
a line `x`, and `end note`, `state` is null and the text starts with `%%`.
[fixture: state/lex-note-mixed-case] [fixture: state/lex-note-block] [fixture:
state/lex-note-block-empty] [fixture: state/lex-note-id-percent-block]

On one line, mermaid.js reads the text from right after the note id without its
first two characters and without the whitespace at its ends (see
[The note contexts](../diagrams/state.md#the-note-contexts)), and `text` and
`textBeforeText` show that reading. With two whitespace characters before the
`:`, the `:` is part of the text: `note left of A  :hi` has the text `:hi`. With
the `:` right after the note id, the character after the `:`, when it is not
whitespace, is `textBeforeText`: `note left of A:hi` has it as `h` and the text
`i`, and `note left of A:h` has it as `h` and no text. [fixture:
state/lex-note-two-spaces-before-colon] [fixture:
state/lex-note-colon-without-space] [fixture:
state/lex-note-colon-then-one-character]

### StateFloatingNoteStatement

`note "text" as N1`. It adds nothing to the Db. [fixture:
state/lex-floating-note]

| Field  | Type                 | Meaning                                                                                         |
| ------ | -------------------- | ----------------------------------------------------------------------------------------------- |
| `text` | StateLiteral or null | The text between the quotes; null when it is all whitespace.                                    |
| `id`   | StateLiteral or null | The text after `as`, up to the end of the line; null when it is empty. The Db does not read it. |

Child fields: `text`, `id`. [fixture: state/lex-floating-note-id-spaces] The
quotes are tokens of the statement and belong to no field; there may be more
than one before and after the text (see
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

| Field      | Type                           | Meaning                                                                       |
| ---------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `cssClass` | Identifier                     | The CSS class after `classDef`.                                               |
| `styles`   | list of (StateLiteral or null) | The styles, separated by `,` units, in source order; null for an empty style. |

Child fields: `cssClass`, `styles`. The styles are the parts into which
mermaid.js divides the text at each `,`, so there is one for each part: a part
that is empty or all whitespace, which mermaid.js reads as the empty text, is
null. `classDef a x,,y` has the styles `x`, null, and `y`, and `classDef a ,`
two nulls, while a `classDef` statement without text has no styles, as
mermaid.js adds none. [fixture: state/db-classdef-empty-items] [fixture:
state/db-classdef-comma-only] [fixture: state/lex-classdef-percent] [fixture:
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

| Field    | Type                           | Meaning                                                                     |
| -------- | ------------------------------ | --------------------------------------------------------------------------- |
| `states` | list of (Identifier or null)   | The ids of the states, in source order; null for an empty item between `,`. |
| `styles` | list of (StateLiteral or null) | The styles, as in StateClassDefStatement.                                   |

Child fields: `states`, `styles`. The styles are as in StateClassDefStatement,
with null for an empty part, except that a `style` statement without text has
one null style, as mermaid.js gives it one empty style: `style A x, ,y` has the
styles `x`, null, and `y`, and `style A` the one style null. The ids end at the
whitespace after them: `style A ,x` has the one state A and the styles null and
`x`. [fixture: state/db-style-comma-after-space] [fixture:
state/lex-style-empty-id] [fixture: state/lex-style-without-styles] [fixture:
state/db-style-empty-items] [fixture: state/db-style-whitespace-item] [fixture:
state/db-style-without-text]

### StateDirectionStatement

| Field        | Type                     | Meaning                                                                        |
| ------------ | ------------------------ | ------------------------------------------------------------------------------ |
| `textBefore` | StateIgnoredText or null | The text of the direction line before `direction`, or null when there is none. |
| `direction`  | string                   | `TB`, `BT`, `RL`, or `LR`.                                                     |
| `textAfter`  | StateIgnoredText or null | The text of the direction line after the value, or null when there is none.    |

Child fields: `textBefore`, `textAfter`. [fixture:
state/lex-direction-line-in-description] [fixture:
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
changes nothing.

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

| Field   | Type   | Meaning                                                                                                       |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)): the run of empty strings, with the whitespace between them. |

No child fields.

### StateLiteral

A text without quotes that may contain whitespace: a description, a label, an id
after `as` or before a pseudostate mark, a note text, the text of a floating
note, a style, a CSS class of a `class` statement, and an accessibility text.

| Field   | Type   | Meaning                                          |
| ------- | ------ | ------------------------------------------------ |
| `value` | string | Its written text (see [Nodes](../ast.md#nodes)). |

No child fields. The value starts or ends with whitespace only where mermaid.js
reads it, in the second description of an alias, where a text of only whitespace
is a value of that whitespace (see
[StateAliasDefinitionStatement](#statealiasdefinitionstatement)). Elsewhere,
mermaid.js trims the text, the whitespace around it is not part of the value,
and where the text is all whitespace, the field holds null instead.

### StateIgnoredText

Text that the author wrote and mermaid.js does not read: the text before
`direction` and after its value on a direction line, the text from the second
`:` after the id of an alias definition, a text from `%%` before the `{` of a
body or right after the position of a note, the character after the `:` of a
note that mermaid.js drops, the empty description blocks and an `ignored-state`
unit before the `{` of a body on a line after the name, and the empty strings of
the state context in a field of a composite or alias statement, where a run of
empty strings, with only whitespace between them, is one node, and so are the
empty strings after a name and a `%%` before the same body. Empty strings that
are a statement of their own are a
[StateIgnoredStatement](#stateignoredstatement) instead.

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields.
