# User journey formatting rules

Japanese version: [journey.ja.md](./journey.ja.md)

How prettier-plugin-mmd formats a user journey. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. Many values of a user journey keep the
whitespace at their ends in the Db, so they are printed as written; the rules
say which whitespace is formatted.

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The statements after the header stand one level deeper than the header, and the
statements after a `section`, up to the next `section`, one level deeper still:
the tasks, and every other statement. The `section` itself stands at the first
level. The tree of a user journey is flat, with no block of statements, so the
level of a statement is decided by its place among the others. The tasks of a
section stand inside it, as the documentation of mermaid.js writes them, and as
in a Gantt chart. [fixture: indentation/sections-and-tasks-nested] [fixture:
indentation/statements-before-the-first-section] [fixture:
indentation/every-statement-under-a-section] [fixture:
indentation/consecutive-sections] A level is what Prettier's `useTabs` and
`tabWidth` options say: two spaces by default. [fixture:
indentation/tab-width-4] [fixture: indentation/use-tabs] The indentation written
in the input is not kept. Whitespace at the start of a line is nothing to
mermaid.js, so the printer chooses the indentation from the structure alone, and
one rule per level prints the same text whatever the input was indented with.
[fixture: indentation/written-indentation-dropped] The header stands at the
first column, also where whitespace was written before it. [fixture:
indentation/header-leading-whitespace] Values kept as written retain their
columns. Description-body lines instead stand one step inside their statement,
with a separate `}` at its level (see [Multi-line values](#multi-line-values)).
[fixture: indentation/description-block-under-a-section]

Input
([indentation/sections-and-tasks-nested-input.mmd](../tests/fixtures/journey/indentation/sections-and-tasks-nested-input.mmd)):

```mmd
journey
title My working day
section Go to work
Make tea: 5: Me
Go upstairs: 3: Me
section Go home
Go downstairs: 5: Me
```

Output
([indentation/sections-and-tasks-nested-output.mmd](../tests/fixtures/journey/indentation/sections-and-tasks-nested-output.mmd)):

```mmd
journey
  title My working day
  section Go to work
    Make tea: 5: Me
    Go upstairs: 3: Me
  section Go home
    Go downstairs: 5: Me
```

Input
([indentation/tab-width-4-input.mmd](../tests/fixtures/journey/indentation/tab-width-4-input.mmd)):

```mmd
journey
title T
section S
A: 5
```

Output
([indentation/tab-width-4-output.mmd](../tests/fixtures/journey/indentation/tab-width-4-output.mmd)):

```mmd
journey
    title T
    section S
        A: 5
```

### Statements one per line

Each statement stands on a line of its own. Nothing separates statements in a
user journey (diagrams/journey.md, Diagram and statements), and the header and
an `accDescr` block are followed on their line by the next statement: the
statement after either of them goes to a line of its own. [fixture:
statements-one-per-line/header-then-title] [fixture:
statements-one-per-line/header-then-task] [fixture:
statements-one-per-line/header-then-section] [fixture:
statements-one-per-line/description-block-then-task] [fixture:
statements-one-per-line/description-blocks-adjacent] The statements `title`,
`section`, `accTitle`, and `accDescr:` take the rest of their line, and so does
the data of a task, up to a `#`: `title T A: 5` is a title, and `A: 5 B: 3` is
one task, whose score part is `5 B`. Nothing follows them on their line.
[fixture: statements-one-per-line/title-takes-the-line] [fixture:
statements-one-per-line/second-task-is-data]

A statement that touches the one before it goes to a line of its own as well,
since mermaid.js reads both the same: the task `-x` after the header in
`journey-x: 1`, and a task after the `}` of an empty description block.
[fixture: statements-one-per-line/header-glued-task] [fixture:
statements-one-per-line/empty-description-block-glued-task] An empty description
block is a statement that changes nothing, wherever a statement starts, and
stands on a line of its own too. [fixture:
statements-one-per-line/empty-description-block-then-task] A directive between
two statements on a line moves with the statement after it. [fixture:
statements-one-per-line/directive-after-statement]

A line that holds a `;` keeps its statements together: the line rule of
mermaid.js removes the last `;` of a line that holds `style`, a `:` after it,
and a `#` after that, and moving a statement to a line of its own makes the rule
stop ignoring a `;`, or ignore another. After `accDescr { style:#x }`, `A;B: 5`
is the task `AB`, while `A;B: 5` on a line of its own is rejected, since the `;`
ends the task text and is taken by no rule. So the statements of such a line
stay on it, with the whitespace between them formatted as anywhere else, and the
`;` stays as written. [fixture:
statements-one-per-line/ignored-semicolon-line-kept]

Input
([statements-one-per-line/description-block-then-task-input.mmd](../tests/fixtures/journey/statements-one-per-line/description-block-then-task-input.mmd)):

```mmd
journey
accDescr { d } A: 5
```

Output
([statements-one-per-line/description-block-then-task-output.mmd](../tests/fixtures/journey/statements-one-per-line/description-block-then-task-output.mmd)):

```mmd
journey
  accDescr: d
  A: 5
```

Input
([statements-one-per-line/header-glued-task-input.mmd](../tests/fixtures/journey/statements-one-per-line/header-glued-task-input.mmd)):

```mmd
journey-x: 1
```

Output
([statements-one-per-line/header-glued-task-output.mmd](../tests/fixtures/journey/statements-one-per-line/header-glued-task-output.mmd)):

```mmd
journey
  -x: 1
```

Input
([statements-one-per-line/second-task-is-data-input.mmd](../tests/fixtures/journey/statements-one-per-line/second-task-is-data-input.mmd)):

```mmd
journey
A: 5 B: 3
```

Output
([statements-one-per-line/second-task-is-data-output.mmd](../tests/fixtures/journey/statements-one-per-line/second-task-is-data-output.mmd)):

```mmd
journey
  A: 5 B: 3
```

### Blank lines

Runs of empty lines become one empty line, and empty lines at the start and the
end of the body are dropped, as in the other diagram types. [fixture:
blank-lines/collapsed] [fixture: blank-lines/body-edges-dropped] The empty lines
around comment lines are handled in the same way. [fixture:
blank-lines/around-comment-lines] Empty lines around a `section` are kept, as
one, at the level of the lines next to them. [fixture:
blank-lines/around-sections]

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/journey/blank-lines/collapsed-input.mmd)):

