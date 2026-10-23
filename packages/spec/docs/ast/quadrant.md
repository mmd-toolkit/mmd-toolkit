# Quadrant chart nodes

Japanese version: [quadrant.ja.md](./quadrant.ja.md)

This document defines the nodes of the tree for the diagram type
`quadrantChart`. The shared parts of the tree are defined in
[ast.md](../ast.md); how the source is read, and which grammar rule makes which
node, is defined in [diagrams/quadrant.md](../diagrams/quadrant.md).

The body of this diagram type is a [QuadrantDiagram](#quadrantdiagram). The
values of the fields keep what the author wrote, as [ast.md](../ast.md#nodes)
defines the written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). How mermaid.js reads the values into
its Db, such as the trimming of the texts and the order of the points, is in the
summary of the tests package.

A quadrant chart has two **axes**, each with a text at its start and a text at
its end, four **quadrants**, each with a text, and **points**, each with a name,
two coordinates, and styles, which a **class** of `classDef` may give too.

## Nodes

### QuadrantDiagram

| Field  | Type                      | Meaning                                       |
| ------ | ------------------------- | --------------------------------------------- |
| `body` | list of QuadrantStatement | The statements, in source order; may be none. |

Child fields: `body`. The header is not a field: there is one, and a second
header makes the input rejected. A line break, a `;`, an empty line, and an
empty statement belong to no statement and make no node. A text with a header
and no statement is accepted. [fixture: quadrant/spec-quadrant-jison-fe2d2340]
[fixture: quadrant/header-twice]

**QuadrantStatement** is a QuadrantTitleStatement, QuadrantAccTitleStatement,
QuadrantAccDescrStatement, QuadrantAccDescrBlockStatement,
QuadrantAxisStatement, QuadrantQuadrantStatement, QuadrantPointStatement, or
QuadrantClassDefStatement.

### QuadrantTitleStatement

`title` and the rest of its line: `title Reach and engagement`.

| Field   | Type                    | Meaning                                          |
| ------- | ----------------------- | ------------------------------------------------ |
| `value` | QuadrantLiteral or null | The text after `title`; null when there is none. |

Child fields: `value`. The value is the rest of the line without the whitespace
at its ends, the whitespace characters of Notation such as U+00A0 and U+3000
included, as mermaid.js reads a title: `title   T   ` has the value `T`,
`title`, U+00A0, and `T` the value `T`, and `title` alone or followed by U+3000
alone has the value null. [fixture: quadrant/db-title-nbsp-before-text]
[fixture: quadrant/db-title-ideographic-only] [fixture:
quadrant/db-ends-title-nbsp-end] [fixture:
quadrant/db-ends-title-nbsp-end-of-text] [fixture:
quadrant/db-ends-title-ideographic-end] [fixture:
quadrant/db-ends-title-ideographic-end-of-text] [fixture:
quadrant/db-ends-title-bom-end] [fixture:
quadrant/db-ends-title-bom-end-of-text] [fixture:
quadrant/db-ends-title-ls-end-of-text] [fixture:
quadrant/db-ends-title-ps-end-of-text] [fixture:
quadrant/db-title-spaces-trimmed] [fixture: quadrant/db-title-keyword-alone]

### QuadrantAccTitleStatement

An `accTitle:` statement with its text.

| Field   | Type            | Meaning                                                |
| ------- | --------------- | ------------------------------------------------------ |
| `value` | QuadrantLiteral | The text after `accTitle:`, up to the end of its line. |

Child fields: `value`. The whitespace after the `:` is read with it, line feeds
included, so the text starts on the first line that has one: `accTitle:`
followed by a line `title T` has the value `title T`. The value is the text
without the whitespace at its ends, the whitespace characters of Notation such
as U+00A0 included, as mermaid.js reads it, and is never empty: [fixture:
quadrant/db-ends-acc-title-nbsp-end] [fixture:
quadrant/db-ends-acc-title-nbsp-end-of-text] [fixture:
quadrant/db-ends-acc-title-ideographic-end] [fixture:
quadrant/db-ends-acc-title-ideographic-end-of-text] [fixture:
quadrant/db-ends-acc-title-bom-end] [fixture:
quadrant/db-ends-acc-title-bom-end-of-text] [fixture:
quadrant/db-ends-acc-title-ls-end-of-text] [fixture:
quadrant/db-ends-acc-title-ps-end-of-text] [fixture:
quadrant/db-acc-title-nbsp-after-colon] [fixture:
quadrant/db-acc-title-ideographic-after-colon] [fixture:
quadrant/db-acc-title-bom-after-colon] [fixture:
quadrant/db-acc-title-ls-after-colon] [fixture:
quadrant/db-acc-title-ps-after-colon] `accTitle:` with nothing after it but
whitespace up to the end of the text, also U+00A0 alone, is rejected, and
`accTitle:`, U+3000, a line break, and `title T` has the value `title T`.
[fixture: quadrant/gram-acc-title-nbsp-only] [fixture:
quadrant/db-acc-title-ideographic-then-next-line] [fixture:
quadrant/db-acc-title-next-line-keyword] [fixture:
quadrant/gram-unclosed-acc-title-at-end]

### QuadrantAccDescrStatement

An `accDescr:` statement with its text.

| Field   | Type            | Meaning                                                |
| ------- | --------------- | ------------------------------------------------------ |
| `value` | QuadrantLiteral | The text after `accDescr:`, up to the end of its line. |

Child fields: `value`. As for QuadrantAccTitleStatement, the text starts on the
first line that has one, has no whitespace of Notation at its ends, and is never
empty. [fixture: quadrant/db-ends-acc-descr-nbsp-end] [fixture:
quadrant/db-ends-acc-descr-nbsp-end-of-text] [fixture:
quadrant/db-ends-acc-descr-ideographic-end] [fixture:
quadrant/db-ends-acc-descr-ideographic-end-of-text] [fixture:
quadrant/db-ends-acc-descr-bom-end] [fixture:
quadrant/db-ends-acc-descr-bom-end-of-text] [fixture:
quadrant/db-ends-acc-descr-ls-end-of-text] [fixture:
quadrant/db-ends-acc-descr-ps-end-of-text] [fixture:
quadrant/db-acc-descr-nbsp-around-text] [fixture:
quadrant/db-acc-descr-next-line] [fixture:
quadrant/gram-unclosed-acc-descr-at-end]

### QuadrantAccDescrBlockStatement

An `accDescr { … }` statement with its text, or without text: an empty
description block.

| Field   | Type                    | Meaning                                                                                                                             |
| ------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `value` | QuadrantLiteral or null | The text between `accDescr {` and `}`, without the whitespace of Notation at its ends; null when only whitespace lies between them. |

Child fields: `value`. The block is always closed: the text may not end inside
it. `accDescr {`, `D`, `E`, and `}` on four lines have the value `D`, a line
feed, and `E`, and `accDescr {x`, U+00A0, and `}` the value `x`; [fixture:
quadrant/db-acc-descr-block-nbsp-before-brace-close] `accDescr {}`, `accDescr {`
and `}` on two lines, and a block of U+3000 alone have the value null and change
nothing: `accDescr: D` followed by `accDescr {`, U+3000, and `}` keeps the
description `D`. [fixture: quadrant/db-acc-descr-ideographic-block-keeps-line]
An empty description block is a statement only where a statement starts and
after the last unit of a statement; inside a statement it makes the input
rejected (see
[Empty description blocks](../diagrams/quadrant.md#empty-description-blocks)).
[fixture: quadrant/db-acc-descr-block-lines] [fixture:
quadrant/db-acc-descr-block-empty-braces] [fixture:
quadrant/db-acc-descr-block-empty] [fixture:
quadrant/gram-acc-descr-block-unclosed] [fixture:
quadrant/db-empty-block-after-point] [fixture:
quadrant/div-empty-block-between-point-and-styles]

### QuadrantAxisStatement

`x-axis` or `y-axis` with one text, or with two texts and the arrow between
them: `x-axis Low Reach --> High Reach`, `y-axis Low`, `y-axis Low -->`.

| Field   | Type                  | Meaning                                            |
| ------- | --------------------- | -------------------------------------------------- |
| `axis`  | string                | `x` or `y`.                                        |
| `start` | QuadrantLabel         | The text before the arrow, or the only text.       |
| `arrow` | boolean               | Whether the arrow is written.                      |
| `end`   | QuadrantLabel or null | The text after the arrow; null when there is none. |

Child fields: `start`, `end`. The axis is the letter of the keyword in lower
case, whatever the case in which it is written: `X-Axis L --> R` has the axis
`x`. The texts keep the order in which they are written, the left and the right
text of the x axis, and the bottom and the top text of the y axis. When `end` is
not null, `arrow` is true; `x-axis L -->` has the `arrow` true and the `end`
null, which mermaid.js reads differently from `x-axis L`. The length of the
arrow is not a field: `y-axis B ---> T` and `y-axis B --> T` have the same
fields. [fixture: quadrant/db-x-axis-upper-case] [fixture:
quadrant/db-y-axis-both] [fixture: quadrant/db-x-axis-left-with-arrow] [fixture:
quadrant/db-y-axis-bottom-only] [fixture: quadrant/db-y-axis-long-arrow]

### QuadrantQuadrantStatement

`quadrant-1` to `quadrant-4` with a text: `quadrant-1 We should expand`.

| Field      | Type          | Meaning                   |
| ---------- | ------------- | ------------------------- |
| `quadrant` | integer       | 1, 2, 3, or 4.            |
| `text`     | QuadrantLabel | The text of the quadrant. |

Child fields: `text`. The number is the digit of the keyword: `Quadrant-1 A` has
the quadrant 1, and `quadrant-10 A` the quadrant 1 and the text `0 A`. [fixture:
quadrant/db-quadrant-upper-case] [fixture: quadrant/db-quadrant-ten]

### QuadrantPointStatement

A point: `Campaign A: [0.3, 0.6]`,
`B:::c1: [0.45, 0.23] radius: 9, color: #f00`.

| Field       | Type                    | Meaning                                                 |
| ----------- | ----------------------- | ------------------------------------------------------- |
| `name`      | QuadrantLabel           | The name before the `:`.                                |
| `className` | Identifier or null      | The class name after `:::`; null when there is none.    |
| `x`         | QuadrantLiteral         | The first coordinate.                                   |
| `y`         | QuadrantLiteral         | The second coordinate.                                  |
| `styles`    | list of QuadrantLiteral | The styles after the `]`, in source order; may be none. |

Child fields: `name`, `className`, `x`, `y`, `styles`. A coordinate is a literal
whose value is its written text, not a number, since mermaid.js keeps the text
it read: `0.30`, `0x5`, and `0 3` are coordinates with those values. A class
name is any word of ASCII word characters, whether or not a `classDef` defines
it, and keeps its case: `A:::C1` has the class name `C1`. A style is the written
text between the `]` or a `,` and the next `,` or the end of the styles, without
the whitespace at its ends: `radius: 10, color: #f00` has the styles
`radius: 10` and `color: #f00`, and `radius:  10  ,  color:  #f00` the styles
`radius:  10` and `color:  #f00`. How mermaid.js reads a style into a name and a
value, and which styles it takes, is in the summary of the tests package and in
[Rejections outside the grammar](../diagrams/quadrant.md#rejections-outside-the-grammar).
[fixture: quadrant/db-point-plain] [fixture:
quadrant/db-point-coordinate-any-char-x] [fixture:
quadrant/db-point-coordinate-space-in-x] [fixture:
quadrant/db-point-long-fraction] [fixture: quadrant/db-class-plain] [fixture:
quadrant/db-class-upper-case] [fixture: quadrant/db-class-undefined] [fixture:
quadrant/db-style-two] [fixture: quadrant/db-style-space-around] [fixture:
quadrant/db-style-radius-colon-after]

### QuadrantClassDefStatement

`classDef` with the name of a class and its styles:
`classDef c1 radius: 5, color: #f00`.

| Field    | Type                    | Meaning                                    |
| -------- | ----------------------- | ------------------------------------------ |
| `name`   | QuadrantIdentifier      | The name of the class.                     |
| `styles` | list of QuadrantLiteral | The styles, in source order; at least one. |

Child fields: `name`, `styles`. The styles are written as those of a point. A
`classDef` without styles is rejected. [fixture: quadrant/db-classdef-color]
[fixture: quadrant/db-classdef-two-styles] [fixture:
quadrant/gram-classdef-no-style]

### QuadrantLabel

A text of an axis or of a quadrant, or the name of a point: words without
quotes, a string, or a markdown string, which words without quotes may follow.

| Field   | Type   | Meaning                                                                                                                                                              |
| ------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`  | string | `text`, `string`, or `markdown`: how the text starts.                                                                                                                |
| `value` | string | The content of the string or markdown string that it starts with, followed by the written text of the rest; for a text that starts without quotes, its written text. |

No child fields. A text without quotes keeps the whitespace between its words,
as mermaid.js reads it: `quadrant-1   A  b   ` has the value `A  b`, and
`quadrant-1 a`, a tab, and `b` the value `a`, a tab, and `b`. A string keeps
what lies between its quotes, the whitespace at its ends included: `x-axis "  "`
and `--> R` has the start with the kind `string` and the value of two spaces. A
markdown string leaves out its quotes and backquotes: ``"`A`": [0.3, 0.6]`` has
the name with the kind `markdown` and the value `A`. The words after a string
follow its content with the whitespace before them: `quadrant-1 "a" b` has the
kind `string` and the value `a b`, and ``quadrant-1 "`a`" b`` the kind
`markdown` and the value `a b`. [fixture: quadrant/db-quadrant-spaces-trimmed]
[fixture: quadrant/db-quadrant-tab-inside] [fixture:
quadrant/db-x-axis-spaces-only-string] [fixture: quadrant/db-name-markdown]
[fixture: quadrant/db-quadrant-quoted-then-bare] [fixture:
quadrant/db-quadrant-markdown-then-bare] [fixture:
quadrant/db-x-axis-quoted-glued-text]

### QuadrantLiteral

A title, an accessibility text, the text of a description block, a coordinate,
or a style.

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields. The value keeps the whitespace inside it, line feeds included,
and has none at its ends; for a title, an accessibility text, and the text of a
description block, the whitespace characters of Notation such as U+00A0 are
whitespace at its ends too: `accDescr {`, a line `  D`, a line `    E`, and `}`
has the value `D`, a line feed, four spaces, and `E`. [fixture:
quadrant/db-acc-descr-block-indented-lines] [fixture:
quadrant/db-point-coordinate-space-in-x]

### QuadrantIdentifier

The name of a class of `classDef`.

| Field  | Type   | Meaning                                          |
| ------ | ------ | ------------------------------------------------ |
| `name` | string | Its written text (see [Nodes](../ast.md#nodes)). |

No child fields. It is a name node of the diagram, not an
[Identifier](../ast.md#identifier), because the name may hold the whitespace
characters outside ASCII, such as U+00A0, which are characters of a word in this
diagram type: `classDef a`, U+00A0, `b color: #f00` defines the class whose name
is `a`, U+00A0, and `b`. The name holds no ASCII whitespace, and its dashes,
colons, and commas are part of it: `classDef c-1 color: #f00` defines `c-1`.
[fixture: quadrant/db-grid-nbsp-classdef-name] [fixture:
quadrant/db-classdef-dash-name] [fixture:
quadrant/db-classdef-name-colon-between-letters]
