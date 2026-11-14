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
indentation/header-leading-whitespace] The later text lines of an `accDescr`
block stand one level inside its statement, and the `}` that closes it stands at
the statement level (see [Multi-line values](#multi-line-values)). [fixture:
indentation/description-block-under-a-section] Later event colons align under
the period's colon where it directly follows the period on its line (see
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
stays on its line, and so does the text after it (see
[Header and direction](#header-and-direction)). [fixture:
statements-one-per-line/header-then-title] [fixture:
statements-one-per-line/header-then-period] [fixture:
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
timeline TD title T
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
  accDescr: d
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
their texts and their colons, except for the whitespace at the end of the last
event of a line and for a space that is added before a colon: mermaid.js keeps
both in the Db, but draws the same text without them (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
The Db keeps the whitespace at the end of a period, which is the whitespace
before its colon, and the whitespace at both ends of an event beyond the one
character after its colon: `2004 : a` and `2004: a` are different periods,
`a :   e` has the event `  e`, and `a : e   ` the event `e   `. So the padding
that aligns the colons of a timeline stays; `a : e   ` at the end of a line is
printed `a : e`, and `c : g   : h` stays as written. A colon that follows a text
without whitespace at its end gets one space before it, as the examples in the
documentation of mermaid.js write every colon after a text (88 of them have a
space before them, and none touches the text; counted as under
[the examples that decide the whitespace before a colon](./compatibility.md#the-examples-that-decide-the-whitespace-before-a-colon)):
`2004: Facebook: Google` is printed `2004 : Facebook : Google`. A colon that no
whitespace follows is a character of the text and stays where it is. After a
period that is the word `title` or `section`, in any case, the colon keeps
touching it, since the lexer reads `title` and whitespace as the keyword of a
title: `title: x` is a period with the event `x`, and `title : x` is a title
with the text `: x`. A directive between the text and the colon keeps the gap as
written (see [Directives](#directives)). An event that a line break separates
from the next colon ends its line too: in `2020 : e1  ` followed by a line
`: e2`, the whitespace after `e1` is left out. The directives that end such an
event are printed with one space before each that has whitespace before it, and
the whitespace after the last one is left out: `2020 : e1   %%{x}%%  ` is
printed `2020 : e1 %%{x}%%` (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
[fixture: periods-and-events/event-trailing-directive-blanks-dropped] [fixture:
periods-and-events/event-two-directives-trailing-blanks-dropped] [fixture:
periods-and-events/space-before-colon-added] [fixture:
periods-and-events/space-before-colon-keyword-period] [fixture:
periods-and-events/period-whitespace-kept] [fixture:
periods-and-events/event-padding-kept-end-dropped] [fixture:
periods-and-events/whitespace-only-event] [fixture:
periods-and-events/period-trailing-kept-event-end-dropped] [fixture:
periods-and-events/event-end-before-continuation-dropped] A colon, a `#`, and a
`%%` in an event are characters of its text, and so are the colons that no
whitespace follows. [fixture: periods-and-events/colon-inside-event] [fixture:
periods-and-events/special-characters-in-events] A `;` is a character of a text
too (see [Statements one per line](#statements-one-per-line)). [fixture:
periods-and-events/semicolons-in-texts-kept] [fixture:
periods-and-events/semicolon-in-a-later-line]

The text of an event stands after one space after its colon. That character is
the separator that the lexer reads after the colon, whatever it is, and it is
not in the Db; the whitespace after it is the text. A space is written whatever
the separator was, as after `title` and `section` (see
[Titles and sections](#titles-and-sections)), so that the separator has one
form. [fixture: periods-and-events/separator-tab]

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

When the first colon immediately follows the period on its line, align later
event colons under it. This puts the colons of one period in one column,
including inside a section. Keep tabs as tab stops in the alignment padding and
use Prettier's display width for the remaining text, including wide characters.
Count the period's written text, including a directive inside it, since that is
what the printer displays. The configured indentation still applies at
`tabWidth: 0`. [fixture: periods-and-events/events-on-later-lines] [corpus
fixture: timeline/docs-syntax-timeline-1b6ef8c6] [fixture:
periods-and-events/later-lines-in-a-section] [fixture:
periods-and-events/colon-alignment-tabs] [fixture:
periods-and-events/colon-alignment-wide-period] [fixture:
periods-and-events/colon-alignment-zero-width] [fixture:
periods-and-events/colon-alignment-written-period]

When the first colon is on a later line, or a directive separates it from the
period, retain the ordinary continuation indentation of one level. Periods whose
written text contains a line break, U+2028 or U+2029 also keep that indentation,
since those characters can affect how a line is displayed. [fixture:
periods-and-events/event-on-the-line-after-the-period] [fixture:
periods-and-events/colon-alignment-directive-boundary] [fixture:
periods-and-events/colon-alignment-written-period] [test: U+2028 inside a period
before a later event] [test: U+2029 inside a period before a later event]

Comment lines and directive lines between event lines align with the next event
colon. When the colons use ordinary continuation indentation, these lines use
that indentation too. A run of empty lines inside the statement becomes one.
[fixture: periods-and-events/comment-lines-inside] [fixture:
periods-and-events/empty-lines-inside] [fixture:
periods-and-events/directive-line-inside] [fixture:
periods-and-events/continuation-trivia] A comment after a period stays on its
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
  2004 : Facebook
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

As for a period, each event stays on the line on which it was written. Later
event lines use the statement's indentation, so peer events do not look nested.
Comment lines and directive lines between those events use the same indentation.
This also applies within a section. [fixture: event-statements/several-events]
[fixture: event-statements/events-of-an-event-statement-on-the-line] [fixture:
event-statements/several-events-in-a-section] [fixture:
event-statements/peer-trivia]

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

A `title` is printed with one space after the keyword, as in a user journey, and
the value without the whitespace at its start or at its end, which the Db keeps
and which is drawn without (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)).
`title   History  ` is printed `title History`, and a run of spaces and tabs
inside it is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
The name of a `section` is printed as written, the whitespace at its start and
at its end included: two sections whose names differ by it are drawn apart, and
would not be once it is left out. A title of spaces and tabs only stays as
written. [fixture: titles-and-sections/title-padding-dropped] [fixture:
titles-and-sections/title-blank-kept] [fixture:
titles-and-sections/section-padding-kept] [fixture:
titles-and-sections/title-trailing-dropped-section-kept] [fixture:
titles-and-sections/one-space-after-keyword] A value written on a later line is
printed after the keyword on one line; a comment line between them makes the
statement printed as written (see
[Multi-line statements](#multi-line-statements)). [fixture:
titles-and-sections/value-on-next-line] [fixture:
titles-and-sections/comment-line-inside-kept] A title whose value starts with a
`#` after more than one whitespace character stays as written: `title` and two
spaces, or a tab and a space, or a line break and an indentation, and then
`# c`. Some versions that count read `title`, that whitespace, and `# c` as a
title of whitespace only and a comment, and `title # c` with one whitespace
character as the period `title` and a comment, while the others read both as the
title `# c` (drawn the same; see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
A `#` at the start of its line is no such text to them, and both forms are the
period `title`, so the value is joined to the keyword; and one whitespace
character before the `#`, a space or a tab, is printed as one space. [fixture:
titles-and-sections/title-hash-on-next-line-kept] [fixture:
titles-and-sections/title-hash-after-padding-kept] [fixture:
titles-and-sections/title-hash-after-tab-and-space-kept] [fixture:
titles-and-sections/title-hash-after-tab-joined] [fixture:
titles-and-sections/title-hash-at-line-start-joined] The value holds `:`, `#`,
`%`, and `%%` as characters, except that the name of a section ends at a `:`,
which starts an event. [fixture:
titles-and-sections/special-characters-in-values] [fixture:
titles-and-sections/section-ends-at-colon] A directive between the keyword and
the value stays where it is (see [Directives](#directives)). [fixture:
titles-and-sections/directive-between-keyword-and-value]

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

The keywords `section` and `title` are printed in lower case, as the examples in
the documentation of mermaid.js write them (see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)).
mermaid.js reads them in any case and the Db is the same; the accessibility
keywords keep the case in which they are written. The header `timeline` is
detected in lower case only. [fixture: keyword-case/keywords-one-form]

Input
([keyword-case/keywords-one-form-input.mmd](../tests/fixtures/timeline/keyword-case/keywords-one-form-input.mmd)):

```mmd
timeline
TITLE T
Section S
ACCTITLE: T
AccDescr: d
ACCDESCR { d }
```

Output
([keyword-case/keywords-one-form-output.mmd](../tests/fixtures/timeline/keyword-case/keywords-one-form-output.mmd)):

```mmd
timeline
  title T
  section S
    ACCTITLE: T
    AccDescr: d
    ACCDESCR: d
```

### Header and direction

The header may carry a direction, `LR` or `TD` in any case, after whitespace on
its line. It is printed on the line of the header after one space, in the case
in which it was written; the Db reads it in upper case. The space is the one of
the whitespace between tokens (see
[Whitespace between tokens](#whitespace-between-tokens)). [fixture:
header-and-direction/direction-kept] [fixture:
header-and-direction/direction-case-kept] [fixture:
header-and-direction/spaces-before-the-direction]

Some of the versions that count (see
[Versions of mermaid.js that count](./compatibility.md#versions-of-mermaidjs-that-count)
and
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count))
read no direction: they read the words after `timeline` as the text of a period,
and the others read the direction. So `timeline td` and `timeline TD` are
periods that differ by their case there, and `td` is not printed `TD`, though
the examples in the documentation of mermaid.js write `TD`. The text that
follows a direction stays on the line of the header, after its gap as written:
`timeline TD title T` is one period in those versions, and `timeline TD`
followed by a line `title T` is a period and a title, and likewise
`timeline TD LR` (a direction and the period `LR`) and `timeline LR 2004 : a`. A
text after the header without a direction goes to a line of its own
(`timeline History` is printed with `History` below the header), which every
version that counts for timeline draws the same. A period that stays on the line
of the header has its later events at the ordinary continuation indentation,
since its colon is not at the column of a period on a line of its own. A
direction on a line of its own is a period. The line breaks that count are the
ones that mermaid.js reads, so a directive that spans lines is no break:
`timeline TD%%{init:`, a line break, and `{}}%% title T` is
`timeline TD title T`, and the text stays. [fixture:
header-and-direction/second-word-stays-on-the-header-line] [fixture:
header-and-direction/direction-then-period-stays] [fixture:
header-and-direction/text-after-a-directive-over-lines-stays] [fixture:
header-and-direction/text-after-the-header-without-direction-moves] [fixture:
header-and-direction/direction-on-its-own-line-is-a-period]

A comment after the direction stays on the line (see [Comments](#comments)), and
a directive before it or after it is placed as everywhere else (see
[Directives](#directives)). The whitespace at the end of the line is dropped.
[fixture: header-and-direction/comment-after-the-direction] [fixture:
header-and-direction/directive-before-the-direction] [fixture:
header-and-direction/directive-after-the-direction] [fixture:
header-and-direction/trailing-whitespace-dropped]

Input
([header-and-direction/second-word-stays-on-the-header-line-input.mmd](../tests/fixtures/timeline/header-and-direction/second-word-stays-on-the-header-line-input.mmd)):

```mmd
timeline TD LR
title T
```

Output
([header-and-direction/second-word-stays-on-the-header-line-output.mmd](../tests/fixtures/timeline/header-and-direction/second-word-stays-on-the-header-line-output.mmd)):

```mmd
timeline TD LR
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
timeline %%{init: {}}%%TD
  title T
```

### Accessibility statements

The `:` of `accTitle` and `accDescr` touches the keyword and has one space after
it, as in a user journey; the text has no whitespace at its ends, which the Db
does not keep, and a run of spaces and tabs inside the text of an `accDescr` is
printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
while that of an `accTitle` stays as written, since the browser shows it as a
tooltip. [fixture: accessibility-statements/colon-touches-keyword] [fixture:
accessibility-statements/text-whitespace-dropped] [fixture:
accessibility-statements/title-and-accessibility-runs-collapsed] The text and
the colon may stand on later lines, and are printed on the line of the keyword.
[fixture: accessibility-statements/text-on-next-line-joined] [fixture:
accessibility-statements/keyword-and-colon-over-lines-joined] The text holds
`:`, `;`, `#`, `%`, and `%%` as characters. [fixture:
accessibility-statements/special-characters-in-text]

A block on one line follows
[A description block on one line](./compatibility.md#a-description-block-on-one-line).
[fixture: accessibility-statements/block-text-on-opening-line] [fixture:
accessibility-statements/block-inner-runs-collapsed]

In a block with a text over several lines, later text lines stand one level
inside the statement and a separate `}` stands at its level (see
[Multi-line values](#multi-line-values)). [fixture:
accessibility-statements/block-lines-kept] [fixture:
accessibility-statements/block-comment-and-empty-lines-kept] A directive around
the colon or the braces stays where it is, and a block on one line with a
directive beside its braces is written with the colon first (see
[A description block on one line](./compatibility.md#a-description-block-on-one-line)).
[fixture: accessibility-statements/directive-around-colon-and-braces]

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
surround. An already empty interior stays empty. The ordinary keyword/opener gap
uses one space: `accDescr{  }` becomes `accDescr {}`. [fixture:
empty-description-blocks/empty-whitespace-interiors] [test: timeline Unicode and
tab interiors] [fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/blank-lines-inside] A block with a directive or a
comment line keeps that content, with later text lines indented as described in
[Multi-line values](#multi-line-values). [fixture:
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
  accDescr {}
  accDescr {}
  accDescr {}
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

In `accTitle` and `accDescr:` statements, keep trivia line breaks and align
later structural parts and standalone trivia one continuation level inside the
statement, also under a section. Preserve each first gap-line tail and complete
directive interiors. Joining comment regions keep their original layout;
semicolon protection follows the joining decision below. [fixture:
multi-line-statements/accessibility-trivia-continuations]

Titles and sections, and event-text continuations, keep their original multiline
trivia layout, because their value padding belongs to the Db. [fixture:
multi-line-statements/breaks-decided-one-by-one] [fixture:
multi-line-statements/line-rule-first-hash-after-colon-kept] [fixture:
multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] After the colon of an event, an
indented line of only a directive is the whitespace that starts the event, so
the event is printed on the line of the colon, with that whitespace, and the
directive after it. [fixture:
multi-line-statements/directive-line-after-the-colon-is-the-text] In an
accessibility statement, a line break stays where joining it, with one space or
with nothing, could change which `;` the line rule ignores, and where a `;` ends
the last line; any other line break is joined as usual, also in a statement that
holds a `;`. A title, a section, a period and an event are kept as written when
a line break of them stays: the Db keeps the whitespace at their start. See
[Statements one per line](#statements-one-per-line). [fixture:
multi-line-statements/semicolon-joining-changes-kept] A `;` alone does not
prevent joining. [fixture:
multi-line-statements/text-on-next-line-with-semicolon-joined]

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

Indent later text lines of an `accDescr` block one level inside the statement,
replacing only ASCII spaces and tabs immediately after a line feed. The Db
setter drops that indentation, so this keeps text inside its block, including
under a section. [fixture: multi-line-values/description-block-lines-kept]
[fixture: indentation/description-block-under-a-section] The configured
indentation applies to these lines too. [fixture:
multi-line-values/description-four-spaces] [fixture:
multi-line-values/description-tabs] [fixture:
multi-line-values/description-zero-width]

Keep the text, its line breaks and its trailing spaces and tabs. Text on the
opening line stays there, and empty lines inside the text stay empty. [fixture:
multi-line-values/description-line-ending-whitespace] A hash comment inside the
block is text and receives the same indentation; a `%%` comment line also aligns
with the text. [fixture: multi-line-values/comment-line-inside-block-kept]
[fixture: multi-line-values/description-percent-comment-line] A directive keeps
its complete contents, including its interior indentation. [fixture:
multi-line-values/description-directive-lines] A block holding only comments or
directives uses the same indentation, with its closer at statement level.
[fixture: multi-line-values/description-comment-only-lines] [fixture:
multi-line-values/description-directive-only-lines] U+2028 and U+2029 within a
text line remain as written. [test: U+2028 inside a description line] [test:
U+2029 inside a description line]

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
statement becomes one space, and tokens that touch keep touching. A description
block on one line follows
[A description block on one line](./compatibility.md#a-description-block-on-one-line).
[fixture: whitespace-between-tokens/description-block-braces] The whitespace at
the end of the header's line is dropped. [fixture:
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
  accDescr: d
  accDescr: e
  accDescr: f
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
as in a user journey, and a directive within a printed line is placed as in a
flowchart: the gap is printed as without the directive, and the directive stands
after its space and touches the unit that follows it. [fixture: directives/kept]
[fixture: directives/levels-around-sections] [fixture: directives/before-header]
[fixture: directives/after-header-on-same-line] [fixture:
directives/after-header-touching-kept] [fixture:
directives/whitespace-on-both-sides-collapsed] [fixture:
directives/statement-after-directive-line]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.

[fixture: timeline/directives/whitespace-on-both-sides-collapsed]

A directive between two units stays in its authored gap, placed as under
[Directives](#directives). Structural continuation columns follow
[Multi-line statements](#multi-line-statements). A directive inside a value is
part of that text. [fixture: directives/between-units] [fixture:
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
([directives/between-units-input.mmd](../tests/fixtures/timeline/directives/between-units-input.mmd)):

```mmd
timeline
a %%{init: {}}%%: e
b:%%{init: {}}%% e
c : e%%{init: {}}%%: f
```

Output
([directives/between-units-output.mmd](../tests/fixtures/timeline/directives/between-units-output.mmd)):

```mmd
timeline
  a %%{init: {}}%%: e
  b : %%{init: {}}%%e
  c : e %%{init: {}}%%: f
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
accessibility title] [test: U+2028 between the header and a direction] At the
end of a title and at the end of the last event of a line, U+2028 and U+2029 are
characters of the text and no spaces or tabs: the spaces after one are left out
with the other whitespace at the end of the text, and the spaces before it stay.
[test: U+2029 and spaces at the end of a timeline title] [test: U+2028 and
spaces at the end of the last event of a line]

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
