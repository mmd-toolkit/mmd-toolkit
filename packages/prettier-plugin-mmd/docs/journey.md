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
level of a statement is decided by its place among the others. [fixture:
indentation/sections-and-tasks-nested] [fixture:
indentation/statements-before-the-first-section] [fixture:
indentation/every-statement-under-a-section] [fixture:
indentation/consecutive-sections] A level is what Prettier's `useTabs` and
`tabWidth` options say: two spaces by default. [fixture:
indentation/tab-width-4] [fixture: indentation/use-tabs] The indentation written
in the input is not kept: whitespace at the start of a line is nothing to
mermaid.js. [fixture: indentation/written-indentation-dropped] The header stands
at the first column, also where whitespace was written before it. [fixture:
indentation/header-leading-whitespace] The lines of a text that is kept as
written, such as the lines of an `accDescr` block, keep their columns, and the
`}` that closes a block stands at the level of its statement (see
[Multi-line values](#multi-line-values)). [fixture:
indentation/description-block-under-a-section]

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
  accDescr { d }
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
end of the body are dropped. [fixture: blank-lines/collapsed] [fixture:
blank-lines/body-edges-dropped] The empty lines around comment lines are handled
in the same way. [fixture: blank-lines/around-comment-lines] Empty lines around
a `section` are kept, as one, at the level of the lines next to them. [fixture:
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
not in the Db, and is not kept. [fixture: task-data/colon-spacing] [fixture:
task-data/people-comma-spacing] An empty score or an empty person prints
nothing, so no space stands before it: `A: : Me` is printed `A:: Me`, and
`A: 3: a, ,b` is printed `A: 3: a,, b`. The empty people stay, since mermaid.js
reads each as a name. [fixture: task-data/empty-score] [fixture:
task-data/empty-people] [fixture: task-data/no-people-no-score]

The score and the people are printed as written: the whitespace inside a person
is part of it, and so is the spelling of a score, which mermaid.js reads as a
number. [fixture: task-data/people-inner-whitespace-kept] [fixture:
task-data/score-forms-kept] The whitespace at the end of the data is dropped.
[fixture: task-data/trailing-whitespace-dropped] The data ends at a `#`, and the
whitespace before the `#` stays as it is written. [fixture:
task-data/hash-ends-the-data]

Data of whitespace only is a task with an empty score and no people, and
mermaid.js needs a character after the colon: `A: ` is a task, and `A:` is
rejected. So one whitespace character stays after the colon, the first one as
written, and the rest is dropped. Where a comment or another character follows
on the line, the line is printed as written, since the whitespace is read
together with it. [fixture: task-data/whitespace-only-data] [fixture:
task-data/whitespace-only-data-then-comment] A directive between the parts of a
task stays where it is (see [Directives](#directives)).

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
what is before it, whatever whitespace was written there. [fixture:
ignored-data/third-colon-touches] [fixture: ignored-data/text-as-written]
[fixture: ignored-data/four-colons] The text stands after an empty score or an
empty person too. [fixture: ignored-data/after-empty-people] The whitespace at
its end is dropped. [fixture: ignored-data/trailing-whitespace-dropped]

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

`title` and `section` are printed with the value as written, the whitespace at
its ends included, which the Db keeps, and one space as the separator after the
keyword, whatever character was written there. [fixture:
titles-and-sections/value-whitespace-kept] [fixture:
titles-and-sections/one-space-after-keyword] A value written on a later line is
printed after the keyword on one line; a comment line between them makes the
statement printed as written (see
[Multi-line statements](#multi-line-statements)). [fixture:
titles-and-sections/value-on-next-line] [fixture:
titles-and-sections/comment-line-inside-kept] The value holds `:`, `%`, and `%%`
as characters, and ends at a `#`. [fixture:
titles-and-sections/special-characters-in-values] [fixture:
titles-and-sections/value-ends-at-hash] The whitespace before that `#` is part
of the value, and stays. [fixture:
titles-and-sections/whitespace-before-hash-is-the-value] A directive between the
keyword and the value stays where it is (see [Directives](#directives)).
[fixture: titles-and-sections/directive-between-keyword-and-value-kept]

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

Keywords keep the case in which they are written: mermaid.js reads them in any
case, and the Db is the same. [fixture: keyword-case/keywords-kept] The header
`journey` is detected in lower case only.

Input
([keyword-case/keywords-kept-input.mmd](../tests/fixtures/journey/keyword-case/keywords-kept-input.mmd)):

```mmd
journey
TITLE T
Section S
ACCTITLE: T
AccDescr: d
ACCDESCR { d }
```

Output
([keyword-case/keywords-kept-output.mmd](../tests/fixtures/journey/keyword-case/keywords-kept-output.mmd)):

```mmd
journey
  TITLE T
  Section S
    ACCTITLE: T
    AccDescr: d
    ACCDESCR { d }
```

### Accessibility statements

The `:` of `accTitle` and `accDescr` touches the keyword and has one space after
it; the text has no whitespace at its ends. [fixture:
accessibility-statements/colon-touches-keyword] [fixture:
accessibility-statements/text-whitespace-dropped] The text holds `:`, `;`, `%`,
and `%%` as characters. [fixture:
accessibility-statements/special-characters-in-text] A text written on a later
line, or a colon written on a later line than the keyword, is printed on one
line. [fixture: accessibility-statements/text-on-next-line-joined] [fixture:
accessibility-statements/keyword-and-colon-over-lines-joined]

The lines of an `accDescr { ... }` block are kept as written, and its `}` stands
at the level of its statement; a text on the line of the `{` has one space
inside the braces where it was written apart, and the braces that touch their
text keep touching. [fixture: accessibility-statements/block-lines-kept]
[fixture: accessibility-statements/block-text-on-opening-line] [fixture:
accessibility-statements/block-comment-and-empty-lines-kept] Whitespace inside
the text is part of it, and stays. [fixture:
accessibility-statements/block-inner-whitespace-kept] A directive between the
keyword and the colon or the brace, or after them, stays where it is. [fixture:
accessibility-statements/directive-around-colon-and-braces-kept]

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

An empty block, which changes nothing, is a statement of its own and follows the
rule of whitespace between tokens: a run of whitespace in it, line breaks
included, becomes one space, and braces that touch keep touching. [fixture:
empty-description-blocks/inner-whitespace-collapsed] [fixture:
empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/blank-lines-inside] A block with a directive or a
comment line is printed as written. [fixture:
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
  accDescr{}
  accDescr {}
  accDescr{ }
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
  accDescr { }
```

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line
where the line break is whitespace to the lexer: after `title`, `section`,
`accTitle:`, and `accDescr:`, and around the `:` of `accTitle` and `accDescr`. A
task is never written over several lines. [fixture:
multi-line-statements/value-on-next-line-joined] A statement with a comment line
or a directive in it is kept as written, since the comment line would take the
rest of the line it stands on. [fixture:
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

The lines of an `accDescr` block are kept as written, with the line breaks and
the whitespace inside, since they are part of the value. [fixture:
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
statement becomes one space, and tokens that touch keep touching: the braces of
a description block. [fixture:
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
  accDescr { d }
  accDescr{e}
  accDescr {f}
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
touches. [fixture: comments/after-header] [fixture: comments/after-header-glued]
[fixture: comments/after-header-percent] [fixture: comments/after-statement]
[fixture: comments/after-statement-glued] [fixture:
comments/after-statement-under-a-section] After a `title` or a `section`, the
whitespace before the `#` is part of the value, and stays (see
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
and a directive on the line of a statement keeps whether whitespace is written
on each side of it: where it is, one space stands there, and where it touches a
token, it keeps touching. [fixture: directives/kept] [fixture:
directives/levels-around-sections] [fixture: directives/before-header] [fixture:
directives/after-header-on-same-line] [fixture:
directives/after-header-touching-kept] [fixture:
directives/whitespace-on-both-sides-collapsed] [fixture:
directives/statement-after-directive-line]

A directive between two units of a statement stays where it is, with the
whitespace written on each side of it, and a directive inside a text is part of
the text. [fixture: directives/between-units-kept] [fixture:
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
([directives/between-units-kept-input.mmd](../tests/fixtures/journey/directives/between-units-kept-input.mmd)):

```mmd
journey
A %%{init: {}}%%: 5
B:%%{init: {}}%% 5
C: 5%%{init: {}}%%: Me
```

Output
([directives/between-units-kept-output.mmd](../tests/fixtures/journey/directives/between-units-kept-output.mmd)):

```mmd
journey
  A %%{init: {}}%%: 5
  B:%%{init: {}}%% 5
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
accTitle]

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