```mmd
journey
title T



section S


A: 5
```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/journey/blank-lines/collapsed-output.mmd)):

```mmd
journey
  title T

  section S

    A: 5
```

Input
([blank-lines/around-sections-input.mmd](../tests/fixtures/journey/blank-lines/around-sections-input.mmd)):

```mmd
journey
title T


section S


A: 5


section U

B: 1

```

Output
([blank-lines/around-sections-output.mmd](../tests/fixtures/journey/blank-lines/around-sections-output.mmd)):

```mmd
journey
  title T

  section S

    A: 5

  section U

    B: 1
```

### Task data

A task is printed as its description, a colon, the score, a colon, the people,
and the text after a third colon. The description is printed as written, with
the whitespace between its text and the colon: that whitespace is part of the
description, which the Db keeps, so `Make tea  : 5` and `Make tea: 5` are
different tasks, and the padding that aligns the colons of a journey stays.
[fixture: task-data/colon-touches-description] [fixture:
task-data/description-padding-kept] A description may hold quotes, tags, `%`,
and keywords inside it. [fixture: task-data/special-characters-in-description]
[fixture: task-data/keywords-inside]

A score or a person stands after one space, after a colon and after a comma
alike; a colon and a comma touch what is before them. Whitespace around them is
not in the Db, and is not kept. The space is written only before a value, as in
a Gantt chart, which is the form of most task lines in the documentation of
mermaid.js. [fixture: task-data/colon-spacing] [fixture:
task-data/people-comma-spacing] An empty score or an empty person prints
nothing, so no space stands before it: `A: : Me` is printed `A:: Me`, and
`A: 3: a, ,b` is printed `A: 3: a,, b`. The empty people stay, since mermaid.js
reads each as a name. [fixture: task-data/empty-score] [fixture:
task-data/empty-people] [fixture: task-data/no-people-no-score]

