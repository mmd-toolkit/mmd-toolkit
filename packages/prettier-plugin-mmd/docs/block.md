# Block diagram formatting rules

Japanese version: [block.ja.md](./block.ja.md)

How prettier-plugin-mmd formats a block diagram. Each rule below keeps what
mermaid.js reads from the diagram; where a change would alter it, the text is
kept as written, and the rule says where. A block diagram is a header followed
by statements that need no separator: a line break is whitespace like a space,
so any number of statements may stand on a line, and a statement may run over
several lines. Most whitespace is not in the Db, so most rules choose a form;
the whitespace of block arrows, `style`, and `class` is in the Db, and the rules
say where.

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

The statements after the header stand one level deeper than the header, and the
statements of a composite one level deeper than its `block:` line, with `end` at
the level of `block:`. A level is what Prettier's `useTabs` and `tabWidth`
options say: two spaces by default. The indentation written in the input is not
kept: whitespace at the start of a line is nothing to mermaid.js, so the printer
chooses it from the structure alone, and every text has one form. The nesting
shows where a composite starts and ends, which `block:` and `end` alone would
not once composites nest deeply, and it is how the documentation of mermaid.js
writes them, as the other diagrams nest their blocks (see
[Indentation](./flowchart.md#indentation) in the flowchart rules). The header,
and a comment line before it, stand at the first column, also where whitespace
was written before them. A gap of a kind that Prettier does not have takes the
form that the other diagram types print for it
([rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)), and
every diagram type prints its header and the comment lines before it at the
first column: the Indentation of [Gantt](./gantt.md#indentation) and of
[user journey](./journey.md#indentation) and the Comments of
[ER](./er.md#comments) say so.

[fixture: indentation/statements-one-level-deeper] [fixture:
indentation/composite-body-one-level-deeper-end-at-the-level-of-block] [fixture:
indentation/nested-composites] [fixture:
indentation/written-indentation-dropped] [fixture:
indentation/header-leading-whitespace] [fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs] [fixture:
indentation/comment-before-the-header-at-the-first-column] [fixture:
indentation/header-block]

Input
([indentation/composite-body-one-level-deeper-end-at-the-level-of-block-input.mmd](../tests/fixtures/block/indentation/composite-body-one-level-deeper-end-at-the-level-of-block-input.mmd)):

```mmd
block-beta
columns 3
a
block:group1:2
columns 2
h
i
end
d
```

Output
([indentation/composite-body-one-level-deeper-end-at-the-level-of-block-output.mmd](../tests/fixtures/block/indentation/composite-body-one-level-deeper-end-at-the-level-of-block-output.mmd)):

```mmd
block-beta
  columns 3
  a
  block: group1:2
    columns 2
    h
    i
  end
  d
```

### Composites

A composite stands on three kinds of lines: the line of `block:` and its node,
the lines of its statements, and the line of `end`. `block` and `block-beta` are
printed as written, for the reason given under [Header](#header). The keyword
`block:` holds its colon, and one space separates it from its node: `block:G` is
printed `block: G`, and `block:G:2` is printed `block: G:2`, the colon of the
width touching the node as it does elsewhere in a block diagram, for the reason
given under [Shapes](#shapes). A gap between a keyword and what follows it has
one form in every diagram type (`title Pets`; see
[A gap of a kind that Prettier does not have](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)),
and that rule comes before the spelling of the examples of mermaid.js, which
write `block:` touching its node 4 times and never with a space after it.
mermaid.js reads `block: G` and `block:G` alike, and so do all the versions that
count, so none needs the touching form. They all reject a space before the colon
(`block : G`), which the keyword `block:` forbids, so the printer never writes
it. Whitespace may stand after `block:`, line feeds included, and a gap of
spaces, tabs, or a line break is printed as the one space: `block:`, a line
break, and `G` become `block: G`. A directive in that gap stands after the space
and touches the node (see [Directives](#directives)). The first statement after
the head, and the statement after `end`, go to lines of their own, also where
the composite was written on one line (`block:G a b end`), so that every
composite is laid out in the same way and the indentation shows its body. `end`
stands on a line of its own, at the level of its `block:`.

[fixture: composites/space-after-the-colon] [fixture:
composites/tab-after-the-colon] [fixture:
composites/directive-between-the-colon-and-the-node] [fixture:
composites/colon-and-node-on-different-lines] [fixture: composites/width-kept]
[fixture: composites/width-colon-touches-the-node] [fixture:
composites/shape-touches-the-node] [fixture:
composites/block-without-a-node-kept] [fixture:
composites/block-beta-without-a-node-kept] [fixture:
composites/composite-on-one-line-split] [fixture:
composites/statement-after-end-on-a-line-of-its-own] [fixture:
composites/first-statement-after-the-head-on-a-line-of-its-own] [fixture:
composites/composite-between-rows] [fixture:
composites/end-on-a-line-of-its-own] [fixture:
composites/head-over-lines-joined]

Input
([composites/space-after-the-colon-input.mmd](../tests/fixtures/block/composites/space-after-the-colon-input.mmd)):

```mmd
block-beta
block:G
a
end
block: H
b
end
block:   I
c
end
```

Output
([composites/space-after-the-colon-output.mmd](../tests/fixtures/block/composites/space-after-the-colon-output.mmd)):

```mmd
block-beta
  block: G
    a
  end
  block: H
    b
  end
  block: I
    c
  end
```

Input
([composites/composite-on-one-line-split-input.mmd](../tests/fixtures/block/composites/composite-on-one-line-split-input.mmd)):

```mmd
block-beta
block:G a b end
```

Output
([composites/composite-on-one-line-split-output.mmd](../tests/fixtures/block/composites/composite-on-one-line-split-output.mmd)):

```mmd
block-beta
  block: G
    a b
  end
```

### Rows

Most diagrams stand each statement on a line of its own. A block diagram does
not, because the line is what the author lays the blocks out by: a run of nodes
and `space` blocks on one line is a row of the grid that a `columns` statement
sets, and the documentation of mermaid.js writes them so (`a b c`,
`a["A label"] b:2 c:2 d`, `Start(("Start")) space:2`). Putting each node on a
line of its own would hide the rows, and the number of columns would have to be
counted again from the `columns` statement. No rule of
[How the printed form is decided](./printed-form.md) gives this form: rule 2
gives the form of the other diagram types, a statement on a line of its own,
which hides the rows. The released form stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

[fixture: rows/documentation-row-with-widths] [fixture: rows/space-in-a-row]

So a run of node statements, with their widths, shapes, and links, and `space`
statements on a line stays on that line, with one space between two statements,
and the line break between two of them in the source stays where it is; empty
lines become one. Every other statement stands on a line of its own: a `columns`
statement, the head of a composite, `end`, `classDef`, `class`, `style`, and an
empty description block, so that a statement after `columns 3` on its line goes
to the next line (`columns 3 a b c` is printed as `columns 3` and a row
`a b c`). The printer adds no line break between two statements of a row and
removes none, so formatting again finds the same rows. A statement that runs
over several lines is the exception: it is printed on one line for the reason
given under [Multi-line statements](#multi-line-statements), and the statements
after it on its last line stay with it (`A -->`, a line break, and `B C` are
printed `A --> B C`).

[fixture: rows/rows-kept] [fixture: rows/line-break-between-statements-kept]
[fixture: rows/edges-in-a-row] [fixture: rows/touching-statements-apart]
[fixture: rows/space-then-node-touching-apart] [fixture:
rows/continuation-line-then-statement-stays-in-the-row] [fixture:
rows/columns-then-row-split] [fixture:
rows/class-definition-on-a-line-of-its-own] [fixture:
rows/style-on-a-line-of-its-own] [fixture: rows/class-on-a-line-of-its-own]
[fixture: rows/empty-description-block-on-a-line-of-its-own] [fixture:
rows/composite-on-lines-of-its-own] [fixture: rows/row-in-a-composite]

A statement that starts with `%%` is not moved to the start of a line:
mermaid.js reads `%%x` after a node as an id, and a line that starts with `%%x`
is a comment line and is removed (see [Comments](#comments)). A line that holds
such a statement stays on one line, with its statements laid out as any other,
and none of them goes to a line of its own: `columns 3 a %%x b` stays on one
line, and so does `block-beta %%x`.

[fixture: rows/percent-id-stays-in-its-row] [fixture:
rows/percent-id-keeps-columns-with-it] [fixture:
rows/percent-id-after-columns-not-moved] [fixture:
rows/percent-id-keeps-statements-before-it] [fixture:
rows/percent-id-after-end-not-moved] [fixture:
rows/percent-id-statements-formatted] [fixture: rows/percent-only-id-not-moved]
[fixture: rows/percent-id-in-a-composite] [fixture:
rows/percent-id-after-the-header-stays-on-the-line]

Input
([rows/rows-kept-input.mmd](../tests/fixtures/block/rows/rows-kept-input.mmd)):

```mmd
block-beta
columns 3
a b c
d   e   f
```

Output
([rows/rows-kept-output.mmd](../tests/fixtures/block/rows/rows-kept-output.mmd)):

```mmd
block-beta
  columns 3
  a b c
  d e f
```

Input
([rows/columns-then-row-split-input.mmd](../tests/fixtures/block/rows/columns-then-row-split-input.mmd)):

```mmd
block-beta
columns 3 a b c
```

Output
([rows/columns-then-row-split-output.mmd](../tests/fixtures/block/rows/columns-then-row-split-output.mmd)):

```mmd
block-beta
  columns 3
  a b c
```

Input
([rows/percent-id-keeps-columns-with-it-input.mmd](../tests/fixtures/block/rows/percent-id-keeps-columns-with-it-input.mmd)):

```mmd
block-beta
columns 3 a %%x b
```

Output
([rows/percent-id-keeps-columns-with-it-output.mmd](../tests/fixtures/block/rows/percent-id-keeps-columns-with-it-output.mmd)):

```mmd
block-beta
  columns 3 a %%x b
```

### Blank lines

A run of empty lines becomes one empty line, and there is none at the start of
the text, none between the header and the first statement, and none at the end
of the text. A blank line is a choice of the author that the Db does not hold,
and one empty line shows it at the least cost, as Prettier does in code (see
[Blank lines](./flowchart.md#blank-lines)).
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the empty
lines: Prettier prints a run of empty lines as one and drops the empty lines at
the start and at the end of a file or of a block in JavaScript and CSS, and
[Gantt](./gantt.md#blank-lines), [journey](./journey.md#blank-lines), and
[sankey](./sankey.md#blank-lines) print a run of empty lines as one and drop the
empty lines at the start and at the end of a body, and every other diagram type
drops the empty lines at the start of the text, before its header.

[fixture: blank-lines/runs-become-one] [fixture:
blank-lines/none-after-the-header] [fixture: blank-lines/none-at-the-end]
[fixture: blank-lines/between-rows] [fixture:
blank-lines/none-at-the-start-and-end-of-a-composite] [fixture:
blank-lines/after-a-composite] [fixture: blank-lines/whitespace-only-lines]

Input
([blank-lines/runs-become-one-input.mmd](../tests/fixtures/block/blank-lines/runs-become-one-input.mmd)):

```mmd
block-beta
a



b
```

Output
([blank-lines/runs-become-one-output.mmd](../tests/fixtures/block/blank-lines/runs-become-one-output.mmd)):

```mmd
block-beta
  a

  b
```

### Header

The header, `block-beta` or `block`, is printed as written: mermaid.js 12.3.0
reads them as the same diagram type, but some versions that count detect
`block-beta` only, so the spelling is the author's (see
[The names of a header](./compatibility.md#the-names-of-a-header) and
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
The whitespace before it is dropped (see [Indentation](#indentation)), and a
statement after it on its line goes to a line of its own (see [Rows](#rows)).

[fixture: header/block-beta-kept] [fixture: header/block-kept] [fixture:
header/statement-after-the-header-on-a-line-of-its-own] [fixture:
header/columns-after-the-header-on-a-line-of-its-own] [fixture:
header/leading-whitespace-dropped]

Input
([header/statement-after-the-header-on-a-line-of-its-own-input.mmd](../tests/fixtures/block/header/statement-after-the-header-on-a-line-of-its-own-input.mmd)):

```mmd
block-beta a b
c
```

Output
([header/statement-after-the-header-on-a-line-of-its-own-output.mmd](../tests/fixtures/block/header/statement-after-the-header-on-a-line-of-its-own-output.mmd)):

```mmd
block-beta
  a b
  c
```

### Keyword case

A block diagram reads its words in lower case only: `COLUMNS`, `SPACE`, `STYLE`,
and `CLASSDEF` are ids, not keywords, and stay as written. The header is the
exception (see [Header](#header)).

[fixture: keyword-case/keywords-kept]

Input (escaped): `"block-beta\nCOLUMNS 2\nSPACE\nSTYLE A\nCLASSDEF c"`.

Output
([keyword-case/keywords-kept-output.mmd](../tests/fixtures/block/keyword-case/keywords-kept-output.mmd)):

```mmd
block-beta
  COLUMNS 2
  SPACE
  STYLE A
  CLASSDEF c
```

### Columns and space

`columns` is followed by its number or `auto` after one space, whatever
whitespace was written between them (a tab, a line break): mermaid.js reads any
whitespace there, and the form is one line, as every diagram type prints the gap
between a keyword and what follows it (see [Composites](#composites)). `space:2`
is printed with the `:` touching, by the rule of
[Where mermaid.js decides against the whitespace](./printed-form.md#where-mermaidjs-decides-against-the-whitespace):
every version of mermaid.js that counts rejects `space: 2`, so no space follows
the colon, and none stands before it either (`a :2` is printed `a:2`) (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
A `space` statement and a `columns` statement are never moved to another place:
the last `columns` statement of a block is its columns, wherever it stands, and
the order of the blocks is the order of the text.

[fixture: columns-and-space/one-space-after-columns] [fixture:
columns-and-space/tab-after-columns] [fixture:
columns-and-space/line-break-after-columns] [fixture: columns-and-space/auto]
[fixture: columns-and-space/space-width-touching] [fixture:
columns-and-space/last-columns-kept-where-written] [fixture:
columns-and-space/space-kept-where-written] [fixture:
columns-and-space/columns-in-a-composite] [fixture:
columns-and-space/comment-line-inside-kept]

Input
([columns-and-space/line-break-after-columns-input.mmd](../tests/fixtures/block/columns-and-space/line-break-after-columns-input.mmd)):

```mmd
block-beta
columns
3
```

Output
([columns-and-space/line-break-after-columns-output.mmd](../tests/fixtures/block/columns-and-space/line-break-after-columns-output.mmd)):

```mmd
block-beta
  columns 3
```

Input
([columns-and-space/last-columns-kept-where-written-input.mmd](../tests/fixtures/block/columns-and-space/last-columns-kept-where-written-input.mmd)):

```mmd
block-beta
columns 2
a b c
columns 3
d
```

Output
([columns-and-space/last-columns-kept-where-written-output.mmd](../tests/fixtures/block/columns-and-space/last-columns-kept-where-written-output.mmd)):

```mmd
block-beta
  columns 2
  a b c
  columns 3
  d
```

### Shapes

An id and the shape after it touch (`A("x")`, `B[["y"]]`), also where whitespace
was written between them (`A ("x")`): mermaid.js reads the whitespace between an
id and an opening alike, so the form is a choice, and touching shows that the id
and its shape are one node, so that `A ("x") B` is not read as three. It is how
the documentation of mermaid.js writes shapes. The `:` of a width touches what
is before it and what follows (`A:3`, `B["b"]:2`). Every version that counts
rejects whitespace after it (`A: 3`, `A : 3`), and Prettier prints no colon with
a space on one side only, so a space before it (`A :3`, which they read the
same) is not printed either (see
[Where mermaid.js decides against the whitespace](./printed-form.md#where-mermaidjs-decides-against-the-whitespace)).
The `:` of `space:2` must touch.

[fixture: shapes/shape-touches-the-id] [fixture:
shapes/shape-on-the-next-line-joined] [fixture: shapes/shape-touching-kept]
[fixture: shapes/other-openings-and-closings] [fixture:
shapes/width-colon-touches-the-id] [fixture: shapes/width-after-a-shape]
[fixture: shapes/width-colon-on-the-next-line-joined] [fixture:
shapes/shape-and-width-in-a-row] [fixture: shapes/shape-on-a-target] [fixture:
shapes/directive-between-the-id-and-the-shape] [fixture:
shapes/comment-line-between-the-id-and-the-shape-kept]

A block arrow `<["x"]>` touches its id, and `(` touches the `>` before it
(`C<["z"]>(right)`). The directions inside the parentheses are printed as
written: mermaid.js keeps the whitespace after a direction and before the first
one (`(right down)` has the direction `right ` and `( up)` has ` up`), so
whitespace there is in the Db, and so is the lack of a `,` (`(rightdown)` has
the directions `right` and `down`). The whitespace after a `,` is in no
direction, so one space stands there: `(right,down)` and `(right, down)` are
printed `(right, down)`, as rule 1 gives after a comma (see
[The whitespace beside a mark](./printed-form.md#1-the-whitespace-beside-a-mark)).
Between a `:` and a `#` of a line that the line rule may read, the gap keeps
whether it holds whitespace, so no space is added there: in
`a<["style:"]>(x,down)  b["#y;"]` the `,` lies between the `:` of `style:` and
the `#` before the last `;`, and `(x,down)` stays, while `(x,   down)` there is
printed `(x, down)`. A `;` alone does not make the difference:
`a<["L"]>(x,down)  b["y;"]`, `a<["style"]>(x,down)  b[":#y;"]` (the `,` lies
before the `:`), and `a<["style:"]>(x,down)  b["#y"]` (no `;` follows) are
printed with the space.

[fixture: shapes/block-arrow-comma-on-kept-line]

A comment line or a directive there keeps its line, and a U+2028 or U+2029 stays
where it is, as it does in a gap inside a statement (see
[Line separators](#line-separators)). Rule 1 names no mark for a line break next
to a comment or a directive, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [sequence](./sequence.md#multi-line-statements),
[gantt](./gantt.md#multi-line-statements), and
[journey](./journey.md#multi-line-statements) keep such a line break, where no
other rule keeps the layout as written (a comment region that joins physical
lines, a line that holds a `;`). Before the first direction, before a `,`, and
before the `)`, a comment line or a directive line stays where it is written, at
column one or indented, and the next line is not indented, since the whitespace
there is in the Db (see above); after a `,`, where the whitespace is in no
direction, the comment line or the directive line and the next line stand one
level deeper, as [flowchart](./flowchart.md#multi-line-statements) and
[xychart](./xychart.md#multi-line-statements) put the continuations of a
statement one level deeper. A directive on the line of the direction stays
touching or separated as written after the `(`, before a `,`, and before the
`)`, since the whitespace there is in the Db (`(right %%{x}%%, down)` and
`(right%%{x}%%, down)` stay). After a `,` the gap is printed as without the
directive, and the directive stands after its space and touches the unit that
follows it, as under [Directives](#directives): `(right,  %%{x}%%  down)` and
`(right,%%{x}%%down)` are printed `(right, %%{x}%%down)`. Where the gap holds a
U+2028 or U+2029, it stays as written, a directive in it included: `(right,`,
U+2028, and ` %%{x}%% down)` stay. Where a line break follows a directive after
a `,`, the whitespace before it stays as written and the next line stands one
level deeper: `(right,  %%{x}%%` and a line break stay. A run of spaces or tabs
before the directive stays too.

[fixture: shapes/block-arrow-comma-space] [fixture:
shapes/block-arrow-comma-comment-line] [fixture:
shapes/block-arrow-first-direction-comment-line] [fixture:
shapes/block-arrow-comma-comment-line-indented] [fixture:
shapes/block-arrow-closing-comment-line] [fixture:
shapes/block-arrow-comma-directive-line] [fixture:
shapes/block-arrow-comma-directive-line-indented] [fixture:
shapes/block-arrow-directive-before-comma] [fixture:
shapes/block-arrow-directive-touching-before-comma] [fixture:
shapes/block-arrow-first-direction-comment-line-indented] [fixture:
shapes/block-arrow-first-direction-directive-line] [fixture:
shapes/block-arrow-first-direction-directive-line-indented] [fixture:
shapes/block-arrow-closing-comment-line-indented] [fixture:
shapes/block-arrow-closing-directive-line] [fixture:
shapes/block-arrow-closing-directive-line-indented] [fixture:
shapes/block-arrow-directive-after-open-parenthesis] [fixture:
shapes/block-arrow-directive-before-closing-parenthesis] [fixture:
shapes/block-arrow-directive-after-comma] [fixture:
shapes/block-arrow-directive-after-comma-at-the-end-of-the-line] [test: U+2028
and a directive after the comma between the directions of a block arrow, a space
after the U+2028 and after the directive] [test: U+2028 and a directive after
the comma between the directions of a block arrow, nothing around the directive]
[test: U+2029 and a directive after the comma between the directions of a block
arrow, a space after the U+2029 and after the directive] [test: U+2029 and a
directive after the comma between the directions of a block arrow, nothing
around the directive] [test: a space, U+2028, and a directive after the comma
between the directions of a block arrow] [test: a directive, spaces, and U+2028
after the comma between the directions of a block arrow] [test: U+2028 after the
comma between the directions of a block arrow] [test: U+2029 after the comma
between the directions of a block arrow] [test: U+2028 before the comma between
the directions of a block arrow] [test: U+2029 before the comma between the
directions of a block arrow] [fixture: shapes/block-arrow-touches-the-id]
[fixture: shapes/block-arrow-parenthesis-touches-the-closing] [fixture:
shapes/block-arrow-directions-as-written] [fixture:
shapes/block-arrow-directions-whitespace-kept] [fixture:
shapes/block-arrow-with-a-width]

A label is a string, between the quotes of the grammar, and is printed as
written with the line breaks inside it; a run of spaces and tabs inside it is
printed as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
A line break inside the quotes is a character of the label, not whitespace
between words: a label with a line break between `a` and `b` is another label in
the Db than `a b`, and the pinned version draws the first on two lines and the
second on one, so the line break stays. The quotes are part of the syntax:
mermaid.js rejects a label without them.

[fixture: shapes/label-runs-collapsed]

Input
([shapes/shape-touches-the-id-input.mmd](../tests/fixtures/block/shapes/shape-touches-the-id-input.mmd)):

```mmd
block-beta
A ("x")
B   [["y"]]
D {"d"}
```

Output
([shapes/shape-touches-the-id-output.mmd](../tests/fixtures/block/shapes/shape-touches-the-id-output.mmd)):

```mmd
block-beta
  A("x")
  B[["y"]]
  D{"d"}
```

Input
([shapes/block-arrow-directions-as-written-input.mmd](../tests/fixtures/block/shapes/block-arrow-directions-as-written-input.mmd)):

```mmd
block-beta
A<["a"]>(right, down)
B<["b"]>(right down)
C<["c"]>( up)
D<["d"]>(right,down)
E<["e"]>(rightdown)
```

Output
([shapes/block-arrow-directions-as-written-output.mmd](../tests/fixtures/block/shapes/block-arrow-directions-as-written-output.mmd)):

```mmd
block-beta
  A<["a"]>(right, down)
  B<["b"]>(right down)
  C<["c"]>( up)
  D<["d"]>(right, down)
  E<["e"]>(rightdown)
```

Input
([shapes/label-runs-collapsed-input.mmd](../tests/fixtures/block/shapes/label-runs-collapsed-input.mmd)):

```mmd
block-beta
A["  two  spaces  "]
B["a
   b"]
```

Output
([shapes/label-runs-collapsed-output.mmd](../tests/fixtures/block/shapes/label-runs-collapsed-output.mmd)):

```mmd
block-beta
  A[" two spaces "]
  B["a
   b"]
```

### Edges

The arrow of an edge has one space before it and one after it, and so has the
label of a link with one (`A --> B`, `A -- "x" --> B`), also where it was
written touching (`A-->B`, `I--xJ`) or with more whitespace. mermaid.js reads
the same edge with or without the whitespace around an arrow, so the form is a
choice: it is how its documentation writes edges, and a space between an arrow
and the id after it shows where a marker ends and the id starts (`I --x J`,
where `I--xJ` hides it); an id that ends in `x` or `o` stays apart from the
arrow after it in the same way (`A x --x B`, `Ao --> B`). The line of an arrow
is printed in its shortest form, also after the label of a link: `--->` is
`-->`, `-----` is `---`, `<--->` is `<-->`, `-..->` is `-.->`, and `====>` is
`==>`. The length of the line is not in the Db, and the versions that count draw
the same figure from the shorter line (the versions that do not read a thick
line reject both). The documentation of mermaid.js writes the arrow `-->` nine
times and `--` once (the opening of the label of a link, `A-- "X" -->B`), and
never a longer line of that kind (`--->`) (see
[The length of an arrow](./compatibility.md#the-length-of-an-arrow)), so rule 3
gives the shortest form for it ([A spelling](./printed-form.md#3-a-spelling)).
It writes no other kind of line (`---`, `-.->`, `==>`, `<-->`, `--x`, `--o`,
`~~~`, `-.-`) at all, so no rule gives the length of the lines that the
formatter shortens (`-----`, `-..->`, `====>`, `<--->`, `-..-`): the shortest
form, which the released version prints, stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
A line that starts with `<` is shortened whatever it ends in, since the versions
that count draw it the same: `<---x` is `<--x`, and `<====` is `<===`. A line
without the `<` that ends in `x` or `o` stays as written, since some of the
versions that count draw `---x` and `--x`, and `---o` and `--o`, differently. So
does a thick line that does not end in `>` (`====`), which some of them read as
ids that differ with the length, and so does a line of `~`, which is an id in
every version (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[fixture: edges/spaces-around-an-arrow] [fixture: edges/spaces-around-a-label]
[fixture: edges/end-marker-apart-from-the-id] [fixture: edges/start-marker]
[fixture: edges/id-ending-in-x-or-o] [fixture: edges/arrow-length-shortest]
[fixture: edges/arrow-length-start-marker-shortest] [fixture:
edges/arrow-length-kept-where-drawn-differently] [fixture: edges/line-kinds]
[fixture: edges/label-with-other-opening-arrow] [fixture:
edges/edge-over-lines-joined] [fixture: edges/width-before-the-arrow] [fixture:
edges/edge-with-shapes]

A chain of links, `A --> B --> C`, is one statement and is printed on one line:
mermaid.js reads it badly, and its Db loses the nodes before the last, but
splitting it into `A --> B` and `B --> C` would be another Db. The printer does
not read the chain better than mermaid.js does; that is for a lint rule.

[fixture: edges/chain-on-one-line] [fixture: edges/chain-over-lines-joined]

Input
([edges/spaces-around-a-label-input.mmd](../tests/fixtures/block/edges/spaces-around-a-label-input.mmd)):

```mmd
block-beta
A--"x"-->B
C  --  "x"  -->  D
```

Output
([edges/spaces-around-a-label-output.mmd](../tests/fixtures/block/edges/spaces-around-a-label-output.mmd)):

```mmd
block-beta
  A -- "x" --> B
  C -- "x" --> D
```

Input
([edges/chain-on-one-line-input.mmd](../tests/fixtures/block/edges/chain-on-one-line-input.mmd)):

```mmd
block-beta
A-->B-->C
```

Output
([edges/chain-on-one-line-output.mmd](../tests/fixtures/block/edges/chain-on-one-line-output.mmd)):

```mmd
block-beta
  A --> B --> C
```

### Styles

`classDef`, `style`, and `class` are followed by one space, the name of the
class or the id, and one space; the whitespace after the keyword and before the
first style is not in the Db, so it becomes one space, the one form of a gap
between a keyword and what follows it in every diagram type (see
[Composites](#composites)). The styles of `classDef` and `style` use the spacing
below; the value of a `class` is printed as written, except that a run of spaces
and tabs inside a class name is printed as one space: the Db changes, but every
version of mermaid.js that counts draws the same figure (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
`class A,B c1` stays, since every version of mermaid.js that counts draws
`class A, B c1` differently (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
Terminators follow
[Semicolons at the end of a style statement](#semicolons-at-the-end-of-a-style-statement).
In a `style` and a `class` the whitespace is in the Db.
`style A fill:#f00 , stroke:#333` has a style `fill:#f00 ` and a style
` stroke:#333`; `class A, B c1` looks up the id ` B` with its whitespace, finds
no block `B`, and gives the class to a new block that the diagram does not show;
and the class name of `class A c   d` is `c   d`, and that of `class A , B   c1`
is `, B   c1`, since the whitespace after `A` ends the ids. In a `classDef` or a
`style` statement, each style has no whitespace before its first `:` and one
space after it where the value is not empty. The `,` between styles has no
whitespace before it and one space after it, as in ER and requirement (see
[Styles and classes](./er.md#styles-and-classes)):
`classDef c fill:#f00 , color:white` is printed
`classDef c fill: #f00, color: white`, and the styles of a `style` statement use
the same form. Rule 1 gives both: the colon of a key has no whitespace before it
and one space after it (`color: red` in CSS), and a comma has none before it and
one space after it (Prettier prints `font-family: a,b` as `font-family: a, b;`
in CSS); see [Which kind a colon is](./printed-form.md#which-kind-a-colon-is). A
run of spaces and tabs between the words of a style is printed as one space, and
whether whitespace stands between two words stays as written; a run inside a
string, a comment, or the parentheses of `url(`, and the escape after a
backslash, stay as written, since CSS reads them as part of the value: the
hexadecimal digits and the one space or tab that follows them, or else the next
character. The Db changes, but mermaid.js draws the same figure (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).

[fixture: styles/style-colon-spaced] [fixture: styles/style-words-run-spaced]
[fixture: styles/style-string-runs-kept] [fixture: styles/style-url-runs-kept]
[fixture: styles/style-hex-escape-run-spaced]

A run of spaces, tabs, and form feeds between the last style and a `%%` comment
on the same line is printed as one space, unless the line stays as written for
another reason (see
[Whitespace at the end of a style](./compatibility.md#whitespace-at-the-end-of-a-style)).

[test: prints a form feed before a comment as one space]

A backslash does not escape a `,` here: `fill:a\,b ,stroke:c` is printed
`fill: a\, b, stroke: c`. A space after a backslash before the `:` stays, since
taking it away would escape the `:`, and the whitespace after that space goes,
since no whitespace stands before the colon of a key (rule 1, as above).

[fixture: styles/style-backslash-before-comma] [fixture:
styles/style-colon-escaped-space-kept] [fixture:
styles/style-colon-escaped-space-run-dropped]

A `style` whose last style ends with a backslash keeps whether whitespace stands
after it, a run of whitespace becoming its first character, also at the end of
the statement, since the shapes of a block arrow and of a group put the styles
into their `style` attribute joined with `;` as they are, and the backslash
would escape the `;` (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)):
`style A stroke-width:3px\ ,stroke:#0f0` is printed
`style A stroke-width: 3px\ , stroke: #0f0`. The first character of the run is
the one that the backslash escapes, and the rest stands before a `,` or at the
end of the statement, where no whitespace is printed (rule 1, and the end of a
statement as below).

[fixture: styles/style-backslash-space-kept] [fixture:
styles/style-backslash-at-end-kept]

A `classDef` takes the whitespace away first, and is printed in the one form.

[fixture: styles/class-def-backslash-space-dropped]

A style that starts with `color:` or `text-align:` keeps whether whitespace
stands before it, and the name `color` or `text-align` keeps whether whitespace
stands between it and the `:`, a run of whitespace becoming one space, since
mermaid.js puts such a style in the style of the label of a node, and a block
arrow takes it as it is (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)):
`style K fill:#ff0,color:red` is printed `style K fill: #ff0,color: red`, and
`style K color :red` is printed `style K color : red`. A run becomes one space
as every run between the words of a style does, above.

[fixture: styles/style-label-styles-kept] [test: block:
a-color-before-a-semicolon-that-the-line-rule-ignores-stays-in-a-style-that-holds-two-semicolons]
[test: a color before a semicolon, a space, and a semicolon in a style statement
of one line stays as written] [test: a color before two semicolons in a class
definition of one line stays as written] [test: a color before a semicolon that
the line rule ignores, a directive after it, in a style statement of one line]
[test: a color before a semicolon that the line rule ignores, a directive after
it, in a class definition of one line] [test: a color before a semicolon that
the line rule ignores, a comment after it, in a style statement of one line]
[test: a color before a semicolon that the line rule ignores, a directive after
it, in a class definition that a line break joins] [test: a color before a
semicolon that the line rule ignores, in a style statement that a comment line
after U+2028 cuts] [test: a color before a semicolon after whitespace in a class
definition that a line break joins] [test: a color that a space and a character
follow in a class definition that a line break joins] [test: a color that a
no-break space and a character follow in a class definition that a line break
joins stays as written]

A statement keeps its whitespace as written, and its colors are printed as under
[Colors](#colors), where a comment or a directive stands inside it, before the
end of its last style, where a style is all whitespace, or where a style holds a
line break or its line holds a kept `;`, except that, in a statement that holds
a line break, a color that a `;` that the line rule ignores touches stays as
written (see [Multi-line statements](#multi-line-statements)); a statement of
one line prints it in lower case, unless a second `;` follows it
(`style a fill:#F00,  stroke:#ABC;  %%{x}%%` is printed
`fill:#f00,  stroke:#abc; %%{x}%%`, while `#ABC;;` and `#ABC; ;` stay). Where
the line rule keeps the `;`, because whitespace stands between the `:` and the
`#`, the `;` is part of the text, and a color that touches it stays as written,
in a statement of one line as well (`classDef c fill: #F00;`, and
`style a fill: #F00,stroke: #ABC;` is printed
`style a fill: #f00,stroke: #ABC;`); a color that a space, a tab, or a form feed
separates from it is in lower case (`#f00 ;`), and one that any other character
separates from it stays; the first character after the color decides. A comment
or a directive after the last style is no part of the statement, which is
formatted as usual (see
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)).
The whitespace at the end of the statement is dropped, as in a flowchart (see
[Style trailing whitespace](./flowchart.md#style-trailing-whitespace)).

[fixture: styles/class-definition-spaces] [fixture:
styles/style-comment-and-directive-after-last-style-formatted] [fixture:
styles/style-spaces] [fixture: styles/class-spaces] [fixture:
styles/style-commas-spaced] [fixture: styles/class-definition-commas-spaced]
[fixture: styles/class-definition-comma-spaced] [fixture:
styles/class-definition-comma-beside-directive-kept] [fixture:
styles/style-statement-commas-spaced] [test: U+2029 before the comma of a block
classDef statement] [test: block:
a-directive-between-two-styles-keeps-the-whitespace-and-lowers-the-colors]
[test: block: a-directive-inside-a-style-lowers-the-colors] [test: block:
a-color-that-a-directive-and-a-character-follow-stays] [test: block:
a-style-that-is-all-whitespace-keeps-the-whitespace-and-lowers-the-colors]
[test: block:
a-color-before-a-semicolon-that-the-line-rule-ignores-stays-in-a-style-that-holds-two-semicolons]
[fixture: styles/class-ids-as-written] [test: a color that a semicolon that the
line rule keeps touches in a class definition of one line stays as written]
[test: a color that a semicolon that the line rule keeps touches in a style
statement of one line stays as written, and the color before a comma is printed
in lower case] [test: a color that a semicolon that the line rule keeps touches
in a style statement of one line stays as written, with a directive after it]
[test: a color that a semicolon that the line rule keeps touches in a class
definition that a line break joins stays as written] [test: a space between a
color and the semicolon that the line rule keeps in a class definition of one
line, the color is printed in lower case] [test: a tab between a color and the
semicolon that the line rule keeps in a class definition of one line, the color
is printed in lower case] [test: a form feed between a color and the semicolon
that the line rule keeps in a class definition of one line, the color is printed
in lower case] [test: a vertical tab between a color and the semicolon that the
line rule keeps in a class definition of one line, the color stays as written]
[test: a no-break space between a color and the semicolon that the line rule
keeps in a class definition of one line, the color stays as written] [test:
U+2003 between a color and the semicolon that the line rule keeps in a class
definition of one line, the color stays as written]

The class name of a `class` statement is read as words: a run of spaces and tabs
inside it is printed as one space, so `class A c   d` is printed `class A c d`,
for the reason given at the start of this section: the Db changes, but every
version of mermaid.js that counts draws the same figure.

[fixture: styles/class-name-with-a-comma-runs-collapsed] [fixture:
styles/class-name-runs-collapsed] [fixture: styles/trailing-whitespace-dropped]
[fixture: styles/styles-with-a-directive]

A style that starts with the `:` is printed as any other: one space after the
`:` (rule 1, as above), and the runs between its words as one space.
`style A :  red   x` is printed `style A : red x`.

[fixture: styles/style-colon-first-run-spaced]

A `style` with no styles is printed as `style A`: the id stands after one space
and nothing follows it. Rule 1 of
[How the printed form is decided](./printed-form.md#1-the-whitespace-beside-a-mark)
names no mark between a keyword and its id, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides: [wardley](./wardley.md#component-spacing) puts one ordinary space
between each command keyword and its first complete name, and
[radar](./radar.md#groups-and-commas) between a group keyword and its first
member.

[fixture: styles/style-without-styles] [corpus fixture: block/db-style-none]

When the first style is only whitespace, as in `classDef c ,fill:#f00`, the Db
has an empty first style and the whitespace before the `,` belongs to no style,
so the styles start at the first `,`: that whitespace becomes one space, and the
`,` and what follows are printed as written.

[fixture: styles/styles-with-a-leading-comma] [corpus fixture:
block/db-class-def-leading-comma]

Input
([styles/class-definition-spaces-input.mmd](../tests/fixtures/block/styles/class-definition-spaces-input.mmd)):

```mmd
block-beta
A
classDef   c1    color:#fff , fill:#000
```

Output
([styles/class-definition-spaces-output.mmd](../tests/fixtures/block/styles/class-definition-spaces-output.mmd)):

```mmd
block-beta
  A
  classDef c1 color: #fff, fill: #000
```

Input
([styles/style-spaces-input.mmd](../tests/fixtures/block/styles/style-spaces-input.mmd)):

```mmd
block-beta
A
style  A   fill:#f00 , stroke:#333
```

Output
([styles/style-spaces-output.mmd](../tests/fixtures/block/styles/style-spaces-output.mmd)):

```mmd
block-beta
  A
  style A fill: #f00, stroke: #333
```

Input
([styles/class-ids-as-written-input.mmd](../tests/fixtures/block/styles/class-ids-as-written-input.mmd)):

```mmd
block-beta
A
B
class A,B c1
class   A, B   c1
```

Output
([styles/class-ids-as-written-output.mmd](../tests/fixtures/block/styles/class-ids-as-written-output.mmd)):

```mmd
block-beta
  A
  B
  class A,B c1
  class A, B c1
```

A `class` with several class names is printed as written: `class A x,y` stays,
since `x, y` would be one class named `x, y`, as `x,y` is one class named `x,y`,
and the Db would change (see
[Lists separated by commas](./compatibility.md#lists-separated-by-commas)).

[fixture: styles/class-names-without-space-kept]

### Semicolons at the end of a style statement

A line-ending `;` of a `classDef` or `style` statement is dropped when the
[line rule of mermaid.js](../../spec/docs/common.md#style-and-classdef-lines)
ignores it: no whitespace lies between the `:` and the later `#`. Removing this
terminator leaves the Db unchanged, also with several styles.

[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]

Whitespace immediately before a dropped `;` is dropped with it.

[fixture: semicolons-at-the-end-of-a-style-statement/space-before-terminator]

The line then formats as a line without that `;`, including its usual style
spacing.

[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]

Blank lines and comment lines keep their usual layout around the statement (see
[Blank lines](#blank-lines) and [Comments](#comments)).

[fixture: semicolons-at-the-end-of-a-style-statement/blank-and-comment-lines]

An empty description block follows its usual layout while the style terminator
is dropped.

[fixture: semicolons-at-the-end-of-a-style-statement/empty-description-block]

For `classDef` without a `#` in the statement, a final `;` of the last style is
dropped when it is the only semicolon of that style and follows non-whitespace
text: mermaid.js removes its first `;`.

[fixture: semicolons-at-the-end-of-a-style-statement/classdef-text-terminators]

Keep `classDef c fill:red;;` and `style A fill:red;`: removing the last
semicolon changes the Db.

[fixture: semicolons-at-the-end-of-a-style-statement/style-text-kept]

A directive after the semicolon on the same line keeps the `;`.

[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]

Following `%%` text on the same line also keeps it; here it is part of the
style.

[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]

An ignored `;` beside another `;` is kept to preserve the line rule's selection.

[fixture: semicolons-at-the-end-of-a-style-statement/adjacent-semicolons-kept]

A `;` after an unclosed directive stays, preserving its stopping boundary.

[fixture: semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept]

The same protection applies before U+2028 and U+2029; see
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends).

[test: style semicolons: block before U+2028] [test: style semicolons: block
before U+2029]

A closed directive between the statement and an ignored terminator is kept while
the `;` is dropped.

[fixture:
semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

Output
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/block/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
block
  A
  classDef c fill: #f00
  style A fill: #f00
  classDef d fill: #0f0, stroke: #00f
  style A fill: #0f0, stroke: #00f
```

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line: the
line break is whitespace to the lexer, and so are the line breaks in a `columns`
statement, an edge, a width, a shape, and the head of a composite. The line
break is replaced by one space; this is how the other diagrams join the lines of
a statement (see [Multi-line statements](./xychart.md#multi-line-statements)).
Keep trivia line breaks in structural gaps, including node/shape/width and edge
parts, `columns` statements, class/style heads and composite heads. Place later
parts and standalone trivia one continuation level inside the statement, also
within rows and composites. Preserve first gap-line tails, complete directive
interiors and whole value ranges; block-arrow directions remain as written,
except for the whitespace after a `,`.

[fixture: multi-line-statements/structural-trivia-continuations] [test: block:
a-run-of-spaces-after-a-comma-in-a-classdef-that-whitespace-and-a-line-break-join-stays]
[test: block:
a-space-before-a-comma-in-a-classdef-that-whitespace-and-a-line-break-join-stays]
[test: block:
a-run-of-spaces-around-the-colon-in-a-classdef-that-whitespace-and-a-line-break-join-stays]
[test: block:
a-tab-after-a-comma-in-a-classdef-that-whitespace-and-a-line-break-join-stays]
[test: block:
a-color-that-characters-follow-after-whitespace-in-a-classdef-that-whitespace-and-a-line-break-join-is-lower-case]

Joining comment regions retain their original layout. A comment region after
U+2028 or U+2029 makes mermaid.js read the lines around it as one. How the
formatter prints such a line, and the cases that it prints otherwise, are in
[A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029).
A composite head is one more case: where a name stands on the line of the colon,
the gap between them is printed as on a plain head, `block:G`, U+2028, and
`%% c` as `block: G`, U+2028, and `%% c`, and `block:   G` as `block: G`; where
the comment region follows the colon at once, the head stays as written, also
with spaces after the colon, as `block:`, U+2028, `%% keep`, a line break, and
`group:2`, or `block:` with three spaces before the U+2028; and a space after
the name stays (`block:G`, a space, U+2028, and `%% c`).

[test: block: ls-comment-in-composite-head] [test: block:
ps-comment-in-composite-head] [test: block:
ls-comment-after-composite-head-name] [test: block:
ps-comment-after-composite-head-name] [test: block:
composite-head-name-after-the-comment-line-stays-as-written] [test: block:
composite-head-spaces-after-the-colon-before-a-ls-comment-line-stay] [test:
block: composite-head-space-after-the-name-before-a-ls-comment-line-stays]
[test: block:
composite-head-spaces-before-the-name-before-a-ls-comment-line-are-one-space]

A line break stays where joining it, with one space or with nothing, could
change which `;` the line rule ignores, and where a `;` ends the last line; any
other line break is joined as usual, also in a statement that holds a `;`. A
statement that keeps a line break keeps the whitespace of its styles as written,
runs and tabs included. Its colors are in lower case where a comma follows them,
and where characters follow them after a space, a tab, or a form feed
(`fill:#F00 x;` prints `fill:#f00 x;`). A color that any other character follows
stays as written, before a comma as well (`fill:#F00`, a no-break space, and
`x;` keeps `#F00`): a vertical tab, the wide spaces (a no-break space, U+1680,
U+2000 to U+200A, U+202F, U+205F, U+3000, and U+FEFF), U+2028, U+2029, U+0085,
U+180E, U+200B, and the control characters but a tab and a form feed are no
whitespace there. The first character after the color decides, whatever follows
it (`fill:#F00`, a space, and a vertical tab print `#f00`, while `fill:#F00`, a
vertical tab, and a space keep `#F00`). A color that a `;` that the line rule
ignores touches stays as written (`#ABC;`), and so does a color that any
character but a space, a tab, or a form feed separates from the `;`, while a
color that spaces, tabs, or form feeds separate from the `;` is in lower case
(`#abc ;`). See [Rows](#rows) and
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends). The line rule
of mermaid.js removes the last `;` of a line that holds `style` or `classDef`, a
later `:`, a `#` after that with no whitespace between them, and a later `;`
(the first such `#` decides, so `B[":#a;#b"]` matches); moving a statement away
from such a line changes which `;` is the last (in `A["style:#a"] B;C D;` the
`;` of `D;` is the one removed and the id is `B;C`; on a line without `D;`, the
`;` of `B;C` would be removed), so the statements of such a line stay on it and
its kept `;` stays. The exception for a style terminator is described in
[Semicolons at the end of a style statement](#semicolons-at-the-end-of-a-style-statement).
The whitespace between the `:` and the `#` stays as well, since it decides
whether the rule applies: `A["style:"]-->B["#z"];` keeps its arrow touching, and
with spaces around the arrow the rule does not apply, and the `;` is an id of
its own.

[fixture: multi-line-statements/breaks-decided-one-by-one] [fixture:
multi-line-statements/columns-over-lines-joined] [fixture:
multi-line-statements/edge-over-lines-joined] [fixture:
multi-line-statements/shape-over-lines-joined] [fixture:
multi-line-statements/class-definition-line-break-in-the-head] [fixture:
multi-line-statements/continuation-line-joined-in-a-row] [fixture:
multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] [test: a space before a comma in a
class definition that a line break joins, the color is printed in lower case]
[test: a space and a character after a color in a class definition that a line
break joins, the color is printed in lower case] [test: a space between a color
and the semicolon that the line rule ignores in a class definition that a line
break joins, the color is printed in lower case] [test: a tab before a comma in
a class definition that a line break joins, the color is printed in lower case]
[test: a tab and a character after a color in a class definition that a line
break joins, the color is printed in lower case] [test: a tab between a color
and the semicolon that the line rule ignores in a class definition that a line
break joins, the color is printed in lower case] [test: a vertical tab before a
comma in a class definition that a line break joins, the color stays as written]
[test: a vertical tab and a character after a color in a class definition that a
line break joins, the color stays as written] [test: a vertical tab between a
color and the semicolon that the line rule ignores in a class definition that a
line break joins, the color stays as written] [test: a form feed before a comma
in a class definition that a line break joins, the color is printed in lower
case] [test: a form feed and a character after a color in a class definition
that a line break joins, the color is printed in lower case] [test: a form feed
between a color and the semicolon that the line rule ignores in a class
definition that a line break joins, the color is printed in lower case] [test: a
no-break space before a comma in a class definition that a line break joins, the
color stays as written] [test: a no-break space and a character after a color in
a class definition that a line break joins, the color stays as written] [test: a
no-break space between a color and the semicolon that the line rule ignores in a
class definition that a line break joins, the color stays as written] [test:
U+1680 before a comma in a class definition that a line break joins, the color
stays as written] [test: U+1680 and a character after a color in a class
definition that a line break joins, the color stays as written] [test: U+1680
between a color and the semicolon that the line rule ignores in a class
definition that a line break joins, the color stays as written] [test: U+2000
before a comma in a class definition that a line break joins, the color stays as
written] [test: U+2000 and a character after a color in a class definition that
a line break joins, the color stays as written] [test: U+2000 between a color
and the semicolon that the line rule ignores in a class definition that a line
break joins, the color stays as written] [test: U+2001 before a comma in a class
definition that a line break joins, the color stays as written] [test: U+2001
and a character after a color in a class definition that a line break joins, the
color stays as written] [test: U+2001 between a color and the semicolon that the
line rule ignores in a class definition that a line break joins, the color stays
as written] [test: U+2002 before a comma in a class definition that a line break
joins, the color stays as written] [test: U+2002 and a character after a color
in a class definition that a line break joins, the color stays as written]
[test: U+2002 between a color and the semicolon that the line rule ignores in a
class definition that a line break joins, the color stays as written] [test:
U+2003 before a comma in a class definition that a line break joins, the color
stays as written] [test: U+2003 and a character after a color in a class
definition that a line break joins, the color stays as written] [test: U+2003
between a color and the semicolon that the line rule ignores in a class
definition that a line break joins, the color stays as written] [test: U+2004
before a comma in a class definition that a line break joins, the color stays as
written] [test: U+2004 and a character after a color in a class definition that
a line break joins, the color stays as written] [test: U+2004 between a color
and the semicolon that the line rule ignores in a class definition that a line
break joins, the color stays as written] [test: U+2005 before a comma in a class
definition that a line break joins, the color stays as written] [test: U+2005
and a character after a color in a class definition that a line break joins, the
color stays as written] [test: U+2005 between a color and the semicolon that the
line rule ignores in a class definition that a line break joins, the color stays
as written] [test: U+2006 before a comma in a class definition that a line break
joins, the color stays as written] [test: U+2006 and a character after a color
in a class definition that a line break joins, the color stays as written]
[test: U+2006 between a color and the semicolon that the line rule ignores in a
class definition that a line break joins, the color stays as written] [test:
U+2007 before a comma in a class definition that a line break joins, the color
stays as written] [test: U+2007 and a character after a color in a class
definition that a line break joins, the color stays as written] [test: U+2007
between a color and the semicolon that the line rule ignores in a class
definition that a line break joins, the color stays as written] [test: U+2008
before a comma in a class definition that a line break joins, the color stays as
written] [test: U+2008 and a character after a color in a class definition that
a line break joins, the color stays as written] [test: U+2008 between a color
and the semicolon that the line rule ignores in a class definition that a line
break joins, the color stays as written] [test: U+2009 before a comma in a class
definition that a line break joins, the color stays as written] [test: U+2009
and a character after a color in a class definition that a line break joins, the
color stays as written] [test: U+2009 between a color and the semicolon that the
line rule ignores in a class definition that a line break joins, the color stays
as written] [test: U+200A before a comma in a class definition that a line break
joins, the color stays as written] [test: U+200A and a character after a color
in a class definition that a line break joins, the color stays as written]
[test: U+200A between a color and the semicolon that the line rule ignores in a
class definition that a line break joins, the color stays as written] [test:
U+202F before a comma in a class definition that a line break joins, the color
stays as written] [test: U+202F and a character after a color in a class
definition that a line break joins, the color stays as written] [test: U+202F
between a color and the semicolon that the line rule ignores in a class
definition that a line break joins, the color stays as written] [test: U+205F
before a comma in a class definition that a line break joins, the color stays as
written] [test: U+205F and a character after a color in a class definition that
a line break joins, the color stays as written] [test: U+205F between a color
and the semicolon that the line rule ignores in a class definition that a line
break joins, the color stays as written] [test: U+3000 before a comma in a class
definition that a line break joins, the color stays as written] [test: U+3000
and a character after a color in a class definition that a line break joins, the
color stays as written] [test: U+3000 between a color and the semicolon that the
line rule ignores in a class definition that a line break joins, the color stays
as written] [test: U+FEFF before a comma in a class definition that a line break
joins, the color stays as written] [test: U+FEFF and a character after a color
in a class definition that a line break joins, the color stays as written]
[test: U+FEFF between a color and the semicolon that the line rule ignores in a
class definition that a line break joins, the color stays as written] [test:
U+2028 before a comma in a class definition that a line break joins, the color
stays as written] [test: U+2029 before a comma in a class definition that a line
break joins, the color stays as written] [test: U+0085 before a comma in a class
definition that a line break joins, the color stays as written] [test: U+0085
and a character after a color in a class definition that a line break joins, the
color stays as written] [test: U+0085 between a color and the semicolon that the
line rule ignores in a class definition that a line break joins, the color stays
as written] [test: U+180E before a comma in a class definition that a line break
joins, the color stays as written] [test: U+180E and a character after a color
in a class definition that a line break joins, the color stays as written]
[test: U+180E between a color and the semicolon that the line rule ignores in a
class definition that a line break joins, the color stays as written] [test:
U+200B before a comma in a class definition that a line break joins, the color
stays as written] [test: U+200B and a character after a color in a class
definition that a line break joins, the color stays as written] [test: U+200B
between a color and the semicolon that the line rule ignores in a class
definition that a line break joins, the color stays as written] [test: U+0001
before a comma in a class definition that a line break joins, the color stays as
written] [test: U+0001 and a character after a color in a class definition that
a line break joins, the color stays as written] [test: U+0001 between a color
and the semicolon that the line rule ignores in a class definition that a line
break joins, the color stays as written]

A `;` alone does not prevent joining.

[fixture: multi-line-statements/semicolon-in-the-statement-joined] [fixture:
multi-line-statements/line-rule-line-kept] [fixture:
multi-line-statements/line-rule-line-kept-with-columns] [fixture:
multi-line-statements/line-rule-line-kept-with-composite] [fixture:
multi-line-statements/semicolon-in-an-id-kept] [fixture:
multi-line-statements/line-rule-style-terminator-dropped] [fixture:
multi-line-statements/empty-line-inside-joined] [fixture:
multi-line-statements/semicolon-id-after-end-kept] [fixture:
multi-line-statements/semicolon-id-after-columns-kept] [fixture:
multi-line-statements/semicolon-id-statement-on-its-own-line] [fixture:
multi-line-statements/line-rule-semicolon-after-touching-arrow-kept] [fixture:
multi-line-statements/line-rule-semicolon-after-an-id-kept] [fixture:
multi-line-statements/line-rule-first-hash-after-colon-kept] [fixture:
multi-line-statements/semicolon-after-spaced-arrow-is-an-id]

### Comments

A comment line starts with `%%` at the start of a line, after whitespace, and is
removed before the lexer reads the text. A comment line on a line of its own
stands at the level of the statement after it, and its text and its mark are
kept as written: a comment line after the last statement stays after it, and one
before the header stands at the first column. Rule 1 gives no form here, since
the start of a line is no place that its table names
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark));
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
it, as [state](./state.md#comments) and [flowchart](./flowchart.md#comments) put
a comment line at the level of the statements around it. A comment line before
the `end` of a composite block stands at the level of the statements inside it,
as [class](./class.md#comments) puts a comment line at the level of the member
lines in a body, and [state](./state.md#comments) at the level of the statements
of a composite state. A `%%` that does not start a line is the text of an id,
and stays where it is, with the statement that it starts (see [Rows](#rows)).

[fixture: comments/comment-line-at-the-level-of-the-next-statement] [fixture:
comments/comment-before-the-header] [fixture:
comments/comment-after-the-last-statement] [fixture:
comments/comment-in-a-composite] [fixture: comments/comment-between-rows]
[fixture: comments/percent-in-a-line-is-an-id] [fixture:
comments/comment-text-kept] [fixture: comments/comment-after-a-composite-head]

Input
([comments/comment-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/block/comments/comment-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
block-beta
%% a
columns 2
      %% b
a b
    %% c
```

Output
([comments/comment-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/block/comments/comment-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
block-beta
  %% a
  columns 2
  %% b
  a b
  %% c
```

Input
([comments/comment-before-the-header-input.mmd](../tests/fixtures/block/comments/comment-before-the-header-input.mmd)):

```mmd
%% a

  %% b
block-beta
a
```

Output
([comments/comment-before-the-header-output.mmd](../tests/fixtures/block/comments/comment-before-the-header-output.mmd)):

```mmd
%% a

%% b
block-beta
  a
```

### Directives

Keep directives in their authored gaps. Within a printed line, a directive is
placed as under [Directives](./flowchart.md#directives): the gap is printed as
without the directive, and the directive stands after its space and touches the
unit that follows it. Rule 1 names no mark for a directive in a gap, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides: [flowchart](./flowchart.md#directives), [Gantt](./gantt.md#directives),
and [journey](./journey.md#directives) print it so, and the flowchart rules give
the reason: mermaid.js removes a directive before it reads the text, so the
whitespace that remains is that of the two sides together. A directive on a line
of its own stands at the level of the statement after it, and one before the
header stands at the first column, as a comment line does.

[fixture: directives/directive-before-the-header] [fixture:
directives/directive-line-at-the-level-of-the-next-statement] [fixture:
directives/directive-between-statements-of-a-row] [fixture:
directives/directive-between-statements-touching] [fixture:
directives/directive-between-statements-touching-after] [fixture:
directives/directive-between-statements-more-whitespace] [fixture:
directives/directive-between-units-of-a-statement] [fixture:
directives/directive-between-columns-and-the-number] [fixture:
directives/directive-after-the-header] [fixture:
directives/directive-after-a-statement] [fixture:
directives/directive-line-in-a-composite] [fixture:
directives/directive-inside-a-label] [fixture:
directives/directive-between-the-id-and-the-width] [fixture:
directives/directive-after-the-head-of-a-composite] [fixture:
directives/directive-after-columns] [fixture: directives/directive-after-end]
[fixture: directives/directive-before-the-directions-of-a-block-arrow]

When formatting splits units that were on the same line, a directive in their
gap moves with the following unit. Keep its right-side contact or separation;
break its left contact. Rule 1 names no mark for a directive between two units,
so [rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [flowchart](./flowchart.md#directives),
[gantt](./gantt.md#directives), and [journey](./journey.md#directives) move a
directive in the gap of units that formatting splits with the following unit,
keep its right-side contact or separation, and break its left contact, where no
other rule keeps the layout as written (a directive that is not closed after a
statement).

[fixture: block/directives/directive-after-columns] [fixture:
block/directives/directive-after-columns-right-touching] [fixture:
block/directives/directive-after-columns-left-touching]

Input
([directives/directive-between-statements-of-a-row-input.mmd](../tests/fixtures/block/directives/directive-between-statements-of-a-row-input.mmd)):

```mmd
block-beta
a %%{init: {}}%% b
```

Output
([directives/directive-between-statements-of-a-row-output.mmd](../tests/fixtures/block/directives/directive-between-statements-of-a-row-output.mmd)):

```mmd
block-beta
  a %%{init: {}}%%b
```

Input
([directives/directive-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/block/directives/directive-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
block-beta
%%{init: {}}%%
  columns 2
      %%{init: {}}%%
a b
```

Output
([directives/directive-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/block/directives/directive-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
block-beta
  %%{init: {}}%%
  columns 2
  %%{init: {}}%%
  a b
```

### Empty description blocks

An empty block, which changes nothing, is a statement of its own. The
whitespace-only interior of a description block, including tabs, line breaks and
Unicode whitespace, prints `{}`: there is no text for interior whitespace to
surround. An already empty interior stays empty. Put one space between the
keyword and opener, including originally touching tokens, to distinguish the
keyword from its body: `accDescr{  }` becomes `accDescr {}`.

[fixture: empty-description-blocks/empty-whitespace-interiors] [test: block
Unicode and tab interiors]

A block with a directive or comment line keeps its contents and line breaks,
with standalone trivia one level inside and its closer at statement level. The
start of a line is no place of rule 1, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides, as [pie](./pie.md#description-blocks),
[sequence](./sequence.md#multi-line-values), and
[info](./info.md#description-blocks) stand a comment or directive line of a
block on a line of its own one level inside and its closer at the level of its
statement.

[fixture: empty-description-blocks/trivia-continuations]

It stands on a line of its own, also after the header and between two nodes,
where the grammar takes it: mermaid.js reads it as nothing wherever it stands,
and the grammar takes it where a statement starts.

[fixture: empty-description-blocks/whitespace-removed] [fixture:
empty-description-blocks/braces-touching-kept] [fixture:
empty-description-blocks/line-break-inside-joined] [fixture:
empty-description-blocks/between-two-nodes] [fixture:
empty-description-blocks/after-the-header] [fixture:
empty-description-blocks/with-a-comment-kept] [fixture:
empty-description-blocks/with-a-directive-kept] [fixture:
empty-description-blocks/in-a-composite] [fixture:
empty-description-blocks/empty-line-inside-joined]

Input
([empty-description-blocks/whitespace-removed-input.mmd](../tests/fixtures/block/empty-description-blocks/whitespace-removed-input.mmd)):

```mmd
block-beta
accDescr {   } a
```

Output
([empty-description-blocks/whitespace-removed-output.mmd](../tests/fixtures/block/empty-description-blocks/whitespace-removed-output.mmd)):

```mmd
block-beta
  accDescr {}
  a
```

Input
([empty-description-blocks/between-two-nodes-input.mmd](../tests/fixtures/block/empty-description-blocks/between-two-nodes-input.mmd)):

```mmd
block-beta
a accDescr {} b
```

Output
([empty-description-blocks/between-two-nodes-output.mmd](../tests/fixtures/block/empty-description-blocks/between-two-nodes-output.mmd)):

```mmd
block-beta
  a
  accDescr {}
  b
```

### Colors

A color in a style is printed in lower case, as the examples in the
documentation of mermaid.js write it and as the CSS formatter of Prettier prints
it: `style A fill:#F9F,stroke:#ABCDEF` is printed
`style A fill: #f9f, stroke: #abcdef`. The colors in the styles of the `style`
and `classDef` statements of a block diagram are printed so. A color is a `#`
and 3, 4, 6, or 8 hexadecimal digits that stand alone in the value of a style;
it is never shortened, and a text that is no color stays as written (see
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)).

[fixture: colors/colors-in-lower-case] [fixture:
colors/words-that-are-not-colors-as-written] [fixture:
block/colors/color-directive-in-url-name-kept]

Input
([colors/colors-in-lower-case-input.mmd](../tests/fixtures/block/colors/colors-in-lower-case-input.mmd)):

```mmd
block-beta
columns 2
A B
classDef c fill:#DEADBE,stroke:#ABCDEF
class B c
style A fill:#F9F,stroke:#ABCDEF,color:#C0FFEE
```

Output
([colors/colors-in-lower-case-output.mmd](../tests/fixtures/block/colors/colors-in-lower-case-output.mmd)):

```mmd
block-beta
  columns 2
  A B
  classDef c fill: #deadbe, stroke: #abcdef
  class B c
  style A fill: #f9f, stroke: #abcdef,color: #c0ffee
```

Input
([colors/words-that-are-not-colors-as-written-input.mmd](../tests/fixtures/block/colors/words-that-are-not-colors-as-written-input.mmd)):

```mmd
block-beta
A B
style A fill:#ABCDE,stroke:#ABCDEF1
classDef c fill:url(#ABC),stroke:#ABC-x
```

Output
([colors/words-that-are-not-colors-as-written-output.mmd](../tests/fixtures/block/colors/words-that-are-not-colors-as-written-output.mmd)):

```mmd
block-beta
  A B
  style A fill: #ABCDE, stroke: #ABCDEF1
  classDef c fill: url(#ABC), stroke: #ABC-x
```

### Frontmatter YAML

The frontmatter is formatted as YAML by Prettier, as in the other diagrams (see
[Frontmatter YAML](./flowchart.md#frontmatter-yaml)); a frontmatter that is no
valid YAML stays as written, as Prettier leaves the frontmatter of a Markdown
file that is no valid YAML.

[fixture: frontmatter-yaml/formatted] [fixture: frontmatter-yaml/malformed-kept]
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/block/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:    T
config: {a:   1}
---
block-beta
a
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/block/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { a: 1 }
---
block-beta
  a
```

### Line separators

U+2028 and U+2029 are whitespace between the units of a block diagram, as a
space is, and a gap that holds one on a line is printed as written, as in the
other diagrams (see [Line separators](./journey.md#line-separators)). Rule 1
names no mark for a gap that holds one, so
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have)
decides: the other diagrams print it so. Where the printer puts a line break
instead of the gap, or the gap ends a line, they are dropped with it. A comment
line after one of them joins the lines of the source that mermaid.js reads as
one (see
[A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029)),
where text follows it, and the whitespace and the line breaks of the statements
on those lines are kept as written. What follows the comment line decides the
rest. After `style a fill:#F00`, a U+2028, `%% c`, and a line break, block
prints:

| What follows the comment line                                                                  | The U+2028 or U+2029 and the lines                                                | The color |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------- |
| Nothing, to the end of the text                                                                | dropped; the comment line on a line of its own, as on a plain line                | `#f00`    |
| Comment lines, to the end of the text                                                          | dropped; each comment line on a line of its own, as on a plain line               | `#f00`    |
| An empty line, to the end of the text                                                          | dropped; the comment line on a line of its own, as on a plain line                | `#f00`    |
| A whitespace-only line, to the end of the text                                                 | dropped; the comment line on a line of its own, as on a plain line                | `#f00`    |
| An empty line and a comment line, to the end of the text                                       | dropped; every line on a line of its own, as on a plain line, the empty line kept | `#f00`    |
| A statement at once, touching (`b`) or after whitespace (` y`)                                 | kept; the statement stays on the line after the comment line, as written          | `#F00`    |
| Two comment lines, and a statement                                                             | kept; the statement stays on the line after the comment lines, as written         | `#F00`    |
| An empty line, and a statement                                                                 | kept; the statement stands apart, at the level of the statements                  | `#f00`    |
| A comment line, an empty line, and a statement                                                 | kept; the statement stands apart, at the level of the statements                  | `#f00`    |
| A whitespace-only line, and a statement                                                        | kept; the statement stands apart, at the level of the statements                  | `#f00`    |
| A directive line, to the end of the text                                                       | kept                                                                              | `#f00`    |
| A directive line, and a statement                                                              | kept; the statement stands apart, at the level of the statements                  | `#f00`    |
| A directive line and a comment line, to the end of the text                                    | dropped; every line on a line of its own, as on a plain line                      | `#f00`    |
| A comment line, a directive line, and a comment line, to the end of the text                   | dropped; every line on a line of its own, as on a plain line                      | `#f00`    |
| An empty line, a directive line, and a comment line, to the end of the text                    | dropped; every line on a line of its own, as on a plain line, the empty line kept | `#f00`    |
| A directive line, an empty line, and a comment line, to the end of the text                    | dropped; every line on a line of its own, as on a plain line, the empty line kept | `#f00`    |
| Two directive lines and a comment line, to the end of the text                                 | dropped; every line on a line of its own, as on a plain line                      | `#f00`    |
| A directive line, a comment line, and a statement                                              | kept; the statement stays on the line after the comment line, as written          | `#F00`    |
| A directive line, a comment line, and a directive line, to the end                             | kept                                                                              | `#f00`    |
| Two comment lines, and a directive line, to the end of the text                                | kept                                                                              | `#f00`    |
| An empty line, and a directive line, to the end of the text                                    | kept; the directive line stands apart, at the level of the statements             | `#f00`    |
| A directive line and an empty line, to the end of the text                                     | kept; the empty line at the end is dropped                                        | `#f00`    |
| A directive and a comment on one line, to the end of the text (`%%{y}%%%% d`, `%%{y}%%  %% d`) | dropped; the line on a line of its own, as on a plain line                        | `#f00`    |
| A comment line that holds a directive (`%% d%%{y}%%`), to the end of the text                  | dropped; the line on a line of its own, as on a plain line                        | `#f00`    |
| A comment line, a directive line, and a statement                                              | kept; the statement stands apart, at the level of the statements                  | `#f00`    |
| An empty line, a comment line, and a statement                                                 | kept; the statement stays on the line after the comment line, as written          | `#F00`    |
| A line that holds only a `;` (also `;b` and `%%{y}%%;`)                                        | kept; the line stays on the line after the comment line, as written               | `#F00`    |
| An empty line, and a line that holds only a `;`                                                | kept; the line stands apart, at the level of the statements                       | `#f00`    |

The U+2028 or U+2029 is dropped where no statement follows and the last line
that is not blank holds a comment (a comment line, also one that holds a
directive, or a directive and a comment on one line), and the line before it
holds no `;`, and it stays where a `;` stands in the line before it, a statement
follows, or the last line that is not blank holds directives only. A `;` alone
on a line, a `;` and a character, and a directive and a `;` are statements here.
This holds for every statement of a block diagram, not only for `style` and
`classDef`: `b`, `b["x"]`, `b-->c`, and `columns 2` lose the U+2028 or U+2029
before a comment line at the end of the text, and `b;`, `b["x;y"]`, `b-->c;`,
and `columns 2;` keep it. A `;` counts wherever it stands in the line, also
inside a label, a directive, or a comment (`style a fill:#F00 %%{x;y}%%`, and
`style a fill:#F00 %% x;`, U+2028, and `%% c` keep the U+2028 and print `#f00`).
A `style`, a `classDef`, and a `class` statement lose the U+2028 or U+2029
whatever stands between the statement and it: nothing, a comment, a directive,
or both (`style a fill:#F00 %% x`, `classDef k fill:#F00%% x`,
`class a k %%{x}%% %% x`), unless a `;` stands in the line. Every other
statement loses it where nothing, or only a directive, stands between (`b`,
`b-->c %%{x}%%`, `b-->c%%{x}%%`), and keeps it where a comment follows after
whitespace, a space, a run of spaces, or one of the
[whitespace characters](#whitespace-characters) (`b %% x`, `columns 2 %% x`,
`b:2 %% x`, and `b`, a tab, and `%% x`), also after a directive, which the
comment may touch (`b %%{x}%% %% x`, `b %%{x}%%%% x`). Where the comment touches
the statement, the last unit of the statement decides: a node id that nothing
follows loses it (`b%% x`, `b-->c%% x`, `b:2-->c%% x`, `b["x"]-->c%% x`,
`b -- "x" --> c%% x`, `b e%% x`, `columns%% x`), and a label or a shape, a
width, a `columns` statement, a `space` statement, a block arrow, and `end` keep
it (`b["x"]%% x`, `b("x")%% x`, `b:2%% x`, `b-->c["x"]%% x`, `b:2-->c["x"]%% x`,
`columns 2%% x`, `space%% x`). The end of a composite block is a statement like
the others: where it keeps the U+2028 (`end;`, `end%% x`, `end %% x`, or a
statement after the comment line), the whole composite stays as written, its
head and its body unindented (`block:G`, `  b`, `end;`, U+2028, and `%% c`), and
where it loses it (`end`, `end %%{x}%%`) the composite is formatted as usual.
The head of a composite block always has a statement after it (`end` at least),
so it keeps the U+2028 or U+2029 also with a comment before it, whether the
comment touches the head or follows it after whitespace, and is formatted as
usual (`block:G%% x`, U+2028, and `%% c` print `block: G%% x`, U+2028, and
`%% c`, and `block:G %% x` prints `block: G %% x`). A second U+2028 or U+2029 on
the comment line (`b`, U+2028, `%% c`, U+2028, and `%% d`) is part of the
comment, which runs to the next line feed, so it stays as written, whatever
follows it on the line: nothing, a comment, or the text of a statement. The
first one is dropped or stays as the rules above say, and where it is dropped
the comment line stands on a line of its own (`b`, a line break, `%% c`, U+2028,
and `%% d`; `b %% c`, U+2028, `%% d`, U+2028, and `%% d` are not changed). Two
of them in a row before the comment (`b`, U+2028, U+2028, and `%% c`) follow the
rules above, as one does, and so do two U+2029: they are both dropped where the
first would be dropped, and one line break remains, and both stay where it stays
(`b %% x`, `b;`, and `b` with a statement after the comment line). Where a
statement follows, the color stays as written if the statement is on the line
right after a comment line, and is in lower case if an empty line, a line of
whitespace, or a directive line stands right before it. The case of every color
in these rows is the case that the Colors rule gives
([Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)):
a color is in lower case where it is a word of its own (whitespace, a `,`, or
the `;` that ends the statement follows it), and stays as written where a
character of the text of the style touches it, a `;` that the line rule keeps
being such a character. Flowchart, class, state, and ER keep the line as written
in every row where block drops it (ER rejects the row of a whitespace-only
line). For a node or an edge that a U+2028 or U+2029 and a comment line follow,
the other diagram types do not agree: flowchart and class print the comment line
on a line of its own, as block does, and state and ER keep the line as written
(`b`, a U+2028, and `%% c`). No rule gives that form, and the released form,
which the conditions above state, stays until it is decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).
On such a line, a color before a comma on its line, also after a space, a tab,
or a form feed, and the last color of the last line, where no `;` that the line
rule ignores follows it, are in lower case; a color before a comma at the start
of the line after the comment line stays as written (`#F00`, and `#abc` after
it); a color that spaces, tabs, or form feeds and characters follow on its line
is in lower case (`#F00 x`, U+2028, `%% c`, and ` y` print `#f00 x`); and a
color that a `;` that the line rule ignores touches on a line after the comment
line stays as written (`#F00`, and `#ABC;` after it; the `;` before the U+2028
is stated below), also where any character but a space, a tab, or a form feed
separates it from the `;`. Where the line before the U+2028 holds a `;`, the
line is kept: the U+2028 and the comment line stay as written, whatever follows
the comment line, and so does the whitespace of the styles (`style a fill:red;`,
U+2028, and `%% c` are not changed, and the U+2028 and the comment line stay
also after a value that is no color, as in `stroke-width:2px;`, and after a
color that a space or a character separates from the `;`, as in `fill:#F00 ;`
and `fill:#F00 x;`, which print the color in lower case, while
`style a fill:red`, U+2028, and `%% c` print `style a fill: red`). The colors of
such a line are in lower case before a comma and where a space, a tab, or a form
feed and characters follow them. Where a second `;` follows the first, whatever
stands between them (`style a fill:#F00;;`, `style a fill:#F00; ;`,
`style a fill:#F00;x;`), the color stays as written, whatever follows and
whatever stands between the second `;` and the U+2028 (a space, a tab, a
vertical tab, or a character). Where one `;` follows the color, what follows the
`;` on the line decides, a directive left out. Where a space, a tab, or a form
feed follows it, the color is in lower case, whatever follows the comment line.
Where a character or a comment follows it, directly or after a vertical tab, a
no-break space, or another whitespace character but a space, a tab, and a form
feed, the line rule keeps the `;`, and the color stays as written, whatever
follows (`style a fill:#F00;x`, `style a fill:#F00;%% x`,
`style a fill:#F00;%%{y}%%%% x`, and `style a fill:#F00;`, a vertical tab, and
`%% x`, then U+2028 and `%% c`). Where nothing follows it, or only directives
and whitespace characters but a space, a tab, and a form feed, the color stays
as written only where a statement follows right after a comment line, as without
the `;`: where no statement follows, or an empty line or a directive line stands
right before the statement, it is in lower case (`style a fill:#F00;`, U+2028,
and `%% c` are printed `style a fill:#f00;`, U+2028, and `%% c`). In a block
diagram, mermaid.js reads the U+2028 as the end of the line and `%% c` as a
comment. For `style a fill:#F00`, a U+2028, and `%% c` at the end of the text,
the Db of 12.3.0 holds neither of them in the style, and differs from that of
the plain line only in the whitespace after the first `:` and in the case of the
color, which
[Styles that are drawn the same](./compatibility.md#styles-that-are-drawn-the-same)
and
[Colors that are drawn the same](./compatibility.md#colors-that-are-drawn-the-same)
define, and the drawings of 10.9.8, 11.7.0, 11.17.2, 12.0.0, and 12.3.0 are the
same; so are the drawings of the other rows of the table that drop the U+2028
after a style statement, and the record holds the row where nothing follows and
twelve inputs of the others (one row holds two). In a label they are characters
and stay.

[test: U+2028 between two statements of a row] [test: U+2029 between two
statements of a row] [test: U+2028 around the arrow of an edge] [test: U+2028
between an id and its shape] [test: U+2028 before the colon of a width] [test:
U+2028 after columns] [test: U+2028 in a label] [test: U+2028 at the end of a
statement of a row] [test: U+2028 before a comment line that joins lines] [test:
U+2029 before comment lines that join lines] [test: block:
style-ls-before-a-comment-at-the-end-of-the-text-is-dropped] [test: block:
style-ls-and-ps-before-a-comment-at-the-end-of-the-text-are-dropped] [test:
block: classDef-ls-before-a-comment-at-the-end-of-the-text-is-dropped] [test:
block: style-ls-touching-a-directive-is-dropped] [test: block:
color-before-comma-in-style-on-a-line-that-a-ls-comment-line-joins] [test:
block: color-before-comma-in-classdef-on-a-line-that-a-ps-comment-line-joins]
[test: block:
last-color-in-style-that-the-line-after-a-ls-comment-line-goes-on-with] [test:
block:
color-before-comma-after-whitespace-in-style-on-a-line-that-a-ls-comment-line-joins]
[test: block:
color-before-a-comma-on-the-next-line-of-a-style-that-a-ls-comment-line-joins]
[test: block: color-before-a-ls-comment-line-that-a-statement-follows] [test:
block:
color-before-a-semicolon-that-the-line-rule-ignores-in-a-classdef-that-whitespace-and-a-line-break-join]
[test: block:
color-before-a-semicolon-on-the-line-after-a-ls-comment-line-in-a-classdef]
[test: block:
style-ls-before-a-comment-and-a-directive-line-keeps-the-ls-and-lowers-the-color]
[test: block:
style-ps-before-a-comment-and-a-directive-line-keeps-the-ps-and-lowers-the-color]
[test: block:
classdef-ls-before-a-comment-and-a-directive-line-keeps-the-ls-and-lowers-the-color]
[test: block:
style-ls-before-two-comment-lines-at-the-end-of-the-text-is-dropped] [test:
block:
style-ls-before-a-comment-line-an-empty-line-and-a-statement-keeps-the-ls-and-lowers-the-color]
[test: block:
style-ls-before-a-comment-line-a-directive-line-and-a-statement-keeps-the-ls-and-lowers-the-color]
[test: block:
style-ls-before-a-comment-line-a-directive-line-and-a-comment-line-at-the-end-is-dropped]
[test: block:
style-ls-before-a-comment-line-a-directive-line-a-comment-line-and-a-statement-keeps-the-lines]
[test: block:
style-ls-before-a-comment-line-a-directive-line-a-comment-line-and-a-directive-line-keeps-the-ls]
[test: block: style-ls-before-two-comment-lines-and-a-statement-keeps-the-lines]
[test: block:
style-ls-before-a-comment-line-an-empty-line-after-it-and-a-statement-keeps-the-ls-and-lowers-the-color]
[test: block:
style-ls-before-a-comment-line-a-whitespace-only-line-and-a-statement-keeps-the-ls-and-lowers-the-color]
[test: block:
style-ls-before-a-comment-line-and-an-empty-line-at-the-end-is-dropped] [test:
block:
style-ls-before-a-comment-line-an-empty-line-and-a-comment-line-at-the-end-is-dropped]
[test: block:
style-ls-before-a-comment-line-and-a-whitespace-only-line-at-the-end-is-dropped]
[test: block:
last-color-before-a-semicolon-that-the-line-rule-ignores-on-the-line-after-a-ls-comment-line-in-a-style-stays]
[test: block:
last-color-before-a-semicolon-that-the-line-rule-ignores-on-the-line-after-a-ls-comment-line-in-a-classdef-stays]
[test: block:
a-color-before-a-space-and-a-comment-line-in-a-style-that-a-ls-comment-line-joins-is-lower-case]
[test: a color that a semicolon touches before a U+2028 and a comment line in a
style statement, nothing after the comment line] [test: a color that a semicolon
touches before a U+2028 and a comment line in a style statement, a second
comment line after the comment line] [test: a color that a semicolon touches
before a U+2028 and a comment line in a style statement, an empty line after the
comment line] [test: a color that a semicolon touches before a U+2028 and a
comment line in a style statement, a whitespace-only line after the comment
line] [test: a color that a semicolon touches before a U+2028 and a comment line
in a style statement, a directive line after the comment line] [test: a color
that a semicolon touches before a U+2028 and a comment line in a style
statement, a statement after the comment line] [test: a color that a semicolon
touches before a U+2028 and a comment line in a style statement, a second
comment line and a statement after the comment line] [test: a color that a
semicolon touches before a U+2028 and a comment line in a style statement, a
second comment line and a directive line after the comment line] [test: a color
that a semicolon touches before a U+2028 and a comment line in a class
definition, nothing after the comment line] [test: a color that a semicolon
touches before a U+2028 and a comment line in a class definition, a statement
after the comment line] [test: a color that a semicolon touches before a U+2029
and a comment line in a style statement, nothing after the comment line] [test:
a color that a semicolon touches before a U+2028 and a comment line in a style
statement, and a second style statement after the comment line] [test: a
directive line after two comment lines, to the end of the text, after a style
statement and a U+2028] [test: a directive line after an empty line, to the end
of the text, after a style statement and a U+2028] [test: a directive line and
an empty line, to the end of the text, after a style statement and a U+2028]
[test: a no-break space between a color and the semicolon in a class definition
that a line break joins stays as written] [test: U+3000 between a color and the
semicolon in a class definition that a line break joins stays as written] [test:
U+3000 and a character after a color in a class definition that a line break
joins stays as written] [test: a space between a color and the semicolon in a
class definition that a line break joins is lower case] [test: a color that a
no-break space and a character follow in a class definition that a line break
joins stays as written] [test: block:
whitespace-between-the-statements-of-a-row-on-a-line-that-a-ls-comment-line-joins]
[test: U+2028 between a composite head and its body] [test: a comment line, a
directive line, and a comment line, to the end of the text, after a style
statement and a U+2028: the U+2028 is dropped] [test: a comment line, a
directive line, and a comment line, to the end of the text, after a class
definition and a U+2029: the U+2029 is dropped] [test: a comment line, a
directive line, and a comment line, to the end of the text, after a style
statement whose color a semicolon touches and a U+2028: the U+2028 stays and the
color is in lower case] [test: an empty line, a directive line, and a comment
line, to the end of the text, after a style statement and a U+2028: the U+2028
is dropped] [test: an empty line, a directive line, and a comment line, to the
end of the text, after a class definition and a U+2029: the U+2029 is dropped]
[test: an empty line, a directive line, and a comment line, to the end of the
text, after a style statement whose color a semicolon touches and a U+2028: the
U+2028 stays and the color is in lower case] [test: a directive line, an empty
line, and a comment line, to the end of the text, after a style statement and a
U+2028: the U+2028 is dropped] [test: a directive line, an empty line, and a
comment line, to the end of the text, after a class definition and a U+2029: the
U+2029 is dropped] [test: a directive line, an empty line, and a comment line,
to the end of the text, after a style statement whose color a semicolon touches
and a U+2028: the U+2028 stays and the color is in lower case] [test: two
directive lines and a comment line, to the end of the text, after a style
statement and a U+2028: the U+2028 is dropped] [test: two directive lines and a
comment line, to the end of the text, after a class definition and a U+2029: the
U+2029 is dropped] [test: two directive lines and a comment line, to the end of
the text, after a style statement whose color a semicolon touches and a U+2028:
the U+2028 stays and the color is in lower case] [test: a directive and a
comment that touches it on a line, to the end of the text, after a style
statement and a U+2028: the U+2028 is dropped] [test: a directive and a comment
that touches it on a line, to the end of the text, after a class definition and
a U+2029: the U+2029 is dropped] [test: a directive and a comment that touches
it on a line, to the end of the text, after a style statement whose color a
semicolon touches and a U+2028: the U+2028 stays and the color is in lower case]
[test: a directive and a comment after spaces on a line, to the end of the text,
after a style statement and a U+2028: the U+2028 is dropped] [test: a directive
and a comment after spaces on a line, to the end of the text, after a class
definition and a U+2029: the U+2029 is dropped] [test: a directive and a comment
after spaces on a line, to the end of the text, after a style statement whose
color a semicolon touches and a U+2028: the U+2028 stays and the color is in
lower case] [test: a comment line that holds a directive, to the end of the
text, after a style statement and a U+2028: the U+2028 is dropped] [test: a
comment line that holds a directive, to the end of the text, after a class
definition and a U+2029: the U+2029 is dropped] [test: a comment line that holds
a directive, to the end of the text, after a style statement whose color a
semicolon touches and a U+2028: the U+2028 stays and the color is in lower case]
[test: a comment line, a directive line, and a statement, after a style
statement and a U+2028: the U+2028 stays and the color is in lower case] [test:
an empty line, a comment line, and a statement, after a style statement and a
U+2028: the U+2028 stays and the color stays as written] [test: two semicolons
after a color and a U+2028, to the end of the text, the color stays as written]
[test: two semicolons after a color and a U+2028, a statement follows, the color
stays as written] [test: two semicolons that a space separates after a color and
a U+2028, to the end of the text, the color stays as written] [test: two
semicolons that a space separates after a color and a U+2028, a statement
follows, the color stays as written] [test: two semicolons after a color and a
U+2029 in a class definition, to the end of the text, the color stays as
written] [test: a space between the semicolon and the U+2028, to the end of the
text, the U+2028 stays and the color is in lower case] [test: a space between
the semicolon and the U+2028, a statement follows, the U+2028 stays and the
color is in lower case] [test: a tab between the semicolon and the U+2028, a
statement follows, the U+2028 stays and the color is in lower case] [test: a
form feed between the semicolon and the U+2028, a statement follows, the U+2028
stays and the color is in lower case] [test: a vertical tab between the
semicolon and the U+2028, to the end of the text, the U+2028 stays and the color
is in lower case] [test: a vertical tab between the semicolon and the U+2028, a
statement follows, the U+2028 stays and the color is as written] [test: a
no-break space between the semicolon and the U+2028, to the end of the text, the
U+2028 stays and the color is in lower case] [test: a no-break space between the
semicolon and the U+2028, a statement follows, the U+2028 stays and the color is
as written] [test: a semicolon touching the color, a directive line, and a
statement after the comment line: the color is in lower case] [test: a semicolon
touching the color, an empty line, and a statement after the comment line: the
color is in lower case] [test: a semicolon touching the color, a directive line,
a comment line, and a statement after the comment line: the color is as written]
[test: a semicolon touching the color, a comment line, a directive line, and a
statement after the comment line: the color is in lower case] [test: a semicolon
touching the color, an empty line, a comment line, and a statement after the
comment line: the color is as written] [test: a space and a vertical tab before
a comma in a class definition that a line break joins, the first decides: the
color is in lower case] [test: a vertical tab and a space before a comma in a
class definition that a line break joins, the first decides: the color is as
written] [test: a no-break space and a space before a comma in a class
definition that a line break joins, the first decides: the color is as written]
[test: a space and a no-break space before a comma in a class definition that a
line break joins, the first decides: the color is in lower case] [test: a tab
and a no-break space before a comma in a class definition that a line break
joins, the first decides: the color is in lower case] [test: a form feed and a
no-break space before a comma in a class definition that a line break joins, the
first decides: the color is in lower case] [test: a no-break space and a form
feed before a comma in a class definition that a line break joins, the first
decides: the color is as written] [test: a space and a vertical tab between a
color and the semicolon in a class definition that a line break joins, the first
decides: the color is in lower case] [test: a vertical tab and a space between a
color and the semicolon in a class definition that a line break joins, the first
decides: the color is as written] [test: a semicolon after a value that is no
color, to the end of the text, after a style statement and a U+2028: the U+2028
and the line stay as written] [test: a semicolon after a width, to the end of
the text, after a style statement and a U+2028: the U+2028 and the line stay as
written] [test: a semicolon that a space separates from the color, to the end of
the text, after a style statement and a U+2028: the U+2028 and the line stay as
written] [test: a semicolon after a color and a character, to the end of the
text, after a style statement and a U+2028: the U+2028 and the line stay as
written] [test: a semicolon and a character after a value that is no color, to
the end of the text, after a style statement and a U+2028: the U+2028 and the
line stay as written] [test: a semicolon after a value that is no color, to the
end of the text, after a class definition and a U+2029: the U+2029 and the line
stay as written] [test: a semicolon after a value that is no color, a statement
follows, after a style statement and a U+2028: the U+2028 and the line stay as
written] [test: no semicolon after a value that is no color, to the end of the
text, after a style statement and a U+2028: the U+2028 is dropped and the colon
gets a space] [test: a vertical tab between two semicolons after a color and a
U+2028, to the end of the text, the color stays as written] [test: a no-break
space between two semicolons after a color and a U+2028, to the end of the text,
the color stays as written] [test: a form feed between two semicolons after a
color and a U+2028, to the end of the text, the color stays as written] [test: a
character between two semicolons after a color and a U+2028, to the end of the
text, the color stays as written] [test: a comma between two semicolons after a
color and a U+2028, to the end of the text, the color stays as written] [test: a
character and spaces between two semicolons after a color and a U+2028, to the
end of the text, the color stays as written] [test: three semicolons after a
color and a U+2028, to the end of the text, the color stays as written] [test: a
line that holds only a semicolon after the comment line, after a style statement
and a U+2028: the U+2028 stays and the color is as written] [test: a line that
holds a semicolon and a character after the comment line, after a style
statement and a U+2028: the U+2028 stays and the color is as written] [test: a
directive and a semicolon on a line after the comment line, after a style
statement and a U+2028: the U+2028 stays and the color is as written] [test: an
empty line and a line that holds only a semicolon after the comment line, after
a style statement and a U+2028: the U+2028 stays and the color is in lower case]
[test: a directive line and a line that holds only a semicolon after the comment
line, after a style statement and a U+2028: the U+2028 stays and the color is in
lower case] [test: a comment line and a line that holds only a semicolon after
the comment line, after a style statement and a U+2028: the U+2028 stays and the
color is as written] [test: a node and no semicolon, to the end of the text,
after a U+2028: the U+2028 is dropped] [test: a node with a label and no
semicolon, to the end of the text, after a U+2028: the U+2028 is dropped] [test:
an edge and no semicolon, to the end of the text, after a U+2028: the U+2028 is
dropped] [test: a width and no semicolon, to the end of the text, after a
U+2028: the U+2028 is dropped] [test: a node and a semicolon, to the end of the
text, after a U+2028: the U+2028 stays] [test: a node with a semicolon in its
label, to the end of the text, after a U+2028: the U+2028 stays] [test: an edge
and a semicolon, to the end of the text, after a U+2028: the U+2028 stays]
[test: a width and a semicolon, to the end of the text, after a U+2028: the
U+2028 stays] [test: a node and a semicolon, to the end of the text, after a
U+2029: the U+2029 stays] [test: a semicolon inside a directive after a style,
to the end of the text, after a U+2028: the U+2028 stays] [test: a semicolon
inside a comment after a style, to the end of the text, after a U+2028: the
U+2028 stays] [test: a semicolon inside a comment after a directive after a
style, to the end of the text, after a U+2028: the U+2028 stays] [test: a
semicolon inside a directive after a node, to the end of the text, after a
U+2028: the U+2028 stays] [test: two semicolons, then a space before the U+2028,
to the end of the text, the color stays as written] [test: two semicolons that a
space separates, then a space before the U+2028, to the end of the text, the
color stays as written] [test: two semicolons, then a tab before the U+2028, to
the end of the text, the color stays as written] [test: two semicolons that a
space separates, then a tab before the U+2028, to the end of the text, the color
stays as written] [test: two semicolons, then a vertical tab and a space before
the U+2028, to the end of the text, the color stays as written] [test: two
semicolons that a space separates, then a vertical tab and a space before the
U+2028, to the end of the text, the color stays as written] [test: two
semicolons, then a character before the U+2028, to the end of the text, the
color stays as written] [test: two semicolons that a space separates, then a
character before the U+2028, to the end of the text, the color stays as written]
[test: two semicolons, then a space before the U+2028, a statement follows, the
color stays as written] [test: a semicolon that a character touches the line
rule keeps, to the end of the text, after a style statement and a U+2028: the
color stays as written] [test: a semicolon that a comment touches the line rule
keeps, to the end of the text, after a style statement and a U+2028: the color
stays as written] [test: a semicolon that a directive and a comment touches the
line rule keeps, to the end of the text, after a style statement and a U+2028:
the color stays as written] [test: a semicolon that a vertical tab and a
character touches the line rule keeps, to the end of the text, after a style
statement and a U+2028: the color stays as written] [test: a semicolon that a
no-break space and a character touches the line rule keeps, to the end of the
text, after a style statement and a U+2028: the color stays as written] [test: a
semicolon that a character touches, a statement follows with an empty line
before it, the color stays as written] [test: a semicolon that a character
touches, in a class definition, after a U+2029, the color stays as written]
[test: a semicolon that only a directive touches, to the end of the text, the
color is in lower case] [test: a semicolon that only a directive touches, a
statement follows right after the comment line, the color stays as written]
[test: a form feed and a character after a semicolon, a statement follows, the
color is in lower case] [test: spaces and a directive after a semicolon, a
statement follows, the color is in lower case] [test: a directive and spaces
after a semicolon, a statement follows, the color is in lower case] [test: a
semicolon after a color and a comment after spaces, to the end of the text, the
color is in lower case] [test: the end of a composite block and a semicolon, to
the end of the text, after a U+2028: the whole composite stays as written]
[test: the end of a composite block and a semicolon, to the end of the text,
after a U+2029: the whole composite stays as written] [test: the end of a
composite block, a statement follows the comment line, after a U+2028: the whole
composite stays as written] [test: the end of a composite block and no
semicolon, to the end of the text, after a U+2028: the U+2028 is dropped and the
composite is formatted] [test: a node and no semicolon, to the end of the text,
after a U+2029: the U+2029 is dropped] [test: a node and no semicolon, a
statement follows the comment line, after a U+2028: the U+2028 stays] [test: a
node and a semicolon, a statement follows the comment line, after a U+2029: the
U+2029 stays] [test: a node and a semicolon in a comment, to the end of the
text, after a U+2028: the U+2028 stays] [test: a node and a comment that a space
separates from it, to the end of the text, after a U+2028: the U+2028 stays]
[test: an edge and a comment that a space separates from it, a statement follows
the comment line, after a U+2029: the U+2029 stays] [test: a node and a comment
that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: the end of a composite block and a comment that touches it, to the end of
the text, after a U+2028: the whole composite stays as written] [test: the end
of a composite block and a comment after a space, to the end of the text, after
a U+2028: the whole composite stays as written] [test: the end of a composite
block and a directive and a comment after a space, to the end of the text, after
a U+2028: the whole composite stays as written] [test: the end of a composite
block and a directive that touches it, to the end of the text, after a U+2028:
the U+2028 is dropped and the composite is formatted] [test: the end of a
composite block and a directive after a space, to the end of the text, after a
U+2028: the U+2028 is dropped and the composite is formatted] [test: a width and
a comment after a space, to the end of the text, after a U+2028: the U+2028
stays] [test: a width and a comment that touches it, to the end of the text,
after a U+2028: the U+2028 stays] [test: a width and a directive, to the end of
the text, after a U+2028: the U+2028 is dropped] [test: an empty block and a
comment after a space, to the end of the text, after a U+2028: the U+2028 stays]
[test: an empty block and a comment that touches it, to the end of the text,
after a U+2028: the U+2028 stays] [test: a block arrow and a comment after a
space, to the end of the text, after a U+2028: the U+2028 stays] [test: a block
arrow and a comment that touches it, to the end of the text, after a U+2028: the
U+2028 stays] [test: a node with a label and a comment that touches it, to the
end of the text, after a U+2028: the U+2028 stays] [test: an edge and a comment
that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a node and a directive after a space, to the end of the text, after a
U+2028: the U+2028 is dropped] [test: an edge and a directive after a space, to
the end of the text, after a U+2028: the U+2028 is dropped] [test: a node, a
directive, and a comment after a space, to the end of the text, after a U+2028:
the U+2028 stays] [test: a style statement and a comment after a space, to the
end of the text, after a U+2028: the U+2028 is dropped] [test: a style statement
and a comment that touches the color, to the end of the text, after a U+2028:
the U+2028 is dropped] [test: a class definition and a comment after a space, to
the end of the text, after a U+2028: the U+2028 is dropped] [test: a class
statement and a comment after a space, to the end of the text, after a U+2028:
the U+2028 is dropped] [test: a style statement, a directive, and a comment, to
the end of the text, after a U+2028: the U+2028 is dropped] [test: a semicolon,
a directive, and a semicolon after a color, to the end of the text, after a
U+2028: the U+2028 stays and the color stays as written] [test: a semicolon, a
vertical tab, and a comment after a color, to the end of the text, after a
U+2028: the U+2028 stays and the color stays as written] [test: the head of a
composite block and a comment that touches it, a statement follows the comment
line, after a U+2028: the U+2028 stays and the head is formatted] [test: the
head of a composite block and a comment after a space, a statement follows the
comment line, after a U+2028: the U+2028 stays and the head is formatted] [test:
a class definition and nothing, to the end of the text, after a U+2028: the
U+2028 is dropped] [test: a class definition and a comment that touches it, to
the end of the text, after a U+2028: the U+2028 is dropped] [test: a class
definition and a directive after a space, to the end of the text, after a
U+2028: the U+2028 is dropped] [test: a class definition and a directive and a
comment after a space, to the end of the text, after a U+2028: the U+2028 is
dropped] [test: a class statement and nothing, to the end of the text, after a
U+2028: the U+2028 is dropped] [test: a class statement and a comment that
touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a class statement and a directive after a space, to the end of the text,
after a U+2028: the U+2028 is dropped] [test: a class statement and a directive
and a comment after a space, to the end of the text, after a U+2028: the U+2028
is dropped] [test: a node, a directive after a space and a comment that touches
the directive, to the end of the text, after a U+2028: the U+2028 stays] [test:
an edge, a directive after a space and a comment that touches the directive, to
the end of the text, after a U+2028: the U+2028 stays] [test: an edge and a
directive that touches it, to the end of the text, after a U+2028: the U+2028 is
dropped] [test: a node with a width and a comment after a space, to the end of
the text, after a U+2028: the U+2028 stays] [test: a node with a width and a
comment that touches it, to the end of the text, after a U+2028: the U+2028
stays] [test: a node with a width and a directive that touches it, to the end of
the text, after a U+2028: the U+2028 is dropped] [test: an edge with a width and
a comment that touches it, to the end of the text, after a U+2028: the U+2028 is
dropped] [test: a node and a tab before the comment, to the end of the text,
after a U+2028: the U+2028 stays] [test: a node and a run of spaces before the
comment, to the end of the text, after a U+2028: the U+2028 stays] [test: a node
and a no-break space before the comment, to the end of the text, after a U+2028:
the U+2028 stays] [test: a node and U+3000 before the comment, to the end of the
text, after a U+2028: the U+2028 stays] [test: a node and a vertical tab before
the comment, to the end of the text, after a U+2028: the U+2028 stays] [test: a
node and a form feed before the comment, to the end of the text, after a U+2028:
the U+2028 stays] [test: a node and U+FEFF before the comment, to the end of the
text, after a U+2028: the U+2028 stays] [test: a node, a comment line, and a
second U+2028 and a comment, to the end of the text: the first U+2028 or U+2029
is dropped and the second stays] [test: a node, a comment line, and a second
U+2028 and nothing, to the end of the text: the first U+2028 or U+2029 is
dropped and the second stays] [test: a node, a comment line, and a second U+2028
and the text of a statement, to the end of the text: the first U+2028 or U+2029
is dropped and the second stays] [test: a node, a comment line, and a U+2029
inside it, to the end of the text: the first U+2028 or U+2029 is dropped and the
second stays] [test: a node, a U+2029, a comment line, and a U+2028 inside it,
to the end of the text: the first U+2028 or U+2029 is dropped and the second
stays] [test: a node and a comment line that holds two more U+2028, to the end
of the text: the first U+2028 or U+2029 is dropped and the second stays] [test:
a style statement, a comment line, and a second U+2028 and a comment, to the end
of the text: the first U+2028 or U+2029 is dropped and the second stays] [test:
a node and a comment that touches it, a comment line that holds a U+2028, to the
end of the text: the first U+2028 or U+2029 is dropped and the second stays]
[test: a node and a comment after a space, a comment line that holds a U+2028,
to the end of the text: the first U+2028 stays] [test: a node and a semicolon, a
comment line, and a second U+2028 and a comment, to the end of the text: the
first U+2028 stays] [test: a node and two U+2028 before a comment line, to the
end of the text: both are dropped] [test: a style statement and two U+2028
before a comment line, to the end of the text: both are dropped] [test: an edge
to a node with a label and a comment that touches it, to the end of the text,
after a U+2028: the U+2028 stays] [test: an edge with a width to a node with a
label and a comment that touches it, to the end of the text, after a U+2028: the
U+2028 stays] [test: a node with a round label and a comment that touches it, to
the end of the text, after a U+2028: the U+2028 stays] [test: an edge with a
label to a node with a label and a comment that touches it, to the end of the
text, after a U+2028: the U+2028 stays] [test: a chain of edges to a node with a
label and a comment that touches it, to the end of the text, after a U+2028: the
U+2028 stays] [test: an edge from a node with a label to a node and a comment
that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: an edge with a label to a node and a comment that touches it, to the end
of the text, after a U+2028: the U+2028 is dropped] [test: two nodes in a row
and a comment that touches the last, to the end of the text, after a U+2028: the
U+2028 is dropped] [test: a node and a comment after a space, two U+2028 before
a comment line, to the end of the text: both stay] [test: a node and a
semicolon, two U+2028 before a comment line, to the end of the text: both stay]
[test: a node, two U+2028 before a comment line, a statement follows: both stay]
[test: a node and two U+2029 before a comment line, to the end of the text: both
are dropped] [test: a node and a comment after a space, two U+2029 before a
comment line, to the end of the text: both stay] [test: a node and a comment
that touches it, two U+2028 before a comment line, to the end of the text: both
are dropped] [test: a node whose id is columns and a comment that touches it, to
the end of the text, after a U+2028: the U+2028 is dropped]

### Whitespace characters

A tab, a vertical tab, a form feed, U+00A0, U+3000, and U+FEFF are whitespace
between units. Where the printer chooses the whitespace, a run of them becomes
one space, as a run of spaces does, and at the start or the end of a line they
are dropped. Inside a label they are characters and stay. U+0085 is no
whitespace to mermaid.js: it joins the two words around it into one id, and
stays where it is.

[test: U+00A0 between two statements of a row] [test: U+00A0 at the ends of a
line] [test: a tab, a vertical tab, a form feed, U+3000, and U+FEFF between
units] [test: U+00A0 around the arrow of an edge] [test: U+00A0 between an id
and its shape] [test: U+00A0 before the directions of a block arrow] [test:
U+00A0 in a label] [test: U+00A0 in a class definition] [test: U+00A0 in a
style] [test: U+00A0 inside an empty description block] [test: U+00A0 in a
composite head] [test: U+0085 inside an id]
