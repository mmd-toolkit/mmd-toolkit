# Building the xychart Db from the tree

Japanese version: [xychart.ja.md](./xychart.ja.md)

The steps that build the Db summary of an xychart diagram from its tree, which
`src/db-from-tree/xychart.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in
[diagrams/xychart.md](../../../spec/docs/diagrams/xychart.md) and
[ast/xychart.md](../../../spec/docs/ast/xychart.md); the fields of the summary
are in [db-summaries.md](../db-summaries.md#xychart).

mermaid.js builds the Db while it parses: the grammar calls the Db for each
statement as the statement ends
([`statement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L98-L110)),
and the Db keeps state that later statements read: whether the axes were given a
range or categories, and the range of the y axis that the plots have widened
([`xychartDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts#L26-L38)).
The summary is built the same way: the headers and then the statements are
executed in source order, with the same state, and the summary is what the Db
holds when the last one has run (see
[db-summaries.md](../db-summaries.md#xychart) for what the summary keeps).

## Building the summary from the tree

**Converted form.** Each text is read in
[converted form](../../../spec/docs/common.md#reading-a-source): each line
terminator, `\r\n` and a lone `\r` too, as `\n`, in a string and in an
accessibility text, each attribute quote as `'`, and each entity as its
placeholder, which a string and an accessibility text may hold. A directive, a
comment line, and an ignored `;` are not in it. [fixture:
xychart/db-title-quoted-crlf] [fixture: xychart/db-label-quoted-crlf] [fixture:
xychart/db-title-html-tag-in-quotes] [fixture: xychart/db-label-entity]
[fixture: xychart/db-title-directive-in-quotes] [fixture:
xychart/db-title-quoted-comment-line-inside] [fixture:
xychart/db-title-quoted-directive-line-inside] [fixture:
xychart/db-title-quoted-hash-and-semicolon-apart] [fixture:
xychart/db-plot-title-style-line-semicolon] [fixture:
xychart/db-label-style-line-semicolon] [fixture:
xychart/db-x-axis-band-quoted-style-line-semicolon]

**Texts.** The text of a field of the tree is read as follows.

- An XychartLiteral of a title, an axis, a category, or a plot has the converted
  forms of its tokens, joined. The whitespace between the units of the text lies
  in no token, so it is no part of the value, and a directive between two units
  joins them: `title Two words` has the text `Twowords`, and `[a%%{x}%%b]` the
  category `ab`. [fixture: xychart/db-title-bare-words] [fixture:
  xychart/db-x-axis-band-words] [fixture: xychart/db-x-axis-title-words]
  [fixture: xychart/db-x-axis-band-directive-in-word]
- The XychartLiteral of an accessibility statement has the converted form of its
  range, the whitespace between its characters included. [fixture:
  xychart/db-acc-title] [fixture: xychart/db-acc-descr] [fixture:
  xychart/db-acc-title-takes-next-line]
- A StringLiteral has the converted form of what lies between its quotes, the
  text of the tree being the written one. [fixture: xychart/db-title-quoted]
  [fixture: xychart/db-title-quoted-line-feed]
- A number has the number that `Number()` makes of the converted form of its
  range: `+1` is 1, `.5` is one half, `007` is 7, a number too large for a
  double is `Infinity`, and `-0` is -0, which the summary holds as 0 since JSON
  has no -0 (the other numbers that JSON has not, `NaN`, `Infinity` and
  `-Infinity`, are the texts of the number). A directive inside a number joins
  its digits. [fixture: xychart/db-plot-values-decimal] [fixture:
  xychart/db-plot-values-leading-zeros] [fixture:
  xychart/db-plot-values-negative-zero] [fixture:
  xychart/db-plot-values-overflow] [fixture:
  xychart/db-plot-directive-in-number]
- The text of a title, an axis, a category, a plot, or a label is kept without
  the whitespace at its ends, and then with the replacement of characters (see
  below). The text of `accTitle` is kept in the same way, and the text of
  `accDescr` without the whitespace at its ends too, but for each line feed,
  which it keeps with the whitespace that follows it as one line feed. [fixture:
  xychart/db-title-quoted-spaces-trimmed] [fixture:
  xychart/db-plot-title-trimmed] [fixture: xychart/db-label-spaces-trimmed]
  [fixture: xychart/db-acc-title-spaces-trimmed] [fixture:
  xychart/db-acc-descr-block]

**The walk.** The headers are executed in order, and then the statements of the
body in source order. A statement changes the state as its paragraph below says;
a statement between two others changes nothing of theirs. [fixture:
xychart/db-semicolon-statements] [fixture: xychart/db-statement-blank-lines]

**Headers.** The orientation starts as the one of the configuration
(`xyChart.chartOrientation` of `embedded.config`), which is `vertical` unless
the configuration sets another. A header with an orientation sets it: the
orientation word `horizontal`, in lower case, makes it `horizontal`, and any
other word, in any case, makes it `vertical`. A header without an orientation
leaves it, so a header with one overrides the configuration, and a second header
without one leaves what the first set. [fixture:
xychart/config-orientation-setting-horizontal] [fixture:
xychart/config-orientation-directive] [fixture:
xychart/config-orientation-frontmatter] [fixture:
xychart/config-orientation-header-wins] [fixture:
xychart/config-orientation-frontmatter-header-wins] [fixture:
xychart/db-orientation-horizontal] [fixture: xychart/db-orientation-capitalized]
[fixture: xychart/db-orientation-upper-case] [fixture:
xychart/db-orientation-vertical-upper-case] [fixture:
xychart/header-second-with-orientation] [fixture: xychart/header-twice]

**Title.** The title starts as the title of the frontmatter, as mermaid.js reads
it, with the replacement of characters and with its spaces; a `title` statement
sets it, and the last one is the title. [fixture: xychart/db-title-frontmatter]
[fixture: xychart/db-title-frontmatter-spaces] [fixture:
xychart/db-title-frontmatter-and-statement] [fixture: xychart/db-title-twice]
[fixture: xychart/db-title-at-end-of-text]

**X axes.** The x axis is a band without categories and without a title. A
statement that has categories gives the axis those categories, in order, as a
band; a statement that has a range gives it that range, with the numbers in the
order they are written, as a linear axis. Either way the axis is then given, and
a plot does not give it a range. The title of the statement is the title of the
axis, and the empty text when the statement has none, so that `x-axis [b]`
removes the title that `x-axis T [a]` set; a statement with a title only sets
the title and keeps the categories or the range. A later statement replaces the
earlier one. [fixture: xychart/db-x-axis-band-title] [fixture:
xychart/db-x-axis-range] [fixture: xychart/db-x-axis-range-title] [fixture:
xychart/db-x-axis-title-bare-word] [fixture:
xychart/db-x-axis-title-then-glued-range] [fixture: xychart/db-x-axis-twice]
[fixture: xychart/db-x-axis-twice-title-cleared] [fixture:
xychart/db-x-axis-range-then-band] [fixture: xychart/db-data-range-reversed]

**Y axes.** The y axis is a linear axis without a title, with the range of the
plots so far (the empty range, from `Infinity` to `-Infinity`, until there is a
plot). A statement that has a range gives the axis that range, with the numbers
in the order they are written, and the plots do not widen it from then on; a
plot that was added before still has widened it, and the range of the statement
replaces what it had. The title is set as for the x axis. [fixture:
xychart/db-y-axis-range-title] [fixture:
xychart/db-y-axis-title-only-then-range] [fixture: xychart/db-y-axis-twice]
[fixture: xychart/db-y-axis-no-range-no-plot] [fixture:
xychart/db-y-axis-before-plot] [fixture: xychart/db-y-axis-after-plot]

**Plots.** A plot statement adds a plot with its kind, its title (the empty text
when it has none), and the pairs below. The pairs are made when the statement is
executed, from the axes as they are then, so a plot is not changed by an axis
that comes after it. [fixture: xychart/db-line-values] [fixture:
xychart/db-bar-values] [fixture: xychart/db-data-band-after-plot] [fixture:
xychart/db-data-band-after-plot-longer] [fixture:
xychart/db-data-range-after-plot]

**Pairs.** The pairs of a plot are made from its values, in order, in these
steps.

1. An x axis that was not given categories or a range gets the range from 1 to
   the number of the values. A plot after it, longer or not, leaves the range as
   it is. [fixture: xychart/db-data-no-axis-bar-and-line] [fixture:
   xychart/db-data-longer-second-plot] [fixture:
   xychart/db-data-shorter-second-plot]
2. On a band axis, the values beyond the number of categories are cut off, and
   the following steps do not see them. [fixture:
   xychart/db-data-band-more-values] [fixture:
   xychart/db-data-y-range-band-truncation]
3. Until the y axis was given a range, its range is widened to hold the values
   that are left: its lowest value is the lower of its lowest value and the
   lowest of them, and its highest the higher of its highest and the highest of
   them. [fixture: xychart/db-data-y-range-from-plots] [fixture:
   xychart/db-data-y-range-single-value] [fixture:
   xychart/db-data-y-range-negative-zero] [fixture:
   xychart/db-data-band-two-plots]
4. On a band axis, the pairs are the categories, each with the value at its
   position, or no value where the plot has fewer values than the axis has
   categories. [fixture: xychart/db-data-band-equal] [fixture:
   xychart/db-data-band-fewer-values]
5. On a linear axis with one value, the pair is the start of the range, as the
   text of the number, with the value. With more values, the step is the end
   less the start, divided by the number of values less one, and the pair at the
   position `i` is the text of the number `start + i × step`, computed in
   floating point and written as JavaScript writes a number, with the value at
   `i`. A range written from the higher to the lower number has a negative step.
   [fixture: xychart/db-data-range-one-value] [fixture:
   xychart/db-data-range-three] [fixture: xychart/db-data-range-fractions]
   [fixture: xychart/db-data-range-reversed]

**Labels.** The label of a value is its string, read as a text above, and the
empty text where it has none. A line keeps the labels as `pointLabels` when one
of them is not empty after it is read, and then all of them, the empty ones too,
taken from all the values, also from the values that a band axis cuts off of the
pairs; a line with no label, or with an empty one, and a bar, keep none.
[fixture: xychart/db-label-one] [fixture: xychart/db-label-all] [fixture:
xychart/db-label-on-bar] [fixture: xychart/db-label-empty-string] [fixture:
xychart/db-label-beyond-categories]

**Accessibility.** `accTitle` sets the title of the accessibility, and
`accDescr` with a text on its line, or a block with a text, sets the
description; the last one of each is the value. A statement of either kind whose
text is null, which happens at the end of the text, sets the empty text, while a
closed block without text changes nothing and keeps the description before it. A
block that is not closed, with a text or without one, sets the empty
description: it runs to the end of the text, where the lexer returns one more
text, empty, which is the last description. [fixture:
xychart/db-acc-descr-unclosed-block] [fixture:
xychart/db-acc-descr-unclosed-block-after-value] [fixture:
xychart/db-acc-descr-unclosed-empty-block-after-line] [fixture:
xychart/db-acc-descr-unclosed-empty-block-spaces] [fixture:
xychart/db-acc-descr-unclosed-empty-block-line-feeds] [fixture:
xychart/db-acc-title] [fixture: xychart/db-acc-title-empty] [fixture:
xychart/db-acc-title-empty-at-end-after-value] [fixture:
xychart/db-acc-descr-empty-at-end-after-value] [fixture: xychart/db-acc-descr]
[fixture: xychart/db-acc-descr-block] [fixture:
xychart/db-acc-descr-block-empty] [fixture:
xychart/db-acc-descr-line-then-empty-block] [fixture:
xychart/db-acc-descr-block-then-empty-block]

**The summary.** The summary has the fields of
[db-summaries.md](../db-summaries.md#xychart): the orientation, the title, the
accessibility title and description, the two axes, and the plots in source
order. The range of an axis is a number, or the text of the number where it is
not a finite one. [fixture: xychart/db-data-everything] [fixture:
xychart/db-data-xy-title-and-plots]

## The replacement of characters

The Db passes the texts through `sanitizeText`: the title (of the frontmatter
and of a `title` statement), the accessibility title and description, the titles
of the axes, the categories, the titles of the plots, and the labels of the
values that a line keeps. `xychartDbOf()` applies the replacement
`textReplacementOf(embedded.config)` of
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) to these and
to no other text; the orientation and the numbers are not reached. A text is
replaced after it is read as above. [fixture:
xychart/config-security-level-other-all] [fixture:
xychart/config-security-level-other-orientation-horizontal] [fixture:
xychart/config-security-level-other-html-labels-false] [fixture:
xychart/config-security-level-other-flowchart-html-labels-false] [fixture:
xychart/config-security-level-loose-all] [fixture:
xychart/config-security-level-sandbox-all]
