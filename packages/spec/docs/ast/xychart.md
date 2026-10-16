# XY chart nodes

Japanese version: [xychart.ja.md](./xychart.ja.md)

This document defines the nodes of the tree for the diagram type `xychart`. The
shared parts of the tree are defined in [ast.md](../ast.md); how the source is
read, and which grammar rule makes which node, is defined in
[diagrams/xychart.md](../diagrams/xychart.md).

The body of this diagram type is an [XychartDiagram](#xychartdiagram). The
values of the fields keep what the author wrote, as [ast.md](../ast.md#nodes)
defines the written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). A text is written without quotes or
in quotes, and which of them is written is shown by the type of its node. A text
without quotes is an [XychartLiteral](#xychartliteral) whose value is the
written texts of its units joined, without the whitespace between them, as
mermaid.js reads it. A text in quotes is a
[StringLiteral](../ast.md#stringliteral), whose value is what lies between its
quotes as written.

A **plot** is a line or a set of bars, drawn from its **values**. The x axis has
**categories** or a **range**, two numbers; the y axis has a range only.

## Nodes

### XychartDiagram

| Field     | Type                     | Meaning                                       |
| --------- | ------------------------ | --------------------------------------------- |
| `headers` | list of XychartHeader    | The headers, in source order; at least one.   |
| `body`    | list of XychartStatement | The statements, in source order; may be none. |

Child fields: `headers`, `body`. The headers come before the first statement: a
second header after the first, on its line or on a later one, is a header too,
and a header after a statement makes the input rejected. A line break, a `;`,
and an empty line belong to no statement and make no node. A text with a header
and no statement is accepted. [fixture: xychart/db-header-plain] [fixture:
xychart/header-twice] [fixture: xychart/header-twice-same-line] [fixture:
xychart/header-second-with-orientation] [fixture:
xychart/gram-header-after-statement] [fixture: xychart/db-semicolon-statements]
[fixture: xychart/db-statement-blank-lines] [fixture:
xychart/db-header-beta-only]

**XychartStatement** is an XychartTitleStatement, XychartXAxisStatement,
XychartYAxisStatement, XychartPlotStatement, XychartAccTitleStatement,
XychartAccDescrStatement, or XychartAccDescrBlockStatement.

### XychartHeader

The header keyword, `xychart` or `xychart-beta`, with the orientation after it.

| Field         | Type           | Meaning                                                                      |
| ------------- | -------------- | ---------------------------------------------------------------------------- |
| `orientation` | string or null | The orientation as written, `vertical` or `horizontal` in any case; or null. |

No child fields. The keyword is not a field: both give the same diagram type.
The orientation is the word after the keyword, as written: `xychart Horizontal`
has the orientation `Horizontal`, and `xychart horizontal` the orientation
`horizontal`; without one, the orientation is null. How mermaid.js reads the
orientation into its Db is in the summary of the tests package. [fixture:
xychart/db-orientation-capitalized] [fixture: xychart/db-orientation-horizontal]
[fixture: xychart/db-orientation-upper-case] [fixture:
xychart/db-orientation-vertical] [fixture: xychart/db-header-plain]

### XychartTitleStatement

`title` and its text: `title Sales`, `title "Sales Revenue"`.

| Field   | Type                            | Meaning   |
| ------- | ------------------------------- | --------- |
| `value` | XychartLiteral or StringLiteral | The text. |

Child fields: `value`. `title Two words` has the XychartLiteral `Twowords`. The
text is never empty: `title ""` is rejected. [fixture:
xychart/db-title-bare-words] [fixture: xychart/db-title-quoted] [fixture:
xychart/gram-title-empty-string]

### XychartXAxisStatement

`x-axis` with a title, with categories or a range, or with both:
`x-axis Month [jan, feb]`, `x-axis 0 --> 10`, `x-axis "Month"`.

| Field   | Type                                   | Meaning                                                |
| ------- | -------------------------------------- | ------------------------------------------------------ |
| `title` | XychartLiteral, StringLiteral, or null | The title; null when there is none.                    |
| `data`  | XychartBand, XychartRange, or null     | The categories or the range; null when there are none. |

Child fields: `title`, `data`. At least one of them is not null: `x-axis` alone
is rejected. A title in quotes may be empty only before categories or a range:
`x-axis "" [a]` has the StringLiteral with the empty value as its title, while
`x-axis ""` alone is rejected. [fixture: xychart/db-x-axis-band-title] [fixture:
xychart/db-x-axis-range] [fixture: xychart/db-x-axis-title-quoted] [fixture:
xychart/gram-x-axis-empty] [fixture:
xychart/db-empty-string-as-x-axis-title-before-band] [fixture:
xychart/db-empty-string-as-x-axis-title-before-range] [fixture:
xychart/gram-grid-empty-x-title-quoted]

### XychartYAxisStatement

`y-axis` with a title, with a range, or with both: `y-axis Revenue 0 --> 100`.

| Field   | Type                                   | Meaning                             |
| ------- | -------------------------------------- | ----------------------------------- |
| `title` | XychartLiteral, StringLiteral, or null | The title; null when there is none. |
| `data`  | XychartRange or null                   | The range; null when there is none. |

Child fields: `title`, `data`. At least one of them is not null, and a title in
quotes may be empty only before a range, as for XychartXAxisStatement. The y
axis has no categories: `y-axis [a]` is rejected. [fixture:
xychart/db-y-axis-range-title] [fixture: xychart/db-y-axis-title-bare-word]
[fixture: xychart/db-y-axis-range] [fixture: xychart/gram-y-axis-empty]
[fixture: xychart/db-empty-string-as-y-axis-title] [fixture:
xychart/gram-grid-empty-y-title-quoted] [fixture: xychart/gram-y-axis-band]

### XychartBand

The categories of the x axis, from `[` to `]`: `[jan, "Feb 2", 3]`.

| Field        | Type                                      | Meaning                                        |
| ------------ | ----------------------------------------- | ---------------------------------------------- |
| `categories` | list of (XychartLiteral or StringLiteral) | The categories, in source order; at least one. |

Child fields: `categories`. Two categories of the same text are two categories.
No category is empty: `[]`, `[a, ""]`, and `[, b]` are rejected. [fixture:
xychart/db-x-axis-band] [fixture: xychart/db-x-axis-band-quoted] [fixture:
xychart/db-x-axis-band-numbers] [fixture: xychart/db-x-axis-band-same-category]
[fixture: xychart/gram-x-axis-band-empty] [fixture:
xychart/gram-x-axis-band-empty-string] [fixture:
xychart/gram-grid-empty-category-bare]

### XychartRange

Two numbers and the arrow between them: `0 --> 100`.

| Field   | Type           | Meaning                      |
| ------- | -------------- | ---------------------------- |
| `start` | NumericLiteral | The number before the arrow. |
| `end`   | NumericLiteral | The number after the arrow.  |

Child fields: `start`, `end`. The numbers keep the order in which they are
written: `5 --> 1` has the start 5 and the end 1, and `-1 --> -5` the start
minus one and the end minus five. A number is written with an optional sign,
digits, and an optional fraction, or as a fraction alone: `+1 --> 2` has the
start with the `raw` `+1`, `.5 --> 1.5` the start with the `raw` `.5`, and
`007 --> 010` the values seven and ten. [fixture: xychart/db-x-axis-range]
[fixture: xychart/db-data-range-reversed] [fixture:
xychart/db-x-axis-range-negative] [fixture: xychart/db-x-axis-range-plus]
[fixture: xychart/db-x-axis-range-decimal] [fixture:
xychart/db-x-axis-range-leading-zeros]

### XychartPlotStatement

`line` or `bar`, a title or none, and the values in brackets:
`line Sales [10, 20 "peak", 15]`, `bar [1, 2]`.

| Field    | Type                                   | Meaning                                    |
| -------- | -------------------------------------- | ------------------------------------------ |
| `kind`   | string                                 | `line` or `bar`.                           |
| `title`  | XychartLiteral, StringLiteral, or null | The title; null when there is none.        |
| `values` | list of XychartValue                   | The values, in source order; at least one. |

Child fields: `title`, `values`. The kind is the keyword in lower case, whatever
the case in which it is written: `LINE [1]` and `Bar [1]` have the kinds `line`
and `bar`. A title in quotes may be empty: `line "" [1]` has the StringLiteral
with the empty value as its title. [fixture: xychart/db-line-values] [fixture:
xychart/db-bar-values] [fixture: xychart/db-line-title-bare] [fixture:
xychart/db-bar-title-quoted] [fixture: xychart/db-plot-upper-case-keyword]
[fixture: xychart/db-plot-capitalized-keyword] [fixture:
xychart/db-grid-empty-plot-title-quoted]

### XychartValue

A value of a plot, with its label or without one: `20 "peak"`, `15`.

| Field   | Type                  | Meaning                                       |
| ------- | --------------------- | --------------------------------------------- |
| `value` | NumericLiteral        | The number.                                   |
| `label` | StringLiteral or null | The string after it; null when there is none. |

Child fields: `value`, `label`. The number is written as the numbers of a
[range](#xychartrange): `-.5` has the value minus one half. A value of a bar may
have a label as well as a value of a line, and an empty string is a label with
the empty value: `bar [1 "a"]` has the label `a`, and `line [1 ""]` the label
with the empty value. How mermaid.js reads the labels into its Db, for a line
and for a bar, is in the summary of the tests package. [fixture:
xychart/db-label-one] [fixture: xychart/db-label-all] [fixture:
xychart/db-plot-values-decimal] [fixture: xychart/db-label-on-bar] [fixture:
xychart/db-label-empty-string]

### XychartAccTitleStatement

An `accTitle:` statement with its text.

| Field   | Type                   | Meaning                                                |
| ------- | ---------------------- | ------------------------------------------------------ |
| `value` | XychartLiteral or null | The text after `accTitle:`, up to the end of its line. |

Child fields: `value`. The whitespace after the `:` is read with it, line feeds
included, so the text starts on the first line that has one: `accTitle:`
followed by a line `line [1]` has the value `line [1]`. When no text follows up
to the end of the text, the value is null. The value is the text without the
whitespace at its ends. [fixture: xychart/db-acc-title] [fixture:
xychart/db-acc-title-takes-next-line] [fixture: xychart/db-acc-title-empty]
[fixture: xychart/db-acc-title-spaces-trimmed]

### XychartAccDescrStatement

An `accDescr:` statement with its text.

| Field   | Type                   | Meaning                                                |
| ------- | ---------------------- | ------------------------------------------------------ |
| `value` | XychartLiteral or null | The text after `accDescr:`, up to the end of its line. |

Child fields: `value`. As for XychartAccTitleStatement, the text starts on the
first line that has one, and the value is null when there is none. [fixture:
xychart/db-acc-descr] [fixture: xychart/db-acc-descr-takes-title-line] [fixture:
xychart/db-acc-descr-blank-lines-then-text]

### XychartAccDescrBlockStatement

An `accDescr { … }` statement with its text, or without text: an empty
description block.

| Field    | Type                   | Meaning                                                                                                                 |
| -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `value`  | XychartLiteral or null | The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace lies between them. |
| `closed` | boolean                | Whether the block ends with `}`.                                                                                        |

Child fields: `value`. `accDescr {}`, `accDescr { }`, and a block of blank lines
have the value null. A block that is not closed runs to the end of the text:
`accDescr {`, a line break, and `a` at the end of the text has the value `a` and
is not closed. An empty description block is a statement only where a statement
starts; elsewhere it makes the input rejected (see
[Empty description blocks](../diagrams/xychart.md#empty-description-blocks)).
[fixture: xychart/db-acc-descr-block] [fixture:
xychart/db-acc-descr-block-empty] [fixture:
xychart/db-acc-descr-empty-block-spaces-then-plot] [fixture:
xychart/db-acc-descr-empty-block-line-feed-inside] [fixture:
xychart/db-acc-descr-unclosed-block] [fixture:
xychart/div-empty-description-block-inside-title-text]

### XychartLiteral

A text without quotes, or the text of an accessibility statement.

| Field   | Type   | Meaning                                                                                                                           |
| ------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `value` | string | For a text without quotes, the texts of its units joined; for an accessibility text, the text without the whitespace at its ends. |

No child fields. A text without quotes is one or more units of word characters,
with whitespace between them or not, and its value leaves the whitespace out:
`title Two words` has the value `Twowords`, `x-axis [a b c]` the category `abc`,
and `title a-b_c.d+e=f*g&h#i1` the value of the same text. It holds digits as
written where its context reads them as characters of a word: `title 2024`,
`line -5 [2]`, and the categories of `x-axis [1.5, -2]` have the values `2024`,
`-5`, `1.5`, and `-2`. An accessibility text keeps the whitespace between its
characters: `accTitle: a b` has the value `a b`. [fixture:
xychart/db-title-bare-words] [fixture: xychart/db-x-axis-band-words] [fixture:
xychart/db-title-bare-characters] [fixture: xychart/db-title-bare-number]
[fixture: xychart/db-plot-title-negative-number] [fixture:
xychart/db-x-axis-band-decimal-and-negative] [fixture:
xychart/db-acc-title-spaces-trimmed]
