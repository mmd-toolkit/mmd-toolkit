# Timeline nodes

Japanese version: [timeline.ja.md](./timeline.ja.md)

This document defines the nodes of the tree for the diagram type `timeline`. The
shared parts of the tree are defined in [ast.md](../ast.md); how the source is
read, and which grammar rule makes which node, is defined in
[diagrams/timeline.md](../diagrams/timeline.md).

The body of this diagram type is a [TimelineDiagram](#timelinediagram). The
values of the fields keep what the author wrote, as [ast.md](../ast.md#nodes)
defines the written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). A value starts or ends with
whitespace only where its unit holds it as its own characters, as mermaid.js
reads it (see [Nodes](../ast.md#nodes)): in this diagram type, a period, which
keeps the whitespace before its colon, `#`, or line feed, an event, a title, and
a section name, which keep the whitespace at their ends. An accessibility text
is read without the whitespace at its ends.

A **period** is a point of the timeline, such as a year, with the **events**
written for it; a **section** groups the periods after it.

This diagram type has no strings in quotes, so no node of it is a StringLiteral:
a `"` in a period or an event is a character of the text. [fixture:
timeline/db-event-quotes-and-brackets]

## Nodes

### TimelineDiagram

| Field       | Type                      | Meaning                                                                    |
| ----------- | ------------------------- | -------------------------------------------------------------------------- |
| `direction` | string or null            | The direction of the header as written, `LR` or `TD` in any case; or null. |
| `body`      | list of TimelineStatement | The statements, in source order.                                           |

Child fields: `body`. The header keyword is not a field. The direction is the
keyword after `timeline` and spaces or tabs on the header line, without
whitespace, as written: `timeline td` has the direction `td`, which the Db reads
as `TD`; without one, the Db reads `LR`. [fixture: timeline/db-direction-td]
[fixture: timeline/db-direction-lower-case] [fixture: timeline/db-header-only]

**TimelineStatement** is a TimelinePeriodStatement, TimelineEventStatement,
TimelineTitleStatement, TimelineSectionStatement, TimelineAccTitleStatement,
TimelineAccDescrStatement, or TimelineAccDescrBlockStatement.

A line break belongs to no statement, and an empty line makes no node. Several
statements may share a line, and a statement may run over lines. The child
fields of every node below are in source order.

### TimelinePeriodStatement

A period with the events that follow it: `2004 : Facebook : Google`, and the
same with `: Google` on the next line.

| Field    | Type                    | Meaning                                                           |
| -------- | ----------------------- | ----------------------------------------------------------------- |
| `period` | TimelineLiteral         | The period, as written.                                           |
| `events` | list of TimelineLiteral | The events right after the period, in source order; may be empty. |

Child fields: `period`, `events`. The events of a period are the events that
follow its period with nothing between them but whitespace, line breaks, and
comments: on the line of the period, as in `a : e1 : e2`, and on the lines after
it, as in `a` followed by lines `: e1` and `: e2`, also after an empty line, a
comment line, or a line `# c`. An event after any other statement is a
[TimelineEventStatement](#timelineeventstatement). [fixture:
timeline/db-event-two-on-a-line] [fixture: timeline/db-event-own-line] [fixture:
timeline/db-event-own-line-after-event] [fixture:
timeline/db-event-own-line-after-blank-line] [fixture:
timeline/db-event-own-line-after-comment-line] [fixture:
timeline/db-event-own-line-after-hash-line] [fixture: timeline/db-everything]

The period keeps the whitespace before the colon, `#`, or line feed that ends
it: `a : e` has the period `a `, `a: e` the period `a`. An event is the text
after its colon and one whitespace character, which may be a line feed, and
keeps the rest of the whitespace at its ends; it may be whitespace only, and it
holds `:` where no whitespace follows it: `a :   e` has the event `  e`, `a :`
and two spaces the event of one space, and `a : b:c` the event `b:c`. [fixture:
timeline/db-period-and-event] [fixture:
timeline/db-period-colon-glued-to-period] [fixture:
timeline/db-event-leading-spaces] [fixture: timeline/db-event-two-spaces]
[fixture: timeline/db-event-colon-glued-inside] [fixture:
timeline/db-event-line-feed-after-colon]

### TimelineEventStatement

Events after a statement that is not a period: after a title, a section, an
accessibility statement, or an empty description block.

| Field    | Type                    | Meaning                                    |
| -------- | ----------------------- | ------------------------------------------ |
| `events` | list of TimelineLiteral | The events, in source order; at least one. |

Child fields: `events`. Its events are those that follow one another with
nothing between them but whitespace, line breaks, and comments, as for a
TimelinePeriodStatement. mermaid.js gives them to the last period before them,
across the statements between: in `a`, `section S`, and `: e` on three lines,
the event `e` belongs to the period `a`, in the section before `S`, and in
`section S : x` after a period, `x` belongs to that period. An event statement
before the first period makes the input rejected (see
[Rejections outside the grammar](../diagrams/timeline.md#rejections-outside-the-grammar)).
[fixture: timeline/db-event-after-section-joins-earlier-task] [fixture:
timeline/db-section-with-event-after-task] [fixture:
timeline/db-event-own-line-after-title] [fixture:
timeline/db-event-own-line-after-acc-title] [fixture:
timeline/db-event-own-line-after-acc-descr-block] [fixture:
timeline/gram-event-after-empty-description-block] [fixture:
timeline/gram-event-first]

### TimelineTitleStatement

A `title` statement.

| Field   | Type            | Meaning                                                                 |
| ------- | --------------- | ----------------------------------------------------------------------- |
| `value` | TimelineLiteral | The text after `title` and one whitespace character, up to a line feed. |

Child fields: `value`. The value keeps the whitespace at its ends and holds `:`,
`#`, and `%%` as characters. [fixture: timeline/db-title-statement] [fixture:
timeline/db-title-two-spaces] [fixture: timeline/db-title-trailing-spaces]
[fixture: timeline/db-title-colon] [fixture: timeline/db-title-hash] [fixture:
timeline/db-title-percent]

### TimelineSectionStatement

A `section` statement.

| Field  | Type            | Meaning                                                                            |
| ------ | --------------- | ---------------------------------------------------------------------------------- |
| `name` | TimelineLiteral | The text after `section` and one whitespace character, up to a `:` or a line feed. |

Child fields: `name`. The name is a text that may contain whitespace, which
nothing refers to, so it is a TimelineLiteral; it keeps the whitespace at its
ends, and a name of whitespace only is a value of that whitespace. The periods
after a section statement belong to it. [fixture: timeline/db-section-statement]
[fixture: timeline/db-section-two-spaces] [fixture:
timeline/db-section-trailing-spaces] [fixture: timeline/db-section-only-space]
[fixture: timeline/db-section-two-with-tasks]

### TimelineAccTitleStatement

An `accTitle:` statement with its text.

| Field   | Type            | Meaning                                                |
| ------- | --------------- | ------------------------------------------------------ |
| `value` | TimelineLiteral | The text after `accTitle:`, up to the end of its line. |

Child fields: `value`. The whitespace after the `:` is read with it, line feeds
included, so the text starts on the first line that has one, and the value is
never null: `accTitle:` with nothing after it is rejected. The value is the text
without the whitespace at its ends. [fixture: timeline/db-acc-title-statement]
[fixture: timeline/lex-acc-title-value-on-next-line] [fixture:
timeline/gram-acc-title-empty] [fixture: timeline/db-acc-title-trailing-spaces]

### TimelineAccDescrStatement

An `accDescr:` statement with its text.

| Field   | Type            | Meaning                                                |
| ------- | --------------- | ------------------------------------------------------ |
| `value` | TimelineLiteral | The text after `accDescr:`, up to the end of its line. |

Child fields: `value`. As for TimelineAccTitleStatement, the value is never
null. [fixture: timeline/db-acc-descr-statement] [fixture:
timeline/gram-acc-descr-empty]

### TimelineAccDescrBlockStatement

An `accDescr { … }` statement with its text, or without text: an empty
description block, which changes nothing. The block is always closed: the text
may not end inside it.

| Field   | Type                    | Meaning                                                                                                                                               |
| ------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value` | TimelineLiteral or null | The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace, directives, and comment lines lie between them. |

Child fields: `value`. `accDescr {}`, a block of whitespace and line breaks
only, and a block of directives or comment lines only have the value null and
change nothing: a description written before such a block stays. [fixture:
timeline/gram-empty-description-block-directive-only] [fixture:
timeline/gram-empty-description-block-comment-line-only] [fixture:
timeline/gram-empty-description-block-keeps-description] [fixture:
timeline/db-acc-descr-block] [fixture: timeline/db-acc-descr-block-braces-only]
[fixture: timeline/db-acc-descr-block-empty] [fixture:
timeline/gram-acc-descr-block-unclosed]

### TimelineLiteral

A text without quotes that may contain whitespace: a period, an event, a title,
a section name, and an accessibility text.

| Field   | Type   | Meaning                                          |
| ------- | ------ | ------------------------------------------------ |
| `value` | string | Its written text (see [Nodes](../ast.md#nodes)). |

No child fields. Each TimelineLiteral is one unit, so its value is the text of
that unit as written: a period keeps the whitespace before what ends it, an
event, a title, and a section name keep the whitespace at their ends, and an
accessibility text is read without the whitespace at its ends, which mermaid.js
trims. A line feed inside a description block is part of the value. [fixture:
timeline/db-period-trailing-spaces] [fixture: timeline/db-event-trailing-spaces]
[fixture: timeline/db-title-trailing-spaces] [fixture:
timeline/db-section-trailing-spaces] [fixture:
timeline/db-acc-title-trailing-spaces] [fixture: timeline/db-acc-descr-block]