The score and the people are printed as written: the whitespace inside a person
is part of it in the Db. The spelling of a score is the author's: mermaid.js
reads it as a number, and `05` and `5` give the same Db. [fixture:
task-data/people-inner-whitespace-kept] [fixture: task-data/score-forms-kept]
The whitespace at the end of the data is dropped. [fixture:
task-data/trailing-whitespace-dropped] The data ends at a `#`, which starts a
comment: one space stands before it where whitespace was written, and none where
it touches (see [Comments](#comments)). [fixture: task-data/hash-ends-the-data]

Data of whitespace only is a task with an empty score and no people, and
mermaid.js needs a character after the colon: `A: ` is a task, and `A:` is
rejected. So one whitespace character stays after the colon, the first one as
written, and the rest is dropped. Where a comment or another character follows
on the line, the line is printed as written, since the whitespace is read
together with it. [fixture: task-data/whitespace-only-data] [fixture:
task-data/whitespace-only-data-then-comment] A directive between the parts of a
task stays where it is (see [Directives](#directives)).

[test: U+00A0 as the entire data of a journey task] [test: U+2028 as the entire
data of a journey task] [test: U+2029 as the entire data of a journey task]

Input
([task-data/people-comma-spacing-input.mmd](../tests/fixtures/journey/task-data/people-comma-spacing-input.mmd)):

```mmd
journey
A: 3: Me,You,Them
B: 3: Me , You ,  Them
C: 3: Me, You
```

Output
([task-data/people-comma-spacing-output.mmd](../tests/fixtures/journey/task-data/people-comma-spacing-output.mmd)):

```mmd
journey
  A: 3: Me, You, Them
  B: 3: Me, You, Them
  C: 3: Me, You
```

Input
([task-data/empty-score-input.mmd](../tests/fixtures/journey/task-data/empty-score-input.mmd)):

```mmd
journey
A: : Me
B:  : Me, You
```

Output
([task-data/empty-score-output.mmd](../tests/fixtures/journey/task-data/empty-score-output.mmd)):

```mmd
journey
  A:: Me
  B:: Me, You
```

Input
([task-data/description-padding-kept-input.mmd](../tests/fixtures/journey/task-data/description-padding-kept-input.mmd)):

```mmd
journey
Make tea        : 5: Me
Go upstairs      : 3: Me
Do work          : 1: Me, Cat
```

Output
([task-data/description-padding-kept-output.mmd](../tests/fixtures/journey/task-data/description-padding-kept-output.mmd)):

```mmd
journey
  Make tea        : 5: Me
  Go upstairs      : 3: Me
  Do work          : 1: Me, Cat
```

### Ignored data

From the third colon, the data is not read by mermaid.js, and the tree keeps it
as text. It is printed as written, the colon included, and the colon touches
what is before it, whatever whitespace was written there, like the colons of the
task data. [fixture: ignored-data/third-colon-touches] [fixture:
ignored-data/text-as-written] [fixture: ignored-data/four-colons] The text
stands after an empty score or an empty person too. [fixture:
ignored-data/after-empty-people] The whitespace at its end is dropped. [fixture:
ignored-data/trailing-whitespace-dropped]

Input
([ignored-data/third-colon-touches-input.mmd](../tests/fixtures/journey/ignored-data/third-colon-touches-input.mmd)):

```mmd
journey
A: 5: Me  : x
B: 5: Me:x
C: 5: Me:   x
```

Output
([ignored-data/third-colon-touches-output.mmd](../tests/fixtures/journey/ignored-data/third-colon-touches-output.mmd)):

```mmd
journey
  A: 5: Me: x
  B: 5: Me:x
  C: 5: Me:   x
```

Input
([ignored-data/text-as-written-input.mmd](../tests/fixtures/journey/ignored-data/text-as-written-input.mmd)):

```mmd
journey
A: 5: Me: x,   y : z
B: 3: a,b: c, d
```

Output
([ignored-data/text-as-written-output.mmd](../tests/fixtures/journey/ignored-data/text-as-written-output.mmd)):

```mmd
journey
  A: 5: Me: x,   y : z
  B: 3: a, b: c, d
```

### Titles and sections

A `title` is printed with one space after the keyword, so that the separator has
one form, as in a Gantt chart, and the value without the whitespace at its start
or at its end, which the Db keeps and which is drawn without (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
`title   My trip  ` is printed `title My trip`. The name of a `section` is
printed as written, the whitespace at its start and at its end included: two
sections whose names differ by it are drawn apart, and would not be once it is
left out. A title of spaces and tabs only stays as written. [fixture:
titles-and-sections/title-padding-dropped] [fixture:
titles-and-sections/title-blank-kept] [fixture:
titles-and-sections/section-padding-kept] [fixture:
titles-and-sections/title-trailing-dropped-section-kept] [fixture:
titles-and-sections/one-space-after-keyword] A value written on a later line is
printed after the keyword on one line; a comment line between them makes the
statement printed as written (see
[Multi-line statements](#multi-line-statements)). [fixture:
titles-and-sections/value-on-next-line] [fixture:
titles-and-sections/comment-line-inside-kept] The value holds `:`, `%`, and `%%`
as characters, and ends at a `#`. [fixture:
titles-and-sections/special-characters-in-values] [fixture:
titles-and-sections/value-ends-at-hash] The whitespace before that `#` is part
of the value. For a `title` it is left out like the other whitespace at the end
of a title, and one space stands before the `#`; for a `section` it stays.
[fixture: titles-and-sections/title-hash-gap-one-space-section-kept] A directive
between the keyword and the value stays where it is (see
[Directives](#directives)). [fixture:
titles-and-sections/directive-between-keyword-and-value]

Input
([titles-and-sections/special-characters-in-values-input.mmd](../tests/fixtures/journey/titles-and-sections/special-characters-in-values-input.mmd)):

```mmd
journey
title a: b % c %% d
section x % y
```

Output
([titles-and-sections/special-characters-in-values-output.mmd](../tests/fixtures/journey/titles-and-sections/special-characters-in-values-output.mmd)):

```mmd
journey
  title a: b % c %% d
  section x % y
```

Input
([titles-and-sections/value-on-next-line-input.mmd](../tests/fixtures/journey/titles-and-sections/value-on-next-line-input.mmd)):

```mmd
journey
title
T
section
S
```

Output
([titles-and-sections/value-on-next-line-output.mmd](../tests/fixtures/journey/titles-and-sections/value-on-next-line-output.mmd)):

```mmd
journey
  title T
  section S
```

### Keyword case

The keywords `section` and `title` are printed in lower case, as the examples in
the documentation of mermaid.js write them (see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)).
mermaid.js reads them in any case and the Db is the same. [fixture:
keyword-case/keywords-one-form] The header `journey` is detected in lower case
only.

Input
([keyword-case/keywords-one-form-input.mmd](../tests/fixtures/journey/keyword-case/keywords-one-form-input.mmd)):

```mmd
journey
TITLE T
Section S
ACCTITLE: T
AccDescr: d
ACCDESCR { d }
```

Output
([keyword-case/keywords-one-form-output.mmd](../tests/fixtures/journey/keyword-case/keywords-one-form-output.mmd)):

```mmd
journey
  title T
  section S
    ACCTITLE: T
    AccDescr: d
    ACCDESCR: d
```

### Accessibility statements

The `:` of `accTitle` and `accDescr` touches the keyword and has one space after
it, as in a Gantt chart; the text has no whitespace at its ends. [fixture:
accessibility-statements/colon-touches-keyword] [fixture:
accessibility-statements/text-whitespace-dropped] The text holds `:`, `;`, `%`,
and `%%` as characters. [fixture:
accessibility-statements/special-characters-in-text] A text written on a later
line, or a colon written on a later line than the keyword, is printed on one
line. [fixture: accessibility-statements/text-on-next-line-joined] [fixture:
accessibility-statements/keyword-and-colon-over-lines-joined]

Where `accDescr` and `{` print on the same line, separate them by one space,
including when they were written touching. Existing opener-line breaks retain
their own rules. Protected trivia and semicolon layouts keep their gaps. Align
the lines of an `accDescr { ... }` body one step inside its statement. Mermaid
discards indentation after LF from the description. Its `}` stands at the level
of its statement; a text on the line of the `{` has one space inside each brace,
also where the braces touched it. [fixture:
accessibility-statements/block-lines-kept] [fixture:
accessibility-statements/block-text-on-opening-line] [fixture:
accessibility-statements/block-comment-and-empty-lines-kept] A run of spaces and
tabs inside the text is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
[fixture: accessibility-statements/block-inner-runs-collapsed] [fixture:
accessibility-statements/accessibility-lines-runs-collapsed] A directive between
the keyword and the colon or the brace, or after them, stays where it is.
[fixture: accessibility-statements/directive-around-colon-and-braces-kept]

Input
([accessibility-statements/text-on-next-line-joined-input.mmd](../tests/fixtures/journey/accessibility-statements/text-on-next-line-joined-input.mmd)):

```mmd
journey
accTitle:
T
accDescr:

d
```

Output
([accessibility-statements/text-on-next-line-joined-output.mmd](../tests/fixtures/journey/accessibility-statements/text-on-next-line-joined-output.mmd)):

```mmd
journey
  accTitle: T
  accDescr: d
```

Input
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/journey/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
journey
accDescr {
   a
  b
}
```

Output
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/journey/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
journey
  accDescr {
    a
    b
  }
```

### Empty description blocks

An empty block, which changes nothing, is a statement of its own. The
whitespace-only interior of a description block, including tabs, line breaks and
Unicode whitespace, prints `{}`: there is no text for interior whitespace to
surround. An already empty interior stays empty. The ordinary keyword/opener gap
uses one space: `accDescr{  }` becomes `accDescr {}`. [fixture:
empty-description-blocks/empty-whitespace-interiors] [test: journey Unicode and
tab interiors] [fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/blank-lines-inside] A block with a directive or a
comment line keeps its contents and line breaks, with body indentation under
[Accessibility statements](#accessibility-statements). [fixture:
empty-description-blocks/with-directive-or-comment-line-kept] It stands on a
line of its own, also after the header. [fixture:
empty-description-blocks/after-header]

Input
([empty-description-blocks/touching-kept-input.mmd](../tests/fixtures/journey/empty-description-blocks/touching-kept-input.mmd)):

```mmd
journey
accDescr{}
accDescr {}
accDescr{ }
```

Output
([empty-description-blocks/touching-kept-output.mmd](../tests/fixtures/journey/empty-description-blocks/touching-kept-output.mmd)):

```mmd
journey
  accDescr {}
  accDescr {}
  accDescr {}
```

Input
([empty-description-blocks/blank-lines-inside-input.mmd](../tests/fixtures/journey/empty-description-blocks/blank-lines-inside-input.mmd)):

```mmd
journey
accDescr {


}
```

Output
([empty-description-blocks/blank-lines-inside-output.mmd](../tests/fixtures/journey/empty-description-blocks/blank-lines-inside-output.mmd)):

```mmd
journey
  accDescr {}
```

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line
where the line break is whitespace to the lexer: after `title`, `section`,
`accTitle:`, and `accDescr:`, and around the `:` of `accTitle` and `accDescr`. A
task is never written over several lines. [fixture:
multi-line-statements/breaks-decided-one-by-one] [fixture:
multi-line-statements/value-on-next-line-joined] In `accTitle` and `accDescr:`
statements, keep trivia line breaks and align later structural parts and
standalone trivia one continuation level inside the statement, also under a
section. Preserve each first gap-line tail and complete directive interiors.
Joining comment regions keep their original layout. A `;` does not keep a
statement over several lines from being joined: no `;` separates statements in a
journey, and the first line of such a statement holds only its keyword, so
joining its lines cannot change which `;` the line rule ignores. [fixture:
multi-line-statements/semicolon-value-joined] [fixture:
multi-line-statements/accessibility-trivia-continuations]

Titles and sections keep their original multiline trivia layout, because their
value padding belongs to the Db. [fixture:
multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept]

Input
([multi-line-statements/value-on-next-line-joined-input.mmd](../tests/fixtures/journey/multi-line-statements/value-on-next-line-joined-input.mmd)):

```mmd
journey
title
T
section
S
accTitle:
T
```

Output
([multi-line-statements/value-on-next-line-joined-output.mmd](../tests/fixtures/journey/multi-line-statements/value-on-next-line-joined-output.mmd)):

```mmd
journey
  title T
  section S
    accTitle: T
```

Input
([multi-line-statements/comment-line-inside-kept-input.mmd](../tests/fixtures/journey/multi-line-statements/comment-line-inside-kept-input.mmd)):

```mmd
journey
title
%% c
T
accTitle:
%% d
T
```

Output
([multi-line-statements/comment-line-inside-kept-output.mmd](../tests/fixtures/journey/multi-line-statements/comment-line-inside-kept-output.mmd)):

```mmd
journey
  title
%% c
T
  accTitle:
    %% d
    T
```

### Multi-line values

Keep the text and line breaks of an `accDescr` block, and align its body lines
one step inside the statement, as described in
[Accessibility statements](#accessibility-statements). [fixture:
multi-line-values/description-block-lines-kept] A comment inside such a block is
part of the text. [fixture: multi-line-values/comment-line-inside-block-kept]

Input
([multi-line-values/description-block-lines-kept-input.mmd](../tests/fixtures/journey/multi-line-values/description-block-lines-kept-input.mmd)):

```mmd
journey
accDescr {
  a
    b
}
```

Output
([multi-line-values/description-block-lines-kept-output.mmd](../tests/fixtures/journey/multi-line-values/description-block-lines-kept-output.mmd)):

```mmd
journey
  accDescr {
    a
    b
  }
```

### Whitespace between tokens

Where no rule above applies, a run of whitespace between two tokens of a
statement becomes one space, and tokens that touch keep touching; the text of a
description block on one line stands between one space on each side, also where
the braces touched it. [fixture:
whitespace-between-tokens/description-block-braces] The whitespace at the end of
the header's line is dropped. [fixture:
whitespace-between-tokens/trailing-whitespace-after-header] The values are not
formatted: see [Task data](#task-data) and
[Titles and sections](#titles-and-sections).

Input
([whitespace-between-tokens/description-block-braces-input.mmd](../tests/fixtures/journey/whitespace-between-tokens/description-block-braces-input.mmd)):

```mmd
journey
accDescr  {  d  }
accDescr{e}
accDescr {f}
```

Output
([whitespace-between-tokens/description-block-braces-output.mmd](../tests/fixtures/journey/whitespace-between-tokens/description-block-braces-output.mmd)):

```mmd
journey
  accDescr: d
  accDescr: e
  accDescr: f
```

### Comments

A comment starts with `#`, `%%`, or `%`, where a unit starts, and runs to the
end of the line. A comment on a line of its own stands at the level of the
statement after it, and its text and its mark are kept as written: a comment
before a `section` stands at its level, and one before a task at the level of
the task; at the end of the text it stands at the level of the last statement.
[fixture: comments/lines-at-statement-level] [fixture: comments/text-kept]
[fixture: comments/single-percent-kept] [fixture: comments/bare-percent-lines]
[fixture: comments/levels-around-sections] A comment line before the header
stands at the first column, and one at the end of the text stays on a line of
its own, with the line break added. [fixture: comments/before-header] [fixture:
comments/last-in-body]

A comment after a statement, or after the header, stays on the line, as written:
one space stands before it where whitespace was written, and none where it
touches. Moving it to a line of its own would change the Db after a `title` or a
`section`, where the whitespace before the comment is part of the value, so one
rule keeps it on its line, as in a Gantt chart. [fixture: comments/after-header]
[fixture: comments/after-header-glued] [fixture: comments/after-header-percent]
[fixture: comments/after-statement] [fixture: comments/after-statement-glued]
[fixture: comments/after-statement-under-a-section] After a `title` or a
`section`, the whitespace before the `#` is part of the value, and stays (see
[Titles and sections](#titles-and-sections)).

Inside a title, a section, task data, and an accessibility text, `%%` is a
character of the text, not a comment, and is kept with it. [fixture:
comments/percent-in-values-kept]

Input
([comments/after-statement-input.mmd](../tests/fixtures/journey/comments/after-statement-input.mmd)):

```mmd
journey
A: 5 # c
B: 5: Me  #d
C: 5: Me: x # e
accDescr { d } # f
```

Output
([comments/after-statement-output.mmd](../tests/fixtures/journey/comments/after-statement-output.mmd)):

```mmd
journey
  A: 5 # c
  B: 5: Me #d
  C: 5: Me: x # e
  accDescr { d } # f
```

Input
([comments/after-header-input.mmd](../tests/fixtures/journey/comments/after-header-input.mmd)):

```mmd
journey # c
title T
```

Output
([comments/after-header-output.mmd](../tests/fixtures/journey/comments/after-header-output.mmd)):

```mmd
journey # c
  title T
```

### Directives

A directive on a line of its own stands at the level of the statement after it,
and a directive within a printed line is placed as in a flowchart: the gap is
printed as without the directive, and the directive stands after its space and
touches the unit that follows it. [fixture: directives/kept] [fixture:
directives/levels-around-sections] [fixture: directives/before-header] [fixture:
directives/after-header-on-same-line] [fixture:
directives/after-header-touching-kept] [fixture:
directives/whitespace-on-both-sides-collapsed] [fixture:
directives/statement-after-directive-line]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.

[fixture: journey/directives/split-directive-gap]

A directive between two units stays in its authored gap, placed as under
[Directives](#directives). Structural continuation columns follow
[Multi-line statements](#multi-line-statements). A directive inside a value is
part of that text. [fixture: directives/between-units] [fixture:
directives/inside-values-kept] [fixture: directives/over-lines-kept] A directive
that is not closed takes the rest of the text, and is kept as written. [fixture:
directives/unclosed-at-end-of-text-kept] [fixture:
directives/unclosed-after-statement-kept]

Input
([directives/levels-around-sections-input.mmd](../tests/fixtures/journey/directives/levels-around-sections-input.mmd)):

```mmd
journey
%%{init: {}}%%
section S
%%{init: {}}%%
A: 5
%%{init: {}}%%
section T
```

Output
([directives/levels-around-sections-output.mmd](../tests/fixtures/journey/directives/levels-around-sections-output.mmd)):

```mmd
journey
  %%{init: {}}%%
  section S
    %%{init: {}}%%
    A: 5
  %%{init: {}}%%
  section T
```

Input
([directives/between-units-input.mmd](../tests/fixtures/journey/directives/between-units-input.mmd)):

```mmd
journey
A %%{init: {}}%%: 5
B:%%{init: {}}%% 5
C: 5%%{init: {}}%%: Me
```

Output
([directives/between-units-output.mmd](../tests/fixtures/journey/directives/between-units-output.mmd)):

```mmd
journey
  A %%{init: {}}%%: 5
  B: %%{init: {}}%%5
  C: 5%%{init: {}}%%: Me
```

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter, and the `---` lines are kept as written, with the spaces and
tabs at the end of each. [fixture: frontmatter-yaml/formatted] [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept] The YAML is kept as written
when Prettier cannot read it. [fixture: frontmatter-yaml/malformed-kept] A
comment line between the frontmatter and the header is kept. [fixture:
frontmatter-yaml/comment-after-frontmatter-before-header]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/journey/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:   {theme:  dark}
---
journey
title T
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/journey/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { theme: dark }
---
journey
  title T
```

Input
([frontmatter-yaml/comment-after-frontmatter-before-header-input.mmd](../tests/fixtures/journey/frontmatter-yaml/comment-after-frontmatter-before-header-input.mmd)):

```mmd
---
title: T
---
%% c
journey
title T
```

Output
([frontmatter-yaml/comment-after-frontmatter-before-header-output.mmd](../tests/fixtures/journey/frontmatter-yaml/comment-after-frontmatter-before-header-output.mmd)):

```mmd
---
title: T
---
%% c
journey
  title T
```

### Line separators

U+2028 and U+2029 are whitespace between the units of a user journey and
characters of a text. Between statements they are a line break like any
whitespace: the statements go to lines of their own. A gap inside a statement
that holds one is printed as written, and so is a text: a description, a title,
a section name, the ignored data, and an accessibility text keep them. The
examples are written as strings, in which `\u2028` is U+2028 and `\n` is a line
break. [test: U+2028 between the header and a statement] [test: U+2028 between a
description block and a task] [test: U+2028 inside a task description] [test:
U+2028 before the colon of a task] [test: U+2028 before the second colon of a
task] [test: U+2028 between the people of a task] [test: U+2028 in the ignored
data of a task] [test: U+2028 after a title keyword] [test: U+2029 inside a
title] [test: U+2028 at the end of a section] [test: U+2028 after the colon of
accTitle] At the end of a title, U+2028 and U+2029 are characters of the text
and no spaces or tabs: the spaces after one are left out with the other
whitespace at the end of the title, and the spaces before it stay. [test: U+2028
and spaces at the end of a journey title]

### Whitespace characters

U+00A0 and U+FEFF are whitespace to the lexer between units, and characters of a
text. Where the lexer reads one whitespace character, such as the separator
after a keyword, a space stands for it; around the score and the people of a
task they are dropped like spaces; and before the colon of a task, the
description keeps them. The examples are written as strings, in which `\u00a0`
is U+00A0 and `\ufeff` is U+FEFF. [test: U+00A0 after a title keyword] [test:
U+00A0 around the score of a task] [test: U+00A0 around the people of a task]
[test: U+00A0 before the second colon of a task] [test: U+00A0 before the colon
of a task] [test: U+00A0 between a description block and a task] [test: U+FEFF
before a task]
