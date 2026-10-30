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
and a comment line before it, stand at the first column. [fixture:
indentation/statements-one-level-deeper] [fixture:
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
  block:group1:2
    columns 2
    h
    i
  end
  d
```

### Composites

A composite stands on three kinds of lines: the line of `block:` and its node,
the lines of its statements, and the line of `end`. `block:G`, `block`, and
`block-beta` are printed as written, with `block:` touching its node: mermaid.js
reads `block: G` and `block:G` alike, and one form is simpler to read
(`block:group1:2`, as in its documentation). The first statement after the head,
and the statement after `end`, go to lines of their own, also where the
composite was written on one line (`block:G a b end`), so that every composite
is laid out in the same way and the indentation shows its body. `end` stands on
a line of its own, at the level of its `block:`. [fixture:
composites/colon-touches-the-node] [fixture:
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
([composites/colon-touches-the-node-input.mmd](../tests/fixtures/block/composites/colon-touches-the-node-input.mmd)):

```mmd
block-beta
block: G
a
end
```

Output
([composites/colon-touches-the-node-output.mmd](../tests/fixtures/block/composites/colon-touches-the-node-output.mmd)):

```mmd
block-beta
  block:G
    a
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
  block:G
    a b
  end
```

### Rows

Most diagrams stand each statement on a line of its own. A block diagram does
not, because the line is what the author lays the blocks out by: a run of nodes
and `space` blocks on one line is a row of the grid that `columns` sets, and the
documentation of mermaid.js writes them so (`a b c`, `a["A label"] b:2 c:2 d`,
`Start(("Start")) space:2`). Putting each node on a line of its own would hide
the rows, and the number of columns would have to be counted again from the
`columns` statement. [fixture: rows/documentation-row-with-widths] [fixture:
rows/space-in-a-row]

So a run of node statements, with their widths, shapes, and links, and `space`
statements on a line stays on that line, with one space between two statements,
and the line break between two of them in the source stays where it is; empty
lines become one. Every other statement stands on a line of its own: `columns`,
the head of a composite, `end`, `classDef`, `class`, `style`, and an empty
description block, so that a statement after `columns 3` on its line goes to the
next line (`columns 3 a b c` is printed as `columns 3` and a row `a b c`). The
printer adds no line break between two statements of a row and removes none, so
formatting again finds the same rows. [fixture: rows/rows-kept] [fixture:
rows/line-break-between-statements-kept] [fixture: rows/edges-in-a-row]
[fixture: rows/touching-statements-apart] [fixture:
rows/space-then-node-touching-apart] [fixture:
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
line, and so does `block-beta %%x`. [fixture: rows/percent-id-stays-in-its-row]
[fixture: rows/percent-id-keeps-columns-with-it] [fixture:
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

A run of empty lines becomes one empty line, and there is none between the
header and the first statement, and none at the end of the text. A blank line is
a choice of the author that the Db does not hold, and one empty line shows it at
the least cost, as Prettier does in code (see
[Blank lines](./flowchart.md#blank-lines)). [fixture:
blank-lines/runs-become-one] [fixture: blank-lines/none-after-the-header]
[fixture: blank-lines/none-at-the-end] [fixture: blank-lines/between-rows]
[fixture: blank-lines/none-at-the-start-and-end-of-a-composite] [fixture:
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

The header, `block-beta` or `block`, is printed as written: mermaid.js reads
them as the same diagram type, so the spelling is the author's. The whitespace
before it is dropped, and a statement after it on its line goes to a line of its
own (see [Rows](#rows)). [fixture: header/block-beta-kept] [fixture:
header/block-kept] [fixture:
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

### Columns and space

`columns` is followed by its number or `auto` after one space, whatever
whitespace was written between them (a tab, a line break): mermaid.js reads any
whitespace there, and the form is one line. `space:2` is printed with the `:`
touching, as mermaid.js rejects `space :2` and `space: 2`. A `space` and a
`columns` are never moved to another place: the last `columns` of a block is its
columns, wherever it stands, and the order of the blocks is the order of the
text. [fixture: columns-and-space/one-space-after-columns] [fixture:
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
is before it (`A:3`, `B["b"]:2`), as the `:` of `space:2` must. [fixture:
shapes/shape-touches-the-id] [fixture: shapes/shape-on-the-next-line-joined]
[fixture: shapes/shape-touching-kept] [fixture:
shapes/other-openings-and-closings] [fixture: shapes/width-colon-touches-the-id]
[fixture: shapes/width-after-a-shape] [fixture:
shapes/width-colon-on-the-next-line-joined] [fixture:
shapes/shape-and-width-in-a-row] [fixture: shapes/shape-on-a-target] [fixture:
shapes/directive-between-the-id-and-the-shape] [fixture:
shapes/comment-line-between-the-id-and-the-shape-kept]

A block arrow `<["x"]>` touches its id, and `(` touches the `>` before it
(`C<["z"]>(right)`). The directions inside the parentheses are printed as
written: mermaid.js keeps the whitespace after a direction and before the first
one (`(right down)` has the direction `right ` and `( up)` has ` up`), so
whitespace there is in the Db, while `(right,down)`, `(right, down)`, and
`(rightdown)` have the same directions. [fixture:
shapes/block-arrow-touches-the-id] [fixture:
shapes/block-arrow-parenthesis-touches-the-closing] [fixture:
shapes/block-arrow-directions-as-written] [fixture:
shapes/block-arrow-directions-whitespace-kept] [fixture:
shapes/block-arrow-with-a-width]

A label is a string, between the quotes of the grammar, and is printed as
written with the whitespace and the line breaks inside it. The quotes are part
of the syntax: mermaid.js rejects a label without them. [fixture:
shapes/label-as-written]

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
  D<["d"]>(right,down)
  E<["e"]>(rightdown)
```

Input
([shapes/label-as-written-input.mmd](../tests/fixtures/block/shapes/label-as-written-input.mmd)):

```mmd
block-beta
A["  two  spaces  "]
B["a
   b"]
```

Output
([shapes/label-as-written-output.mmd](../tests/fixtures/block/shapes/label-as-written-output.mmd)):

```mmd
block-beta
  A["  two  spaces  "]
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
arrow after it in the same way (`A x --x B`, `Ao --> B`). The length of the line
(`---->`) is not in the Db, but it is what the author wrote, so it stays.
[fixture: edges/spaces-around-an-arrow] [fixture: edges/spaces-around-a-label]
[fixture: edges/end-marker-apart-from-the-id] [fixture: edges/start-marker]
[fixture: edges/id-ending-in-x-or-o] [fixture: edges/length-kept] [fixture:
edges/line-kinds] [fixture: edges/label-with-other-opening-arrow] [fixture:
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
first style is not in the Db, so it becomes one space. What follows is printed
as written. In a `style` and a `class` the whitespace is in the Db.
`style A fill:#f00 , stroke:#333` has a style `fill:#f00 ` and a style
` stroke:#333`; `class A, B c1` looks up the id ` B` with its whitespace, finds
no block `B`, and gives the class to a new block that the diagram does not show;
and the class name of `class A c   d` is `c   d`, and that of `class A , B   c1`
is `, B   c1`, since the whitespace after `A` ends the ids. In a `classDef` it
is not, but the styles are printed as written too, as in a flowchart (see
[Whitespace between tokens](./flowchart.md#whitespace-between-tokens)), so that
the three statements follow one rule and the printer does not take a list of
styles apart. The whitespace at the end of the statement is dropped, as in a
flowchart (see
[Style trailing whitespace](./flowchart.md#style-trailing-whitespace)).
[fixture: styles/class-definition-spaces] [fixture: styles/style-spaces]
[fixture: styles/class-spaces] [fixture: styles/style-commas-as-written]
[fixture: styles/class-definition-commas-as-written] [fixture:
styles/class-ids-as-written] [fixture:
styles/class-name-with-a-comma-as-written] [fixture:
styles/class-name-as-written] [fixture: styles/trailing-whitespace-dropped]
[fixture: styles/styles-with-a-directive]

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
  classDef c1 color:#fff , fill:#000
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
  style A fill:#f00 , stroke:#333
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

### Multi-line statements

A statement that mermaid.js reads over several lines is printed on one line: the
line break is whitespace to the lexer, and so are the line breaks in `columns`,
an edge, a width, a shape, and the head of a composite. The line break is
replaced by one space; this is how the other diagrams join the lines of a
statement (see [Multi-line statements](./xychart.md#multi-line-statements)). A
statement with a comment line or a directive in it is kept as written, since a
comment line takes the rest of the line it stands on, and the same decision is
made in every diagram. A `;` in a statement keeps it as written too, because of
the line rule (see [Rows](#rows) and
[A line that a `;` ends](./compatibility.md#a-line-that-a--ends)). The line rule
of mermaid.js removes the last `;` of a line that holds `style` or `classDef`, a
later `:`, a `#` after that with no whitespace between them, and a later `;`;
moving a statement away from such a line changes which `;` is the last (in
`A["style:#a"] B;C D;` the `;` of `D;` is the one removed and the id is `B;C`;
on a line without `D;`, the `;` of `B;C` would be removed), so the statements of
such a line stay on it and its `;` stays. The whitespace between the `:` and the
`#` stays as well, since it decides whether the rule applies:
`A["style:"]-->B["#z"];` keeps its arrow touching, and with spaces around the
arrow the rule does not apply, and the `;` is an id of its own. [fixture:
multi-line-statements/columns-over-lines-joined] [fixture:
multi-line-statements/edge-over-lines-joined] [fixture:
multi-line-statements/shape-over-lines-joined] [fixture:
multi-line-statements/class-definition-line-break-in-the-head] [fixture:
multi-line-statements/continuation-line-joined-in-a-row] [fixture:
multi-line-statements/comment-line-inside-kept] [fixture:
multi-line-statements/directive-inside-kept] [fixture:
multi-line-statements/semicolon-in-the-statement-kept] [fixture:
multi-line-statements/line-rule-line-kept] [fixture:
multi-line-statements/line-rule-line-kept-with-columns] [fixture:
multi-line-statements/line-rule-line-kept-with-composite] [fixture:
multi-line-statements/semicolon-in-an-id-kept] [fixture:
multi-line-statements/line-rule-semicolon-at-the-end-kept] [fixture:
multi-line-statements/empty-line-inside-joined] [fixture:
multi-line-statements/semicolon-id-after-end-kept] [fixture:
multi-line-statements/semicolon-id-after-columns-kept] [fixture:
multi-line-statements/semicolon-id-statement-on-its-own-line] [fixture:
multi-line-statements/line-rule-semicolon-after-touching-arrow-kept] [fixture:
multi-line-statements/line-rule-semicolon-after-an-id-kept] [fixture:
multi-line-statements/semicolon-after-spaced-arrow-is-an-id]

### Comments

A comment line starts with `%%` at the start of a line, after whitespace, and is
removed before the lexer reads the text. A comment line on a line of its own
stands at the level of the statement after it, and its text and its mark are
kept as written: a comment line after the last statement stays after it, and one
before the header stands at the first column. A `%%` that does not start a line
is the text of an id, and stays where it is, with the statement that it starts
(see [Rows](#rows)). [fixture:
comments/comment-line-at-the-level-of-the-next-statement] [fixture:
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

Keep directives in their authored gaps. Within a printed line, each side keeps
whether it touches: one space where whitespace was written beside it, touching
where it was not. mermaid.js removes a directive before it reads the text, so
retain touching versus separated gaps within a statement (see
[Directives](./journey.md#directives)). A directive on a line of its own stands
at the level of the statement after it, and one before the header stands at the
first column, as a comment line does. [fixture:
directives/directive-before-the-header] [fixture:
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
break its left contact.

[fixture: block/directives/directive-after-columns]

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
  a %%{init: {}}%% b
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
surround. An already empty interior stays empty. A touching keyword stays
touching: `accDescr{  }` becomes `accDescr{}`. [fixture:
empty-description-blocks/empty-whitespace-interiors] [test: block Unicode and
tab interiors] A block with a directive or a comment line is printed as written.
It stands on a line of its own, also after the header and between two nodes,
where the grammar takes it: mermaid.js reads it as nothing wherever it stands,
and the grammar takes it where a statement starts. [fixture:
empty-description-blocks/whitespace-removed] [fixture:
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

### Frontmatter YAML

The frontmatter is formatted as YAML by Prettier, as in the other diagrams (see
[Frontmatter YAML](./flowchart.md#frontmatter-yaml)); a frontmatter that is no
valid YAML stays as written. [fixture: frontmatter-yaml/formatted] [fixture:
frontmatter-yaml/malformed-kept] [fixture:
frontmatter-yaml/comment-after-frontmatter-before-header]

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
other diagrams (see [Line separators](./journey.md#line-separators)). Where the
printer puts a line break instead of the gap, or the gap ends a line, they are
dropped with it. A comment line after one of them joins the lines of the source
that mermaid.js reads as one (see
[A comment line after U+2028 or U+2029](./compatibility.md#a-comment-line-after-u2028-or-u2029)),
and the statements on those lines are printed as written. In a label they are
characters and stay. [test: U+2028 between two statements of a row] [test:
U+2029 between two statements of a row] [test: U+2028 around the arrow of an
edge] [test: U+2028 between an id and its shape] [test: U+2028 before the colon
of a width] [test: U+2028 after columns] [test: U+2028 in a label] [test: U+2028
at the end of a statement of a row] [test: U+2028 before a comment line that
joins lines] [test: U+2029 before comment lines that join lines] [test: U+2028
between a composite head and its body]

### Whitespace characters

A tab, a vertical tab, a form feed, U+00A0, U+3000, and U+FEFF are whitespace
between units. Where the printer chooses the whitespace, a run of them becomes
one space, as a run of spaces does, and at the start or the end of a line they
are dropped. Inside a label they are characters and stay. U+0085 is no
whitespace to mermaid.js: it joins the two words around it into one id, and
stays where it is. [test: U+00A0 between two statements of a row] [test: U+00A0
at the ends of a line] [test: a tab, a vertical tab, a form feed, U+3000, and
U+FEFF between units] [test: U+00A0 around the arrow of an edge] [test: U+00A0
between an id and its shape] [test: U+00A0 before the directions of a block
arrow] [test: U+00A0 in a label] [test: U+00A0 in a class definition] [test:
U+00A0 in a style] [test: U+00A0 inside an empty description block] [test:
U+00A0 in a composite head] [test: U+0085 inside an id]
