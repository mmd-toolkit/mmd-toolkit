# title-digit-after-axis-statement

Japanese version:
[title-digit-after-axis-statement.ja.md](./title-digit-after-axis-statement.ja.md)

Diagram types: xychart. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

In an XY chart, the lexer reads a digit in the title of an axis as the start of
a number, so the title of an axis without quotes holds no digit, while the title
of the chart, written after `title`, may hold digits (see
[The axis context](../diagrams/xychart.md#the-axis-context)). An axis statement,
`x-axis` or `y-axis` with what follows it, is read in the axis context, which
ends at a line break, at `;`, and at the keyword of the next statement; a
description block is read on top of it, and the axis context goes on after the
block. A title statement after it reads its digits as characters of a word.

mermaid.js reads such a title in a state of its lexer in which a digit starts a
number, when the title follows an axis statement in the way that this rule
counts. The lexer keeps one **level** for each axis statement and each plot
statement that it reads, the latest on top. Each line feed takes away the top
level, a CRLF and a lone CR counting as one line feed and each line feed of an
empty line as one: after a unit, after `;`, after a comment, after the `}` of a
description block, and after the text of an accessibility statement. These line
feeds take away nothing:

- A line feed after whitespace on its line, also after a U+2028 or a U+2029: the
  rule for whitespace reads it with the whitespace, and with the line feeds and
  the whitespace after it up to the next unit. So a line of whitespace takes
  away nothing, while the line feed before it does.
- A line feed that a unit reads: inside a string or a description block, and
  around the `:` or `{` of `accTitle` and `accDescr`.
- A line feed right before a line that is `%%` alone from its start, which the
  comment of mermaid.js takes (see
  [comment-takes-character](./comment-takes-character.md)).
- A line feed that mermaid.js removes before its lexer reads the text: that of a
  comment line, with those of the empty lines and the lines of whitespace before
  it, and one inside a directive. A directive alone on its line leaves an empty
  line, whose line feed takes away a level.

Whitespace at the start of a line changes nothing, since the line feed before it
has been read, and a frontmatter lies before the header, where there is no
level. A title without quotes that holds a digit is rejected by mermaid.js when
the top level is that of an axis statement, and this specification accepts it,
as it accepts it anywhere else. On the line of an axis statement, that is so
when no plot statement stands between them; on a later line, it depends on the
levels left and on the line feeds read, as the forms below show. An
accessibility statement takes the rest of its line as its text, so no title
follows it on its line.

The digit may stand anywhere in the title without quotes, also after a sign or a
`.`: `Q1`, `T5`, `a-1`, and `.5` are rejected there. A title in quotes, a title
without a digit, and a statement other than a title are read the same by both.

## The difference

Each example is a whole diagram:

1. A title after `;`:

   ```mmd
   xychart
     x-axis A; title Q1
   ```

2. A title on the line after categories with nothing between:

   ```mmd
   xychart
     x-axis [a] title T5
   ```

3. A title on the line after an axis statement and a plot statement:

   ```mmd
   xychart
     x-axis A; line [1]
     title Q1
   ```

4. The line `x-axis A` ending with a space, and a line `title Q1`.

5. Two lines with a plot statement between them:

   ```mmd
   xychart
     x-axis A; line [1]
     line [2]
     title Q1
   ```

| Example | mermaid.js | This specification                            |
| ------- | ---------- | --------------------------------------------- |
| 1       | rejected   | the x axis `A` and the title `Q1`             |
| 2       | rejected   | the categories `a` and the title `T5`         |
| 3       | rejected   | the x axis `A`, a line, and the title `Q1`    |
| 4       | rejected   | the x axis `A` and the title `Q1`             |
| 5       | rejected   | the x axis `A`, two lines, and the title `Q1` |

[fixture: xychart/div-title-digit-after-axis-semicolon] [fixture:
xychart/div-title-digit-after-axis-band-same-line] [fixture:
xychart/div-title-digit-next-line-after-axis-and-plot] [fixture:
xychart/div-title-digit-after-axis-trailing-space] [fixture:
xychart/div-title-digit-two-lines-after-axis-and-plot]

The forms of the rule above, with the inputs that both read the same next to
them:

- On the line of the axis statement: after `;` and categories, after U+2028 or
  U+2029, after a description block, empty or not, also one of several lines,
  after a second axis statement, and with nothing between; while a plot
  statement between them, as in `x-axis A; line [1] title Q1`, and a title
  without a digit, as in `x-axis A; title a.b`, are accepted by both, and so is
  a title after a plot statement alone, as in `line [1]; title T1`. [fixture:
  xychart/div-title-digit-after-axis-semicolon] [fixture:
  xychart/div-title-digit-after-axis-band-same-line] [fixture:
  xychart/div-title-digit-after-axis-band-semicolon] [fixture:
  xychart/div-title-digit-after-axis-line-separator] [fixture:
  xychart/div-title-digit-after-axis-paragraph-separator] [fixture:
  xychart/div-title-digit-after-axis-and-empty-block] [fixture:
  xychart/div-title-digit-after-axis-and-description-block] [fixture:
  xychart/div-title-digit-after-multiline-description-block] [fixture:
  xychart/div-title-digit-after-two-axes-same-line] [fixture:
  xychart/db-title-digit-after-axis-and-plot-same-line] [fixture:
  xychart/db-title-dotted-word-after-axis-semicolon] [fixture:
  xychart/db-title-digit-after-plot-semicolon]
- After a line that ends with whitespace: a space, a tab, a U+00A0, a U+2028, a
  U+2029, a space and a directive, or a description block and a space at the end
  of the line of `x-axis A`, of categories, of a range, or of a title in quotes,
  also with an empty line or a comment line after it, and a line of whitespace
  after a line with two levels; while a line feed right after the axis
  statement, after a directive glued to it, or after a description block, a
  comment after a space, and a line of whitespace after the line feed, also
  after an empty line for two levels, are read the same by both, and so is a
  line `%%` alone after the whitespace, whose line feed takes away the level.
  [fixture: xychart/div-title-digit-after-axis-trailing-space] [fixture:
  xychart/div-title-digit-after-axis-trailing-tab] [fixture:
  xychart/div-title-digit-after-axis-trailing-nbsp] [fixture:
  xychart/div-title-digit-after-axis-trailing-line-separator] [fixture:
  xychart/div-title-digit-after-axis-trailing-paragraph-separator] [fixture:
  xychart/div-title-digit-after-whitespace-line-after-axis-and-plot] [fixture:
  xychart/db-title-digit-after-empty-and-whitespace-lines-after-axis-and-plot]
  [fixture: xychart/div-title-digit-after-axis-space-and-directive] [fixture:
  xychart/div-title-digit-after-description-block-trailing-space] [fixture:
  xychart/div-title-digit-after-band-trailing-space] [fixture:
  xychart/div-title-digit-after-range-trailing-space] [fixture:
  xychart/div-title-digit-after-quoted-axis-title-trailing-space] [fixture:
  xychart/div-title-digit-after-axis-trailing-space-and-empty-line] [fixture:
  xychart/div-title-digit-after-axis-trailing-space-and-comment-line] [fixture:
  xychart/db-title-digit-line-after-axis] [fixture:
  xychart/db-title-digit-after-axis-glued-directive] [fixture:
  xychart/db-title-digit-next-line-after-axis-and-description-block] [fixture:
  xychart/db-title-digit-next-line-after-multiline-description-block] [fixture:
  xychart/db-title-digit-after-axis-comment-after-space] [fixture:
  xychart/db-title-digit-after-axis-whitespace-line] [fixture:
  xychart/db-title-digit-after-trailing-space-and-bare-percent-line] [fixture:
  xychart/db-title-quoted-digit-after-axis-trailing-space]
- After levels put on after the axis statement on its line: a plot statement, a
  bar statement, another x axis, or a y axis after it, after categories or a
  range, after a CRLF or a lone CR, after `;` at the end of the line, after the
  text of an accessibility title, with a comment after a space at the end of the
  line, and with the title indented; with three levels, a title line or an empty
  line takes away one level only; while a plot statement before the axis
  statement on its line, an axis statement after the last plot statement, an
  accessibility title after it, a lone CR, an indented title, and a frontmatter
  for one level, an empty line before the title for two levels, and two empty
  lines for three are read the same by both. [fixture:
  xychart/div-title-digit-next-line-after-axis-and-plot] [fixture:
  xychart/div-title-digit-next-line-after-two-axes] [fixture:
  xychart/div-title-digit-next-line-after-axis-and-y-axis] [fixture:
  xychart/div-title-digit-next-line-after-band-and-plot] [fixture:
  xychart/div-title-digit-next-line-after-y-axis-and-bar] [fixture:
  xychart/div-title-digit-after-crlf-after-axis-and-plot] [fixture:
  xychart/div-title-digit-after-lone-cr-after-axis-and-plot] [fixture:
  xychart/div-title-digit-after-semicolon-at-line-end-after-axis-and-plot]
  [fixture: xychart/div-title-digit-after-acc-title-text-after-two-axes]
  [fixture:
  xychart/div-title-digit-after-comment-after-space-after-axis-and-plot]
  [fixture: xychart/div-title-digit-indented-next-line-after-axis-and-plot]
  [fixture: xychart/db-title-digit-after-lone-cr-after-axis] [fixture:
  xychart/db-title-digit-indented-next-line-after-axis] [fixture:
  xychart/db-title-digit-frontmatter-then-axis-line] [fixture:
  xychart/div-title-digit-after-three-levels-and-title-line] [fixture:
  xychart/div-title-digit-after-three-levels-and-empty-line] [fixture:
  xychart/db-title-digit-next-line-after-plot-and-axis] [fixture:
  xychart/db-title-digit-next-line-after-axis-plot-axis] [fixture:
  xychart/db-title-digit-next-line-after-axis-and-acc-title] [fixture:
  xychart/db-title-digit-after-empty-line-after-axis-and-plot] [fixture:
  xychart/db-title-digit-after-three-levels-and-two-empty-lines] [fixture:
  xychart/db-title-quoted-digit-next-line-after-axis-and-plot] [fixture:
  xychart/db-title-digit-after-axis-plot-lines]
- Across line feeds that take away nothing: a comment line, also with an empty
  line before it, a line `%%` alone after a line with two levels, a line feed
  after `accTitle:` or `accDescr:` or around their `:` or `{`, a line feed in a
  string, and a line feed inside a directive; while a line `%%` alone and an
  empty line after it, a line of spaces and `%%`, whose line feed before it is
  read where a unit starts, and a directive alone on its line, which leaves an
  empty line, are read the same by both. [fixture:
  xychart/div-title-digit-after-comment-line-after-axis-and-plot] [fixture:
  xychart/div-title-digit-after-empty-line-and-comment-line] [fixture:
  xychart/div-title-digit-after-bare-percent-line-after-axis-and-plot] [fixture:
  xychart/db-title-digit-after-bare-percent-line-and-empty-line] [fixture:
  xychart/div-title-digit-after-acc-title-line-feed-after-colon] [fixture:
  xychart/div-title-digit-after-acc-title-line-feed-before-colon] [fixture:
  xychart/div-title-digit-after-acc-descr-line-feed-after-colon] [fixture:
  xychart/div-title-digit-after-acc-descr-line-feed-before-brace] [fixture:
  xychart/div-title-digit-after-line-feed-in-string] [fixture:
  xychart/div-title-digit-after-directive-with-line-feed-after-axis-and-plot]
  [fixture: xychart/db-title-digit-after-directive-with-line-feed-after-axis]
  [fixture: xychart/db-title-digit-after-directive-line-after-axis-and-plot]
  [fixture: xychart/db-title-digit-after-directive-line-after-axis] [fixture:
  xychart/db-title-digit-after-indented-bare-percent-line]
- On later lines: after a line with a plot statement, after a line with a title
  without a digit before the title on the same line, after a line that ends with
  a space, and after the plot line of a line that ends with a space; while a
  line that ends with a unit, such as `title T`, takes away the level of the
  axis statement when it is on top, and a plot statement that ends with a space
  on the line of the axis statement keeps the title on the next line under the
  level of the plot. [fixture:
  xychart/div-title-digit-two-lines-after-axis-and-plot] [fixture:
  xychart/div-title-digit-after-plot-line-after-axis-and-plot] [fixture:
  xychart/div-title-digit-second-statement-next-line-after-axis-and-plot]
  [fixture: xychart/div-title-digit-after-axis-trailing-space-and-plot-line]
  [fixture: xychart/div-title-digit-two-lines-after-axis-plot-trailing-space]
  [fixture: xychart/db-title-digit-after-line-without-plot] [fixture:
  xychart/db-title-digit-two-lines-after-axis-trailing-space] [fixture:
  xychart/db-title-digit-after-axis-plot-trailing-space] [fixture:
  xychart/db-title-digit-after-plot-trailing-space]

## What it means for an author

To write an XY chart that both read the same, put a title with digits in quotes,
or write each axis statement on a line of its own with nothing after it and no
whitespace at the end of its line.

## Why mermaid.js reads it so

The lexer of
[`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L17-L73)
enters the state `axis_data` at `x-axis` and `y-axis`, and the state `data` at
`line` and `bar`, each on top of the state it is in. It leaves the state on top
at a line feed that the rule `(\r?\n)` of that state reads, and at no other
character: not at `;`, and not where another statement starts. A run of
whitespace that starts with another character is read by the rule `\s+`, which
reads the line feeds after it as well, so a line feed after whitespace leaves no
state; the rule for a comment, `[^\}]%%[^\n]*`, comes before the rule for a line
feed and reads a line feed right before `%%` with the comment; and a comment
line is removed, with its line feed and with the empty lines before it, before
the lexer reads the text
([`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)).
In `axis_data`, the rule for a number, `[+-]?(?:\d+(?:\.\d+)?|\.\d+)`, comes
before the rules for words, so a title read in that state stops at its first
digit, and the grammar rejects the number that follows it. The state `data`
reads digits as words, so a title read in it is accepted.

## The rule of this specification, and why

Which state the lexer of mermaid.js is in after a statement depends on how many
states it has entered on a line and on which line feeds it reads with the rule
of a state, that is, on the order of the steps of its lexer, which is nothing a
specification would state: the second of the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)). One rule is stated instead,
that the axis context ends with its statement, and the inputs that mermaid.js
rejects for this reason are the divergence. An accepted input has the Db of the
same input with each statement on a line of its own and without the whitespace
at the end of each line that ends a statement, which mermaid.js accepts.
[fixture: xychart/db-title-digit-line-after-axis] [fixture:
xychart/db-title-digit-after-axis-plot-lines]

## The documentation of mermaid.js and its issues

- The
  [XY chart syntax](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/xyChart.md)
  writes each statement on a line of its own and says nothing of `;` or of
  digits in the title of the chart.
- No issue or pull request about it was found (searched on 2026-10-15 for
  `xychart semicolon`, `xychart title digits`, `xychart axis numbers`,
  `xychart parse error`, `xychart lexical`, `XY chart parse error`, and
  `XY chart semicolon`).
