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
the others. [fixture: indentation/sections-and-tasks-nested] [fixture:
indentation/statements-before-the-first-section] [fixture:
indentation/every-statement-under-a-section] [fixture:
indentation/consecutive-sections] [fixture:
indentation/click-statement-over-lines-under-a-section] A level is what
Prettier's `useTabs` and `tabWidth` options say: two spaces by default.
[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs] The
indentation written in the input is not kept: whitespace at the start of a line
is nothing to mermaid.js. [fixture: indentation/written-indentation-dropped] The
header stands at the first column, also where whitespace was written before it.
[fixture: indentation/header-leading-whitespace] The lines of a text that is
kept as written, such as the lines of an `accDescr` block, keep their columns,
and the `}` that closes a block stands at the level of its statement (see
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
    a :a1, 2024-01-01, 2d
    click a1 href "u"
  section Two
    b :2d
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
        a :1d
```

### Statements one per line

Each statement stands on a line of its own. Nothing separates statements in a
Gantt chart (diagrams/gantt.md, Diagram and statements), and the header,
`inclusiveEndDates`, a `weekday` or `weekend` statement with its day, an
`accDescr` block, and a click statement are followed on their line by the next
statement: the statement after any of them goes to a line of its own. [fixture:
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
  a :id1, 1d
  click id1 href "u"
  b :1d
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
  -x :1d
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
  accDescr { style:#x } a :1d;
  inclusiveEndDates
  weekday monday
```

### Blank lines

Runs of empty lines become one empty line, and empty lines at the start and the
end of the body are dropped. [fixture: blank-lines/collapsed] [fixture:
blank-lines/body-edges-dropped] An empty line between statements is kept, as
one. [fixture: blank-lines/between-statements-kept-as-one] The empty lines
around comment lines are handled in the same way. [fixture:
blank-lines/around-comment-lines] Empty lines around a `section` are kept, as
one, at the level of the lines next to them. [fixture:
blank-lines/around-sections]

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

    a :1d
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

A task is printed as its description, the colon, and its items. The description
is printed as written, with the whitespace between its text and the colon: that
whitespace is part of the description, which the Db keeps, so
`A task           :a1` and `A task :a1` are different tasks, and the padding
that aligns the colons of a chart stays. [fixture:
task-data/description-padding-kept] [fixture:
task-data/colon-after-description-as-written] A description that starts with `#`
or `;` is a task text like any other. [fixture:
task-data/hash-and-semicolon-descriptions]

The first item touches the colon, and a `,` touches the item before it and is
followed by one space where an item follows: whitespace around the colon and the
commas is not in the Db, and is not kept. [fixture:
task-data/colon-touches-first-item] [fixture: task-data/comma-spacing] [fixture:
task-data/tab-around-items] The whitespace at the end of the data is dropped.
[fixture: task-data/trailing-whitespace-dropped]

The tags and the items are printed as written. The whitespace inside an item is
part of it, and so is the case of a tag: `after   a1` is the item as it stands,
and `Done` is no tag. [fixture: task-data/inner-whitespace-kept] [fixture:
task-data/tags] [fixture: task-data/after-until-forms] [fixture:
keyword-case/tags-case-kept]

An empty item is kept, since the number of the items is read by mermaid.js: the
commas stay, and an empty item prints nothing, so `a : , 1d` is printed
`a :, 1d` and `a : 1d,` keeps its comma. [fixture: task-data/empty-items]

Data of whitespace only is one empty item, and mermaid.js needs a character
after the colon: `a : ` is a task, and `a :` is rejected. So one whitespace
character stays after the colon, the first one as written, and the rest is
dropped. Where a directive or another character follows on the line, the line is
printed as written, since the whitespace is read together with it. [fixture:
task-data/whitespace-only-data] [fixture:
task-data/whitespace-only-data-then-directive] A directive between the parts of
a task stays where it is (see [Directives](#directives)).

Input
([task-data/description-padding-kept-input.mmd](../tests/fixtures/gantt/task-data/description-padding-kept-input.mmd)):

```mmd
gantt
Completed task            :done,    des1, 2014-01-06,2014-01-08
Active task               :active,  des2, 2014-01-09, 3d
Future task               :         des3, after des2, 5d
```

Output
([task-data/description-padding-kept-output.mmd](../tests/fixtures/gantt/task-data/description-padding-kept-output.mmd)):

```mmd
gantt
  Completed task            :done, des1, 2014-01-06, 2014-01-08
  Active task               :active, des2, 2014-01-09, 3d
  Future task               :des3, after des2, 5d
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
  A task :a1, 2014-01-01, 30d
  B task :a2, 2014-01-01, 30d
  C task :a3, 2014-01-01
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
  a :done, 1d
  b :active, crit, 2d
  c :Done, 1d
  d :milestone, m1, 2024-01-01, 0d
```

### Settings

`dateFormat`, `axisFormat`, `tickInterval`, and `todayMarker` are printed with
their value as written, the whitespace at its ends included: the Db keeps the
value as it is, so `dateFormat  YYYY-MM-DD` with two spaces has the format of a
space and `YYYY-MM-DD`, and `todayMarker off` followed by two spaces is another
marker. [fixture: settings/value-whitespace-kept] The value of `todayMarker`
holds `#`, and every value holds `%%`, as characters of the text; the value of
`todayMarker` ends at a `;`, and the value of `dateFormat`, `axisFormat`, and
`tickInterval` ends at a `#` or a `;` (see
[Statements one per line](#statements-one-per-line)). [fixture:
settings/hash-semicolon-percent-in-values]

Only the one whitespace character that separates the keyword from its value is
formatted: one space stands there, whatever it was written, a tab or a line
feed. [fixture: settings/one-space-after-keyword] [fixture:
settings/value-on-next-line] A directive between the keyword and the value stays
where it is (see [Directives](#directives)). [fixture:
settings/directive-between-keyword-and-value-kept]

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
  axisFormat  %m
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

`title` and `section` are printed as the settings are: the value as written, the
whitespace at its ends included, which the Db keeps, and one space as the
separator after the keyword. [fixture:
titles-and-sections/value-whitespace-kept] [fixture:
titles-and-sections/one-space-after-keyword] [fixture:
titles-and-sections/value-on-next-line] The value holds `:`, `#`, `;`, and `%%`
as characters. [fixture: titles-and-sections/special-characters-in-values] A
directive between the keyword and the value stays where it is (see
[Directives](#directives)). [fixture:
titles-and-sections/directive-between-keyword-and-value-kept] A value written on
a later line is printed after the keyword on one line; a comment line between
them makes the statement printed as written (see
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
where it is, with the whitespace written on each side of it. [fixture:
lists/directive-after-keyword-kept] [fixture:
lists/directive-between-items-kept]

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
The day keeps the case in which it is written; the Db lowers it. [fixture:
weekday-and-weekend/one-space] [fixture: weekday-and-weekend/day-case-kept]
[fixture: weekday-and-weekend/day-on-next-line] The whitespace at the end of the
line is dropped, after `inclusiveEndDates` too. [fixture:
weekday-and-weekend/trailing-whitespace-dropped] A directive between the keyword
and the day stays where it is. [fixture:
weekday-and-weekend/directive-between-keyword-and-day-kept]

Input
([weekday-and-weekend/day-case-kept-input.mmd](../tests/fixtures/gantt/weekday-and-weekend/day-case-kept-input.mmd)):

```mmd
gantt
weekday MONDAY
weekend Friday
WEEKDAY Tuesday
```

Output
([weekday-and-weekend/day-case-kept-output.mmd](../tests/fixtures/gantt/weekday-and-weekend/day-case-kept-output.mmd)):

```mmd
gantt
  weekday MONDAY
  weekend Friday
  WEEKDAY Tuesday
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

Keywords keep the case in which they are written: mermaid.js reads them in any
case, and the Db is the same. [fixture: keyword-case/keywords-kept] [fixture:
keyword-case/click-keywords-kept] The header `gantt` is detected in lower case
only, and the tags of a task are read in exactly the case of `active`, `done`,
`crit`, `milestone`, and `vert`, so `Done` is no tag and is not changed.
[fixture: keyword-case/tags-case-kept]

Input
([keyword-case/keywords-kept-input.mmd](../tests/fixtures/gantt/keyword-case/keywords-kept-input.mmd)):

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
([keyword-case/keywords-kept-output.mmd](../tests/fixtures/gantt/keyword-case/keywords-kept-output.mmd)):

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

The name of a call and its arguments are printed as written, with the whitespace
and the line breaks in them: `f ()` has the name `f` and a space, and
`f( 1, 2 )` the arguments of a space, `1, 2`, and a space, which the Db keeps.
The string of a link is printed as written. [fixture:
click-statements/call-name-and-arguments-kept] [fixture:
click-statements/href-string-kept] A string or an argument list written over
lines is printed as written (see [Multi-line values](#multi-line-values)).
[fixture: click-statements/string-over-lines-kept] A comment line or a directive
between the parts keeps the statement as written. [fixture:
click-statements/comment-line-between-parts-kept] [fixture:
click-statements/directive-between-parts-kept]

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
  a :id1, 1d
  b :id2, 1d
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
  a :id1, 1d
  click id1 href "u" call f()
  click id1 call f() href "u"
```

Input
([click-statements/call-name-and-arguments-kept-input.mmd](../tests/fixtures/gantt/click-statements/call-name-and-arguments-kept-input.mmd)):

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
([click-statements/call-name-and-arguments-kept-output.mmd](../tests/fixtures/gantt/click-statements/call-name-and-arguments-kept-output.mmd)):

```mmd
gantt
  a :id1, 1d
  click id1 call f ()
  click id1 call f( 1, 2 )
  click id1 call f(1,2)
  click id1 call f( )
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
  accDescr{}
  accDescr {}
  accDescr{ }
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
  accDescr { }
```

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line
where the line break is whitespace to the lexer: after `title`, `section`, a
setting, `weekday`, `weekend`, `includes`, `excludes`, `accTitle:`, and
`accDescr:`, between the parts of a click statement, and around the `:` of
`accTitle` and `accDescr`. Empty lines there are dropped too. [fixture:
multi-line-statements/value-on-next-line-joined] [fixture:
multi-line-statements/blank-lines-between-keyword-and-day] A statement with a
comment line, a directive, or a `;` in it is kept as written, since the comment
line would take the rest of the line it stands on, and a `;` could come to a
line that matches the line rule. [fixture:
multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] [fixture:
multi-line-statements/semicolon-inside-kept]

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

The arguments and the name of a call, the string of a link, and the lines of an
`accDescr` block are kept as written, with the line breaks and the whitespace
inside, since they are part of the value. [fixture:
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
  a :id1, 1d
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
statement becomes one space, and tokens that touch keep touching: the whitespace
between the parentheses of a call with blank arguments, and the braces of a
description block. [fixture: whitespace-between-tokens/blank-arguments] The
whitespace at the end of the header's line is dropped. [fixture:
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
  a :id1, 1d
  click id1 call f( )
  click id1 call f()
```

### Comments

A comment starts with `%%` or `%`, where a unit starts, and runs to the end of
the line. A comment on a line of its own stands at the level of the statements
around it, and its text and its mark are kept as written. [fixture:
comments/lines-at-statement-level] [fixture: comments/text-kept] [fixture:
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
  a :id1, 1d
  click id1 href "u"%% c
  click id1 call f() %% d
```

### Directives

A directive on a line of its own stands at the level of the statements around
it, and a directive on the line of a statement keeps whether whitespace is
written on each side of it: where it is, one space stands there, and where it
touches a token, it keeps touching. [fixture: directives/kept] [fixture:
directives/before-header] [fixture: directives/after-header-on-same-line]
[fixture: directives/after-header-touching-kept] [fixture:
directives/whitespace-on-both-sides-collapsed] [fixture:
directives/touching-one-side-kept] [fixture:
directives/after-statement-at-end-of-line] [fixture:
directives/statement-after-directive-line]

A directive between two units of a statement stays where it is, with the
whitespace written on each side of it, and a directive inside a text is part of
the text. [fixture: directives/between-units-kept] [fixture:
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
([directives/touching-one-side-kept-input.mmd](../tests/fixtures/gantt/directives/touching-one-side-kept-input.mmd)):

```mmd
gantt
weekday monday %%{init: {}}%%
title%%{init: {}}%% T
```

Output
([directives/touching-one-side-kept-output.mmd](../tests/fixtures/gantt/directives/touching-one-side-kept-output.mmd)):

```mmd
gantt
  weekday monday %%{init: {}}%%
  title%%{init: {}}%% T
```

Input
([directives/between-units-kept-input.mmd](../tests/fixtures/gantt/directives/between-units-kept-input.mmd)):

```mmd
gantt
weekday  %%{init: {}}%%  monday
a : id1, 1d
click %%{init: {}}%%id1 href "u"
click id1 call f%%{init: {}}%%()
```

Output
([directives/between-units-kept-output.mmd](../tests/fixtures/gantt/directives/between-units-kept-output.mmd)):

```mmd
gantt
  weekday %%{init: {}}%% monday
  a :id1, 1d
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
click id and its part]

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
