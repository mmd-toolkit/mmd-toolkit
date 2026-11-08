# XY chart formatting rules

Japanese version: [xychart.ja.md](./xychart.ja.md)

How prettier-plugin-mmd formats an XY chart. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. An XY chart is a header followed by
statements, which need no separator and may share a line. Most of the whitespace
in it is not in the Db, so most rules choose a form; but whether two units of a
text without quotes touch is in the reading, and the rules say where.

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The statements after the header, and the comment lines among them, stand one
level deeper than the header. A level is what Prettier's `useTabs` and
`tabWidth` options say: two spaces by default. The indentation written in the
input is not kept: whitespace at the start of a line is nothing to mermaid.js,
so the printer chooses it from the structure alone, and every text has one form.
Nothing in the grammar forbids indenting a statement (unlike a sankey diagram),
and the documentation of mermaid.js writes the statements one level deeper than
the header, as the other diagrams do (see
[Indentation](./flowchart.md#indentation) in the flowchart rules). The header,
and a comment line before it, stand at the first column. [fixture:
indentation/statements-one-level-deeper] [fixture:
indentation/written-indentation-dropped] [fixture:
indentation/header-leading-whitespace] [fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs] [fixture:
indentation/comment-lines-at-the-level-of-the-next-statement] [fixture:
indentation/comment-before-the-header-at-the-first-column] [fixture:
indentation/description-block-lines-kept]

Input
([indentation/statements-one-level-deeper-input.mmd](../tests/fixtures/xychart/indentation/statements-one-level-deeper-input.mmd)):

```mmd
xychart
title T
   x-axis [a]
 line [1]
```

Output
([indentation/statements-one-level-deeper-output.mmd](../tests/fixtures/xychart/indentation/statements-one-level-deeper-output.mmd)):

```mmd
xychart
  title T
  x-axis [a]
  line [1]
```

### Statements one per line

Each statement stands on a line of its own. Nothing separates statements in an
XY chart (diagrams/xychart.md, Diagram and statements), so `title T line [1]`,
`x-axis [a] line [1]`, `line [1]bar [2]`, and a statement after the header on
its line are several statements on one line. They go to lines of their own,
because a line of two statements is harder to read, as in the other diagrams
(see [Statements one per line](./flowchart.md#statements-one-per-line)). The
orientation of the header stays on the header's line (see
[Header and orientation](#header-and-orientation)). A directive between two
statements on a line moves with the statement after it. A `;` ends a statement
as a line feed does and separates nothing once the statements are on lines of
their own, so it is dropped, also where it stands first, twice in a row, or
last. [fixture: statements-one-per-line/header-then-title] [fixture:
statements-one-per-line/header-orientation-then-title] [fixture:
statements-one-per-line/title-then-plot] [fixture:
statements-one-per-line/axis-then-plot] [fixture:
statements-one-per-line/statements-touching] [fixture:
statements-one-per-line/plot-then-accessibility] [fixture:
statements-one-per-line/description-block-then-statement] [fixture:
statements-one-per-line/empty-description-block-then-statement] [fixture:
statements-one-per-line/axis-statements-after-a-title] [fixture:
statements-one-per-line/semicolon-between-statements-dropped] [fixture:
statements-one-per-line/semicolons-at-the-start-twice-and-at-the-end-dropped]
[fixture: statements-one-per-line/semicolon-after-the-header-dropped] [fixture:
statements-one-per-line/semicolon-line-alone-dropped] [fixture:
directives/directive-after-the-header-then-statement] [fixture:
statements-one-per-line/directive-between-two-statements-moves-with-the-next]

A statement is not moved when a `;` of its line is read by the line rule of
mermaid.js: it removes the last `;` of a line that holds `style` or `classDef`,
a later `:`, a `#` after that with no whitespace between them, and a later `;`.
A string or an accessibility text can hold such a line, and moving a statement
away from it, or dropping a `;` from it, changes which `;` is the last, and with
it the text (`title "style:#c;d" line [1];` has another title once its
statements are on lines of their own and the `;` is dropped). The statements of
such a line stay on it, with the whitespace between them formatted as anywhere
else, except the whitespace between a `:` and a later `#`, which keeps whether
it is there (see [Semicolons](./flowchart.md#semicolons)), and the `;` stays as
written (see [A line that a `;` ends](./compatibility.md#a-line-that-a--ends)).
When such a line is the line of the header, the statements stay on the header's
line. A `;` that the rule ignores at the end of the line is dropped, and the
line that is printed has no `;` for the rule to read, so its whitespace is
formatted as anywhere else. [fixture:
statements-one-per-line/line-rule-line-with-a-dropped-semicolon-formats-the-gap]
[fixture: statements-one-per-line/line-rule-line-kept-together] [fixture:
statements-one-per-line/line-rule-line-after-the-header-kept-together] [fixture:
statements-one-per-line/line-rule-line-gap-between-colon-and-hash-touching-kept]
[fixture:
statements-one-per-line/line-rule-line-gap-between-colon-and-hash-becomes-one-space]

mermaid.js rejects a title without quotes that holds a digit when it follows an
axis statement on the line of the statement, after a `;`, or on a line after one
of these (the known divergence `title-digit-after-axis-statement`), while the
specification accepts it and mermaid.js accepts the same title on a line of its
own. Splitting `x-axis A; title Q1` therefore turns an input that mermaid.js
rejects into one that it accepts, with the Db of the specification. The rule is
the same for these lines: it keeps the Db of every input that mermaid.js
accepts, and no input that it accepts is read differently once its statements
are split. [fixture: statements-one-per-line/axis-then-title-with-a-digit-split]
[fixture: statements-one-per-line/axis-band-then-title-with-a-digit-split]
[fixture: statements-one-per-line/range-then-title-with-a-digit-split]

Input
([statements-one-per-line/header-orientation-then-title-input.mmd](../tests/fixtures/xychart/statements-one-per-line/header-orientation-then-title-input.mmd)):

```mmd
xychart horizontal title T
line [1]
```

Output
([statements-one-per-line/header-orientation-then-title-output.mmd](../tests/fixtures/xychart/statements-one-per-line/header-orientation-then-title-output.mmd)):

```mmd
xychart horizontal
  title T
  line [1]
```

Input
([statements-one-per-line/statements-touching-input.mmd](../tests/fixtures/xychart/statements-one-per-line/statements-touching-input.mmd)):

```mmd
xychart
line [1]bar [2]
title "T"line [3]
```

Output
([statements-one-per-line/statements-touching-output.mmd](../tests/fixtures/xychart/statements-one-per-line/statements-touching-output.mmd)):

```mmd
xychart
  line [1]
  bar [2]
  title "T"
  line [3]
```

Input
([statements-one-per-line/line-rule-line-kept-together-input.mmd](../tests/fixtures/xychart/statements-one-per-line/line-rule-line-kept-together-input.mmd)):

```mmd
xychart
title "style:#c;d" line [1];
```

Output
([statements-one-per-line/line-rule-line-kept-together-output.mmd](../tests/fixtures/xychart/statements-one-per-line/line-rule-line-kept-together-output.mmd)):

```mmd
xychart
  title "style:#c;d" line [1];
```

### Blank lines

A run of empty lines becomes one empty line, and there is none between the
header and the first statement, and none at the end of the text. A blank line is
a choice of the author that the Db does not hold, and one empty line shows it at
the least cost, as Prettier does in code (see
[Blank lines](./flowchart.md#blank-lines)). [fixture:
blank-lines/runs-become-one] [fixture: blank-lines/none-after-the-header]
[fixture: blank-lines/none-at-the-end] [fixture:
blank-lines/one-kept-between-statements] [fixture:
blank-lines/around-comment-lines] [fixture: blank-lines/whitespace-only-lines]
[fixture: blank-lines/after-a-description-block]

Input
([blank-lines/runs-become-one-input.mmd](../tests/fixtures/xychart/blank-lines/runs-become-one-input.mmd)):

```mmd
xychart
title A



line [1]
```

Output
([blank-lines/runs-become-one-output.mmd](../tests/fixtures/xychart/blank-lines/runs-become-one-output.mmd)):

```mmd
xychart
  title A

  line [1]
```

### Header and orientation

The header is printed as written: `xychart` or `xychart-beta`, in the case
written. mermaid.js 12.3.0 reads them as the same diagram type, but mermaid.js
11.9.0 detects `xychart-beta` only, so the spelling is the author's, not the
printer's (see
[The names of a header](./compatibility.md#the-names-of-a-header)). A header
after the first stands on a line of its own, and none is dropped: a later header
with an orientation changes the orientation, and one without changes nothing,
but the text is the author's. A header with a comment or directive in its gap
keeps that line break and aligns its continuation one level inside the header
(see [Multi-line statements](#multi-line-statements)). [fixture:
header-and-orientation/plain-header] [fixture:
header-and-orientation/beta-header-kept] [fixture:
header-and-orientation/header-only] [fixture:
header-and-orientation/vertical-kept] [fixture:
header-and-orientation/second-header-on-its-own-line] [fixture:
header-and-orientation/second-header-without-orientation-kept] [fixture:
header-and-orientation/second-header-on-the-line-of-the-first] [fixture:
header-and-orientation/second-header-spelling-and-case-kept] [fixture:
header-and-orientation/trailing-whitespace-dropped] [fixture:
header-and-orientation/comment-after-the-header] [fixture:
header-and-orientation/comment-glued-to-the-header] [fixture:
header-and-orientation/directive-after-the-header] [fixture:
header-and-orientation/directive-glued-to-the-header] [fixture:
header-and-orientation/comment-line-between-the-header-and-the-orientation-kept]
[fixture: multi-line-statements/header-orientation-joined] [fixture:
header-and-orientation/directive-line-between-the-header-and-the-orientation-kept]

The orientation stands on the line of its header, after one space. mermaid.js
reads it after whitespace of any kind and also after whitespace and a line
break; the line break is whitespace to the lexer, so the orientation goes to the
header's line, and no whitespace is left at the end of a line that nobody sees
(see [Multi-line statements](#multi-line-statements)). The orientation is
printed as written, in the case written: only `horizontal`, in lower case, makes
the chart horizontal, and `Horizontal` makes it vertical, so the case is in the
Db. [fixture: header-and-orientation/orientation-after-one-space] [fixture:
header-and-orientation/orientation-after-a-tab] [fixture:
header-and-orientation/orientation-on-the-next-line-joined] [fixture:
header-and-orientation/orientation-on-the-next-line-after-a-tab] [fixture:
header-and-orientation/orientation-case-kept] [fixture:
header-and-orientation/orientation-upper-case-kept] [fixture:
header-and-orientation/orientation-and-comment]

Input
([header-and-orientation/second-header-on-its-own-line-input.mmd](../tests/fixtures/xychart/header-and-orientation/second-header-on-its-own-line-input.mmd)):

```mmd
xychart
xychart horizontal
line [1]
```

Output
([header-and-orientation/second-header-on-its-own-line-output.mmd](../tests/fixtures/xychart/header-and-orientation/second-header-on-its-own-line-output.mmd)):

```mmd
xychart
  xychart horizontal
  line [1]
```

Input
([header-and-orientation/orientation-after-one-space-input.mmd](../tests/fixtures/xychart/header-and-orientation/orientation-after-one-space-input.mmd)):

```mmd
xychart  horizontal
line [1]
```

Output
([header-and-orientation/orientation-after-one-space-output.mmd](../tests/fixtures/xychart/header-and-orientation/orientation-after-one-space-output.mmd)):

```mmd
xychart horizontal
  line [1]
```

### Text units

A text without quotes (a title, the title of an axis or of a plot, a category)
is made of units: a run of letters, a run of digits, or one of `-`, `_`, `.`,
`+`, `=`, `*`, `&`, and `#`. The whitespace between units is not in the Db
(`title Two   words` and `title Two words` have the title `Twowords`), so a run
of whitespace becomes one space. Units that touch keep touching, because whether
they touch is in the reading: a keyword is a keyword only where no character of
a word follows it, so `x-axis Title1 --> 5` has the title `Title` and the range,
while `x-axis Title 1 --> 5` is rejected, since `Title` is then a keyword;
`x-axis a-1 --> 2` has the title `a` and a range from the number `-1`, and a
space between the `-` and the `1` would make the word `-` and the number `1`,
which is another chart. Units apart cannot be joined, either: `title ba r` is
the title `bar`, which `title bar` is not, since `bar` is a keyword. So the
printer changes the amount of whitespace and nothing else, and one space is the
least that keeps the units apart. The same holds between the title of an axis
and the data after it, and between the words of a category. [fixture:
text-units/title-words-apart] [fixture: text-units/title-words-apart-by-a-tab]
[fixture: text-units/words-touching-kept] [fixture:
text-units/words-and-a-hash-apart-and-touching] [fixture:
text-units/axis-title-words-apart] [fixture: text-units/plot-title-words-apart]
[fixture: text-units/plot-title-digits-touching-kept] [fixture:
text-units/category-words-apart] [fixture:
text-units/category-digits-touching-kept] [fixture:
text-units/title-then-range-touching-kept] [fixture:
text-units/title-then-range-apart] [fixture:
text-units/hyphen-and-number-touching-kept] [fixture:
text-units/hyphen-and-number-apart-kept] [fixture:
text-units/directive-between-words-touching] [fixture:
text-units/directive-between-words-apart] [fixture:
text-units/directive-between-words-on-one-side] [fixture:
text-units/directive-inside-a-category-word]

The whitespace at the ends of a text is dropped: it is not in the Db. [fixture:
text-units/whitespace-at-the-ends-dropped]

Input
([text-units/title-words-apart-input.mmd](../tests/fixtures/xychart/text-units/title-words-apart-input.mmd)):

```mmd
xychart
title   Two    words
```

Output
([text-units/title-words-apart-output.mmd](../tests/fixtures/xychart/text-units/title-words-apart-output.mmd)):

```mmd
xychart
  title Two words
```

Input
([text-units/title-then-range-touching-kept-input.mmd](../tests/fixtures/xychart/text-units/title-then-range-touching-kept-input.mmd)):

```mmd
xychart
x-axis Title1 --> 5
x-axis T1-->2
```

Output
([text-units/title-then-range-touching-kept-output.mmd](../tests/fixtures/xychart/text-units/title-then-range-touching-kept-output.mmd)):

```mmd
xychart
  x-axis Title1 --> 5
  x-axis T1 --> 2
```

### Brackets and commas

The categories and the values stand between brackets. The `[` has one space
before it, after the keyword or the title, also where it was written touching
(`x-axis[a]`, `line T[1]`, `bar"Costs"[1,2]`); there is no space after the `[`
or before the `]`; a comma has no space before it and one after it
(`[jan, feb, mar]`). A keyword and the string that follows it are separated by
one space in the same way (`title"T"` is printed `title "T"`). None of this
whitespace is in the Db, and none of it changes how units are read, since a
bracket, a comma, and a quote are no characters of a word, so the form is a
choice. It is the form that most examples in the documentation of mermaid.js use
(`[jan, feb, mar]`, `[5000, 6000, 7500]`); some examples there have no space
after a comma (`[12,2,20,25,17,24]`), and one form for every chart is simpler to
read than two. A space after each comma is also how a list of values reads in
English. [fixture: brackets-and-commas/spaces-inside-and-around-commas]
[fixture: brackets-and-commas/bracket-touching-the-keyword] [fixture:
brackets-and-commas/bracket-touching-the-title] [fixture:
brackets-and-commas/bracket-touching-a-string] [fixture:
brackets-and-commas/values-with-spaces] [fixture:
brackets-and-commas/values-with-tabs] [fixture:
brackets-and-commas/quoted-categories] [fixture:
brackets-and-commas/one-category-and-one-value] [fixture:
brackets-and-commas/keyword-and-string-one-space] [fixture:
brackets-and-commas/keyword-and-words-one-space] [fixture:
brackets-and-commas/comma-after-a-string-category]

Input
([brackets-and-commas/spaces-inside-and-around-commas-input.mmd](../tests/fixtures/xychart/brackets-and-commas/spaces-inside-and-around-commas-input.mmd)):

```mmd
xychart
x-axis [ jan ,feb,  mar ]
```

Output
([brackets-and-commas/spaces-inside-and-around-commas-output.mmd](../tests/fixtures/xychart/brackets-and-commas/spaces-inside-and-around-commas-output.mmd)):

```mmd
xychart
  x-axis [jan, feb, mar]
```

Input
([brackets-and-commas/bracket-touching-a-string-input.mmd](../tests/fixtures/xychart/brackets-and-commas/bracket-touching-a-string-input.mmd)):

```mmd
xychart
x-axis"T"[a]
bar"Costs"[1,2]
```

Output
([brackets-and-commas/bracket-touching-a-string-output.mmd](../tests/fixtures/xychart/brackets-and-commas/bracket-touching-a-string-output.mmd)):

```mmd
xychart
  x-axis "T" [a]
  bar "Costs" [1, 2]
```

### Ranges

The arrow of a range has one space on each side: `4000 --> 11000`, also where it
was written touching (`4000-->11000`) or with more whitespace. The whitespace
around the arrow is not in the Db, and a number touching the arrow, with a sign
or not, is not read as part of it (`1-->-2` and `1 --> -2` have the same range).
The documentation of mermaid.js writes the arrow with spaces. A title without
quotes before the range follows [Text units](#text-units): it touches the range
where it was written touching (`x-axis Title1 --> 5`), and one space apart
otherwise. [fixture: ranges/arrow-touching] [fixture:
ranges/arrow-with-more-whitespace] [fixture: ranges/arrow-touching-on-one-side]
[fixture: ranges/negative-end-after-the-arrow] [fixture:
ranges/range-after-a-string-title] [fixture: ranges/range-after-the-keyword]
[fixture: ranges/empty-string-title-before-a-range]

Input
([ranges/arrow-touching-input.mmd](../tests/fixtures/xychart/ranges/arrow-touching-input.mmd)):

```mmd
xychart
y-axis Revenue 4000-->11000
x-axis 0-->10
```

Output
([ranges/arrow-touching-output.mmd](../tests/fixtures/xychart/ranges/arrow-touching-output.mmd)):

```mmd
xychart
  y-axis Revenue 4000 --> 11000
  x-axis 0 --> 10
```

### Values and labels

A value and the label after it are separated by one space (`20 "peak"`), also
where they were written touching (`10"peak"`), and a comma follows the label
with no space before it. mermaid.js reads the label whether it touches the value
or not, so the form is a choice: one space is the form that its documentation
uses (`25 "Launch"`) and the same separator as between a keyword and a string
(see [Brackets and commas](#brackets-and-commas)). [fixture:
values-and-labels/label-touching-the-value] [fixture:
values-and-labels/label-with-more-whitespace] [fixture:
values-and-labels/empty-label] [fixture: values-and-labels/label-on-a-line]

Input
([values-and-labels/label-touching-the-value-input.mmd](../tests/fixtures/xychart/values-and-labels/label-touching-the-value-input.mmd)):

```mmd
xychart
bar [10"peak"]
line [1"a", 2"b"]
```

Output
([values-and-labels/label-touching-the-value-output.mmd](../tests/fixtures/xychart/values-and-labels/label-touching-the-value-output.mmd)):

```mmd
xychart
  bar [10 "peak"]
  line [1 "a", 2 "b"]
```

### Numbers

A number of a range or of a plot is read by value and printed in the shortest
form: `+3` is `3`, `1.50` is `1.5`, and `.5` is `0.5` (see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)).
The same digits in a category or in a title without quotes are text
(`x-axis [007, .5]` has the categories `007` and `.5`), and stay as written, as
the values of a sankey diagram do (see [Values](./sankey.md#values)); so do a
number with a zero at the start of its integer part (`007`) and `-0`. [fixture:
numbers/range-numbers-one-form] [fixture: numbers/values-one-form] [fixture:
numbers/forms-kept] [fixture: numbers/categories-are-texts] [fixture:
numbers/titles-are-texts]

Input
([numbers/values-one-form-input.mmd](../tests/fixtures/xychart/numbers/values-one-form-input.mmd)):

```mmd
xychart
line [.5, 007, -0, 1.50, +3]
```

Output
([numbers/values-one-form-output.mmd](../tests/fixtures/xychart/numbers/values-one-form-output.mmd)):

```mmd
xychart
  line [0.5, 007, -0, 1.5, 3]
```

### Quotes

A string is printed as written: its quotes, its text, and the line breaks inside
it stay, and a run of spaces and tabs inside it is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
A quote is never added or removed. `"Sales"` and `Sales` have the same Db, but
`"a b"` and `a b` do not (`ab` is the text of the second), and the empty string
is read as no token by mermaid.js though it is the author's text; so the choice
of the quotes is left to the author, as in a sankey diagram (see
[Quotes](./sankey.md#quotes)). An empty string stands where the grammar takes
one: as the title of a plot, as the title of an axis before data, and as the
label of a value. [fixture: quotes/strings-runs-collapsed] [fixture:
quotes/quotes-not-removed] [fixture: quotes/quotes-not-added] [fixture:
quotes/keywords-and-markup-in-strings] [fixture:
quotes/comment-mark-in-a-string] [fixture:
quotes/empty-strings-where-the-grammar-takes-them]

Input
([quotes/quotes-not-removed-input.mmd](../tests/fixtures/xychart/quotes/quotes-not-removed-input.mmd)):

```mmd
xychart
title "Sales"
x-axis ["a", "b"]
```

Output
([quotes/quotes-not-removed-output.mmd](../tests/fixtures/xychart/quotes/quotes-not-removed-output.mmd)):

```mmd
xychart
  title "Sales"
  x-axis ["a", "b"]
```

Input
([quotes/empty-strings-where-the-grammar-takes-them-input.mmd](../tests/fixtures/xychart/quotes/empty-strings-where-the-grammar-takes-them-input.mmd)):

```mmd
xychart
line "" [1]
x-axis "" [a]
y-axis "" 0 --> 1
bar [1 ""]
```

Output
([quotes/empty-strings-where-the-grammar-takes-them-output.mmd](../tests/fixtures/xychart/quotes/empty-strings-where-the-grammar-takes-them-output.mmd)):

```mmd
xychart
  line "" [1]
  x-axis "" [a]
  y-axis "" 0 --> 1
  bar [1 ""]
```

### Accessibility statements

The `:` of `accTitle` and `accDescr` touches the keyword and has one space after
it, as in the other diagrams (see
[Accessibility statements](./journey.md#accessibility-statements)). The text has
no whitespace at its ends. A run of spaces and tabs inside the text of an
`accDescr` is printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
and that of an `accTitle` stays as written, since the browser shows it as a
tooltip, which the Db keeps (`accTitle: a  b` has the title `a  b` and is
printed `accTitle: a  b`). A text written on a later line, a colon written on a
later line than the keyword, and whitespace before the colon are printed on one
line: the line breaks are whitespace to the lexer, and the text of the statement
is the same. An `accTitle:` or `accDescr:` without text, at the end of the text,
is printed as the keyword and the colon with nothing after them. [fixture:
accessibility-statements/colon-touches-keyword] [fixture:
accessibility-statements/colon-without-space-after] [fixture:
accessibility-statements/text-whitespace-dropped] [fixture:
accessibility-statements/text-inner-runs-collapsed] [fixture:
accessibility-statements/special-characters-in-text] [fixture:
accessibility-statements/text-on-the-next-line-joined] [fixture:
accessibility-statements/colon-on-the-next-line-joined] [fixture:
accessibility-statements/text-that-looks-like-a-statement] [fixture:
accessibility-statements/without-text-at-the-end] [fixture:
accessibility-statements/without-text-and-trailing-whitespace]

Where `accDescr` and `{` print on the same line, separate them by one space,
including when they were written touching. Existing opener-line breaks retain
their own rules. Protected trivia and semicolon layouts keep their gaps. Align
the lines of an `accDescr { ... }` body one step inside its statement. Mermaid
discards indentation after LF from the description. Its `}` stands at the level
of its statement; a text on the line of the `{` has one space inside each brace,
also where the braces touched it. A block that is not closed runs to the end of
the text, without adding a `}` or changing its EOF ending: mermaid.js reads no
text for it, and a `}` that the printer wrote would make the block a description
(`accDescr {` and `abc` at the end of the text have an empty description in the
Db, and the same with a `}` have `abc`). [fixture:
accessibility-statements/block-lines-kept] [fixture:
accessibility-statements/block-text-on-the-opening-line] [fixture:
accessibility-statements/block-closing-brace-at-the-level-of-the-statement]
[fixture: accessibility-statements/block-then-statement-on-the-closing-line]
[fixture: accessibility-statements/block-comment-and-empty-lines-kept] [fixture:
accessibility-statements/block-not-closed-kept-as-written] [fixture:
accessibility-statements/block-not-closed-text-on-the-opening-line] [fixture:
accessibility-statements/block-not-closed-without-text] [fixture:
accessibility-statements/block-not-closed-after-a-statement-on-its-line]
[fixture: accessibility-statements/directive-around-colon-and-braces]

Input
([accessibility-statements/colon-touches-keyword-input.mmd](../tests/fixtures/xychart/accessibility-statements/colon-touches-keyword-input.mmd)):

```mmd
xychart
accTitle : T
accDescr  :  d
```

Output
([accessibility-statements/colon-touches-keyword-output.mmd](../tests/fixtures/xychart/accessibility-statements/colon-touches-keyword-output.mmd)):

```mmd
xychart
  accTitle: T
  accDescr: d
```

Input
([accessibility-statements/text-on-the-next-line-joined-input.mmd](../tests/fixtures/xychart/accessibility-statements/text-on-the-next-line-joined-input.mmd)):

```mmd
xychart
accTitle:
T
accDescr:

  d
```

Output
([accessibility-statements/text-on-the-next-line-joined-output.mmd](../tests/fixtures/xychart/accessibility-statements/text-on-the-next-line-joined-output.mmd)):

```mmd
xychart
  accTitle: T
  accDescr: d
```

Input
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/xychart/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
xychart
accDescr {
   a
  b
}
```

Output
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/xychart/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
xychart
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
empty-description-blocks/empty-whitespace-interiors] [test: xychart Unicode and
tab interiors] A block with a directive or comment line keeps its contents and
line breaks, with standalone trivia one level inside and its closer at statement
level. It stands on a line of its own, also after the header and after another
statement. A block that is not closed, at the end of the text, is printed as
`accDescr {` with no `}`, as in
[Accessibility statements](#accessibility-statements). [fixture:
empty-description-blocks/inner-whitespace-collapsed] [fixture:
empty-description-blocks/touching-kept] [fixture:
empty-description-blocks/blank-lines-inside] [fixture:
empty-description-blocks/with-directive-or-comment-line-kept] [fixture:
empty-description-blocks/after-the-header] [fixture:
empty-description-blocks/after-a-statement-on-its-line] [fixture:
empty-description-blocks/not-closed-at-the-end-of-the-text]

Input
([empty-description-blocks/touching-kept-input.mmd](../tests/fixtures/xychart/empty-description-blocks/touching-kept-input.mmd)):

```mmd
xychart
accDescr{}
accDescr {}
accDescr{ }
```

Output
([empty-description-blocks/touching-kept-output.mmd](../tests/fixtures/xychart/empty-description-blocks/touching-kept-output.mmd)):

```mmd
xychart
  accDescr {}
  accDescr {}
  accDescr {}
```

Input
([empty-description-blocks/blank-lines-inside-input.mmd](../tests/fixtures/xychart/empty-description-blocks/blank-lines-inside-input.mmd)):

```mmd
xychart
accDescr {


}
```

Output
([empty-description-blocks/blank-lines-inside-output.mmd](../tests/fixtures/xychart/empty-description-blocks/blank-lines-inside-output.mmd)):

```mmd
xychart
  accDescr {}
```

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line
where the line break is whitespace to the lexer: a line break after whitespace,
in a text, between a title and its brackets, in the categories, the values, a
range, around the label, and after `accTitle:` and `accDescr:`. The line break
is replaced by one space, and the whitespace at the end of the line goes with
it. A line that ends in whitespace is invisible, and a statement that goes on to
the next line because of it is easy to miss, so the printer does not keep it;
the same rule joins the lines of a statement in the other diagrams (see
[Multi-line statements](./sequence.md#multi-line-statements)). For this reason a
long line is not wrapped, either: a line break inside the brackets needs
whitespace before it that nobody sees. [fixture:
multi-line-statements/title-over-lines-joined] [fixture:
multi-line-statements/axis-title-and-band-joined] [fixture:
multi-line-statements/axis-keyword-and-band-joined] [fixture:
multi-line-statements/range-over-lines-joined] [fixture:
multi-line-statements/plot-over-lines-joined] [fixture:
multi-line-statements/plot-keyword-and-values-joined] [fixture:
multi-line-statements/text-over-several-line-breaks-joined] [fixture:
multi-line-statements/next-statement-after-trailing-whitespace]

Keep line breaks between structural parts with a comment or directive in their
gaps: titles, headers, axes, plots and accessibility line statements. Place
later parts and standalone trivia lines one continuation level inside their
statement. Preserve each gap's first line tail, including complete inline
directives: its whitespace must start before LF for the statement to continue.
[fixture: multi-line-statements/breaks-decided-one-by-one] [fixture:
multi-line-statements/line-rule-first-hash-after-colon-kept] [fixture:
multi-line-statements/structural-trivia-continuations] [fixture:
multi-line-statements/axis-trivia-with-multiline-string] Directive interiors
stay written. [fixture:
multi-line-statements/bare-title-multiline-directive-tail] A comment line takes
the rest of the line it stands on, so the joined `title A %% c B` has the title
`A`, where the statement with the comment line between its lines has `AB`.
[fixture: multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] Quoted contents stay whole,
including their internal line breaks and columns. [fixture:
multi-line-statements/quoted-title-trivia] A line break stays where joining it,
with one space or with nothing, could change which `;` the line rule ignores,
and where a `;` ends the last line; any other line break is joined as usual,
also in a statement that holds a `;`. The same decision applies to a `;` in
another statement on its final line (see
[Statements one per line](#statements-one-per-line)). [fixture:
multi-line-statements/semicolon-joining-changes-kept] [fixture:
multi-line-statements/semicolon-inside-joined] [fixture:
multi-line-statements/semicolon-on-the-last-line-joined] Comment regions that
join physical lines also keep their original layout. [test:
xychart/multi-line-statements/bare-title-comment-region-kept] [test:
xychart/multi-line-statements/header-comment-region-ls] [test:
xychart/multi-line-statements/header-comment-region-ps]

### Multi-line values

Strings keep their authored line breaks and whitespace, which are part of their
values. Description-body lines align one step inside their statement; Mermaid
discards their indentation after LF. Keep the remaining text and line breaks.
[fixture: multi-line-values/string-with-line-breaks-kept] [fixture:
multi-line-values/string-label-with-line-breaks-kept] [fixture:
multi-line-values/category-string-with-line-breaks-kept] [fixture:
multi-line-values/description-block-lines-kept] [fixture:
multi-line-values/comment-line-inside-a-block-kept]

Input
([multi-line-values/string-with-line-breaks-kept-input.mmd](../tests/fixtures/xychart/multi-line-values/string-with-line-breaks-kept-input.mmd)):

```mmd
xychart
title "a
   b"
line [1]
```

Output
([multi-line-values/string-with-line-breaks-kept-output.mmd](../tests/fixtures/xychart/multi-line-values/string-with-line-breaks-kept-output.mmd)):

```mmd
xychart
  title "a
   b"
  line [1]
```

Input
([multi-line-values/description-block-lines-kept-input.mmd](../tests/fixtures/xychart/multi-line-values/description-block-lines-kept-input.mmd)):

```mmd
xychart
accDescr {
  a
    b
}
```

Output
([multi-line-values/description-block-lines-kept-output.mmd](../tests/fixtures/xychart/multi-line-values/description-block-lines-kept-output.mmd)):

```mmd
xychart
  accDescr {
    a
    b
  }
```

### Keyword case

The keywords `title`, `x-axis`, `y-axis`, `line`, and `bar` are printed in the
case that the examples in the documentation of mermaid.js use (see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)).
mermaid.js reads them in any case (`Title` and `LINE` start statements), and the
Db is the same. `accTitle` and `accDescr` are printed in the case written, which
the examples do not use. The Db holds the kind of a plot, `line` or `bar`, in
lower case whatever the case written. [fixture:
keyword-case/statement-keywords-one-form] [fixture:
keyword-case/accessibility-keywords-kept] [fixture:
keyword-case/header-spelling-kept]

Input
([keyword-case/statement-keywords-one-form-input.mmd](../tests/fixtures/xychart/keyword-case/statement-keywords-one-form-input.mmd)):

```mmd
xychart
Title T
X-AXIS [a]
Y-Axis 0 --> 1
LINE [1]
Bar [2]
```

Output
([keyword-case/statement-keywords-one-form-output.mmd](../tests/fixtures/xychart/keyword-case/statement-keywords-one-form-output.mmd)):

```mmd
xychart
  title T
  x-axis [a]
  y-axis 0 --> 1
  line [1]
  bar [2]
```

### Comments

A comment starts with `%%` where a unit starts and runs to the end of the line.
A comment on a line of its own stands at the level of the statement after it,
and its text and its mark are kept as written: a comment line after the last
statement stays after it, and one before the header stands at the first column.
A `%%` inside a string, an accessibility text, or a description block is a
character of it. [fixture:
comments/comment-line-at-the-level-of-the-next-statement] [fixture:
comments/comment-line-at-the-end] [fixture:
comments/comment-line-before-the-header] [fixture: comments/comment-line-only]
[fixture: comments/comment-mark-in-an-accessibility-text] [fixture:
comments/comment-marks-and-empty-lines] [fixture: comments/bare-percent-comment]

A comment after a statement stays on the line of the statement, with one space
before it where whitespace was written, and touching where it was not. The Db is
the same wherever the spaces stand, but mermaid.js reads a `%%` that touches a
unit of one character together with that character (the known divergence
`comment-takes-character`): `title T%% c` is rejected, and `title A B%% c` has
the title `A`. A rule that wrote a space before every comment would change how
mermaid.js reads such an input, and leave a mistake of the author to read as
another chart without a word; the printer keeps whether the comment touches, and
a lint rule is the place to report it, as in the other diagrams (see
[Comments](./journey.md#comments)). [fixture:
comments/comment-after-a-statement-spaced] [fixture:
comments/comment-after-a-statement-touching] [fixture:
comments/comment-glued-to-a-one-character-word-kept] [fixture:
comments/comment-glued-to-a-bracket-kept] [fixture:
comments/comment-takes-a-character-kept] [fixture:
comments/comment-after-a-description-block]

Input
([comments/comment-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/xychart/comments/comment-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
xychart
      %% a
title T
%% b
line [1]
```

Output
([comments/comment-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/xychart/comments/comment-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
xychart
  %% a
  title T
  %% b
  line [1]
```

Input
([comments/comment-after-a-statement-spaced-input.mmd](../tests/fixtures/xychart/comments/comment-after-a-statement-spaced-input.mmd)):

```mmd
xychart
line [1]   %% c
x-axis [a]  %% d
```

Output
([comments/comment-after-a-statement-spaced-output.mmd](../tests/fixtures/xychart/comments/comment-after-a-statement-spaced-output.mmd)):

```mmd
xychart
  line [1] %% c
  x-axis [a] %% d
```

### Directives

Keep directives in their authored gaps. Within a printed line, a directive is
placed as under [Directives](./flowchart.md#directives): the gap is printed as
without the directive, and the directive stands after its space and touches the
unit that follows it. A directive on a line of its own stands at the level of
the statement after it. [fixture:
directives/directive-line-at-the-level-of-the-next-statement] [fixture:
directives/directive-line-before-the-header] [fixture:
directives/directive-after-a-statement-spaced] [fixture:
directives/directive-after-a-statement-touching] [fixture:
directives/directive-before-a-keyword] [fixture:
directives/directive-between-keyword-and-bracket] [fixture:
directives/directive-between-values] [fixture:
directives/directive-between-a-number-and-the-arrow] [fixture:
directives/directive-inside-a-string] [fixture:
directives/directive-in-an-accessibility-text-is-text] [fixture:
directives/directive-over-several-lines] [fixture:
directives/directive-not-closed-at-the-end] [fixture:
directives/directive-and-comment-on-a-line]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact.

[fixture: xychart/directives/directive-after-the-header-then-statement]

Input
([directives/directive-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/xychart/directives/directive-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
xychart
    %%{init: {}}%%
title T
```

Output
([directives/directive-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/xychart/directives/directive-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
xychart
  %%{init: {}}%%
  title T
```

Input
([directives/directive-between-keyword-and-bracket-input.mmd](../tests/fixtures/xychart/directives/directive-between-keyword-and-bracket-input.mmd)):

```mmd
xychart
line %%{init: {}}%% [1]
x-axis%%{init: {}}%%[a]
```

Output
([directives/directive-between-keyword-and-bracket-output.mmd](../tests/fixtures/xychart/directives/directive-between-keyword-and-bracket-output.mmd)):

```mmd
xychart
  line %%{init: {}}%%[1]
  x-axis %%{init: {}}%%[a]
```

### Frontmatter YAML

The frontmatter is formatted as YAML by Prettier, as in the other diagrams (see
[Frontmatter YAML](./flowchart.md#frontmatter-yaml)); a frontmatter that is no
valid YAML stays as written. The title and the orientation setting of the
frontmatter are in the Db, and the printer does not touch their values.
[fixture: frontmatter-yaml/formatted] [fixture: frontmatter-yaml/malformed-kept]
[fixture: frontmatter-yaml/orientation-setting] [fixture:
frontmatter-yaml/title-and-statement] [fixture:
frontmatter-yaml/comment-after-frontmatter-before-header]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/xychart/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:
    xyChart:
        width:  900
---
xychart
title X
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/xychart/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config:
  xyChart:
    width: 900
---
xychart
  title X
```

### Line separators

U+2028 and U+2029 are whitespace between the units of an XY chart and characters
of a string and of an accessibility text. Between statements they are a line
break like any whitespace: the statements go to lines of their own. A gap inside
a statement that holds one is printed as written, as in the other diagrams,
where mermaid.js does not read them as whitespace in every rule (see
[Line separators](./journey.md#line-separators)), and a string and a text keep
them. [test: U+2028 between the header and a statement] [test: U+2028 between
two statements] [test: U+2028 between the header and the orientation] [test:
U+2028 between the words of a title] [test: U+2029 between the words of a title]
[test: U+2028 after a title keyword] [test: U+2028 between the words of a
category] [test: U+2028 after a comma of the values] [test: U+2028 before the
bracket of a plot] [test: U+2028 between a value and its label] [test: U+2028
around the arrow of a range] [test: U+2028 in a string] [test: U+2028 in an
accessibility text] [test: U+2028 after the colon of accTitle] [test: U+2028
after a description block] [test: U+2028 at the end of a statement] [test:
U+2028 at the end of the text]

### Whitespace characters

A tab, a form feed, U+00A0, U+3000, and U+FEFF are whitespace to the lexer
between units, and characters of a string and of an accessibility text. Between
units, a run of them becomes one space, as a run of spaces does; at the start or
the end of a line they are dropped. They are part of a string or of an
accessibility text and stay there. [test: U+00A0 between the words of a title]
[test: a form feed between the words of a title] [test: U+00A0 after a title
keyword] [test: U+00A0 around the values of a plot] [test: U+00A0 around the
arrow of a range] [test: U+00A0 between the header and the orientation] [test:
U+FEFF between the words of a category] [test: U+3000 before a statement] [test:
U+FEFF before a statement] [test: U+00A0 between two statements] [test: U+00A0
at the end of a statement] [test: U+00A0 in a string] [test: U+00A0 in an
accessibility text] [test: U+3000 around the text of accTitle] [test: U+00A0
inside a description block] [test: U+00A0 inside an empty description block]
