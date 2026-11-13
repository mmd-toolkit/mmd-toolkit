# Gantt chart formatting rules

Japanese version: [gantt.ja.md](./gantt.ja.md)

How prettier-plugin-mmd formats a Gantt chart. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. Many values of a Gantt chart keep the
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
the tasks, click statements, settings, and every other statement. The `section`
itself stands at the first level. The tree of a Gantt chart is flat, with no
block of statements, so the level of a statement is decided by its place among
the others. The tasks of a section stand inside it, as the documentation of
mermaid.js writes them in a Gantt chart and in a user journey. [fixture:
indentation/sections-and-tasks-nested] [fixture:
indentation/statements-before-the-first-section] [fixture:
indentation/every-statement-under-a-section] [fixture:
indentation/consecutive-sections] [fixture:
indentation/click-statement-over-lines-under-a-section] A level is what
Prettier's `useTabs` and `tabWidth` options say: two spaces by default.
[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs] The
indentation written in the input is not kept. Whitespace at the start of a line
is nothing to mermaid.js, so the printer chooses the indentation from the
structure alone, and one rule per level prints the same text whatever the input
was indented with. [fixture: indentation/written-indentation-dropped] The header
stands at the first column, also where whitespace was written before it.
[fixture: indentation/header-leading-whitespace] Values kept as written retain
their columns. Description-body lines instead stand one step inside their
statement, with a separate `}` at its level (see
[Multi-line values](#multi-line-values)). [fixture:
indentation/description-block-under-a-section]

Input
([indentation/sections-and-tasks-nested-input.mmd](../tests/fixtures/gantt/indentation/sections-and-tasks-nested-input.mmd)):

```mmd
gantt
title T
section One
a : a1, 2024-01-01, 2d
click a1 href "u"
section Two
    b : 2d
```

Output
([indentation/sections-and-tasks-nested-output.mmd](../tests/fixtures/gantt/indentation/sections-and-tasks-nested-output.mmd)):

```mmd
gantt
  title T
  section One
    a : a1, 2024-01-01, 2d
    click a1 href "u"
  section Two
    b : 2d
```

Input
([indentation/tab-width-4-input.mmd](../tests/fixtures/gantt/indentation/tab-width-4-input.mmd)):

```mmd
gantt
title T
section S
a : 1d
```

Output
([indentation/tab-width-4-output.mmd](../tests/fixtures/gantt/indentation/tab-width-4-output.mmd)):

```mmd
gantt
    title T
    section S
        a : 1d
```

### Statements one per line

Each statement stands on a line of its own. Nothing separates statements in a
Gantt chart (diagrams/gantt.md, Diagram and statements), and the header,
`inclusiveEndDates`, a `weekday` or `weekend` statement with its day, an
`accDescr` block, and a click statement are followed on their line by the next
statement: the statement after any of them goes to a line of its own. The other
diagram types print one statement on a line too. [fixture:
statements-one-per-line/header-then-statement] [fixture:
statements-one-per-line/header-then-task] [fixture:
statements-one-per-line/keyword-statements] [fixture:
statements-one-per-line/weekday-then-task] [fixture:
statements-one-per-line/weekday-then-weekend] [fixture:
statements-one-per-line/inclusive-then-title] [fixture:
statements-one-per-line/description-block-then-task] [fixture:
statements-one-per-line/click-then-task] The statements `title`, `section`,
`accTitle`, and `accDescr:` take the rest of their line, so nothing follows them
on it. The value of `todayMarker` ends at a `;`, and the other settings, the
data of a task, and a list end at a `#` or a `;` (diagrams/gantt.md, The
statement context), and what follows is the next statement: `a : 1d#b : 2d` is
the tasks `a ` and `#b `. That statement goes to a line of its own, with its
`#`, which is the first character of its description. [fixture:
statements-one-per-line/setting-then-task-at-hash] [fixture:
statements-one-per-line/task-data-then-task-at-hash] [fixture:
statements-one-per-line/list-then-task-at-hash] [fixture:
statements-one-per-line/today-marker-takes-hash] [fixture:
statements-one-per-line/today-marker-then-task-at-semicolon-line-kept]

A statement that touches the one before it goes to a line of its own as well,
since mermaid.js reads both the same: the task `-x ` after the header in
`gantt-x : 1d`, a statement after the `{` of `inclusiveEndDates{ : 1d`, after
the `}` of an empty description block, and after the `"` of a link or the `)` of
a call. [fixture: statements-one-per-line/header-glued-task] [fixture:
statements-one-per-line/inclusive-glued-brace-task] [fixture:
statements-one-per-line/empty-description-block-glued-task] [fixture:
statements-one-per-line/click-glued-task] [fixture:
statements-one-per-line/call-glued-task] An empty description block is a
statement that changes nothing, wherever a statement starts, and stands on a
line of its own too. [fixture:
statements-one-per-line/empty-description-block-then-task] [fixture:
statements-one-per-line/empty-description-blocks-adjacent] [fixture:
statements-one-per-line/description-block-between-statements] [fixture:
statements-one-per-line/description-block-after-click] A directive between two
statements on a line moves with the statement after it. [fixture:
statements-one-per-line/directive-after-statement]

A line that holds a `;` keeps its statements together: the line rule of
mermaid.js removes the last `;` of a line that holds `style`, a `:` after it,
and a `#` after that, and moving a statement to a line of its own makes the rule
stop ignoring a `;`, or ignore another. `accDescr { style:#x } a : 1d;` is the
task `a ` with the data `1d`, while `a : 1d;` on a line of its own is rejected,
since the `;` ends the data and is a task text without data. So the statements
of such a line stay on it, with the whitespace between them formatted as
anywhere else, and the `;` stays as written. [fixture:
statements-one-per-line/semicolon-line-kept] [fixture:
statements-one-per-line/ignored-semicolon-line-kept] [fixture:
statements-one-per-line/ignored-semicolon-click-line-kept] The statement after a
`;` that ends the data of a task, a setting, or a list is on a line that holds a
`;`, so it stays on the line too. [fixture:
statements-one-per-line/setting-then-task-at-semicolon-line-kept]

Input
([statements-one-per-line/keyword-statements-input.mmd](../tests/fixtures/gantt/statements-one-per-line/keyword-statements-input.mmd)):

```mmd
gantt
weekday monday inclusiveEndDates
weekend friday   inclusiveEndDates
```

Output
([statements-one-per-line/keyword-statements-output.mmd](../tests/fixtures/gantt/statements-one-per-line/keyword-statements-output.mmd)):

```mmd
gantt
  weekday monday
  inclusiveEndDates
  weekend friday
  inclusiveEndDates
```

Input
([statements-one-per-line/click-then-task-input.mmd](../tests/fixtures/gantt/statements-one-per-line/click-then-task-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 href "u" b : 1d
```

Output
([statements-one-per-line/click-then-task-output.mmd](../tests/fixtures/gantt/statements-one-per-line/click-then-task-output.mmd)):

```mmd
gantt
  a : id1, 1d
  click id1 href "u"
  b : 1d
```

Input
([statements-one-per-line/header-glued-task-input.mmd](../tests/fixtures/gantt/statements-one-per-line/header-glued-task-input.mmd)):

```mmd
gantt-x : 1d
```

Output
([statements-one-per-line/header-glued-task-output.mmd](../tests/fixtures/gantt/statements-one-per-line/header-glued-task-output.mmd)):

```mmd
gantt
  -x : 1d
```

Input
([statements-one-per-line/ignored-semicolon-line-kept-input.mmd](../tests/fixtures/gantt/statements-one-per-line/ignored-semicolon-line-kept-input.mmd)):

```mmd
gantt
accDescr { style:#x } a : 1d;
inclusiveEndDates weekday monday
```

Output
([statements-one-per-line/ignored-semicolon-line-kept-output.mmd](../tests/fixtures/gantt/statements-one-per-line/ignored-semicolon-line-kept-output.mmd)):

```mmd
gantt
  accDescr { style:#x } a : 1d;
  inclusiveEndDates
  weekday monday
```

### Blank lines

Runs of empty lines become one empty line, and empty lines at the start and the
end of the body are dropped, as in the other diagram types. [fixture:
blank-lines/collapsed] [fixture: blank-lines/body-edges-dropped] An empty line
between statements is kept, as one. [fixture:
blank-lines/between-statements-kept-as-one] The empty lines around comment lines
are handled in the same way. [fixture: blank-lines/around-comment-lines] Empty
lines around a `section` are kept, as one, at the level of the lines next to
them. [fixture: blank-lines/around-sections]

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/gantt/blank-lines/collapsed-input.mmd)):

```mmd
gantt
title T



section S


a : 1d
```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/gantt/blank-lines/collapsed-output.mmd)):

```mmd
gantt
  title T

  section S

    a : 1d
```

Input
([blank-lines/body-edges-dropped-input.mmd](../tests/fixtures/gantt/blank-lines/body-edges-dropped-input.mmd)):

```mmd
gantt



title T


```

Output
([blank-lines/body-edges-dropped-output.mmd](../tests/fixtures/gantt/blank-lines/body-edges-dropped-output.mmd)):

```mmd
gantt
  title T
```

### Task data

A task is printed as its description, the colon, and its items. The text of the
description is printed as written, and the whitespace between it and the colon
is part of the description, which the Db keeps, so `A task           :a1` and
`A task :a1` are two descriptions to mermaid.js. It draws the same chart
whatever that whitespace is (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)),
so the printer sets it, as the next paragraphs say. [fixture:
task-data/description-padding-tightened] A description that starts with `#` or
`;` is a task text like any other. [fixture:
task-data/hash-and-semicolon-descriptions]

A name that touches its colon is printed with one space before it: `Short:a1` is
printed `Short : a1`. The colon of a task can also be read as a mark that stands
between the name and the data, so the whitespace before it is the one that the
examples in the documentation of mermaid.js write at least twice as often as any
other: of the task lines with a space after the colon, 22 have whitespace before
it, and none touches the name (counted as under
[the examples that decide the whitespace before a colon](./compatibility.md#the-examples-that-decide-the-whitespace-before-a-colon)).
The space is set whether or not the printer lines up the colons of the section
(see below). In a section whose colons it lines up, the name gets the space of
its column, and in any other section one space, also in a section that is left
as it is because its lines would be longer than `printWidth` or a name holds a
tab: one space moves no other colon and depends on no width. A name that ends
with a whitespace character other than a space and a tab, such as U+00A0,
touches its colon too, and the space comes after that character. A task that
follows a statement on its line, which the printer moves to a line of its own,
gets the space, or the column of its section, like any other
(`axisFormat %m #a: 1d` is printed on two lines, the second `#a : 1d`).
[fixture: task-data/colon-touching-name-spaced] [fixture:
task-data/colon-touching-name-aligned-with-padded] [fixture:
task-data/colon-touching-name-too-wide-kept] [fixture:
task-data/colon-touching-name-tab-in-name] [fixture:
task-data/colon-touching-name-style-rule-line] [fixture:
task-data/colon-touching-task-after-hash-ended-statement] [fixture:
task-data/colon-touching-task-after-statement-with-directive-moved] [test:
U+2028 before the colon of a task] [test: U+00A0 before the colon of a task]

Where a name of a section has padding before its colon (more than one whitespace
character, or a tab), the printer puts the colons of the section one space after
its longest name, whether the colons were in one column or not. The column is
the narrowest that leaves one space after every name, and whitespace beyond it
carries nothing, so it does not stay; the author can add a longer name and let
the printer pad the others. The width of a name is the width Prettier gives a
text, so a full-width character counts 2, and the whitespace that is set is
spaces, which replace a tab. [fixture: task-data/colon-column-new-longest-name]
[fixture: task-data/description-padding-tightened] [fixture:
task-data/colon-column-wide-characters] [fixture:
task-data/colon-column-use-tabs]

The sections with padding whose colons are all in one and the same column go on
sharing a column: it is one space after the longest of their longest names, so
that only the excess whitespace goes. The column is counted from the start of
the names, since the printer indents the tasks of every section alike, and that
is the column the colons stand in once the chart is printed. A section whose
colons are not all in one column is on its own, with the column of its longest
name. A section whose names are all followed by one space, with its colons in
the column of a group, counts for the longest name of the group and is not
changed. The tasks before the first `section` stand one level less deep, so they
are a section of their own that shares nothing. [fixture:
task-data/colon-column-sections-share-one-column] [fixture:
task-data/colon-column-one-task-sections] [fixture:
task-data/colon-column-uniform-section-shares] [fixture:
task-data/colon-column-sections-in-one-column-and-others] [fixture:
task-data/colon-column-sections-not-sharing] [fixture:
task-data/colon-column-sections-in-different-columns] [fixture:
task-data/colon-column-before-first-section] [fixture:
task-data/colon-column-sections-and-preamble]

The colons stay where they are in these cases, since moving them could change
the figure. A section in which no name has more than one space before its colon
is left: no colon moves, and a name that touches its colon gets its one space as
above. A section is left where the aligned lines would be longer than
`printWidth` and longer than they are, since one long name would push every
colon of the section far right. A chart that holds `white-space` is left, with
its names that touch their colons, since the CSS of the chart may draw the
whitespace at the end of a name, and the figure then depends on it. A section
where a name holds a tab is left too, since a tab reaches the next tab stop of
the editor, and no width that Prettier counts lines the colons up. [fixture:
task-data/colon-column-tab-in-name-kept] [fixture:
task-data/colon-column-single-space-kept] [fixture:
task-data/colon-column-too-wide-kept] [fixture:
task-data/colon-column-white-space-kept] [fixture:
task-data/colon-touching-name-white-space-kept]

A task keeps the whitespace before its colon as written, and is not one of the
tasks that the others are aligned with, so its padding does not decide their
column, and a name that touches its colon gets no space, where its name ends
with a directive, since the whitespace beside a directive stays (see
[Directives](#directives)), and where a directive stands before it with no
statement between. Its colon and its data are printed as those of any other
task: `%%{init: {}}%% A task:a2,after a1,2d` is printed
`%%{init: {}}%% A task: a2, after a1, 2d`. A task is left as written whole, its
data too, where the printer prints its line as written (see
[Statements one per line](#statements-one-per-line) and the data of whitespace
only below), where it runs over lines, and where a statement stands before it on
a line that stays together, since that line stays as it is. A statement before
it on any other line is printed on a line of its own, with the directives around
it, so the task then starts its line. Where the task does not start its line,
its name does not start the line, so its colon would not line up with the
others, and the whitespace before its colon could lie where the line rule of
mermaid.js reads it: the rule reads the whitespace after a `:` that follows
`style` or `classDef`, a name holds no `:`, and so a `:` before the colon of the
task can only come from a statement before it (see
[Statements one per line](#statements-one-per-line)). [fixture:
task-data/colon-column-line-as-written-kept] [fixture:
task-data/colon-column-task-over-lines-kept] [fixture:
task-data/colon-column-task-after-statement-kept] [fixture:
task-data/colon-column-name-ending-with-directive-kept] [fixture:
task-data/colon-touching-name-line-as-written-kept] [fixture:
task-data/colon-touching-task-over-lines-kept] [fixture:
task-data/colon-touching-task-after-statement-kept] [fixture:
task-data/colon-touching-task-after-directive-kept] [fixture:
task-data/colon-touching-name-ending-with-directive-kept]

A task named by a word that starts a statement once whitespace follows it keeps
the whitespace before its colon too, and the others are not aligned with it:
`title:T` is a task, and `title :T` is a title, so no whitespace is set before
its colon, and its data is printed as any other (`title:T` becomes `title: T`).
The words are `dateFormat`, `axisFormat`, `tickInterval`, `includes`,
`excludes`, `todayMarker`, `title`, `accDescription`, `section`, `click`, and
`call`, in any case, and with the directives in the name taken out, as
mermaid.js reads it (`ti%%{init: {}}%%tle:T` is the task `title`; see
[Keywords and what follows them](../../spec/docs/diagrams/gantt.md#the-statement-context)).
[fixture: task-data/colon-touching-keyword-name-kept] [fixture:
task-data/colon-touching-keyword-name-with-directive-kept]

Nothing else on the line keeps a task from being aligned: a `;` in the name or
elsewhere on the line, a comment, a directive inside the name or after the data,
and a line that the line rule reads leave the task aligned, as the padding of a
task that starts its line lies before the first `:` of the line, and the rule
reads only the whitespace after it. The width of a name, and of the rest of the
task, up to the next statement on its line (printed on a line of its own), is
the width as written, so a directive inside the name counts, as the colons are
lined up in the text, and a comment or a directive after the data counts toward
`printWidth`. The plugin counts the lines of the diagram alone: in a Markdown
code block in a list or a block quote, Prettier passes it the `printWidth` as it
is, without the width of what stands before the lines, so there the lines can be
wider than `printWidth` on the screen, while `mmdfmt` passes the width less what
it writes before the lines (see
[Code blocks in detail](../../mmdfmt/README.md#code-blocks-in-detail)). [test:
Gantt in a list item: the width is that of the diagram alone] [fixture:
task-data/colon-column-name-with-semicolon] [fixture:
task-data/colon-column-style-rule-line] [fixture:
task-data/colon-column-directive-inside-name] [fixture:
task-data/colon-column-comment-after-data] [fixture:
task-data/colon-column-statement-after-task-moves] [fixture:
task-data/colon-column-width-of-following-statement-ignored]

What follows the colon stands after one space, and a `,` touches the item before
it and is followed by one space where an item follows: whitespace around the
colon and the commas is not in the Db, and is not kept. The colon follows the
name of the task, so it takes the space that Prettier prints after a colon that
follows a name or a key, though most task lines in the documentation of
mermaid.js write the first item against the colon. The whitespace after the
colon stays as written within the stretch that the line rule of mermaid.js
reads, from the first `:` after `style` or `classDef` to the last `#` before the
last `;` of the line, since a space after such a colon makes the rule ignore
another `;`: `classDef it:a1,2024-01-01,2d;#y:3d;z:2d` is the tasks
`classDef it` and `#y`, and with a space after the first colon it is three
tasks. mermaid.js takes the directives out before it applies the rule, so a
`style` that a directive splits (`sty%%{init: {}}%%le a:x#y;b:1d`) is `style`
too. A directive between the colon and the first item stands after the space and
touches the item: `a:%%{init: {}}%%1d` is printed `a : %%{init: {}}%%1d`.
[fixture: task-data/colon-space-line-rule-kept] [fixture:
task-data/colon-line-rule-keyword-split-by-directive] [fixture:
task-data/colon-directive-before-first-item] [fixture:
task-data/colon-touches-first-item] [fixture: task-data/comma-spacing] [fixture:
task-data/tab-around-items] The whitespace at the end of the data is dropped.
[fixture: task-data/trailing-whitespace-dropped]

The tags and the items are printed as written. The whitespace inside an item is
part of it, and so is the case of a tag: `after   a1` is the item as it stands,
and `Done` is no tag. [fixture: task-data/inner-whitespace-kept] [fixture:
task-data/tags] [fixture: task-data/after-until-forms] [fixture:
keyword-case/tags-case-kept]

An empty item is kept, since the number of the items is read by mermaid.js: the
commas stay, and an empty item prints nothing, so `a :,1d` is printed `a : , 1d`
and `a : 1d,` keeps its comma. [fixture: task-data/empty-items]

Data of whitespace only is one empty item, and mermaid.js needs a character
after the colon: `a : ` is a task, and `a :` is rejected. So one whitespace
character stays after the colon, the first one as written, and the rest is
dropped. Where a directive or another character follows on the line, the line is
printed as written, since the whitespace is read together with it. [fixture:
task-data/whitespace-only-data] [fixture:
task-data/whitespace-only-data-then-directive] A directive between the parts of
a task stays where it is (see [Directives](#directives)).

Input
([task-data/description-padding-tightened-input.mmd](../tests/fixtures/gantt/task-data/description-padding-tightened-input.mmd)):

```mmd
gantt
Completed task            :done,    des1, 2014-01-06,2014-01-08
Active task               :active,  des2, 2014-01-09, 3d
Future task               :         des3, after des2, 5d
```

Output
([task-data/description-padding-tightened-output.mmd](../tests/fixtures/gantt/task-data/description-padding-tightened-output.mmd)):

```mmd
gantt
  Completed task : done, des1, 2014-01-06, 2014-01-08
  Active task    : active, des2, 2014-01-09, 3d
  Future task    : des3, after des2, 5d
```

Input
([task-data/colon-column-sections-in-one-column-and-others-input.mmd](../tests/fixtures/gantt/task-data/colon-column-sections-in-one-column-and-others-input.mmd)):

```mmd
gantt
  section A
    Task A                    :a1, 2014-01-01, 3d
    Task B long               :a2, after a1, 2d
  section B
    Other                     :a3, after a2, 1d
  section C
    Single   :a4, after a3, 1d
    Quite a long name :a5, after a4, 1d
  section D
    Alone :a6, after a5, 1d
    Brief :a7, after a6, 1d
```

Output
([task-data/colon-column-sections-in-one-column-and-others-output.mmd](../tests/fixtures/gantt/task-data/colon-column-sections-in-one-column-and-others-output.mmd)):

```mmd
gantt
  section A
    Task A      : a1, 2014-01-01, 3d
    Task B long : a2, after a1, 2d
  section B
    Other       : a3, after a2, 1d
  section C
    Single            : a4, after a3, 1d
    Quite a long name : a5, after a4, 1d
  section D
    Alone : a6, after a5, 1d
    Brief : a7, after a6, 1d
```

Input
([task-data/colon-touching-name-spaced-input.mmd](../tests/fixtures/gantt/task-data/colon-touching-name-spaced-input.mmd)):

```mmd
gantt
Before:a0, 2014-01-01, 3d
Before long name:a9, after a0, 1d
  section A
    Short:a1, 2014-01-01, 3d
    A longer name:a2, after a1, 2d
  section B
    Compact:b1, 2014-01-01, 3d
    Single space :b2, after b1, 2d
    Without id:3d
    First item empty:, 2014-02-01, 3d
    日本語:b5, 2014-02-01, 3d
```

Output
([task-data/colon-touching-name-spaced-output.mmd](../tests/fixtures/gantt/task-data/colon-touching-name-spaced-output.mmd)):

```mmd
gantt
  Before : a0, 2014-01-01, 3d
  Before long name : a9, after a0, 1d
  section A
    Short : a1, 2014-01-01, 3d
    A longer name : a2, after a1, 2d
  section B
    Compact : b1, 2014-01-01, 3d
    Single space : b2, after b1, 2d
    Without id : 3d
    First item empty : , 2014-02-01, 3d
    日本語 : b5, 2014-02-01, 3d
```

Input
([task-data/colon-touches-first-item-input.mmd](../tests/fixtures/gantt/task-data/colon-touches-first-item-input.mmd)):

```mmd
gantt
A task :a1, 2014-01-01, 30d
B task : a2, 2014-01-01, 30d
C task :    a3 , 2014-01-01
```

Output
([task-data/colon-touches-first-item-output.mmd](../tests/fixtures/gantt/task-data/colon-touches-first-item-output.mmd)):

```mmd
gantt
  A task : a1, 2014-01-01, 30d
  B task : a2, 2014-01-01, 30d
  C task : a3, 2014-01-01
```

Input
([task-data/tags-input.mmd](../tests/fixtures/gantt/task-data/tags-input.mmd)):

```mmd
gantt
a : done, 1d
b : active,crit, 2d
c : Done, 1d
d : milestone , m1, 2024-01-01, 0d
```

Output
([task-data/tags-output.mmd](../tests/fixtures/gantt/task-data/tags-output.mmd)):

```mmd
gantt
  a : done, 1d
  b : active, crit, 2d
  c : Done, 1d
  d : milestone, m1, 2024-01-01, 0d
```

### Settings

`dateFormat` and `axisFormat` are printed with one space after the keyword and
the value after it, without the whitespace at the start or at the end of the
value: mermaid.js keeps that whitespace in the Db, but draws the same figure
without it (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
`dateFormat   YYYY-MM-DD  ` is printed `dateFormat YYYY-MM-DD`. [fixture:
settings/format-padding-dropped] A date format of spaces and tabs only stays as
written. [fixture: settings/format-blank-kept] A date format of `D` stays as
written, since the axis of days is drawn only where `D` has no whitespace around
it, and so does `tickInterval`, which is read as a whole, so that whitespace
before or after it turns its ticks into the default ones. [fixture:
settings/format-padding-kept-where-drawn-differently] [fixture:
gantt/settings/date-format-directive-after-value-kept] [fixture:
gantt/settings/date-format-directive-before-value-kept] The value of
`todayMarker` is printed as written, the whitespace at its ends included:
`todayMarker off` followed by two spaces is another marker, which draws the line
of today. [fixture: settings/trailing-whitespace-by-setting] The value of
`todayMarker` holds `#`, and every value holds `%%`, as characters of the text;
the value of `todayMarker` ends at a `;`, and the value of `dateFormat`,
`axisFormat`, and `tickInterval` ends at a `#` or a `;` (see
[Statements one per line](#statements-one-per-line)). [fixture:
settings/hash-semicolon-percent-in-values]

Only the one whitespace character that separates the keyword from its value is
formatted: one space stands there, whatever it was written, a tab or a line
feed: the character is not in the Db, and the separator has one form. [fixture:
settings/one-space-after-keyword] [fixture: settings/value-on-next-line] A
directive between the keyword and the value stays where it is (see
[Directives](#directives)). [fixture:
settings/directive-between-keyword-and-value]

Input
([settings/value-on-next-line-input.mmd](../tests/fixtures/gantt/settings/value-on-next-line-input.mmd)):

```mmd
gantt
dateFormat
YYYY-MM-DD
axisFormat
 %m
```

Output
([settings/value-on-next-line-output.mmd](../tests/fixtures/gantt/settings/value-on-next-line-output.mmd)):

```mmd
gantt
  dateFormat YYYY-MM-DD
  axisFormat %m
```

Input
([settings/hash-semicolon-percent-in-values-input.mmd](../tests/fixtures/gantt/settings/hash-semicolon-percent-in-values-input.mmd)):

```mmd
gantt
todayMarker stroke-width:5px,#fff
dateFormat X %% c
```

Output
([settings/hash-semicolon-percent-in-values-output.mmd](../tests/fixtures/gantt/settings/hash-semicolon-percent-in-values-output.mmd)):

```mmd
gantt
  todayMarker stroke-width:5px,#fff
  dateFormat X %% c
```

### Titles and sections

A `title` is printed as the settings are: one space after the keyword, and the
value without the whitespace at its start or at its end, which the Db keeps and
which is drawn without (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
`title   Plan  ` is printed `title Plan`, and a run of spaces and tabs inside it
is printed as one space, so `title Plan  of   work` is printed
`title Plan of work` (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
The name of a `section` is printed as written, the whitespace at its start and
at its end included: two sections whose names differ by it are drawn apart, and
would not be once it is left out. `section  A` after `section A` stays so. A
title of spaces and tabs only stays as written. [fixture:
titles-and-sections/title-padding-dropped] [fixture:
titles-and-sections/title-blank-kept] [fixture:
titles-and-sections/section-padding-kept] [fixture:
titles-and-sections/title-trailing-dropped-section-kept] [fixture:
titles-and-sections/one-space-after-keyword] [fixture:
titles-and-sections/value-on-next-line] The value holds `:`, `#`, `;`, and `%%`
as characters. [fixture: titles-and-sections/special-characters-in-values] A
directive between the keyword and the value stays where it is (see
[Directives](#directives)). [fixture:
titles-and-sections/directive-between-keyword-and-value] A value written on a
later line is printed after the keyword on one line; a comment line between them
makes the statement printed as written (see
[Multi-line statements](#multi-line-statements)). [fixture:
titles-and-sections/comment-line-inside-kept]

Input
([titles-and-sections/special-characters-in-values-input.mmd](../tests/fixtures/gantt/titles-and-sections/special-characters-in-values-input.mmd)):

```mmd
gantt
title a: b # c ; d %% e
section #x:y;z
```

Output
([titles-and-sections/special-characters-in-values-output.mmd](../tests/fixtures/gantt/titles-and-sections/special-characters-in-values-output.mmd)):

```mmd
gantt
  title a: b # c ; d %% e
  section #x:y;z
```

Input
([titles-and-sections/value-on-next-line-input.mmd](../tests/fixtures/gantt/titles-and-sections/value-on-next-line-input.mmd)):

```mmd
gantt
title
T
section
S
```

Output
([titles-and-sections/value-on-next-line-output.mmd](../tests/fixtures/gantt/titles-and-sections/value-on-next-line-output.mmd)):

```mmd
gantt
  title T
  section S
```

### Lists

The items of an `includes` or `excludes` statement stand after the keyword and
one space, however much whitespace was written there. [fixture:
lists/space-after-keyword] [fixture: lists/on-next-line] The items keep their
separators: a `,` touches the item before it and is followed by one space, and
items that are separated by whitespace only are separated by one space. The Db
is the same for every separator, so the kind of separator is the author's.
[fixture: lists/separators-as-written] [fixture: lists/dates-and-days] The case
of the items is kept: mermaid.js lowers it. [fixture: lists/items-case-kept] A
directive between the keyword and the first item, or between two items, stays
where it is and is placed as under [Directives](#directives). [fixture:
lists/directive-after-keyword] [fixture: lists/directive-between-items]
[fixture: lists/directive-in-list-runs]

Commas with no item between them stay as written. [fixture:
lists/empty-items-kept] The whitespace at the end of a list is dropped.
[fixture: lists/trailing-whitespace-dropped] A list of whitespace only has no
item, and mermaid.js needs a character of the list text after the whitespace
that follows the keyword, so two whitespace characters stay after the keyword,
as written. [fixture: lists/whitespace-only]

mermaid.js lowers the case of the whole list text before it splits it. A capital
sigma becomes the final `ς` when the characters before it that the conversion
does not ignore end in a letter and no letter follows it, and U+FEFF is ignored:
`ΑΒ`, U+FEFF, and `Σ` end in `ς`, while with a space, or any other whitespace,
the `Σ` stands alone and becomes `σ`. So a list with a U+FEFF between its items
is printed as written, and any other whitespace between items is formatted as a
space. [test: U+FEFF between the items of a list] [test: U+00A0 between the
items of a list]

Input
([lists/separators-as-written-input.mmd](../tests/fixtures/gantt/lists/separators-as-written-input.mmd)):

```mmd
gantt
excludes weekends,2024-01-01
excludes weekends ,  2024-01-01
includes 2024-01-01   2024-01-02
excludes a , b   c,d
```

Output
([lists/separators-as-written-output.mmd](../tests/fixtures/gantt/lists/separators-as-written-output.mmd)):

```mmd
gantt
  excludes weekends, 2024-01-01
  excludes weekends, 2024-01-01
  includes 2024-01-01 2024-01-02
  excludes a, b c, d
```

Input
([lists/dates-and-days-input.mmd](../tests/fixtures/gantt/lists/dates-and-days-input.mmd)):

```mmd
gantt
excludes   weekends,   2024-01-01,   saturday
includes sunday   2024-02-02
```

Output
([lists/dates-and-days-output.mmd](../tests/fixtures/gantt/lists/dates-and-days-output.mmd)):

```mmd
gantt
  excludes weekends, 2024-01-01, saturday
  includes sunday 2024-02-02
```

### Weekday and weekend

A `weekday` or `weekend` statement stands as the keyword, one space, and the
day, however much whitespace and how many line breaks were written between them.
The days `monday` and `friday` are printed in lower case, as the examples in the
documentation of mermaid.js write them (see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same));
any other day keeps the case in which it is written, and the Db lowers it.
[fixture: weekday-and-weekend/one-space] [fixture:
weekday-and-weekend/day-case-one-form] [fixture:
weekday-and-weekend/day-on-next-line] The whitespace at the end of the line is
dropped, after `inclusiveEndDates` too. [fixture:
weekday-and-weekend/trailing-whitespace-dropped] A directive between the keyword
and the day stays where it is. [fixture:
weekday-and-weekend/directive-between-keyword-and-day]

Input
([weekday-and-weekend/day-case-one-form-input.mmd](../tests/fixtures/gantt/weekday-and-weekend/day-case-one-form-input.mmd)):

```mmd
gantt
weekday MONDAY
weekend Friday
WEEKDAY Tuesday
```

Output
([weekday-and-weekend/day-case-one-form-output.mmd](../tests/fixtures/gantt/weekday-and-weekend/day-case-one-form-output.mmd)):

```mmd
gantt
  weekday monday
  weekend friday
  weekday Tuesday
```

Input
([weekday-and-weekend/day-on-next-line-input.mmd](../tests/fixtures/gantt/weekday-and-weekend/day-on-next-line-input.mmd)):

```mmd
gantt
weekday
monday
weekend

friday
```

Output
([weekday-and-weekend/day-on-next-line-output.mmd](../tests/fixtures/gantt/weekday-and-weekend/day-on-next-line-output.mmd)):

```mmd
gantt
  weekday monday
  weekend friday
```

### Keyword case

The keywords `axisFormat`, `dateFormat`, `excludes`, `section`, `tickInterval`,
`title`, `weekday`, and `weekend` are printed in the case that the examples in
the documentation of mermaid.js use (see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)).
mermaid.js reads them in any case and the Db is the same. Any other keyword
keeps the case in which it is written (`TodayMarker`, `Includes`,
`INCLUSIVEENDDATES`, and the accessibility keywords). [fixture:
keyword-case/keywords-one-form] [fixture: keyword-case/click-keywords-kept] The
header `gantt` is detected in lower case only, and the tags of a task are read
in exactly the case of `active`, `done`, `crit`, `milestone`, and `vert`, so
`Done` is no tag and is not changed. [fixture: keyword-case/tags-case-kept]

Input
([keyword-case/keywords-one-form-input.mmd](../tests/fixtures/gantt/keyword-case/keywords-one-form-input.mmd)):

```mmd
gantt
DATEFORMAT YYYY
AxisFormat %m
TICKINTERVAL 1week
TodayMarker off
TITLE T
Section S
EXCLUDES weekends
Includes monday
INCLUSIVEENDDATES
WEEKDAY Monday
WEEKEND FRIDAY
ACCTITLE: T
AccDescr: d
ACCDESCR { d }
```

Output
([keyword-case/keywords-one-form-output.mmd](../tests/fixtures/gantt/keyword-case/keywords-one-form-output.mmd)):

```mmd
gantt
  dateFormat YYYY
  axisFormat %m
  tickInterval 1week
  TodayMarker off
  title T
  section S
    excludes weekends
    Includes monday
    INCLUSIVEENDDATES
    weekday monday
    weekend friday
    ACCTITLE: T
    AccDescr: d
    ACCDESCR: d
```

### Click statements

A click statement is printed on one line with one space between `click`, its
ids, and its parts, where it was written with more whitespace, a tab, or a line
break. [fixture: click-statements/one-space-between-parts] [fixture:
click-statements/parts-over-lines-joined] A `,` between ids touches the ids on
both sides, since a space ends the id text, and an empty id stays. [fixture:
click-statements/ids-touch-commas] The parts stay in the order in which they are
written. [fixture: click-statements/part-order-kept] The whitespace at the end
of the statement is dropped. [fixture:
click-statements/trailing-whitespace-dropped] The statement does not depend on
the tasks that its ids name. [fixture:
click-statements/ids-unknown-and-duplicate]

The name of a call is printed as written, with the whitespace and the line
breaks in it (see [Whitespace between tokens](#whitespace-between-tokens)):
`f ()` has the name `f` and a space. The arguments have no whitespace at their
ends or before a `,`, and one space after it: `f( 1,2 )` is printed `f(1, 2)`,
since mermaid.js splits the arguments at the `,` outside quotes and trims each
part, and calls the function with the same arguments (see
[Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same)).
The whitespace inside quotes stays, and so do arguments with an empty part;
blank arguments are dropped. [fixture:
click-statements/call-name-kept-arguments-spaced] [fixture:
click-statements/call-arguments-spaced] A gap between the arguments that the
line rule of mermaid.js may read keeps whether it holds whitespace:
`click t1 call f(style:x,#b;c)` stays as written, since a space after the `,`
would change the last `;` that the rule ignores (see
[Call arguments that are drawn the same](./compatibility.md#call-arguments-that-are-drawn-the-same)).
[fixture: click-statements/call-arguments-line-rule-kept] The string of a link
is printed as written. [fixture: click-statements/href-string-kept] A string or
an argument list written over lines is printed as written (see
[Multi-line values](#multi-line-values)). [fixture:
click-statements/string-over-lines-kept] A comment line or directive between the
parts keeps its line breaks, with ordinary structural continuations aligned
under [Multi-line statements](#multi-line-statements). [fixture:
click-statements/comment-line-between-parts-kept] [fixture:
click-statements/directive-between-parts]

Input
([click-statements/ids-touch-commas-input.mmd](../tests/fixtures/gantt/click-statements/ids-touch-commas-input.mmd)):

```mmd
gantt
a : id1, 1d
b : id2, 1d
click id1,id2 href "u"
click id1,,id2 href "u"
click id1, href "u"
click , href "u"
click   ,id1,   href "u"
```

Output
([click-statements/ids-touch-commas-output.mmd](../tests/fixtures/gantt/click-statements/ids-touch-commas-output.mmd)):

```mmd
gantt
  a : id1, 1d
  b : id2, 1d
  click id1,id2 href "u"
  click id1,,id2 href "u"
  click id1, href "u"
  click , href "u"
  click ,id1, href "u"
```

Input
([click-statements/part-order-kept-input.mmd](../tests/fixtures/gantt/click-statements/part-order-kept-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 href "u" call f()
click id1 call f() href "u"
```

Output
([click-statements/part-order-kept-output.mmd](../tests/fixtures/gantt/click-statements/part-order-kept-output.mmd)):

```mmd
gantt
  a : id1, 1d
  click id1 href "u" call f()
  click id1 call f() href "u"
```

Input
([click-statements/call-name-kept-arguments-spaced-input.mmd](../tests/fixtures/gantt/click-statements/call-name-kept-arguments-spaced-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 call f ()
click id1 call f( 1, 2 )
click id1 call f(1,2)
click id1 call f(  )
click id1 call   f()
```

Output
([click-statements/call-name-kept-arguments-spaced-output.mmd](../tests/fixtures/gantt/click-statements/call-name-kept-arguments-spaced-output.mmd)):

```mmd
gantt
  a : id1, 1d
  click id1 call f ()
  click id1 call f(1, 2)
  click id1 call f(1, 2)
  click id1 call f()
  click id1 call f()
```

### Accessibility statements

The `:` of `accTitle` and `accDescr` touches the keyword and has one space after
it; the text has no whitespace at its ends. [fixture:
accessibility-statements/colon-touches-keyword] [fixture:
accessibility-statements/text-whitespace-dropped] The text holds `:`, `#`, `;`,
and `%%` as characters. [fixture:
accessibility-statements/special-characters-in-text] A text written on a later
line, or a colon written on a later line than the keyword, is printed on one
line. [fixture: accessibility-statements/text-on-next-line-joined] [fixture:
accessibility-statements/keyword-and-colon-over-lines-joined]

A block on one line follows
[A description block on one line](./compatibility.md#a-description-block-on-one-line).
[fixture: accessibility-statements/block-text-on-opening-line]

In a block with a text over several lines, indent the body one level inside the
statement and align a separate `}` with the statement: mermaid.js discards
indentation after LF from the description. [fixture:
accessibility-statements/block-lines-kept] [fixture:
accessibility-statements/block-comment-and-empty-lines-kept] A run of spaces and
tabs inside the text is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
[fixture: accessibility-statements/block-inner-runs-collapsed] [fixture:
accessibility-statements/accessibility-lines-runs-collapsed] A directive between
the keyword and the colon or the brace, or after them, stays where it is, and a
block on one line with a directive beside its braces is written with the colon
first (see
[A description block on one line](./compatibility.md#a-description-block-on-one-line)).
[fixture: accessibility-statements/directive-around-colon-and-braces]

Input
([accessibility-statements/text-on-next-line-joined-input.mmd](../tests/fixtures/gantt/accessibility-statements/text-on-next-line-joined-input.mmd)):

```mmd
gantt
accTitle:
T
accDescr:

d
```

Output
([accessibility-statements/text-on-next-line-joined-output.mmd](../tests/fixtures/gantt/accessibility-statements/text-on-next-line-joined-output.mmd)):

```mmd
gantt
  accTitle: T
  accDescr: d
```

Input
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/gantt/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
gantt
accDescr {
   a
  b
}
```

Output
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/gantt/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
gantt
  accDescr {
    a
    b
  }
```

### Empty description blocks

[fixture: gantt/empty-description-blocks/touching-comment-body]

An empty block, which changes nothing, is a statement of its own. The
whitespace-only interior of a description block, including tabs, line breaks and
Unicode whitespace, prints `{}`: there is no text for interior whitespace to
surround. An already empty interior stays empty. The ordinary keyword/opener gap
uses one space: `accDescr{  }` becomes `accDescr {}`. [fixture:
empty-description-blocks/empty-whitespace-interiors] [test: gantt Unicode and
tab interiors] [fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/blank-lines-inside] A block with a directive or a
comment line keeps its contents and line breaks, with body indentation under
[Accessibility statements](#accessibility-statements). [fixture:
empty-description-blocks/with-directive-or-comment-line-kept] It stands on a
line of its own, also after the header. [fixture:
empty-description-blocks/after-header]

Input
([empty-description-blocks/touching-kept-input.mmd](../tests/fixtures/gantt/empty-description-blocks/touching-kept-input.mmd)):

```mmd
gantt
accDescr{}
accDescr {}
accDescr{ }
```

Output
([empty-description-blocks/touching-kept-output.mmd](../tests/fixtures/gantt/empty-description-blocks/touching-kept-output.mmd)):

```mmd
gantt
  accDescr {}
  accDescr {}
  accDescr {}
```

Input
([empty-description-blocks/blank-lines-inside-input.mmd](../tests/fixtures/gantt/empty-description-blocks/blank-lines-inside-input.mmd)):

```mmd
gantt
accDescr {


}
```

Output
([empty-description-blocks/blank-lines-inside-output.mmd](../tests/fixtures/gantt/empty-description-blocks/blank-lines-inside-output.mmd)):

```mmd
gantt
  accDescr {}
```

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line
where the line break is whitespace to the lexer: after `title`, `section`, a
setting, `weekday`, `weekend`, `includes`, `excludes`, `accTitle:`, and
`accDescr:`, between the parts of a click statement, and around the `:` of
`accTitle` and `accDescr`. Empty lines there are dropped too. [fixture:
multi-line-statements/value-on-next-line-joined] [fixture:
multi-line-statements/blank-lines-between-keyword-and-day] Keep trivia line
breaks in click, weekday/weekend, includes/excludes and accessibility line
statements. Place later structural parts and standalone comments or directives
one continuation level inside their statement, also under a section. Preserve
each gap's first line tail and complete directive interiors; quoted strings,
call names and arguments remain whole. [fixture:
multi-line-statements/structural-trivia-continuations] [fixture:
click-statements/trivia-continuation-under-section]

Titles, sections, settings and tasks keep their original multiline trivia
layout: their value padding is part of the Db. In a statement that formats its
trivia lines, such as a click statement, a line break stays where joining it,
with one space or with nothing, could change which `;` the line rule ignores,
and where a `;` ends the last line; any other line break is joined as usual,
also in a statement that holds a `;`. The same decision applies to a `;` in
another statement on its final line. A joining comment region or a U+FEFF list
separator also keeps the original layout. [fixture:
multi-line-statements/breaks-decided-one-by-one] [fixture:
multi-line-statements/line-rule-first-hash-after-colon-kept] [fixture:
multi-line-statements/semicolon-joining-changes-kept] [fixture:
multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] A `;` alone does not prevent
joining. [fixture: multi-line-statements/semicolon-inside-joined]

Input
([multi-line-statements/value-on-next-line-joined-input.mmd](../tests/fixtures/gantt/multi-line-statements/value-on-next-line-joined-input.mmd)):

```mmd
gantt
title
T
section
S
dateFormat
YYYY
weekday
monday
excludes
weekends
```

Output
([multi-line-statements/value-on-next-line-joined-output.mmd](../tests/fixtures/gantt/multi-line-statements/value-on-next-line-joined-output.mmd)):

```mmd
gantt
  title T
  section S
    dateFormat YYYY
    weekday monday
    excludes weekends
```

Input
([multi-line-statements/comment-line-inside-kept-input.mmd](../tests/fixtures/gantt/multi-line-statements/comment-line-inside-kept-input.mmd)):

```mmd
gantt
title
%% c
T
weekday
%% c
monday
```

Output
([multi-line-statements/comment-line-inside-kept-output.mmd](../tests/fixtures/gantt/multi-line-statements/comment-line-inside-kept-output.mmd)):

```mmd
gantt
  title
%% c
T
  weekday
    %% c
    monday
```

### Multi-line values

The arguments and the name of a call and the string of a link are kept as
written, with the line breaks and the whitespace inside, since they are part of
the value. Description-body lines instead align one step inside their statement
under [Accessibility statements](#accessibility-statements). [fixture:
multi-line-values/call-arguments-kept] [fixture:
multi-line-values/call-name-kept] [fixture: multi-line-values/href-string-kept]
[fixture: multi-line-values/description-block-lines-kept] A comment line inside
such a string is part of the string. [fixture:
multi-line-values/comment-line-inside-string-kept]

Input
([multi-line-values/call-arguments-kept-input.mmd](../tests/fixtures/gantt/multi-line-values/call-arguments-kept-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 call f(1,
  2)
```

Output
([multi-line-values/call-arguments-kept-output.mmd](../tests/fixtures/gantt/multi-line-values/call-arguments-kept-output.mmd)):

```mmd
gantt
  a : id1, 1d
  click id1 call f(1,
  2)
```

Input
([multi-line-values/description-block-lines-kept-input.mmd](../tests/fixtures/gantt/multi-line-values/description-block-lines-kept-input.mmd)):

```mmd
gantt
accDescr {
  a
    b
}
```

Output
([multi-line-values/description-block-lines-kept-output.mmd](../tests/fixtures/gantt/multi-line-values/description-block-lines-kept-output.mmd)):

```mmd
gantt
  accDescr {
    a
    b
  }
```

### Whitespace between tokens

Where no rule above applies, a run of whitespace between two tokens of a
statement becomes one space, and tokens that touch keep touching, as the braces
of a description block. The parentheses of a call with blank arguments touch
each other: `f(    )` is printed `f()`, since mermaid.js reads it as the same
call. A directive between them touches both parentheses, as under
[Directives](#directives). The same holds for the parentheses with a line break
between them, while a comment line there stays on its own line. [fixture:
whitespace-between-tokens/blank-arguments] [fixture:
click-statements/callback-blank-parentheses-touch] [fixture:
click-statements/callback-blank-parentheses-lines] A U+2028 or U+2029 between
them stays where it is. [test: U+2028 between the parentheses of a blank Gantt
callback] [test: U+2029 between the parentheses of a blank Gantt callback]
Arguments with a comment line or a directive among them are printed as written
through the `)`: the whitespace before the `)` is part of the arguments in the
Db, so a comment line before the `)` must not indent it. [fixture:
click-statements/callback-args-comment-line-kept] The whitespace at the end of
the header's line is dropped. [fixture:
whitespace-between-tokens/trailing-whitespace-after-header] The values are not
formatted: see [Task data](#task-data), [Settings](#settings), and
[Titles and sections](#titles-and-sections).

Input
([whitespace-between-tokens/blank-arguments-input.mmd](../tests/fixtures/gantt/whitespace-between-tokens/blank-arguments-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 call f(    )
click id1 call f()
```

Output
([whitespace-between-tokens/blank-arguments-output.mmd](../tests/fixtures/gantt/whitespace-between-tokens/blank-arguments-output.mmd)):

```mmd
gantt
  a : id1, 1d
  click id1 call f()
  click id1 call f()
```

### Comments

A comment starts with `%%` or `%`, where a unit starts, and runs to the end of
the line. A comment on a line of its own stands at the level of the statements
around it, and its text and its mark are kept as written. [fixture:
comments/lines-at-statement-level] [fixture:
comments/directive-before-comment-line] [fixture: comments/text-kept] [fixture:
comments/single-percent-kept] [fixture: comments/bare-percent-lines] A comment
line stands at the level of the statement after it, so a comment before a
`section` stands at its level, and one before a task stands at the level of the
task; at the end of the text it stands at the level of the last statement.
[fixture: comments/levels-around-sections] [fixture:
directives/levels-around-sections] A comment line before the header stands at
the first column, and one at the end of the text stays on a line of its own,
with the line break added. [fixture: comments/before-header] [fixture:
comments/last-in-body]

A comment line that starts with `%%{` without being a directive stands after one
whitespace character, a space, or a tab with `useTabs`, at every level, and so
does a comment line with the mark `%` right before such a line. mermaid.js reads
that `%%{` only when the whitespace before it is one character, or one character
after the line feeds, and rejects the text with more of it, or with none after
an empty line (known divergence `percent-brace-after-unit`); it removes the
directives before it reads the text, so the whitespace of a line of only a
directive counts as whitespace before the `%%{`, and the lines of only a
directive before it, with empty lines between them or not, stand at the first
column; on the line of the `%%{` itself, the directives before it count too,
with the spaces between them, so that the whitespace before the comment is one
character in all: a space between two items is that character, and where nothing
is written between them, one space, or one tab with `useTabs`, stands at the
start of the line; and a comment with the mark `%` that it reaches directly
takes the line feeds after it, so that the `%%{` after it is reached directly
too (known divergence `comment-takes-line-break`). [fixture:
comments/percent-brace-line-after-one-whitespace] [fixture:
comments/percent-brace-line-after-blank-line] [fixture:
comments/percent-brace-line-under-a-section] [fixture:
comments/percent-brace-line-with-tabs] [fixture:
comments/percent-brace-line-at-the-end] [fixture:
comments/percent-comment-then-percent-brace-line] [fixture:
comments/percent-comment-line-not-before-percent-brace] [fixture:
comments/percent-brace-line-after-directive-line] [fixture:
comments/percent-brace-line-after-directive-line-at-the-start] [fixture:
comments/percent-brace-line-after-two-directive-lines-under-a-section] [fixture:
comments/percent-brace-line-after-directive-over-lines] [fixture:
comments/percent-brace-line-after-directive-and-blank-lines] [fixture:
comments/percent-brace-line-after-comment-and-directive-lines] [fixture:
comments/percent-brace-line-after-directive-on-its-line] [fixture:
comments/percent-brace-line-after-directive-touching] [fixture:
comments/percent-brace-line-after-directive-with-tabs]

A comment after a statement, or after the header, stays on the line, as written:
one space stands before it where whitespace was written, and none where it
touches, since the comment of a statement that touches it is read otherwise by
mermaid.js. [fixture: comments/after-header] [fixture:
comments/after-header-glued] [fixture: comments/after-keyword-statement]
[fixture: comments/after-keyword-statement-glued] [fixture: comments/after-day]
[fixture: comments/after-description-block] [fixture: comments/after-click]
[fixture: comments/after-directive-kept] [fixture:
comments/after-statement-under-a-section] [fixture:
comments/then-statement-on-next-line] The statement after such a statement
stands on the next line.

Inside a title, a section, a setting, task data, and an accessibility text, `%%`
is a character of the text, not a comment, and is kept with it. [fixture:
comments/percent-in-values-kept]

Input
([comments/single-percent-kept-input.mmd](../tests/fixtures/gantt/comments/single-percent-kept-input.mmd)):

```mmd
gantt
% c
   %x
inclusiveEndDates
```

Output
([comments/single-percent-kept-output.mmd](../tests/fixtures/gantt/comments/single-percent-kept-output.mmd)):

```mmd
gantt
  % c
  %x
  inclusiveEndDates
```

Input
([comments/after-day-input.mmd](../tests/fixtures/gantt/comments/after-day-input.mmd)):

```mmd
gantt
weekday monday%c
weekend   friday   % d
```

Output
([comments/after-day-output.mmd](../tests/fixtures/gantt/comments/after-day-output.mmd)):

```mmd
gantt
  weekday monday%c
  weekend friday % d
```

Input
([comments/after-click-input.mmd](../tests/fixtures/gantt/comments/after-click-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 href "u"%% c
click id1 call f()  %% d
```

Output
([comments/after-click-output.mmd](../tests/fixtures/gantt/comments/after-click-output.mmd)):

```mmd
gantt
  a : id1, 1d
  click id1 href "u"%% c
  click id1 call f() %% d
```

### Directives

A directive on a line of its own stands at the level of the statements around
it, and a directive within a printed line is placed as in a flowchart: the gap
is printed as without the directive, and the directive stands after its space
and touches the unit that follows it. [fixture: directives/kept] [fixture:
directives/before-header] [fixture: directives/after-header-on-same-line]
[fixture: directives/after-header-touching-kept] [fixture:
directives/whitespace-on-both-sides-collapsed] [fixture:
directives/touching-one-side] [fixture:
directives/after-statement-at-end-of-line] [fixture:
directives/statement-after-directive-line]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.

[fixture: gantt/directives/split-directive-gap]

A directive between two units stays in its authored gap, placed as under
[Directives](#directives). Structural continuation columns follow
[Multi-line statements](#multi-line-statements). A directive inside a value is
part of that text. [fixture: directives/between-units] [fixture:
directives/between-task-parts-kept] [fixture: directives/inside-values-kept]
[fixture: directives/over-lines-kept] A directive that is not closed takes the
rest of the text, and is kept as written. [fixture:
directives/unclosed-at-end-of-text-kept] [fixture:
directives/unclosed-after-statement-kept]

Input
([directives/kept-input.mmd](../tests/fixtures/gantt/directives/kept-input.mmd)):

```mmd
gantt
%%{init: {}}%%
   %%{init: {}}%%
title T
   %%{init: {}}%%
```

Output
([directives/kept-output.mmd](../tests/fixtures/gantt/directives/kept-output.mmd)):

```mmd
gantt
  %%{init: {}}%%
  %%{init: {}}%%
  title T
  %%{init: {}}%%
```

Input
([directives/touching-one-side-input.mmd](../tests/fixtures/gantt/directives/touching-one-side-input.mmd)):

```mmd
gantt
weekday monday %%{init: {}}%%
title%%{init: {}}%% T
```

Output
([directives/touching-one-side-output.mmd](../tests/fixtures/gantt/directives/touching-one-side-output.mmd)):

```mmd
gantt
  weekday monday %%{init: {}}%%
  title %%{init: {}}%%T
```

Input
([directives/between-units-input.mmd](../tests/fixtures/gantt/directives/between-units-input.mmd)):

```mmd
gantt
weekday  %%{init: {}}%%  monday
a : id1, 1d
click %%{init: {}}%%id1 href "u"
click id1 call f%%{init: {}}%%()
```

Output
([directives/between-units-output.mmd](../tests/fixtures/gantt/directives/between-units-output.mmd)):

```mmd
gantt
  weekday %%{init: {}}%%monday
  a : id1, 1d
  click %%{init: {}}%%id1 href "u"
  click id1 call f%%{init: {}}%%()
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
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/gantt/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:   {theme:  dark}
---
gantt
title T
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/gantt/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { theme: dark }
---
gantt
  title T
```

Input
([frontmatter-yaml/comment-after-frontmatter-before-header-input.mmd](../tests/fixtures/gantt/frontmatter-yaml/comment-after-frontmatter-before-header-input.mmd)):

```mmd
---
title: T
---
%% c
gantt
title T
```

Output
([frontmatter-yaml/comment-after-frontmatter-before-header-output.mmd](../tests/fixtures/gantt/frontmatter-yaml/comment-after-frontmatter-before-header-output.mmd)):

```mmd
---
title: T
---
%% c
gantt
  title T
```

### Line separators

U+2028 and U+2029 are whitespace between the units of a Gantt chart and
characters of a text. Between statements they are a line break like any
whitespace: the statements go to lines of their own. A gap inside a statement
that holds one is printed as written, and so is a text: a description, a title,
a section name, and an accessibility text keep them. The examples are written as
strings, in which `\u2028` is U+2028 and `\n` is a line break. [test: U+2028
between the header and a statement] [test: U+2028 between two statements] [test:
U+2028 and whitespace at the end of a statement] [test: U+2028 inside a task
description] [test: U+2028 before the colon of a task] [test: U+2028 between the
items of task data] [test: U+2028 after a title keyword] [test: U+2029 inside a
title] [test: U+2028 between the items of a list] [test: U+2028 between weekday
and its day] [test: U+2028 after the colon of accTitle] [test: U+2028 between a
click id and its part] At the end of a title, a date format, or an axis format,
U+2028 and U+2029 are characters of the text and no spaces or tabs: the spaces
after one are left out with the other whitespace at the end of the text, and the
spaces before it stay. [test: U+2028 and spaces at the end of a title] [test:
U+2029 and spaces at the end of a date format]

### Whitespace characters

U+00A0 and U+FEFF are whitespace to the lexer between units, and characters of a
text. Where the lexer reads one whitespace character, such as the separator
after a keyword, a space stands for it; around the items of task data they are
dropped like spaces; before the colon of a task, the description keeps them; and
a list keeps a U+FEFF between its items as written (see [Lists](#lists)). The
examples are written as strings, in which `\u00a0` is U+00A0 and `\ufeff` is
U+FEFF. [test: U+00A0 after a title keyword] [test: U+00A0 between weekday and
its day] [test: U+00A0 between two statements] [test: U+00A0 around an item of
task data] [test: U+00A0 between the items of task data] [test: U+00A0 before
the colon of a task] [test: U+00A0 between the items of a list] [test: U+FEFF
before a task] [test: U+FEFF between the items of a list]
