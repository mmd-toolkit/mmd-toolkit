# Building the quadrant chart Db from the tree

Japanese version: [quadrant.ja.md](./quadrant.ja.md)

The steps that build the Db summary of a quadrant chart diagram from its tree,
which `src/db-from-tree/quadrant.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in
[diagrams/quadrant.md](../../../spec/docs/diagrams/quadrant.md) and
[ast/quadrant.md](../../../spec/docs/ast/quadrant.md); the fields of the summary
are in [db-summaries.md](../db-summaries.md#quadrant).

mermaid.js builds the Db while it parses: the grammar calls the Db for each
statement as the statement ends
([`statement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L125-L136)),
and the Db keeps the state that later statements change: the texts of the
quadrants and of the axes, the points, and the classes
([`quadrantDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts#L30-L110)).
The summary is built the same way: the statements are executed in source order,
with the same state, and the summary is what the Db holds when the last one has
run (see [db-summaries.md](../db-summaries.md#quadrant) for what the summary
keeps).

## Building the summary from the tree

**Converted form.** Each text is read in
[converted form](../../../spec/docs/common.md#reading-a-source): each line
terminator, `\r\n` and a lone `\r` too, as `\n`, in a string and in an
accessibility text, each attribute quote as `'`, and each entity as its
placeholder. A directive, a comment line, and an ignored `;` are not in it.
[fixture: quadrant/db-grid-crlf-x-axis-quoted] [fixture:
quadrant/db-grid-html-x-axis-quoted] [fixture: quadrant/db-quadrant-entity]
[fixture: quadrant/db-directive-in-quotes] [fixture:
quadrant/db-comment-line-inside-quoted-text] [fixture:
quadrant/db-directive-inside-quoted-multiline] [fixture:
quadrant/db-grid-style-quadrant-quoted]

**Texts.** The text of a field of the tree is read as follows.

- A QuadrantLiteral has the converted form of its range, with the whitespace
  inside it; it has none at its ends. The title, the accessibility texts, the
  coordinates, and the styles are such literals. [fixture:
  quadrant/db-acc-title-trimmed] [fixture:
  quadrant/db-point-coordinate-space-in-x] [fixture:
  quadrant/db-acc-descr-block-indented-lines]
- A QuadrantLabel of the kind `text` has the converted form of its range, with
  the whitespace between its words. [fixture:
  quadrant/db-quadrant-spaces-trimmed] [fixture:
  quadrant/db-quadrant-tab-inside]
- A QuadrantLabel of the kind `string` has what lies between the quotes of the
  converted form of its range, followed by what lies after the closing quote; of
  the kind `markdown`, the same with the quote and the backquote at each end of
  the string left out. Whether a quote closes the string is read in the
  converted form, where an attribute quote is `'`. [fixture:
  quadrant/db-quadrant-quoted] [fixture: quadrant/db-quadrant-quoted-newline]
  [fixture: quadrant/db-quadrant-quoted-then-bare] [fixture:
  quadrant/db-quadrant-markdown] [fixture:
  quadrant/db-quadrant-markdown-then-bare] [fixture:
  quadrant/db-x-axis-markdown-multiline] [fixture:
  quadrant/db-x-axis-quoted-glued-text]
- The text of a label is kept without the whitespace at its ends, and then with
  the replacement of characters (see below), so that a string of spaces is the
  empty text. The text of a title is kept in the same way, the text of
  `accTitle` too, and the text of `accDescr` without the whitespace at its ends
  and with each line feed, together with the whitespace that follows it, as one
  line feed. [fixture: quadrant/db-x-axis-spaces-only-string] [fixture:
  quadrant/db-quadrant-twice-empty-spaces] [fixture:
  quadrant/db-acc-descr-trimmed] [fixture:
  quadrant/db-acc-descr-block-blank-lines]

**The walk.** The statements of the body are executed in source order. A
statement changes the state as its paragraph below says; a statement between two
others changes nothing of theirs. [fixture: quadrant/db-points-three]

**Title.** The title starts as the title of the frontmatter, as mermaid.js reads
it, with the replacement of characters and with its spaces. A `title` statement
sets it, and a `title` without a text sets the empty text; the last one is the
title. [fixture: quadrant/db-title-frontmatter] [fixture:
quadrant/db-title-frontmatter-and-statement] [fixture:
quadrant/db-title-frontmatter-after-statement] [fixture:
quadrant/db-title-twice] [fixture: quadrant/db-title-keyword-alone]

**Accessibility.** `accTitle:` sets the accessibility title, and `accDescr:` and
a block with a text set the description; the last one of each is the value. A
block without a text, whether it stands alone or follows a line or a block,
changes nothing and keeps the description before it. The text of `accTitle:` and
of `accDescr:` is the first line after the keyword that has one, read as the
literal says. [fixture: quadrant/db-acc-title-plain] [fixture:
quadrant/db-acc-title-twice] [fixture: quadrant/db-acc-title-next-line]
[fixture: quadrant/db-acc-descr-plain] [fixture: quadrant/db-acc-descr-block]
[fixture: quadrant/db-acc-descr-block-lines] [fixture:
quadrant/db-acc-descr-block-empty] [fixture:
quadrant/db-acc-descr-empty-block-keeps-line-braces] [fixture:
quadrant/db-acc-descr-empty-block-keeps-block] [fixture: quadrant/db-acc-both]

**Quadrants.** The summary lists the four texts in the order of the quadrants,
whatever the order of the statements. A `quadrant-N` statement sets the text of
the quadrant N, and the last one for a quadrant is its text. [fixture:
quadrant/db-quadrant-all-four] [fixture: quadrant/db-quadrant-reverse-order]
[fixture: quadrant/db-quadrant-3-alone] [fixture: quadrant/db-quadrant-twice]
[fixture: quadrant/db-quadrant-ten]

**Axes.** An axis has a first text, the left one of the x axis and the bottom
one of the y axis, and a second text, the right and the top one. A statement
with one text, and no arrow, sets the first text only. A statement with the
arrow and a second text sets both. A statement with the arrow and no second text
sets the first text with ` ⟶` after it, the text being followed by that and
trimmed, and leaves the second text. A later statement sets what it names and
keeps the rest. [fixture: quadrant/db-x-axis-both] [fixture:
quadrant/db-x-axis-left-only] [fixture: quadrant/db-x-axis-left-with-arrow]
[fixture: quadrant/db-x-axis-twice] [fixture:
quadrant/db-x-axis-twice-arrow-then-both] [fixture:
quadrant/db-x-axis-twice-arrow-without-right] [fixture:
quadrant/db-x-axis-right-only-after-left] [fixture:
quadrant/db-x-axis-quoted-both] [fixture: quadrant/db-y-axis-both] [fixture:
quadrant/db-y-axis-bottom-only]

**Points.** A point statement adds a point before those already there, so the
summary lists the points from the newest to the oldest. The point has the text
of its name, the class name (the empty text when it has none, whether or not a
class has that name), the two coordinates as the texts they are written as, and
the styles below. [fixture: quadrant/db-point-plain] [fixture:
quadrant/db-points-same-name] [fixture: quadrant/db-point-long-fraction]
[fixture: quadrant/db-point-coordinate-any-char-x] [fixture:
quadrant/db-name-markdown] [fixture: quadrant/db-class-plain] [fixture:
quadrant/db-class-undefined]

**Styles.** A style is read as a name, a `:`, and a value: the name is what lies
before the first `:` without the whitespace at its end, and the value is what
lies between the first `:` and the second, or the end, without the whitespace
around it, so that what follows a second `:` is dropped. The name `radius` gives
the number of the value, `color` and `stroke-color` the value as written, and
`stroke-width` the value as written, under the keys `radius`, `color`,
`strokeColor`, and `strokeWidth`. The styles are put in the order they are
written, a name written twice keeping its first place and its last value. A
radius that is no finite number (the digits of one are too many for a double) is
the text of the number in the summary. [fixture: quadrant/db-style-radius]
[fixture: quadrant/db-style-radius-leading-zeros] [fixture:
quadrant/db-style-radius-overflow] [fixture:
quadrant/db-radius-above-safe-integer] [fixture: quadrant/db-style-color]
[fixture: quadrant/db-style-stroke-width-leading-zero] [fixture:
quadrant/db-style-two] [fixture: quadrant/db-style-two-reversed] [fixture:
quadrant/db-style-same-twice] [fixture: quadrant/db-style-radius-colon-after]
[fixture: quadrant/db-style-color-colon-space-after] [fixture:
quadrant/db-style-space-around] [fixture: quadrant/db-style-four]

**Classes.** A `classDef` statement sets the styles of the class of its name,
read as the styles of a point: a class keeps the styles of its last definition
only, and keeps the place of its first in the list. The name is the converted
form of its range. The styles of a point and of its class are not merged, and a
class that no point uses is listed. [fixture: quadrant/db-classdef-color]
[fixture: quadrant/db-classdef-twice-replaces] [fixture:
quadrant/db-classdef-two-classes] [fixture: quadrant/db-classdef-redefine-order]
[fixture: quadrant/db-classdef-three-times-partner] [fixture:
quadrant/db-classdef-point-style-and-class] [fixture:
quadrant/db-classdef-unused] [fixture: quadrant/db-classdef-dash-name] [fixture:
quadrant/db-grid-nbsp-classdef-name] [fixture:
quadrant/db-classdef-prototype-used]

**The summary.** The summary has the fields of
[db-summaries.md](../db-summaries.md#quadrant): the title, the accessibility
title and description, the four texts of the quadrants, the two axes, the
points, and the classes. [fixture: quadrant/config-settings-chart]

## The replacement of characters

The Db passes the texts through `sanitizeText`: the title (of the frontmatter
and of a `title` statement), the accessibility title and description, the texts
of the axes and of the quadrants, and the names of the points. `quadrantDbOf()`
applies the replacement `textReplacementOf(embedded.config)` of
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) to these and
to no other text; the class names, the coordinates, and the styles are not
reached. A text is replaced after it is read as above. [fixture:
quadrant/config-security-level-other-all]
