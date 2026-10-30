# Timeline formatting rules

Japanese version: [timeline.ja.md](./timeline.ja.md)

How prettier-plugin-mmd formats a timeline. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. A timeline keeps the whitespace at the
ends of its periods, events, titles, and section names in the Db, so these are
printed as written; the rules say which whitespace is formatted. Where a rule is
the same as in a user journey or a flowchart, it says so, and the reason is in
their rules.

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The statements after the header stand one level deeper than the header, and the
statements after a `section`, up to the next `section`, one level deeper still:
the periods, and every other statement. The `section` itself stands at the first
level. The tree of a timeline is flat, with no block of statements, so the level
of a statement is decided by its place among the others. This is the rule of a
user journey and a Gantt chart: the periods of a section stand inside it, as the
documentation of mermaid.js writes them. [fixture:
indentation/sections-and-periods-nested] [fixture:
indentation/statements-before-the-first-section] [fixture:
indentation/every-statement-under-a-section] [fixture:
indentation/consecutive-sections] A level is what Prettier's `useTabs` and
`tabWidth` options say: two spaces by default. [fixture:
indentation/tab-width-4] [fixture: indentation/use-tabs]

The indentation written in the input is not kept. Whitespace at the start of a
line is nothing to mermaid.js, so the printer chooses the indentation from the
structure alone, and one rule per level prints the same text whatever the input
was indented with, and a period that is indented more than the one before it is
another period (diagrams/timeline.md, Lexical structure). [fixture:
indentation/written-indentation-dropped] The header stands at the first column,
also where whitespace was written before it. [fixture:
indentation/header-leading-whitespace] The lines of a text that is kept as
written, such as the lines of an `accDescr` block, keep their columns, and the
`}` that closes a block stands at the level of its statement (see
[Multi-line values](#multi-line-values)). [fixture:
indentation/description-block-under-a-section] The later lines of a period and
its events stand one level deeper than its first line (see
[Periods and events](#periods-and-events)). [fixture:
indentation/event-lines-under-a-section]

Input
([indentation/sections-and-periods-nested-input.mmd](../tests/fixtures/timeline/indentation/sections-and-periods-nested-input.mmd)):

```mmd
timeline
title History of Social Media
section Early years
2002 : LinkedIn
2004 : Facebook : Google
section Later
2005 : YouTube
```

Output
([indentation/sections-and-periods-nested-output.mmd](../tests/fixtures/timeline/indentation/sections-and-periods-nested-output.mmd)):

```mmd
timeline
  title History of Social Media
  section Early years
    2002 : LinkedIn
    2004 : Facebook : Google
  section Later
    2005 : YouTube
```

Input
([indentation/tab-width-4-input.mmd](../tests/fixtures/timeline/indentation/tab-width-4-input.mmd)):

```mmd
timeline
title T
section S
2002 : x
```

Output
([indentation/tab-width-4-output.mmd](../tests/fixtures/timeline/indentation/tab-width-4-output.mmd)):

```mmd
timeline
    title T
    section S
        2002 : x
```

### Statements one per line

Each statement stands on a line of its own. Nothing separates statements in a
timeline (diagrams/timeline.md, Diagram and statements), and the header and an
`accDescr` block are followed on their line by the next statement: the statement
after either of them goes to a line of its own. The direction of the header
stays on its line. [fixture: statements-one-per-line/header-then-title]
[fixture: statements-one-per-line/header-then-period] [fixture:
statements-one-per-line/header-then-section] [fixture:
statements-one-per-line/header-direction-then-title] [fixture:
statements-one-per-line/description-block-then-period] [fixture:
statements-one-per-line/description-blocks-adjacent]

A `title` takes the rest of its line, and a period takes every event that
follows it on the line: `title T : e` is a title, and `a : b -- c : d` is the
period `a ` with two events. Nothing else follows them on their line. [fixture:
statements-one-per-line/title-takes-the-line] [fixture:
statements-one-per-line/events-stay-with-the-period] A statement that touches
the one before it goes to a line of its own as well, since mermaid.js reads both
the same: the period `-x ` after the header in `timeline-x : 1`, and a period
after the `}` of an empty description block. [fixture:
statements-one-per-line/header-glued-period] [fixture:
statements-one-per-line/empty-description-block-glued-period] An empty
description block is a statement that changes nothing, wherever a statement
starts, and stands on a line of its own too, also before an event, which is then
an event statement (see [Event statements](#event-statements)). [fixture:
statements-one-per-line/empty-description-block-then-period] [fixture:
statements-one-per-line/empty-description-block-then-event] A directive between
two statements on a line moves with the statement after it. [fixture:
statements-one-per-line/directive-after-statement]

A statement moves to a line of its own only when no whitespace that is part of a
text would then end the line before it. The name of a section keeps the
whitespace before its colon in the Db, so `section T : Google` is the section
`T ` and an event, and moving the event to its own line would leave the space at
the end of the line of the section: the two stay together, with the whitespace
between them as written. Without that whitespace, as in `section T: Google`, the
event goes to a line of its own. [fixture:
statements-one-per-line/section-with-trailing-whitespace-keeps-the-event]
[fixture:
statements-one-per-line/section-with-trailing-whitespace-keeps-the-events]
[fixture: statements-one-per-line/section-with-trailing-tab-keeps-the-event]
[fixture: statements-one-per-line/section-with-a-directive-keeps-the-event]
[fixture:
statements-one-per-line/section-without-trailing-whitespace-moves-the-event]

A line that holds a `;` keeps its statements together: the line rule of
mermaid.js removes the last `;` of a line that holds `style`, a `:` after it,
and a `#` after that, and moving a statement to a line of its own makes the rule
stop ignoring a `;`, or ignore another. After `accDescr { style:#x }`, `a;b : e`
is the period `ab `, while `a;b : e` on a line of its own is the period `a;b `.
So the statements of such a line stay on it, with the whitespace between them
formatted as anywhere else, and the `;` stays as written. [fixture:
statements-one-per-line/ignored-semicolon-line-kept]

Input
([statements-one-per-line/header-direction-then-title-input.mmd](../tests/fixtures/timeline/statements-one-per-line/header-direction-then-title-input.mmd)):

```mmd
timeline TD title T
```

Output
([statements-one-per-line/header-direction-then-title-output.mmd](../tests/fixtures/timeline/statements-one-per-line/header-direction-then-title-output.mmd)):

```mmd
timeline TD
  title T
```

Input
([statements-one-per-line/description-block-then-period-input.mmd](../tests/fixtures/timeline/statements-one-per-line/description-block-then-period-input.mmd)):

```mmd
timeline
accDescr { d } 2002 : x
```

Output
([statements-one-per-line/description-block-then-period-output.mmd](../tests/fixtures/timeline/statements-one-per-line/description-block-then-period-output.mmd)):

```mmd
timeline
  accDescr { d }
  2002 : x
```

Input
([statements-one-per-line/section-with-trailing-whitespace-keeps-the-event-input.mmd](../tests/fixtures/timeline/statements-one-per-line/section-with-trailing-whitespace-keeps-the-event-input.mmd)):

```mmd
timeline
section S
2004 : Facebook
section T : Google
```

Output
([statements-one-per-line/section-with-trailing-whitespace-keeps-the-event-output.mmd](../tests/fixtures/timeline/statements-one-per-line/section-with-trailing-whitespace-keeps-the-event-output.mmd)):

```mmd
timeline
  section S
    2004 : Facebook
  section T : Google
```

Input
([statements-one-per-line/section-without-trailing-whitespace-moves-the-event-input.mmd](../tests/fixtures/timeline/statements-one-per-line/section-without-trailing-whitespace-moves-the-event-input.mmd)):

```mmd
timeline
section S
2004 : Facebook
section T: Google
```

Output
([statements-one-per-line/section-without-trailing-whitespace-moves-the-event-output.mmd](../tests/fixtures/timeline/statements-one-per-line/section-without-trailing-whitespace-moves-the-event-output.mmd)):

```mmd
timeline
  section S
    2004 : Facebook
  section T
    : Google
```

### Blank lines

Runs of empty lines become one empty line, and empty lines at the start and the
end of the body are dropped, as in a user journey. [fixture:
blank-lines/collapsed] [fixture: blank-lines/body-edges-dropped] The empty lines
around comment lines are handled in the same way. [fixture:
blank-lines/around-comment-lines] Empty lines around a `section` are kept, as
one, at the level of the lines next to them. [fixture:
blank-lines/around-sections] Empty lines inside a period and its events are
handled in the same way, and stay inside it. [fixture:
blank-lines/between-a-period-and-its-events]

A timeline has no known divergence about empty lines: mermaid.js accepts an
empty line after the header, after a comment, and inside a period and its
events, so no empty line is dropped to keep the text accepted.

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/timeline/blank-lines/collapsed-input.mmd)):

```mmd
timeline
title T



section S


2002 : x
```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/timeline/blank-lines/collapsed-output.mmd)):

