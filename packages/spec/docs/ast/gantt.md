# Gantt nodes

Japanese version: [gantt.ja.md](./gantt.ja.md)

This document defines the nodes of the tree for the diagram type `gantt`. The
shared parts of the tree are defined in [ast.md](../ast.md); how the source is
read, and which grammar rule makes which node, is defined in
[diagrams/gantt.md](../diagrams/gantt.md).

The body of this diagram type is a [GanttDiagram](#ganttdiagram). The values of
the fields keep what the author wrote, as [ast.md](../ast.md#nodes) defines the
written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). A value starts or ends with
whitespace only where its units hold it as their own characters, as mermaid.js
reads it (see [Nodes](../ast.md#nodes)): in this diagram type, a task
description, which keeps the whitespace before its colon; a title, a section
name, and the value of a setting, which keep the whitespace at their ends; and a
callback name, which keeps the whitespace and line feeds before its `(`.
Elsewhere, the whitespace at the ends of a value is outside it.

A **task** is a bar of the chart, with a description and data that say when it
starts and ends; a **section** groups the tasks after it; a **click statement**
binds a link or a callback to tasks by their ids.

## Nodes

### GanttDiagram

| Field  | Type                   | Meaning                          |
| ------ | ---------------------- | -------------------------------- |
| `body` | list of GanttStatement | The statements, in source order. |

Child fields: `body`. The header keyword is not a field.

**GanttStatement** is a GanttTaskStatement, GanttClickStatement,
GanttDateFormatStatement, GanttAxisFormatStatement, GanttTickIntervalStatement,
GanttTodayMarkerStatement, GanttIncludesStatement, GanttExcludesStatement,
GanttInclusiveEndDatesStatement, GanttWeekdayStatement, GanttWeekendStatement,
GanttTitleStatement, GanttSectionStatement, GanttAccTitleStatement,
GanttAccDescrStatement, GanttAccDescrBlockStatement, or GanttIgnoredStatement.

A line break belongs to no statement, and an empty line makes no node. The child
fields of every node below are in source order, except those of
GanttClickStatement, which keep one order (see [Nodes](../ast.md#nodes)).

### GanttTaskStatement

A task: a description, a colon, and data of items separated by commas, such as
`Design :done, des1, 2024-01-06, 2d`.

| Field         | Type                           | Meaning                                                                                                                                |
| ------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `description` | GanttLiteral                   | The text before the colon, as written, the whitespace before the colon included.                                                       |
| `tags`        | list of Identifier             | The tags at the front of the data, in source order: each one of `active`, `done`, `crit`, `milestone`, and `vert`; empty when none.    |
| `items`       | list of (GanttLiteral or null) | The items after the tags, in source order, each without the whitespace at its ends; null for an item that is empty or whitespace only. |

Child fields: `description`, `tags`, `items`. The items of the data are the
stretches between the colon, the commas, and the end of the line; there is one
more than there are commas (see [Tasks](../diagrams/gantt.md#tasks)). The tags
are the items taken from the front as long as the first remaining item is one of
the five words in that case; the rest are the `items`. mermaid.js reads the
items by their number: one is the end; two are the start and the end; three are
the id, the start, and the end; four or more are not read, and the task has no
id, no start, and no end. `tags` and `items` together hold every item, so
`items` is empty only when the data holds tags only, which makes the input
rejected (see
[Rejections outside the grammar](../diagrams/gantt.md#rejections-outside-the-grammar)).
A tag is one `data-item` unit, a text unit, so a directive may lie inside it,
and its name is the written text without the directive: `do%%{init: {}}%%ne` is
the tag `done`, as in mermaid.js (see
[Directives inside units](../diagrams/gantt.md#directives-inside-units)).
[fixture: gantt/gram-task-tag-cut-by-directive] `a : 1d` has the description
`a ` and the one item `1d`; `a : done, 1d` the tag `done` and the item `1d`;
`a : , ,` three null items; `a : id1,, 1d` the items `id1`, null, and `1d`; and
`a : my id, after a b, until c` the items `my id`, `after a b`, and `until c`.
[fixture: gantt/gram-task] [fixture: gantt/gram-task-one-item] [fixture:
gantt/gram-task-tag-then-item] [fixture: gantt/gram-task-two-tags] [fixture:
gantt/gram-task-tag-repeated] [fixture: gantt/gram-task-tags-upper-case]
[fixture: gantt/gram-task-tag-after-item] [fixture: gantt/gram-task-empty-items]
[fixture: gantt/gram-task-empty-middle-item] [fixture:
gantt/gram-task-trailing-comma] [fixture: gantt/gram-task-four-items] [fixture:
gantt/gram-task-id-with-spaces] [fixture: gantt/gram-task-after-ids] [fixture:
gantt/gram-task-until] [fixture: gantt/lex-task-text-trailing-spaces] [fixture:
gantt/gram-task-tags-only]

### GanttClickStatement

A `click` statement: the ids of tasks and a link, a callback, or both, such as
`click des1 href "https://example.com"` and `click des1 call cb(1) href "u"`.

| Field  | Type                         | Meaning                                                                                                                 |
| ------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `ids`  | list of (Identifier or null) | The ids after `click`, separated by `,` units, in source order; null for an id with no character, as in `id1,` and `,`. |
| `call` | GanttCallback or null        | The call part; null when there is none.                                                                                 |
| `href` | StringLiteral or null        | The URL of the link part, a string in double quotes; null when there is none.                                           |

Child fields: `ids`, `call`, `href`. At least one of `call` and `href` is not
null. The two parts may be written in either order, and the child fields keep
this order whatever the source order (see [Nodes](../ast.md#nodes)); a tool that
needs the source order sorts them by their ranges. An id is a name without
whitespace, in which `,` is the separator and every other character, `:` and `"`
among them, is a character of the id, so it is an
[Identifier](../ast.md#identifier). The ids are not resolved: an id that names
no task is in the list as written. The URL is never empty and always closed (see
[The href context](../diagrams/gantt.md#the-href-context)). [fixture:
gantt/gram-click-href] [fixture: gantt/gram-click-call] [fixture:
gantt/gram-click-href-then-call] [fixture: gantt/gram-click-call-then-href]
[fixture: gantt/gram-click-ids-list] [fixture:
gantt/gram-click-ids-trailing-comma] [fixture: gantt/gram-click-ids-comma-only]
[fixture: gantt/gram-click-ids-two-commas] [fixture: gantt/gram-click-id-colon]
[fixture: gantt/gram-click-id-quotes] [fixture: gantt/gram-click-unknown-id]
[fixture: gantt/gram-click-href-line-feed-inside]

### GanttCallback

The call part of a click statement: a callback name and its arguments.

| Field  | Type                 | Meaning                                                                                                                     |
| ------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `name` | GanttLiteral         | The text between the whitespace after `call` and the `(`, as written, whitespace and line feeds at its end included.        |
| `args` | GanttLiteral or null | The text between the parentheses, as written, whitespace at its ends included; null when only whitespace lies between them. |

Child fields: `name`, `args`. `call f()` has the name `f` and null arguments,
`call f ()` the name `f` and a space, `call f( )` null arguments, `call f( 1)`
the arguments of a space and `1`, and `call f(a, "b,c")` the arguments
`a, "b,c"`, which mermaid.js splits only when it binds the callback. [fixture:
gantt/gram-click-call] [fixture:
gantt/gram-click-call-name-space-before-parenthesis] [fixture:
gantt/gram-click-call-name-line-feed-before-parenthesis] [fixture:
gantt/gram-click-call-blank-arguments] [fixture:
gantt/gram-click-call-arguments-leading-space] [fixture:
gantt/gram-click-call-arguments-quoted-comma] [fixture:
gantt/gram-click-call-arguments-line-feed]

### GanttDateFormatStatement

A `dateFormat` statement.

| Field   | Type         | Meaning                                                                           |
| ------- | ------------ | --------------------------------------------------------------------------------- |
| `value` | GanttLiteral | The text after `dateFormat` and one whitespace character, to the end of the line. |

Child fields: `value`. The value keeps the whitespace at its ends: `dateFormat`
and two spaces before `X` has the value of a space and `X`. The text ends before
`#`, `;`, and a line feed (see
[The statement context](../diagrams/gantt.md#the-statement-context)). [fixture:
gantt/db-date-format] [fixture: gantt/lex-dateformat-two-spaces] [fixture:
gantt/lex-dateformat-trailing-spaces]

### GanttAxisFormatStatement

An `axisFormat` statement.

| Field   | Type         | Meaning                                                                           |
| ------- | ------------ | --------------------------------------------------------------------------------- |
| `value` | GanttLiteral | The text after `axisFormat` and one whitespace character, to the end of the line. |

Child fields: `value`. As for GanttDateFormatStatement. [fixture:
gantt/db-axis-format]

### GanttTickIntervalStatement

A `tickInterval` statement.

| Field   | Type         | Meaning                                                                             |
| ------- | ------------ | ----------------------------------------------------------------------------------- |
| `value` | GanttLiteral | The text after `tickInterval` and one whitespace character, to the end of the line. |

Child fields: `value`. As for GanttDateFormatStatement. [fixture:
gantt/db-tick-interval]

### GanttTodayMarkerStatement

A `todayMarker` statement.

| Field   | Type         | Meaning                                                                            |
| ------- | ------------ | ---------------------------------------------------------------------------------- |
| `value` | GanttLiteral | The text after `todayMarker` and one whitespace character, to the end of the line. |

Child fields: `value`. The text may hold `#` and ends before `;` and a line
feed. [fixture: gantt/db-today-marker] [fixture: gantt/db-today-marker-off]
[fixture: gantt/lex-todaymarker-hash]

### GanttIncludesStatement

An `includes` statement: the dates and days that the chart counts as working
time.

| Field   | Type               | Meaning                                                                                             |
| ------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| `items` | list of Identifier | The items of the list text, separated by whitespace or `,` units, in source order; empty when none. |

Child fields: `items`. An item is a maximal run of characters that are neither
whitespace nor `,`, so it is an [Identifier](../ast.md#identifier); it keeps its
case, which mermaid.js lowers. Commas with nothing between them, and a list text
of whitespace only, give no item. [fixture: gantt/db-includes-tokens] [fixture:
gantt/lex-excludes-commas-and-spaces] [fixture:
gantt/lex-excludes-upper-case-items] [fixture: gantt/lex-excludes-empty-items]
[fixture: gantt/lex-excludes-whitespace-value]

### GanttExcludesStatement

An `excludes` statement: the dates and days that the chart leaves out.

| Field   | Type               | Meaning                                                    |
| ------- | ------------------ | ---------------------------------------------------------- |
| `items` | list of Identifier | The items of the list text, as for GanttIncludesStatement. |

Child fields: `items`. [fixture: gantt/db-excludes-tokens] [fixture:
gantt/db-excludes-merged-lines]

### GanttInclusiveEndDatesStatement

An `inclusiveEndDates` statement. A node with no other fields and no child
fields. [fixture: gantt/db-inclusive-end-dates]

### GanttWeekdayStatement

A `weekday` statement: the first day of the week.

| Field | Type   | Meaning                                                                                                 |
| ----- | ------ | ------------------------------------------------------------------------------------------------------- |
| `day` | string | One of `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, and `sunday`, in lower case. |

No child fields. The day is a word from a fixed set, so it is a string field, in
lower case whatever its case in the text; the token keeps the written case.
[fixture: gantt/db-weekday-last-wins] [fixture: gantt/lex-day-mixed-case]

### GanttWeekendStatement

A `weekend` statement: the first day of the weekend.

| Field | Type   | Meaning                                |
| ----- | ------ | -------------------------------------- |
| `day` | string | `friday` or `saturday`, in lower case. |

No child fields. [fixture: gantt/db-weekend-friday] [fixture:
gantt/db-weekend-saturday]

### GanttTitleStatement

A `title` statement.

| Field   | Type         | Meaning                                                                      |
| ------- | ------------ | ---------------------------------------------------------------------------- |
| `value` | GanttLiteral | The text after `title` and one whitespace character, to the end of the line. |

Child fields: `value`. The value keeps the whitespace at its ends and holds `:`,
`#`, `;`, and `%%` as characters. [fixture: gantt/db-title-statement] [fixture:
gantt/lex-title-two-spaces] [fixture: gantt/lex-title-trailing-spaces] [fixture:
gantt/lex-title-hash-semicolon-percent]

### GanttSectionStatement

A `section` statement.

| Field  | Type         | Meaning                                                                        |
| ------ | ------------ | ------------------------------------------------------------------------------ |
| `name` | GanttLiteral | The text after `section` and one whitespace character, to the end of the line. |

Child fields: `name`. The name is a text that may contain whitespace, which
nothing refers to, so it is a GanttLiteral; it keeps the whitespace at its ends.
[fixture: gantt/db-sections] [fixture: gantt/lex-section-two-spaces] [fixture:
gantt/lex-section-trailing-spaces]

### GanttAccTitleStatement

An `accTitle:` statement with its text.

| Field   | Type         | Meaning                                                |
| ------- | ------------ | ------------------------------------------------------ |
| `value` | GanttLiteral | The text after `accTitle:`, up to the end of its line. |

Child fields: `value`. The whitespace after the `:` is read with it, line feeds
included, so the text starts on the first line that has one, and the value is
never null: `accTitle:` with nothing after it is rejected. The value is the text
without the whitespace at its ends. [fixture: gantt/gram-acc-title] [fixture:
gantt/gram-acc-title-line-feed-then-text] [fixture: gantt/lex-acc-title-at-end]
[fixture: gantt/gram-acc-title-trailing-spaces]

### GanttAccDescrStatement

An `accDescr:` statement with its text.

| Field   | Type         | Meaning                                                |
| ------- | ------------ | ------------------------------------------------------ |
| `value` | GanttLiteral | The text after `accDescr:`, up to the end of its line. |

Child fields: `value`. As for GanttAccTitleStatement, the value is never null.
[fixture: gantt/gram-acc-descr] [fixture: gantt/lex-acc-descr-at-end]

### GanttAccDescrBlockStatement

An `accDescr { … }` statement with its text, or without text: an empty
description block, which changes nothing. The block is always closed: the text
may not end inside it.

| Field   | Type                 | Meaning                                                                                                                 |
| ------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `value` | GanttLiteral or null | The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace lies between them. |

Child fields: `value`. `accDescr {}`, `accDescr { }`, and a block of blank lines
have the value null and change nothing. Such a block is a statement only where a
statement starts; a block inside a click statement makes the input rejected (see
[Empty description blocks](../diagrams/gantt.md#empty-description-blocks)).
[fixture: gantt/gram-acc-descr-block] [fixture:
gantt/gram-acc-descr-block-multiline] [fixture:
gantt/gram-acc-descr-block-empty] [fixture:
gantt/gram-acc-descr-block-whitespace-only] [fixture:
gantt/div-empty-description-block-between-click-id-and-href] [fixture:
gantt/lex-acc-descr-block-unclosed]

### GanttIgnoredStatement

An empty href, `href ""`, or an empty call, `call ()`, where a statement starts:
text that mermaid.js reads no token for and that changes nothing (see
[Empty hrefs and empty calls](../diagrams/gantt.md#empty-hrefs-and-empty-calls)).

| Field   | Type   | Meaning                                                                                                 |
| ------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)): from the keyword to the closing quote or parenthesis. |

No child fields. The whitespace between its units is part of the value:
`call ( )` has the value `call ( )`, and `call (`, a line feed, and `)` the
value with the line feed. [fixture: gantt/gram-empty-href-line] [fixture:
gantt/gram-empty-call-line] [fixture: gantt/gram-empty-call-space-inside]
[fixture: gantt/gram-empty-call-line-feed-inside] [fixture:
gantt/gram-click-href-then-empty-href]

### GanttLiteral

A text without quotes that may contain whitespace: a task description, an item
of task data, a title, a section name, the value of a setting, a callback name,
callback arguments, and an accessibility text.

| Field   | Type   | Meaning                                          |
| ------- | ------ | ------------------------------------------------ |
| `value` | string | Its written text (see [Nodes](../ast.md#nodes)). |

No child fields. Each GanttLiteral is one unit, so its value is the text of that
unit as written: a description keeps the whitespace before the colon, a title, a
section name, and a setting keep the whitespace at their ends, a callback name
keeps the whitespace and line feeds before the `(`, and callback arguments keep
the whitespace at their ends; an item of task data has none, and an
accessibility text is read without the whitespace at its ends, which mermaid.js
trims. A line feed inside callback arguments, a callback name, or a description
block is part of the value. [fixture: gantt/lex-task-text-trailing-spaces]
[fixture: gantt/lex-title-two-spaces] [fixture: gantt/lex-title-trailing-spaces]
[fixture: gantt/lex-dateformat-two-spaces] [fixture:
gantt/gram-click-call-name-space-before-parenthesis] [fixture:
gantt/gram-click-call-arguments-leading-space] [fixture:
gantt/lex-task-items-nbsp-trimmed] [fixture:
gantt/gram-acc-title-trailing-spaces] [fixture:
gantt/gram-click-call-arguments-line-feed] [fixture:
gantt/gram-acc-descr-block-multiline]
