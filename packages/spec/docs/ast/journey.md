# Journey nodes

Japanese version: [journey.ja.md](./journey.ja.md)

This document defines the nodes of the tree for the diagram type `journey`. The
shared parts of the tree are defined in [ast.md](../ast.md); how the source is
read, and which grammar rule makes which node, is defined in
[diagrams/journey.md](../diagrams/journey.md).

The body of this diagram type is a [JourneyDiagram](#journeydiagram). The values
of the fields keep what the author wrote, as [ast.md](../ast.md#nodes) defines
the written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). A value starts or ends with
whitespace only where its units hold it as their own characters, as mermaid.js
reads it (see [Nodes](../ast.md#nodes)): in this diagram type, a task
description, which keeps the whitespace before its colon, and a title and a
section name, which keep the whitespace at their ends. Elsewhere, the whitespace
at the ends of a value is outside it.

A **task** is a step of the journey, with a description, a score, and the people
who take part in it; a **section** groups the tasks after it.

This diagram type has no strings in quotes, so no node of it is a StringLiteral:
a `"` in a task text is a character of the text. [fixture:
journey/lex-quotes-in-task-text]

## Nodes

### JourneyDiagram

| Field  | Type                     | Meaning                          |
| ------ | ------------------------ | -------------------------------- |
| `body` | list of JourneyStatement | The statements, in source order. |

Child fields: `body`. The header keyword is not a field.

**JourneyStatement** is a JourneyTaskStatement, JourneyTitleStatement,
JourneySectionStatement, JourneyAccTitleStatement, JourneyAccDescrStatement, or
JourneyAccDescrBlockStatement.

A line break belongs to no statement, and an empty line makes no node. The child
fields of every node below are in source order.

### JourneyTaskStatement

A task: a description, a colon, and data, such as `Make tea: 5: Me, Cat`.

| Field         | Type                             | Meaning                                                                                                     |
| ------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `description` | JourneyLiteral                   | The text before the colon, as written, the whitespace before the colon included.                            |
| `score`       | JourneyLiteral or null           | The score part of the data, without the whitespace at its ends; null when it is empty or whitespace only.   |
| `people`      | list of (JourneyLiteral or null) | The people of the data, in source order, each without the whitespace at its ends; empty when there is none. |
| `textAfter`   | JourneyIgnoredText or null       | The text of the data from its third colon; null when the data has no third colon.                           |

Child fields: `description`, `score`, `people`, `textAfter`. The data runs from
the colon after the description to a `#`, a `;`, or the end of its line, and the
colons in it divide it into parts (see [Tasks](../diagrams/journey.md#tasks)):
the **score part** runs from the first colon to the second colon or the end of
the data, the **people part** from the second colon to the third colon or the
end of the data, and from the third colon on, the data is not read. mermaid.js
reads the score as the number that the score part writes, and a score part of
whitespace only as the number 0; a score that is no number is accepted. The
people part is divided by its commas into one more person than there are commas;
a person that is empty or whitespace only is a null element, which mermaid.js
reads as an empty name. Without a second colon, `people` is empty; with one, it
has at least one element.

`A: 5` has the score `5` and no people; `A: 3: Me, You ,  Them` the people `Me`,
`You`, and `Them`; `A: 3: a,,b` the people `a`, null, and `b`; `A: 3: ` and
`A: 5:` one null person; `A: : x` no score; `A:  3 : x` the score `3`;
`A: abc: x` the score `abc`; `A: 5, 6: Me` the score `5, 6`; and
`A: 3: a,b: c, d` the people `a` and `b` and the `textAfter` `: c, d`, and
`A: 5: Me:` the `textAfter` `:`. [fixture: journey/db-task-score-only] [fixture:
journey/db-task-people] [fixture: journey/db-task-people-empty-item] [fixture:
journey/db-task-people-blank] [fixture: journey/gram-task-second-colon-at-end]
[fixture: journey/db-task-score-empty] [fixture: journey/db-task-score-spaces]
[fixture: journey/db-task-score-not-a-number] [fixture:
journey/gram-task-score-comma] [fixture: journey/db-task-extra-colon] [fixture:
journey/gram-task-third-colon-at-end]

### JourneyTitleStatement

A `title` statement.

| Field   | Type           | Meaning                                                                                  |
| ------- | -------------- | ---------------------------------------------------------------------------------------- |
| `value` | JourneyLiteral | The text after `title` and one whitespace character, up to a `#`, a `;`, or a line feed. |

Child fields: `value`. The value keeps the whitespace at its ends and holds `:`
and `%%` as characters. [fixture: journey/db-title-statement] [fixture:
journey/lex-title-two-spaces] [fixture: journey/lex-title-trailing-spaces]
[fixture: journey/lex-title-colon-inside] [fixture:
journey/lex-title-percent-inside]

### JourneySectionStatement

A `section` statement.

| Field  | Type           | Meaning                                                                                           |
| ------ | -------------- | ------------------------------------------------------------------------------------------------- |
| `name` | JourneyLiteral | The text after `section` and one whitespace character, up to a `#`, a `:`, a `;`, or a line feed. |

Child fields: `name`. The name is a text that may contain whitespace, which
nothing refers to, so it is a JourneyLiteral; it keeps the whitespace at its
ends, and a name of whitespace only is a value of that whitespace. [fixture:
journey/db-sections] [fixture: journey/lex-section-two-spaces] [fixture:
journey/db-section-ends-at-hash] [fixture: journey/lex-section-whitespace-only]

### JourneyAccTitleStatement

An `accTitle:` statement with its text.

| Field   | Type           | Meaning                                                |
| ------- | -------------- | ------------------------------------------------------ |
| `value` | JourneyLiteral | The text after `accTitle:`, up to the end of its line. |

Child fields: `value`. The whitespace after the `:` is read with it, line feeds
included, so the text starts on the first line that has one, and the value is
never null: `accTitle:` with nothing after it is rejected. The value is the text
without the whitespace at its ends. [fixture: journey/db-acc-title] [fixture:
journey/gram-acc-title-line-feed-then-text] [fixture:
journey/lex-acc-title-at-end] [fixture: journey/gram-acc-title-trailing-spaces]

### JourneyAccDescrStatement

An `accDescr:` statement with its text.

| Field   | Type           | Meaning                                                |
| ------- | -------------- | ------------------------------------------------------ |
| `value` | JourneyLiteral | The text after `accDescr:`, up to the end of its line. |

Child fields: `value`. As for JourneyAccTitleStatement, the value is never null.
[fixture: journey/db-acc-descr] [fixture: journey/lex-acc-descr-at-end]

### JourneyAccDescrBlockStatement

An `accDescr { … }` statement with its text, or without text: an empty
description block, which changes nothing. The block is always closed: the text
may not end inside it.

| Field   | Type                   | Meaning                                                                                                                 |
| ------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `value` | JourneyLiteral or null | The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace lies between them. |

Child fields: `value`. `accDescr {}`, `accDescr { }`, and a block of blank lines
have the value null and change nothing. [fixture: journey/db-acc-descr-block]
[fixture: journey/gram-acc-descr-block-empty] [fixture:
journey/gram-acc-descr-block-whitespace-only] [fixture:
journey/lex-acc-descr-block-unclosed]

### JourneyLiteral

A text without quotes that may contain whitespace: a task description, a score,
a person, a title, a section name, and an accessibility text.

| Field   | Type   | Meaning                                          |
| ------- | ------ | ------------------------------------------------ |
| `value` | string | Its written text (see [Nodes](../ast.md#nodes)). |

No child fields. Each JourneyLiteral is one unit, so its value is the text of
that unit as written: a description keeps the whitespace before the colon, and a
title and a section name keep the whitespace at their ends; a score and a person
have none, and an accessibility text is read without the whitespace at its ends,
which mermaid.js trims. A line feed inside a description block is part of the
value. [fixture: journey/db-task-description-spaces] [fixture:
journey/lex-title-two-spaces] [fixture: journey/lex-title-trailing-spaces]
[fixture: journey/lex-task-score-nbsp-trimmed] [fixture:
journey/gram-acc-title-trailing-spaces] [fixture: journey/db-acc-descr-block]

### JourneyIgnoredText

Text that the author writes but that mermaid.js does not read: in this diagram
type, the text of task data from its third colon (see
[JourneyTaskStatement](#journeytaskstatement)).

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields. The value starts with the third colon and runs to the end of
the data, without the whitespace at its end; further colons are characters of
it: `A: 5: Me: x` followed by two spaces has the value `: x`. [fixture:
journey/db-task-extra-colon] [fixture: journey/gram-task-third-colon-at-end]
[fixture: journey/gram-task-four-colons] [fixture:
journey/gram-task-ignored-data-trailing-spaces]