```mmd
timeline
  title T

  section S

    2002 : x
```

Input
([blank-lines/between-a-period-and-its-events-input.mmd](../tests/fixtures/timeline/blank-lines/between-a-period-and-its-events-input.mmd)):

```mmd
timeline
2004 : Facebook


: Google
```

Output
([blank-lines/between-a-period-and-its-events-output.mmd](../tests/fixtures/timeline/blank-lines/between-a-period-and-its-events-output.mmd)):

```mmd
timeline
  2004 : Facebook

    : Google
```

### Periods and events

A period and its events are printed as written, with the whitespace between
their texts and their colons. The Db keeps the whitespace at the end of a
period, which is the whitespace before its colon, and the whitespace at both
ends of an event beyond the one character after its colon: `2004 : a` and
`2004: a` are different periods, `a :   e` has the event `  e`, and `a : e   `
the event `e   `. So the padding that aligns the colons of a timeline stays, and
a colon that touches its period keeps touching it. [fixture:
periods-and-events/period-whitespace-kept] [fixture:
periods-and-events/event-whitespace-kept] [fixture:
periods-and-events/whitespace-only-event] [fixture:
periods-and-events/trailing-whitespace-kept] A colon, a `#`, and a `%%` in an
event are characters of its text, and so are the colons that no whitespace
follows. [fixture: periods-and-events/colon-inside-event] [fixture:
periods-and-events/special-characters-in-events] A `;` is a character of a text
too (see [Statements one per line](#statements-one-per-line)). [fixture:
periods-and-events/semicolons-in-texts-kept] [fixture:
periods-and-events/semicolon-in-a-later-line]

The text of an event stands after one space after its colon. That character is
the separator that the lexer reads after the colon, whatever it is, and it is
not in the Db; the whitespace after it is the text. A space is written whatever
the separator was, as after `title` and `section` (see Titles and sections), so
that the separator has one form. [fixture: periods-and-events/separator-tab]

An event stays on the line on which it was written: events after the period on
its line stay on that line, and an event written on a later line, or after a
period that stands alone on its line, stays on a later line. Moving an event
from line to line would change the Db: joining `2004 : Facebook` and `: Google`
into one line with a space between would give the event `Facebook ` instead of
`Facebook`, and splitting an event off the line would leave the whitespace
before it at the end of the line. [fixture:
periods-and-events/events-on-the-period-line] [fixture:
periods-and-events/events-on-later-lines] [fixture:
periods-and-events/event-on-the-line-after-the-period] [fixture:
periods-and-events/events-on-both]

The later lines of a period and its events stand one level deeper than its first
line, as the later lines of a statement do in a flowchart. Aligning each colon
under that of the period, as the documentation of mermaid.js does by hand, would
need the width of the period, which a tab or a wide character leaves undefined.
[fixture: periods-and-events/later-lines-in-a-section] Comment lines and
directive lines inside it stay inside it, at the level of its later lines, and a
run of empty lines inside it becomes one. [fixture:
periods-and-events/comment-lines-inside] [fixture:
periods-and-events/empty-lines-inside] [fixture:
periods-and-events/directive-line-inside] A comment after a period stays on its
line, with the whitespace before it, which is part of the period. [fixture:
periods-and-events/comment-after-period]

The word `title` or `section` alone on a line is a period, because no text
follows it. When a line of only a directive follows it, with comment lines
between them or without, that line is empty once mermaid.js removes the
directive; whitespace before the directive would be the text of a title or a
section, and change the Db. After an empty line the whitespace is not read. The
printer does not tell the two apart: every line of only a directive in the gap
before the next statement stands at the first column, which is one rule instead
of two. [fixture: periods-and-events/title-word-then-directive-line] [fixture:
periods-and-events/section-word-then-directive-line] [fixture:
periods-and-events/title-word-then-directive-lines] [fixture:
periods-and-events/title-word-then-directive-line-at-the-end] [fixture:
periods-and-events/title-word-then-comment-line-then-directive-line] [fixture:
periods-and-events/title-word-then-empty-line-then-directive-line] [fixture:
periods-and-events/section-word-then-comment-line-then-directive-line]

Input
([periods-and-events/period-whitespace-kept-input.mmd](../tests/fixtures/timeline/periods-and-events/period-whitespace-kept-input.mmd)):

```mmd
timeline
2002   : LinkedIn
2004: Facebook
2005 : YouTube
```

Output
([periods-and-events/period-whitespace-kept-output.mmd](../tests/fixtures/timeline/periods-and-events/period-whitespace-kept-output.mmd)):

```mmd
timeline
  2002   : LinkedIn
  2004: Facebook
  2005 : YouTube
```

Input
([periods-and-events/events-on-both-input.mmd](../tests/fixtures/timeline/periods-and-events/events-on-both-input.mmd)):

```mmd
timeline
2004 : Facebook : Google
2005 : YouTube
: Vimeo
2006
: Zoom
```

Output
([periods-and-events/events-on-both-output.mmd](../tests/fixtures/timeline/periods-and-events/events-on-both-output.mmd)):

```mmd
timeline
  2004 : Facebook : Google
  2005 : YouTube
    : Vimeo
  2006
    : Zoom
```

Input
([periods-and-events/later-lines-in-a-section-input.mmd](../tests/fixtures/timeline/periods-and-events/later-lines-in-a-section-input.mmd)):

```mmd
timeline
title History
section Early
2002 : LinkedIn
2004 : Facebook
  : Google
         : Apple
2005 : YouTube
```

Output
([periods-and-events/later-lines-in-a-section-output.mmd](../tests/fixtures/timeline/periods-and-events/later-lines-in-a-section-output.mmd)):

```mmd
timeline
  title History
  section Early
    2002 : LinkedIn
    2004 : Facebook
      : Google
      : Apple
    2005 : YouTube
```

Input
([periods-and-events/comment-lines-inside-input.mmd](../tests/fixtures/timeline/periods-and-events/comment-lines-inside-input.mmd)):

```mmd
timeline
2004 : Facebook
# c
: Google
%% d
2005 : YouTube
```

Output
([periods-and-events/comment-lines-inside-output.mmd](../tests/fixtures/timeline/periods-and-events/comment-lines-inside-output.mmd)):

```mmd
timeline
  2004 : Facebook
    # c
    : Google
  %% d
  2005 : YouTube
```

Input
([periods-and-events/title-word-then-directive-line-input.mmd](../tests/fixtures/timeline/periods-and-events/title-word-then-directive-line-input.mmd)):

```mmd
timeline
title
%%{init: {}}%%
T
```

Output
([periods-and-events/title-word-then-directive-line-output.mmd](../tests/fixtures/timeline/periods-and-events/title-word-then-directive-line-output.mmd)):

```mmd
timeline
  title
%%{init: {}}%%
  T
```

### Event statements

An event after a statement that is not a period, a title, a section, an
accessibility statement, or an empty description block, is an event statement.
mermaid.js gives its events to the last period before it, across the statements
between (diagrams/timeline.md, Periods and events), and the printer does not
move it: it stays where it was written, on a line of its own, at the level of
the statements around it. No printer of this project moves a statement past
another, and what the reader makes of an event that follows a title is not a
question of formatting. [fixture: event-statements/after-title] [fixture:
event-statements/after-section] [fixture: event-statements/after-acc-title]
[fixture: event-statements/after-acc-descr] [fixture:
event-statements/after-description-block] [fixture:
event-statements/after-empty-description-block] [fixture:
event-statements/in-a-section] Comment lines, directive lines, and empty lines
before it stand as before any other statement. [fixture:
event-statements/comment-line-before] [fixture:
event-statements/directive-line-before] [fixture:
event-statements/empty-lines-before]

The events of an event statement are laid out as those of a period: they stay on
the line on which they were written, and the later lines of the statement stand
one level deeper than its first. [fixture: event-statements/several-events]
[fixture: event-statements/events-of-an-event-statement-on-the-line]

Input
([event-statements/after-title-input.mmd](../tests/fixtures/timeline/event-statements/after-title-input.mmd)):

```mmd
timeline
2004 : Facebook
title History
: Google
2005 : YouTube
```

Output
([event-statements/after-title-output.mmd](../tests/fixtures/timeline/event-statements/after-title-output.mmd)):

```mmd
timeline
  2004 : Facebook
  title History
  : Google
  2005 : YouTube
```

Input
([event-statements/several-events-input.mmd](../tests/fixtures/timeline/event-statements/several-events-input.mmd)):

```mmd
timeline
2004 : a
title T
: e1
: e2 : e3
```

Output
([event-statements/several-events-output.mmd](../tests/fixtures/timeline/event-statements/several-events-output.mmd)):

```mmd
timeline
  2004 : a
  title T
  : e1
    : e2 : e3
```

### Titles and sections

`title` and `section` are printed with the value as written, the whitespace at
its ends included, which the Db keeps, and one space as the separator after the
keyword, whatever character was written there, as in a user journey. [fixture:
titles-and-sections/value-whitespace-kept] [fixture:
titles-and-sections/one-space-after-keyword] A value written on a later line is
printed after the keyword on one line; a comment line between them makes the
statement printed as written (see
[Multi-line statements](#multi-line-statements)). [fixture:
titles-and-sections/value-on-next-line] [fixture:
titles-and-sections/comment-line-inside-kept] The value holds `:`, `#`, `%`, and
`%%` as characters, except that the name of a section ends at a `:`, which
starts an event. [fixture: titles-and-sections/special-characters-in-values]
[fixture: titles-and-sections/section-ends-at-colon] A directive between the
keyword and the value stays where it is (see [Directives](#directives)).
[fixture: titles-and-sections/directive-between-keyword-and-value-kept]

Input
([titles-and-sections/special-characters-in-values-input.mmd](../tests/fixtures/timeline/titles-and-sections/special-characters-in-values-input.mmd)):

```mmd
timeline
title a: b % c %% d # e
section x % y %% z # w
```

Output
([titles-and-sections/special-characters-in-values-output.mmd](../tests/fixtures/timeline/titles-and-sections/special-characters-in-values-output.mmd)):

```mmd
timeline
  title a: b % c %% d # e
  section x % y %% z # w
```

Input
([titles-and-sections/value-on-next-line-input.mmd](../tests/fixtures/timeline/titles-and-sections/value-on-next-line-input.mmd)):

```mmd
timeline
title
T
section
S
```

Output
([titles-and-sections/value-on-next-line-output.mmd](../tests/fixtures/timeline/titles-and-sections/value-on-next-line-output.mmd)):

```mmd
timeline
  title T
  section S
```

### Keyword case

Keywords keep the case in which they are written. mermaid.js reads them in any
case and the Db is the same, so nothing forces the case; it is the author's, and
the printer does not rewrite it. The header `timeline` is detected in lower case
only. [fixture: keyword-case/keywords-kept]

Input
([keyword-case/keywords-kept-input.mmd](../tests/fixtures/timeline/keyword-case/keywords-kept-input.mmd)):

```mmd
timeline
TITLE T
Section S
ACCTITLE: T
AccDescr: d
ACCDESCR { d }
```

Output
([keyword-case/keywords-kept-output.mmd](../tests/fixtures/timeline/keyword-case/keywords-kept-output.mmd)):

```mmd
timeline
  TITLE T
  Section S
    ACCTITLE: T
    AccDescr: d
    ACCDESCR { d }
```

### Header and direction

The header may carry a direction, `LR` or `TD` in any case, after whitespace on
its line. It is printed on the line of the header after one space, in the case
in which it was written, and the Db reads it in upper case. The space is the one
of the whitespace between tokens (see Whitespace between tokens), and the case
is the author's. [fixture: header-and-direction/direction-kept] [fixture:
header-and-direction/direction-case-kept] [fixture:
header-and-direction/spaces-before-the-direction] A second word is a period and
goes to a line of its own, and so is a direction on a line of its own. [fixture:
header-and-direction/second-word-is-a-period] [fixture:
header-and-direction/direction-on-its-own-line-is-a-period]

A comment after the direction stays on the line (see [Comments](#comments)), and
a directive before it or after it keeps one space on each side, as everywhere
else (see [Directives](#directives)). The whitespace at the end of the line is
dropped. [fixture: header-and-direction/comment-after-the-direction] [fixture:
header-and-direction/directive-before-the-direction] [fixture:
header-and-direction/directive-after-the-direction] [fixture:
header-and-direction/trailing-whitespace-dropped]

Input
([header-and-direction/second-word-is-a-period-input.mmd](../tests/fixtures/timeline/header-and-direction/second-word-is-a-period-input.mmd)):

```mmd
timeline TD LR
title T
```

Output
([header-and-direction/second-word-is-a-period-output.mmd](../tests/fixtures/timeline/header-and-direction/second-word-is-a-period-output.mmd)):

```mmd
timeline TD
  LR
  title T
```

Input
([header-and-direction/directive-before-the-direction-input.mmd](../tests/fixtures/timeline/header-and-direction/directive-before-the-direction-input.mmd)):

```mmd
timeline %%{init: {}}%%  TD
title T
```

Output
([header-and-direction/directive-before-the-direction-output.mmd](../tests/fixtures/timeline/header-and-direction/directive-before-the-direction-output.mmd)):

```mmd
timeline %%{init: {}}%% TD
  title T
```

### Accessibility statements

The `:` of `accTitle` and `accDescr` touches the keyword and has one space after
it, as in a user journey; the text has no whitespace at its ends, which the Db
does not keep. [fixture: accessibility-statements/colon-touches-keyword]
[fixture: accessibility-statements/text-whitespace-dropped] The text and the
colon may stand on later lines, and are printed on the line of the keyword.
[fixture: accessibility-statements/text-on-next-line-joined] [fixture:
accessibility-statements/keyword-and-colon-over-lines-joined] The text holds
`:`, `;`, `#`, `%`, and `%%` as characters. [fixture:
accessibility-statements/special-characters-in-text]

An `accDescr` block with text has the `{` after one space (or touching the
keyword, as written), the text on the line of the `{` between one space on each
side, and the `}` after it; where the text starts on a later line, its lines are
kept as written and the `}` stands at the level of the statement (see
[Multi-line values](#multi-line-values)). [fixture:
accessibility-statements/block-text-on-opening-line] [fixture:
accessibility-statements/block-inner-whitespace-kept] [fixture:
accessibility-statements/block-lines-kept] [fixture:
accessibility-statements/block-comment-and-empty-lines-kept] A directive around
the colon or the braces stays where it is. [fixture:
accessibility-statements/directive-around-colon-and-braces-kept]

Input
([accessibility-statements/colon-touches-keyword-input.mmd](../tests/fixtures/timeline/accessibility-statements/colon-touches-keyword-input.mmd)):

```mmd
timeline
accTitle   :   T
accDescr :D
accTitle:T
```

Output
([accessibility-statements/colon-touches-keyword-output.mmd](../tests/fixtures/timeline/accessibility-statements/colon-touches-keyword-output.mmd)):

```mmd
timeline
  accTitle: T
  accDescr: D
  accTitle: T
```

Input
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/timeline/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
timeline
accDescr {
   a
  b
}
```

Output
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/timeline/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
timeline
  accDescr {
   a
  b
  }
```

### Empty description blocks

An empty block, which changes nothing, is a statement of its own. The
whitespace-only interior of a description block, including tabs, line breaks and
Unicode whitespace, prints `{}`: there is no text for interior whitespace to
surround. An already empty interior stays empty. A touching keyword stays
touching: `accDescr{  }` becomes `accDescr{}`. [fixture:
empty-description-blocks/empty-whitespace-interiors] [test: timeline Unicode and
tab interiors] [fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/blank-lines-inside] A block with a directive or a
comment line is printed as written. [fixture:
empty-description-blocks/with-directive-or-comment-line-kept] It stands on a
line of its own, also after the header. [fixture:
empty-description-blocks/after-header]

Input
([empty-description-blocks/touching-kept-input.mmd](../tests/fixtures/timeline/empty-description-blocks/touching-kept-input.mmd)):

```mmd
timeline
accDescr{}
accDescr {}
accDescr{ }
```

Output
([empty-description-blocks/touching-kept-output.mmd](../tests/fixtures/timeline/empty-description-blocks/touching-kept-output.mmd)):

```mmd
timeline
  accDescr{}
  accDescr {}
  accDescr{}
```

Input
([empty-description-blocks/blank-lines-inside-input.mmd](../tests/fixtures/timeline/empty-description-blocks/blank-lines-inside-input.mmd)):

```mmd
timeline
accDescr {


}
```

Output
([empty-description-blocks/blank-lines-inside-output.mmd](../tests/fixtures/timeline/empty-description-blocks/blank-lines-inside-output.mmd)):

```mmd
timeline
  accDescr {}
```

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line
where the line break is whitespace to the lexer: after `title`, `section`,
`accTitle:`, and `accDescr:`, around the `:` of `accTitle` and `accDescr`, and
after the colon of an event, where the line break is the one whitespace
character that the lexer reads after the colon. The text then goes to the line
of the colon, with the whitespace at its start, which is part of the event.
[fixture: multi-line-statements/value-on-next-line-joined] [fixture:
multi-line-statements/event-text-on-next-line-keeps-its-whitespace] A period and
its events are written over several lines in another way, with a colon at the
start of a later line, and keep their line breaks (see
[Periods and events](#periods-and-events)).

A statement with a comment line or a directive in a line break that it would
join is kept as written, since the comment line would take the rest of the line
it stands on, and the whitespace of a line that holds a directive is read with
it. [fixture: multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] After the colon of an event, an
indented line of only a directive is the whitespace that starts the event, so
the event is printed on the line of the colon, with that whitespace, and the
directive after it. [fixture:
multi-line-statements/directive-line-after-the-colon-is-the-text] A `;` in such
a statement keeps it as written too, because the joined line could be read by
the line rule of mermaid.js differently (see
[Statements one per line](#statements-one-per-line)). [fixture:
multi-line-statements/text-on-next-line-with-semicolon-kept]

Input
([multi-line-statements/value-on-next-line-joined-input.mmd](../tests/fixtures/timeline/multi-line-statements/value-on-next-line-joined-input.mmd)):

```mmd
timeline
title
T
section
S
accTitle:
T
a :
e
b : f :
g
```

Output
([multi-line-statements/value-on-next-line-joined-output.mmd](../tests/fixtures/timeline/multi-line-statements/value-on-next-line-joined-output.mmd)):

```mmd
timeline
  title T
  section S
    accTitle: T
    a : e
    b : f : g
```

Input
([multi-line-statements/comment-line-inside-kept-input.mmd](../tests/fixtures/timeline/multi-line-statements/comment-line-inside-kept-input.mmd)):

```mmd
timeline
title
%% c
T
accTitle:
%% d
T
a :
%% e
  f
```

Output
([multi-line-statements/comment-line-inside-kept-output.mmd](../tests/fixtures/timeline/multi-line-statements/comment-line-inside-kept-output.mmd)):

```mmd
timeline
  title
%% c
T
  accTitle:
%% d
T
  a :
%% e
  f
```

### Multi-line values

The lines of an `accDescr` block are kept as written, with the line breaks and
the whitespace inside. The line breaks are in the Db, but the whitespace at the
start of a line is not, so keeping it is a choice: the text of a value is not
formatted. [fixture: multi-line-values/description-block-lines-kept] A comment
inside such a block is part of the text. [fixture:
multi-line-values/comment-line-inside-block-kept]

Input
([multi-line-values/description-block-lines-kept-input.mmd](../tests/fixtures/timeline/multi-line-values/description-block-lines-kept-input.mmd)):

```mmd
timeline
accDescr {
  a
    b
}
```

Output
([multi-line-values/description-block-lines-kept-output.mmd](../tests/fixtures/timeline/multi-line-values/description-block-lines-kept-output.mmd)):

```mmd
timeline
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
formatted: see [Periods and events](#periods-and-events) and
[Titles and sections](#titles-and-sections).

Input
([whitespace-between-tokens/description-block-braces-input.mmd](../tests/fixtures/timeline/whitespace-between-tokens/description-block-braces-input.mmd)):

```mmd
timeline
accDescr  {  d  }
accDescr{e}
accDescr {f}
```

Output
([whitespace-between-tokens/description-block-braces-output.mmd](../tests/fixtures/timeline/whitespace-between-tokens/description-block-braces-output.mmd)):

```mmd
timeline
  accDescr { d }
  accDescr{e}
  accDescr {f}
```

### Comments

A comment starts with `#`, `%%`, or `%`, where a unit starts, and runs to the
end of the line. A comment on a line of its own stands at the level of the
statement after it, as in a user journey, and its text and its mark are kept as
written: a comment before a `section` stands at its level, and one before a
period at the level of the period; at the end of the text it stands at the level
of the last statement. [fixture: comments/lines-at-statement-level] [fixture:
comments/text-kept] [fixture: comments/single-percent-kept] [fixture:
comments/bare-percent-lines] [fixture: comments/levels-around-sections] A
comment line before the header stands at the first column, and one at the end of
the text stays on a line of its own, with the line break added. [fixture:
comments/before-header] [fixture: comments/last-in-body]

A comment after the header or a direction, after the `}` of an accessibility
block, or after a period stays on the line, as written: one space stands before
it where whitespace was written, and none where it touches. After a period, the
whitespace before the `#` is part of the period, and stays as it is (see
[Periods and events](#periods-and-events)). [fixture: comments/after-header]
[fixture: comments/after-header-glued] [fixture: comments/after-header-percent]
[fixture: comments/after-period] [fixture: comments/after-description-block]
[fixture: comments/after-statement-under-a-section]

Inside a title, a section, an event, and an accessibility text, `#` and `%%` are
characters of the text, not a comment, and are kept with it. [fixture:
comments/hash-and-percent-in-texts-kept]

Input
([comments/after-period-input.mmd](../tests/fixtures/timeline/comments/after-period-input.mmd)):

```mmd
timeline
a # c
b  #d
e# f
```

Output
([comments/after-period-output.mmd](../tests/fixtures/timeline/comments/after-period-output.mmd)):

```mmd
timeline
  a # c
  b  #d
  e# f
```

Input
([comments/after-header-input.mmd](../tests/fixtures/timeline/comments/after-header-input.mmd)):

```mmd
timeline # c
title T
```

Output
([comments/after-header-output.mmd](../tests/fixtures/timeline/comments/after-header-output.mmd)):

```mmd
timeline # c
  title T
```

Input
([comments/bare-percent-lines-input.mmd](../tests/fixtures/timeline/comments/bare-percent-lines-input.mmd)):

```mmd
timeline
%%
   %%
title T
```

Output
([comments/bare-percent-lines-output.mmd](../tests/fixtures/timeline/comments/bare-percent-lines-output.mmd)):

```mmd
timeline
  %%
  %%
  title T
```

### Directives

A directive on a line of its own stands at the level of the statement after it,
as in a user journey, and a directive within a printed line keeps whether
whitespace is written on each side of it: where it is, one space stands there,
and where it touches a token, it keeps touching. [fixture: directives/kept]
[fixture: directives/levels-around-sections] [fixture: directives/before-header]
[fixture: directives/after-header-on-same-line] [fixture:
directives/after-header-touching-kept] [fixture:
directives/whitespace-on-both-sides-collapsed] [fixture:
directives/statement-after-directive-line]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.

[fixture: timeline/directives/whitespace-on-both-sides-collapsed]

A directive between two units of a statement stays where it is, with the
whitespace written on each side of it, and a directive inside a text is part of
the text. [fixture: directives/between-units-kept] [fixture:
directives/inside-values-kept] [fixture: directives/over-lines-kept] A directive
that is not closed takes the rest of the text, and is kept as written. [fixture:
directives/unclosed-at-end-of-text-kept] [fixture:
directives/unclosed-after-statement-kept]

Input
([directives/levels-around-sections-input.mmd](../tests/fixtures/timeline/directives/levels-around-sections-input.mmd)):

```mmd
timeline
%%{init: {}}%%
section S
%%{init: {}}%%
a : e
%%{init: {}}%%
section T
```

Output
([directives/levels-around-sections-output.mmd](../tests/fixtures/timeline/directives/levels-around-sections-output.mmd)):

```mmd
timeline
  %%{init: {}}%%
  section S
    %%{init: {}}%%
    a : e
  %%{init: {}}%%
  section T
```

Input
([directives/between-units-kept-input.mmd](../tests/fixtures/timeline/directives/between-units-kept-input.mmd)):

```mmd
timeline
a %%{init: {}}%%: e
b:%%{init: {}}%% e
c : e%%{init: {}}%%: f
```

Output
([directives/between-units-kept-output.mmd](../tests/fixtures/timeline/directives/between-units-kept-output.mmd)):

```mmd
timeline
  a %%{init: {}}%%: e
  b:%%{init: {}}%% e
  c : e%%{init: {}}%%: f
```

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter, and the `---` lines are kept as written, with the spaces and
tabs at the end of each. [fixture: frontmatter-yaml/formatted] [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept] The YAML is kept as written
when Prettier cannot read it. [fixture: frontmatter-yaml/malformed-kept] A
comment line between the frontmatter and the header is kept. [fixture:
frontmatter-yaml/comment-after-frontmatter-before-header] The `title` of the
frontmatter is not the title of the timeline in the Db, and nothing is added or
removed for it. [fixture: frontmatter-yaml/title-is-not-the-title]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/timeline/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:   {theme:  dark}
---
timeline
title T
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/timeline/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { theme: dark }
---
timeline
  title T
```

Input
([frontmatter-yaml/title-is-not-the-title-input.mmd](../tests/fixtures/timeline/frontmatter-yaml/title-is-not-the-title-input.mmd)):

```mmd
---
title: T
---
timeline
a : e
```

Output
([frontmatter-yaml/title-is-not-the-title-output.mmd](../tests/fixtures/timeline/frontmatter-yaml/title-is-not-the-title-output.mmd)):

```mmd
---
title: T
---
timeline
  a : e
```

### Line separators

U+2028 and U+2029 are whitespace between the units of a timeline and characters
of a text. Between statements they are a line break like any whitespace: the
statements go to lines of their own. A gap inside a statement that holds one is
printed as written, and so is a text: a period, an event, a title, a section
name, and an accessibility text keep them. The examples are written as strings,
in which `\u2028` is U+2028 and `\n` is a line break. [test: U+2028 between the
header and a statement] [test: U+2028 between the header and a period] [test:
U+2028 between a description block and a period] [test: U+2028 inside a period]
[test: U+2028 before the colon of an event] [test: U+2028 inside an event]
[test: U+2028 before the second colon of an event] [test: U+2028 after the colon
of an event] [test: U+2028 after a title keyword] [test: U+2029 inside a title]
[test: U+2028 at the end of a section name] [test: U+2028 after the colon of an
accessibility title] [test: U+2028 between the header and a direction]

### Whitespace characters

U+00A0, U+3000, and U+FEFF are whitespace to the lexer. Where a rule reads one
whitespace character, such as the separator after `title` or after the colon of
an event, a space is printed in its place; between statements and before a
statement they are dropped; in a text, and in the whitespace before the colon of
a period, they are characters of the text and stay. The examples are written as
strings, in which `\u00a0` is U+00A0, `\u3000` is U+3000, and `\ufeff` is
U+FEFF. [test: U+00A0 as the separator after a title keyword] [test: U+00A0 as
the separator after the colon of an event] [test: U+00A0 after the separator of
an event] [test: U+00A0 before the colon of a period] [test: U+00A0 at the end
of an event] [test: U+00A0 between the header and a direction] [test: U+00A0
after a description block] [test: U+3000 in the indentation before a period]
[test: U+3000 between two events] [test: U+FEFF between statements] [test:
U+00A0 inside a section name]
